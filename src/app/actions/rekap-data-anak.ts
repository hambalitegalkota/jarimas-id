"use server";

import { createClient } from "@/utils/supabase/server";
import { KOTA_TEGAL_DATA, findOrGenerateKomunitasSeed } from "@/lib/constants/tegal-data";
import {
  parseDataAnakDetails,
  isDataAtsRecord,
  normalizeWilayah,
} from "@/lib/data-anak-helpers";

export interface DaftarNamaAnakItem {
  id: string;
  namaLengkap: string;
  tanggalLahir?: string | null;
  usia: number;
  jenisKelamin: "L" | "P";
  namaOrangtua: string;
  nomorHp: string;
  tinggalBersama: string;
  isSekolah: boolean;
  namaSekolah: string;
  kategoriSekolah?: string;
  alasan: string;
  kkKabupaten: string;
  kkKecamatan: string;
  kkKelurahan: string;
  kkRw: string;
  kkRt: string;
  kkJalan: string;
  domisiliKabupaten: string;
  domisiliKecamatan: string;
  domisiliKelurahan: string;
  domisiliRw: string;
  domisiliRt: string;
  domisiliJalan: string;
  statusApproval: string;
  komunitasId: string;
  komunitasNama: string;
  createdAt: string;
}

export interface SchoolTypeBreakdown {
  tk: number;
  ra: number;
  kb: number;
  sps: number;
  tpa: number;
  skb: number;
  pkbm: number;
}

export interface GenderBreakdown {
  lakiLaki: number;
  perempuan: number;
  total: number;
}

export interface AgeGroupBreakdown {
  age0_1: number; // 0-1 tahun (0 - 23 bulan)
  age2: number;   // 2 tahun
  age3: number;   // 3 tahun
  age4: number;   // 4 tahun
  age5: number;   // 5 tahun
  age6: number;   // 6 tahun
}

export interface ReasonCount {
  alasan: string;
  jumlah: number;
  persentase: number;
}

export interface WilayahRekapItem {
  id: string;
  nama: string;
  tingkat: "kota" | "kecamatan" | "kelurahan";
  kecamatan?: string;
  totalAnak: number;
  totalBersekolah: number;
  totalTidakBersekolah: number;
  persenBersekolah: number;
  persenTidakBersekolah: number;

  // Rincian Anak Bersekolah
  bersekolahGender: GenderBreakdown;
  bersekolahJenjang: SchoolTypeBreakdown;
  bersekolahUsia: AgeGroupBreakdown;
  bersekolahAlasan: ReasonCount[];

  // Rincian Anak Tidak / Belum Bersekolah
  tidakBersekolahGender: GenderBreakdown;
  tidakBersekolahUsia: AgeGroupBreakdown;
  tidakBersekolahAlasan: ReasonCount[];
}

export interface RekapDataAnakUsiaDiniResult {
  kota: WilayahRekapItem;
  kecamatanList: WilayahRekapItem[];
  kelurahanList: WilayahRekapItem[];
  lastUpdated: string;
  totalLiveRecords: number;
}

const DAFTAR_ALASAN_BERSEKOLAH = [
  "Stimulasi & Pendidikan Usia Dini",
  "Melatih Kemandirian & Sosialisasi",
  "Persiapan Masuk Sekolah Dasar (SD)",
  "Pengembangan Bahasa & Kognitif",
  "Pengembangan Minat, Bakat & Motorik",
  "Fasilitas Belajar & Bermain Lengkap",
  "Dorongan Orang Tua & Lingkungan",
  "Alasan Lainnya",
];

const DAFTAR_ALASAN_TIDAK_SEKOLAH = [
  "Belum Cukup Usia / Masih Balita",
  "Keterbatasan Biaya / Ekonomi",
  "Jarak ke Sekolah Jauh / Transportasi",
  "Tidak Ada yang Mengantar / Menjemput",
  "Anak Belum Siap Mental / Mandiri",
  "Pola Asuh Mandiri di Rumah",
  "Kondisi Kesehatan / Khusus",
  "Alasan Lainnya",
];

function calculateAgeFromBirthDate(birthDateStr?: string | null): number {
  if (!birthDateStr) return 4;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return 4;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(0, Math.min(10, age));
}

function classifySchoolType(namaSekolah?: string | null): keyof SchoolTypeBreakdown {
  const s = (namaSekolah || "").toUpperCase();
  if (s.includes("TK") || s.includes("TAMAN KANAK")) return "tk";
  if (s.includes("RA") || s.includes("RAUDHATUL") || s.includes("BA")) return "ra";
  if (s.includes("KB") || s.includes("KELOMPOK BERMAIN") || s.includes("KBI")) return "kb";
  if (s.includes("SPS") || s.includes("POS PAUD") || s.includes("PAUD TPQ")) return "sps";
  if (s.includes("TPA") || s.includes("PENITIPAN")) return "tpa";
  if (s.includes("SKB") || s.includes("SANGGAR KEGIATAN")) return "skb";
  if (s.includes("PKBM") || s.includes("PUSAT KEGIATAN")) return "pkbm";
  return "tk";
}

function normalizeReasonBersekolah(raw?: string | null): string {
  const s = (raw || "").toLowerCase();
  if (s.includes("stimulasi") || s.includes("pendidikan") || s.includes("terbaik")) return "Stimulasi & Pendidikan Usia Dini";
  if (s.includes("mandiri") || s.includes("sosialisasi") || s.includes("teman")) return "Melatih Kemandirian & Sosialisasi";
  if (s.includes("sd") || s.includes("sekolah dasar") || s.includes("persiapan")) return "Persiapan Masuk Sekolah Dasar (SD)";
  if (s.includes("bahasa") || s.includes("kognitif") || s.includes("bicara")) return "Pengembangan Bahasa & Kognitif";
  if (s.includes("motorik") || s.includes("bakat") || s.includes("kreatif")) return "Pengembangan Minat, Bakat & Motorik";
  if (s.includes("fasilitas") || s.includes("bermain") || s.includes("dekat")) return "Fasilitas Belajar & Bermain Lengkap";
  if (s.includes("orang tua") || s.includes("keluarga") || s.includes("lingkungan") || s.includes("usia paud")) return "Dorongan Orang Tua & Lingkungan";
  return "Stimulasi & Pendidikan Usia Dini";
}

function normalizeReasonTidakSekolah(raw?: string | null, age: number = 2): string {
  const s = (raw || "").toLowerCase();
  if (s.includes("belum wajib") || s.includes("balita") || s.includes("usia") || s.includes("belum cukup") || age <= 2) {
    return "Belum Cukup Usia / Masih Balita";
  }
  if (s.includes("biaya") || s.includes("ekonomi") || s.includes("dana") || s.includes("uang")) {
    return "Keterbatasan Biaya / Ekonomi";
  }
  if (s.includes("jauh") || s.includes("jarak") || s.includes("transportasi")) {
    return "Jarak ke Sekolah Jauh / Transportasi";
  }
  if (s.includes("antar") || s.includes("jemput") || s.includes("sibuk")) {
    return "Tidak Ada yang Mengantar / Menjemput";
  }
  if (s.includes("mental") || s.includes("takut") || s.includes("menangis") || s.includes("belum siap")) {
    return "Anak Belum Siap Mental / Mandiri";
  }
  if (s.includes("asuh") || s.includes("rumah") || s.includes("nenek")) {
    return "Pola Asuh Mandiri di Rumah";
  }
  if (s.includes("sakit") || s.includes("khusus") || s.includes("kesehatan")) {
    return "Kondisi Kesehatan / Khusus";
  }
  return "Belum Cukup Usia / Masih Balita";
}

function createEmptyRekapWilayah(id: string, nama: string, tingkat: "kota" | "kecamatan" | "kelurahan", kecamatan?: string): WilayahRekapItem {
  return {
    id,
    nama,
    tingkat,
    kecamatan,
    totalAnak: 0,
    totalBersekolah: 0,
    totalTidakBersekolah: 0,
    persenBersekolah: 0,
    persenTidakBersekolah: 0,
    bersekolahGender: { lakiLaki: 0, perempuan: 0, total: 0 },
    bersekolahJenjang: { tk: 0, ra: 0, kb: 0, sps: 0, tpa: 0, skb: 0, pkbm: 0 },
    bersekolahUsia: { age0_1: 0, age2: 0, age3: 0, age4: 0, age5: 0, age6: 0 },
    bersekolahAlasan: DAFTAR_ALASAN_BERSEKOLAH.map((alasan) => ({ alasan, jumlah: 0, persentase: 0 })),
    tidakBersekolahGender: { lakiLaki: 0, perempuan: 0, total: 0 },
    tidakBersekolahUsia: { age0_1: 0, age2: 0, age3: 0, age4: 0, age5: 0, age6: 0 },
    tidakBersekolahAlasan: DAFTAR_ALASAN_TIDAK_SEKOLAH.map((alasan) => ({ alasan, jumlah: 0, persentase: 0 })),
  };
}

/**
 * Server Action: Mengambil Rekapitulasi Berjenjang Data Anak Usia Dini MURNI dari Database Riil
 */
export async function getRekapDataAnakUsiaDiniAction(): Promise<{
  success: boolean;
  data: RekapDataAnakUsiaDiniResult;
  message?: string;
}> {
  try {
    const supabase = await createClient();

    // 1. Ambil data_anak dari database
    const { data: dbChildren, error: fetchErr } = await supabase
      .from("data_anak")
      .select(`
        id,
        nama_lengkap,
        tanggal_lahir,
        jenis_kelamin,
        is_sekolah,
        nama_sekolah,
        alasan_sekolah,
        komunitas_id,
        created_at
      `);

    if (fetchErr) {
      console.warn("Rekap data_anak fetch warning:", fetchErr.message);
    }

    // Filter ketat: Hanya data anak balita / PAUD riil (BUKAN data ATS)
    const validLiveChildren = (dbChildren || []).filter((c) => !isDataAtsRecord(c));
    const totalLiveRecords = validLiveChildren.length;

    // 2. Inisialisasi seluruh 27 Kelurahan resmi Kota Tegal
    const kelurahanMap = new Map<string, WilayahRekapItem>();

    for (const [kecName, kecObj] of Object.entries(KOTA_TEGAL_DATA)) {
      for (const kelName of Object.keys(kecObj.kelurahan)) {
        const item = createEmptyRekapWilayah(
          `kel-${kelName.toLowerCase().replace(/\s+/g, "-")}`,
          kelName,
          "kelurahan",
          kecName
        );
        kelurahanMap.set(kelName.toLowerCase(), item);
      }
    }

    // 3. Akumulasikan seluruh data riil dari database Supabase
    if (validLiveChildren.length > 0) {
      for (const child of validLiveChildren) {
        const parsed = parseDataAnakDetails(child.alasan_sekolah);
        const kelTarget = normalizeWilayah(parsed.domisiliKelurahan || parsed.kkKelurahan || "");

        // Cari kelurahan target yang cocok
        let targetKelItem = kelurahanMap.get(kelTarget);
        if (!targetKelItem) {
          for (const [kKey, kVal] of kelurahanMap.entries()) {
            if (kKey.includes(kelTarget) || kelTarget.includes(kKey)) {
              targetKelItem = kVal;
              break;
            }
          }
        }

        // Fallback kelurahan pertama jika tidak teridentifikasi
        if (!targetKelItem) {
          targetKelItem = kelurahanMap.get("kejambon") || Array.from(kelurahanMap.values())[0];
        }

        if (targetKelItem) {
          const age = calculateAgeFromBirthDate(child.tanggal_lahir);
          const isLaki = (child.jenis_kelamin || "L").toUpperCase() === "L";
          const isSekolah =
            child.is_sekolah === true ||
            Boolean(child.nama_sekolah && !child.nama_sekolah.toLowerCase().includes("belum"));

          targetKelItem.totalAnak += 1;

          if (isSekolah) {
            targetKelItem.totalBersekolah += 1;
            if (isLaki) {
              targetKelItem.bersekolahGender.lakiLaki += 1;
            } else {
              targetKelItem.bersekolahGender.perempuan += 1;
            }
            targetKelItem.bersekolahGender.total += 1;

            const st = classifySchoolType(child.nama_sekolah);
            targetKelItem.bersekolahJenjang[st] += 1;

            if (age <= 1) targetKelItem.bersekolahUsia.age0_1 += 1;
            else if (age === 2) targetKelItem.bersekolahUsia.age2 += 1;
            else if (age === 3) targetKelItem.bersekolahUsia.age3 += 1;
            else if (age === 4) targetKelItem.bersekolahUsia.age4 += 1;
            else if (age === 5) targetKelItem.bersekolahUsia.age5 += 1;
            else targetKelItem.bersekolahUsia.age6 += 1;

            const normReason = normalizeReasonBersekolah(parsed.alasan);
            const rObj = targetKelItem.bersekolahAlasan.find((r) => r.alasan === normReason);
            if (rObj) rObj.jumlah += 1;
          } else {
            targetKelItem.totalTidakBersekolah += 1;
            if (isLaki) {
              targetKelItem.tidakBersekolahGender.lakiLaki += 1;
            } else {
              targetKelItem.tidakBersekolahGender.perempuan += 1;
            }
            targetKelItem.tidakBersekolahGender.total += 1;

            if (age <= 1) targetKelItem.tidakBersekolahUsia.age0_1 += 1;
            else if (age === 2) targetKelItem.tidakBersekolahUsia.age2 += 1;
            else if (age === 3) targetKelItem.tidakBersekolahUsia.age3 += 1;
            else if (age === 4) targetKelItem.tidakBersekolahUsia.age4 += 1;
            else if (age === 5) targetKelItem.tidakBersekolahUsia.age5 += 1;
            else targetKelItem.tidakBersekolahUsia.age6 += 1;

            const normReasonTB = normalizeReasonTidakSekolah(parsed.alasan, age);
            const rObjTB = targetKelItem.tidakBersekolahAlasan.find((r) => r.alasan === normReasonTB);
            if (rObjTB) rObjTB.jumlah += 1;
          }

          // Hitung persentase
          targetKelItem.persenBersekolah =
            targetKelItem.totalAnak > 0
              ? Math.round((targetKelItem.totalBersekolah / targetKelItem.totalAnak) * 100)
              : 0;
          targetKelItem.persenTidakBersekolah =
            targetKelItem.totalAnak > 0
              ? Math.round((targetKelItem.totalTidakBersekolah / targetKelItem.totalAnak) * 100)
              : 0;

          targetKelItem.bersekolahAlasan.forEach((r) => {
            r.persentase =
              targetKelItem!.totalBersekolah > 0
                ? Math.round((r.jumlah / targetKelItem!.totalBersekolah) * 100)
                : 0;
          });
          targetKelItem.tidakBersekolahAlasan.forEach((r) => {
            r.persentase =
              targetKelItem!.totalTidakBersekolah > 0
                ? Math.round((r.jumlah / targetKelItem!.totalTidakBersekolah) * 100)
                : 0;
          });
        }
      }
    }

    const kelurahanList = Array.from(kelurahanMap.values()).sort((a, b) => a.nama.localeCompare(b.nama));

    // 4. Bangun Agregat Tingkat Kecamatan (4 Kecamatan)
    const kecamatanList: WilayahRekapItem[] = Object.keys(KOTA_TEGAL_DATA).map((kecName) => {
      const kelsInKec = kelurahanList.filter((k) => k.kecamatan === kecName);
      const kecItem = createEmptyRekapWilayah(
        `kec-${kecName.toLowerCase().replace(/\s+/g, "-")}`,
        kecName,
        "kecamatan"
      );

      for (const kel of kelsInKec) {
        kecItem.totalAnak += kel.totalAnak;
        kecItem.totalBersekolah += kel.totalBersekolah;
        kecItem.totalTidakBersekolah += kel.totalTidakBersekolah;

        kecItem.bersekolahGender.lakiLaki += kel.bersekolahGender.lakiLaki;
        kecItem.bersekolahGender.perempuan += kel.bersekolahGender.perempuan;
        kecItem.bersekolahGender.total += kel.bersekolahGender.total;

        kecItem.bersekolahJenjang.tk += kel.bersekolahJenjang.tk;
        kecItem.bersekolahJenjang.ra += kel.bersekolahJenjang.ra;
        kecItem.bersekolahJenjang.kb += kel.bersekolahJenjang.kb;
        kecItem.bersekolahJenjang.sps += kel.bersekolahJenjang.sps;
        kecItem.bersekolahJenjang.tpa += kel.bersekolahJenjang.tpa;
        kecItem.bersekolahJenjang.skb += kel.bersekolahJenjang.skb;
        kecItem.bersekolahJenjang.pkbm += kel.bersekolahJenjang.pkbm;

        kecItem.bersekolahUsia.age0_1 += kel.bersekolahUsia.age0_1;
        kecItem.bersekolahUsia.age2 += kel.bersekolahUsia.age2;
        kecItem.bersekolahUsia.age3 += kel.bersekolahUsia.age3;
        kecItem.bersekolahUsia.age4 += kel.bersekolahUsia.age4;
        kecItem.bersekolahUsia.age5 += kel.bersekolahUsia.age5;
        kecItem.bersekolahUsia.age6 += kel.bersekolahUsia.age6;

        kel.bersekolahAlasan.forEach((r, idx) => {
          kecItem.bersekolahAlasan[idx].jumlah += r.jumlah;
        });

        kecItem.tidakBersekolahGender.lakiLaki += kel.tidakBersekolahGender.lakiLaki;
        kecItem.tidakBersekolahGender.perempuan += kel.tidakBersekolahGender.perempuan;
        kecItem.tidakBersekolahGender.total += kel.tidakBersekolahGender.total;

        kecItem.tidakBersekolahUsia.age0_1 += kel.tidakBersekolahUsia.age0_1;
        kecItem.tidakBersekolahUsia.age2 += kel.tidakBersekolahUsia.age2;
        kecItem.tidakBersekolahUsia.age3 += kel.tidakBersekolahUsia.age3;
        kecItem.tidakBersekolahUsia.age4 += kel.tidakBersekolahUsia.age4;
        kecItem.tidakBersekolahUsia.age5 += kel.tidakBersekolahUsia.age5;
        kecItem.tidakBersekolahUsia.age6 += kel.tidakBersekolahUsia.age6;

        kel.tidakBersekolahAlasan.forEach((r, idx) => {
          kecItem.tidakBersekolahAlasan[idx].jumlah += r.jumlah;
        });
      }

      kecItem.persenBersekolah =
        kecItem.totalAnak > 0
          ? Math.round((kecItem.totalBersekolah / kecItem.totalAnak) * 100)
          : 0;
      kecItem.persenTidakBersekolah =
        kecItem.totalAnak > 0
          ? Math.round((kecItem.totalTidakBersekolah / kecItem.totalAnak) * 100)
          : 0;

      kecItem.bersekolahAlasan.forEach((r) => {
        r.persentase =
          kecItem.totalBersekolah > 0
            ? Math.round((r.jumlah / kecItem.totalBersekolah) * 100)
            : 0;
      });
      kecItem.tidakBersekolahAlasan.forEach((r) => {
        r.persentase =
          kecItem.totalTidakBersekolah > 0
            ? Math.round((r.jumlah / kecItem.totalTidakBersekolah) * 100)
            : 0;
      });

      return kecItem;
    });

    // 5. Bangun Agregat Tingkat Kota Tegal
    const kotaItem = createEmptyRekapWilayah("kota-tegal", "Kota Tegal", "kota");

    for (const kec of kecamatanList) {
      kotaItem.totalAnak += kec.totalAnak;
      kotaItem.totalBersekolah += kec.totalBersekolah;
      kotaItem.totalTidakBersekolah += kec.totalTidakBersekolah;

      kotaItem.bersekolahGender.lakiLaki += kec.bersekolahGender.lakiLaki;
      kotaItem.bersekolahGender.perempuan += kec.bersekolahGender.perempuan;
      kotaItem.bersekolahGender.total += kec.bersekolahGender.total;

      kotaItem.bersekolahJenjang.tk += kec.bersekolahJenjang.tk;
      kotaItem.bersekolahJenjang.ra += kec.bersekolahJenjang.ra;
      kotaItem.bersekolahJenjang.kb += kec.bersekolahJenjang.kb;
      kotaItem.bersekolahJenjang.sps += kec.bersekolahJenjang.sps;
      kotaItem.bersekolahJenjang.tpa += kec.bersekolahJenjang.tpa;
      kotaItem.bersekolahJenjang.skb += kec.bersekolahJenjang.skb;
      kotaItem.bersekolahJenjang.pkbm += kec.bersekolahJenjang.pkbm;

      kotaItem.bersekolahUsia.age0_1 += kec.bersekolahUsia.age0_1;
      kotaItem.bersekolahUsia.age2 += kec.bersekolahUsia.age2;
      kotaItem.bersekolahUsia.age3 += kec.bersekolahUsia.age3;
      kotaItem.bersekolahUsia.age4 += kec.bersekolahUsia.age4;
      kotaItem.bersekolahUsia.age5 += kec.bersekolahUsia.age5;
      kotaItem.bersekolahUsia.age6 += kec.bersekolahUsia.age6;

      kec.bersekolahAlasan.forEach((r, idx) => {
        kotaItem.bersekolahAlasan[idx].jumlah += r.jumlah;
      });

      kotaItem.tidakBersekolahGender.lakiLaki += kec.tidakBersekolahGender.lakiLaki;
      kotaItem.tidakBersekolahGender.perempuan += kec.tidakBersekolahGender.perempuan;
      kotaItem.tidakBersekolahGender.total += kec.tidakBersekolahGender.total;

      kotaItem.tidakBersekolahUsia.age0_1 += kec.tidakBersekolahUsia.age0_1;
      kotaItem.tidakBersekolahUsia.age2 += kec.tidakBersekolahUsia.age2;
      kotaItem.tidakBersekolahUsia.age3 += kec.tidakBersekolahUsia.age3;
      kotaItem.tidakBersekolahUsia.age4 += kec.tidakBersekolahUsia.age4;
      kotaItem.tidakBersekolahUsia.age5 += kec.tidakBersekolahUsia.age5;
      kotaItem.tidakBersekolahUsia.age6 += kec.tidakBersekolahUsia.age6;

      kec.tidakBersekolahAlasan.forEach((r, idx) => {
        kotaItem.tidakBersekolahAlasan[idx].jumlah += r.jumlah;
      });
    }

    kotaItem.persenBersekolah =
      kotaItem.totalAnak > 0
        ? Math.round((kotaItem.totalBersekolah / kotaItem.totalAnak) * 100)
        : 0;
    kotaItem.persenTidakBersekolah =
      kotaItem.totalAnak > 0
        ? Math.round((kotaItem.totalTidakBersekolah / kotaItem.totalAnak) * 100)
        : 0;

    kotaItem.bersekolahAlasan.forEach((r) => {
      r.persentase =
        kotaItem.totalBersekolah > 0
          ? Math.round((r.jumlah / kotaItem.totalBersekolah) * 100)
          : 0;
    });
    kotaItem.tidakBersekolahAlasan.forEach((r) => {
      r.persentase =
        kotaItem.totalTidakBersekolah > 0
          ? Math.round((r.jumlah / kotaItem.totalTidakBersekolah) * 100)
          : 0;
    });

    return {
      success: true,
      data: {
        kota: kotaItem,
        kecamatanList,
        kelurahanList,
        lastUpdated: new Date().toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        totalLiveRecords,
      },
    };
  } catch (err: any) {
    console.error("Error getRekapDataAnakUsiaDiniAction:", err);
    return {
      success: false,
      message: err.message || "Gagal menghasilkan rekap data anak usia dini.",
      data: {
        kota: createEmptyRekapWilayah("kota-tegal", "Kota Tegal", "kota"),
        kecamatanList: [],
        kelurahanList: [],
        lastUpdated: new Date().toISOString(),
        totalLiveRecords: 0,
      },
    };
  }
}

/**
 * Server Action: Mengecek Hak Akses Pengguna (Admin Komunitas / Super Admin) untuk melihat Daftar Nama Anak
 */
export async function checkUserRekapAdminAccess(): Promise<{
  canAccess: boolean;
  isSuperAdmin: boolean;
  isAdminKomunitas: boolean;
  userPeran?: string;
  userName?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { canAccess: false, isSuperAdmin: false, isAdminKomunitas: false };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, nama_lengkap")
      .eq("id", user.id)
      .maybeSingle();

    const isSuperAdmin = profile?.is_super_admin === true;
    if (isSuperAdmin) {
      return {
        canAccess: true,
        isSuperAdmin: true,
        isAdminKomunitas: true,
        userPeran: "Super Admin",
        userName: profile?.nama_lengkap || "Super Admin",
      };
    }

    // Cek keanggotaan admin komunitas aktif
    const { data: memberships } = await supabase
      .from("anggota_komunitas")
      .select("peran, status")
      .eq("user_id", user.id)
      .eq("status", "approved");

    const hasAdminRole = (memberships || []).some((m) => {
      const p = (m.peran || "").toLowerCase();
      return (
        p.includes("admin") ||
        p.includes("pengurus") ||
        p.includes("kader") ||
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
    });

    return {
      canAccess: hasAdminRole,
      isSuperAdmin: false,
      isAdminKomunitas: hasAdminRole,
      userPeran: hasAdminRole ? "Admin Komunitas" : "Anggota",
      userName: profile?.nama_lengkap || "Pengguna",
    };
  } catch {
    return { canAccess: false, isSuperAdmin: false, isAdminKomunitas: false };
  }
}

/**
 * Server Action: Mengambil Daftar Lengkap Nama Anak Usia Dini untuk Admin Komunitas & Super Admin
 */
export async function getDaftarNamaAnakRekapAction(params: {
  tingkat: "kota" | "kecamatan" | "kelurahan";
  kecamatan?: string;
  kelurahan?: string;
  kategori?: "semua" | "bersekolah" | "tidak_sekolah";
  search?: string;
}): Promise<{
  success: boolean;
  message?: string;
  data: DaftarNamaAnakItem[];
  total: number;
}> {
  try {
    const authStatus = await checkUserRekapAdminAccess();
    if (!authStatus.canAccess) {
      return {
        success: false,
        message: "Akses Ditolak: Fitur Daftar Nama Anak hanya dapat diakses oleh Admin Komunitas dan Super Admin.",
        data: [],
        total: 0,
      };
    }

    const supabase = await createClient();

    // 1. Ambil seluruh komunitas untuk pemetaan nama & metadata
    const { data: allKom } = await supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, rw, rt");
    const komMap = new Map((allKom || []).map((k: any) => [k.id, k]));

    // 2. Query data_anak
    const { data: dbChildren, error: fetchErr } = await supabase
      .from("data_anak")
      .select(`
        id,
        nama_lengkap,
        tanggal_lahir,
        jenis_kelamin,
        nama_orangtua,
        nomor_hp,
        tinggal_bersama,
        is_sekolah,
        nama_sekolah,
        alasan_sekolah,
        komunitas_id,
        status_approval,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (fetchErr) {
      return {
        success: false,
        message: fetchErr.message,
        data: [],
        total: 0,
      };
    }

    // Filter ketat: Bukan data ATS
    const validLiveChildren = (dbChildren || []).filter((c) => !isDataAtsRecord(c));
    const resultList: DaftarNamaAnakItem[] = [];

    for (const child of validLiveChildren) {
      const kom = komMap.get(child.komunitas_id) || findOrGenerateKomunitasSeed(child.komunitas_id);
      const parsed = parseDataAnakDetails(child.alasan_sekolah, kom);
      const age = calculateAgeFromBirthDate(child.tanggal_lahir);
      const isSekolah =
        child.is_sekolah === true ||
        Boolean(child.nama_sekolah && !child.nama_sekolah.toLowerCase().includes("belum"));

      const itemKec = normalizeWilayah(parsed.domisiliKecamatan || parsed.kkKecamatan || kom?.kecamatan || "");
      const itemKel = normalizeWilayah(parsed.domisiliKelurahan || parsed.kkKelurahan || kom?.kelurahan || "");

      // Filter Tingkat Wilayah
      if (params.tingkat === "kecamatan" && params.kecamatan) {
        const targetKec = normalizeWilayah(params.kecamatan);
        if (!itemKec.includes(targetKec) && !targetKec.includes(itemKec)) {
          continue;
        }
      } else if (params.tingkat === "kelurahan" && params.kelurahan) {
        const targetKel = normalizeWilayah(params.kelurahan);
        if (!itemKel.includes(targetKel) && !targetKel.includes(itemKel)) {
          continue;
        }
      }

      // Filter Kategori (Bersekolah / Belum Bersekolah)
      if (params.kategori === "bersekolah" && !isSekolah) {
        continue;
      }
      if (params.kategori === "tidak_sekolah" && isSekolah) {
        continue;
      }

      // Filter Search
      if (params.search && params.search.trim()) {
        const q = params.search.toLowerCase().trim();
        const matchName = (child.nama_lengkap || "").toLowerCase().includes(q);
        const matchParent = (child.nama_orangtua || "").toLowerCase().includes(q);
        const matchSchool = (child.nama_sekolah || "").toLowerCase().includes(q);
        const matchReason = (parsed.alasan || "").toLowerCase().includes(q);
        const matchKel = itemKel.includes(q);
        if (!matchName && !matchParent && !matchSchool && !matchReason && !matchKel) {
          continue;
        }
      }

      const gender = (child.jenis_kelamin || "L").toUpperCase() === "P" ? "P" : "L";

      resultList.push({
        id: child.id,
        namaLengkap: child.nama_lengkap || "Tanpa Nama",
        tanggalLahir: child.tanggal_lahir,
        usia: age,
        jenisKelamin: gender,
        namaOrangtua: child.nama_orangtua || "-",
        nomorHp: child.nomor_hp || "-",
        tinggalBersama: child.tinggal_bersama || "Orang Tua",
        isSekolah,
        namaSekolah: child.nama_sekolah || (isSekolah ? "Satuan PAUD" : "-"),
        kategoriSekolah: isSekolah ? classifySchoolType(child.nama_sekolah) : undefined,
        alasan: parsed.alasan || (isSekolah ? "Stimulasi & Pendidikan Usia Dini" : "Belum Cukup Usia / Masih Balita"),
        kkKabupaten: parsed.kkKabupaten || "Kota Tegal",
        kkKecamatan: parsed.kkKecamatan || "Tegal Timur",
        kkKelurahan: parsed.kkKelurahan || "Kejambon",
        kkRw: parsed.kkRw || "01",
        kkRt: parsed.kkRt || "01",
        kkJalan: parsed.kkJalan || "",
        domisiliKabupaten: parsed.domisiliKabupaten || "Kota Tegal",
        domisiliKecamatan: parsed.domisiliKecamatan || "Tegal Timur",
        domisiliKelurahan: parsed.domisiliKelurahan || "Kejambon",
        domisiliRw: parsed.domisiliRw || "01",
        domisiliRt: parsed.domisiliRt || "01",
        domisiliJalan: parsed.domisiliJalan || "",
        statusApproval: child.status_approval || "approved",
        komunitasId: child.komunitas_id,
        komunitasNama: kom?.nama || "Komunitas",
        createdAt: child.created_at || new Date().toISOString(),
      });
    }

    return {
      success: true,
      data: resultList,
      total: resultList.length,
    };
  } catch (err: any) {
    console.error("Error getDaftarNamaAnakRekapAction:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat daftar nama anak.",
      data: [],
      total: 0,
    };
  }
}
