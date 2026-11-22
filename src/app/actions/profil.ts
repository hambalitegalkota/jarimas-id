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

    const avatarBase64 = (formData.get("avatar_base64") as string)?.trim() || "";
    const removeAvatar = formData.get("remove_avatar") === "true";

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

    // Proses Unggah Foto Profil (Avatar) Terkompresi jika ada
    let finalAvatarUrl: string | null | undefined = undefined;

    if (removeAvatar) {
      finalAvatarUrl = null;
    } else if (avatarBase64 && avatarBase64.startsWith("data:image/")) {
      try {
        const match = avatarBase64.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
        if (match) {
          const mimeType = match[1];
          const base64Data = match[2];
          const buffer = Buffer.from(base64Data, "base64");

          // Batas aman buffer maks 1 MB (hasil kompresi browser biasanya 30-50 KB)
          if (buffer.length <= 1024 * 1024) {
            const ext = mimeType.includes("webp") ? "webp" : mimeType.includes("png") ? "png" : "jpg";
            const fileName = `${user.id}/avatar_${Date.now()}.${ext}`;

            // Pastikan bucket avatars ada atau buat jika belum ada
            const { error: uploadErr } = await adminClient.storage
              .from("avatars")
              .upload(fileName, buffer, {
                contentType: mimeType,
                upsert: true,
              });

            if (!uploadErr) {
              const { data: publicUrlData } = adminClient.storage
                .from("avatars")
                .getPublicUrl(fileName);
              finalAvatarUrl = publicUrlData.publicUrl;
            } else {
              console.warn("Gagal upload avatar ke storage:", uploadErr);
            }
          }
        }
      } catch (avatarErr) {
        console.warn("Error processing avatar upload:", avatarErr);
      }
    }

    // Siapkan payload pembaruan
    const updatePayload: Record<string, any> = {
      nama_lengkap: rawNama,
      username: cleanUsername,
      bio: rawBio.slice(0, 500),
      nomor_wa: cleanWa,
      instagram_username: rawInstagram.slice(0, 50),
      is_profil_publik: isPublic,
      tampilkan_komunitas: showKomunitas,
      tampilkan_kontak: showKontak,
      updated_at: new Date().toISOString(),
    };

    if (finalAvatarUrl !== undefined) {
      updatePayload.avatar_url = finalAvatarUrl;
    }

    // Lakukan pembaruan di tabel profiles
    const { error: updateErr } = await adminClient
      .from("profiles")
      .update(updatePayload)
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
 * Fetch data profil publik berdasarkan username, ID profil, atau email.
 * Jika forceIncludeAll = true (untuk Super Admin / Admin Kota / Pemilik), seluruh komunitas dan rincian tetap dimuat.
 */
export async function getPublicProfileData(identifier: string, forceIncludeAll: boolean = false) {
  try {
    const adminClient = createAdminClient();
    if (!adminClient) return null;

    const cleanId = identifier.trim().toLowerCase().replace(/^@/, "");

    // 1. Coba cari berdasarkan username terlebih dahulu
    let query = adminClient
      .from("profiles")
      .select("id, nama_lengkap, email, avatar_url, username, bio, nomor_wa, instagram_username, is_super_admin, is_admin_pusat, is_profil_publik, tampilkan_komunitas, tampilkan_kontak, created_at")
      .ilike("username", cleanId)
      .maybeSingle();

    let { data: profile } = await query;

    // 2. Jika tidak ditemukan dan identifier adalah format UUID, cari berdasarkan ID
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

    // 3. Jika tidak ditemukan dan identifier mengandung format email, cari berdasarkan email
    if (!profile && cleanId.includes("@")) {
      const { data: profileByEmail } = await adminClient
        .from("profiles")
        .select("id, nama_lengkap, email, avatar_url, username, bio, nomor_wa, instagram_username, is_super_admin, is_admin_pusat, is_profil_publik, tampilkan_komunitas, tampilkan_kontak, created_at")
        .ilike("email", cleanId)
        .maybeSingle();
      profile = profileByEmail;
    }

    if (!profile) {
      return null;
    }

    // Ambil komunitas jika pengguna mengizinkan tampilkan komunitas ATAU dilihat oleh Admin / Pemilik
    let communities: any[] = [];
    if (profile.tampilkan_komunitas !== false || forceIncludeAll) {
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
