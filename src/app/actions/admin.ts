"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import {
  formatPeranDisplay,
  toValidUUID,
  isRoleAdmin,
  isSuperAdmin as checkIsSuperAdmin,
  isAdminPusat as checkIsAdminPusat,
  isSuperOrAdminPusat as checkIsSuperOrAdminPusat,
  isProtectedSuperAdmin,
} from "@/lib/utils";
import { findOrGenerateKomunitasSeed } from "@/lib/constants/tegal-data";
import {
  computeTierAndApprover,
  checkUserCanApproveItem,
  checkUserCanAssignAdminRole,
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
    .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email, nomor_hp")
    .eq("id", user.id)
    .maybeSingle();

  const userFullProfile = {
    ...profile,
    id: user.id,
    email: profile?.email || user.email,
    nama_lengkap:
      profile?.nama_lengkap ||
      user.user_metadata?.nama_lengkap ||
      user.email?.split("@")[0] ||
      "Pengguna JARIMAS",
  };

  const isSuperAdmin = checkIsSuperAdmin(userFullProfile);
  const isAdminPusat = !isSuperAdmin && checkIsAdminPusat(userFullProfile);
  const isSuperOrAdminPusat = isSuperAdmin || isAdminPusat;

  // Auto-sync Super Admin status in DB
  if (isSuperAdmin && profile?.is_super_admin !== true) {
    try {
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          nama_lengkap: userFullProfile.nama_lengkap,
          email: userFullProfile.email,
          is_super_admin: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    } catch (err) {
      console.warn("Auto-sync super admin profile error in admin action:", err);
    }
  }

  // Auto-sync Admin Pusat status in DB
  if (isAdminPusat && profile?.is_admin_pusat !== true) {
    try {
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          nama_lengkap: userFullProfile.nama_lengkap,
          email: userFullProfile.email,
          is_admin_pusat: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    } catch (err) {
      console.warn("Auto-sync admin pusat profile error in admin action:", err);
    }
  }


  // Ambil data komunitas di mana pengguna merupakan Admin/Pengurus/Kader aktif
  let userAdminKomunitas: any[] = [];
  if (!isSuperOrAdminPusat) {
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
          p.includes("kepala") ||
          p.includes("guru") ||
          p.includes("pendidik") ||
          p.includes("tutor") ||
          p.includes("tenaga medis") ||
          p.includes("tenaga kesehatan") ||
          p.includes("plkb") ||
          p.includes("pkk")
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

  return { supabase, user, profile, isSuperAdmin, isAdminPusat, isSuperOrAdminPusat, userAdminKomunitas };
}

/**
 * Server Action: Mengambil seluruh permohonan anggota / admin komunitas yang membutuhkan persetujuan
 * - Termasuk pendaftaran baru (status: 'pending')
 * - Termasuk pengajuan peran Admin/Penduduk/Pendatang (peran_diajukan is not null)
 * - Untuk Super Admin / Admin Pusat: Menampilkan seluruh permohonan
 * - Untuk Admin RW/Kelurahan/Kecamatan/RT/Posyandu/PAUD: Menampilkan permohonan sesuai wilayah kewenangannya
 */
export async function getPendingApprovals(): Promise<{
  success: boolean;
  message?: string;
  data: PendingApprovalItem[];
  allHierarchyItems?: PendingApprovalItem[];
  isSuperAdmin: boolean;
  isAdminPusat?: boolean;
}> {
  try {
    const { supabase, isSuperAdmin, isAdminPusat, isSuperOrAdminPusat, userAdminKomunitas } =
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
        isAdminPusat,
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
    // - Jika Super Admin / Admin Pusat: Tampilkan seluruh permohonan
    // - Jika Community Admin: Tampilkan permohonan yang sesuai wewenangnya
    const primaryApprovals = isSuperOrAdminPusat
      ? allItems
      : allItems.filter((item) => item.canApprove);

    return {
      success: true,
      data: primaryApprovals,
      allHierarchyItems: isSuperOrAdminPusat ? allItems : [],
      isSuperAdmin,
      isAdminPusat,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Terjadi kesalahan saat memuat daftar persetujuan.",
      data: [],
      allHierarchyItems: [],
      isSuperAdmin: false,
      isAdminPusat: false,
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
    const { supabase, user, isSuperAdmin, isAdminPusat, userAdminKomunitas } =
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
      isAdminPusat,
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
    const approvePayload = {
      peran: targetPeran,
      peran_diajukan: null,
      status: "approved",
      updated_at: new Date().toISOString(),
    };

    let updateSuccess = false;
    let lastErrorMessage = "";
    let activeWriteClient = supabase;

    // 1. Coba via adminClient (Service Role) jika tersedia
    const adminClient = createAdminClient();
    if (adminClient) {
      try {
        const { data: adminRows, error: adminErr } = await adminClient
          .from("anggota_komunitas")
          .update(approvePayload)
          .eq("id", anggotaId)
          .select("id");

        if (!adminErr && adminRows && adminRows.length > 0) {
          updateSuccess = true;
          activeWriteClient = adminClient;
        } else if (adminErr) {
          console.warn(
            "adminClient update error in approveMemberRole, falling back to authenticated user client:",
            adminErr.message
          );
          lastErrorMessage = adminErr.message;
        }
      } catch (adminEx: any) {
        console.warn("adminClient exception in approveMemberRole, falling back:", adminEx);
        lastErrorMessage = adminEx?.message || "";
      }
    }

    // 2. Coba via RPC hierarkis (SECURITY DEFINER)
    if (!updateSuccess) {
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
          } else if (resObj && resObj.message) {
            lastErrorMessage = resObj.message;
          }
        } else if (rpcErr) {
          console.warn("RPC approve error, falling back to direct supabase update:", rpcErr.message);
          lastErrorMessage = rpcErr.message;
        }
      } catch (rpcEx: any) {
        lastErrorMessage = rpcEx?.message || "";
      }
    }

    // 3. Coba direct update dengan client terautentikasi pengguna
    if (!updateSuccess) {
      try {
        const { data: userRows, error: userErr } = await supabase
          .from("anggota_komunitas")
          .update(approvePayload)
          .eq("id", anggotaId)
          .select("id");

        if (!userErr && userRows && userRows.length > 0) {
          updateSuccess = true;
        } else if (userErr) {
          lastErrorMessage = userErr.message;
        }
      } catch (userEx: any) {
        lastErrorMessage = userEx?.message || "";
      }
    }

    if (!updateSuccess) {
      return {
        success: false,
        message:
          "Gagal menyetujui permohonan: " +
          (lastErrorMessage ? lastErrorMessage : "Perubahan dibatasi oleh kebijakan keamanan (RLS) Supabase. Mohon terapkan skrip SQL Hierarki Admin di Supabase SQL Editor."),
      };
    }

    // Jika permohonan merupakan peran Admin ("Pengurus"), pastikan aturan Satu Komunitas Satu Admin:
    // 1. Bersihkan pengajuan peran Admin lainnya yang masih pending pada komunitas terkait dari user lain
    // 2. Bersihkan juga status pending ("Penduduk" / "Pengurus") pada keanggotaan lain milik user ini
    if (targetPeran === "Pengurus" || isRoleAdmin(targetPeran)) {
      try {
        await activeWriteClient
          .from("anggota_komunitas")
          .update({
            peran_diajukan: null,
            updated_at: new Date().toISOString(),
          })
          .eq("komunitas_id", memberTarget.komunitas_id)
          .eq("peran_diajukan", memberTarget.peran_diajukan || targetPeran)
          .neq("id", anggotaId);

        if (komInfo?.jenis === "warga_kita") {
          await activeWriteClient
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
        }
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
        const { data: otherWargaMemberships } = await activeWriteClient
          .from("anggota_komunitas")
          .select("id, komunitas_id, peran_diajukan")
          .eq("user_id", memberTarget.user_id);

        if (otherWargaMemberships && otherWargaMemberships.length > 0) {
          const otherIds = (otherWargaMemberships as Array<{ id: string; peran_diajukan?: string | null }>)
            .filter((m: { id: string; peran_diajukan?: string | null }) => m.id !== anggotaId && m.peran_diajukan)
            .map((m: { id: string }) => m.id);

          if (otherIds.length > 0) {
            await activeWriteClient
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
    const { supabase, isSuperAdmin, isAdminPusat, userAdminKomunitas } =
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
      isAdminPusat,
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

    const isExistingApproved =
      memberTarget.status === "approved" && Boolean(memberTarget.peran_diajukan);
    const updatePayload = isExistingApproved
      ? {
          peran_diajukan: null,
          updated_at: new Date().toISOString(),
        }
      : {
          status: "rejected",
          peran_diajukan: null,
          updated_at: new Date().toISOString(),
        };

    let updateSuccess = false;
    let lastErrorMessage = "";

    // 1. Coba via adminClient (Service Role) jika tersedia
    const adminClient = createAdminClient();
    if (adminClient) {
      try {
        const { data: adminRows, error: adminErr } = await adminClient
          .from("anggota_komunitas")
          .update(updatePayload)
          .eq("id", anggotaId)
          .select("id");

        if (!adminErr && adminRows && adminRows.length > 0) {
          updateSuccess = true;
        } else if (adminErr) {
          console.warn(
            "adminClient update error in rejectMemberRole, falling back to authenticated user client:",
            adminErr.message
          );
          lastErrorMessage = adminErr.message;
        }
      } catch (adminEx: any) {
        console.warn("adminClient exception in rejectMemberRole, falling back:", adminEx);
        lastErrorMessage = adminEx?.message || "";
      }
    }

    // 2. Coba via RPC hierarkis (SECURITY DEFINER) menggunakan client terautentikasi pengguna
    if (!updateSuccess) {
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
          } else if (resObj && resObj.message) {
            lastErrorMessage = resObj.message;
          }
        } else if (rpcErr) {
          console.warn("RPC reject error, falling back to direct supabase update:", rpcErr.message);
          lastErrorMessage = rpcErr.message;
        }
      } catch (rpcEx: any) {
        lastErrorMessage = rpcEx?.message || "";
      }
    }

    // 3. Coba direct update dengan client terautentikasi pengguna
    if (!updateSuccess) {
      try {
        const { data: userRows, error: userErr } = await supabase
          .from("anggota_komunitas")
          .update(updatePayload)
          .eq("id", anggotaId)
          .select("id");

        if (!userErr && userRows && userRows.length > 0) {
          updateSuccess = true;
        } else if (userErr) {
          lastErrorMessage = userErr.message;
        }
      } catch (userEx: any) {
        lastErrorMessage = userEx?.message || "";
      }
    }

    if (!updateSuccess) {
      return {
        success: false,
        message:
          "Gagal menolak pengajuan peran: " +
          (lastErrorMessage
            ? lastErrorMessage
            : "Perubahan dibatasi oleh kebijakan keamanan (RLS) Supabase. Mohon terapkan skrip SQL Hierarki Admin di Supabase SQL Editor."),
      };
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
 * Server Action: Menghapus seluruh Data Anak Uji Coba
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

    const adminClient = createAdminClient();
    const client = adminClient || supabase;

    // 1. Ambil seluruh ID data anak yang ada di database
    const { data: allChildren } = await client
      .from("data_anak")
      .select("id");

    const childIds = (allChildren || []).map((c: any) => c.id).filter(Boolean);

    // 2. Hapus seluruh riwayat ddks_records
    if (childIds.length > 0) {
      await client
        .from("ddks_records")
        .delete()
        .in("data_anak_id", childIds);

      // 3. Hapus seluruh data_anak berdasarkan childIds
      const { error: delErr } = await client
        .from("data_anak")
        .delete()
        .in("id", childIds);

      if (delErr) {
        throw delErr;
      }
    } else {
      await client.from("ddks_records").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await client.from("data_anak").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    // Bersihkan juga orphaned ddks_records jika ada
    try {
      const { data: allDdks } = await client.from("ddks_records").select("id");
      const ddksIds = (allDdks || []).map((d: any) => d.id).filter(Boolean);
      if (ddksIds.length > 0) {
        await client.from("ddks_records").delete().in("id", ddksIds);
      }
    } catch {}

    revalidatePath("/data-anak");
    revalidatePath("/data-ats");
    revalidatePath("/profil");
    revalidatePath("/komunitas");
    revalidatePath("/kabar");
    revalidatePath("/admin");
    revalidatePath("/");

    return {
      success: true,
      message: `Berhasil membersihkan ${childIds.length} Data Anak (PAUD & ATS) uji coba! Database Data Anak kini bersih (0) dan siap untuk pemantauan data uji coba terbaru.`,
      deletedCount: childIds.length,
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

    const adminClient = createAdminClient();
    const client = adminClient || supabase;

    // 1. Ambil seluruh ID anggota komunitas
    const { data: allMembers } = await client
      .from("anggota_komunitas")
      .select("id");

    const memberIds = (allMembers || []).map((m: any) => m.id).filter(Boolean);

    // 2. Hapus seluruh data keanggotaan komunitas uji coba
    if (memberIds.length > 0) {
      const { error: delErr } = await client
        .from("anggota_komunitas")
        .delete()
        .in("id", memberIds);

      if (delErr) {
        throw delErr;
      }
    } else {
      await client
        .from("anggota_komunitas")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
    }

    revalidatePath("/data-anak");
    revalidatePath("/data-ats");
    revalidatePath("/profil");
    revalidatePath("/komunitas");
    revalidatePath("/kabar");
    revalidatePath("/admin");
    revalidatePath("/");

    return {
      success: true,
      message: `Berhasil membersihkan ${memberIds.length} data kader dan keanggotaan komunitas uji coba! Seluruh komunitas kini dalam status reset keanggotaan.`,
      deletedCount: memberIds.length,
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
 * (Pengguna Non-Admin, Data Anak, Kader & Anggota Komunitas, Postingan Kabar Test)
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

    const adminClient = createAdminClient();
    const client = adminClient || supabase;

    // 1. Ambil profil non-super admin
    const { data: nonAdminProfiles } = await client
      .from("profiles")
      .select("id")
      .or("is_super_admin.is.null,is_super_admin.eq.false");

    const nonAdminIds = (nonAdminProfiles || [])
      .map((p: any) => p.id)
      .filter((id: string) => id !== user.id);

    // 2. Bersihkan komentar & reaksi kabar
    try {
      const { data: allReactions } = await client.from("reaksi_kabar").select("id");
      const reactionIds = (allReactions || []).map((r: any) => r.id).filter(Boolean);
      if (reactionIds.length > 0) {
        await client.from("reaksi_kabar").delete().in("id", reactionIds);
      }
    } catch {}

    try {
      const { data: allComments } = await client.from("komentar_kabar").select("id");
      const commentIds = (allComments || []).map((c: any) => c.id).filter(Boolean);
      if (commentIds.length > 0) {
        await client.from("komentar_kabar").delete().in("id", commentIds);
      }
    } catch {}

    // 3. Bersihkan postingan kabar non-super admin
    if (nonAdminIds.length > 0) {
      await client.from("kabar_jarimas").delete().in("user_id", nonAdminIds);
    }

    // 4. Bersihkan seluruh ddks_records & data_anak uji coba (termasuk yang dibuat Super Admin)
    const { data: allChildren } = await client.from("data_anak").select("id");
    const childIds = (allChildren || []).map((c: any) => c.id).filter(Boolean);

    if (childIds.length > 0) {
      await client.from("ddks_records").delete().in("data_anak_id", childIds);
      await client.from("data_anak").delete().in("id", childIds);
    } else {
      await client.from("ddks_records").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await client.from("data_anak").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    // Bersihkan juga orphaned ddks_records jika ada
    try {
      const { data: allDdks } = await client.from("ddks_records").select("id");
      const ddksIds = (allDdks || []).map((d: any) => d.id).filter(Boolean);
      if (ddksIds.length > 0) {
        await client.from("ddks_records").delete().in("id", ddksIds);
      }
    } catch {}

    // 5. Bersihkan seluruh anggota_komunitas uji coba
    const { data: allMembers } = await client.from("anggota_komunitas").select("id");
    const memberIds = (allMembers || []).map((m: any) => m.id).filter(Boolean);

    if (memberIds.length > 0) {
      await client.from("anggota_komunitas").delete().in("id", memberIds);
    } else {
      await client.from("anggota_komunitas").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }

    // 6. Bersihkan data pesanan market jika ada
    try {
      const { data: allOrders } = await client.from("market_pesanan").select("id");
      const orderIds = (allOrders || []).map((o: any) => o.id).filter(Boolean);
      if (orderIds.length > 0) {
        await client.from("market_pesanan").delete().in("id", orderIds);
      }
    } catch {}

    // 7. Bersihkan tabel profiles milik pengguna non-super admin
    if (nonAdminIds.length > 0) {
      await client.from("profiles").delete().in("id", nonAdminIds);
    }

    revalidatePath("/data-anak");
    revalidatePath("/data-ats");
    revalidatePath("/profil");
    revalidatePath("/komunitas");
    revalidatePath("/kabar");
    revalidatePath("/admin");
    revalidatePath("/");

    return {
      success: true,
      message: `Pembersihan menyeluruh berhasil! Dihapus: ${childIds.length} Data Anak, ${memberIds.length} Keanggotaan & Kader, serta ${nonAdminIds.length} Akun Non-Admin.`,
      deletedCount: {
        users: nonAdminIds.length,
        children: childIds.length,
        members: memberIds.length,
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

    const adminClient = createAdminClient();
    const client = adminClient || supabase;

    // 1. Ambil seluruh ID pengguna yang BUKAN Super Admin
    const { data: nonAdminProfiles, error: fetchErr } = await client
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
      .map((p: any) => p.id)
      .filter((id: string) => id !== user.id);

    if (nonAdminIds.length === 0) {
      return {
        success: true,
        message: "Tidak ada data pengguna non-Super Admin yang perlu dibersihkan.",
        deletedCount: 0,
      };
    }

    // 2. Bersihkan komentar & reaksi kabar milik user non-super admin
    try {
      await client.from("reaksi_kabar").delete().in("user_id", nonAdminIds);
      await client.from("komentar_kabar").delete().in("user_id", nonAdminIds);
    } catch {}

    // 3. Bersihkan postingan kabar_jarimas yang dibuat oleh user non-super admin
    try {
      await client.from("kabar_jarimas").delete().in("user_id", nonAdminIds);
    } catch {}

    // 4. Bersihkan keanggotaan komunitas non-super admin
    try {
      await client.from("anggota_komunitas").delete().in("user_id", nonAdminIds);
    } catch {}

    // 5. Bersihkan data pesanan market non-super admin jika ada
    try {
      await client.from("market_pesanan").delete().in("user_id", nonAdminIds);
    } catch {}

    // 6. Hapus data anak & ddks records yang diinput oleh user non-super admin
    try {
      const { data: userChildren } = await client
        .from("data_anak")
        .select("id")
        .in("created_by", nonAdminIds);

      const userChildrenIds = (userChildren || []).map((c: any) => c.id);
      if (userChildrenIds.length > 0) {
        await client.from("ddks_records").delete().in("data_anak_id", userChildrenIds);
        await client.from("data_anak").delete().in("id", userChildrenIds);
      }

      await client
        .from("ddks_records")
        .delete()
        .in("recorded_by", nonAdminIds);
    } catch (cleanChildErr) {
      console.warn("Notice clean child data of non-admin:", cleanChildErr);
    }

    // 7. Bersihkan tabel profiles milik user non-super admin
    const { error: deleteProfilesErr } = await client
      .from("profiles")
      .delete()
      .in("id", nonAdminIds);

    if (deleteProfilesErr) {
      console.warn("Notice delete profiles:", deleteProfilesErr.message);
    }

    revalidatePath("/data-anak");
    revalidatePath("/data-ats");
    revalidatePath("/profil");
    revalidatePath("/komunitas");
    revalidatePath("/kabar");
    revalidatePath("/admin");
    revalidatePath("/");

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

/**
 * Server Action: Mengangkat atau Mencabut peran Admin Pusat
 * Aturan Mutlak:
 * - HANYA Super Admin yang berhak menetapkan atau mencabut Admin Pusat.
 * - Akun Super Admin tidak bisa dicabut atau diubah statusnya (Imunitas Super Admin).
 * - Pengangkatan berjenjang: Pengguna harus berstatus admin di bawahnya terlebih dahulu.
 */
export async function toggleAdminPusatRoleAction(
  targetUserId: string,
  newStatus: boolean
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { supabase, isSuperAdmin, user } =
      await getAuthenticatedUserContext();
    const currentUserId = user.id;

    if (!isSuperAdmin) {
      return {
        success: false,
        message:
          "Akses ditolak: Penetapan dan pencabutan status Admin Pusat hanya dapat dilakukan oleh Super Admin.",
      };
    }

    if (!targetUserId) {
      return {
        success: false,
        message: "ID Pengguna target tidak valid.",
      };
    }

    // Ambil data profil target
    const { data: targetProfile, error: fetchErr } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, email, is_super_admin, is_admin_pusat")
      .eq("id", targetUserId)
      .maybeSingle();

    if (fetchErr || !targetProfile) {
      return {
        success: false,
        message: "Profil pengguna target tidak ditemukan.",
      };
    }

    // Proteksi Imunitas Super Admin: Akun Super Admin tidak dapat dicabut
    if (isProtectedSuperAdmin(targetProfile)) {
      return {
        success: false,
        message:
          "Tindakan ditolak: Status Super Admin bersifat absolut dan tertinggi, tidak dapat diubah atau dicabut oleh siapapun.",
      };
    }

    // Pengangkatan Admin Pusat berjenjang: Target harus sudah memiliki peran admin di bawahnya (misal Admin Kota / Wilayah / Komunitas)
    if (newStatus) {
      const { data: adminMemberships } = await supabase
        .from("anggota_komunitas")
        .select("peran, status")
        .eq("user_id", targetUserId)
        .eq("status", "approved");

      const hasAdminRole = (adminMemberships || []).some((m) => isRoleAdmin(m.peran));
      if (!hasAdminRole) {
        return {
          success: false,
          message:
            "Tindakan ditolak: Pengangkatan Admin Pusat harus berjenjang. Pengguna harus sudah terverifikasi memiliki peran Admin terlebih dahulu sebelum dapat dipromosikan.",
        };
      }
    }

    const adminClient = createAdminClient() || supabase;
    const { error: updateErr } = await adminClient
      .from("profiles")
      .update({
        is_admin_pusat: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", targetUserId);

    if (updateErr) {
      throw updateErr;
    }

    const actionName = newStatus ? "diangkat menjadi Admin Pusat" : "dicabut dari status Admin Pusat";
    const targetName = targetProfile.nama_lengkap || targetProfile.email || "Pengguna";

    revalidatePath("/profil");
    revalidatePath("/admin");
    revalidatePath("/admin/market");
    revalidatePath("/kabar");

    return {
      success: true,
      message: `Akun ${targetName} berhasil ${actionName}.`,
    };
  } catch (err: any) {
    console.error("Error toggleAdminPusatRoleAction:", err);
    return {
      success: false,
      message: err.message || "Gagal memperbarui status Admin Pusat.",
    };
  }
}

/**
 * Server Action: Mengangkat atau Mencabut peran Admin Kota Tegal
 * Aturan Berjenjang:
 * - HANYA Super Admin dan Admin Pusat yang berhak mengangkat/mencabut Admin Kota Tegal.
 * - Admin Kota TIDAK BISA mengangkat Admin Kota lain (tidak bisa mengangkat admin satu level).
 * - Super Admin memiliki imunitas mutlak dan tidak bisa diubah statusnya.
 */
export async function toggleAdminKotaRoleAction(
  targetUserId: string,
  newStatus: boolean
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { supabase, isSuperAdmin, isAdminPusat } =
      await getAuthenticatedUserContext();

    if (!isSuperAdmin && !isAdminPusat) {
      return {
        success: false,
        message:
          "Akses ditolak: Penetapan dan pencabutan status Admin Kota Tegal hanya dapat dilakukan oleh Super Admin atau Admin Pusat.",
      };
    }

    if (!targetUserId) {
      return {
        success: false,
        message: "ID Pengguna target tidak valid.",
      };
    }

    // Ambil data profil target
    const { data: targetProfile, error: fetchErr } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, email, is_super_admin, is_admin_pusat")
      .eq("id", targetUserId)
      .maybeSingle();

    if (fetchErr || !targetProfile) {
      return {
        success: false,
        message: "Profil pengguna target tidak ditemukan.",
      };
    }

    if (isProtectedSuperAdmin(targetProfile)) {
      return {
        success: false,
        message:
          "Tindakan ditolak: Akun Super Admin memiliki status absolut dan tidak dapat diubah perannya.",
      };
    }

    // Admin Pusat tidak bisa mengubah Admin Pusat lain
    if (!isSuperAdmin && (targetProfile.is_admin_pusat || checkIsAdminPusat(targetProfile))) {
      return {
        success: false,
        message:
          "Tindakan ditolak: Admin Pusat tidak dapat mengubah peran sesama Admin Pusat.",
      };
    }

    // Cari ID Komunitas Warga Kota Tegal
    const { data: kotaKom } = await supabase
      .from("komunitas")
      .select("id")
      .ilike("nama", "%Warga Kota Tegal%")
      .maybeSingle();

    const kotaKomId = kotaKom?.id || toValidUUID("kom-warga-kota-tegal");

    const adminClient = createAdminClient() || supabase;

    // Cek apakah target sudah terdaftar di anggota_komunitas
    const { data: existingMember } = await adminClient
      .from("anggota_komunitas")
      .select("id")
      .eq("komunitas_id", kotaKomId)
      .eq("user_id", targetUserId)
      .maybeSingle();

    const targetRole = newStatus ? "Admin Kota Tegal" : "Penduduk";

    if (existingMember) {
      const { error: updateErr } = await adminClient
        .from("anggota_komunitas")
        .update({
          peran: targetRole,
          peran_diajukan: null,
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingMember.id);

      if (updateErr) throw updateErr;
    } else {
      const { error: insertErr } = await adminClient
        .from("anggota_komunitas")
        .insert({
          komunitas_id: kotaKomId,
          user_id: targetUserId,
          peran: targetRole,
          peran_diajukan: null,
          status: "approved",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertErr) throw insertErr;
    }

    const actionName = newStatus ? "diangkat menjadi Admin Kota Tegal" : "dicabut dari status Admin Kota Tegal";
    const targetName = targetProfile.nama_lengkap || targetProfile.email || "Pengguna";

    revalidatePath("/profil");
    revalidatePath("/admin");
    revalidatePath(`/komunitas/${kotaKomId}`);
    revalidatePath("/kabar");

    return {
      success: true,
      message: `Akun ${targetName} berhasil ${actionName}.`,
    };
  } catch (err: any) {
    console.error("Error toggleAdminKotaRoleAction:", err);
    return {
      success: false,
      message: err.message || "Gagal memperbarui status Admin Kota Tegal.",
    };
  }
}

/**
 * Server Action: Mengangkat atau Mencabut peran Admin/Pengurus di Komunitas secara berjenjang (1 Klik)
 * Aturan Hierarkis:
 * - Super Admin & Admin Pusat: Dapat mengangkat/mencabut admin di seluruh komunitas
 * - Admin Kota: Dapat mengangkat/mencabut admin di seluruh Kecamatan, Kelurahan, RW, RT, Posyandu, PAUD, PKBM & SKB
 * - Admin Kecamatan: Dapat mengangkat/mencabut admin di Kelurahan, RW, RT, Posyandu, PAUD, PKBM & SKB dalam kecamatannya
 * - Admin Kelurahan: Dapat mengangkat/mencabut admin RW, RT, serta Posyandu, PAUD, PKBM & SKB di kelurahannya
 * - Admin RW: Dapat mengangkat/mencabut admin RT di RW-nya
 * - Admin Komunitas: Dapat mengangkat/mencabut rekan admin di komunitasnya
 * - Imunitas Super Admin: Peran Super Admin tidak dapat dicabut atau diturunkan oleh siapapun
 */
export async function assignOrRevokeKomunitasAdminAction({
  anggotaId,
  newRole,
  komunitasId,
}: {
  anggotaId: string;
  newRole: string;
  komunitasId: string;
}): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const { supabase, isSuperAdmin, isAdminPusat, userAdminKomunitas, user } =
      await getAuthenticatedUserContext();
    const currentUserId = user.id;

    if (!anggotaId || !komunitasId || !newRole) {
      return {
        success: false,
        message: "Parameter penetapan peran tidak lengkap.",
      };
    }

    // Ambil data anggota komunitas target
    const { data: memberTarget, error: memberErr } = await supabase
      .from("anggota_komunitas")
      .select("id, user_id, komunitas_id, peran, status, profiles(id, nama_lengkap, email, is_super_admin)")
      .eq("id", anggotaId)
      .maybeSingle();

    if (memberErr || !memberTarget) {
      return {
        success: false,
        message: "Data keanggotaan tidak ditemukan.",
      };
    }

    // Proteksi Imunitas Super Admin: Jika target adalah Super Admin dan perannya hendak dicabut/diturunkan
    const targetProf = (memberTarget as any).profiles;
    if (isProtectedSuperAdmin(targetProf) && !isRoleAdmin(newRole)) {
      return {
        success: false,
        message:
          "Tindakan ditolak: Akun Super Admin memiliki imunitas mutlak dan tidak dapat dicabut peran kepengurusannya.",
      };
    }

    // Ambil data komunitas target
    const { data: komDb } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, rw, rt")
      .eq("id", toValidUUID(komunitasId))
      .maybeSingle();

    const targetKomunitas = komDb || findOrGenerateKomunitasSeed(komunitasId);

    // Periksa wewenang hierarki
    const canAssign = checkUserCanAssignAdminRole({
      isSuperAdmin,
      isAdminPusat,
      userAdminKomunitas,
      targetKomunitas,
    });

    if (!canAssign) {
      return {
        success: false,
        message:
          "Akses ditolak: Anda tidak memiliki wewenang hierarkis untuk menetapkan atau mencabut admin di komunitas ini.",
      };
    }

    const adminClient = createAdminClient() || supabase;
    const { error: updateErr } = await adminClient
      .from("anggota_komunitas")
      .update({
        peran: newRole,
        peran_diajukan: null,
        status: "approved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", anggotaId);

    if (updateErr) {
      throw updateErr;
    }

    const targetName = targetProf?.nama_lengkap || targetProf?.email || "Anggota";
    const actionDesc = isRoleAdmin(newRole)
      ? `berhasil diangkat sebagai ${newRole}`
      : `berhasil diubah status perannya menjadi ${newRole}`;

    revalidatePath(`/komunitas/${komunitasId}`);
    revalidatePath(`/komunitas/${komunitasId}/anggota`);
    revalidatePath("/profil");

    return {
      success: true,
      message: `${targetName} ${actionDesc}!`,
    };
  } catch (err: any) {
    console.error("Error assignOrRevokeKomunitasAdminAction:", err);
    return {
      success: false,
      message: err.message || "Gagal mengubah peran admin anggota.",
    };
  }
}

/**
 * Server Action: Memeriksa apakah pengguna yang sedang login memiliki wewenang hierarkis
 * untuk menetapkan atau mencabut status admin anggota di komunitas target.
 */
export async function checkCanManageKomunitasAdminsAction(
  komunitasId: string
): Promise<boolean> {
  try {
    const { supabase, isSuperAdmin, isAdminPusat, userAdminKomunitas } =
      await getAuthenticatedUserContext();

    if (isSuperAdmin || isAdminPusat) return true;

    const { data: komDb } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, rw, rt")
      .eq("id", toValidUUID(komunitasId))
      .maybeSingle();

    const targetKomunitas = komDb || findOrGenerateKomunitasSeed(komunitasId);

    return checkUserCanAssignAdminRole({
      isSuperAdmin,
      isAdminPusat,
      userAdminKomunitas,
      targetKomunitas,
    });
  } catch {
    return false;
  }
}



