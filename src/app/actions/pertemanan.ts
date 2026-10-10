"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { toValidUUID, isAdminPusat, isSuperOrAdminPusat, isSuperAdmin as checkIsSuperAdmin } from "@/lib/utils";
import { SEED_SPM_TEGAL } from "@/lib/constants/tegal-data";
import type {
  GetRegisteredUsersResult,
  RegisteredUserItem,
  UserKomunitasAffiliation,
  PesanPribadi,
  Profile,
  IncomingMessageNotificationItem,
} from "@/types/database";

/**
 * Mengambil daftar pengguna yang telah registrasi di Jarimas-ID.
 * - Pengguna reguler: HANYA menampilkan akun pengguna yang satu komunitas / bergabung dalam komunitas yang sama.
 * - Super Admin: Dapat melihat seluruh pengguna yang telah registrasi.
 * Fitur ini HANYA dapat diakses oleh pengguna yang sudah terautentikasi (login).
 */
export async function getRegisteredUsers(params?: {
  searchQuery?: string;
  tab?: "semua" | "teman" | "permintaan";
}): Promise<GetRegisteredUsersResult> {
  try {
    const supabase = await createClient();

    // 1. Verifikasi status autentikasi pengguna saat ini
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        isAuthenticated: false,
        isSuperAdmin: false,
        currentUserId: null,
        users: [],
        totalCount: 0,
        totalFriendsCount: 0,
        totalPendingRequestsCount: 0,
        userCommunitiesCount: 0,
      };
    }

    const currentUserId = user.id;

    // 2. Periksa status Super Admin & Admin Pusat pengguna saat ini
    let isSuperAdmin = false;
    let isAdminPusatUser = false;
    try {
      const { data: currentUserProfile } = await supabase
        .from("profiles")
        .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
        .eq("id", currentUserId)
        .maybeSingle();

      const userCtx = {
        ...currentUserProfile,
        id: currentUserId,
        email: currentUserProfile?.email || user.email,
        nama_lengkap: currentUserProfile?.nama_lengkap || user.user_metadata?.nama_lengkap,
      };
      isSuperAdmin = checkIsSuperAdmin(userCtx);
      isAdminPusatUser = !isSuperAdmin && isAdminPusat(userCtx);
    } catch {
      // Abaikan jika pengecekan profil terkendala
    }

    // 3. Ambil data keanggotaan komunitas seluruh pengguna untuk badge identitas & filter satu komunitas
    let communityMap: Record<string, UserKomunitasAffiliation[]> = {};
    const myCommunityIds = new Set<string>();
    const sameCommunityUserIds = new Set<string>();

    try {
      const { data: memberships } = await supabase
        .from("anggota_komunitas")
        .select(`
          user_id,
          komunitas_id,
          peran,
          status,
          komunitas (
            id,
            nama,
            jenis,
            kecamatan,
            kelurahan,
            rw,
            rt
          )
        `)
        .eq("status", "approved");

      if (memberships) {
        // Petakan keanggotaan per user & catat komunitas user saat ini
        memberships.forEach((m: any) => {
          if (!m.user_id || !m.komunitas) return;
          if (!communityMap[m.user_id]) {
            communityMap[m.user_id] = [];
          }
          communityMap[m.user_id].push({
            id: m.komunitas.id,
            nama: m.komunitas.nama || "Komunitas Warga",
            jenis: m.komunitas.jenis || "warga_kita",
            peran: m.peran || "Anggota",
            kecamatan: m.komunitas.kecamatan,
            kelurahan: m.komunitas.kelurahan,
            rw: m.komunitas.rw,
            rt: m.komunitas.rt,
          });

          if (m.user_id === currentUserId && m.komunitas_id) {
            myCommunityIds.add(m.komunitas_id);
          }
        });

        // Kumpulkan ID pengguna yang berada di komunitas yang sama dengan user saat ini
        memberships.forEach((m: any) => {
          if (m.user_id && m.komunitas_id && myCommunityIds.has(m.komunitas_id)) {
            sameCommunityUserIds.add(m.user_id);
          }
        });
      }
    } catch (commErr) {
      console.warn("Gagal memetakan komunitas user:", commErr);
    }

    // 4. Ambil profil pengguna sesuai hak akses:
    // - Super Admin: Mengambil semua profil terdaftar
    // - User Reguler: HANYA mengambil profil pengguna yang satu komunitas
    let targetProfiles: any[] = [];
    if (isSuperAdmin || isAdminPusatUser) {
      const { data: profiles, error: profileErr } = await supabase
        .from("profiles")
        .select("id, nama_lengkap, email, nomor_hp, avatar_url, is_super_admin, created_at")
        .order("created_at", { ascending: false });

      if (profileErr) {
        console.warn("Gagal mengambil profiles untuk super admin / admin pusat:", profileErr);
      }
      targetProfiles = profiles || [];
    } else {
      if (myCommunityIds.size > 0 && sameCommunityUserIds.size > 0) {
        const userIdsToFetch = Array.from(sameCommunityUserIds);
        const { data: profiles, error: profileErr } = await supabase
          .from("profiles")
          .select("id, nama_lengkap, email, nomor_hp, avatar_url, is_super_admin, created_at")
          .in("id", userIdsToFetch)
          .order("created_at", { ascending: false });

        if (profileErr) {
          console.warn("Gagal mengambil profiles satu komunitas:", profileErr);
        }
        targetProfiles = profiles || [];
      } else {
        // User belum bergabung di komunitas manapun, targetProfiles kosong
        targetProfiles = [];
      }
    }

    // 5. Ambil relasi pertemanan yang melibatkan user saat ini
    let friendshipsMap: Record<
      string,
      {
        id: string;
        status: string;
        requested_by: string;
      }
    > = {};

    let totalFriendsCount = 0;
    let totalPendingRequestsCount = 0;

    try {
      const { data: friendships } = await supabase
        .from("pertemanan")
        .select("id, user_id, friend_id, status, requested_by")
        .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

      if (friendships) {
        friendships.forEach((f: any) => {
          const otherId = f.user_id === currentUserId ? f.friend_id : f.user_id;
          friendshipsMap[otherId] = {
            id: f.id,
            status: f.status,
            requested_by: f.requested_by,
          };

          if (f.status === "accepted") {
            totalFriendsCount++;
          } else if (f.status === "pending" && f.requested_by !== currentUserId) {
            totalPendingRequestsCount++;
          }
        });
      }
    } catch {
      // Graceful fallback jika tabel pertemanan belum dibuat
    }

    // 6. Ambil jumlah pesan belum terbaca untuk user saat ini
    let unreadMap: Record<string, number> = {};
    try {
      const { data: unreadList } = await supabase
        .from("pesan_pribadi")
        .select("sender_id")
        .eq("receiver_id", currentUserId)
        .eq("is_read", false);

      if (unreadList) {
        unreadList.forEach((m: any) => {
          unreadMap[m.sender_id] = (unreadMap[m.sender_id] || 0) + 1;
        });
      }
    } catch {
      // Graceful fallback jika tabel pesan_pribadi belum dibuat
    }

    // 7. Susun dan mapping daftar pengguna terdaftar
    let mappedUsers: RegisteredUserItem[] = targetProfiles.map((p) => {
      let friendship_status: RegisteredUserItem["friendship_status"] = "none";
      let friendship_id: string | null = null;

      if (p.id === currentUserId) {
        friendship_status = "self";
      } else if (friendshipsMap[p.id]) {
        const f = friendshipsMap[p.id];
        friendship_id = f.id;
        if (f.status === "accepted") {
          friendship_status = "accepted";
        } else if (f.status === "pending") {
          friendship_status =
            f.requested_by === currentUserId ? "pending_sent" : "pending_received";
        }
      }

      const userIsSuperAdmin = checkIsSuperAdmin(p);
      const userIsAdminPusat = !userIsSuperAdmin && isAdminPusat(p);
      return {
        id: p.id,
        nama_lengkap: p.nama_lengkap || "Warga Jarimas",
        email: p.email,
        nomor_hp: p.nomor_hp,
        avatar_url: p.avatar_url,
        is_super_admin: userIsSuperAdmin,
        is_admin_pusat: userIsAdminPusat,
        created_at: p.created_at || new Date().toISOString(),
        komunitas_list: communityMap[p.id] || [],
        friendship_status,
        friendship_id,
        unread_messages_count: unreadMap[p.id] || 0,
      };
    });

    // 8. Filter berdasarkan pencarian jika ada
    if (params?.searchQuery) {
      const q = params.searchQuery.toLowerCase().trim();
      mappedUsers = mappedUsers.filter((u) => {
        const matchName = u.nama_lengkap.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchCommunity = u.komunitas_list?.some(
          (c) =>
            c.nama.toLowerCase().includes(q) ||
            c.peran.toLowerCase().includes(q) ||
            c.kecamatan?.toLowerCase().includes(q) ||
            c.kelurahan?.toLowerCase().includes(q)
        );
        return matchName || matchEmail || matchCommunity;
      });
    }

    // 9. Filter berdasarkan tab
    if (params?.tab === "teman") {
      mappedUsers = mappedUsers.filter((u) => u.friendship_status === "accepted");
    } else if (params?.tab === "permintaan") {
      mappedUsers = mappedUsers.filter((u) => u.friendship_status === "pending_received");
    }

    // Hitung total orang lain (kecuali diri sendiri)
    const otherUsersCount = targetProfiles.filter((p) => p.id !== currentUserId).length;

    return {
      isAuthenticated: true,
      isSuperAdmin,
      isAdminPusat: isAdminPusatUser,
      currentUserId,
      users: mappedUsers,
      totalCount: otherUsersCount,
      totalFriendsCount,
      totalPendingRequestsCount,
      userCommunitiesCount: myCommunityIds.size,
    };
  } catch (err) {
    console.error("Error pada getRegisteredUsers:", err);
    return {
      isAuthenticated: false,
      isSuperAdmin: false,
      currentUserId: null,
      users: [],
      totalCount: 0,
      totalFriendsCount: 0,
      totalPendingRequestsCount: 0,
      userCommunitiesCount: 0,
    };
  }
}

/**
 * Server Action: Mengirim permintaan pertemanan ke pengguna lain
 */
export async function sendFriendRequest(targetUserId: string): Promise<{
  success: boolean;
  message: string;
  friendshipId?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Silakan masuk terlebih dahulu untuk menambah teman.",
      };
    }

    if (user.id === targetUserId) {
      return {
        success: false,
        message: "Anda tidak dapat menambahkan diri sendiri sebagai teman.",
      };
    }

    // Periksa hak akses Super Admin / Admin Pusat
    let isCurrentSuperAdmin = false;
    try {
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("id, is_super_admin, is_admin_pusat, nama_lengkap")
        .eq("id", user.id)
        .maybeSingle();
      isCurrentSuperAdmin = isSuperOrAdminPusat(myProfile);
    } catch {
      // Abaikan
    }

    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap")
      .eq("id", targetUserId)
      .maybeSingle();

    const isTargetSuperAdmin = isSuperOrAdminPusat(targetProfile);

    // Jika bukan super admin dan target bukan super admin, validasi kesamaan komunitas
    if (!isCurrentSuperAdmin && !isTargetSuperAdmin) {
      const { data: myComms } = await supabase
        .from("anggota_komunitas")
        .select("komunitas_id")
        .eq("user_id", user.id)
        .eq("status", "approved");

      const myCommIds = (myComms || []).map((c: any) => c.komunitas_id);

      const { data: targetComms } = await supabase
        .from("anggota_komunitas")
        .select("komunitas_id")
        .eq("user_id", targetUserId)
        .eq("status", "approved");

      const targetCommIds = new Set((targetComms || []).map((c: any) => c.komunitas_id));
      const sharesCommunity = myCommIds.some((id: string) => targetCommIds.has(id));

      if (!sharesCommunity) {
        return {
          success: false,
          message: "Anda hanya dapat menambahkan teman yang berada dalam komunitas yang sama.",
        };
      }
    }

    // Cek apakah sudah ada pertemanan yang tersimpan
    const { data: existing } = await supabase
      .from("pertemanan")
      .select("id, status, requested_by")
      .or(
        `and(user_id.eq.${user.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) {
      if (existing.status === "accepted") {
        return {
          success: true,
          message: "Anda dan pengguna ini sudah berteman.",
          friendshipId: existing.id,
        };
      }
      if (existing.status === "pending") {
        if (existing.requested_by === user.id) {
          return {
            success: true,
            message: "Permintaan pertemanan sudah terkirim sebelumnya.",
            friendshipId: existing.id,
          };
        } else {
          // Lawan bicara telah mengirim request, otomatis accept
          const { error: updateErr } = await supabase
            .from("pertemanan")
            .update({ status: "accepted", updated_at: new Date().toISOString() })
            .eq("id", existing.id);

          if (updateErr) {
            return {
              success: false,
              message: "Gagal menerima permintaan pertemanan: " + updateErr.message,
            };
          }

          revalidatePath("/");
          return {
            success: true,
            message: "Permintaan pertemanan diterima! Anda sekarang berteman.",
            friendshipId: existing.id,
          };
        }
      }
    }

    // Insert permintaan baru
    const { data: inserted, error: insertErr } = await supabase
      .from("pertemanan")
      .insert({
        user_id: user.id,
        friend_id: targetUserId,
        status: "pending",
        requested_by: user.id,
      })
      .select("id")
      .single();

    if (insertErr) {
      return {
        success: false,
        message: "Gagal mengirim permintaan pertemanan: " + insertErr.message,
      };
    }

    revalidatePath("/");
    return {
      success: true,
      message: "Permintaan pertemanan berhasil dikirim!",
      friendshipId: inserted?.id,
    };
  } catch (err: any) {
    console.error("Error sendFriendRequest:", err);
    return {
      success: false,
      message: err?.message || "Terjadi kesalahan sistem saat menambah teman.",
    };
  }
}

/**
 * Server Action: Menjawab permintaan pertemanan (Terima, Tolak, atau Batal)
 */
export async function respondFriendRequest(
  friendshipId: string,
  action: "accept" | "reject" | "cancel"
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Sesi login telah berakhir.",
      };
    }

    if (action === "accept") {
      const { error } = await supabase
        .from("pertemanan")
        .update({
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", friendshipId);

      if (error) {
        return { success: false, message: "Gagal menerima pertemanan: " + error.message };
      }

      revalidatePath("/");
      return { success: true, message: "Permintaan pertemanan berhasil diterima!" };
    }

    // Jika reject atau cancel, hapus baris pertemanan
    const { error } = await supabase.from("pertemanan").delete().eq("id", friendshipId);

    if (error) {
      return { success: false, message: "Gagal membatalkan pertemanan: " + error.message };
    }

    revalidatePath("/");
    return {
      success: true,
      message:
        action === "cancel"
          ? "Permintaan pertemanan dibatalkan."
          : "Permintaan pertemanan ditolak.",
    };
  } catch (err: any) {
    console.error("Error respondFriendRequest:", err);
    return {
      success: false,
      message: err?.message || "Terjadi kesalahan saat memproses permintaan pertemanan.",
    };
  }
}

import {
  JARIMAS_BOT_ID,
  JARIMAS_BOT_NAME,
} from "@/types/database";

/**
 * Helper: Memastikan profil bot / sistem resmi "Jarimas" tersedia di tabel profiles
 */
export async function ensureJarimasBotProfile(supabaseClient?: any): Promise<void> {
  try {
    const supabase = supabaseClient || (await createClient());
    await supabase.from("profiles").upsert(
      {
        id: JARIMAS_BOT_ID,
        nama_lengkap: JARIMAS_BOT_NAME,
        email: "official@jarimas.id",
        is_super_admin: false,
        avatar_url: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  } catch (err) {
    console.warn("Gagal memastikan profil bot Jarimas:", err);
  }
}

/**
 * Server Action: Mengirimkan salam pembuka dari akun resmi Jarimas Indonesia kepada pengguna
 * Format: "Selamat datang di jarimas.id, mari bergabung dengan komunitas, berbagi kabar dan memulai percakapan yang menyenangkan disini, terimakasih sudah berkunjung"
 */
export async function sendJarimasWelcomeGreeting(
  userId: string,
  userName?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    if (!userId || userId === JARIMAS_BOT_ID) {
      return { success: false, message: "User ID tidak valid." };
    }

    const supabase = await createClient();

    // 1. Dapatkan profil akun Super Admin Jarimas Indonesia (jarimas.id@gmail.com)
    let jarimasSenderId = JARIMAS_BOT_ID;
    try {
      const { data: jarimasAdmin } = await supabase
        .from("profiles")
        .select("id, email, nama_lengkap, is_super_admin")
        .or("email.eq.jarimas.id@gmail.com,email.ilike.%jarimas.id%,nama_lengkap.ilike.%Jarimas Indonesia%")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (jarimasAdmin?.id) {
        jarimasSenderId = jarimasAdmin.id;
      }
    } catch {
      // Abaikan jika query terkendala, gunakan JARIMAS_BOT_ID
    }

    // Jika yang login adalah akun Jarimas Indonesia itu sendiri, tidak perlu kirim salam ke diri sendiri
    if (userId === jarimasSenderId || userId === JARIMAS_BOT_ID) {
      return { success: true };
    }

    // Pastikan fallback profil bot Jarimas tersedia jika senderId adalah bot
    if (jarimasSenderId === JARIMAS_BOT_ID) {
      await ensureJarimasBotProfile(supabase);
    }

    // 2. Cek apakah sudah pernah ada pesan dari Jarimas ke pengguna ini (cegah duplikasi pesan)
    const { data: existingMsg } = await supabase
      .from("pesan_pribadi")
      .select("id")
      .or(
        `and(sender_id.eq.${jarimasSenderId},receiver_id.eq.${userId}),and(sender_id.eq.${JARIMAS_BOT_ID},receiver_id.eq.${userId})`
      )
      .limit(1)
      .maybeSingle();

    if (existingMsg) {
      return { success: true, message: "Pesan pembuka sudah pernah dikirim sebelumnya." };
    }

    // Pesan pembuka resmi sesuai permintaan
    const greetingText =
      "Selamat datang di jarimas.id, mari bergabung dengan komunitas, berbagi kabar dan memulai percakapan yang menyenangkan disini, terimakasih sudah berkunjung";

    // Kirim pesan salam pembuka dari Jarimas ke user
    const { error } = await supabase.from("pesan_pribadi").insert({
      sender_id: jarimasSenderId,
      receiver_id: userId,
      pesan: greetingText,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("Gagal insert salam pembuka Jarimas:", error.message);
      return { success: false, message: error.message };
    }

    revalidatePath("/kabar");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.warn("Error sendJarimasWelcomeGreeting:", err);
    return { success: false, message: err?.message };
  }
}

/**
 * Server Action: Mengambil riwayat percakapan pribadi dengan pengguna target
 */
export async function getPrivateConversation(targetUserId: string): Promise<{
  success: boolean;
  message?: string;
  messages: PesanPribadi[];
  targetUser?: Profile | null;
  currentUserId?: string | null;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Silakan masuk terlebih dahulu untuk membaca percakapan.",
        messages: [],
      };
    }

    const currentUserId = user.id;

    // 1. Ambil data profil target (Mendukung Akun Resmi Jarimas, Super Admin, dan Warga)
    let targetProfile: any = null;
    if (targetUserId === JARIMAS_BOT_ID) {
      await ensureJarimasBotProfile(supabase);
      targetProfile = {
        id: JARIMAS_BOT_ID,
        nama_lengkap: JARIMAS_BOT_NAME,
        email: "official@jarimas.id",
        is_super_admin: false,
        avatar_url: null,
      };
    } else {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, nama_lengkap, email, nomor_hp, avatar_url, is_super_admin")
        .eq("id", targetUserId)
        .maybeSingle();

      targetProfile = prof;
    }

    // 2. Ambil riwayat pesan antara kedua pengguna
    const { data: rawMessages, error: msgErr } = await supabase
      .from("pesan_pribadi")
      .select(`
        id,
        sender_id,
        receiver_id,
        pesan,
        is_read,
        created_at,
        updated_at
      `)
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (msgErr) {
      console.warn("Gagal mengambil riwayat pesan:", msgErr);
      return {
        success: true,
        messages: [],
        targetUser: targetProfile,
        currentUserId,
      };
    }

    // 3. Tandai pesan dari target ke user saat ini sebagai sudah dibaca (is_read = true)
    try {
      await supabase
        .from("pesan_pribadi")
        .update({ is_read: true })
        .eq("sender_id", targetUserId)
        .eq("receiver_id", currentUserId)
        .eq("is_read", false);
    } catch {
      // Non-blocking update
    }

    return {
      success: true,
      messages: (rawMessages || []) as PesanPribadi[],
      targetUser: targetProfile,
      currentUserId,
    };
  } catch (err: any) {
    console.error("Error getPrivateConversation:", err);
    return {
      success: false,
      message: err?.message || "Gagal memuat percakapan.",
      messages: [],
    };
  }
}

/**
 * Server Action: Mengirim pesan pribadi ke pengguna lain
 * - Super Admin dapat mengirim pesan ke siapa saja.
 * - Pengguna reguler dapat mengirim pesan ke sesama anggota komunitas yang sama, ke Super Admin, atau ke Bot Jarimas.
 */
export async function sendPrivateMessage(params: {
  receiverId: string;
  pesan: string;
}): Promise<{
  success: boolean;
  message: string;
  data?: PesanPribadi;
}> {
  try {
    const { receiverId, pesan } = params;
    const cleanPesan = (pesan || "").trim();

    if (!cleanPesan) {
      return {
        success: false,
        message: "Pesan tidak boleh kosong.",
      };
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Silakan masuk terlebih dahulu untuk mengirim pesan.",
      };
    }

    if (user.id === receiverId) {
      return {
        success: false,
        message: "Anda tidak dapat mengirim pesan ke diri sendiri.",
      };
    }

    // Periksa status Super Admin / Admin Pusat pengirim dan penerima
    let isCurrentSuperAdmin = false;
    try {
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("id, is_super_admin, is_admin_pusat, nama_lengkap")
        .eq("id", user.id)
        .maybeSingle();
      isCurrentSuperAdmin = isSuperOrAdminPusat(myProfile);
    } catch {
      // Abaikan
    }

    let isTargetSuperAdmin = false;
    if (receiverId === JARIMAS_BOT_ID) {
      await ensureJarimasBotProfile(supabase);
    } else {
      const { data: targetProfile } = await supabase
        .from("profiles")
        .select("id, is_super_admin, is_admin_pusat, nama_lengkap")
        .eq("id", receiverId)
        .maybeSingle();
      isTargetSuperAdmin = isSuperOrAdminPusat(targetProfile);
    }

    // Jika bukan Super Admin, penerima bukan Super Admin, dan bukan Bot Jarimas:
    // Pastikan keduanya tergabung dalam setidaknya 1 komunitas yang sama
    if (!isCurrentSuperAdmin && !isTargetSuperAdmin && receiverId !== JARIMAS_BOT_ID) {
      const { data: myComms } = await supabase
        .from("anggota_komunitas")
        .select("komunitas_id")
        .eq("user_id", user.id)
        .eq("status", "approved");

      const myCommIds = (myComms || []).map((c: any) => c.komunitas_id);

      const { data: targetComms } = await supabase
        .from("anggota_komunitas")
        .select("komunitas_id")
        .eq("user_id", receiverId)
        .eq("status", "approved");

      const targetCommIds = new Set((targetComms || []).map((c: any) => c.komunitas_id));
      const sharesCommunity = myCommIds.some((id: string) => targetCommIds.has(id));

      if (!sharesCommunity) {
        return {
          success: false,
          message: "Anda hanya dapat mengirim pesan ke sesama warga satu komunitas.",
        };
      }
    }

    const { data: inserted, error: insertErr } = await supabase
      .from("pesan_pribadi")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        pesan: cleanPesan,
        is_read: false,
      })
      .select("id, sender_id, receiver_id, pesan, is_read, created_at")
      .single();

    if (insertErr) {
      const isTableMissing =
        insertErr.message?.includes("does not exist") ||
        insertErr.code === "42P01";
      return {
        success: false,
        message: isTableMissing
          ? "Tabel database 'pesan_pribadi' belum dibuat di Supabase. Silakan jalankan skrip SQL migration di Supabase SQL Editor."
          : "Gagal mengirim pesan: " + insertErr.message,
      };
    }

    revalidatePath("/kabar");
    revalidatePath("/");

    return {
      success: true,
      message: "Pesan berhasil dikirim.",
      data: inserted as PesanPribadi,
    };
  } catch (err: any) {
    console.error("Error sendPrivateMessage:", err);
    return {
      success: false,
      message: err?.message || "Terjadi kesalahan saat mengirim pesan.",
    };
  }
}

/**
 * Server Action: Mengambil daftar percakapan terbaru (Inbox 1-on-1 Direct Chat)
 */
export async function getRecentConversations(): Promise<{
  success: boolean;
  message?: string;
  conversations: import("@/types/database").RecentConversationItem[];
  currentUserId?: string | null;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Silakan masuk terlebih dahulu.",
        conversations: [],
        currentUserId: null,
      };
    }

    const currentUserId = user.id;

    // Ambil semua pesan yang melibatkan user saat ini
    const { data: messages, error } = await supabase
      .from("pesan_pribadi")
      .select("id, sender_id, receiver_id, pesan, is_read, created_at")
      .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false });

    if (error || !messages) {
      return {
        success: true,
        conversations: [],
        currentUserId,
      };
    }

    // Kelompokkan per partner
    const partnerMap: Record<
      string,
      {
        lastMessage: string;
        lastMessageAt: string;
        unreadCount: number;
        isLastMessageMine: boolean;
      }
    > = {};

    messages.forEach((msg) => {
      const partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
      if (!partnerMap[partnerId]) {
        partnerMap[partnerId] = {
          lastMessage: msg.pesan,
          lastMessageAt: msg.created_at,
          unreadCount: 0,
          isLastMessageMine: msg.sender_id === currentUserId,
        };
      }
      if (msg.receiver_id === currentUserId && !msg.is_read) {
        partnerMap[partnerId].unreadCount += 1;
      }
    });

    // 1. Dapatkan profil akun Super Admin Jarimas Indonesia
    let jarimasSenderId = JARIMAS_BOT_ID;
    try {
      const { data: jarimasAdmin } = await supabase
        .from("profiles")
        .select("id")
        .or("email.eq.jarimas.id@gmail.com,email.ilike.%jarimas.id%,nama_lengkap.ilike.%Jarimas Indonesia%")
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (jarimasAdmin?.id) {
        jarimasSenderId = jarimasAdmin.id;
      }
    } catch {
      // fallback
    }

    const hasJarimasConversation =
      Boolean(partnerMap[jarimasSenderId]) || Boolean(partnerMap[JARIMAS_BOT_ID]);
    const isJarimasUser =
      currentUserId === jarimasSenderId || currentUserId === JARIMAS_BOT_ID;

    if (!hasJarimasConversation && !isJarimasUser) {
      await sendJarimasWelcomeGreeting(currentUserId);
      // Re-query setelah insert salam pembuka pertama
      const { data: updatedMessages } = await supabase
        .from("pesan_pribadi")
        .select("id, sender_id, receiver_id, pesan, is_read, created_at")
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order("created_at", { ascending: false });

      if (updatedMessages && updatedMessages.length > 0) {
        updatedMessages.forEach((msg) => {
          const partnerId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;
          if (!partnerMap[partnerId]) {
            partnerMap[partnerId] = {
              lastMessage: msg.pesan,
              lastMessageAt: msg.created_at,
              unreadCount: 0,
              isLastMessageMine: msg.sender_id === currentUserId,
            };
          }
          if (msg.receiver_id === currentUserId && !msg.is_read) {
            partnerMap[partnerId].unreadCount += 1;
          }
        });
      }
    }

    const finalPartnerIds = Object.keys(partnerMap);
    if (finalPartnerIds.length === 0) {
      return {
        success: true,
        conversations: [],
        currentUserId,
      };
    }

    // Ambil profil seluruh partner (Termasuk Super Admin dan Akun resmi Jarimas)
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, email, avatar_url, is_super_admin")
      .in("id", finalPartnerIds);

    let allPartnerProfiles = [...(profiles || [])];

    // Pastikan profil Jarimas ada di list
    if (partnerMap[JARIMAS_BOT_ID] && !allPartnerProfiles.some((p) => p.id === JARIMAS_BOT_ID)) {
      allPartnerProfiles.push({
        id: JARIMAS_BOT_ID,
        nama_lengkap: JARIMAS_BOT_NAME,
        email: "official@jarimas.id",
        is_super_admin: false,
        avatar_url: null,
      });
    }

    // Ambil afiliasi komunitas partner untuk identitas peran yang akurat
    const { data: partnerAffiliations } = await supabase
      .from("anggota_komunitas")
      .select(`
        user_id,
        peran,
        komunitas (
          id,
          nama,
          jenis
        )
      `)
      .in("user_id", finalPartnerIds)
      .eq("status", "approved");

    const partnerCommMap: Record<string, { role: string; commName: string }> = {};
    if (partnerAffiliations) {
      partnerAffiliations.forEach((a: any) => {
        if (a.user_id && a.komunitas?.nama && !partnerCommMap[a.user_id]) {
          partnerCommMap[a.user_id] = {
            role: a.peran || "Anggota",
            commName: a.komunitas.nama,
          };
        }
      });
    }

    // Ambil pertemanan untuk partner
    const { data: friendships } = await supabase
      .from("pertemanan")
      .select("id, user_id, friend_id, status, requested_by")
      .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

    const fMap: Record<string, { id: string; status: string; requested_by: string }> = {};
    if (friendships) {
      friendships.forEach((f) => {
        const other = f.user_id === currentUserId ? f.friend_id : f.user_id;
        fMap[other] = { id: f.id, status: f.status, requested_by: f.requested_by };
      });
    }

    const conversations: import("@/types/database").RecentConversationItem[] = allPartnerProfiles.map(
      (p) => {
        const info = partnerMap[p.id];
        const f = fMap[p.id];
        const isJarimasBot = p.id === JARIMAS_BOT_ID;
        const isJarimasAccount = p.id === jarimasSenderId || checkIsSuperAdmin(p);
        const commInfo = partnerCommMap[p.id];
        let friendshipStatus: import("@/types/database").RecentConversationItem["friendshipStatus"] =
          isJarimasBot || isJarimasAccount ? "accepted" : "none";

        if (f) {
          if (f.status === "accepted") friendshipStatus = "accepted";
          else if (f.status === "pending") {
            friendshipStatus = f.requested_by === currentUserId ? "pending_sent" : "pending_received";
          }
        }

        let partnerRole = "Warga";
        let partnerCommunity: string | undefined = undefined;

        if (isJarimasBot) {
          partnerRole = "Layanan Resmi";
          partnerCommunity = "Sistem Informasi & Bantuan Warga";
        } else if (p.is_super_admin) {
          partnerRole = "Super Admin";
          partnerCommunity = "Administrator Utama Jarimas";
        } else if (commInfo) {
          partnerRole = commInfo.role;
          partnerCommunity = commInfo.commName;
        }

        return {
          partnerId: p.id,
          partnerName: isJarimasBot ? JARIMAS_BOT_NAME : (p.nama_lengkap || "Warga Jarimas"),
          partnerAvatar: p.avatar_url,
          partnerRole,
          partnerCommunity,
          lastMessage: info?.lastMessage || "",
          lastMessageAt: info?.lastMessageAt || new Date().toISOString(),
          unreadCount: info?.unreadCount || 0,
          isLastMessageMine: info?.isLastMessageMine || false,
          friendshipStatus,
          friendshipId: f?.id || null,
        };
      }
    );

    // Urutkan berdasarkan waktu pesan terakhir menurun
    conversations.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

    return {
      success: true,
      conversations,
      currentUserId,
    };
  } catch (err: any) {
    console.error("Error getRecentConversations:", err);
    return {
      success: false,
      message: err?.message || "Gagal memuat percakapan terbaru.",
      conversations: [],
    };
  }
}

/**
 * Server Action: Mengambil daftar ruang obrolan grup komunitas
 * - Super Admin: Melihat seluruh ruang obrolan grup komunitas.
 * - Pengguna reguler: HANYA melihat ruang obrolan grup dari komunitas yang telah diikuti (status approved).
 */
export async function getGroupChatRooms(): Promise<{
  success: boolean;
  message?: string;
  rooms: import("@/types/database").GrupChatRoom[];
  currentUserId?: string | null;
}> {
  try {
    const supabase = await createClient();

    let currentUserId: string | null = null;
    let isSuperAdmin = false;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        currentUserId = user.id;
        const { data: prof } = await supabase
          .from("profiles")
          .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
          .eq("id", user.id)
          .maybeSingle();
        isSuperAdmin = checkIsSuperAdmin({
          ...prof,
          id: user.id,
          email: prof?.email || user.email,
          nama_lengkap: prof?.nama_lengkap || user.user_metadata?.nama_lengkap,
        });
      }
    } catch {
      // Tamu
    }

    // Ambil komunitas aktif dari database
    const { data: dbCommunities } = await supabase
      .from("komunitas")
      .select(`
        id,
        nama,
        jenis,
        deskripsi,
        logo_url,
        kecamatan,
        kelurahan,
        rw,
        rt
      `)
      .order("nama", { ascending: true })
      .limit(60);

    const communityList = [...(dbCommunities || [])];
    const existingIds = new Set(communityList.map((c) => c.id));

    // Masukkan seed SPM ke daftar agar dapat diakses ruang percakapannya
    if (Array.isArray(SEED_SPM_TEGAL)) {
      for (const spm of SEED_SPM_TEGAL) {
        const spmUuid = toValidUUID(spm.id);
        if (!existingIds.has(spm.id) && !existingIds.has(spmUuid)) {
          communityList.push({
            id: spm.id,
            nama: spm.nama,
            jenis: spm.jenis,
            deskripsi: spm.deskripsi,
            logo_url: spm.logo_url || null,
            kecamatan: spm.kecamatan,
            kelurahan: spm.kelurahan,
            rw: spm.rw || null,
            rt: spm.rt || null,
          } as any);
          existingIds.add(spm.id);
          existingIds.add(spmUuid);
        }
      }
    }

    // Ambil jumlah anggota masing-masing komunitas & keanggotaan user saat ini
    const { data: memberCounts } = await supabase
      .from("anggota_komunitas")
      .select("komunitas_id, user_id, status")
      .eq("status", "approved");

    const countMap: Record<string, number> = {};
    const myMembershipSet = new Set<string>();

    if (memberCounts) {
      memberCounts.forEach((m) => {
        countMap[m.komunitas_id] = (countMap[m.komunitas_id] || 0) + 1;
        if (currentUserId && m.user_id === currentUserId) {
          myMembershipSet.add(m.komunitas_id);
        }
      });
    }

    // Filter komunitas yang relevan:
    // Super Admin: seluruh komunitas
    // User reguler: HANYA komunitas yang telah diikuti (approved)
    let relevantCommunities = communityList;
    if (!isSuperAdmin) {
      relevantCommunities = communityList.filter((c) => {
        const cUuid = toValidUUID(c.id);
        return myMembershipSet.has(c.id) || myMembershipSet.has(cUuid);
      });
    }

    // Ambil pesan terakhir grup jika ada
    let lastMsgMap: Record<string, { pesan: string; sender_name: string; created_at: string }> = {};
    try {
      const { data: lastMessages } = await supabase
        .from("pesan_grup")
        .select(`
          komunitas_id,
          pesan,
          created_at,
          profiles (
            nama_lengkap
          )
        `)
        .order("created_at", { ascending: false });

      if (lastMessages) {
        lastMessages.forEach((lm: any) => {
          if (!lastMsgMap[lm.komunitas_id]) {
            lastMsgMap[lm.komunitas_id] = {
              pesan: lm.pesan,
              sender_name: lm.profiles?.nama_lengkap || "Warga",
              created_at: lm.created_at,
            };
          }
        });
      }
    } catch {
      // Fallback
    }

    const rooms: import("@/types/database").GrupChatRoom[] = relevantCommunities.map((c) => {
      const cUuid = toValidUUID(c.id);
      const totalAnggota = (countMap[c.id] || 0) + (countMap[cUuid] || 0);
      const isMember = myMembershipSet.has(c.id) || myMembershipSet.has(cUuid);

      return {
        id: c.id,
        nama: c.nama || "Grup Komunitas",
        jenis: c.jenis || "warga_kita",
        deskripsi: c.deskripsi,
        logo_url: c.logo_url,
        kecamatan: c.kecamatan,
        kelurahan: c.kelurahan,
        rw: c.rw,
        rt: c.rt,
        jumlah_anggota: totalAnggota,
        last_message: lastMsgMap[c.id] || lastMsgMap[cUuid] || null,
        is_member: isMember,
      };
    });

    return {
      success: true,
      rooms,
      currentUserId,
    };
  } catch (err: any) {
    console.error("Error getGroupChatRooms:", err);
    return {
      success: false,
      message: err?.message || "Gagal memuat grup komunitas.",
      rooms: [],
    };
  }
}

/**
 * Server Action: Mengambil riwayat pesan grup komunitas
 */
export async function getGroupMessages(komunitasId: string): Promise<{
  success: boolean;
  message?: string;
  messages: import("@/types/database").PesanGrup[];
  komunitas?: import("@/types/database").Komunitas | null;
  currentUserId?: string | null;
}> {
  try {
    const supabase = await createClient();
    const dbKomunitasId = toValidUUID(komunitasId);

    let currentUserId: string | null = null;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) currentUserId = user.id;
    } catch {
      // Tamu
    }

    // Ambil data info komunitas
    const { data: community } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, rw, rt, logo_url, deskripsi")
      .in("id", [komunitasId, dbKomunitasId])
      .maybeSingle();

    // Ambil peranan anggota di komunitas ini untuk role badge
    const { data: memberRoles } = await supabase
      .from("anggota_komunitas")
      .select("user_id, peran, peran_diajukan, status")
      .in("komunitas_id", [komunitasId, dbKomunitasId]);

    const roleMap: Record<string, string> = {};
    if (memberRoles) {
      memberRoles.forEach((mr) => {
        roleMap[mr.user_id] = mr.peran || "Pengunjung";
      });
    }

    // Ambil riwayat pesan grup
    const { data: rawMessages, error } = await supabase
      .from("pesan_grup")
      .select(`
        id,
        komunitas_id,
        user_id,
        pesan,
        created_at,
        updated_at,
        profiles (
          id,
          nama_lengkap,
          avatar_url,
          is_super_admin
        )
      `)
      .in("komunitas_id", [komunitasId, dbKomunitasId])
      .order("created_at", { ascending: true })
      .limit(150);

    if (error) {
      console.warn("Gagal getGroupMessages:", error);
      return {
        success: true,
        messages: [],
        komunitas: community as any,
        currentUserId,
      };
    }

    const formattedMessages = (rawMessages || []).map((m: any) => ({
      ...m,
      user_role:
        roleMap[m.user_id] ||
        (checkIsSuperAdmin(m.profiles) ? "Super Admin" : isAdminPusat(m.profiles) ? "Admin Pusat" : "Anggota"),
    }));

    return {
      success: true,
      messages: formattedMessages as any,
      komunitas: community as any,
      currentUserId,
    };
  } catch (err: any) {
    console.error("Error getGroupMessages:", err);
    return {
      success: false,
      message: err?.message || "Gagal mengambil pesan grup.",
      messages: [],
    };
  }
}

/**
 * Server Action: Mengirim pesan ke grup komunitas
 */
export async function sendGroupMessage(params: {
  komunitasId: string;
  pesan: string;
}): Promise<{
  success: boolean;
  message: string;
  data?: import("@/types/database").PesanGrup;
}> {
  try {
    const { komunitasId, pesan } = params;
    const cleanPesan = (pesan || "").trim();
    const dbKomunitasId = toValidUUID(komunitasId);

    if (!cleanPesan) {
      return {
        success: false,
        message: "Pesan grup tidak boleh kosong.",
      };
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Silakan masuk terlebih dahulu untuk mengirim pesan ke grup.",
      };
    }

    // Periksa status Super Admin / Admin Pusat atau keanggotaan komunitas
    let isSuperAdmin = false;
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id, is_super_admin, is_admin_pusat, nama_lengkap")
        .eq("id", user.id)
        .maybeSingle();
      isSuperAdmin = isSuperOrAdminPusat(prof);
    } catch {
      // Abaikan
    }

    if (!isSuperAdmin) {
      const { data: membership } = await supabase
        .from("anggota_komunitas")
        .select("id, peran")
        .eq("user_id", user.id)
        .in("komunitas_id", [komunitasId, dbKomunitasId])
        .eq("status", "approved")
        .maybeSingle();

      if (!membership) {
        return {
          success: false,
          message: "Anda hanya dapat mengirim pesan ke grup komunitas yang telah Anda ikuti.",
        };
      }
    }

    const { data: inserted, error: insertErr } = await supabase
      .from("pesan_grup")
      .insert({
        komunitas_id: dbKomunitasId,
        user_id: user.id,
        pesan: cleanPesan,
      })
      .select(`
        id,
        komunitas_id,
        user_id,
        pesan,
        created_at,
        profiles (
          id,
          nama_lengkap,
          avatar_url,
          is_super_admin
        )
      `)
      .single();

    if (insertErr) {
      const isTableMissing =
        insertErr.message?.includes("does not exist") ||
        insertErr.code === "42P01";
      return {
        success: false,
        message: isTableMissing
          ? "Tabel database 'pesan_grup' belum dibuat di Supabase. Silakan jalankan skrip SQL migration di Supabase SQL Editor."
          : "Gagal mengirim pesan grup: " + insertErr.message,
      };
    }

    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath(`/komunitas/${dbKomunitasId}`);
    revalidatePath("/kabar");

    return {
      success: true,
      message: "Pesan grup terkirim.",
      data: inserted as any,
    };
  } catch (err: any) {
    console.error("Error sendGroupMessage:", err);
    return {
      success: false,
      message: err?.message || "Terjadi kesalahan saat mengirim pesan ke grup.",
    };
  }
}

/**
 * Server Action: Mengambil ringkasan pesan masuk belum terbaca untuk Global Notification System
 */
export async function getUnreadMessagesSummary(): Promise<{
  success: boolean;
  totalUnread: number;
  currentUserId?: string | null;
  unreadList: IncomingMessageNotificationItem[];
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: true,
        totalUnread: 0,
        currentUserId: null,
        unreadList: [],
      };
    }

    const currentUserId = user.id;

    // Ambil pesan pribadi yang belum dibaca (is_read = false) untuk user saat ini
    const { data: unreadRows, error } = await supabase
      .from("pesan_pribadi")
      .select("id, sender_id, receiver_id, pesan, created_at, is_read")
      .eq("receiver_id", currentUserId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error || !unreadRows || unreadRows.length === 0) {
      return {
        success: true,
        totalUnread: 0,
        currentUserId,
        unreadList: [],
      };
    }

    const totalUnread = unreadRows.length;
    const senderIds = Array.from(new Set(unreadRows.map((r) => r.sender_id)));

    // Fetch sender profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, email, nomor_hp, avatar_url, is_super_admin")
      .in("id", senderIds);

    const profileMap: Record<string, any> = {};
    if (profiles) {
      profiles.forEach((p) => {
        profileMap[p.id] = p;
      });
    }

    // Pastikan Bot Jarimas
    if (senderIds.includes(JARIMAS_BOT_ID) && !profileMap[JARIMAS_BOT_ID]) {
      profileMap[JARIMAS_BOT_ID] = {
        id: JARIMAS_BOT_ID,
        nama_lengkap: JARIMAS_BOT_NAME,
        email: "official@jarimas.id",
        is_super_admin: false,
        avatar_url: null,
      };
    }

    // Fetch affiliations for senders
    const { data: affiliations } = await supabase
      .from("anggota_komunitas")
      .select(`
        user_id,
        peran,
        komunitas (
          id,
          nama,
          jenis
        )
      `)
      .in("user_id", senderIds)
      .eq("status", "approved");

    const affMap: Record<string, string> = {};
    if (affiliations) {
      affiliations.forEach((a: any) => {
        if (a.user_id && a.komunitas?.nama && !affMap[a.user_id]) {
          affMap[a.user_id] = `${a.peran || "Anggota"} ${a.komunitas.nama}`;
        }
      });
    }

    const unreadList: IncomingMessageNotificationItem[] = unreadRows.map((row) => {
      const isBot = row.sender_id === JARIMAS_BOT_ID;
      const prof = profileMap[row.sender_id];
      const senderName = isBot
        ? JARIMAS_BOT_NAME
        : (prof?.nama_lengkap || "Warga Jarimas");
      const senderRole = isBot
        ? "Layanan Resmi"
        : (affMap[row.sender_id] || "Warga");

      return {
        id: row.id,
        senderId: row.sender_id,
        senderName,
        senderAvatar: prof?.avatar_url || null,
        senderRole,
        senderCommunity: isBot ? "Pusat Bantuan & Notifikasi Warga" : affMap[row.sender_id],
        pesan: row.pesan,
        createdAt: row.created_at,
        partnerUser: {
          id: row.sender_id,
          nama_lengkap: senderName,
          email: prof?.email || null,
          nomor_hp: prof?.nomor_hp || null,
          avatar_url: prof?.avatar_url || null,
          is_super_admin: false,
          created_at: row.created_at,
          friendship_status: isBot ? "accepted" : "none",
        },
      };
    });

    return {
      success: true,
      totalUnread,
      currentUserId,
      unreadList,
    };
  } catch (err: any) {
    console.error("Error getUnreadMessagesSummary:", err);
    return {
      success: false,
      totalUnread: 0,
      unreadList: [],
    };
  }
}

/**
 * Server Action: Mengambil profil lengkap user target untuk instant open chat modal
 */
export async function getUserProfileForChat(targetUserId: string): Promise<{
  success: boolean;
  user: RegisteredUserItem | null;
}> {
  try {
    const supabase = await createClient();

    if (targetUserId === JARIMAS_BOT_ID) {
      await ensureJarimasBotProfile(supabase);
      return {
        success: true,
        user: {
          id: JARIMAS_BOT_ID,
          nama_lengkap: JARIMAS_BOT_NAME,
          email: "official@jarimas.id",
          nomor_hp: null,
          avatar_url: null,
          is_super_admin: false,
          created_at: new Date().toISOString(),
          komunitas_list: [
            {
              id: "jarimas-official",
              nama: "Pusat Layanan & Bantuan Jarimas",
              jenis: "warga_kita",
              peran: "Layanan Resmi",
            },
          ],
          friendship_status: "accepted",
        },
      };
    }

    const { data: prof, error } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, email, nomor_hp, avatar_url, is_super_admin, created_at")
      .eq("id", targetUserId)
      .maybeSingle();

    if (error || !prof) {
      return { success: false, user: null };
    }

    // Ambil komunitas
    const { data: affiliations } = await supabase
      .from("anggota_komunitas")
      .select(`
        peran,
        komunitas (
          id,
          nama,
          jenis,
          kecamatan,
          kelurahan,
          rw,
          rt
        )
      `)
      .eq("user_id", targetUserId)
      .eq("status", "approved");

    const komunitasList: UserKomunitasAffiliation[] = (affiliations || [])
      .filter((a: any) => a.komunitas)
      .map((a: any) => ({
        id: a.komunitas.id,
        nama: a.komunitas.nama || "Komunitas",
        jenis: a.komunitas.jenis || "warga_kita",
        peran: a.peran || "Anggota",
        kecamatan: a.komunitas.kecamatan,
        kelurahan: a.komunitas.kelurahan,
        rw: a.komunitas.rw,
        rt: a.komunitas.rt,
      }));

    return {
      success: true,
      user: {
        id: prof.id,
        nama_lengkap: prof.nama_lengkap || "Warga",
        email: prof.email,
        nomor_hp: prof.nomor_hp,
        avatar_url: prof.avatar_url,
        is_super_admin: false,
        created_at: prof.created_at || new Date().toISOString(),
        komunitas_list: komunitasList,
        friendship_status: "accepted",
      },
    };
  } catch (err: any) {
    console.error("Error getUserProfileForChat:", err);
    return { success: false, user: null };
  }
}

/**
 * Server Action: Menandai seluruh pesan dari pengirim tertentu sebagai terbaca
 */
export async function markConversationAsRead(senderId: string): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "Belum login." };
    }

    const { error } = await supabase
      .from("pesan_pribadi")
      .update({ is_read: true })
      .eq("sender_id", senderId)
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/kabar");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Error markConversationAsRead:", err);
    return { success: false, message: err?.message };
  }
}

/**
 * Server Action: Mengambil ringkasan rekapitulasi partisipasi warga:
 * 1. Jumlah warga yang telah registrasi di Jarimas-ID
 * 2. Jumlah warga yang telah tergabung dalam Komunitas Posyandu
 * 3. Jumlah warga yang telah tergabung dalam Komunitas PAUD (Satuan PAUD)
 */
export async function getRekapitulasiWargaKomunitas(): Promise<
  import("@/types/database").RekapitulasiWargaKomunitasResult
> {
  try {
    const supabase = await createClient();

    // 1. Total Pengguna yang telah registrasi (Kecualikan bot resmi Jarimas)
    const { count: userCount, error: userErr } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .neq("id", JARIMAS_BOT_ID);

    if (userErr) {
      console.warn("Gagal menghitung profiles registrasi:", userErr.message);
    }

    // 2. Ambil seluruh data keanggotaan komunitas yang berstatus approved
    const { data: memberships, error: memErr } = await supabase
      .from("anggota_komunitas")
      .select(`
        user_id,
        komunitas_id,
        status,
        komunitas (
          id,
          jenis
        )
      `)
      .eq("status", "approved");

    if (memErr) {
      console.warn("Gagal mengambil keanggotaan komunitas:", memErr.message);
    }

    const posyanduUserSet = new Set<string>();
    const paudUserSet = new Set<string>();
    const wargaKitaUserSet = new Set<string>();
    const posyanduIdSet = new Set<string>();
    const paudIdSet = new Set<string>();

    if (memberships) {
      memberships.forEach((m: any) => {
        if (!m.user_id || !m.komunitas) return;
        const jenis = m.komunitas.jenis;
        if (jenis === "posyandu") {
          posyanduUserSet.add(m.user_id);
          if (m.komunitas.id) posyanduIdSet.add(m.komunitas.id);
        } else if (jenis === "satuan_paud") {
          paudUserSet.add(m.user_id);
          if (m.komunitas.id) paudIdSet.add(m.komunitas.id);
        } else {
          wargaKitaUserSet.add(m.user_id);
        }
      });
    }

    return {
      totalRegisteredUsers: userCount || 0,
      totalWargaPosyandu: posyanduUserSet.size,
      totalWargaPaud: paudUserSet.size,
      totalKomunitasPosyandu: posyanduIdSet.size,
      totalKomunitasPaud: paudIdSet.size,
      totalWargaWargaKita: wargaKitaUserSet.size,
    };
  } catch (err) {
    console.error("Error getRekapitulasiWargaKomunitas:", err);
    return {
      totalRegisteredUsers: 0,
      totalWargaPosyandu: 0,
      totalWargaPaud: 0,
      totalKomunitasPosyandu: 0,
      totalKomunitasPaud: 0,
      totalWargaWargaKita: 0,
    };
  }
}


