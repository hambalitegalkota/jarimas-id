"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { MarketProdukSchema } from "@/lib/zod-schemas";
import { isSuperAdmin as checkIsSuperAdmin } from "@/lib/utils";
import type {
  MarketProduk,
  MarketPesanan,
  StatusPesanan,
} from "@/types/database";

/**
 * Server Action: Tambah atau Perbarui Produk (Khusus Super Admin)
 */
export async function upsertProduk(formData: FormData): Promise<{
  success: boolean;
  message: string;
  produk?: MarketProduk;
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
        message: "Akses ditolak. Silakan masuk sebagai Super Admin.",
      };
    }

    // Verifikasi Super Admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    if (!checkIsSuperAdmin({
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    })) {
      return {
        success: false,
        message: "Hanya Super Admin yang berhak mengelola produk Jarimas Market.",
      };
    }

    const rawId = formData.get("id")?.toString()?.trim();
    const nama = formData.get("nama")?.toString()?.trim() || "";
    const deskripsi = formData.get("deskripsi")?.toString()?.trim() || "";
    const kategori = (formData.get("kategori")?.toString()?.trim() || "Kesehatan & Gizi") as any;
    const harga = parseInt(formData.get("harga")?.toString() || "0", 10);
    const stok = parseInt(formData.get("stok")?.toString() || "0", 10);
    const gambarUrl =
      formData.get("gambarUrl")?.toString()?.trim() ||
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80";
    const isActive = formData.get("isActive") !== "false";
    const beratGram = formData.get("beratGram")
      ? parseInt(formData.get("beratGram")!.toString(), 10)
      : undefined;

    // Validasi Zod
    const validation = MarketProdukSchema.safeParse({
      id: rawId || undefined,
      nama,
      deskripsi,
      kategori,
      harga,
      stok,
      gambarUrl,
      isActive,
      beratGram,
    });

    if (!validation.success) {
      return {
        success: false,
        message: validation.error.issues[0]?.message || "Data produk tidak valid.",
      };
    }

    const payload: Record<string, any> = {
      nama,
      nama_produk: nama,
      deskripsi,
      kategori,
      harga,
      stok,
      gambar_url: gambarUrl,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    if (beratGram) {
      payload.berat_gram = beratGram;
    }

    let result;
    if (rawId) {
      payload.id = rawId;
      result = await supabase
        .from("market_produk")
        .upsert(payload)
        .select()
        .single();
    } else {
      payload.created_at = new Date().toISOString();
      result = await supabase
        .from("market_produk")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      return {
        success: false,
        message: "Gagal menyimpan produk: " + result.error.message,
      };
    }

    const savedProduct = result.data as MarketProduk;

    revalidatePath("/market");
    if (savedProduct?.id) {
      revalidatePath(`/market/${savedProduct.id}`);
    }
    revalidatePath("/admin/market");

    return {
      success: true,
      message: "Produk berhasil disimpan ke katalog Jarimas Market!",
      produk: savedProduct,
    };
  } catch (error: any) {
    console.error("Error upserting product:", error);
    return {
      success: false,
      message: error?.message || "Terjadi kesalahan saat menyimpan produk.",
    };
  }
}

/**
 * Server Action: Mengambil Seluruh Transaksi Pesanan (Khusus Super Admin)
 */
export async function getSemuaPesanan(): Promise<{
  success: boolean;
  data: MarketPesanan[];
  message?: string;
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
        message: "Akses ditolak. Silakan login terlebih dahulu.",
        data: [],
      };
    }

    // Cek hak akses
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    if (!checkIsSuperAdmin({
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    })) {
      return {
        success: false,
        message: "Akses ditolak. Rute ini hanya untuk Super Admin.",
        data: [],
      };
    }

    const { data, error } = await supabase
      .from("market_pesanan")
      .select(`
        *,
        produk:market_produk(*),
        profiles(id, nama_lengkap, email, nomor_hp)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return {
        success: false,
        message: "Gagal memuat daftar pesanan: " + error.message,
        data: [],
      };
    }

    return {
      success: true,
      data: (data || []) as MarketPesanan[],
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal memuat data pesanan.",
      data: [],
    };
  }
}

/**
 * Server Action: Memperbarui Status Transaksi & Pengiriman (Khusus Super Admin)
 */
export async function updateStatusPesanan(
  pesananId: string,
  statusBaru: StatusPesanan,
  nomorResi?: string
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
        message: "Akses ditolak.",
      };
    }

    // Verifikasi Super Admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    if (!checkIsSuperAdmin({
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    })) {
      return {
        success: false,
        message: "Akses ditolak: Hanya Super Admin yang berhak memperbarui pesanan.",
      };
    }

    const updatePayload: Record<string, any> = {
      status_pembayaran: statusBaru,
      updated_at: new Date().toISOString(),
    };

    if (nomorResi !== undefined) {
      updatePayload.nomor_resi = nomorResi.trim() || null;
    }

    const { error: updateError } = await supabase
      .from("market_pesanan")
      .update(updatePayload)
      .eq("id", pesananId);

    if (updateError) {
      return {
        success: false,
        message: "Gagal memperbarui status: " + updateError.message,
      };
    }

    revalidatePath("/admin/pesanan");
    revalidatePath("/market/pesanan");

    return {
      success: true,
      message: `Status pesanan berhasil diperbarui menjadi "${statusBaru}".`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal memperbarui status transaksi.",
    };
  }
}
