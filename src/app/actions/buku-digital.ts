"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type { BukuDigital, BukuDigitalFormData } from "@/types/database";

// Fallback data kurasi buku & modul digital Kota Tegal
const FALLBACK_BUKU_DIGITAL: BukuDigital[] = [
  {
    id: "sample-buku-1",
    judul: "Panduan Stimulasi Tumbuh Kembang Balita 0-6 Tahun",
    kategori: "Modul Parenting",
    url_sampul:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    sinopsis:
      "Panduan lengkap bagi orang tua untuk memantau indikator perkembangan motorik kasar, motorik halus, bicara, dan kemandirian anak usia emas (golden age) guna pencegahan dini stunting.",
    url_baca: "https://ayosehat.kemkes.go.id",
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-buku-2",
    judul: "Buku Saku Kader Posyandu: Pemantauan 6 Bidang SPM",
    kategori: "Panduan Kader",
    url_sampul:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80",
    sinopsis:
      "Pedoman praktis operasional kader Posyandu Kota Tegal dalam melakukan pendataan lapangan, validasi anak rentan ATS, dan pelaporan rutin 6 Bidang Standar Pelayanan Minimal.",
    url_baca: "https://dinkes.tegalkota.go.id",
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-buku-3",
    judul: "Kisah Sahabat Rimba: Belajar Berbagi & Menyayangi",
    kategori: "Buku Cerita Anak",
    url_sampul:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80",
    sinopsis:
      "Buku cerita bergambar edukatif untuk anak prasekolah yang menanamkan nilai empati, gotong royong, dan cinta lingkungan dengan karakter fauna yang ramah.",
    url_baca: "https://budi.kemdikbud.go.id",
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-buku-4",
    judul: "Menu Gizi Seimbang & MP-ASI Berbahan Pangan Lokal",
    kategori: "Kesehatan & Gizi",
    url_sampul:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=80",
    sinopsis:
      "Kumpulan panduan menu makanan pendamping ASI (MP-ASI) padat gizi dari bahan pangan lokal yang terjangkau untuk menunjang percepatan tumbuh kembang anak.",
    url_baca: "https://kesmas.kemkes.go.id",
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-buku-5",
    judul: "Panduan Praktis Transisi PAUD ke SD yang Menyenangkan",
    kategori: "Pendidikan & PAUD",
    url_sampul:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80",
    sinopsis:
      "Panduan kolaborasi guru PAUD, orang tua, dan guru sekolah dasar dalam menciptakan proses transisi belajar yang aman dan bebas dari tekanan calistung berlebih.",
    url_baca: "https://paudpedia.kemdikbud.go.id",
    created_at: new Date().toISOString(),
  },
  {
    id: "sample-buku-6",
    judul: "Modul Ketahanan Pangan & Keterampilan Warga RT/RW",
    kategori: "Keterampilan Warga",
    url_sampul:
      "https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80",
    sinopsis:
      "Kiat mengelola pekarangan rumah untuk budidaya sayur organik, pemanfaatan sampah ramah lingkungan, dan rintisan usaha rumahan kelompok warga.",
    url_baca: "https://tegalkota.go.id",
    created_at: new Date().toISOString(),
  },
];

/**
 * Server Action: Mengambil Daftar Buku & Modul Perpustakaan Digital
 */
export async function getBukuDigitalList(): Promise<{
  success: boolean;
  data: BukuDigital[];
  message?: string;
  isFallback?: boolean;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("buku_digital")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Info query buku_digital (menggunakan fallback):", error.message);
      return {
        success: true,
        data: FALLBACK_BUKU_DIGITAL,
        isFallback: true,
      };
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        data: FALLBACK_BUKU_DIGITAL,
        isFallback: true,
      };
    }

    return {
      success: true,
      data: data as BukuDigital[],
      isFallback: false,
    };
  } catch (err: any) {
    console.error("Error getBukuDigitalList:", err);
    return {
      success: true,
      data: FALLBACK_BUKU_DIGITAL,
      isFallback: true,
      message: err.message || "Gagal memuat buku.",
    };
  }
}

/**
 * Server Action: Menambahkan Buku / Modul Baru ke Perpustakaan
 */
export async function createBukuDigital(formData: BukuDigitalFormData): Promise<{
  success: boolean;
  message: string;
  data?: BukuDigital;
}> {
  try {
    const supabase = await createClient();

    // Verifikasi user login
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Anda harus login untuk menambahkan buku/modul.",
      };
    }

    // Validasi input sederhana
    if (!formData.judul?.trim()) {
      return {
        success: false,
        message: "Judul buku/modul wajib diisi.",
      };
    }

    const { data, error } = await supabase
      .from("buku_digital")
      .insert({
        judul: formData.judul.trim(),
        kategori: formData.kategori?.trim() || "Umum",
        url_sampul: formData.url_sampul?.trim() || null,
        sinopsis: formData.sinopsis?.trim() || null,
        url_baca: formData.url_baca?.trim() || null,
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        message: "Gagal menyimpan buku: " + error.message,
      };
    }

    revalidatePath("/perpustakaan");
    revalidatePath("/");

    return {
      success: true,
      message: "Buku/modul berhasil ditambahkan ke perpustakaan.",
      data: data as BukuDigital,
    };
  } catch (err: any) {
    console.error("Error createBukuDigital:", err);
    return {
      success: false,
      message: err.message || "Terjadi kesalahan server saat menyimpan buku.",
    };
  }
}

/**
 * Server Action: Menghapus Buku / Modul
 */
export async function deleteBukuDigital(bookId: string): Promise<{
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
        message: "Anda harus login sebagai admin untuk menghapus buku.",
      };
    }

    const { error } = await supabase
      .from("buku_digital")
      .delete()
      .eq("id", bookId);

    if (error) {
      return {
        success: false,
        message: "Gagal menghapus buku: " + error.message,
      };
    }

    revalidatePath("/perpustakaan");
    revalidatePath("/");

    return {
      success: true,
      message: "Buku/modul berhasil dihapus.",
    };
  } catch (err: any) {
    console.error("Error deleteBukuDigital:", err);
    return {
      success: false,
      message: err.message || "Terjadi kesalahan saat menghapus buku.",
    };
  }
}
