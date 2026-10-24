import type { DataAnakItem, KomunitasWithMembership } from "@/types/database";
import {
  type WilayahRekapItem,
  type RekapDataAnakUsiaDiniResult,
  type SchoolTypeBreakdown,
  calculateAgeFromBirthDate,
  classifySchoolType,
  normalizeReasonBersekolah,
  normalizeReasonTidakSekolah,
  createEmptyRekapWilayah,
  createEmptyUsiaJenjang,
  DAFTAR_ALASAN_BERSEKOLAH,
  DAFTAR_ALASAN_TIDAK_SEKOLAH,
} from "@/app/actions/rekap-data-anak";
import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import { normalizeRtRwNum, isKomunitasLayananPaud } from "@/lib/data-anak-helpers";

export interface KomunitasScopedRekapResult {
  scopeRekapItem: WilayahRekapItem;
  subTierItems: WilayahRekapItem[];
  subTierTitle: string;
  subTierColumnLabel: string;
  scopeType: "kota" | "kecamatan" | "kelurahan" | "rw" | "rt" | "paud" | "posyandu";
}

/**
 * Membangun objek WilayahRekapItem dari daftar DataAnakItem
 */
export function buildScopedRekapFromChildren(
  id: string,
  nama: string,
  tingkat: "kota" | "kecamatan" | "kelurahan",
  children: DataAnakItem[],
  kecamatan?: string
): WilayahRekapItem {
  const item: WilayahRekapItem = createEmptyRekapWilayah(id, nama, tingkat, kecamatan);

  for (const child of children) {
    const age = calculateAgeFromBirthDate(child.tanggal_lahir);
    const rawGender = (child.jenis_kelamin || "L").toUpperCase();
    const isLaki = rawGender === "L" || rawGender.startsWith("LAKI");
    const isSekolah =
      child.is_sekolah === true ||
      Boolean(child.nama_sekolah && !child.nama_sekolah.toLowerCase().includes("belum"));

    item.totalAnak += 1;

    if (isSekolah) {
      item.totalBersekolah += 1;
      if (isLaki) {
        item.bersekolahGender.lakiLaki += 1;
      } else {
        item.bersekolahGender.perempuan += 1;
      }
      item.bersekolahGender.total += 1;

      const st = classifySchoolType(child.nama_sekolah);
      item.bersekolahJenjang[st] += 1;

      if (age <= 1) item.bersekolahUsia.age0_1 += 1;
      else if (age === 2) item.bersekolahUsia.age2 += 1;
      else if (age === 3) item.bersekolahUsia.age3 += 1;
      else if (age === 4) item.bersekolahUsia.age4 += 1;
      else if (age === 5) item.bersekolahUsia.age5 += 1;
      else item.bersekolahUsia.age6 += 1;

      const clampedAge = Math.max(0, Math.min(6, age));
      if (item.bersekolahUsiaJenjang[clampedAge]) {
        item.bersekolahUsiaJenjang[clampedAge][st] += 1;
      }

      const normReason = normalizeReasonBersekolah(child.alasan_sekolah);
      const rObj = item.bersekolahAlasan.find((r) => r.alasan === normReason);
      if (rObj) rObj.jumlah += 1;
    } else {
      item.totalTidakBersekolah += 1;
      if (isLaki) {
        item.tidakBersekolahGender.lakiLaki += 1;
      } else {
        item.tidakBersekolahGender.perempuan += 1;
      }
      item.tidakBersekolahGender.total += 1;

      if (age <= 1) item.tidakBersekolahUsia.age0_1 += 1;
      else if (age === 2) item.tidakBersekolahUsia.age2 += 1;
      else if (age === 3) item.tidakBersekolahUsia.age3 += 1;
      else if (age === 4) item.tidakBersekolahUsia.age4 += 1;
      else if (age === 5) item.tidakBersekolahUsia.age5 += 1;
      else item.tidakBersekolahUsia.age6 += 1;

      const normReasonTB = normalizeReasonTidakSekolah(child.alasan_sekolah, age);
      const rObjTB = item.tidakBersekolahAlasan.find((r) => r.alasan === normReasonTB);
      if (rObjTB) rObjTB.jumlah += 1;
    }
  }

  item.persenBersekolah =
    item.totalAnak > 0
      ? Math.round((item.totalBersekolah / item.totalAnak) * 100)
      : 0;
  item.persenTidakBersekolah =
    item.totalAnak > 0
      ? Math.round((item.totalTidakBersekolah / item.totalAnak) * 100)
      : 0;

  item.bersekolahAlasan.forEach((r) => {
    r.persentase =
      item.totalBersekolah > 0
        ? Math.round((r.jumlah / item.totalBersekolah) * 100)
        : 0;
  });
  item.tidakBersekolahAlasan.forEach((r) => {
    r.persentase =
      item.totalTidakBersekolah > 0
        ? Math.round((r.jumlah / item.totalTidakBersekolah) * 100)
        : 0;
  });

  return item;
}

/**
 * Menghasilkan Rekapitulasi, Diagram, dan Sub-tabel yang sudah menyesuaikan dengan jenjang dan jenis komunitas:
 * - Komunitas PAUD / PKBM / SKB
 * - Komunitas RT
 * - Komunitas RW
 * - Komunitas Kelurahan
 * - Komunitas Kecamatan
 * - Komunitas Kota Tegal
 * - Komunitas Posyandu
 */
export function buildKomunitasScopedRekap(
  komunitas: KomunitasWithMembership | any,
  children: DataAnakItem[] = [],
  cityRekap?: RekapDataAnakUsiaDiniResult
): KomunitasScopedRekapResult {
  const meta = extractKomunitasMetadata(komunitas);
  const isPaud = isKomunitasLayananPaud(komunitas, komunitas?.nama, komunitas?.jenis);
  const isWargaKita = komunitas?.jenis === "warga_kita";
  const isPosyandu = komunitas?.jenis === "posyandu";

  // Identifikasi Tingkat Warga Kita
  const isRt = isWargaKita && Boolean(meta.hasRt);
  const isRw = isWargaKita && Boolean(meta.hasRw) && !isRt;
  const isKel = isWargaKita && Boolean(meta.hasKel) && !isRw && !isRt;
  const isKec =
    isWargaKita &&
    Boolean(meta.rawKec) &&
    meta.rawKec !== "Kota Tegal" &&
    meta.rawKec !== "semua" &&
    !isKel &&
    !isRw &&
    !isRt;
  const isKota = isWargaKita && !isKec && !isKel && !isRw && !isRt;

  // 1. SATUAN PAUD / PKBM STAR OF TOMORROW / SKB KOTA TEGAL
  if (isPaud) {
    const scopeItem = buildScopedRekapFromChildren(
      komunitas.id,
      komunitas.nama || "Satuan PAUD",
      "kelurahan",
      children,
      meta.rawKec
    );

    const subTierItems: WilayahRekapItem[] = [];
    for (let age = 0; age <= 6; age++) {
      const ageChildren = children.filter(
        (c) => calculateAgeFromBirthDate(c.tanggal_lahir) === age
      );
      subTierItems.push(
        buildScopedRekapFromChildren(
          `paud-age-${age}`,
          `Usia ${age} Tahun`,
          "kelurahan",
          ageChildren,
          meta.rawKec
        )
      );
    }

    return {
      scopeRekapItem: scopeItem,
      subTierItems,
      subTierTitle: `Rekapitulasi Peserta Didik PAUD Menurut Kelompok Usia di ${komunitas.nama}`,
      subTierColumnLabel: "Kelompok Usia Siswa",
      scopeType: "paud",
    };
  }

  // 2. KOMUNITAS WARGA KITA - TINGKAT RT
  if (isRt) {
    const scopeItem = buildScopedRekapFromChildren(
      komunitas.id,
      komunitas.nama || `RT ${meta.rawRt} / RW ${meta.rawRw}`,
      "kelurahan",
      children,
      meta.rawKec
    );

    const subTierItems: WilayahRekapItem[] = [];
    for (let age = 0; age <= 6; age++) {
      const ageChildren = children.filter(
        (c) => calculateAgeFromBirthDate(c.tanggal_lahir) === age
      );
      subTierItems.push(
        buildScopedRekapFromChildren(
          `rt-age-${age}`,
          `Usia ${age} Tahun`,
          "kelurahan",
          ageChildren,
          meta.rawKec
        )
      );
    }

    return {
      scopeRekapItem: scopeItem,
      subTierItems,
      subTierTitle: `Rekapitulasi Menurut Kelompok Usia di RT ${meta.rawRt} / RW ${meta.rawRw}`,
      subTierColumnLabel: "Kelompok Usia (Tahun)",
      scopeType: "rt",
    };
  }

  // 3. KOMUNITAS WARGA KITA - TINGKAT RW
  if (isRw) {
    const scopeItem = buildScopedRekapFromChildren(
      komunitas.id,
      komunitas.nama || `RW ${meta.rawRw}`,
      "kelurahan",
      children,
      meta.rawKec
    );

    // Kumpulkan seluruh RT dalam RW ini dari data anak
    const rtMap = new Map<string, DataAnakItem[]>();
    for (const child of children) {
      const rtNum = normalizeRtRwNum(child.domisili_rt || child.kk_rt) || "01";
      if (!rtMap.has(rtNum)) rtMap.set(rtNum, []);
      rtMap.get(rtNum)!.push(child);
    }

    // Pastikan minimal RT 01..05 ada dalam daftar jika belum muncul
    const knownRts = Array.from(rtMap.keys());
    for (let i = 1; i <= 5; i++) {
      const s = String(i);
      if (!knownRts.includes(s)) rtMap.set(s, []);
    }

    const sortedRtKeys = Array.from(rtMap.keys()).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const subTierItems: WilayahRekapItem[] = sortedRtKeys.map((rtKey) => {
      const rtChildren = rtMap.get(rtKey) || [];
      return buildScopedRekapFromChildren(
        `rw-${meta.rawRw}-rt-${rtKey}`,
        `RT ${rtKey.padStart(2, "0")}`,
        "kelurahan",
        rtChildren,
        meta.rawKec
      );
    });

    return {
      scopeRekapItem: scopeItem,
      subTierItems,
      subTierTitle: `Rekapitulasi Tingkat Rukun Tetangga (RT) di RW ${meta.rawRw} (Kel. ${meta.rawKel || "-"})`,
      subTierColumnLabel: "Rukun Tetangga (RT)",
      scopeType: "rw",
    };
  }

  // 4. KOMUNITAS WARGA KITA - TINGKAT KELURAHAN
  if (isKel) {
    // Ambil data kelurahan dari cityRekap jika cocok
    const matchedKelFromCity = cityRekap?.kelurahanList.find(
      (k) => k.nama.toLowerCase() === (meta.rawKel || "").toLowerCase()
    );

    const scopeItem =
      matchedKelFromCity ||
      buildScopedRekapFromChildren(
        komunitas.id,
        komunitas.nama || `Kelurahan ${meta.rawKel}`,
        "kelurahan",
        children,
        meta.rawKec
      );

    // Kumpulkan seluruh RW dalam Kelurahan ini dari data anak
    const rwMap = new Map<string, DataAnakItem[]>();
    for (const child of children) {
      const rwNum = normalizeRtRwNum(child.domisili_rw || child.kk_rw) || "01";
      if (!rwMap.has(rwNum)) rwMap.set(rwNum, []);
      rwMap.get(rwNum)!.push(child);
    }

    // Pastikan RW 01..06 ada dalam daftar
    const knownRws = Array.from(rwMap.keys());
    for (let i = 1; i <= 6; i++) {
      const s = String(i);
      if (!knownRws.includes(s)) rwMap.set(s, []);
    }

    const sortedRwKeys = Array.from(rwMap.keys()).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const subTierItems: WilayahRekapItem[] = sortedRwKeys.map((rwKey) => {
      const rwChildren = rwMap.get(rwKey) || [];
      return buildScopedRekapFromChildren(
        `kel-${meta.rawKel}-rw-${rwKey}`,
        `RW ${rwKey.padStart(2, "0")}`,
        "kelurahan",
        rwChildren,
        meta.rawKec
      );
    });

    return {
      scopeRekapItem: scopeItem,
      subTierItems,
      subTierTitle: `Rekapitulasi Tingkat Rukun Warga (RW) di Kelurahan ${meta.rawKel || komunitas.nama}`,
      subTierColumnLabel: "Rukun Warga (RW)",
      scopeType: "kelurahan",
    };
  }

  // 5. KOMUNITAS WARGA KITA - TINGKAT KECAMATAN
  if (isKec) {
    const matchedKecFromCity = cityRekap?.kecamatanList.find(
      (k) => k.nama.toLowerCase() === (meta.rawKec || "").toLowerCase()
    );

    const scopeItem =
      matchedKecFromCity ||
      buildScopedRekapFromChildren(
        komunitas.id,
        komunitas.nama || `Kecamatan ${meta.rawKec}`,
        "kecamatan",
        children,
        meta.rawKec
      );

    const subTierItems: WilayahRekapItem[] = (cityRekap?.kelurahanList || []).filter(
      (k) => k.kecamatan?.toLowerCase() === (meta.rawKec || "").toLowerCase()
    );

    return {
      scopeRekapItem: scopeItem,
      subTierItems,
      subTierTitle: `Rekapitulasi Tingkat Kelurahan di Kecamatan ${meta.rawKec}`,
      subTierColumnLabel: "Kelurahan",
      scopeType: "kecamatan",
    };
  }

  // 6. KOMUNITAS POSYANDU
  if (isPosyandu) {
    const scopeItem = buildScopedRekapFromChildren(
      komunitas.id,
      komunitas.nama || "Posyandu",
      "kelurahan",
      children,
      meta.rawKec
    );

    const subTierItems: WilayahRekapItem[] = [];
    for (let age = 0; age <= 6; age++) {
      const ageChildren = children.filter(
        (c) => calculateAgeFromBirthDate(c.tanggal_lahir) === age
      );
      subTierItems.push(
        buildScopedRekapFromChildren(
          `pos-age-${age}`,
          `Usia ${age} Tahun`,
          "kelurahan",
          ageChildren,
          meta.rawKec
        )
      );
    }

    return {
      scopeRekapItem: scopeItem,
      subTierItems,
      subTierTitle: `Rekapitulasi Sasaran Balita Menurut Kelompok Usia di ${komunitas.nama}`,
      subTierColumnLabel: "Kelompok Usia Balita",
      scopeType: "posyandu",
    };
  }

  // 7. DEFAULT: KOMUNITAS TINGKAT KOTA TEGAL (ATAU AGREGAT UMUM)
  const scopeItem =
    cityRekap?.kota ||
    buildScopedRekapFromChildren(
      komunitas.id,
      komunitas.nama || "Kota Tegal",
      "kota",
      children
    );

  const subTierItems: WilayahRekapItem[] = cityRekap?.kecamatanList || [];

  return {
    scopeRekapItem: scopeItem,
    subTierItems,
    subTierTitle: "Rekapitulasi 4 Kecamatan di Kota Tegal",
    subTierColumnLabel: "Kecamatan",
    scopeType: "kota",
  };
}
