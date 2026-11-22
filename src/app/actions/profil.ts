"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import { toValidUUID } from "@/lib/utils";
import type { Profile } from "@/types/database";

export interface ProfilActionState {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

/**
 * Server Action: Perbarui Informasi & Pengaturan Profil Pengguna
 */
export async function updateUserProfile(
  _prevState: ProfilActionState,
  formData: FormData
): Promise<ProfilActionState> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Sesi login telah berakhir. Silakan masuk kembali.",
      };
    }

    const rawNama = (formData.get("nama_lengkap") as string)?.trim() || "";
    const rawUsername = (formData.get("username") as string)?.trim().toLowerCase() || "";
    const rawBio = (formData.get("bio") as string)?.trim() || "";
    const rawWa = (formData.get("nomor_wa") as string)?.trim() || "";
    const rawInstagram = (formData.get("instagram_username") as string)?.trim().replace(/^@/, "") || "";
    const isPublic = formData.get("is_profil_publik") === "true" || formData.get("is_profil_publik") === "on";
    const showKomunitas = formData.get("tampilkan_komunitas") === "true" || formData.get("tampilkan_komunitas") === "on";
    const showKontak = formData.get("tampilkan_kontak") === "true" || formData.get("tampilkan_kontak") === "on";

    // Validasi dasar
    if (rawNama.length < 2) {
      return {
        success: false,
        message: "Nama tampilan minimal 2 karakter.",
        errors: { nama_lengkap: ["Nama minimal 2 karakter."] },
      };
    }

    // Validasi format username jika diisi
    let cleanUsername: string | null = null;
    if (rawUsername.length > 0) {
      if (rawUsername.length < 3 || rawUsername.length > 30) {
        return {
          success: false,
          message: "Username harus berukuran antara 3 hingga 30 karakter.",
          errors: { username: ["Username minimal 3 dan maksimal 30 karakter."] },
        };
      }

      if (!/^[a-z0-9_.]+$/.test(rawUsername)) {
        return {
          success: false,
          message: "Username hanya boleh memuat huruf kecil, angka, titik, dan garis bawah (_).",
          errors: { username: ["Hanya huruf kecil, angka, titik, dan garis bawah."] },
        };
      }

      cleanUsername = rawUsername;
    }

    const adminClient = createAdminClient() || supabase;

    // Cek ketersediaan username jika diubah
    if (cleanUsername) {
      const { data: existingUser, error: checkErr } = await adminClient
        .from("profiles")
        .select("id")
        .eq("username", cleanUsername)
        .neq("id", user.id)
        .maybeSingle();

      if (checkErr) {
        console.warn("Error saat memeriksa username:", checkErr);
      }

      if (existingUser) {
        return {
          success: false,
          message: `Username "@${cleanUsername}" sudah digunakan oleh pengguna lain. Silakan pilih username yang berbeda.`,
          errors: { username: ["Username sudah dipakai orang lain."] },
        };
      }
    }

    // Bersihkan nomor WhatsApp
    let cleanWa = rawWa.replace(/[^\d+]/g, "");
    if (cleanWa.startsWith("0")) {
      cleanWa = "62" + cleanWa.slice(1);
    } else if (cleanWa.startsWith("+")) {
      cleanWa = cleanWa.slice(1);
    }

    // Lakukan pembaruan di tabel profiles
    const { error: updateErr } = await adminClient
      .from("profiles")
      .update({
        nama_lengkap: rawNama,
        username: cleanUsername,
        bio: rawBio.slice(0, 500),
        nomor_wa: cleanWa,
        instagram_username: rawInstagram.slice(0, 50),
        is_profil_publik: isPublic,
        tampilkan_komunitas: showKomunitas,
        tampilkan_kontak: showKontak,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (updateErr) {
      console.error("Gagal memperbarui profil pengguna:", updateErr);
      return {
        success: false,
        message: "Gagal menyimpan perubahan profil: " + (updateErr.message || "Kesalahan database"),
      };
    }

    revalidatePath("/profil");
    if (cleanUsername) {
      revalidatePath(`/u/${cleanUsername}`);
    }
    revalidatePath("/");

    return {
      success: true,
      message: "Profil Anda berhasil diperbarui!",
    };
  } catch (err: any) {
    console.error("Error pada updateUserProfile:", err);
    return {
      success: false,
      message: err?.message || "Terjadi kesalahan internal saat memperbarui profil.",
    };
  }
}

/**
 * Fetch data profil publik berdasarkan username atau ID profil
 */
export async function getPublicProfileData(identifier: string) {
  try {
    const adminClient = createAdminClient();
    if (!adminClient) return null;

    const cleanId = identifier.trim().toLowerCase().replace(/^@/, "");

    // Coba cari berdasarkan username terlebih dahulu
    let query = adminClient
      .from("profiles")
      .select("id, nama_lengkap, email, avatar_url, username, bio, nomor_wa, instagram_username, is_super_admin, is_admin_pusat, is_profil_publik, tampilkan_komunitas, tampilkan_kontak, created_at")
      .ilike("username", cleanId)
      .maybeSingle();

    let { data: profile } = await query;

    // Jika tidak ditemukan dan identifier adalah format UUID, cari berdasarkan ID
    if (!profile) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cleanId);
      if (isUUID) {
        const { data: profileById } = await adminClient
          .from("profiles")
          .select("id, nama_lengkap, email, avatar_url, username, bio, nomor_wa, instagram_username, is_super_admin, is_admin_pusat, is_profil_publik, tampilkan_komunitas, tampilkan_kontak, created_at")
          .eq("id", cleanId)
          .maybeSingle();
        profile = profileById;
      }
    }

    if (!profile) {
      return null;
    }

    // Ambil komunitas jika pengguna mengizinkan tampilkan komunitas
    let communities: any[] = [];
    if (profile.tampilkan_komunitas !== false) {
      const { data: memberships } = await adminClient
        .from("anggota_komunitas")
        .select(`
          id,
          komunitas_id,
          peran,
          status,
          komunitas:komunitas_id(id, nama, jenis, kecamatan, kelurahan, lokasi)
        `)
        .eq("user_id", profile.id)
        .eq("status", "approved");

      communities = (memberships || []).map((m: any) => ({
        id: m.komunitas_id,
        nama: m.komunitas?.nama || "Komunitas",
        jenis: m.komunitas?.jenis || "posyandu",
        peran: m.peran || "Anggota",
        lokasi: m.komunitas?.lokasi || "Kota Tegal",
      }));
    }

    return {
      profile,
      communities,
    };
  } catch (err) {
    console.error("Gagal mengambil profil publik:", err);
    return null;
  }
}
