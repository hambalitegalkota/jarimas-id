"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { PesananSchema } from "@/lib/zod-schemas";
import type { MarketProduk, MarketPesanan } from "@/types/database";

/**
 * Server Action: Mengambil Daftar Produk Resmi Jarimas Market
 */
export async function getMarketProduk(): Promise<{
  success: boolean;
  data: MarketProduk[];
  message?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("market_produk")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Query market_produk error:", error.message);
      return {
        success: false,
        message: "Gagal memuat produk: " + error.message,
        data: [],
      };
    }

    return {
      success: true,
      data: (data || []) as MarketProduk[],
    };
  } catch (err: any) {
    console.error("Error getMarketProduk:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat produk.",
      data: [],
    };
  }
}

/**
 * Server Action: Mengambil Detail Produk Spesifik
 */
export async function getProdukDetail(productId: string): Promise<{
  success: boolean;
  data?: MarketProduk | null;
  message?: string;
}> {
  try {
    if (!productId) {
      return {
        success: false,
        message: "ID Produk tidak valid.",
        data: null,
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("market_produk")
      .select("*")
      .eq("id", productId)
      .maybeSingle();

    if (error || !data) {
      return {
        success: false,
        message: "Produk tidak ditemukan.",
        data: null,
      };
    }

    return {
      success: true,
      data: data as MarketProduk,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Gagal memuat detail produk.",
      data: null,
    };
  }
}

/**
 * Server Action: Membuat Pesanan Baru & Mengurangi Stok
 */
export async function createPesanan(formData: FormData): Promise<{
  success: boolean;
  message: string;
  pesananId?: string;
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
        message: "Silakan masuk terlebih dahulu untuk melakukan pemesanan.",
      };
    }

    const produkId = formData.get("produkId")?.toString() || "";
    const jumlah = parseInt(formData.get("jumlah")?.toString() || "1", 10);
    const namaPenerima = formData.get("namaPenerima")?.toString()?.trim() || "";
    const nomorHp = formData.get("nomorHp")?.toString()?.trim() || "";
    const alamatLengkap = formData.get("alamatLengkap")?.toString()?.trim() || "";
    const kecamatan = formData.get("kecamatan")?.toString()?.trim() || "";
    const kelurahan = formData.get("kelurahan")?.toString()?.trim() || "";
    const catatan = formData.get("catatan")?.toString()?.trim() || null;
    const metodePembayaran =
      formData.get("metodePembayaran")?.toString() || "qris";

    // Validasi Zod
    const validation = PesananSchema.safeParse({
      produkId,
      jumlah,
      namaPenerima,
      nomorHp,
      alamatLengkap,
      kecamatan,
      kelurahan,
      catatan,
      metodePembayaran,
    });

    if (!validation.success) {
      return {
        success: false,
        message:
          validation.error.issues[0]?.message ||
          "Mohon lengkapi seluruh data pengiriman.",
      };
    }

    // Ambil detail produk dari database untuk kalkulasi harga & verifikasi stok
    const { data: dbProduk, error: fetchProdukError } = await supabase
      .from("market_produk")
      .select("*")
      .eq("id", produkId)
      .single();

    if (fetchProdukError || !dbProduk) {
      return {
        success: false,
        message: "Produk yang dipesan tidak ditemukan di katalog.",
      };
    }

    if (dbProduk.stok < jumlah) {
      return {
        success: false,
        message: `Stok produk tidak mencukupi. Tersisa ${dbProduk.stok} unit.`,
      };
    }

    const totalHarga = dbProduk.harga * jumlah;

    // Simpan pesanan ke database Supabase
    const { data: insertData, error: insertError } = await supabase
      .from("market_pesanan")
      .insert({
        user_id: user.id,
        produk_id: produkId,
        jumlah,
        total_harga: totalHarga,
        status_pembayaran: "pending",
        metode_pembayaran: metodePembayaran,
        nama_penerima: namaPenerima,
        nomor_hp: nomorHp,
        alamat_lengkap: alamatLengkap,
        kecamatan,
        kelurahan,
        catatan,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError || !insertData) {
      return {
        success: false,
        message:
          "Gagal memproses pesanan: " +
          (insertError?.message || "Kesalahan database"),
      };
    }

    // Kurangi stok produk
    const sisaStok = Math.max(0, dbProduk.stok - jumlah);
    await supabase
      .from("market_produk")
      .update({
        stok: sisaStok,
        updated_at: new Date().toISOString(),
      })
      .eq("id", produkId);

    revalidatePath("/market");
    revalidatePath(`/market/${produkId}`);
    revalidatePath("/market/pesanan");
    revalidatePath("/admin/pesanan");

    return {
      success: true,
      message: "Pesanan berhasil dibuat! Silakan lanjutkan pembayaran.",
      pesananId: insertData.id,
    };
  } catch (error: any) {
    console.error("Error creating pesanan:", error);
    return {
      success: false,
      message: error?.message || "Terjadi kesalahan saat memproses pesanan.",
    };
  }
}

/**
 * Server Action: Mengambil Riwayat Pesanan Pengguna yang Sedang Login
 */
export async function getPesananUser(): Promise<{
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
        success: true,
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
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Query pesanan user error:", error.message);
      return {
        success: false,
        message: "Gagal memuat riwayat pesanan: " + error.message,
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
      message: err.message || "Gagal memuat riwayat pesanan.",
      data: [],
    };
  }
}
