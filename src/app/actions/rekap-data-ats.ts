"use server";

import { createClient } from "@/utils/supabase/server";
import { KOTA_TEGAL_DATA, findOrGenerateKomunitasSeed } from "@/lib/constants/tegal-data";
import {
  isDataAtsRecord,
  normalizeWilayah,
  parseAtsDetails,
} from "@/lib/data-anak-helpers";
import { checkUserRekapAdminAccess } from "@/app/actions/rekap-data-anak";

export interface DaftarNamaAtsItem {
  id: string;
  namaLengkap: string;
  tanggalLahir?: string | null;
  usia: number | string;
  jenisKelamin: "L" | "P";
  namaOrangtua: string;
  nomorHp: string;
  tinggalBersama: string;
  kategoriAts: "Putus Sekolah (DO)" | "Lulus Tidak Melanjutkan (LTM)" | "Belum Pernah Sekolah (BPS)";
  keinginanSekolah: "Masih Ada" | "Tidak Ada";
  alasanTidakSekolah: string;
  sekolahSebelumnya: string;
  kelasTerakhir: string;
  keterangan: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  statusApproval: string;
  komunitasId: string;
  komunitasNama: string;
  createdAt: string;
}

export interface AtsCategoryBreakdown {
  putusSekolah: number; // DO (Drop Out)
  lulusTidakLanjut: number; // LTM
  belumPernahSekolah: number; // BPS
}

export interface AtsKeinginanBreakdown {
  masihAda: number; // Ingin sekolah kembali
  tidakAda: number; // Tidak ingin / ragu
}

export interface AtsGenderBreakdown {
  lakiLaki: number;
  perempuan: number;
  total: number;
}

export interface AtsJenjangAsalBreakdown {
  belumSekolah: number;
  paudTk: number;
  sdMi: number;
  smpMts: number;
  smaSmk: number;
}

export interface AtsAgeGroupBreakdown {
  age4_6: number;   // 4-6 tahun (Pra-SD)
  age7_12: number;  // 7-12 tahun (Usia Wajib Belajar SD)
  age13_15: number; // 13-15 tahun (Usia Wajib Belajar SMP)
  age16_18: number; // 16-18 tahun (Usia Wajib Belajar SMA/SMK)
  ageAbove18: number; // >18 tahun (Usia Dewasa / Kesetaraan Paket C)
}

export interface AtsReasonCount {
  alasan: string;
  jumlah: number;
  persentase: number;
}

export interface AtsIntervensiRecommendation {
  jalur: string;
  deskripsi: string;
  jumlahTarget: number;
  persentase: number;
  lembagaTujuan: string;
}

export interface WilayahRekapAtsItem {
  id: string;
  nama: string;
  tingkat: "kota" | "kecamatan" | "kelurahan";
  kecamatan?: string;
  totalAts: number;
  
  kategori: AtsCategoryBreakdown;
  keinginan: AtsKeinginanBreakdown;
  gender: AtsGenderBreakdown;
  jenjangAsal: AtsJenjangAsalBreakdown;
  usia: AtsAgeGroupBreakdown;
  alasanList: AtsReasonCount[];
  rekomendasiList: AtsIntervensiRecommendation[];
  
  persenInginSekolah: number;
  persenPutusSekolah: number;
}

export interface RekapDataAtsResult {
  kota: WilayahRekapAtsItem;
  kecamatanList: WilayahRekapAtsItem[];
  kelurahanList: WilayahRekapAtsItem[];
  lastUpdated: string;
  totalLiveRecords: number;
}

const DAFTAR_ALASAN_ATS = [
  "Tidak ada biaya / Keterbatasan ekonomi",
  "Bekerja / Membantu ekonomi orang tua",
  "Terkendala jarak sekolah & sistem zonasi",
  "Kurang minat / motivasi belajar rendah",
  "Masalah kesehatan / disabilitas",
  "Menikah dini / alasan keluarga",
  "Korban perundungan (bullying) di sekolah",
  "Pengaruh lingkungan sekitar",
  "Alasan lainnya",
];

function calculateAgeFromBirthDate(birthDateStr?: string | null): number {
  if (!birthDateStr) return 14;
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return 14;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return Math.max(4, Math.min(25, age));
}

function normalizeReasonAts(raw?: string | null): string {
  const s = (raw || "").toLowerCase();
  if (s.includes("biaya") || s.includes("ekonomi") || s.includes("dana") || s.includes("uang")) {
    return "Tidak ada biaya / Keterbatasan ekonomi";
  }
  if (s.includes("bekerja") || s.includes("bantu") || s.includes("orang tua") || s.includes("nafkah")) {
    return "Bekerja / Membantu ekonomi orang tua";
  }
  if (s.includes("zonasi") || s.includes("jarak") || s.includes("jauh") || s.includes("transportasi")) {
    return "Terkendala jarak sekolah & sistem zonasi";
  }
  if (s.includes("minat") || s.includes("motivasi") || s.includes("malas") || s.includes("tidak mau")) {
    return "Kurang minat / motivasi belajar rendah";
  }
  if (s.includes("kesehatan") || s.includes("sakit") || s.includes("disabilitas") || s.includes("khusus")) {
    return "Masalah kesehatan / disabilitas";
  }
  if (s.includes("nikah") || s.includes("menikah") || s.includes("hamil") || s.includes("keluarga")) {
    return "Menikah dini / alasan keluarga";
  }
  if (s.includes("bully") || s.includes("perundungan") || s.includes("diejek") || s.includes("takut")) {
    return "Korban perundungan (bullying) di sekolah";
  }
  if (s.includes("lingkungan") || s.includes("teman") || s.includes("pengaruh")) {
    return "Pengaruh lingkungan sekitar";
  }
  return "Tidak ada biaya / Keterbatasan ekonomi";
}

function createEmptyRekapWilayahAts(id: string, nama: string, tingkat: "kota" | "kecamatan" | "kelurahan", kecamatan?: string): WilayahRekapAtsItem {
  return {
    id,
    nama,
    tingkat,
    kecamatan,
    totalAts: 0,
    kategori: { putusSekolah: 0, lulusTidakLanjut: 0, belumPernahSekolah: 0 },
    keinginan: { masihAda: 0, tidakAda: 0 },
    gender: { lakiLaki: 0, perempuan: 0, total: 0 },
    jenjangAsal: { belumSekolah: 0, paudTk: 0, sdMi: 0, smpMts: 0, smaSmk: 0 },
    usia: { age4_6: 0, age7_12: 0, age13_15: 0, age16_18: 0, ageAbove18: 0 },
    alasanList: DAFTAR_ALASAN_ATS.map((alasan) => ({ alasan, jumlah: 0, persentase: 0 })),
    rekomendasiList: [
      {
        jalur: "Program Kesetaraan Paket B (Setara SMP)",
        deskripsi: "Pendidikan nonformal jenjang menengah pertama dengan jadwal fleksibel.",
        jumlahTarget: 0,
        persentase: 0,
        lembagaTujuan: "UPTD SPNF SKB & PKBM se-Kota Tegal",
      },
      {
        jalur: "Program Kesetaraan Paket C (Setara SMA/SMK)",
        deskripsi: "Pendidikan kesetaraan menengah atas untuk melanjutkan kuliah atau bekerja.",
        jumlahTarget: 0,
        persentase: 0,
        lembagaTujuan: "PKBM Sakila Kerti, Citra Mandiri, Star of Tomorrow, dll.",
      },
      {
        jalur: "Program Kesetaraan Paket A (Setara SD)",
        deskripsi: "Pendidikan dasar membaca, menulis, berhitung dan materi pokok SD.",
        jumlahTarget: 0,
        persentase: 0,
        lembagaTujuan: "SKB Kota Tegal & PKBM Mitra",
      },
      {
        jalur: "Reintegrasi Sekolah Formal & Bantuan Beasiswa",
        deskripsi: "Advokasi kembali ke bangku sekolah formal didukung KIP & Baznas Kota Tegal.",
        jumlahTarget: 0,
        persentase: 0,
        lembagaTujuan: "Dinas Pendidikan Kota Tegal / Sekolah Negeri & Swasta",
      },
      {
        jalur: "Pelatihan Vokasi & Keterampilan Kerja",
        deskripsi: "Kursus keahlian praktis, otomotif, komputer, tata boga, dan digital kreatif.",
        jumlahTarget: 0,
        persentase: 0,
        lembagaTujuan: "UPTD SPNF SKB Kota Tegal & Balai Latihan Kerja",
      },
    ],
    persenInginSekolah: 0,
    persenPutusSekolah: 0,
  };
}

/**
 * Server Action: Mengambil Rekapitulasi Lengkap Berjenjang Data Anak Tidak Sekolah (ATS) MURNI dari Database Riil
 */
export async function getRekapDataAtsAction(): Promise<{
  success: boolean;
  data: RekapDataAtsResult;
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
      console.warn("Rekap ATS fetch warning:", fetchErr.message);
    }

    // Filter ketat: Hanya data yang merupakan data ATS riil
    const validLiveAtsRecords = (dbChildren || []).filter((c) => isDataAtsRecord(c));
    const totalLiveRecords = validLiveAtsRecords.length;

    // 2. Inisialisasi seluruh 27 Kelurahan resmi Kota Tegal (0 data awal)
    const kelurahanMap = new Map<string, WilayahRekapAtsItem>();

    for (const [kecName, kecObj] of Object.entries(KOTA_TEGAL_DATA)) {
      for (const kelName of Object.keys(kecObj.kelurahan)) {
        const item = createEmptyRekapWilayahAts(
          `ats-kel-${kelName.toLowerCase().replace(/\s+/g, "-")}`,
          kelName,
          "kelurahan",
          kecName
        );
        kelurahanMap.set(kelName.toLowerCase(), item);
      }
    }

    // 3. Gabungkan catatan live ATS dari Supabase ke dalam kelurahan yang sesuai
    if (validLiveAtsRecords.length > 0) {
      for (const child of validLiveAtsRecords) {
        const parsed = parseAtsDetails(child.alasan_sekolah);
        const kelTarget = normalizeWilayah(parsed.kelurahan || "");

        let targetKelItem = kelurahanMap.get(kelTarget);
        if (!targetKelItem) {
          for (const [kKey, kVal] of kelurahanMap.entries()) {
            if (kKey.includes(kelTarget) || kelTarget.includes(kKey)) {
              targetKelItem = kVal;
              break;
            }
          }
        }

        // Fallback ke kelurahan pertama jika tidak ditemukan
        if (!targetKelItem) {
          targetKelItem = kelurahanMap.get("kejambon") || Array.from(kelurahanMap.values())[0];
        }

        if (targetKelItem) {
          const age = calculateAgeFromBirthDate(child.tanggal_lahir);
          const isLaki = (child.jenis_kelamin || "L").toUpperCase() === "L";
          const isIngin = (parsed.keinginan || "Masih Ada").toLowerCase().includes("masih");

          targetKelItem.totalAts += 1;

          // Gender
          if (isLaki) {
            targetKelItem.gender.lakiLaki += 1;
          } else {
            targetKelItem.gender.perempuan += 1;
          }
          targetKelItem.gender.total += 1;

          // Keinginan
          if (isIngin) {
            targetKelItem.keinginan.masihAda += 1;
          } else {
            targetKelItem.keinginan.tidakAda += 1;
          }

          // Kategori & Jenjang Asal
          const rawAsal = (parsed.sekolahSebelumnya || "").toLowerCase();
          if (rawAsal.includes("smp") || rawAsal.includes("mts")) {
            targetKelItem.jenjangAsal.smpMts += 1;
            targetKelItem.kategori.putusSekolah += 1;
          } else if (rawAsal.includes("sma") || rawAsal.includes("smk") || rawAsal.includes("ma")) {
            targetKelItem.jenjangAsal.smaSmk += 1;
            targetKelItem.kategori.putusSekolah += 1;
          } else if (rawAsal.includes("sd") || rawAsal.includes("mi")) {
            targetKelItem.jenjangAsal.sdMi += 1;
            targetKelItem.kategori.lulusTidakLanjut += 1;
          } else if (rawAsal.includes("paud") || rawAsal.includes("tk")) {
            targetKelItem.jenjangAsal.paudTk += 1;
            targetKelItem.kategori.belumPernahSekolah += 1;
          } else {
            targetKelItem.jenjangAsal.belumSekolah += 1;
            targetKelItem.kategori.belumPernahSekolah += 1;
          }

          // Usia
          if (age <= 6) targetKelItem.usia.age4_6 += 1;
          else if (age <= 12) targetKelItem.usia.age7_12 += 1;
          else if (age <= 15) targetKelItem.usia.age13_15 += 1;
          else if (age <= 18) targetKelItem.usia.age16_18 += 1;
          else targetKelItem.usia.ageAbove18 += 1;

          // Alasan
          const normReason = normalizeReasonAts(parsed.alasan);
          const rObj = targetKelItem.alasanList.find((r) => r.alasan === normReason);
          if (rObj) rObj.jumlah += 1;

          // Recalculate percentages
          targetKelItem.persenInginSekolah = Math.round((targetKelItem.keinginan.masihAda / targetKelItem.totalAts) * 100);
          targetKelItem.persenPutusSekolah = Math.round((targetKelItem.kategori.putusSekolah / targetKelItem.totalAts) * 100);

          targetKelItem.alasanList.forEach((r) => {
            r.persentase = targetKelItem!.totalAts > 0 ? Math.round((r.jumlah / targetKelItem!.totalAts) * 100) : 0;
          });
        }
      }
    }

    const kelurahanList = Array.from(kelurahanMap.values()).sort((a, b) => a.nama.localeCompare(b.nama));

    // 4. Bangun Agregat Tingkat Kecamatan (4 Kecamatan)
    const kecamatanList: WilayahRekapAtsItem[] = Object.keys(KOTA_TEGAL_DATA).map((kecName) => {
      const kelsInKec = kelurahanList.filter((k) => k.kecamatan === kecName);
      const kecItem = createEmptyRekapWilayahAts(`ats-kec-${kecName.toLowerCase().replace(/\s+/g, "-")}`, kecName, "kecamatan");

      for (const kel of kelsInKec) {
        kecItem.totalAts += kel.totalAts;

        // Kategori
        kecItem.kategori.putusSekolah += kel.kategori.putusSekolah;
        kecItem.kategori.lulusTidakLanjut += kel.kategori.lulusTidakLanjut;
        kecItem.kategori.belumPernahSekolah += kel.kategori.belumPernahSekolah;

        // Keinginan
        kecItem.keinginan.masihAda += kel.keinginan.masihAda;
        kecItem.keinginan.tidakAda += kel.keinginan.tidakAda;

        // Gender
        kecItem.gender.lakiLaki += kel.gender.lakiLaki;
        kecItem.gender.perempuan += kel.gender.perempuan;
        kecItem.gender.total += kel.gender.total;

        // Jenjang Asal
        kecItem.jenjangAsal.belumSekolah += kel.jenjangAsal.belumSekolah;
        kecItem.jenjangAsal.paudTk += kel.jenjangAsal.paudTk;
        kecItem.jenjangAsal.sdMi += kel.jenjangAsal.sdMi;
        kecItem.jenjangAsal.smpMts += kel.jenjangAsal.smpMts;
        kecItem.jenjangAsal.smaSmk += kel.jenjangAsal.smaSmk;

        // Usia
        kecItem.usia.age4_6 += kel.usia.age4_6;
        kecItem.usia.age7_12 += kel.usia.age7_12;
        kecItem.usia.age13_15 += kel.usia.age13_15;
        kecItem.usia.age16_18 += kel.usia.age16_18;
        kecItem.usia.ageAbove18 += kel.usia.ageAbove18;

        // Alasan
        kel.alasanList.forEach((r, idx) => {
          kecItem.alasanList[idx].jumlah += r.jumlah;
        });

        // Rekomendasi
        kel.rekomendasiList.forEach((rek, idx) => {
          kecItem.rekomendasiList[idx].jumlahTarget += rek.jumlahTarget;
        });
      }

      kecItem.persenInginSekolah = kecItem.totalAts > 0 ? Math.round((kecItem.keinginan.masihAda / kecItem.totalAts) * 100) : 0;
      kecItem.persenPutusSekolah = kecItem.totalAts > 0 ? Math.round((kecItem.kategori.putusSekolah / kecItem.totalAts) * 100) : 0;

      kecItem.alasanList.forEach((r) => {
        r.persentase = kecItem.totalAts > 0 ? Math.round((r.jumlah / kecItem.totalAts) * 100) : 0;
      });

      kecItem.rekomendasiList.forEach((rek) => {
        rek.persentase = kecItem.totalAts > 0 ? Math.round((rek.jumlahTarget / kecItem.totalAts) * 100) : 0;
      });

      return kecItem;
    });

    // 5. Bangun Agregat Tingkat Kota Tegal
    const kotaItem = createEmptyRekapWilayahAts("ats-kota-tegal", "Kota Tegal", "kota");

    for (const kec of kecamatanList) {
      kotaItem.totalAts += kec.totalAts;

      kotaItem.kategori.putusSekolah += kec.kategori.putusSekolah;
      kotaItem.kategori.lulusTidakLanjut += kec.kategori.lulusTidakLanjut;
      kotaItem.kategori.belumPernahSekolah += kec.kategori.belumPernahSekolah;

      kotaItem.keinginan.masihAda += kec.keinginan.masihAda;
      kotaItem.keinginan.tidakAda += kec.keinginan.tidakAda;

      kotaItem.gender.lakiLaki += kec.gender.lakiLaki;
      kotaItem.gender.perempuan += kec.gender.perempuan;
      kotaItem.gender.total += kec.gender.total;

      kotaItem.jenjangAsal.belumSekolah += kec.jenjangAsal.belumSekolah;
      kotaItem.jenjangAsal.paudTk += kec.jenjangAsal.paudTk;
      kotaItem.jenjangAsal.sdMi += kec.jenjangAsal.sdMi;
      kotaItem.jenjangAsal.smpMts += kec.jenjangAsal.smpMts;
      kotaItem.jenjangAsal.smaSmk += kec.jenjangAsal.smaSmk;

      kotaItem.usia.age4_6 += kec.usia.age4_6;
      kotaItem.usia.age7_12 += kec.usia.age7_12;
      kotaItem.usia.age13_15 += kec.usia.age13_15;
      kotaItem.usia.age16_18 += kec.usia.age16_18;
      kotaItem.usia.ageAbove18 += kec.usia.ageAbove18;

      kec.alasanList.forEach((r, idx) => {
        kotaItem.alasanList[idx].jumlah += r.jumlah;
      });

      kec.rekomendasiList.forEach((rek, idx) => {
        kotaItem.rekomendasiList[idx].jumlahTarget += rek.jumlahTarget;
      });
    }

    kotaItem.persenInginSekolah = kotaItem.totalAts > 0 ? Math.round((kotaItem.keinginan.masihAda / kotaItem.totalAts) * 100) : 0;
    kotaItem.persenPutusSekolah = kotaItem.totalAts > 0 ? Math.round((kotaItem.kategori.putusSekolah / kotaItem.totalAts) * 100) : 0;

    kotaItem.alasanList.forEach((r) => {
      r.persentase = kotaItem.totalAts > 0 ? Math.round((r.jumlah / kotaItem.totalAts) * 100) : 0;
    });

    kotaItem.rekomendasiList.forEach((rek) => {
      rek.persentase = kotaItem.totalAts > 0 ? Math.round((rek.jumlahTarget / kotaItem.totalAts) * 100) : 0;
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
    console.error("Error getRekapDataAtsAction:", err);
    return {
      success: false,
      message: err.message || "Gagal menghasilkan rekap data ATS.",
      data: {
        kota: createEmptyRekapWilayahAts("ats-kota-tegal", "Kota Tegal", "kota"),
        kecamatanList: [],
        kelurahanList: [],
        lastUpdated: new Date().toISOString(),
        totalLiveRecords: 0,
      },
    };
  }
}

/**
 * Server Action: Mengambil Daftar Lengkap Anak Tidak Sekolah (ATS) untuk Admin Komunitas & Super Admin
 */
export async function getDaftarNamaAtsRekapAction(params: {
  tingkat: "kota" | "kecamatan" | "kelurahan";
  kecamatan?: string;
  kelurahan?: string;
  kategoriAts?: string;
  keinginan?: string;
  search?: string;
}): Promise<{
  success: boolean;
  message?: string;
  data: DaftarNamaAtsItem[];
  total: number;
}> {
  try {
    const authStatus = await checkUserRekapAdminAccess();
    if (!authStatus.canAccess) {
      return {
        success: false,
        message: "Akses Ditolak: Fitur Daftar Anak Tidak Sekolah hanya dapat diakses oleh Admin Komunitas dan Super Admin.",
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

    // Filter ketat: Hanya baris data ATS
    const validLiveAts = (dbChildren || []).filter((c) => isDataAtsRecord(c));
    const resultList: DaftarNamaAtsItem[] = [];

    for (const child of validLiveAts) {
      const kom = komMap.get(child.komunitas_id) || findOrGenerateKomunitasSeed(child.komunitas_id);
      const parsed = parseAtsDetails(child.alasan_sekolah, kom);
      const age = calculateAgeFromBirthDate(child.tanggal_lahir);

      const itemKec = normalizeWilayah(parsed.kecamatan || kom?.kecamatan || "");
      const itemKel = normalizeWilayah(parsed.kelurahan || kom?.kelurahan || "");

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

      // Kategori ATS: Putus Sekolah / Lulus Tidak Melanjutkan / Belum Pernah Sekolah
      const rawAsal = (parsed.sekolahSebelumnya || "").toLowerCase();
      let kategoriAts: "Putus Sekolah (DO)" | "Lulus Tidak Melanjutkan (LTM)" | "Belum Pernah Sekolah (BPS)" = "Belum Pernah Sekolah (BPS)";
      if (rawAsal.includes("smp") || rawAsal.includes("mts") || rawAsal.includes("sma") || rawAsal.includes("smk") || rawAsal.includes("ma")) {
        kategoriAts = "Putus Sekolah (DO)";
      } else if (rawAsal.includes("sd") || rawAsal.includes("mi")) {
        kategoriAts = "Lulus Tidak Melanjutkan (LTM)";
      }

      // Filter Kategori
      if (params.kategoriAts && params.kategoriAts !== "semua") {
        if (params.kategoriAts === "do" && kategoriAts !== "Putus Sekolah (DO)") continue;
        if (params.kategoriAts === "ltm" && kategoriAts !== "Lulus Tidak Melanjutkan (LTM)") continue;
        if (params.kategoriAts === "bps" && kategoriAts !== "Belum Pernah Sekolah (BPS)") continue;
      }

      // Filter Keinginan
      const isIngin = (parsed.keinginan || "Masih Ada").toLowerCase().includes("masih");
      if (params.keinginan && params.keinginan !== "semua") {
        if (params.keinginan === "ingin" && !isIngin) continue;
        if (params.keinginan === "tidak" && isIngin) continue;
      }

      // Filter Search
      if (params.search && params.search.trim()) {
        const q = params.search.toLowerCase().trim();
        const matchName = (child.nama_lengkap || "").toLowerCase().includes(q);
        const matchParent = (child.nama_orangtua || "").toLowerCase().includes(q);
        const matchSchool = (parsed.sekolahSebelumnya || "").toLowerCase().includes(q);
        const matchReason = (parsed.alasan || "").toLowerCase().includes(q);
        const matchKel = itemKel.includes(q);
        const matchAddr = (parsed.alamat || "").toLowerCase().includes(q);
        if (!matchName && !matchParent && !matchSchool && !matchReason && !matchKel && !matchAddr) {
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
        kategoriAts,
        keinginanSekolah: isIngin ? "Masih Ada" : "Tidak Ada",
        alasanTidakSekolah: parsed.alasan || "Tidak ada biaya",
        sekolahSebelumnya: parsed.sekolahSebelumnya || "-",
        kelasTerakhir: parsed.kelasTerakhir || "-",
        keterangan: parsed.keterangan || "",
        alamat: parsed.alamat || "",
        rt: parsed.rt || "01",
        rw: parsed.rw || "01",
        kelurahan: parsed.kelurahan || "Randugunting",
        kecamatan: parsed.kecamatan || "Tegal Selatan",
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
    console.error("Error getDaftarNamaAtsRekapAction:", err);
    return {
      success: false,
      message: err.message || "Gagal memuat daftar nama ATS.",
      data: [],
      total: 0,
    };
  }
}
