"use server";

import { createClient } from "@/utils/supabase/server";
import { KOTA_TEGAL_DATA, findOrGenerateKomunitasSeed } from "@/lib/constants/tegal-data";
import {
  parseDataAnakDetails,
  isDataAtsRecord,
  isDummyDataAnak,
  normalizeWilayah,
  formatNamaSekolahDisplay,
  isValidKeturenRtRw,
  isValidDebongKulonRtRw,
  isValidTunonRtRw,
  isValidPekaumanRtRw,
  isValidPanggungRtRw,
  isValidTegalsariRtRw,
} from "@/lib/data-anak-helpers";
import { isAdminPusat, isSuperAdmin as checkIsSuperAdmin } from "@/lib/utils";

export type {
  DaftarNamaAnakItem,
  SchoolTypeBreakdown,
  GenderBreakdown,
  AgeGroupBreakdown,
  ReasonCount,
  WilayahRekapItem,
  RekapDataAnakUsiaDiniResult,
} from "@/lib/rekap-data-anak-shared";

import {
  type DaftarNamaAnakItem,
  type WilayahRekapItem,
  type RekapDataAnakUsiaDiniResult,
  calculateAgeFromBirthDate,
  classifySchoolType,
  normalizeReasonBersekolah,
  normalizeReasonTidakSekolah,
  createEmptyUsiaJenjang,
  createEmptyRekapWilayah,
} from "@/lib/rekap-data-anak-shared";


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

    // 1. Hitung total baris di data_anak untuk membagi pemanggilan paralel secara dinamis
    const { count: totalRowCount, error: countErr } = await supabase
      .from("data_anak")
      .select("*", { count: "exact", head: true });

    if (countErr) {
      console.warn("getRekapDataAnakUsiaDiniAction count error:", countErr.message);
    }

    const totalToFetch = totalRowCount && totalRowCount > 0 ? totalRowCount : 2000;
    const CHUNK_SIZE = 1000;
    const numChunks = Math.max(1, Math.ceil(totalToFetch / CHUNK_SIZE));

    // Ambil seluruh data_anak dari database secara paralel (chunk paralel per 1.000 data)
    // Supabase PostgREST membatasi maksimal 1.000 baris per panggilan, sehingga eksekusi paralel chunk
    // mengambil seluruh 7.000+ data secara utuh dalam waktu ~1-1.5 detik
    const chunkPromises = [];
    for (let i = 0; i < numChunks; i++) {
      const from = i * CHUNK_SIZE;
      const to = from + CHUNK_SIZE - 1;
      chunkPromises.push(
        supabase
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
          `)
          .order("created_at", { ascending: false })
          .range(from, to)
      );
    }

    const chunkResults = await Promise.all(chunkPromises);
    const dbChildren: any[] = chunkResults.flatMap((res) => res.data || []);

    // Filter ketat: Hanya data anak balita / PAUD riil (BUKAN data ATS, BUKAN data dummy, dan memenuhi ketentuan wilayah Keturen)
    const validLiveChildren = (dbChildren || []).filter((c) => {
      if (isDataAtsRecord(c) || isDummyDataAnak(c)) return false;
      const parsed = parseDataAnakDetails(c.alasan_sekolah);
      const kel = parsed.domisiliKelurahan || parsed.kkKelurahan;
      const rw = parsed.domisiliRw || parsed.kkRw;
      const rt = parsed.domisiliRt || parsed.kkRt;
      if (!isValidKeturenRtRw(kel, rw, rt)) return false;
      if (!isValidDebongKulonRtRw(kel, rw, rt)) return false;
      if (!isValidTunonRtRw(kel, rw, rt)) return false;
      if (!isValidPekaumanRtRw(kel, rw, rt)) return false;
      if (!isValidPanggungRtRw(kel, rw, rt)) return false;
      if (!isValidTegalsariRtRw(kel, rw, rt)) return false;
      return true;
    });
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

            // Akumulasi Matriks Usia (0 - 6 Tahun) x Jenjang Satuan PAUD
            const clampedAge = Math.max(0, Math.min(6, age));
            if (targetKelItem.bersekolahUsiaJenjang[clampedAge]) {
              targetKelItem.bersekolahUsiaJenjang[clampedAge][st] += 1;
            }

            const normReason = normalizeReasonBersekolah(parsed.alasan);
            let rObj = targetKelItem.bersekolahAlasan.find((r) => r.alasan === normReason);
            if (!rObj) {
              rObj = { alasan: normReason, jumlah: 0, persentase: 0 };
              targetKelItem.bersekolahAlasan.push(rObj);
            }
            rObj.jumlah += 1;
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

        for (let a = 0; a <= 6; a++) {
          kecItem.bersekolahUsiaJenjang[a].tk += kel.bersekolahUsiaJenjang[a].tk;
          kecItem.bersekolahUsiaJenjang[a].ra += kel.bersekolahUsiaJenjang[a].ra;
          kecItem.bersekolahUsiaJenjang[a].kb += kel.bersekolahUsiaJenjang[a].kb;
          kecItem.bersekolahUsiaJenjang[a].sps += kel.bersekolahUsiaJenjang[a].sps;
          kecItem.bersekolahUsiaJenjang[a].tpa += kel.bersekolahUsiaJenjang[a].tpa;
          kecItem.bersekolahUsiaJenjang[a].skb += kel.bersekolahUsiaJenjang[a].skb;
          kecItem.bersekolahUsiaJenjang[a].pkbm += kel.bersekolahUsiaJenjang[a].pkbm;
        }

        kel.bersekolahAlasan.forEach((r) => {
          let targetR = kecItem.bersekolahAlasan.find((x) => x.alasan === r.alasan);
          if (!targetR) {
            targetR = { alasan: r.alasan, jumlah: 0, persentase: 0 };
            kecItem.bersekolahAlasan.push(targetR);
          }
          targetR.jumlah += r.jumlah;
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

        kel.tidakBersekolahAlasan.forEach((r) => {
          let targetR = kecItem.tidakBersekolahAlasan.find((x) => x.alasan === r.alasan);
          if (!targetR) {
            targetR = { alasan: r.alasan, jumlah: 0, persentase: 0 };
            kecItem.tidakBersekolahAlasan.push(targetR);
          }
          targetR.jumlah += r.jumlah;
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

      for (let a = 0; a <= 6; a++) {
        kotaItem.bersekolahUsiaJenjang[a].tk += kec.bersekolahUsiaJenjang[a].tk;
        kotaItem.bersekolahUsiaJenjang[a].ra += kec.bersekolahUsiaJenjang[a].ra;
        kotaItem.bersekolahUsiaJenjang[a].kb += kec.bersekolahUsiaJenjang[a].kb;
        kotaItem.bersekolahUsiaJenjang[a].sps += kec.bersekolahUsiaJenjang[a].sps;
        kotaItem.bersekolahUsiaJenjang[a].tpa += kec.bersekolahUsiaJenjang[a].tpa;
        kotaItem.bersekolahUsiaJenjang[a].skb += kec.bersekolahUsiaJenjang[a].skb;
        kotaItem.bersekolahUsiaJenjang[a].pkbm += kec.bersekolahUsiaJenjang[a].pkbm;
      }

      kec.bersekolahAlasan.forEach((r) => {
        let targetR = kotaItem.bersekolahAlasan.find((x) => x.alasan === r.alasan);
        if (!targetR) {
          targetR = { alasan: r.alasan, jumlah: 0, persentase: 0 };
          kotaItem.bersekolahAlasan.push(targetR);
        }
        targetR.jumlah += r.jumlah;
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

      kec.tidakBersekolahAlasan.forEach((r) => {
        let targetR = kotaItem.tidakBersekolahAlasan.find((x) => x.alasan === r.alasan);
        if (!targetR) {
          targetR = { alasan: r.alasan, jumlah: 0, persentase: 0 };
          kotaItem.tidakBersekolahAlasan.push(targetR);
        }
        targetR.jumlah += r.jumlah;
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
  isAdminPusat?: boolean;
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
      return { canAccess: false, isSuperAdmin: false, isAdminPusat: false, isAdminKomunitas: false };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, is_super_admin, is_admin_pusat, nama_lengkap, email")
      .eq("id", user.id)
      .maybeSingle();

    const userProfileCtx = {
      ...profile,
      id: user.id,
      email: profile?.email || user.email,
      nama_lengkap: profile?.nama_lengkap || user.user_metadata?.nama_lengkap,
    };

    const isSuperAdmin = checkIsSuperAdmin(userProfileCtx);
    const isPusat = !isSuperAdmin && isAdminPusat(userProfileCtx);

    if (isSuperAdmin) {
      return {
        canAccess: true,
        isSuperAdmin: true,
        isAdminPusat: false,
        isAdminKomunitas: true,
        userPeran: "Super Admin",
        userName: userProfileCtx.nama_lengkap || "Super Admin",
      };
    }

    if (isPusat) {
      return {
        canAccess: true,
        isSuperAdmin: false,
        isAdminPusat: true,
        isAdminKomunitas: true,
        userPeran: "Admin Pusat",
        userName: userProfileCtx.nama_lengkap || "Jarimas Indonesia",
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
        p.includes("pamong") ||
        p.includes("penilik") ||
        p.includes("instruktur") ||
        p.includes("pkbm") ||
        p.includes("skb") ||
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
        message:
          "Akses Ditolak: Sesuai ketentuan perlindungan privasi data, rincian identitas lengkap anak hanya dapat diakses di Tingkat KELURAHAN oleh Admin di Komunitas Warga Kita, Admin PAUD, Admin Posyandu dan Admin PKBM dan SKB.",
        data: [],
        total: 0,
      };
    }

    const supabase = await createClient();

    // 1. Filter wilayah di level SQL jika ditentukan
    const targetKel =
      params.kelurahan && params.kelurahan !== "semua" ? params.kelurahan : null;
    const targetKec =
      !targetKel && params.kecamatan && params.kecamatan !== "semua" ? params.kecamatan : null;

    // Hitung total data yang cocok untuk menentukan chunk pemanggilan paralel
    let countQuery = supabase
      .from("data_anak")
      .select("*", { count: "exact", head: true });

    if (targetKel) {
      countQuery = countQuery.ilike("alasan_sekolah", `%${targetKel}%`);
    } else if (targetKec) {
      countQuery = countQuery.ilike("alasan_sekolah", `%${targetKec}%`);
    }

    const { count: filterCount, error: countErr } = await countQuery;
    if (countErr) {
      console.warn("getDaftarNamaAnakRekapAction count warning:", countErr.message);
    }

    const totalToFetch = Math.min(filterCount || 0, 10000);
    const CHUNK_SIZE = 1000;
    const numChunks = Math.max(1, Math.ceil(totalToFetch / CHUNK_SIZE));

    // Ambil data secara paralel menggunakan range chunk agar tidak terpotong oleh batasan 1.000 baris PostgREST
    const chunkPromises = [];
    for (let i = 0; i < numChunks; i++) {
      let q = supabase
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
        .order("created_at", { ascending: false })
        .range(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE - 1);

      if (targetKel) {
        q = q.ilike("alasan_sekolah", `%${targetKel}%`);
      } else if (targetKec) {
        q = q.ilike("alasan_sekolah", `%${targetKec}%`);
      }

      chunkPromises.push(q);
    }

    const chunkResults = await Promise.all(chunkPromises);
    const dbChildren: any[] = chunkResults.flatMap((res) => res.data || []);

    // Filter ketat: Bukan data ATS dan Bukan data dummy
    const validLiveChildren: any[] = (dbChildren || []).filter(
      (c: any) => !isDataAtsRecord(c) && !isDummyDataAnak(c)
    );

    // Ambil komunitas HANYA untuk ID yang relevan dari data anak yang ditemukan
    const childKomIds: string[] = Array.from(new Set(validLiveChildren.map((c: any) => c.komunitas_id).filter(Boolean)));
    const missingKomIds = childKomIds.filter((cid: string) => !findOrGenerateKomunitasSeed(cid));
    const { data: missingDbKoms } = missingKomIds.length > 0
      ? await supabase.from("komunitas").select("id, nama, jenis, kecamatan, kelurahan, rw, rt").in("id", missingKomIds)
      : { data: [] };
    const komMap = new Map((missingDbKoms || []).map((k: any) => [k.id, k]));
    const resultList: DaftarNamaAnakItem[] = [];

    for (const child of validLiveChildren) {
      const kom: any = komMap.get(child.komunitas_id) || findOrGenerateKomunitasSeed(child.komunitas_id);
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
        namaSekolah: child.nama_sekolah
          ? formatNamaSekolahDisplay(child.nama_sekolah)
          : isSekolah
          ? "Satuan PAUD"
          : "-",
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
