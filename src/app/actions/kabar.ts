"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type {
  KabarItem,
  KomentarKabar,
  VisibilitasKabar,
  SortingKabar,
} from "@/types/database";

interface GetKabarFeedParams {
  filterVisibilitas?: "semua" | VisibilitasKabar;
  sorting?: SortingKabar;
}

/**
 * Server Action: Mengambil feed kabar warga beserta reaksi dan komentar
 */
export async function getKabarFeed(
  params: GetKabarFeedParams = {}
): Promise<{
  success: boolean;
  message?: string;
  data: KabarItem[];
  currentUserId?: string | null;
}> {
  try {
    const supabase = await createClient();

    // 1. Ambil session user saat ini jika ada
    let currentUserId: string | null = null;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        currentUserId = user.id;
      }
    } catch {
      // User mungkin belum login (tamu)
    }

    // 2. Siapkan query dasar kabar_jarimas
    let query = supabase
      .from("kabar_jarimas")
      .select(`
        id,
        user_id,
        konten,
        visibilitas,
        komunitas_id,
        created_at,
        updated_at,
        profiles (
          id,
          nama_lengkap,
          avatar_url,
          is_super_admin
        ),
        komunitas (
          id,
          nama
        ),
        reaksi_kabar (
          id,
          kabar_id,
          user_id,
          tipe_reaksi
        ),
        komentar_kabar (
          id,
          kabar_id,
          user_id,
          konten,
          created_at,
          profiles (
            id,
            nama_lengkap,
            avatar_url
          )
        )
      `);

    // Filter visibilitas
    if (params.filterVisibilitas && params.filterVisibilitas !== "semua") {
      query = query.eq("visibilitas", params.filterVisibilitas);
    }

    // Urutan default (terbaru)
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.warn("Query kabar_jarimas error:", error.message);
      return {
        success: false,
        message: "Gagal memuat feed kabar: " + error.message,
        data: [],
        currentUserId,
      };
    }

    // 3. Transformasi dan kalkulasi reaksi/komentar per post
    const items: KabarItem[] = (data || []).map((row: any) => {
      const reaksiList: any[] = row.reaksi_kabar || [];
      const komentarListRaw: any[] = row.komentar_kabar || [];

      // Hitung reaksi per tipe emoji
      const reaksiCounts: Record<string, number> = {};
      let userReaction: string | null = null;

      reaksiList.forEach((r) => {
        const type = r.tipe_reaksi || "❤️";
        reaksiCounts[type] = (reaksiCounts[type] || 0) + 1;
        if (currentUserId && r.user_id === currentUserId) {
          userReaction = type;
        }
      });

      // Normalisasi komentar
      const komentarList: KomentarKabar[] = komentarListRaw
        .map((k) => ({
          id: k.id,
          kabar_id: k.kabar_id,
          user_id: k.user_id,
          konten: k.konten,
          created_at: k.created_at,
          profiles: Array.isArray(k.profiles) ? k.profiles[0] : k.profiles,
        }))
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

      return {
        id: row.id,
        user_id: row.user_id,
        konten: row.konten,
        visibilitas: row.visibilitas || "publik",
        komunitas_id: row.komunitas_id,
        created_at: row.created_at,
        updated_at: row.updated_at,
        profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
        komunitas: Array.isArray(row.komunitas) ? row.komunitas[0] : row.komunitas,
        jumlah_reaksi: reaksiList.length,
        jumlah_komentar: komentarList.length,
        reaksi_counts: reaksiCounts,
        user_reaction: userReaction,
        komentar_list: komentarList,
      };
    });

    // 4. Pengurutan terpopuler jika diminta
    if (params.sorting === "terpopuler") {
      items.sort((a, b) => {
        const scoreA = a.jumlah_reaksi * 1.5 + a.jumlah_komentar * 2;
        const scoreB = b.jumlah_reaksi * 1.5 + b.jumlah_komentar * 2;
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
    }

    return {
      success: true,
      data: items,
      currentUserId,
    };
  } catch (err: any) {
    console.error("Error pada getKabarFeed:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat kabar warga.",
      data: [],
      currentUserId: null,
    };
  }
}

/**
 * Server Action: Membuat postingan kabar baru
 */
export async function createKabar(formData: FormData): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Anda harus masuk terlebih dahulu untuk membagikan kabar.",
      };
    }

    const konten = formData.get("konten")?.toString()?.trim();
    const visibilitas =
      (formData.get("visibilitas")?.toString() as VisibilitasKabar) || "publik";

    if (!konten || konten.length === 0) {
      return {
        success: false,
        message: "Konten kabar tidak boleh kosong.",
      };
    }

    if (konten.length > 2000) {
      return {
        success: false,
        message: "Konten kabar maksimal 2000 karakter.",
      };
    }

    const { error: insertError } = await supabase.from("kabar_jarimas").insert({
      user_id: user.id,
      konten: konten,
      visibilitas: visibilitas,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      return {
        success: false,
        message: "Gagal membagikan kabar: " + insertError.message,
      };
    }

    revalidatePath("/kabar");
    revalidatePath("/");
    return {
      success: true,
      message: "Kabar Anda berhasil dibagikan!",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Terjadi kesalahan saat membagikan kabar.",
    };
  }
}

/**
 * Server Action: Memberi / Menghapus / Mengubah Reaksi (Toggle Reaction)
 */
export async function toggleReaksiKabar(
  kabarId: string,
  tipeReaksi: string
): Promise<{
  success: boolean;
  message: string;
  currentReaction?: string | null;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Silakan masuk untuk memberikan reaksi.",
      };
    }

    if (!kabarId || !tipeReaksi) {
      return {
        success: false,
        message: "Parameter reaksi tidak lengkap.",
      };
    }

    // Periksa apakah user sudah pernah bereaksi pada postingan ini
    const { data: existingReaction, error: fetchError } = await supabase
      .from("reaksi_kabar")
      .select("id, tipe_reaksi")
      .eq("kabar_id", kabarId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.warn("Gagal mengecek reaksi:", fetchError.message);
    }

    if (existingReaction) {
      if (existingReaction.tipe_reaksi === tipeReaksi) {
        // Toggle OFF: Hapus reaksi yang sama
        const { error: delError } = await supabase
          .from("reaksi_kabar")
          .delete()
          .eq("id", existingReaction.id);

        if (delError) throw delError;

        revalidatePath("/kabar");
        revalidatePath("/");
        return {
          success: true,
          message: "Reaksi dihapus.",
          currentReaction: null,
        };
      } else {
        // Update ke reaksi baru
        const { error: updateError } = await supabase
          .from("reaksi_kabar")
          .update({
            tipe_reaksi: tipeReaksi,
          })
          .eq("id", existingReaction.id);

        if (updateError) throw updateError;

        revalidatePath("/kabar");
        revalidatePath("/");
        return {
          success: true,
          message: "Reaksi diperbarui.",
          currentReaction: tipeReaksi,
        };
      }
    } else {
      // Tambahkan reaksi baru
      const { error: insertError } = await supabase
        .from("reaksi_kabar")
        .insert({
          kabar_id: kabarId,
          user_id: user.id,
          tipe_reaksi: tipeReaksi,
          created_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      revalidatePath("/kabar");
      revalidatePath("/");
      return {
        success: true,
        message: "Reaksi berhasil ditambahkan.",
        currentReaction: tipeReaksi,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal memperbarui reaksi.",
    };
  }
}

/**
 * Server Action: Menambahkan komentar baru pada kabar
 */
export async function addKomentarKabar(
  kabarId: string,
  komentarText: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Silakan masuk untuk menulis komentar.",
      };
    }

    const trimmedText = komentarText?.trim();
    if (!trimmedText || trimmedText.length === 0) {
      return {
        success: false,
        message: "Komentar tidak boleh kosong.",
      };
    }

    if (trimmedText.length > 500) {
      return {
        success: false,
        message: "Komentar maksimal 500 karakter.",
      };
    }

    const { error: insertError } = await supabase
      .from("komentar_kabar")
      .insert({
        kabar_id: kabarId,
        user_id: user.id,
        konten: trimmedText,
        created_at: new Date().toISOString(),
      });

    if (insertError) {
      return {
        success: false,
        message: "Gagal mengirim komentar: " + insertError.message,
      };
    }

    revalidatePath("/kabar");
    revalidatePath("/");
    return {
      success: true,
      message: "Komentar berhasil dikirim.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Terjadi kesalahan saat mengirim komentar.",
    };
  }
}

/**
 * Server Action: Menghapus postingan kabar
 */
export async function deleteKabar(kabarId: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Akses ditolak: Anda harus masuk terlebih dahulu.",
      };
    }

    // Ambil data kabar dan cek pemilik
    const { data: post, error: postError } = await supabase
      .from("kabar_jarimas")
      .select("id, user_id")
      .eq("id", kabarId)
      .single();

    if (postError || !post) {
      return {
        success: false,
        message: "Postingan kabar tidak ditemukan.",
      };
    }

    // Periksa apakah pengguna adalah pemilik postingan atau Super Admin
    const isOwner = post.user_id === user.id;

    if (!isOwner) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("id", user.id)
        .single();

      const isSuperAdmin = profile?.is_super_admin === true;
      if (!isSuperAdmin) {
        return {
          success: false,
          message:
            "Akses ditolak: Anda hanya dapat menghapus postingan milik Anda sendiri.",
        };
      }
    }

    // Hapus reaksi dan komentar terkait terlebih dahulu jika cascade belum aktif
    await supabase.from("reaksi_kabar").delete().eq("kabar_id", kabarId);
    await supabase.from("komentar_kabar").delete().eq("kabar_id", kabarId);

    // Hapus postingan
    const { error: deleteError } = await supabase
      .from("kabar_jarimas")
      .delete()
      .eq("id", kabarId);

    if (deleteError) {
      return {
        success: false,
        message: "Gagal menghapus postingan: " + deleteError.message,
      };
    }

    revalidatePath("/kabar");
    revalidatePath("/");
    return {
      success: true,
      message: "Postingan kabar berhasil dihapus.",
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal menghapus postingan kabar.",
    };
  }
}
