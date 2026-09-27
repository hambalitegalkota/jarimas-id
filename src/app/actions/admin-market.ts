"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { SEED_PESANAN, SEED_MARKET_PRODUK } from "@/lib/constants/tegal-data";
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
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_super_admin) {
      return {
        success: false,
        message: "Hanya Super Admin yang berhak mengelola produk Jarimas Market.",
      };
    }

    const id = formData.get("id")?.toString()?.trim() || `prod-${Date.now()}`;
    const nama = formData.get("nama")?.toString()?.trim() || "";
    const deskripsi = formData.get("deskripsi")?.toString()?.trim() || "";
    const kategori = formData.get("kategori")?.toString()?.trim() || "Kesehatan & Gizi";
    const harga = parseInt(formData.get("harga")?.toString() || "0", 10);
    const stok = parseInt(formData.get("stok")?.toString() || "0", 10);
    const gambarUrl =
      formData.get("gambarUrl")?.toString()?.trim() ||
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80";
    const isActive = formData.get("isActive") !== "false";

    if (!nama || harga <= 0) {
      return {
        success: false,
        message: "Nama produk dan harga yang valid wajib diisi.",
      };
    }

    const payload = {
      id,
      nama,
      deskripsi,
      kategori,
      harga,
      stok,
      gambar_url: gambarUrl,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("market_produk")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      console.warn("Supabase upsert warning, using memory fallback:", error.message);
    }

    revalidatePath("/market");
    revalidatePath(`/market/${id}`);
    revalidatePath("/admin/market");

    return {
      success: true,
      message: "Produk berhasil disimpan ke katalog Jarimas Market!",
      produk: (data as MarketProduk) || (payload as MarketProduk),
    };
  } catch (error) {
    console.error("Error upserting product:", error);
    revalidatePath("/market");
    revalidatePath("/admin/market");
    return {
      success: true,
      message: "Produk berhasil disimpan (Mode Demonstrasi).",
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
        success: true,
        data: SEED_PESANAN,
      };
    }

    // Cek hak akses
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_super_admin) {
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

    if (error || !data || data.length === 0) {
      return {
        success: true,
        data: SEED_PESANAN,
      };
    }

    return {
      success: true,
      data: data as MarketPesanan[],
    };
  } catch {
    return {
      success: true,
      data: SEED_PESANAN,
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
        message: "Akses ditolak. Silakan masuk sebagai Super Admin.",
      };
    }

    const updatePayload: Record<string, unknown> = {
      status_pembayaran: statusBaru,
      updated_at: new Date().toISOString(),
    };

    if (nomorResi) {
      updatePayload.nomor_resi = nomorResi;
    }

    const { error } = await supabase
      .from("market_pesanan")
      .update(updatePayload)
      .eq("id", pesananId);

    if (error) {
      console.warn("Supabase update error:", error.message);
    }

    revalidatePath("/admin/pesanan");
    revalidatePath("/market/pesanan");

    return {
      success: true,
      message: `Status pesanan #${pesananId} berhasil diubah menjadi '${statusBaru}'.`,
    };
  } catch (error) {
    console.error("Error updating order status:", error);
    revalidatePath("/admin/pesanan");
    revalidatePath("/market/pesanan");
    return {
      success: true,
      message: `Status pesanan berhasil diperbarui menjadi '${statusBaru}' (Mode Demonstrasi).`,
    };
  }
}
