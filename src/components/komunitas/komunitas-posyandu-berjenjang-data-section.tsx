"use client";

import { useState, useMemo, Fragment } from "react";
import Link from "next/link";
import {
  Baby,
  GraduationCap,
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  HeartPulse,
  Sparkles,
  ChevronRight,
  ExternalLink,
  School,
  AlertCircle,
  Home,
  Check,
  Building2,
  ShieldCheck,
  Info,
  Calendar,
  Layers,
  HelpCircle,
  Table,
} from "lucide-react";
import { cn, formatPeranDisplay } from "@/lib/utils";
import type { DataAnakItem, DataAtsItem } from "@/types/database";
import {
  KOTA_TEGAL_DATA,
  SEED_POSYANDU_TEGAL,
  findKecamatanByKelurahan,
} from "@/lib/constants/tegal-data";
import {
  getPosyanduCoverageDisplay,
  getPosyanduCakupanWilayah,
  getPosyanduCakupanRw,
  isDataAnakMatchingKomunitas,
  normalizeWilayah,
  classifyAtsCategory,
  getNumericAgeAts,
} from "@/lib/data-anak-helpers";
import { extractKomunitasMetadata } from "@/lib/admin-helpers";

interface KomunitasPosyanduBerjenjangDataSectionProps {
  mode: "anak" | "ats";
  komunitas: any;
  dataAnakList: DataAnakItem[];
  dataAtsList: DataAtsItem[];
  currentUserId?: string | null;
  isAdminOrKader?: boolean;
  canViewDetail?: boolean;
  canValidate?: boolean;
  canCreate?: boolean;
  userRole?: string;
}

export function KomunitasPosyanduBerjenjangDataSection({
  mode,
  komunitas,
  dataAnakList = [],
  dataAtsList = [],
  currentUserId,
  isAdminOrKader = false,
  canViewDetail = false,
  canValidate = false,
  canCreate = false,
  userRole = "Pengunjung",
}: KomunitasPosyanduBerjenjangDataSectionProps) {
  // 1. Tentukan level hierarki komunitas berjenjang
  const rawKel = (komunitas.kelurahan || "").trim();
  const rawKec = (komunitas.kecamatan || "").trim();

  const level: "kota" | "kecamatan" | "kelurahan" = useMemo(() => {
    if (rawKel && rawKel.toLowerCase() !== "semua" && rawKel.toLowerCase() !== "semua kelurahan") {
      return "kelurahan";
    }
    if (rawKec && rawKec.toLowerCase() !== "semua" && rawKec.toLowerCase() !== "kota tegal") {
      return "kecamatan";
    }
    return "kota";
  }, [rawKel, rawKec]);

  // 2. State Filter Wilayah
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>(
    level === "kota" ? "semua" : rawKec || "semua"
  );
  const [selectedKelurahan, setSelectedKelurahan] = useState<string>(
    level === "kelurahan" ? rawKel : "semua"
  );
  const [selectedPosyanduId, setSelectedPosyanduId] = useState<string>("semua");

  // State Filter Kategori (mode anak: semua vs bersekolah vs belum_bersekolah)
  const [statusSekolahFilter, setStatusSekolahFilter] = useState<"semua" | "bersekolah" | "belum_bersekolah">("semua");

  // State Filter Kategori ATS (mode ats: semua vs Belum Pernah Bersekolah vs Drop Out vs Lulus Tidak Melanjutkan)
  const [statusAtsFilter, setStatusAtsFilter] = useState<
    "semua" | "Belum Pernah Bersekolah" | "Drop Out" | "Lulus Tidak Melanjutkan"
  >("semua");

  // State Filter Usia ATS Pertahun (6 s/d 18 Tahun, atau 19+)
  const [selectedUsiaFilter, setSelectedUsiaFilter] = useState<number | "semua">("semua");

  // State Filter Pemetaan Posyandu (semua vs terpetakan vs belum_terpetakan)
  const [pemetaanFilter, setPemetaanFilter] = useState<"semua" | "terpetakan" | "belum_terpetakan">("semua");

  // State Pencarian & Tampilan
  const [searchQuery, setSearchQuery] = useState("");
  const [viewTab, setViewTab] = useState<"daftar_anak" | "rekap_posyandu">("daftar_anak");
  const [visibleCount, setVisibleCount] = useState(30);

  // Daftar Kecamatan & Kelurahan Kota Tegal
  const daftarKecamatan = useMemo(() => Object.keys(KOTA_TEGAL_DATA), []);

  const daftarKelurahan = useMemo(() => {
    if (level === "kelurahan") return [rawKel];
    if (selectedKecamatan !== "semua" && KOTA_TEGAL_DATA[selectedKecamatan]) {
      return Object.keys(KOTA_TEGAL_DATA[selectedKecamatan].kelurahan);
    }
    // Jika semua kecamatan dipilih di level kota
    const allKel: string[] = [];
    Object.values(KOTA_TEGAL_DATA).forEach((k) => {
      allKel.push(...Object.keys(k.kelurahan));
    });
    return allKel;
  }, [selectedKecamatan, level, rawKel]);

  // 3. Kumpulkan seluruh Posyandu Unit yang ada dalam cakupan wilayah saat ini
  const allPosyandusInScope = useMemo(() => {
    return SEED_POSYANDU_TEGAL.filter((p) => {
      const pKec = findKecamatanByKelurahan(p.kelurahan) || p.kecamatan || "";
      if (level === "kelurahan") {
        return p.kelurahan && p.kelurahan.toLowerCase().trim() === rawKel.toLowerCase();
      }
      if (level === "kecamatan") {
        return pKec && pKec.toLowerCase().trim() === rawKec.toLowerCase();
      }
      // Level Kota
      return true;
    });
  }, [level, rawKel, rawKec]);

  // Posyandu setelah filter kecamatan & kelurahan
  const filteredPosyandus = useMemo(() => {
    return allPosyandusInScope.filter((p) => {
      const pKec = findKecamatanByKelurahan(p.kelurahan) || p.kecamatan || "";
      if (selectedKecamatan !== "semua" && pKec.toLowerCase().trim() !== selectedKecamatan.toLowerCase().trim()) {
        return false;
      }
      if (selectedKelurahan !== "semua" && p.kelurahan.toLowerCase().trim() !== selectedKelurahan.toLowerCase().trim()) {
        return false;
      }
      const cov = getPosyanduCoverageDisplay(p);
      if (pemetaanFilter === "terpetakan" && !cov.isMapped) return false;
      if (pemetaanFilter === "belum_terpetakan" && cov.isMapped) return false;
      return true;
    });
  }, [allPosyandusInScope, selectedKecamatan, selectedKelurahan, pemetaanFilter]);

  // Pemetaan Posyandu dan Agregasi Anak & ATS secara Terindeks O(N) Super Cepat
  const { posyanduDataMap, childBadgeMap, atsBadgeMap } = useMemo(() => {
    const map = new Map<
      string,
      {
        posyandu: any;
        isMapped: boolean;
        coverageLabel: string;
        rwLabel: string | null;
        rtLabel: string | null;
        anakList: DataAnakItem[];
        atsList: DataAtsItem[];
        anakSekolahCount: number;
        anakBelumSekolahCount: number;
      }
    >();

    const childBadgeMap = new Map<
      string,
      {
        nama: string;
        coverage: string;
        isMapped: boolean;
        id: string | null;
      }
    >();

    const atsBadgeMap = new Map<
      string,
      {
        nama: string;
        coverage: string;
        isMapped: boolean;
        id: string | null;
      }
    >();

    // 1. Inisialisasi seluruh posyandu dan indeks berdasarkan nama kelurahan
    const posyandusByKelurahan = new Map<
      string,
      Array<{
        posyandu: any;
        meta: any;
        cov: any;
        cakupan: any;
        pKel: string;
        pKec: string;
      }>
    >();

    allPosyandusInScope.forEach((p) => {
      const cov = getPosyanduCoverageDisplay(p);
      const meta = extractKomunitasMetadata(p);
      const cakupan = getPosyanduCakupanWilayah(p);
      const pKel = normalizeWilayah(p.kelurahan);
      const pKec = normalizeWilayah(findKecamatanByKelurahan(p.kelurahan) || p.kecamatan || "");

      map.set(p.id, {
        posyandu: p,
        isMapped: cov.isMapped,
        coverageLabel: cov.isMapped ? cov.label : "Cakupan Belum Dipetakan (Wilayah Kelurahan)",
        rwLabel: cov.rwLabel,
        rtLabel: cov.rtLabel,
        anakList: [],
        atsList: [],
        anakSekolahCount: 0,
        anakBelumSekolahCount: 0,
      });

      if (!posyandusByKelurahan.has(pKel)) {
        posyandusByKelurahan.set(pKel, []);
      }
      posyandusByKelurahan.get(pKel)!.push({
        posyandu: p,
        meta,
        cov,
        cakupan,
        pKel,
        pKec,
      });
    });

    // 2. Loop Data Anak Usia Dini (Single-Pass O(N) dengan Kandidat Kelurahan Terindeks)
    for (let i = 0; i < dataAnakList.length; i++) {
      const child = dataAnakList[i];
      const domKel = normalizeWilayah(child.domisili_kelurahan);
      const kkKel = normalizeWilayah(child.kk_kelurahan);

      const candsDom = domKel ? posyandusByKelurahan.get(domKel) : null;
      const candsKk = kkKel && kkKel !== domKel ? posyandusByKelurahan.get(kkKel) : null;

      let candidateList: Array<{
        posyandu: any;
        meta: any;
        cov: any;
        cakupan: any;
        pKel: string;
        pKec: string;
      }> = [];

      if (candsDom && candsKk) {
        candidateList = [...candsDom, ...candsKk];
      } else if (candsDom) {
        candidateList = candsDom;
      } else if (candsKk) {
        candidateList = candsKk;
      }

      let badgeAssigned = false;

      for (let j = 0; j < candidateList.length; j++) {
        const item = candidateList[j];
        if (isDataAnakMatchingKomunitas(child, item.posyandu, item.meta, item.posyandu.id)) {
          const bucket = map.get(item.posyandu.id);
          if (bucket) {
            bucket.anakList.push(child);
            const isSekolah =
              child.is_sekolah === true ||
              (child.nama_sekolah && !child.nama_sekolah.toLowerCase().includes("belum"));
            if (isSekolah) {
              bucket.anakSekolahCount++;
            } else {
              bucket.anakBelumSekolahCount++;
            }

            if (item.cov.isMapped && !badgeAssigned) {
              childBadgeMap.set(child.id, {
                nama: item.posyandu.nama,
                coverage: item.cov.label,
                isMapped: true,
                id: item.posyandu.id,
              });
              badgeAssigned = true;
            }
          }
        }
      }
    }

    // 3. Loop Data ATS (Single-Pass O(ATS) dengan Kandidat Kelurahan Terindeks)
    for (let i = 0; i < dataAtsList.length; i++) {
      const ats = dataAtsList[i];
      const atsKel = normalizeWilayah(ats.kelurahan);
      const atsKec = normalizeWilayah(ats.kecamatan);
      const candidateList = atsKel ? posyandusByKelurahan.get(atsKel) || [] : [];

      let badgeAssigned = false;

      for (let j = 0; j < candidateList.length; j++) {
        const item = candidateList[j];
        const p = item.posyandu;
        const cakupan = item.cakupan;

        let matches = true;
        if (item.pKec && atsKec && !item.pKec.includes(atsKec) && !atsKec.includes(item.pKec)) {
          matches = false;
        }

        if (matches) {
          const atsRw = (ats.rw || "").replace(/\D/g, "");
          const rawAtsRw = String(ats.rw || "").toLowerCase();
          const isRwBelum = !atsRw || rawAtsRw.includes("belum") || rawAtsRw === "-" || atsRw === "0" || atsRw === "00";

          // Sesuai ketentuan: Data dengan isian RW “Belum Tahu” tetap dialirkan ke seluruh Posyandu di wilayah kelurahan
          if (isRwBelum) {
            matches = true;
          } else {
            const posyanduRw = cakupan?.rw || getPosyanduCakupanRw(p) || p.rw;
            const normPosRw = posyanduRw ? String(parseInt(posyanduRw.replace(/\D/g, ""), 10)) : "";

            if (cakupan?.rwList && cakupan.rwList.length > 0) {
              const normRwList = cakupan.rwList.map((r: string) => String(parseInt(r.replace(/\D/g, ""), 10)));
              const cleanAtsRw = String(parseInt(atsRw, 10));
              if (!normRwList.includes(cleanAtsRw)) {
                matches = false;
              } else if (cakupan.rtList && cakupan.rtList.length > 0) {
                const atsRt = (ats.rt || "").replace(/\D/g, "");
                const rawAtsRt = String(ats.rt || "").toLowerCase();
                const isRtBelum = !atsRt || rawAtsRt.includes("belum") || rawAtsRt === "-" || atsRt === "0" || atsRt === "00";
                if (!isRtBelum) {
                  const normRtList = cakupan.rtList.map((r: string) => String(parseInt(r.replace(/\D/g, ""), 10)));
                  const cleanAtsRt = String(parseInt(atsRt, 10));
                  if (!normRtList.includes(cleanAtsRt)) {
                    matches = false;
                  }
                }
              }
            } else if (normPosRw) {
              const cleanAtsRw = String(parseInt(atsRw, 10));
              if (cleanAtsRw !== normPosRw) {
                matches = false;
              } else if (cakupan?.rtList && cakupan.rtList.length > 0) {
                const atsRt = (ats.rt || "").replace(/\D/g, "");
                const rawAtsRt = String(ats.rt || "").toLowerCase();
                const isRtBelum = !atsRt || rawAtsRt.includes("belum") || rawAtsRt === "-" || atsRt === "0" || atsRt === "00";
                if (!isRtBelum) {
                  const normRtList = cakupan.rtList.map((r: string) => String(parseInt(r.replace(/\D/g, ""), 10)));
                  const cleanAtsRt = String(parseInt(atsRt, 10));
                  if (!normRtList.includes(cleanAtsRt)) {
                    matches = false;
                  }
                }
              }
            }
          }
        }

        if (matches) {
          const bucket = map.get(p.id);
          if (bucket) {
            bucket.atsList.push(ats);
            if (item.cov.isMapped && !badgeAssigned) {
              atsBadgeMap.set(ats.id, {
                nama: p.nama,
                coverage: item.cov.label,
                isMapped: true,
                id: p.id,
              });
              badgeAssigned = true;
            }
          }
        }
      }
    }

    return { posyanduDataMap: map, childBadgeMap, atsBadgeMap };
  }, [allPosyandusInScope, dataAnakList, dataAtsList]);

  // Hitung total posyandu terpetakan vs belum dipetakan dalam cakupan
  const { totalMappedPosyandu, totalUnmappedPosyandu } = useMemo(() => {
    let mapped = 0;
    let unmapped = 0;
    filteredPosyandus.forEach((p) => {
      const info = posyanduDataMap.get(p.id);
      if (info?.isMapped) mapped++;
      else unmapped++;
    });
    return { totalMappedPosyandu: mapped, totalUnmappedPosyandu: unmapped };
  }, [filteredPosyandus, posyanduDataMap]);

  // 4. Filter data anak usia 0-6 tahun
  const filteredDataAnak = useMemo(() => {
    let list = dataAnakList;

    // Filter Kecamatan
    if (selectedKecamatan !== "semua") {
      const cleanKec = selectedKecamatan.toLowerCase().trim();
      list = list.filter((c) => {
        const domKec = (c.domisili_kecamatan || "").toLowerCase();
        const kkKec = (c.kk_kecamatan || "").toLowerCase();
        return domKec.includes(cleanKec) || kkKec.includes(cleanKec);
      });
    }

    // Filter Kelurahan
    if (selectedKelurahan !== "semua") {
      const cleanKel = selectedKelurahan.toLowerCase().trim();
      list = list.filter((c) => {
        const domKel = (c.domisili_kelurahan || "").toLowerCase();
        const kkKel = (c.kk_kelurahan || "").toLowerCase();
        return domKel.includes(cleanKel) || kkKel.includes(cleanKel);
      });
    }

    // Filter Posyandu Spesifik
    if (selectedPosyanduId !== "semua") {
      const targetPosInfo = posyanduDataMap.get(selectedPosyanduId);
      if (targetPosInfo) {
        list = targetPosInfo.anakList;
      }
    } else if (pemetaanFilter !== "semua") {
      // Filter Posyandu berdasarkan status pemetaan
      const allowedChildIds = new Set<string>();
      filteredPosyandus.forEach((p) => {
        const info = posyanduDataMap.get(p.id);
        info?.anakList.forEach((c) => allowedChildIds.add(c.id));
      });
      list = list.filter((c) => allowedChildIds.has(c.id));
    }

    // Filter Status Sekolah (Bersekolah PAUD vs Belum Bersekolah)
    if (statusSekolahFilter === "bersekolah") {
      list = list.filter(
        (c) => c.is_sekolah === true || (c.nama_sekolah && !c.nama_sekolah.toLowerCase().includes("belum"))
      );
    } else if (statusSekolahFilter === "belum_bersekolah") {
      list = list.filter(
        (c) => !c.is_sekolah || (c.nama_sekolah && c.nama_sekolah.toLowerCase().includes("belum"))
      );
    }

    // Pencarian Teks
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((c) => {
        const nama = (c.nama_lengkap || "").toLowerCase();
        const ortu = (c.nama_orangtua || "").toLowerCase();
        const sekolah = (c.nama_sekolah || "").toLowerCase();
        const kel = (c.domisili_kelurahan || c.kk_kelurahan || "").toLowerCase();
        const rw = (c.domisili_rw || c.kk_rw || "").toLowerCase();
        const rt = (c.domisili_rt || c.kk_rt || "").toLowerCase();
        return (
          nama.includes(q) ||
          ortu.includes(q) ||
          sekolah.includes(q) ||
          kel.includes(q) ||
          rw.includes(q) ||
          rt.includes(q)
        );
      });
    }

    return list;
  }, [
    dataAnakList,
    selectedKecamatan,
    selectedKelurahan,
    selectedPosyanduId,
    posyanduDataMap,
    pemetaanFilter,
    filteredPosyandus,
    statusSekolahFilter,
    searchQuery,
  ]);

  // 5. Filter data ATS
  const filteredDataAts = useMemo(() => {
    let list = dataAtsList;

    // Filter Kecamatan
    if (selectedKecamatan !== "semua") {
      const cleanKec = selectedKecamatan.toLowerCase().trim();
      list = list.filter((a) => (a.kecamatan || "").toLowerCase().includes(cleanKec));
    }

    // Filter Kelurahan
    if (selectedKelurahan !== "semua") {
      const cleanKel = selectedKelurahan.toLowerCase().trim();
      list = list.filter((a) => (a.kelurahan || "").toLowerCase().includes(cleanKel));
    }

    // Filter Posyandu Spesifik
    if (selectedPosyanduId !== "semua") {
      const targetPosInfo = posyanduDataMap.get(selectedPosyanduId);
      if (targetPosInfo) {
        list = targetPosInfo.atsList;
      }
    } else if (pemetaanFilter !== "semua") {
      const allowedAtsIds = new Set<string>();
      filteredPosyandus.forEach((p) => {
        const info = posyanduDataMap.get(p.id);
        info?.atsList.forEach((a) => allowedAtsIds.add(a.id));
      });
      list = list.filter((a) => allowedAtsIds.has(a.id));
    }

    // Filter Kategori ATS (Belum Pernah Bersekolah, Drop Out, Lulus Tidak Melanjutkan)
    if (statusAtsFilter !== "semua") {
      list = list.filter((a) => {
        const kat = (a as any).kategori_ats || classifyAtsCategory(a.jenjang_asal, a.alasan_tidak_sekolah, a.sekolah_sebelumnya);
        return kat.toLowerCase() === statusAtsFilter.toLowerCase();
      });
    }

    // Filter Usia ATS Pertahun (6 - 18 Tahun, atau 19+)
    if (selectedUsiaFilter !== "semua") {
      list = list.filter((a) => {
        const u = parseInt((a as any).usia || (a.tanggal_lahir ? String(getNumericAgeAts(a.tanggal_lahir)) : "0"), 10);
        if (selectedUsiaFilter === 19) {
          return u >= 19;
        }
        return u === selectedUsiaFilter;
      });
    }

    // Pencarian Teks
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((a) => {
        const nama = (a.nama_lengkap || "").toLowerCase();
        const ortu = (a.nama_orangtua || "").toLowerCase();
        const alasan = (a.alasan_tidak_sekolah || "").toLowerCase();
        const kel = (a.kelurahan || "").toLowerCase();
        const kat = ((a as any).kategori_ats || "").toLowerCase();
        return (
          nama.includes(q) ||
          ortu.includes(q) ||
          alasan.includes(q) ||
          kel.includes(q) ||
          kat.includes(q)
        );
      });
    }

    return list;
  }, [
    dataAtsList,
    selectedKecamatan,
    selectedKelurahan,
    selectedPosyanduId,
    posyanduDataMap,
    pemetaanFilter,
    filteredPosyandus,
    statusAtsFilter,
    selectedUsiaFilter,
    searchQuery,
  ]);

  // Statistik ATS komprehensif (Scope Wilayah & Posyandu)
  const atsStats = useMemo(() => {
    let scopedList = dataAtsList;

    if (selectedKecamatan !== "semua") {
      const cleanKec = selectedKecamatan.toLowerCase().trim();
      scopedList = scopedList.filter((a) => (a.kecamatan || "").toLowerCase().includes(cleanKec));
    }

    if (selectedKelurahan !== "semua") {
      const cleanKel = selectedKelurahan.toLowerCase().trim();
      scopedList = scopedList.filter((a) => (a.kelurahan || "").toLowerCase().includes(cleanKel));
    }

    if (selectedPosyanduId !== "semua") {
      const targetPosInfo = posyanduDataMap.get(selectedPosyanduId);
      if (targetPosInfo) scopedList = targetPosInfo.atsList;
    } else if (pemetaanFilter !== "semua") {
      const allowedAtsIds = new Set<string>();
      filteredPosyandus.forEach((p) => {
        const info = posyanduDataMap.get(p.id);
        info?.atsList.forEach((a) => allowedAtsIds.add(a.id));
      });
      scopedList = scopedList.filter((a) => allowedAtsIds.has(a.id));
    }

    const totalScoped = scopedList.length;
    let bpbCount = 0;
    let doCount = 0;
    let ltmCount = 0;

    const ageMap: Record<number, number> = {};
    for (let i = 6; i <= 19; i++) {
      ageMap[i] = 0;
    }

    scopedList.forEach((a) => {
      const kat = (a as any).kategori_ats || classifyAtsCategory(a.jenjang_asal, a.alasan_tidak_sekolah, a.sekolah_sebelumnya);
      if (kat === "Belum Pernah Bersekolah") {
        bpbCount++;
      } else if (kat === "Drop Out") {
        doCount++;
      } else if (kat === "Lulus Tidak Melanjutkan") {
        ltmCount++;
      }

      const u = parseInt((a as any).usia || (a.tanggal_lahir ? String(getNumericAgeAts(a.tanggal_lahir)) : "0"), 10);
      if (u >= 6 && u <= 18) {
        ageMap[u] = (ageMap[u] || 0) + 1;
      } else if (u >= 19) {
        ageMap[19] = (ageMap[19] || 0) + 1;
      }
    });

    const pctBpb = totalScoped > 0 ? ((bpbCount / totalScoped) * 100).toFixed(1) : "0";
    const pctDo = totalScoped > 0 ? ((doCount / totalScoped) * 100).toFixed(1) : "0";
    const pctLtm = totalScoped > 0 ? ((ltmCount / totalScoped) * 100).toFixed(1) : "0";

    return {
      totalScoped,
      bpbCount,
      doCount,
      ltmCount,
      pctBpb,
      pctDo,
      pctLtm,
      ageMap,
    };
  }, [
    dataAtsList,
    selectedKecamatan,
    selectedKelurahan,
    selectedPosyanduId,
    pemetaanFilter,
    filteredPosyandus,
    posyanduDataMap,
  ]);

  // Rekapitulasi Kasus ATS Per Kecamatan & Kelurahan Se-Kota Tegal (100% Presisi)
  const rekapWilayahAts = useMemo(() => {
    if (mode !== "ats") return null;

    interface KelSummary {
      nama: string;
      total: number;
      bpb: number;
      doCount: number;
      ltm: number;
      posyanduCount: number;
      mappedPosyanduCount: number;
    }

    interface KecSummary {
      nama: string;
      total: number;
      bpb: number;
      doCount: number;
      ltm: number;
      kelurahans: KelSummary[];
    }

    const kecList: KecSummary[] = [];

    // Hitung posyandu per kelurahan
    const posByKel = new Map<string, { total: number; mapped: number }>();
    allPosyandusInScope.forEach((p) => {
      const kelNorm = normalizeWilayah(p.kelurahan);
      const cov = getPosyanduCoverageDisplay(p);
      const cur = posByKel.get(kelNorm) || { total: 0, mapped: 0 };
      cur.total++;
      if (cov.isMapped) cur.mapped++;
      posByKel.set(kelNorm, cur);
    });

    // Inisialisasi struktur dari KOTA_TEGAL_DATA
    Object.keys(KOTA_TEGAL_DATA).forEach((kecName) => {
      const kecObj = KOTA_TEGAL_DATA[kecName];
      const kelList: KelSummary[] = [];

      Object.keys(kecObj.kelurahan).forEach((kelName) => {
        const pInfo = posByKel.get(normalizeWilayah(kelName)) || { total: 0, mapped: 0 };
        kelList.push({
          nama: kelName,
          total: 0,
          bpb: 0,
          doCount: 0,
          ltm: 0,
          posyanduCount: pInfo.total,
          mappedPosyanduCount: pInfo.mapped,
        });
      });

      kecList.push({
        nama: kecName,
        total: 0,
        bpb: 0,
        doCount: 0,
        ltm: 0,
        kelurahans: kelList,
      });
    });

    // Agregasi dari dataAtsList (seluruh kasus ATS di database)
    dataAtsList.forEach((ats) => {
      const kelNorm = normalizeWilayah(ats.kelurahan);
      const kecNorm = normalizeWilayah(ats.kecamatan) || normalizeWilayah(findKecamatanByKelurahan(ats.kelurahan));
      const cat = ats.kategori_ats || classifyAtsCategory(ats.jenjang_asal, ats.alasan_tidak_sekolah, ats.sekolah_sebelumnya);

      let targetKec = kecList.find((k) => normalizeWilayah(k.nama) === kecNorm);
      if (!targetKec && kelNorm) {
        const inferredKec = normalizeWilayah(findKecamatanByKelurahan(ats.kelurahan));
        targetKec = kecList.find((k) => normalizeWilayah(k.nama) === inferredKec);
      }

      if (targetKec) {
        targetKec.total++;
        if (cat === "Belum Pernah Bersekolah") targetKec.bpb++;
        else if (cat === "Drop Out") targetKec.doCount++;
        else if (cat === "Lulus Tidak Melanjutkan") targetKec.ltm++;

        const targetKel = targetKec.kelurahans.find((kl) => normalizeWilayah(kl.nama) === kelNorm);
        if (targetKel) {
          targetKel.total++;
          if (cat === "Belum Pernah Bersekolah") targetKel.bpb++;
          else if (cat === "Drop Out") targetKel.doCount++;
          else if (cat === "Lulus Tidak Melanjutkan") targetKel.ltm++;
        }
      }
    });

    return kecList;
  }, [mode, dataAtsList, allPosyandusInScope]);

  // Statistik untuk Metrik
  const stats = useMemo(() => {
    if (mode === "anak") {
      const total = filteredDataAnak.length;
      const bersekolah = filteredDataAnak.filter(
        (c) => c.is_sekolah === true || (c.nama_sekolah && !c.nama_sekolah.toLowerCase().includes("belum"))
      ).length;
      const belum = total - bersekolah;
      const pctSekolah = total > 0 ? ((bersekolah / total) * 100).toFixed(1) : "0";
      const pctBelum = total > 0 ? ((belum / total) * 100).toFixed(1) : "0";
      return { total, bersekolah, belum, pctSekolah, pctBelum };
    } else {
      const total = filteredDataAts.length;
      return { total, bersekolah: 0, belum: 0, pctSekolah: "0", pctBelum: "0" };
    }
  }, [mode, filteredDataAnak, filteredDataAts]);

  // Paginasi anak / ATS
  const paginatedAnak = useMemo(() => {
    return filteredDataAnak.slice(0, visibleCount);
  }, [filteredDataAnak, visibleCount]);

  const paginatedAts = useMemo(() => {
    return filteredDataAts.slice(0, visibleCount);
  }, [filteredDataAts, visibleCount]);

  // Cari nama posyandu tempat bernaung untuk kartu anak (O(1) Instant Lookup)
  const findChildPosyanduBadge = (child: DataAnakItem) => {
    const cached = childBadgeMap.get(child.id);
    if (cached) return cached;
    // Jika belum bernaung di posyandu terpetakan
    const kel = child.domisili_kelurahan || child.kk_kelurahan || "Kelurahan";
    return {
      nama: `Posyandu di Kel. ${kel}`,
      coverage: "Cakupan Belum Dipetakan",
      isMapped: false,
      id: null,
    };
  };

  const findAtsPosyanduBadge = (ats: DataAtsItem) => {
    const cached = atsBadgeMap.get(ats.id);
    if (cached) return cached;
    const kel = ats.kelurahan || "Kelurahan";
    return {
      nama: `Posyandu di Kel. ${kel}`,
      coverage: "Cakupan Belum Dipetakan",
      isMapped: false,
      id: null,
    };
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. KARTU INFORMASI SISTEM PEMETAAN DINAMIS */}
      <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-4 sm:p-5 space-y-2.5 shadow-2xs">
        <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-xs sm:text-sm">
          <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600 shrink-0" />
          <span>Sistem Integrasi &amp; Pemetaan Cakupan Posyandu Adaptif</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {mode === "anak" ? (
            <>
              Halaman ini mengumpulkan dan mengelompokkan <strong>Data Anak Usia Dini (0–6 Tahun)</strong> yang{" "}
              <strong>bersekolah di PAUD</strong> maupun yang <strong>belum bersekolah</strong> secara berjenjang.
              Posyandu yang <strong>sudah dipetakan</strong> menyaring data anak berdasarkan RW &amp; RT cakupannya.
              Posyandu yang <strong>belum dipetakan</strong> menaungi anak di lingkungan kelurahannya. Ketika pemetaan wilayah
              baru ditambahkan ke sistem, pembagian data anak akan <strong>otomatis menyesuaikan secara presisi</strong>.
            </>
          ) : (
            <>
              Halaman ini mengumpulkan dan mengelompokkan <strong>Data Anak Tidak Sekolah (ATS)</strong> untuk dipantau dan
              diintervensi secara berjenjang oleh kader Posyandu. Kasus ATS dialirkan menurut cakupan wilayah masing-masing Posyandu.
              Ketika pemetaan wilayah baru ditambahkan, distribusi data kasus akan <strong>otomatis menyesuaikan</strong>.
            </>
          )}
        </p>
      </div>

      {/* 2. STATISTIK UTAMA (METRIC CARDS) */}
      {mode === "anak" ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Metric 1: Total Sasaran */}
          <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Total Anak (0–6 Thn)
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Baby className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
              {stats.total.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              Seluruh anak usia dini terdata
            </p>
          </div>

          {/* Metric 2: Bersekolah di PAUD */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 sm:p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Bersekolah (PAUD)
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                <School className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-300 font-mono">
              {stats.bersekolah.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 font-medium truncate">
              {stats.pctSekolah}% dari total anak
            </p>
          </div>

          {/* Metric 3: Belum Bersekolah */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 sm:p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Belum Bersekolah
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300">
                <HeartPulse className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-300 font-mono">
              {stats.belum.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400 font-medium truncate">
              {stats.pctBelum}% balita / belum PAUD
            </p>
          </div>

          {/* Metric 4: Status Posyandu Terpetakan vs Belum Dipetakan */}
          <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Posyandu Terpetakan
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-700 dark:text-teal-300">
                <Layers className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
              <span className="text-emerald-700 dark:text-emerald-400">{totalMappedPosyandu}</span>
              <span className="text-muted-foreground/50 text-base font-normal"> / </span>
              <span className="text-amber-700 dark:text-amber-400 text-sm font-bold" title={`${totalUnmappedPosyandu} Posyandu Belum Dipetakan`}>
                {totalUnmappedPosyandu} Belum
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {totalMappedPosyandu} siap sinkron, {totalUnmappedPosyandu} menanti pemetaan
            </p>
          </div>
        </div>
      ) : (
        /* METRIC CARDS KHUSUS DATA ATS SESUAI KETENTUAN USER (3 KATEGORI RESMI) */
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          {/* Card 1: Total Kasus ATS */}
          <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Total Kasus ATS
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
              {atsStats.totalScoped.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              Kasus anak tidak sekolah terdata
            </p>
          </div>

          {/* Card 2: Belum Pernah Bersekolah (BPB) */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3.5 sm:p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                Belum Pernah Sekolah
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/20 text-rose-700 dark:text-rose-300">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-800 dark:text-rose-300 font-mono">
              {atsStats.bpbCount.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-rose-700/80 dark:text-rose-400 font-medium truncate">
              {atsStats.pctBpb}% dari total kasus ATS
            </p>
          </div>

          {/* Card 3: Drop Out / Putus Sekolah (DO) */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 sm:p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Drop Out (Putus Sekolah)
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-800 dark:text-amber-300 font-mono">
              {atsStats.doCount.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400 font-medium truncate">
              {atsStats.pctDo}% kasus putus sekolah
            </p>
          </div>

          {/* Card 4: Lulus Tidak Melanjutkan (LTM) */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-3.5 sm:p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                Lulus Tdk Melanjutkan
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-300">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-blue-800 dark:text-blue-300 font-mono">
              {atsStats.ltmCount.toLocaleString("id-ID")}
            </div>
            <p className="text-[11px] text-blue-700/80 dark:text-blue-400 font-medium truncate">
              {atsStats.pctLtm}% lulusan tanpa jenjang lanjut
            </p>
          </div>
        </div>
      )}

      {/* 2.5 CAKUPAN USIA ATS PERTAHUN (6 - 18 TAHUN) INTERAKTIF */}
      {mode === "ats" && (
        <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-4 sm:p-5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-secondary shrink-0" />
              <div>
                <h4 className="text-xs sm:text-sm font-black text-foreground">
                  Cakupan Usia ATS Pertahun (Usia 6 s/d 18 Tahun)
                </h4>
                <p className="text-2xs text-muted-foreground">
                  Pilih kelompok usia pertahun di bawah ini untuk melihat rincian kasus dan menyaring daftar anak
                </p>
              </div>
            </div>
            {selectedUsiaFilter !== "semua" && (
              <button
                type="button"
                onClick={() => setSelectedUsiaFilter("semua")}
                className="text-2xs font-bold text-secondary bg-secondary/10 hover:bg-secondary/20 px-2.5 py-1 rounded-md border border-secondary/30 transition-all cursor-pointer self-start sm:self-auto"
              >
                Tampilkan Semua Usia
              </button>
            )}
          </div>

          {/* Baris Tombol Usia Pertahun: 6 s/d 18 Tahun */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setSelectedUsiaFilter("semua")}
              className={cn(
                "px-2.5 py-1.5 rounded-lg text-2xs font-extrabold transition-all border cursor-pointer flex items-center gap-1.5",
                selectedUsiaFilter === "semua"
                  ? "bg-foreground text-background border-foreground shadow-2xs"
                  : "bg-card text-muted-foreground border-border hover:text-foreground hover:bg-muted"
              )}
            >
              <span>Semua Usia</span>
              <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-background/20">
                {atsStats.totalScoped}
              </span>
            </button>

            {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((age) => {
              const count = atsStats.ageMap[age] || 0;
              const isSelected = selectedUsiaFilter === age;
              const label = age === 19 ? "19+ Thn" : `${age} Thn`;

              return (
                <button
                  key={age}
                  type="button"
                  onClick={() => setSelectedUsiaFilter(isSelected ? "semua" : age)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-2xs font-bold transition-all border cursor-pointer flex items-center gap-1.5",
                    isSelected
                      ? "bg-secondary text-secondary-foreground border-secondary shadow-xs scale-102"
                      : count > 0
                      ? "bg-card text-foreground border-border hover:border-secondary/50 hover:bg-muted"
                      : "bg-muted/50 text-muted-foreground/60 border-border/50 cursor-not-allowed"
                  )}
                  disabled={count === 0}
                  title={`Kasus ATS Usia ${label}: ${count} anak`}
                >
                  <span className="font-semibold">Usia {label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded-full font-mono text-[10px] font-black",
                      isSelected
                        ? "bg-white/25 text-white"
                        : "bg-secondary/15 text-secondary"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ALAT FILTER & NAVIGASI BERJENJANG */}
      <section className="rounded-xl border border-border bg-card p-4 space-y-3.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary shrink-0" />
            <h4 className="text-xs sm:text-sm font-bold text-foreground">
              Filter Wilayah &amp; Posyandu Berjenjang
            </h4>
          </div>

          {/* Toggle Tampilan: Daftar Kartu vs Rekap Wilayah & Posyandu */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border/80 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewTab("daftar_anak")}
              className={cn(
                "px-2.5 py-1 rounded-md text-2xs font-bold transition-all cursor-pointer",
                viewTab === "daftar_anak"
                  ? "bg-card text-foreground shadow-2xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {mode === "anak" ? "Daftar Anak Usia 0–6 Thn" : "Daftar Kasus ATS (Bertahap)"}
            </button>
            <button
              type="button"
              onClick={() => setViewTab("rekap_posyandu")}
              className={cn(
                "px-2.5 py-1 rounded-md text-2xs font-bold transition-all cursor-pointer flex items-center gap-1",
                viewTab === "rekap_posyandu"
                  ? "bg-card text-foreground shadow-2xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span>{mode === "anak" ? "Matriks Posyandu" : "Rekap Wilayah & Posyandu"}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-mono">
                {mode === "anak" ? filteredPosyandus.length : `${filteredPosyandus.length} Pos`}
              </span>
            </button>
          </div>
        </div>

        {/* Baris Filter Dropdown Wilayah */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {/* Filter Kecamatan (aktif jika level Kota) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Kecamatan
            </label>
            <select
              value={selectedKecamatan}
              disabled={level !== "kota"}
              onChange={(e) => {
                setSelectedKecamatan(e.target.value);
                setSelectedKelurahan("semua");
                setSelectedPosyanduId("semua");
              }}
              className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary disabled:opacity-60 cursor-pointer"
            >
              {level === "kota" && <option value="semua">Semua Kecamatan ({daftarKecamatan.length})</option>}
              {daftarKecamatan.map((kec) => (
                <option key={kec} value={kec}>
                  Kecamatan {kec}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kelurahan */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Kelurahan
            </label>
            <select
              value={selectedKelurahan}
              disabled={level === "kelurahan"}
              onChange={(e) => {
                setSelectedKelurahan(e.target.value);
                setSelectedPosyanduId("semua");
              }}
              className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary disabled:opacity-60 cursor-pointer"
            >
              {level !== "kelurahan" && (
                <option value="semua">Semua Kelurahan ({daftarKelurahan.length})</option>
              )}
              {daftarKelurahan.map((kel) => (
                <option key={kel} value={kel}>
                  Kelurahan {kel}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Posyandu Unit */}
          <div className="space-y-1 sm:col-span-2 md:col-span-1">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Pilih Posyandu
            </label>
            <select
              value={selectedPosyanduId}
              onChange={(e) => setSelectedPosyanduId(e.target.value)}
              className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="semua">Semua Posyandu ({filteredPosyandus.length})</option>
              {filteredPosyandus.map((p) => {
                const info = posyanduDataMap.get(p.id);
                return (
                  <option key={p.id} value={p.id}>
                    {p.nama} {info?.isMapped ? "✓" : "(Belum Peta)"} ({p.kelurahan})
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Baris Filter Sub-Kategori & Status Pemetaan */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
          {/* Filter Status Sekolah (Mode Anak) */}
          {mode === "anak" && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-muted-foreground mr-1">Status:</span>
              <button
                type="button"
                onClick={() => setStatusSekolahFilter("semua")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-2xs font-bold transition-all border cursor-pointer",
                  statusSekolahFilter === "semua"
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground"
                )}
              >
                Semua Anak (Sekolah &amp; Tidak Sekolah)
              </button>
              <button
                type="button"
                onClick={() => setStatusSekolahFilter("bersekolah")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-2xs font-bold transition-all border cursor-pointer",
                  statusSekolahFilter === "bersekolah"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground"
                )}
              >
                Bersekolah (PAUD)
              </button>
              <button
                type="button"
                onClick={() => setStatusSekolahFilter("belum_bersekolah")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-2xs font-bold transition-all border cursor-pointer",
                  statusSekolahFilter === "belum_bersekolah"
                    ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground"
                )}
              >
                Belum Bersekolah
              </button>
            </div>
          )}

          {/* Filter Kategori ATS (Mode ATS: 3 Kategori Resmi Sesuai Ketentuan) */}
          {mode === "ats" && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-muted-foreground mr-1">Kategori ATS:</span>
              <button
                type="button"
                onClick={() => setStatusAtsFilter("semua")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-2xs font-bold transition-all border cursor-pointer",
                  statusAtsFilter === "semua"
                    ? "bg-foreground text-background border-foreground shadow-2xs"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground"
                )}
              >
                Semua Status ({atsStats.totalScoped})
              </button>
              <button
                type="button"
                onClick={() => setStatusAtsFilter("Belum Pernah Bersekolah")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-2xs font-bold transition-all border cursor-pointer flex items-center gap-1",
                  statusAtsFilter === "Belum Pernah Bersekolah"
                    ? "bg-rose-600 text-white border-rose-600 shadow-2xs"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground"
                )}
              >
                <span>Belum Pernah Bersekolah</span>
                <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-background/20">
                  {atsStats.bpbCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStatusAtsFilter("Drop Out")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-2xs font-bold transition-all border cursor-pointer flex items-center gap-1",
                  statusAtsFilter === "Drop Out"
                    ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground"
                )}
              >
                <span>Drop Out</span>
                <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-background/20">
                  {atsStats.doCount}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStatusAtsFilter("Lulus Tidak Melanjutkan")}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-2xs font-bold transition-all border cursor-pointer flex items-center gap-1",
                  statusAtsFilter === "Lulus Tidak Melanjutkan"
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-muted text-muted-foreground border-border hover:text-foreground"
                )}
              >
                <span>Lulus Tidak Melanjutkan</span>
                <span className="px-1.5 py-0.2 rounded-full font-mono text-[10px] bg-background/20">
                  {atsStats.ltmCount}
                </span>
              </button>
            </div>
          )}

          {/* Filter Pemetaan Posyandu */}
          <div className="flex items-center gap-1.5 flex-wrap ml-auto">
            <span className="text-[11px] font-bold text-muted-foreground mr-1">Pemetaan:</span>
            <button
              type="button"
              onClick={() => setPemetaanFilter("semua")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-2xs font-bold transition-all border cursor-pointer",
                pemetaanFilter === "semua"
                  ? "bg-foreground text-background border-foreground shadow-2xs"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              )}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setPemetaanFilter("terpetakan")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-2xs font-bold transition-all border cursor-pointer",
                pemetaanFilter === "terpetakan"
                  ? "bg-teal-600 text-white border-teal-600 shadow-2xs"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              )}
            >
              Terpetakan ({totalMappedPosyandu})
            </button>
            <button
              type="button"
              onClick={() => setPemetaanFilter("belum_terpetakan")}
              className={cn(
                "px-2.5 py-1 rounded-lg text-2xs font-bold transition-all border cursor-pointer",
                pemetaanFilter === "belum_terpetakan"
                  ? "bg-amber-600 text-white border-amber-600 shadow-2xs"
                  : "bg-muted text-muted-foreground border-border hover:text-foreground"
              )}
            >
              Belum Dipetakan ({totalUnmappedPosyandu})
            </button>
          </div>
        </div>

        {/* Input Pencarian */}
        <div className="relative pt-1">
          <Search className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              mode === "anak"
                ? "Cari nama anak, nama orang tua, sekolah PAUD, atau alamat RT/RW..."
                : "Cari nama anak ATS, alasan tidak sekolah, atau alamat RT/RW..."
            }
            className="w-full h-10 rounded-xl border border-border bg-background pl-9 pr-4 text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary shadow-2xs"
          />
        </div>
      </section>

      {/* 4. KONTEN TAMPILAN MATRIKS POSYANDU & REKAP WILAYAH */}
      {viewTab === "rekap_posyandu" && (
        <div className="space-y-4">
          {/* TABEL REKAPITULASI SEBARAN ATS SE-KOTA TEGAL (100% PRESISI) */}
          {mode === "ats" && rekapWilayahAts && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3.5 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4 text-secondary shrink-0" />
                    <h4 className="text-xs sm:text-sm font-black text-foreground">
                      Tabel Rekapitulasi Kasus ATS Se-Kota Tegal (4 Kecamatan, 27 Kelurahan)
                    </h4>
                  </div>
                  <p className="text-2xs text-muted-foreground">
                    Perhitungan 100% presisi teragregasi dari seluruh {dataAtsList.length.toLocaleString("id-ID")} kasus ATS di database.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-2xs font-bold text-muted-foreground flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-400 font-mono">
                    BPB: {atsStats.bpbCount.toLocaleString("id-ID")}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 font-mono">
                    DO: {atsStats.doCount.toLocaleString("id-ID")}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-400 font-mono">
                    LTM: {atsStats.ltmCount.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Tabel Responsif */}
              <div className="overflow-x-auto rounded-lg border border-border/70">
                <table className="w-full text-2xs text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/70 text-foreground font-bold border-b border-border/70">
                      <th className="p-2.5">Wilayah (Kecamatan / Kelurahan)</th>
                      <th className="p-2.5 text-center">Total Kasus</th>
                      <th className="p-2.5 text-center text-rose-700 dark:text-rose-400">Belum Sekolah (BPB)</th>
                      <th className="p-2.5 text-center text-amber-700 dark:text-amber-400">Drop Out (DO)</th>
                      <th className="p-2.5 text-center text-blue-700 dark:text-blue-400">Lulus Tdk Lanjut (LTM)</th>
                      <th className="p-2.5 text-center">Posyandu</th>
                      <th className="p-2.5 text-center">Aksi Filter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {rekapWilayahAts.map((kec) => (
                      <Fragment key={kec.nama}>
                        {/* Baris Subtotal Kecamatan */}
                        <tr className="bg-muted/50 font-bold text-foreground">
                          <td className="p-2.5">
                            <span className="uppercase text-[11px] font-black text-secondary">
                              Kecamatan {kec.nama}
                            </span>
                            <span className="text-muted-foreground text-[10px] ml-1.5 font-normal">
                              ({kec.kelurahans.length} Kelurahan)
                            </span>
                          </td>
                          <td className="p-2.5 text-center font-mono font-black text-foreground">
                            {kec.total.toLocaleString("id-ID")}
                          </td>
                          <td className="p-2.5 text-center font-mono text-rose-700 dark:text-rose-400 font-bold">
                            {kec.bpb.toLocaleString("id-ID")}
                          </td>
                          <td className="p-2.5 text-center font-mono text-amber-700 dark:text-amber-400 font-bold">
                            {kec.doCount.toLocaleString("id-ID")}
                          </td>
                          <td className="p-2.5 text-center font-mono text-blue-700 dark:text-blue-400 font-bold">
                            {kec.ltm.toLocaleString("id-ID")}
                          </td>
                          <td className="p-2.5 text-center text-muted-foreground font-mono">
                            {kec.kelurahans.reduce((acc, k) => acc + k.posyanduCount, 0)} Unit
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedKecamatan(kec.nama);
                                setSelectedKelurahan("semua");
                                setSelectedPosyanduId("semua");
                                setViewTab("daftar_anak");
                              }}
                              className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
                            >
                              Lihat {kec.nama} ({kec.total.toLocaleString("id-ID")})
                            </button>
                          </td>
                        </tr>

                        {/* Baris Kelurahan dalam Kecamatan */}
                        {kec.kelurahans.map((kel) => (
                          <tr key={kel.nama} className="hover:bg-muted/20 text-muted-foreground transition-colors">
                            <td className="p-2.5 pl-6 font-medium text-foreground">
                              <span>Kelurahan {kel.nama}</span>
                            </td>
                            <td className="p-2.5 text-center font-mono font-bold text-foreground">
                              {kel.total.toLocaleString("id-ID")}
                            </td>
                            <td className="p-2.5 text-center font-mono text-rose-700 dark:text-rose-400">
                              {kel.bpb.toLocaleString("id-ID")}
                            </td>
                            <td className="p-2.5 text-center font-mono text-amber-700 dark:text-amber-400">
                              {kel.doCount.toLocaleString("id-ID")}
                            </td>
                            <td className="p-2.5 text-center font-mono text-blue-700 dark:text-blue-400">
                              {kel.ltm.toLocaleString("id-ID")}
                            </td>
                            <td className="p-2.5 text-center font-mono text-[11px]">
                              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{kel.mappedPosyanduCount}</span>
                              <span className="text-muted-foreground/60">/{kel.posyanduCount}</span>
                            </td>
                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedKecamatan(kec.nama);
                                  setSelectedKelurahan(kel.nama);
                                  setSelectedPosyanduId("semua");
                                  setViewTab("daftar_anak");
                                }}
                                className="px-2 py-0.5 rounded-md bg-secondary/10 hover:bg-secondary/20 text-secondary border border-secondary/30 text-[10px] font-bold transition-all cursor-pointer"
                              >
                                Filter Kelurahan
                              </button>
                            </td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}

                    {/* Baris Total Keseluruhan Se-Kota Tegal */}
                    <tr className="bg-secondary/15 font-black text-foreground border-t-2 border-secondary/40">
                      <td className="p-2.5 text-xs uppercase text-secondary">
                        TOTAL SE-KOTA TEGAL (4 KECAMATAN, 27 KELURAHAN)
                      </td>
                      <td className="p-2.5 text-center font-mono text-sm text-foreground">
                        {dataAtsList.length.toLocaleString("id-ID")}
                      </td>
                      <td className="p-2.5 text-center font-mono text-rose-700 dark:text-rose-400">
                        {atsStats.bpbCount.toLocaleString("id-ID")}
                      </td>
                      <td className="p-2.5 text-center font-mono text-amber-700 dark:text-amber-400">
                        {atsStats.doCount.toLocaleString("id-ID")}
                      </td>
                      <td className="p-2.5 text-center font-mono text-blue-700 dark:text-blue-400">
                        {atsStats.ltmCount.toLocaleString("id-ID")}
                      </td>
                      <td className="p-2.5 text-center font-mono">
                        {allPosyandusInScope.length} Posyandu
                      </td>
                      <td className="p-2.5 text-center">
                        <span className="text-[10px] font-extrabold text-secondary">100% Presisi</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <h4 className="text-xs sm:text-sm font-bold text-foreground">
              Daftar Posyandu &amp; Cakupan Wilayah ({filteredPosyandus.length} Posyandu)
            </h4>
            <span className="text-2xs text-muted-foreground font-medium">
              Klik nama Posyandu untuk memfilter data anak
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredPosyandus.map((p) => {
              const info = posyanduDataMap.get(p.id);
              const isSelected = selectedPosyanduId === p.id;
              const pKec = findKecamatanByKelurahan(p.kelurahan) || p.kecamatan || "";

              return (
                <div
                  key={p.id}
                  className={cn(
                    "rounded-xl border p-4 transition-all shadow-2xs flex flex-col justify-between gap-3",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h5 className="text-xs sm:text-sm font-black text-foreground truncate">
                            {p.nama}
                          </h5>
                          {info?.isMapped ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
                              <span>Terpetakan</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                              <AlertCircle className="h-3 w-3 text-amber-600 shrink-0" />
                              <span>Belum Dipetakan</span>
                            </span>
                          )}
                        </div>
                        <p className="text-2xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-primary shrink-0" />
                          <span>
                            Kelurahan {p.kelurahan}, Kecamatan {pKec}
                          </span>
                        </p>
                      </div>

                      <Link
                        href={`/komunitas/${p.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline shrink-0"
                        title="Buka Halaman Posyandu"
                      >
                        <span>Buka</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>

                    {/* Cakupan Wilayah */}
                    <div className="rounded-lg bg-muted/50 p-2.5 text-2xs space-y-1 border border-border/60">
                      <span className="font-extrabold text-muted-foreground uppercase text-[10px] tracking-wider block">
                        Cakupan Wilayah Sinkronisasi:
                      </span>
                      <p className="text-foreground font-semibold">
                        {info?.coverageLabel}
                      </p>
                    </div>
                  </div>

                  {/* Statistik Posyandu */}
                  <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 text-2xs">
                    {mode === "anak" ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-foreground">
                          {info?.anakList.length || 0} Anak (0–6 Thn)
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          {info?.anakSekolahCount || 0} Sekolah
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-amber-700 dark:text-amber-400 font-semibold">
                          {info?.anakBelumSekolahCount || 0} Belum
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-secondary">
                          {info?.atsList.length || 0} Kasus ATS
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-rose-700 dark:text-rose-400 font-semibold text-[11px]">
                          {info?.atsList.filter(a => ((a as any).kategori_ats || classifyAtsCategory(a.jenjang_asal, a.alasan_tidak_sekolah, a.sekolah_sebelumnya)) === "Belum Pernah Bersekolah").length || 0} BPB
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                          {info?.atsList.filter(a => ((a as any).kategori_ats || classifyAtsCategory(a.jenjang_asal, a.alasan_tidak_sekolah, a.sekolah_sebelumnya)) === "Drop Out").length || 0} DO
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-blue-700 dark:text-blue-400 font-semibold text-[11px]">
                          {info?.atsList.filter(a => ((a as any).kategori_ats || classifyAtsCategory(a.jenjang_asal, a.alasan_tidak_sekolah, a.sekolah_sebelumnya)) === "Lulus Tidak Melanjutkan").length || 0} LTM
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPosyanduId("semua");
                        } else {
                          setSelectedPosyanduId(p.id);
                          setViewTab("daftar_anak");
                        }
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-2xs font-bold transition-all cursor-pointer border",
                        isSelected
                          ? "bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20"
                          : "bg-primary text-primary-foreground border-primary hover:bg-primary-hover shadow-2xs"
                      )}
                    >
                      {isSelected ? "Lepas Filter" : "Pilih Posyandu"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. KONTEN DAFTAR KARTU ANAK (0–6 TAHUN) / KASUS ATS */}
      {viewTab === "daftar_anak" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="space-y-0.5">
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                {mode === "anak" ? (
                  <>Daftar Anak Usia 0–6 Tahun ({filteredDataAnak.length.toLocaleString("id-ID")} Anak Terdata)</>
                ) : (
                  <>Daftar Kasus Anak Tidak Sekolah ({filteredDataAts.length.toLocaleString("id-ID")} Kasus ATS)</>
                )}
              </h4>
              <p className="text-2xs text-muted-foreground font-medium">
                {selectedPosyanduId !== "semua"
                  ? `Difilter khusus Posyandu: ${posyanduDataMap.get(selectedPosyanduId)?.posyandu.nama}`
                  : `Cakupan: ${selectedKelurahan !== "semua" ? `Kelurahan ${selectedKelurahan}` : selectedKecamatan !== "semua" ? `Kecamatan ${selectedKecamatan}` : "Seluruh Kota Tegal"}`}
              </p>
            </div>

            {selectedPosyanduId !== "semua" && (
              <button
                type="button"
                onClick={() => setSelectedPosyanduId("semua")}
                className="inline-flex items-center gap-1 text-2xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-md hover:bg-rose-500/20 cursor-pointer"
              >
                <span>Hapus Filter Posyandu</span>
              </button>
            )}
          </div>

          {/* Info Banner Tampilan Bertahap & Presisi Rekap */}
          {mode === "ats" && (
            <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-3 sm:p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground shadow-2xs">
              <Info className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-bold text-foreground text-xs">
                    Tampilan Bertahap: Menampilkan {paginatedAts.length} dari {filteredDataAts.length.toLocaleString("id-ID")} Kasus ATS
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewTab("rekap_posyandu")}
                    className="text-[11px] font-extrabold text-secondary hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Table className="h-3 w-3" />
                    <span>Lihat Tabel Rekapitulasi Wilayah (27 Kelurahan)</span>
                  </button>
                </div>
                <p className="text-2xs text-muted-foreground leading-relaxed">
                  Data kartu anak dimuat bertahap untuk menjaga performa halaman tetap responsif dan bebas hambatan. Seluruh angka metrik dan rekapitulasi ({atsStats.totalScoped.toLocaleString("id-ID")} kasus) dihitung 100% presisi secara lengkap dari database.
                </p>
              </div>
            </div>
          )}

          {/* Render List Anak (Mode Anak) */}
          {mode === "anak" && (
            <>
              {filteredDataAnak.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 sm:p-12 text-center space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mx-auto">
                    <Baby className="h-6 w-6" />
                  </div>
                  <h5 className="text-sm font-bold text-foreground">Tidak Ada Data Anak</h5>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Tidak ditemukan data anak usia 0–6 tahun yang sesuai dengan kriteria filter atau pencarian saat ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {paginatedAnak.map((child, idx) => {
                      const posBadge = findChildPosyanduBadge(child);
                      const isSekolah =
                        child.is_sekolah === true ||
                        (child.nama_sekolah && !child.nama_sekolah.toLowerCase().includes("belum"));
                      const childAge = child.tanggal_lahir ? getNumericAgeAts(child.tanggal_lahir) : null;
                      const displayChildAge = childAge !== null && childAge >= 0 && childAge <= 7 ? `Usia ${childAge} Thn` : null;

                      return (
                        <div
                          key={child.id || `child-${idx}`}
                          className="rounded-lg border border-border bg-card p-2.5 sm:p-3 shadow-2xs hover:border-primary/40 transition-all flex flex-col justify-between gap-1.5"
                        >
                          <div className="space-y-1.5">
                            {/* Baris Atas: Nama Anak, Gender, Usia & Status Sekolah */}
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h5 className="text-xs sm:text-sm font-bold text-foreground truncate">
                                    {child.nama_lengkap}
                                  </h5>
                                  <span
                                    className={cn(
                                      "px-1.5 py-0.2 rounded text-[10px] font-semibold font-mono",
                                      child.jenis_kelamin === "L"
                                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                                        : "bg-pink-500/10 text-pink-700 dark:text-pink-300"
                                    )}
                                  >
                                    {child.jenis_kelamin === "L" ? "L" : "P"}
                                  </span>
                                  {displayChildAge && (
                                    <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                                      • {displayChildAge}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {isSekolah ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                                  <School className="h-2.5 w-2.5 text-emerald-600" />
                                  <span>PAUD</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0">
                                  <HeartPulse className="h-2.5 w-2.5 text-amber-600" />
                                  <span>Belum PAUD</span>
                                </span>
                              )}
                            </div>

                            {/* Info Sekolah / Keterangan */}
                            <div className="text-[11px] text-muted-foreground truncate">
                              <span className="text-muted-foreground/80 font-normal">
                                {isSekolah ? "Satuan: " : "Status: "}
                              </span>
                              <span className="text-foreground font-medium">
                                {isSekolah
                                  ? child.nama_sekolah || "Satuan PAUD Terdaftar"
                                  : child.alasan_sekolah || "Belum Masuk PAUD"}
                              </span>
                            </div>

                            {/* Alamat Domisili & KK */}
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 text-primary shrink-0" />
                              <span className="truncate">
                                {child.domisili_kelurahan || child.kk_kelurahan || "Kota Tegal"}, RW{" "}
                                {child.domisili_rw || child.kk_rw || "-"}, RT{" "}
                                {child.domisili_rt || child.kk_rt || "-"}
                                {child.nama_orangtua && (
                                  <span className="text-muted-foreground/80 font-normal">
                                    {" "}• Ortu: <span className="text-foreground font-medium">{child.nama_orangtua}</span>
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Posyandu Yang Menaungi Badge */}
                          <div className="pt-1.5 border-t border-border/50 flex items-center justify-between gap-2 text-[10px]">
                            <div className="flex items-center gap-1 min-w-0 flex-1 truncate text-muted-foreground">
                              <HeartPulse className="h-3 w-3 text-teal-600 shrink-0" />
                              <span className="truncate">
                                Posyandu: <strong className="text-foreground font-semibold">{posBadge.nama}</strong>{" "}
                                <span
                                  className={cn(
                                    "font-semibold",
                                    posBadge.isMapped ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                                  )}
                                >
                                  ({posBadge.isMapped ? "Terpetakan" : "Belum"})
                                </span>
                              </span>
                            </div>

                            {child.status_approval === "approved" ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                                <Check className="h-2.5 w-2.5" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
                                <Clock className="h-2.5 w-2.5" /> Menunggu
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tombol Muat Lebih Banyak */}
                  {visibleCount < filteredDataAnak.length && (
                    <div className="pt-3 text-center print:hidden">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 30)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground shadow-2xs transition-all cursor-pointer"
                      >
                        <span>Muat 30 Anak Lebih Banyak</span>
                        <span className="text-muted-foreground">
                          ({paginatedAnak.length} dari {filteredDataAnak.length})
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Render List ATS (Mode ATS) */}
          {mode === "ats" && (
            <>
              {filteredDataAts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-8 sm:p-12 text-center space-y-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mx-auto">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <h5 className="text-sm font-bold text-foreground">Tidak Ada Data Kasus ATS</h5>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    Tidak ditemukan data anak tidak sekolah yang sesuai dengan kriteria filter atau pencarian saat ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {paginatedAts.map((ats, idx) => {
                      const posBadge = findAtsPosyanduBadge(ats);
                      const atsCat = ats.kategori_ats || classifyAtsCategory(ats.jenjang_asal, ats.alasan_tidak_sekolah, ats.sekolah_sebelumnya || (ats as any).nama_sekolah);
                      const numAge = ats.usia ? parseInt(ats.usia, 10) : getNumericAgeAts(ats.tanggal_lahir);
                      const displayAge = !isNaN(numAge) && numAge > 0 ? `Usia ${numAge} Thn` : null;

                      let catBadgeStyle = "bg-secondary/15 text-secondary border-secondary/30";
                      if (atsCat === "Belum Pernah Bersekolah") {
                        catBadgeStyle = "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30";
                      } else if (atsCat === "Drop Out") {
                        catBadgeStyle = "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
                      } else if (atsCat === "Lulus Tidak Melanjutkan") {
                        catBadgeStyle = "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30";
                      }

                      // Cek apakah alasan redundan dengan kategori ATS
                      const rawAlasan = (ats.alasan_tidak_sekolah || "").trim();
                      const lowerAlasan = rawAlasan.toLowerCase();
                      const isAlasanDuplicate =
                        !rawAlasan ||
                        lowerAlasan === atsCat.toLowerCase() ||
                        lowerAlasan.includes("belum pernah bersekolah") ||
                        lowerAlasan.includes("belum pernah sekolah") ||
                        lowerAlasan.includes("lulus tidak melanjutkan") ||
                        (atsCat === "Drop Out" && (lowerAlasan.includes("drop out") || lowerAlasan.includes("putus sekolah")));

                      return (
                        <div
                          key={ats.id || `ats-${idx}`}
                          className="rounded-lg border border-border bg-card p-2.5 sm:p-3 shadow-2xs hover:border-secondary/50 transition-all flex flex-col justify-between gap-1.5"
                        >
                          <div className="space-y-1.5">
                            {/* Baris 1: Nama Anak, Gender, Usia & Kategori ATS */}
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h5 className="text-xs sm:text-sm font-bold text-foreground truncate">
                                    {ats.nama_lengkap}
                                  </h5>
                                  <span
                                    className={cn(
                                      "px-1.5 py-0.2 rounded text-[10px] font-semibold font-mono",
                                      ats.jenis_kelamin === "L"
                                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-300"
                                        : "bg-pink-500/10 text-pink-700 dark:text-pink-300"
                                    )}
                                  >
                                    {ats.jenis_kelamin === "L" ? "L" : "P"}
                                  </span>
                                  {displayAge && (
                                    <span className="text-[11px] font-semibold text-muted-foreground font-mono">
                                      • {displayAge}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border shrink-0",
                                  catBadgeStyle
                                )}
                              >
                                {atsCat}
                              </span>
                            </div>

                            {/* Baris 2: Alasan (hanya jika spesifik & bukan duplikasi kategori) / Keinginan Sekolah */}
                            {(!isAlasanDuplicate || ats.keinginan_sekolah) && (
                              <div className="text-[11px] text-muted-foreground flex items-center justify-between gap-2 flex-wrap">
                                {!isAlasanDuplicate ? (
                                  <span className="truncate">
                                    Alasan: <strong className="text-foreground font-medium">{rawAlasan}</strong>
                                  </span>
                                ) : (
                                  <span />
                                )}

                                {ats.keinginan_sekolah && (
                                  <span className="text-[10px] font-semibold text-secondary shrink-0">
                                    Keinginan: {ats.keinginan_sekolah}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Baris 3: Alamat & Orang Tua */}
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 text-secondary shrink-0" />
                              <span className="truncate">
                                {ats.alamat || `Kel. ${ats.kelurahan || "-"}, RW ${ats.rw || "-"}, RT ${ats.rt || "-"}`}
                                {ats.nama_orangtua && (
                                  <span className="text-muted-foreground/80 font-normal">
                                    {" "}• Ortu: <span className="text-foreground font-medium">{ats.nama_orangtua}</span>
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Baris 4: Posyandu Wilayah & Status Validasi */}
                          <div className="pt-1.5 border-t border-border/50 flex items-center justify-between gap-2 text-[10px]">
                            <div className="flex items-center gap-1 min-w-0 flex-1 truncate text-muted-foreground">
                              <HeartPulse className="h-3 w-3 text-teal-600 shrink-0" />
                              <span className="truncate">
                                Posyandu: <strong className="text-foreground font-semibold">{posBadge.nama}</strong>{" "}
                                <span
                                  className={cn(
                                    "font-semibold",
                                    posBadge.isMapped ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                                  )}
                                >
                                  ({posBadge.isMapped ? "Terpetakan" : "Belum"})
                                </span>
                              </span>
                            </div>

                            {ats.status_approval === "approved" ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                                <Check className="h-2.5 w-2.5" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
                                <Clock className="h-2.5 w-2.5" /> Menunggu
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tombol Muat Lebih Banyak ATS */}
                  {visibleCount < filteredDataAts.length && (
                    <div className="pt-3 flex flex-wrap items-center justify-center gap-2 print:hidden">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 30)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground shadow-2xs transition-all cursor-pointer"
                      >
                        <span>+ Muat 30 Kasus Lebih Banyak</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 100)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-secondary/40 bg-secondary/10 hover:bg-secondary/20 text-xs font-bold text-secondary shadow-2xs transition-all cursor-pointer"
                      >
                        <span>+ Muat 100 Kasus</span>
                      </button>
                      <span className="text-2xs text-muted-foreground self-center px-2 font-mono">
                        Menampilkan {paginatedAts.length} dari {filteredDataAts.length.toLocaleString("id-ID")} kasus
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

