"use server";

import { unstable_cache } from "next/cache";
import { createClient, createStatelessClient } from "@/utils/supabase/server";

export interface KecamatanCommunityStat {
  kecamatan: string;
  totalMain: number;
  mainLabel: string;
  penggunaBergabung: number;
  totalTerisi: number;
  totalKosong: number;
  labelTerisi: string;
  labelKosong: string;
  persenTerisi: number;
}

export interface UserJoinedCommunity {
  id: string;
  nama: string;
  jenis: string;
  kecamatan: string;
  kelurahan: string;
  rw?: string | null;
  rt?: string | null;
  peran?: string;
}

// Fallback in-memory cache data untuk memastikan aplikasi tidak terhenti jika terjadi limit Supabase
const FALLBACK_KECAMATAN_STATS: Record<string, KecamatanCommunityStat[]> = {
  warga_kita: [
    {
      kecamatan: "Tegal Barat",
      totalMain: 778,
      mainLabel: "Komunitas RT",
      penggunaBergabung: 320,
      totalTerisi: 208,
      totalKosong: 570,
      labelTerisi: "RT Terisi",
      labelKosong: "RT Kosong",
      persenTerisi: 26.7,
    },
    {
      kecamatan: "Tegal Timur",
      totalMain: 1053,
      mainLabel: "Komunitas RT",
      penggunaBergabung: 198,
      totalTerisi: 147,
      totalKosong: 906,
      labelTerisi: "RT Terisi",
      labelKosong: "RT Kosong",
      persenTerisi: 14.0,
    },
    {
      kecamatan: "Tegal Selatan",
      totalMain: 433,
      mainLabel: "Komunitas RT",
      penggunaBergabung: 281,
      totalTerisi: 177,
      totalKosong: 256,
      labelTerisi: "RT Terisi",
      labelKosong: "RT Kosong",
      persenTerisi: 40.9,
    },
    {
      kecamatan: "Margadana",
      totalMain: 1271,
      mainLabel: "Komunitas RT",
      penggunaBergabung: 123,
      totalTerisi: 101,
      totalKosong: 1170,
      labelTerisi: "RT Terisi",
      labelKosong: "RT Kosong",
      persenTerisi: 7.9,
    },
  ],
  posyandu: [
    {
      kecamatan: "Tegal Barat",
      totalMain: 69,
      mainLabel: "Posyandu",
      penggunaBergabung: 140,
      totalTerisi: 49,
      totalKosong: 20,
      labelTerisi: "Posyandu Terisi",
      labelKosong: "Posyandu Kosong",
      persenTerisi: 71.0,
    },
    {
      kecamatan: "Tegal Timur",
      totalMain: 63,
      mainLabel: "Posyandu",
      penggunaBergabung: 92,
      totalTerisi: 29,
      totalKosong: 34,
      labelTerisi: "Posyandu Terisi",
      labelKosong: "Posyandu Kosong",
      persenTerisi: 46.0,
    },
    {
      kecamatan: "Tegal Selatan",
      totalMain: 56,
      mainLabel: "Posyandu",
      penggunaBergabung: 106,
      totalTerisi: 40,
      totalKosong: 16,
      labelTerisi: "Posyandu Terisi",
      labelKosong: "Posyandu Kosong",
      persenTerisi: 71.4,
    },
    {
      kecamatan: "Margadana",
      totalMain: 52,
      mainLabel: "Posyandu",
      penggunaBergabung: 71,
      totalTerisi: 28,
      totalKosong: 24,
      labelTerisi: "Posyandu Terisi",
      labelKosong: "Posyandu Kosong",
      persenTerisi: 53.8,
    },
  ],
  satuan_paud: [
    {
      kecamatan: "Tegal Barat",
      totalMain: 70,
      mainLabel: "Satuan PAUD",
      penggunaBergabung: 71,
      totalTerisi: 56,
      totalKosong: 14,
      labelTerisi: "PAUD Terisi",
      labelKosong: "PAUD Kosong",
      persenTerisi: 80.0,
    },
    {
      kecamatan: "Tegal Timur",
      totalMain: 84,
      mainLabel: "Satuan PAUD",
      penggunaBergabung: 83,
      totalTerisi: 72,
      totalKosong: 12,
      labelTerisi: "PAUD Terisi",
      labelKosong: "PAUD Kosong",
      persenTerisi: 85.7,
    },
    {
      kecamatan: "Tegal Selatan",
      totalMain: 55,
      mainLabel: "Satuan PAUD",
      penggunaBergabung: 61,
      totalTerisi: 42,
      totalKosong: 13,
      labelTerisi: "PAUD Terisi",
      labelKosong: "PAUD Kosong",
      persenTerisi: 76.4,
    },
    {
      kecamatan: "Margadana",
      totalMain: 43,
      mainLabel: "Satuan PAUD",
      penggunaBergabung: 38,
      totalTerisi: 33,
      totalKosong: 10,
      labelTerisi: "PAUD Terisi",
      labelKosong: "PAUD Kosong",
      persenTerisi: 76.7,
    },
  ],
  pkbm_skb: [
    {
      kecamatan: "Tegal Barat",
      totalMain: 8,
      mainLabel: "Lembaga",
      penggunaBergabung: 2,
      totalTerisi: 1,
      totalKosong: 7,
      labelTerisi: "Lembaga Terisi",
      labelKosong: "Lembaga Kosong",
      persenTerisi: 12.5,
    },
    {
      kecamatan: "Tegal Timur",
      totalMain: 6,
      mainLabel: "Lembaga",
      penggunaBergabung: 1,
      totalTerisi: 1,
      totalKosong: 5,
      labelTerisi: "Lembaga Terisi",
      labelKosong: "Lembaga Kosong",
      persenTerisi: 16.7,
    },
    {
      kecamatan: "Tegal Selatan",
      totalMain: 10,
      mainLabel: "Lembaga",
      penggunaBergabung: 0,
      totalTerisi: 0,
      totalKosong: 10,
      labelTerisi: "Lembaga Terisi",
      labelKosong: "Lembaga Kosong",
      persenTerisi: 0.0,
    },
    {
      kecamatan: "Margadana",
      totalMain: 3,
      mainLabel: "Lembaga",
      penggunaBergabung: 2,
      totalTerisi: 1,
      totalKosong: 2,
      labelTerisi: "Lembaga Terisi",
      labelKosong: "Lembaga Kosong",
      persenTerisi: 33.3,
    },
  ],
};

let inMemoryStatsCache: {
  timestamp: number;
  data: Record<string, KecamatanCommunityStat[]>;
} | null = null;

const KECAMATAN_ORDER = [
  "Tegal Barat",
  "Tegal Timur",
  "Tegal Selatan",
  "Margadana",
];

async function computeAllKecamatanStats(): Promise<Record<string, KecamatanCommunityStat[]>> {
  try {
    const supabase = createStatelessClient();

    // 1. Ambil anggota komunitas (approved) dalam chunk paralel
    const memberChunks = await Promise.all([
      supabase.from("anggota_komunitas").select("komunitas_id").eq("status", "approved").range(0, 999),
      supabase.from("anggota_komunitas").select("komunitas_id").eq("status", "approved").range(1000, 1999),
      supabase.from("anggota_komunitas").select("komunitas_id").eq("status", "approved").range(2000, 2999),
      supabase.from("anggota_komunitas").select("komunitas_id").eq("status", "approved").range(3000, 3999),
    ]);

    const memberCountPerKom = new Map<string, number>();
    memberChunks.forEach((chunk) => {
      (chunk.data || []).forEach((m: any) => {
        if (m.komunitas_id) {
          memberCountPerKom.set(m.komunitas_id, (memberCountPerKom.get(m.komunitas_id) || 0) + 1);
        }
      });
    });

    // 2. Ambil seluruh data komunitas dalam chunk paralel
    const komChunks = await Promise.all([
      supabase.from("komunitas").select("id, nama, jenis, kecamatan, rw, rt").range(0, 999),
      supabase.from("komunitas").select("id, nama, jenis, kecamatan, rw, rt").range(1000, 1999),
      supabase.from("komunitas").select("id, nama, jenis, kecamatan, rw, rt").range(2000, 2999),
      supabase.from("komunitas").select("id, nama, jenis, kecamatan, rw, rt").range(3000, 3999),
      supabase.from("komunitas").select("id, nama, jenis, kecamatan, rw, rt").range(4000, 4999),
    ]);

    let allKoms: any[] = [];
    komChunks.forEach((chunk) => {
      if (chunk.data && chunk.data.length > 0) {
        allKoms = allKoms.concat(chunk.data);
      }
    });

    if (allKoms.length === 0) {
      return FALLBACK_KECAMATAN_STATS;
    }

    const categories = ["warga_kita", "posyandu", "satuan_paud", "pkbm_skb"];
    const results: Record<string, KecamatanCommunityStat[]> = {};

    for (const cat of categories) {
      results[cat] = KECAMATAN_ORDER.map((kec) => {
        let filtered: any[] = [];
        let mainLabel = "Komunitas RT";
        let labelTerisi = "RT Terisi";
        let labelKosong = "RT Kosong";

        if (cat === "warga_kita") {
          filtered = allKoms.filter(
            (k) =>
              k.jenis === "warga_kita" &&
              k.kecamatan === kec &&
              k.rt &&
              k.rt !== "" &&
              k.rt !== "semua" &&
              k.rt !== "00"
          );
          mainLabel = "Komunitas RT";
          labelTerisi = "RT Terisi";
          labelKosong = "RT Kosong";
        } else if (cat === "posyandu") {
          filtered = allKoms.filter(
            (k) => k.jenis === "posyandu" && k.kecamatan === kec
          );
          mainLabel = "Posyandu";
          labelTerisi = "Posyandu Terisi";
          labelKosong = "Posyandu Kosong";
        } else if (cat === "satuan_paud") {
          filtered = allKoms.filter(
            (k) =>
              k.jenis === "satuan_paud" &&
              k.kecamatan === kec &&
              !k.nama?.toLowerCase().includes("pkbm") &&
              !k.nama?.toLowerCase().includes("skb")
          );
          mainLabel = "Satuan PAUD";
          labelTerisi = "PAUD Terisi";
          labelKosong = "PAUD Kosong";
        } else if (cat === "pkbm_skb") {
          filtered = allKoms.filter(
            (k) =>
              (k.jenis === "pkbm_skb" ||
                k.nama?.toLowerCase().includes("pkbm") ||
                k.nama?.toLowerCase().includes("skb") ||
                k.nama?.toLowerCase().includes("sanggar kegiatan belajar")) &&
              k.kecamatan === kec
          );
          mainLabel = "Lembaga";
          labelTerisi = "Lembaga Terisi";
          labelKosong = "Lembaga Kosong";
        }

        let totalUsers = 0;
        let totalTerisi = 0;
        let totalKosong = 0;

        filtered.forEach((k) => {
          const c = memberCountPerKom.get(k.id) || 0;
          totalUsers += c;
          if (c > 0) totalTerisi++;
          else totalKosong++;
        });

        const totalMain = filtered.length;
        const pct = totalMain > 0 ? Math.round((totalTerisi / totalMain) * 1000) / 10 : 0.0;

        return {
          kecamatan: kec,
          totalMain,
          mainLabel,
          penggunaBergabung: totalUsers,
          totalTerisi,
          totalKosong,
          labelTerisi,
          labelKosong,
          persenTerisi: pct,
        };
      });
    }

    inMemoryStatsCache = {
      timestamp: Date.now(),
      data: results,
    };

    return results;
  } catch (err) {
    console.warn("computeAllKecamatanStats error, using fallback:", err);
    if (inMemoryStatsCache?.data) return inMemoryStatsCache.data;
    return FALLBACK_KECAMATAN_STATS;
  }
}

/**
 * Cache Next.js Shared Data untuk Statistik Komunitas 4 Kecamatan se-Kota Tegal
 * Revalidasi berkala 6 jam (21.600 detik) untuk menghemat pemakaian database Supabase
 */
const getCachedKecamatanStats = unstable_cache(
  async () => {
    return computeAllKecamatanStats();
  },
  ["komunitas-kecamatan-stats-v2"],
  {
    tags: ["komunitas-kecamatan-stats"],
    revalidate: 21600, // 6 jam di Shared Data Cache Next.js
  }
);

/**
 * Server Action: Mengambil data ringkasan 4 kecamatan untuk kategori komunitas tertentu
 */
export async function getKecamatanStatsAction(
  category: string = "warga_kita"
): Promise<KecamatanCommunityStat[]> {
  try {
    const allStats = await getCachedKecamatanStats();
    return allStats[category] || FALLBACK_KECAMATAN_STATS[category] || FALLBACK_KECAMATAN_STATS.warga_kita;
  } catch (err) {
    console.warn("getKecamatanStatsAction error:", err);
    return FALLBACK_KECAMATAN_STATS[category] || FALLBACK_KECAMATAN_STATS.warga_kita;
  }
}

/**
 * Server Action: Mengambil daftar komunitas yang telah diikuti oleh user yang sedang login
 */
export async function getUserJoinedCommunitiesAction(
  userId?: string | null
): Promise<UserJoinedCommunity[]> {
  if (!userId) return [];
  try {
    const supabase = await createClient();
    const { data: memberData } = await supabase
      .from("anggota_komunitas")
      .select("id, status, peran, komunitas_id, komunitas(id, nama, jenis, kecamatan, kelurahan, rw, rt)")
      .eq("user_id", userId)
      .eq("status", "approved");

    if (!memberData) return [];
    return memberData
      .filter((m: any) => m.komunitas)
      .map((m: any) => ({
        id: m.komunitas.id,
        nama: m.komunitas.nama,
        jenis: m.komunitas.jenis,
        kecamatan: m.komunitas.kecamatan || "",
        kelurahan: m.komunitas.kelurahan || "",
        rw: m.komunitas.rw || null,
        rt: m.komunitas.rt || null,
        peran: m.peran || "Anggota",
      }));
  } catch (err) {
    console.warn("getUserJoinedCommunitiesAction error:", err);
    return [];
  }
}
