"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { formatPeranDisplay, toValidUUID, isRoleAdmin } from "@/lib/utils";
import { findOrGenerateKomunitasSeed } from "@/lib/constants/tegal-data";
import {
  computeTierAndApprover,
  checkUserCanApproveItem,
} from "@/lib/admin-helpers";
import type { PendingApprovalItem } from "@/types/database";

/**
 * Helper internal untuk memverifikasi hak akses pengguna (Super Admin atau Admin/Pengurus Komunitas)
 */
async function getAuthenticatedUserContext() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Akses tidak sah: Anda harus masuk terlebih dahulu.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_super_admin, nama_lengkap, email, nomor_hp")
    .eq("id", user.id)
    .maybeSingle();

  const isSuperAdmin = profile?.is_super_admin === true;

  // Ambil data komunitas di mana pengguna merupakan Admin/Pengurus/Kader aktif
  let userAdminKomunitas: any[] = [];
  if (!isSuperAdmin) {
    const { data: myAdminMemberships } = await supabase
      .from("anggota_komunitas")
      .select("komunitas_id, peran, status")
      .eq("user_id", user.id)
      .eq("status", "approved");

    const adminKomIds = (myAdminMemberships || [])
      .filter((m) => {
        const p = (m.peran || "").toLowerCase();
        return (
          p.includes("pengurus") ||
          p.includes("kader") ||
          p.includes("admin") ||
          p.includes("ketua") ||
          p.includes("pengelola") ||
          p.includes("pimpinan") ||
          p.includes("tenaga medis")
        );
      })
      .map((m) => m.komunitas_id);

    if (adminKomIds.length > 0) {
      const { data: komList } = await supabase
        .from("komunitas")
        .select("id, nama, jenis, kecamatan, kelurahan, rw, rt, lokasi")
        .in("id", adminKomIds);

      const komMap = new Map((komList || []).map((k) => [k.id, k]));
      userAdminKomunitas = adminKomIds.map((kId) => {
        const k = komMap.get(kId);
        const seed = findOrGenerateKomunitasSeed(kId);
        return {
          id: kId,
          nama: k?.nama || seed?.nama || "Komunitas",
          jenis: k?.jenis || seed?.jenis || "posyandu",
          kecamatan: k?.kecamatan || seed?.kecamatan || "",
          kelurahan: k?.kelurahan || seed?.kelurahan || "",
          rw: k?.rw || seed?.rw || "",
          rt: k?.rt || seed?.rt || "",
          lokasi: k?.lokasi || seed?.lokasi || "",
        };
      });
    }
  }

  return { supabase, user, profile, isSuperAdmin, userAdminKomunitas };
}

/**
 * Server Action: Mengambil seluruh permohonan anggota / admin komunitas yang membutuhkan persetujuan
 * - Termasuk pendaftaran baru (status: 'pending')
 * - Termasuk pengajuan peran Admin/Penduduk/Pendatang (peran_diajukan is not null)
 * - Untuk Super Admin: Menampilkan seluruh permohonan
 * - Untuk Admin RW/Kelurahan/Kecamatan/RT/Posyandu/PAUD: Menampilkan permohonan sesuai wilayah kewenangannya
 */
export async function getPendingApprovals(): Promise<{
  success: boolean;
  message?: string;
  data: PendingApprovalItem[];
  allHierarchyItems?: PendingApprovalItem[];
  isSuperAdmin: boolean;
}> {
  try {
    const { supabase, isSuperAdmin, userAdminKomunitas } =
      await getAuthenticatedUserContext();

    // 1. Ambil data permohonan dengan status pending ATAU memiliki peran_diajukan
    const [resPending, resPeranDiajukan] = await Promise.all([
      supabase
        .from("anggota_komunitas")
        .select(
          "id, user_id, komunitas_id, peran, peran_diajukan, status, created_at, berdomisili, kk_terdaftar"
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
      supabase
        .from("anggota_komunitas")
        .select(
          "id, user_id, komunitas_id, peran, peran_diajukan, status, created_at, berdomisili, kk_terdaftar"
        )
        .not("peran_diajukan", "is", null)
        .neq("peran_diajukan", "")
        .order("created_at", { ascending: false }),
    ]);

    const combinedMap = new Map<string, any>();
    (resPending.data || []).forEach((row) => combinedMap.set(row.id, row));
    (resPeranDiajukan.data || []).forEach((row) => combinedMap.set(row.id, row));

    const rawPending = Array.from(combinedMap.values()).filter((row) => {
      // Saring jika record sudah approved dan tidak memiliki peran_diajukan baru
      if (
        row.status === "approved" &&
        (!row.peran_diajukan ||
          row.peran_diajukan.trim() === "" ||
          row.peran_diajukan.toLowerCase() === row.peran.toLowerCase())
      ) {
        return false;
      }
      return true;
    });

    if (rawPending.length === 0) {
      return {
        success: true,
        data: [],
        isSuperAdmin,
      };
    }

    const userIds = [
      ...new Set(rawPending.map((r: any) => r.user_id).filter(Boolean)),
    ];
    const komIds = [
      ...new Set(rawPending.map((r: any) => r.komunitas_id).filter(Boolean)),
    ];

    const { data: profilesData } =
      userIds.length > 0
        ? await supabase
            .from("profiles")
            .select("id, nama_lengkap, email, nomor_hp")
            .in("id", userIds)
        : { data: [] };

    const { data: komData } =
      komIds.length > 0
        ? await supabase
            .from("komunitas")
            .select("id, nama, jenis, kecamatan, kelurahan, rw, rt, lokasi")
            .in("id", komIds)
        : { data: [] };

    const profileMap = new Map((profilesData || []).map((p: any) => [p.id, p]));
    const komMap = new Map((komData || []).map((k: any) => [k.id, k]));

    // Normalisasi struktur data dan hitung Tier & Approver
    const allItems: PendingApprovalItem[] = rawPending.map((row: any) => {
      const prof = profileMap.get(row.user_id);
      let kom = komMap.get(row.komunitas_id);

      // Fallback seed generator jika komunitas belum ada di database
      if (!kom) {
        const seed = findOrGenerateKomunitasSeed(row.komunitas_id);
        if (seed) {
          kom = {
            id: toValidUUID(seed.id),
            nama: seed.nama,
            jenis: seed.jenis,
            kecamatan: seed.kecamatan,
            kelurahan: seed.kelurahan,
            rw: seed.rw,
            rt: seed.rt,
            lokasi: seed.lokasi,
          };
        }
      }

      const namaKomunitas = kom?.nama || "Komunitas Tegal";
      const jenisKomunitas = kom?.jenis || "warga_kita";
      const lokasiKomunitas =
        kom?.lokasi ||
        [kom?.kelurahan, kom?.kecamatan, "Kota Tegal"]
          .filter(Boolean)
          .join(", ") ||
        "Kota Tegal";

      const effectiveRole = row.peran_diajukan || row.peran;
      const { tierLevel, targetApproverTitle } = computeTierAndApprover(
        kom,
        row.peran_diajukan,
        row.peran
      );

      const targetItemForPermCheck = {
        komunitas_id: row.komunitas_id,
        peran_diajukan: row.peran_diajukan,
        peran: row.peran,
        komunitas: kom,
      };

      const canApprove = checkUserCanApproveItem({
        isSuperAdmin,
        userAdminKomunitas,
        targetItem: targetItemForPermCheck,
      });

      return {
        id: row.id,
        user_id: row.user_id,
        komunitas_id: row.komunitas_id,
        peran: formatPeranDisplay(effectiveRole),
        peran_diajukan: row.peran_diajukan || null,
        status: row.status,
        created_at: row.created_at,
        tierLevel,
        targetApproverTitle,
        berdomisili: row.berdomisili,
        kk_terdaftar: row.kk_terdaftar,
        canApprove,
        profiles: {
          id: row.user_id,
          nama_lengkap: prof?.nama_lengkap || "Pengguna JARIMAS",
          email: prof?.email || "-",
          nomor_hp: prof?.nomor_hp || null,
          avatar_url: null,
        },
        komunitas: {
          id: row.komunitas_id,
          nama: namaKomunitas,
          jenis: jenisKomunitas,
          lokasi: lokasiKomunitas,
          kecamatan: kom?.kecamatan || null,
          kelurahan: kom?.kelurahan || null,
          rw: kom?.rw || null,
          rt: kom?.rt || null,
        },
      };
    });

    // 1. Primary Approvals:
    // - Jika Super Admin: Hanya tampilkan permohonan yang menjadi wewenang langsung Super Admin
    //   (yaitu Admin Kecamatan & Posyandu / PAUD / Komunitas Umum)
    // - Jika Community Admin: Hanya tampilkan yang memiliki hak akses approval sesuai tingkatannya
    const primaryApprovals = isSuperAdmin
      ? allItems.filter(
          (item) =>
            item.tierLevel === "Kecamatan" ||
            item.komunitas?.jenis !== "warga_kita"
        )
      : allItems.filter((item) => item.canApprove);

    return {
      success: true,
      data: primaryApprovals,
      allHierarchyItems: isSuperAdmin ? allItems : [],
      isSuperAdmin,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Terjadi kesalahan saat memuat daftar persetujuan.",
      data: [],
      allHierarchyItems: [],
      isSuperAdmin: false,
    };
  }
}

/**
 * Server Action: Menyetujui permohonan peran anggota komunitas (Super Admin atau Admin Berjenjang)
 */
export async function approveMemberRole(anggotaId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { supabase, user, isSuperAdmin, userAdminKomunitas } =
      await getAuthenticatedUserContext();

    if (!anggotaId) {
      return {
        success: false,
        message: "ID Anggota tidak valid.",
      };
    }

    // Ambil data permohonan yang dituju
    const { data: memberTarget, error: fetchErr } = await supabase
      .from("anggota_komunitas")
      .select("id, user_id, komunitas_id, peran, peran_diajukan, status")
      .eq("id", anggotaId)
      .single();

    if (fetchErr || !memberTarget) {
      return {
        success: false,
        message: "Data permohonan tidak ditemukan.",
      };
    }

    // Ambil info komunitas target
    const { data: targetKom } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, rw, rt")
      .eq("id", memberTarget.komunitas_id)
      .maybeSingle();

    const komInfo =
      targetKom || findOrGenerateKomunitasSeed(memberTarget.komunitas_id);

    // Cek otorisasi berdasarkan hierarki
    const canApprove = checkUserCanApproveItem({
      isSuperAdmin,
      userAdminKomunitas,
      targetItem: {
        komunitas_id: memberTarget.komunitas_id,
        peran_diajukan: memberTarget.peran_diajukan,
        peran: memberTarget.peran,
        komunitas: komInfo,
      },
    });

    if (!canApprove) {
      return {
        success: false,
        message:
          "Akses ditolak: Anda tidak memiliki wewenang untuk menyetujui permohonan ini pada tingkat hierarki ini.",
      };
    }

    const targetPeran = memberTarget.peran_diajukan || memberTarget.peran;

    // Tentukan write client (Admin Client jika Service Role Key tersedia, atau user supabase client)
    const adminClient = createAdminClient();
    const writeClient = adminClient || supabase;

    let updateSuccess = false;

    // 1. Coba via RPC hierarkis jika menggunakan user client biasa
    if (!adminClient) {
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc(
          "approve_member_role_hierarchical",
          {
            p_member_id: anggotaId,
            p_target_role: targetPeran,
          }
        );

        if (!rpcErr && rpcRes) {
          const resObj = typeof rpcRes === "string" ? JSON.parse(rpcRes) : rpcRes;
          if (resObj && resObj.success) {
            updateSuccess = true;
          }
        }
      } catch {
        // Fallback ke direct update
      }
    }

    // 2. Direct update jika RPC tidak tersedia atau jika menggunakan adminClient
    if (!updateSuccess) {
      const { data: updatedRows, error: updateError } = await writeClient
        .from("anggota_komunitas")
        .update({
          peran: targetPeran,
          peran_diajukan: null,
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", anggotaId)
        .select("id");

      if (updateError) {
        return {
          success: false,
          message: "Gagal menyetujui permohonan: " + updateError.message,
        };
      }

      if (!updatedRows || updatedRows.length === 0) {
        return {
          success: false,
          message:
            "Perubahan dibatasi oleh kebijakan keamanan (RLS) Supabase. Mohon terapkan skrip SQL Hierarki Admin di Supabase SQL Editor atau tambahkan SUPABASE_SERVICE_ROLE_KEY di server.",
        };
      }
    }

    // Jika permohonan merupakan peran Admin ("Pengurus"), pastikan aturan Satu Komunitas Satu Admin:
    // 1. Bersihkan pengajuan peran Admin lainnya yang masih pending pada komunitas terkait dari user lain
    // 2. Bersihkan juga status pending ("Penduduk" / "Pengurus") pada keanggotaan lain milik user ini
    if (targetPeran === "Pengurus" || isRoleAdmin(targetPeran)) {
      try {
        await writeClient
          .from("anggota_komunitas")
          .update({
            peran_diajukan: null,
            updated_at: new Date().toISOString(),
          })
          .eq("komunitas_id", memberTarget.komunitas_id)
          .eq("peran_diajukan", "Pengurus")
          .neq("id", anggotaId);

        await writeClient
          .from("anggota_komunitas")
          .update({
            peran_diajukan: null,
            status: "approved",
            peran: "Penduduk",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", memberTarget.user_id)
          .neq("id", anggotaId)
          .eq("peran", "Pengunjung");
      } catch (cleanErr) {
        console.warn(
          "Notice clearing competing admin applications & syncing user memberships:",
          cleanErr
        );
      }
    }

    // Jika permohonan merupakan peran warga di RT ("Penduduk" / "Pendatang"),
    // sinkronkan juga perannya di tingkat RW, Kelurahan, dan Kecamatan jika ada
    if (
      komInfo &&
      komInfo.jenis === "warga_kita" &&
      komInfo.rt &&
      targetPeran !== "Pengurus"
    ) {
      try {
        const { data: otherWargaMemberships } = await writeClient
          .from("anggota_komunitas")
          .select("id, komunitas_id, peran_diajukan")
          .eq("user_id", memberTarget.user_id);

        if (otherWargaMemberships && otherWargaMemberships.length > 0) {
          const otherIds = (otherWargaMemberships as Array<{ id: string; peran_diajukan?: string | null }>)
            .filter((m: { id: string; peran_diajukan?: string | null }) => m.id !== anggotaId && m.peran_diajukan)
            .map((m: { id: string }) => m.id);

          if (otherIds.length > 0) {
            await writeClient
              .from("anggota_komunitas")
              .update({
                peran: targetPeran,
                peran_diajukan: null,
                status: "approved",
                updated_at: new Date().toISOString(),
              })
              .in("id", otherIds);
          }
        }
      } catch {
        // Abaikan jika cascade sync role gagal
      }
    }

    revalidatePath("/profil");
    revalidatePath("/komunitas");
    revalidatePath(`/komunitas/${memberTarget.komunitas_id}`);
    revalidatePath(`/komunitas/${toValidUUID(memberTarget.komunitas_id)}`);
    revalidatePath(`/komunitas/${memberTarget.komunitas_id}/anggota`);
    revalidatePath("/admin");
    revalidatePath("/admin/approval");

    return {
      success: true,
      message: `Permohonan peran ${formatPeranDisplay(targetPeran)} berhasil disetujui!`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal menyetujui permohonan.",
    };
  }
}

/**
 * Server Action: Menolak permohonan peran anggota komunitas (Super Admin atau Admin Berjenjang)
 */
export async function rejectMemberRole(anggotaId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { supabase, isSuperAdmin, userAdminKomunitas } =
      await getAuthenticatedUserContext();

    if (!anggotaId) {
      return {
        success: false,
        message: "ID Anggota tidak valid.",
      };
    }

    const { data: memberTarget, error: fetchErr } = await supabase
      .from("anggota_komunitas")
      .select("id, user_id, komunitas_id, peran, peran_diajukan, status")
      .eq("id", anggotaId)
      .single();

    if (fetchErr || !memberTarget) {
      return {
        success: false,
        message: "Data permohonan tidak ditemukan.",
      };
    }

    const { data: targetKom } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, rw, rt")
      .eq("id", memberTarget.komunitas_id)
      .maybeSingle();

    const komInfo =
      targetKom || findOrGenerateKomunitasSeed(memberTarget.komunitas_id);

    const canApprove = checkUserCanApproveItem({
      isSuperAdmin,
      userAdminKomunitas,
      targetItem: {
        komunitas_id: memberTarget.komunitas_id,
        peran_diajukan: memberTarget.peran_diajukan,
        peran: memberTarget.peran,
        komunitas: komInfo,
      },
    });

    if (!canApprove) {
      return {
        success: false,
        message:
          "Akses ditolak: Anda tidak memiliki wewenang untuk menolak permohonan ini pada tingkat hierarki ini.",
      };
    }

    const adminClient = createAdminClient();
    const writeClient = adminClient || supabase;

    let updateSuccess = false;

    // 1. Coba via RPC hierarkis jika menggunakan user client biasa
    if (!adminClient) {
      try {
        const { data: rpcRes, error: rpcErr } = await supabase.rpc(
          "reject_member_role_hierarchical",
          {
            p_member_id: anggotaId,
          }
        );

        if (!rpcErr && rpcRes) {
          const resObj = typeof rpcRes === "string" ? JSON.parse(rpcRes) : rpcRes;
          if (resObj && resObj.success) {
            updateSuccess = true;
          }
        }
      } catch {
        // Fallback ke direct update
      }
    }

    if (!updateSuccess) {
      if (memberTarget.status === "approved" && memberTarget.peran_diajukan) {
        const { data: updatedRows, error: updateErr } = await writeClient
          .from("anggota_komunitas")
          .update({
            peran_diajukan: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", anggotaId)
          .select("id");

        if (updateErr) {
          return {
            success: false,
            message: "Gagal menolak pengajuan peran: " + updateErr.message,
          };
        }

        if (!updatedRows || updatedRows.length === 0) {
          return {
            success: false,
            message:
              "Perubahan dibatasi oleh kebijakan keamanan (RLS) Supabase. Mohon terapkan skrip SQL Hierarki Admin di Supabase SQL Editor.",
          };
        }
      } else {
        const { data: updatedRows, error: updateErr } = await writeClient
          .from("anggota_komunitas")
          .update({
            status: "rejected",
            peran_diajukan: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", anggotaId)
          .select("id");

        if (updateErr) {
          return {
            success: false,
            message: "Gagal menolak permohonan: " + updateErr.message,
          };
        }

        if (!updatedRows || updatedRows.length === 0) {
          return {
            success: false,
            message:
              "Perubahan dibatasi oleh kebijakan keamanan (RLS) Supabase. Mohon terapkan skrip SQL Hierarki Admin di Supabase SQL Editor.",
          };
        }
      }
    }

    revalidatePath("/profil");
    revalidatePath("/komunitas");
    revalidatePath(`/komunitas/${memberTarget.komunitas_id}`);
    revalidatePath(`/komunitas/${memberTarget.komunitas_id}/anggota`);
    revalidatePath("/admin");

    return {
      success: true,
      message: "Permohonan peran anggota telah ditolak.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal menolak permohonan.",
    };
  }
}

/**
 * Server Action: Menghapus seluruh Data Anak & Riwayat Pengukuran DDTK Uji Coba
 * Khusus Super Admin.
 */
export async function cleanupAllDataAnakAction(): Promise<{
  success: boolean;
  message: string;
  deletedCount?: number;
}> {
  try {
    const { supabase, isSuperAdmin } = await getAuthenticatedUserContext();

    if (!isSuperAdmin) {
      return {
        success: false,
        message: "Akses ditolak: Fitur pembersihan data hanya untuk Super Admin.",
      };
    }

    // 1. Hitung jumlah data anak sebelum dihapus
    const { count: initialCount } = await supabase
      .from("data_anak")
      .select("id", { count: "exact", head: true });

    // 2. Hapus seluruh riwayat ddks_records
    await supabase
      .from("ddks_records")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // 3. Hapus seluruh data_anak
    const { error: delErr } = await supabase
      .from("data_anak")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (delErr) {
      throw delErr;
    }

    revalidatePath("/profil");
    revalidatePath("/komunitas");
    revalidatePath("/kabar");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Berhasil membersihkan ${initialCount || 0} Data Anak & seluruh riwayat DDTK uji coba! Database Data Anak kini bersih (0) dan siap untuk pemantauan data uji coba terbaru.`,
      deletedCount: initialCount || 0,
    };
  } catch (err: any) {
    console.error("Error cleanupAllDataAnakAction:", err);
    return {
      success: false,
      message: err.message || "Gagal membersihkan data anak.",
    };
  }
}

/**
 * Server Action: Menghapus seluruh Data Kader & Keanggotaan Komunitas Uji Coba
 * Khusus Super Admin.
 */
export async function cleanupAllKaderAndAnggotaAction(): Promise<{
  success: boolean;
  message: string;
  deletedCount?: number;
}> {
  try {
    const { supabase, isSuperAdmin } = await getAuthenticatedUserContext();

    if (!isSuperAdmin) {
      return {
        success: false,
        message: "Akses ditolak: Fitur pembersihan data hanya untuk Super Admin.",
      };
    }

    // 1. Hitung jumlah keanggotaan sebelum dihapus
    const { count: initialCount } = await supabase
      .from("anggota_komunitas")
      .select("id", { count: "exact", head: true });

    // 2. Hapus seluruh data keanggotaan komunitas uji coba
    const { error: delErr } = await supabase
      .from("anggota_komunitas")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (delErr) {
      throw delErr;
    }

    revalidatePath("/profil");
    revalidatePath("/komunitas");
    revalidatePath("/kabar");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Berhasil membersihkan ${initialCount || 0} data kader dan keanggotaan komunitas uji coba! Seluruh komunitas kini dalam status reset keanggotaan.`,
      deletedCount: initialCount || 0,
    };
  } catch (err: any) {
    console.error("Error cleanupAllKaderAndAnggotaAction:", err);
    return {
      success: false,
      message: err.message || "Gagal membersihkan data kader dan anggota komunitas.",
    };
  }
}

/**
 * Server Action: Pembersihan Total Seluruh Data Uji Coba
 * (Pengguna Non-Admin, Data Anak & DDTK, Kader & Anggota Komunitas, Postingan Kabar Test)
 * Khusus Super Admin.
 */
export async function cleanupAllTestDataAction(): Promise<{
  success: boolean;
  message: string;
  deletedCount?: {
    users: number;
    children: number;
    members: number;
  };
}> {
  try {
    const { supabase, isSuperAdmin, user } = await getAuthenticatedUserContext();

    if (!isSuperAdmin) {
      return {
        success: false,
        message: "Akses ditolak: Fitur pembersihan data massal hanya untuk Super Admin.",
      };
    }

    // 1. Ambil profil non-super admin
    const { data: nonAdminProfiles } = await supabase
      .from("profiles")
      .select("id")
      .or("is_super_admin.is.null,is_super_admin.eq.false");

    const nonAdminIds = (nonAdminProfiles || [])
      .map((p) => p.id)
      .filter((id) => id !== user.id);

    // 2. Bersihkan komentar & reaksi kabar
    await supabase.from("reaksi_kabar").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("komentar_kabar").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 3. Bersihkan postingan kabar non-super admin atau uji coba
    if (nonAdminIds.length > 0) {
      await supabase.from("kabar_jarimas").delete().in("user_id", nonAdminIds);
    }

    // 4. Bersihkan seluruh ddks_records & data_anak uji coba
    const { count: childrenCount } = await supabase
      .from("data_anak")
      .select("id", { count: "exact", head: true });

    await supabase.from("ddks_records").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("data_anak").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 5. Bersihkan seluruh anggota_komunitas uji coba (kader, pengurus, anggota)
    const { count: membersCount } = await supabase
      .from("anggota_komunitas")
      .select("id", { count: "exact", head: true });

    await supabase.from("anggota_komunitas").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // 6. Bersihkan data pesanan market jika ada
    try {
      await supabase.from("market_pesanan").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    } catch {}

    // 7. Bersihkan tabel profiles milik pengguna non-super admin
    if (nonAdminIds.length > 0) {
      await supabase.from("profiles").delete().in("id", nonAdminIds);
    }

    revalidatePath("/profil");
    revalidatePath("/komunitas");
    revalidatePath("/kabar");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Pembersihan menyeluruh berhasil! Dihapus: ${childrenCount || 0} Data Anak & DDTK, ${membersCount || 0} Keanggotaan & Kader, serta ${nonAdminIds.length} Akun Non-Admin.`,
      deletedCount: {
        users: nonAdminIds.length,
        children: childrenCount || 0,
        members: membersCount || 0,
      },
    };
  } catch (err: any) {
    console.error("Error cleanupAllTestDataAction:", err);
    return {
      success: false,
      message: err.message || "Gagal melakukan pembersihan data menyeluruh.",
    };
  }
}

/**
 * Server Action: Menghapus semua data pengguna non-Super Admin (postingan, keanggotaan komunitas, reaksi, komentar, dan profile)
 * Khusus Super Admin terotentikasi.
 */
export async function cleanupNonSuperAdminDataAction(): Promise<{
  success: boolean;
  message: string;
  deletedCount?: number;
}> {
  try {
    const { supabase, isSuperAdmin, user } = await getAuthenticatedUserContext();

    if (!isSuperAdmin) {
      return {
        success: false,
        message: "Akses ditolak: Fitur pembersihan data massal hanya untuk Super Admin.",
      };
    }

    // 1. Ambil seluruh ID pengguna yang BUKAN Super Admin
    const { data: nonAdminProfiles, error: fetchErr } = await supabase
      .from("profiles")
      .select("id")
      .or("is_super_admin.is.null,is_super_admin.eq.false");

    if (fetchErr) {
      return {
        success: false,
        message: "Gagal mengambil daftar pengguna non-admin: " + fetchErr.message,
      };
    }

    const nonAdminIds = (nonAdminProfiles || [])
      .map((p) => p.id)
      .filter((id) => id !== user.id);

    if (nonAdminIds.length === 0) {
      return {
        success: true,
        message: "Tidak ada data pengguna non-Super Admin yang perlu dibersihkan.",
        deletedCount: 0,
      };
    }

    // 2. Bersihkan komentar & reaksi kabar milik user non-super admin
    await supabase.from("reaksi_kabar").delete().in("user_id", nonAdminIds);
    await supabase.from("komentar_kabar").delete().in("user_id", nonAdminIds);

    // 3. Bersihkan postingan kabar_jarimas yang dibuat oleh user non-super admin
    await supabase.from("kabar_jarimas").delete().in("user_id", nonAdminIds);

    // 4. Bersihkan keanggotaan komunitas non-super admin
    await supabase.from("anggota_komunitas").delete().in("user_id", nonAdminIds);

    // 5. Bersihkan data pesanan market non-super admin jika ada
    try {
      await supabase.from("market_pesanan").delete().in("user_id", nonAdminIds);
    } catch {
      // Abaikan jika tabel market_pesanan belum ada
    }

    // 6. Hapus data anak & ddks records yang diinput oleh user non-super admin
    try {
      // Hapus data anak milik user non-super admin
      const { data: userChildren } = await supabase
        .from("data_anak")
        .select("id")
        .in("created_by", nonAdminIds);

      const userChildrenIds = (userChildren || []).map((c) => c.id);
      if (userChildrenIds.length > 0) {
        await supabase.from("ddks_records").delete().in("data_anak_id", userChildrenIds);
        await supabase.from("data_anak").delete().in("id", userChildrenIds);
      }

      await supabase
        .from("ddks_records")
        .delete()
        .in("recorded_by", nonAdminIds);
    } catch (cleanChildErr) {
      console.warn("Notice clean child data of non-admin:", cleanChildErr);
    }

    // 7. Bersihkan tabel profiles milik user non-super admin
    const { error: deleteProfilesErr } = await supabase
      .from("profiles")
      .delete()
      .in("id", nonAdminIds);

    if (deleteProfilesErr) {
      console.warn("Notice delete profiles:", deleteProfilesErr.message);
    }

    revalidatePath("/profil");
    revalidatePath("/komunitas");
    revalidatePath("/kabar");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Berhasil membersihkan data ${nonAdminIds.length} pengguna non-Super Admin beserta postingan kabar, data anak, dan keikutsertaan komunitasnya!`,
      deletedCount: nonAdminIds.length,
    };
  } catch (err: any) {
    console.error("Error cleanupNonSuperAdminDataAction:", err);
    return {
      success: false,
      message: err.message || "Gagal melakukan pembersihan data pengguna.",
    };
  }
}


