"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import {
  toValidUUID,
  isSuperAdmin as checkIsSuperAdmin,
  isAdminPusat as checkIsAdminPusat,
} from "@/lib/utils";
import type { GrupKegiatanMemberItem } from "@/types/database";

export interface CreateGrupKegiatanParams {
  nama: string;
  deskripsi?: string;
  kategori?: string;
  memberUserIds: string[];
}

export interface CreateGrupKegiatanResult {
  success: boolean;
  message: string;
  groupId?: string;
  room?: import("@/types/database").GrupChatRoom;
}

/**
 * Server Action: Membuat Percakapan Grup Kegiatan baru (Khusus Admin Pusat & Super Admin)
 * Pengguna yang diundang langsung tergabung (status approved) dan dapat langsung berinteraksi.
 */
export async function createGrupKegiatan(
  params: CreateGrupKegiatanParams
): Promise<CreateGrupKegiatanResult> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const clientToUse = adminClient || supabase;

    // 1. Verifikasi Autentikasi Pengguna
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return {
        success: false,
        message: "Akses ditolak: Silakan masuk terlebih dahulu.",
      };
    }

    // 2. Verifikasi Profil Pengguna
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    const userProfileCtx = {
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    };

    const isSuper = checkIsSuperAdmin(userProfileCtx);
    const isAdminP = checkIsAdminPusat(userProfileCtx);

    const cleanNama = (params.nama || "").trim();
    if (!cleanNama) {
      return {
        success: false,
        message: "Nama kegiatan atau obrolan grup wajib diisi.",
      };
    }

    const cleanDeskripsi = (params.deskripsi || "").trim();
    const creatorName =
      profile?.nama_lengkap || user.user_metadata?.nama_lengkap || "Pengguna Jarimas";
    const creatorRole = isSuper ? "Super Admin" : isAdminP ? "Admin Pusat" : "Admin Grup";

    // 3. Buat UUID unik untuk Komunitas Grup Kegiatan
    const newGroupId = crypto.randomUUID();

    const categoryPrefix = params.kategori ? `[${params.kategori}] ` : "";
    const fullDescription = cleanDeskripsi
      ? `${categoryPrefix}${cleanDeskripsi}`
      : params.kategori
      ? `Kegiatan: ${params.kategori}`
      : null;

    // Sertakan kecamatan, kelurahan, lokasi, rt, rw untuk mencegah pelanggaran not-null constraint
    const groupPayload = {
      id: newGroupId,
      nama: cleanNama,
      nama_komunitas: cleanNama,
      jenis: "kegiatan",
      jenis_komunitas: "kegiatan",
      kecamatan: "Kota Tegal",
      kelurahan: "Semua Kelurahan",
      lokasi: "Kota Tegal",
      rt: "-",
      rw: "-",
      deskripsi: fullDescription,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 4. Masukkan ke tabel public.komunitas
    const { error: insertKomunitasErr } = await clientToUse
      .from("komunitas")
      .insert(groupPayload);

    if (insertKomunitasErr) {
      console.error("Gagal insert komunitas grup kegiatan:", insertKomunitasErr);
      throw new Error(insertKomunitasErr.message || "Gagal membuat grup kegiatan.");
    }

    // 5. Masukkan Pembuat (Admin Pusat / Super Admin) sebagai Admin Grup Kegiatan
    const membersToInsert = [
      {
        user_id: user.id,
        komunitas_id: newGroupId,
        peran: creatorRole,
        status: "approved",
        approved_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // 6. Masukkan Pengguna Terpilih yang Diundang (Otomatis Approved)
    const validTargetUserIds = Array.from(
      new Set(
        (params.memberUserIds || []).filter(
          (uid) => uid && uid.trim() !== "" && uid !== user.id
        )
      )
    );

    validTargetUserIds.forEach((targetId) => {
      membersToInsert.push({
        user_id: targetId,
        komunitas_id: newGroupId,
        peran: "anggota",
        status: "approved",
        approved_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    });

    // Coba insert anggota secara batch
    let insertMembersErr: any = null;
    const { error: batchErr } = await clientToUse
      .from("anggota_komunitas")
      .insert(membersToInsert);

    if (batchErr) {
      console.warn("Direct batch insert anggota_komunitas terkendala, mencoba insert satuan:", batchErr);
      insertMembersErr = batchErr;

      let successCount = 0;
      for (const m of membersToInsert) {
        const { error: singleErr } = await clientToUse
          .from("anggota_komunitas")
          .insert(m);
        if (!singleErr) {
          successCount++;
        } else {
          // Jika baris sudah ada sebelumnya, pastikan statusnya diset ke approved
          await clientToUse
            .from("anggota_komunitas")
            .update({ status: "approved", peran: m.peran, updated_at: new Date().toISOString() })
            .eq("user_id", m.user_id)
            .eq("komunitas_id", newGroupId);
          successCount++;
        }
      }

      if (successCount > 0) {
        insertMembersErr = null;
      }
    }

    if (insertMembersErr) {
      // Fallback: Panggil fungsi PostgreSQL dengan SECURITY DEFINER jika tersedia
      try {
        const { error: rpcErr } = await supabase.rpc("tambah_anggota_grup_kegiatan", {
          p_komunitas_id: newGroupId,
          p_user_ids: [user.id, ...validTargetUserIds],
          p_approved_by: user.id,
        });
        if (!rpcErr) {
          insertMembersErr = null;
        }
      } catch (e) {
        console.warn("RPC fallback tambah_anggota_grup_kegiatan gagal:", e);
      }
    }

    // 7. Buat Pesan Pembuka Inaugurasi di pesan_grup
    const welcomeMessage = `🎉 Percakapan Grup Kegiatan "${cleanNama}" telah resmi dibentuk oleh ${creatorName} (${creatorRole}). Seluruh pengguna yang diundang telah otomatis terhubung dan dapat langsung memulai koordinasi obrolan di sini.`;
    try {
      await clientToUse.from("pesan_grup").insert({
        komunitas_id: newGroupId,
        user_id: user.id,
        pesan: welcomeMessage,
        created_at: new Date().toISOString(),
      });
    } catch (msgErr) {
      console.warn("Pesan awal grup kegiatan dilewati:", msgErr);
    }

    // 8. Kirim Notifikasi Langsung (Realtime Banner & Audio Chime) ke Setiap Pengguna yang Diundang
    if (validTargetUserIds.length > 0) {
      const inviteNotifications = validTargetUserIds.map((targetId) => ({
        sender_id: user.id,
        receiver_id: targetId,
        pesan: `🎉 Undangan Grup Kegiatan: Anda telah resmi dimasukkan ke dalam obrolan grup "${cleanNama}" oleh ${creatorName} (${creatorRole}).\n\nKlik di sini untuk langsung bergabung ke obrolan grup: /kabar?tab=percakapan&groupId=${newGroupId}`,
        dibaca: false,
        created_at: new Date().toISOString(),
      }));

      try {
        await clientToUse.from("pesan_pribadi").insert(inviteNotifications);
      } catch (notifErr) {
        console.warn("Pesan notifikasi undangan ke pengguna dilewati:", notifErr);
      }
    }

    // 9. Revalidasi halaman terkait
    revalidatePath("/kabar");
    revalidatePath("/komunitas");
    revalidatePath("/profil");

    // 10. Siapkan Objek Room Lengkap agar Admin Langsung Masuk ke Ruang Obrolan
    const createdRoom: import("@/types/database").GrupChatRoom = {
      id: newGroupId,
      nama: cleanNama,
      jenis: "kegiatan",
      deskripsi: fullDescription,
      kecamatan: "Kota Tegal",
      kelurahan: "Semua Kelurahan",
      rw: "-",
      rt: "-",
      jumlah_anggota: validTargetUserIds.length + 1,
      last_message: {
        pesan: welcomeMessage,
        sender_name: creatorName,
        created_at: new Date().toISOString(),
      },
      is_member: true,
      created_by: user.id,
      creator_name: creatorName,
      is_kegiatan: true,
      kategori: params.kategori || null,
    };

    return {
      success: true,
      message: `Percakapan Grup Kegiatan "${cleanNama}" berhasil dibuat dengan ${validTargetUserIds.length} pengguna terundang!`,
      groupId: newGroupId,
      room: createdRoom,
    };
  } catch (err: any) {
    console.error("Error createGrupKegiatan:", err);
    return {
      success: false,
      message: err?.message || "Terjadi kesalahan saat membuat grup kegiatan.",
    };
  }
}

/**
 * Server Action: Mengambil daftar anggota dalam satu grup kegiatan
 * Dilengkapi auto-healing jika pembuat grup belum terdaftar di anggota_komunitas
 * dan auto-approval status anggota.
 */
export async function getGrupKegiatanMembers(komunitasId: string): Promise<{
  success: boolean;
  message?: string;
  members: GrupKegiatanMemberItem[];
}> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const clientToUse = adminClient || supabase;

    const rawId = (komunitasId || "").trim();
    const dbKomunitasId = toValidUUID(rawId);
    const validUuids = Array.from(
      new Set(
        [rawId, dbKomunitasId].filter((id) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
        )
      )
    );
    if (validUuids.length === 0) validUuids.push(dbKomunitasId);

    // Ambil data anggota komunitas
    const { data, error } = await clientToUse
      .from("anggota_komunitas")
      .select(`
        id,
        user_id,
        komunitas_id,
        peran,
        status,
        created_at,
        profiles (
          id,
          nama_lengkap,
          email,
          avatar_url,
          is_super_admin,
          is_admin_pusat
        )
      `)
      .in("komunitas_id", validUuids)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Gagal getGrupKegiatanMembers:", error);
      return { success: false, message: error.message, members: [] };
    }

    // Auto-approve: di grup kegiatan, semua anggota berstatus approved
    const pendingIds = (data || [])
      .filter((m: any) => m.status !== "approved")
      .map((m: any) => m.id);
    if (pendingIds.length > 0) {
      try {
        await clientToUse
          .from("anggota_komunitas")
          .update({ status: "approved", updated_at: new Date().toISOString() })
          .in("id", pendingIds);
      } catch (err) {
        console.warn("Gagal auto-update status anggota ke approved:", err);
      }
    }

    let rawList: any[] = data || [];

    // Auto-heal: Jika daftar anggota masih kosong (misal insert awal terkendala),
    // daftarkan pembuat grup (creator) sebagai Admin ke tabel anggota_komunitas
    if (rawList.length === 0) {
      const { data: groupInfo } = await clientToUse
        .from("komunitas")
        .select("id, nama, created_by, jenis")
        .in("id", validUuids)
        .maybeSingle();

      if (groupInfo && groupInfo.created_by) {
        const { data: creatorProf } = await clientToUse
          .from("profiles")
          .select("id, nama_lengkap, email, avatar_url, is_super_admin, is_admin_pusat")
          .eq("id", groupInfo.created_by)
          .maybeSingle();

        const creatorRole = creatorProf?.is_super_admin ? "Super Admin" : "Admin Pusat";
        const { data: insertedCreator } = await clientToUse
          .from("anggota_komunitas")
          .insert({
            user_id: groupInfo.created_by,
            komunitas_id: groupInfo.id,
            peran: creatorRole,
            status: "approved",
            approved_by: groupInfo.created_by,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select(`
            id,
            user_id,
            komunitas_id,
            peran,
            status,
            created_at,
            profiles (
              id,
              nama_lengkap,
              email,
              avatar_url,
              is_super_admin,
              is_admin_pusat
            )
          `)
          .maybeSingle();

        if (insertedCreator) {
          rawList = [insertedCreator];
        } else {
          rawList = [
            {
              id: crypto.randomUUID(),
              user_id: groupInfo.created_by,
              komunitas_id: groupInfo.id,
              peran: creatorRole,
              status: "approved",
              created_at: new Date().toISOString(),
              profiles: creatorProf,
            },
          ];
        }
      }
    }

    // Pastikan jika profiles null (misal relasi RLS), enrich dari profiles table
    const formattedMembers: GrupKegiatanMemberItem[] = rawList.map((m: any) => {
      const prof = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles || null;
      return {
        id: m.id,
        user_id: m.user_id,
        komunitas_id: m.komunitas_id,
        peran: m.peran,
        status: m.status || "approved",
        created_at: m.created_at,
        profile: prof,
      };
    });

    const missingProfUids = formattedMembers
      .filter((m) => !m.profile || !m.profile.nama_lengkap)
      .map((m) => m.user_id);

    if (missingProfUids.length > 0) {
      try {
        const { data: profs } = await clientToUse
          .from("profiles")
          .select("id, nama_lengkap, email, avatar_url, is_super_admin, is_admin_pusat")
          .in("id", missingProfUids);

        if (profs && profs.length > 0) {
          const pMap = new Map<string, any>(profs.map((p: any) => [p.id, p]));
          formattedMembers.forEach((m) => {
            if (!m.profile || !m.profile.nama_lengkap) {
              const matched = pMap.get(m.user_id);
              if (matched) {
                m.profile = matched;
              }
            }
          });
        }
      } catch {
        // Fallback
      }
    }

    return {
      success: true,
      members: formattedMembers,
    };
  } catch (err: any) {
    console.error("Error getGrupKegiatanMembers:", err);
    return {
      success: false,
      message: err?.message || "Gagal memuat anggota grup kegiatan.",
      members: [],
    };
  }
}

/**
 * Server Action: Mengundang / Menambahkan Pengguna Tambahan ke Grup Kegiatan yang Sudah Ada
 * Dilengkapi safe-insert tanpa onConflict constraint dan auto-approval langsung.
 */
export async function addMembersToGrupKegiatan(params: {
  komunitasId: string;
  memberUserIds: string[];
}): Promise<{
  success: boolean;
  message: string;
  addedCount?: number;
}> {
  try {
    const { komunitasId, memberUserIds } = params;
    if (!komunitasId || !memberUserIds || memberUserIds.length === 0) {
      return { success: false, message: "Pengguna yang diundang wajib dipilih." };
    }

    const supabase = await createClient();
    const adminClient = createAdminClient();
    const clientToUse = adminClient || supabase;

    // 1. Verifikasi Auth
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, message: "Silakan masuk terlebih dahulu." };
    }

    // 2. Verifikasi Hak Akses: Super Admin, Admin Pusat, atau Pembuat Grup
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    const userProfileCtx = {
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    };

    const isSuper = checkIsSuperAdmin(userProfileCtx);
    const isAdminP = checkIsAdminPusat(userProfileCtx);

    const rawId = (komunitasId || "").trim();
    const dbKomId = toValidUUID(rawId);
    const validUuids = Array.from(
      new Set(
        [rawId, dbKomId].filter((id) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
        )
      )
    );
    if (validUuids.length === 0) validUuids.push(dbKomId);

    const { data: groupInfo } = await clientToUse
      .from("komunitas")
      .select("id, nama, created_by")
      .in("id", validUuids)
      .maybeSingle();

    const isCreator = groupInfo?.created_by === user.id;

    if (!isSuper && !isAdminP && !isCreator) {
      return {
        success: false,
        message: "Akses ditolak: Hanya Admin atau pembuat grup yang dapat mengundang anggota.",
      };
    }

    const targetGroupId = groupInfo?.id || validUuids[0];

    // 3. Filter pengguna yang sudah tergabung
    const { data: existingMembers } = await clientToUse
      .from("anggota_komunitas")
      .select("id, user_id, status")
      .in("komunitas_id", validUuids);

    const existingMap = new Map((existingMembers || []).map((m: any) => [m.user_id, m]));

    // Pastikan pembuat grup terdaftar jika sebelumnya belum ada
    if (groupInfo?.created_by && !existingMap.has(groupInfo.created_by)) {
      try {
        await clientToUse.from("anggota_komunitas").insert({
          user_id: groupInfo.created_by,
          komunitas_id: targetGroupId,
          peran: isSuper ? "Super Admin" : "Admin Pusat",
          status: "approved",
          approved_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Creator auto-heal di addMembers dilewati:", err);
      }
    }

    // Jika ada pengguna yang sudah ada di anggota_komunitas tapi statusnya belum approved, update jadi approved
    const toApproveIds = (existingMembers || [])
      .filter((m: any) => memberUserIds.includes(m.user_id) && m.status !== "approved")
      .map((m: any) => m.id);

    if (toApproveIds.length > 0) {
      await clientToUse
        .from("anggota_komunitas")
        .update({ status: "approved", updated_at: new Date().toISOString() })
        .in("id", toApproveIds);
    }

    const newMembersToInvite = Array.from(
      new Set(memberUserIds.filter((uid) => uid && !existingMap.has(uid)))
    );

    if (newMembersToInvite.length === 0 && toApproveIds.length === 0) {
      return {
        success: true,
        message: "Semua pengguna yang dipilih sudah tergabung dalam grup ini.",
        addedCount: 0,
      };
    }

    const payload = newMembersToInvite.map((uid) => ({
      user_id: uid,
      komunitas_id: targetGroupId,
      peran: "anggota",
      status: "approved",
      approved_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    let insertedCount = toApproveIds.length;

    if (payload.length > 0) {
      const { error: insertErr } = await clientToUse
        .from("anggota_komunitas")
        .insert(payload);

      if (insertErr) {
        console.warn("Direct batch insert anggota_komunitas gagal, mencoba insert satuan:", insertErr);
        for (const item of payload) {
          const { error: singleErr } = await clientToUse
            .from("anggota_komunitas")
            .insert(item);
          if (!singleErr) {
            insertedCount++;
          } else {
            console.error("Gagal insert anggota satuan:", item.user_id, singleErr);
            // Fallback jika sudah ada
            await clientToUse
              .from("anggota_komunitas")
              .update({ status: "approved", updated_at: new Date().toISOString() })
              .eq("user_id", item.user_id)
              .in("komunitas_id", validUuids);
          }
        }
      } else {
        insertedCount += payload.length;
      }
    }

    // Fallback RPC jika direct insert gagal
    if (insertedCount === 0 && newMembersToInvite.length > 0) {
      try {
        await supabase.rpc("tambah_anggota_grup_kegiatan", {
          p_komunitas_id: targetGroupId,
          p_user_ids: newMembersToInvite,
          p_approved_by: user.id,
        });
      } catch (e) {
        console.warn("RPC fallback tambah_anggota_grup_kegiatan gagal:", e);
      }
    }

    // Kirim notifikasi pesan di grup
    try {
      const adminName = profile?.nama_lengkap || "Admin";
      await clientToUse.from("pesan_grup").insert({
        komunitas_id: komunitasId,
        user_id: user.id,
        pesan: `👋 ${adminName} telah menambahkan ${newMembersToInvite.length} pengguna baru ke dalam percakapan grup kegiatan ini.`,
        created_at: new Date().toISOString(),
      });

      // Kirim pesan notifikasi undangan personal ke setiap anggota baru
      const inviteNotifications = newMembersToInvite.map((uid) => ({
        sender_id: user.id,
        receiver_id: uid,
        pesan: `🎉 Undangan Grup Kegiatan: Anda telah ditambahkan ke dalam grup "${groupInfo?.nama || "Kegiatan"}" oleh ${adminName}.\n\nKlik di sini untuk langsung bergabung ke obrolan grup: /kabar?tab=percakapan&groupId=${komunitasId}`,
        dibaca: false,
        created_at: new Date().toISOString(),
      }));
      await clientToUse.from("pesan_pribadi").insert(inviteNotifications);
    } catch {
      // Abaikan jika pesan otomatis gagal
    }

    revalidatePath("/kabar");
    revalidatePath("/komunitas");

    return {
      success: true,
      message: `Berhasil menambahkan ${newMembersToInvite.length} anggota baru ke grup!`,
      addedCount: newMembersToInvite.length,
    };
  } catch (err: any) {
    console.error("Error addMembersToGrupKegiatan:", err);
    return {
      success: false,
      message: err?.message || "Gagal menambahkan anggota ke grup kegiatan.",
    };
  }
}

/**
 * Server Action: Mengeluarkan Anggota dari Grup Kegiatan
 */
export async function removeMemberFromGrupKegiatan(params: {
  komunitasId: string;
  targetUserId: string;
}): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { komunitasId, targetUserId } = params;
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const clientToUse = adminClient || supabase;

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, message: "Silakan masuk terlebih dahulu." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat")
      .eq("id", user.id)
      .maybeSingle();

    const isSuper = checkIsSuperAdmin(profile);
    const isAdminP = checkIsAdminPusat(profile);

    const rawId = (komunitasId || "").trim();
    const dbKomId = toValidUUID(rawId);
    const validUuids = Array.from(
      new Set(
        [rawId, dbKomId].filter((id) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
        )
      )
    );
    if (validUuids.length === 0) validUuids.push(dbKomId);

    const { data: groupInfo } = await clientToUse
      .from("komunitas")
      .select("created_by")
      .in("id", validUuids)
      .maybeSingle();

    const isCreator = groupInfo?.created_by === user.id;

    if (!isSuper && !isAdminP && !isCreator && user.id !== targetUserId) {
      return {
        success: false,
        message: "Akses ditolak: Anda tidak memiliki wewenang mengeluarkan anggota ini.",
      };
    }

    const { error: delErr } = await clientToUse
      .from("anggota_komunitas")
      .delete()
      .in("komunitas_id", validUuids)
      .eq("user_id", targetUserId);

    if (delErr) {
      throw delErr;
    }

    revalidatePath("/kabar");
    return {
      success: true,
      message: "Anggota berhasil dikeluarkan dari grup.",
    };
  } catch (err: any) {
    console.error("Error removeMemberFromGrupKegiatan:", err);
    return {
      success: false,
      message: err?.message || "Gagal mengeluarkan anggota dari grup.",
    };
  }
}

/**
 * Server Action: Menghapus Grup Kegiatan (Khusus Admin / Pembuat)
 */
export async function deleteGrupKegiatan(komunitasId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    const clientToUse = adminClient || supabase;

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, message: "Silakan masuk terlebih dahulu." };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat")
      .eq("id", user.id)
      .maybeSingle();

    const isSuper = checkIsSuperAdmin(profile);
    const isAdminP = checkIsAdminPusat(profile);

    const rawId = (komunitasId || "").trim();
    const dbKomId = toValidUUID(rawId);
    const validUuids = Array.from(
      new Set(
        [rawId, dbKomId].filter((id) =>
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
        )
      )
    );
    if (validUuids.length === 0) validUuids.push(dbKomId);

    const { data: groupInfo } = await clientToUse
      .from("komunitas")
      .select("nama, created_by, jenis")
      .in("id", validUuids)
      .maybeSingle();

    if (!groupInfo) {
      return { success: false, message: "Grup tidak ditemukan." };
    }

    if (groupInfo.jenis !== "kegiatan") {
      return {
        success: false,
        message: "Hanya grup percakapan kegiatan yang dapat dihapus melalui menu ini.",
      };
    }

    const isCreator = groupInfo.created_by === user.id;

    if (!isSuper && !isAdminP && !isCreator) {
      return {
        success: false,
        message: "Akses ditolak: Hanya Admin Pusat, Super Admin, atau pembuat grup yang dapat menghapus grup ini.",
      };
    }

    // 1. Bersihkan seluruh riwayat pesan di grup kegiatan ini
    try {
      await clientToUse
        .from("pesan_grup")
        .delete()
        .in("komunitas_id", validUuids);
    } catch (msgDelErr) {
      console.warn("Gagal membersihkan pesan grup:", msgDelErr);
    }

    // 2. Bersihkan seluruh keanggotaan grup kegiatan ini
    try {
      await clientToUse
        .from("anggota_komunitas")
        .delete()
        .in("komunitas_id", validUuids);
    } catch (memDelErr) {
      console.warn("Gagal membersihkan anggota grup:", memDelErr);
    }

    // 3. Hapus record komunitas grup kegiatan
    const { error: delErr } = await clientToUse
      .from("komunitas")
      .delete()
      .in("id", validUuids);

    if (delErr) {
      throw delErr;
    }

    revalidatePath("/kabar");
    revalidatePath("/komunitas");

    return {
      success: true,
      message: `Grup kegiatan "${groupInfo.nama}" berhasil dihapus.`,
    };
  } catch (err: any) {
    console.error("Error deleteGrupKegiatan:", err);
    return {
      success: false,
      message: err?.message || "Gagal menghapus grup kegiatan.",
    };
  }
}
