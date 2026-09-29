"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { KabarSchema, KomentarSchema } from "@/lib/zod-schemas";
import type {
  KabarItem,
  KomentarKabar,
  VisibilitasKabar,
  VisibilitasKomentar,
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
    let isSuperAdmin = false;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        currentUserId = user.id;
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_super_admin")
          .eq("id", user.id)
          .maybeSingle();
        isSuperAdmin = profile?.is_super_admin === true;
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
          *,
          profiles (
            id,
            nama_lengkap
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

      // Normalisasi komentar: Semua komentar ditampilkan untuk publik
      const komentarList: KomentarKabar[] = komentarListRaw
        .map((k) => {
          let rawText = k.konten || k.komentar || "";
          let resolvedParentId = k.parent_id || null;

          // Bersihkan tag fallback jika ada dari data lama
          const visMatch = rawText.match(/^<!--vis:(publik|pembuat_kabar)-->/);
          if (visMatch) {
            rawText = rawText.replace(/^<!--vis:(publik|pembuat_kabar)-->/, "");
          }

          // Parse tag <!--reply:PARENT_ID--> jika disimpan di teks fallback
          const replyMatch = rawText.match(/^<!--reply:([a-zA-Z0-9-]+)-->/);
          if (replyMatch) {
            if (!resolvedParentId) {
              resolvedParentId = replyMatch[1];
            }
            rawText = rawText.replace(/^<!--reply:([a-zA-Z0-9-]+)-->/, "");
          }

          return {
            id: k.id,
            kabar_id: k.kabar_id,
            user_id: k.user_id,
            konten: rawText,
            visibilitas: "publik" as VisibilitasKomentar,
            parent_id: resolvedParentId,
            created_at: k.created_at,
            profiles: Array.isArray(k.profiles) ? k.profiles[0] : k.profiles,
          };
        })
        .sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

      const isCommentsDisabled =
        Boolean(row.komentar_dinonaktifkan) ||
        Boolean(row.konten?.includes("<!--comments_disabled-->"));
      const cleanKonten = row.konten
        ? row.konten.replace("<!--comments_disabled-->", "")
        : "";

      return {
        id: row.id,
        user_id: row.user_id,
        konten: cleanKonten,
        visibilitas: row.visibilitas || "publik",
        komentar_dinonaktifkan: isCommentsDisabled,
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

    const konten = formData.get("konten")?.toString()?.trim() || "";
    const visibilitas = (formData.get("visibilitas")?.toString() as any) || "publik";
    const komentarDinonaktifkan = formData.get("komentar_dinonaktifkan") === "true";

    const validation = KabarSchema.safeParse({
      konten,
      visibilitas,
      komentar_dinonaktifkan: komentarDinonaktifkan,
    });

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0]?.message || "Konten kabar tidak valid.",
      };
    }

    // Pastikan profile user ada di tabel profiles untuk integritas foreign key
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      const fallbackName =
        user.user_metadata?.nama_lengkap ||
        user.email?.split("@")[0] ||
        "Warga JARIMAS";
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          nama_lengkap: fallbackName,
          email: user.email,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    }

    let postKonten = konten;
    if (komentarDinonaktifkan) {
      postKonten = "<!--comments_disabled-->" + postKonten;
    }

    const { error: insertError } = await supabase.from("kabar_jarimas").insert({
      user_id: user.id,
      konten: postKonten,
      visibilitas,
      komentar_dinonaktifkan: komentarDinonaktifkan,
      created_at: new Date().toISOString(),
    });

    if (insertError) {
      // Fallback jika kolom komentar_dinonaktifkan belum ada di schema cache
      const { error: fallbackError } = await supabase.from("kabar_jarimas").insert({
        user_id: user.id,
        konten: postKonten,
        visibilitas,
        created_at: new Date().toISOString(),
      });

      if (fallbackError) {
        return {
          success: false,
          message: "Gagal membagikan kabar: " + fallbackError.message,
        };
      }
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

    // Pastikan profile user ada di tabel profiles untuk integritas foreign key
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      const fallbackName =
        user.user_metadata?.nama_lengkap ||
        user.email?.split("@")[0] ||
        "Warga JARIMAS";
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          nama_lengkap: fallbackName,
          email: user.email,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
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
  komentarText: string,
  visibilitas: VisibilitasKomentar = "publik",
  parentId?: string | null
): Promise<{
  success: boolean;
  message: string;
  data?: KomentarKabar | null;
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

    const trimmedText = komentarText?.trim() || "";
    const validation = KomentarSchema.safeParse({
      kabarId,
      konten: trimmedText,
      visibilitas,
      parentId: parentId || undefined,
    });

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0]?.message || "Komentar tidak valid.",
      };
    }

    // 1. Pastikan profil user ada di database untuk menjaga integritas relasi foreign key
    let profileName =
      user.user_metadata?.nama_lengkap ||
      user.email?.split("@")[0] ||
      "Warga JARIMAS";

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id, nama_lengkap")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile) {
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          nama_lengkap: profileName,
          email: user.email,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    } else if (existingProfile.nama_lengkap) {
      profileName = existingProfile.nama_lengkap;
    }

    // 2. Periksa apakah komentar dinonaktifkan pada kabar ini
    const { data: targetKabar } = await supabase
      .from("kabar_jarimas")
      .select("user_id, konten, komentar_dinonaktifkan")
      .eq("id", kabarId)
      .maybeSingle();

    const isCommentsDisabled =
      Boolean(targetKabar?.komentar_dinonaktifkan) ||
      Boolean(targetKabar?.konten?.includes("<!--comments_disabled-->"));

    if (isCommentsDisabled) {
      return {
        success: false,
        message: "Komentar pada postingan ini telah dinonaktifkan oleh pembuat kabar.",
      };
    }

    // 3. Siapkan fallback text jika database belum memiliki kolom parent_id
    let fallbackText = trimmedText;
    if (parentId) {
      fallbackText = `<!--reply:${parentId}-->` + fallbackText;
    }

    // Siapkan urutan payload percobaan bertingkat (Cascading Insert)
    const payloadsToTry: Array<{
      payload: Record<string, any>;
      description: string;
    }> = [
      // Percobaan 1: Payload native penuh (parent_id, visibilitas, dual column)
      {
        description: "native_full",
        payload: {
          kabar_id: kabarId,
          user_id: user.id,
          komentar: trimmedText,
          konten: trimmedText,
          visibilitas: "publik",
          ...(parentId ? { parent_id: parentId } : {}),
          created_at: new Date().toISOString(),
        },
      },
      // Percobaan 2: Tanpa parent_id column (tag reply dienkode di text, dengan visibilitas)
      {
        description: "no_parent_id_column",
        payload: {
          kabar_id: kabarId,
          user_id: user.id,
          komentar: fallbackText,
          konten: fallbackText,
          visibilitas: "publik",
          created_at: new Date().toISOString(),
        },
      },
      // Percobaan 3: Tanpa parent_id & tanpa visibilitas (semua dienkode di text)
      {
        description: "minimal_with_tags",
        payload: {
          kabar_id: kabarId,
          user_id: user.id,
          komentar: fallbackText,
          konten: fallbackText,
          created_at: new Date().toISOString(),
        },
      },
      // Percobaan 4: Single column komentar
      {
        description: "single_column_komentar",
        payload: {
          kabar_id: kabarId,
          user_id: user.id,
          komentar: fallbackText,
          created_at: new Date().toISOString(),
        },
      },
      // Percobaan 5: Single column konten
      {
        description: "single_column_konten",
        payload: {
          kabar_id: kabarId,
          user_id: user.id,
          konten: fallbackText,
          created_at: new Date().toISOString(),
        },
      },
    ];

    let insertedComment: any = null;
    let insertError: any = null;

    for (const attempt of payloadsToTry) {
      const res = await supabase
        .from("komentar_kabar")
        .insert(attempt.payload)
        .select(`
          *,
          profiles (
            id,
            nama_lengkap
          )
        `)
        .maybeSingle();

      if (!res.error && res.data) {
        insertedComment = res.data;
        insertError = null;
        break;
      } else {
        insertError = res.error;
        console.warn(
          `[addKomentarKabar] Percobaan ${attempt.description} gagal (${res.error?.message}), mencoba strategi berikutnya...`
        );
      }
    }

    if (insertError || !insertedComment) {
      console.error("Semua percobaan insert komentar gagal:", insertError);
      return {
        success: false,
        message: "Gagal mengirim komentar: " + (insertError?.message || "Terjadi kesalahan"),
      };
    }

    revalidatePath("/kabar");
    revalidatePath("/");

    // Bersihkan tag metadata jika ada di teks balikan
    let cleanReturnText =
      insertedComment.konten || insertedComment.komentar || trimmedText;
    let returnParentId = insertedComment.parent_id || parentId || null;

    const visMatch = cleanReturnText.match(/^<!--vis:(publik|pembuat_kabar)-->/);
    if (visMatch) {
      cleanReturnText = cleanReturnText.replace(/^<!--vis:(publik|pembuat_kabar)-->/, "");
    }

    const replyMatch = cleanReturnText.match(/^<!--reply:([a-zA-Z0-9-]+)-->/);
    if (replyMatch) {
      if (!returnParentId) {
        returnParentId = replyMatch[1];
      }
      cleanReturnText = cleanReturnText.replace(/^<!--reply:([a-zA-Z0-9-]+)-->/, "");
    }

    // Normalisasi struktur output data komentar
    const formattedComment: KomentarKabar = {
      id: insertedComment.id,
      kabar_id: insertedComment.kabar_id,
      user_id: insertedComment.user_id,
      konten: cleanReturnText,
      visibilitas: "publik",
      parent_id: returnParentId,
      created_at: insertedComment.created_at,
      profiles: Array.isArray(insertedComment.profiles)
        ? insertedComment.profiles[0]
        : insertedComment.profiles || { id: user.id, nama_lengkap: profileName },
    };

    return {
      success: true,
      message: "Komentar berhasil dikirim.",
      data: formattedComment,
    };
  } catch (err: any) {
    console.error("Error pada addKomentarKabar:", err);
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

/**
 * Server Action: Menghapus komentar pada kabar
 * Dapat dilakukan oleh pembuat komentar, pembuat postingan kabar, atau Super Admin
 */
export async function deleteKomentarKabar(
  komentarId: string,
  kabarId: string
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
        message: "Silakan masuk terlebih dahulu untuk menghapus komentar.",
      };
    }

    // Ambil data komentar target
    const { data: komentar, error: fetchError } = await supabase
      .from("komentar_kabar")
      .select("id, user_id, kabar_id")
      .eq("id", komentarId)
      .maybeSingle();

    if (fetchError || !komentar) {
      return {
        success: false,
        message: "Komentar tidak ditemukan atau sudah dihapus.",
      };
    }

    // Ambil data pembuat kabar
    const { data: kabar } = await supabase
      .from("kabar_jarimas")
      .select("user_id")
      .eq("id", komentar.kabar_id || kabarId)
      .maybeSingle();

    // Cek otorisasi user
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperAdmin = profile?.is_super_admin === true;
    const isCommentAuthor = komentar.user_id === user.id;
    const isPostAuthor = kabar?.user_id === user.id;

    if (!isCommentAuthor && !isPostAuthor && !isSuperAdmin) {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk menghapus komentar ini.",
      };
    }

    // Hapus juga balasan dari komentar ini jika ada
    try {
      await supabase
        .from("komentar_kabar")
        .delete()
        .eq("parent_id", komentarId);
    } catch (ignore) {
      // Abaikan jika kolom parent_id belum ada atau sudah ditangani cascade
    }

    // Hapus komentar target
    const { error: deleteError } = await supabase
      .from("komentar_kabar")
      .delete()
      .eq("id", komentarId);

    if (deleteError) {
      return {
        success: false,
        message: "Gagal menghapus komentar: " + deleteError.message,
      };
    }

    revalidatePath("/kabar");
    revalidatePath("/");

    return {
      success: true,
      message: "Komentar berhasil dihapus.",
    };
  } catch (err: any) {
    console.error("Error deleteKomentarKabar:", err);
    return {
      success: false,
      message: err.message || "Terjadi kesalahan saat menghapus komentar.",
    };
  }
}

/**
 * Server Action: Mengaktifkan atau menonaktifkan komentar pada postingan kabar
 * Dapat dilakukan oleh pembuat kabar atau Super Admin
 */
export async function toggleKomentarKabarStatus(
  kabarId: string,
  disableComments: boolean
): Promise<{
  success: boolean;
  message: string;
  disabled?: boolean;
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
        message: "Silakan masuk terlebih dahulu.",
      };
    }

    // Ambil data kabar
    const { data: kabar, error: fetchError } = await supabase
      .from("kabar_jarimas")
      .select("id, user_id, konten, komentar_dinonaktifkan")
      .eq("id", kabarId)
      .maybeSingle();

    if (fetchError || !kabar) {
      return {
        success: false,
        message: "Postingan kabar tidak ditemukan.",
      };
    }

    // Cek otorisasi
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperAdmin = profile?.is_super_admin === true;
    const isAuthor = kabar.user_id === user.id;

    if (!isAuthor && !isSuperAdmin) {
      return {
        success: false,
        message: "Anda tidak memiliki izin untuk mengubah pengaturan komentar postingan ini.",
      };
    }

    let cleanKonten = (kabar.konten || "").replace("<!--comments_disabled-->", "");
    if (disableComments) {
      cleanKonten = "<!--comments_disabled-->" + cleanKonten;
    }

    // Coba update dengan kolom komentar_dinonaktifkan
    const { error: updateError } = await supabase
      .from("kabar_jarimas")
      .update({
        komentar_dinonaktifkan: disableComments,
        konten: cleanKonten,
        updated_at: new Date().toISOString(),
      })
      .eq("id", kabarId);

    if (updateError) {
      // Fallback jika kolom komentar_dinonaktifkan belum ada di schema cache
      const { error: fallbackError } = await supabase
        .from("kabar_jarimas")
        .update({
          konten: cleanKonten,
          updated_at: new Date().toISOString(),
        })
        .eq("id", kabarId);

      if (fallbackError) {
        return {
          success: false,
          message: "Gagal memperbarui status komentar: " + fallbackError.message,
        };
      }
    }

    revalidatePath("/kabar");
    revalidatePath("/");

    return {
      success: true,
      message: disableComments
        ? "Komentar berhasil dinonaktifkan."
        : "Komentar berhasil diaktifkan kembali.",
      disabled: disableComments,
    };
  } catch (err: any) {
    console.error("Error toggleKomentarKabarStatus:", err);
    return {
      success: false,
      message: err.message || "Terjadi kesalahan saat mengubah status komentar.",
    };
  }
}
