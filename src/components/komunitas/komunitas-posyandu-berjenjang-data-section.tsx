"use client";

import { useState, useMemo } from "react";
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
  isDataAnakMatchingKomunitas,
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

  // Pemetaan Posyandu dan Agregasi Anak & ATS
  const posyanduDataMap = useMemo(() => {
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

    allPosyandusInScope.forEach((p) => {
      const cov = getPosyanduCoverageDisplay(p);
      const meta = extractKomunitasMetadata(p);

      // Saring anak usia dini (0-6 tahun) yang bernaung di posyandu ini
      const matchedAnak = dataAnakList.filter((child) => {
        return isDataAnakMatchingKomunitas(child, p, meta, p.id);
      });

      // Saring kasus ATS yang bernaung di posyandu ini
      const pKel = (p.kelurahan || "").toLowerCase().trim();
      const pKec = (findKecamatanByKelurahan(p.kelurahan) || p.kecamatan || "").toLowerCase().trim();
      const cakupan = getPosyanduCakupanWilayah(p);

      const matchedAts = dataAtsList.filter((ats) => {
        const atsKel = (ats.kelurahan || "").toLowerCase().trim();
        const atsKec = (ats.kecamatan || "").toLowerCase().trim();
        if (atsKel && pKel && atsKel !== pKel && !atsKel.includes(pKel) && !pKel.includes(atsKel)) {
          return false;
        }
        if (atsKec && pKec && atsKec !== pKec && !atsKec.includes(pKec) && !pKec.includes(atsKec)) {
          return false;
        }

        // Jika Posyandu terpetakan cakupan RW/RT-nya
        if (cakupan?.rwList && cakupan.rwList.length > 0) {
          const atsRw = (ats.rw || "").replace(/\D/g, "");
          const isRwBelum = !atsRw || String(ats.rw).toLowerCase().includes("belum") || ats.rw === "0";
          if (isRwBelum) return true;

          const normRwList = cakupan.rwList.map((r) => String(parseInt(r, 10)));
          const cleanAtsRw = String(parseInt(atsRw, 10));
          if (!normRwList.includes(cleanAtsRw)) return false;

          if (cakupan.rtList && cakupan.rtList.length > 0) {
            const atsRt = (ats.rt || "").replace(/\D/g, "");
            const isRtBelum = !atsRt || String(ats.rt).toLowerCase().includes("belum") || ats.rt === "0";
            if (isRtBelum) return true;
            const normRtList = cakupan.rtList.map((r) => String(parseInt(r, 10)));
            const cleanAtsRt = String(parseInt(atsRt, 10));
            return normRtList.includes(cleanAtsRt);
          }
          return true;
        }

        // Posyandu belum dipetakan: menampung seluruh kelurahan
        return true;
      });

      const anakSekolah = matchedAnak.filter(
        (c) => c.is_sekolah === true || (c.nama_sekolah && !c.nama_sekolah.toLowerCase().includes("belum"))
      ).length;

      const anakBelum = matchedAnak.length - anakSekolah;

      map.set(p.id, {
        posyandu: p,
        isMapped: cov.isMapped,
        coverageLabel: cov.isMapped ? cov.label : "Cakupan Belum Dipetakan (Wilayah Kelurahan)",
        rwLabel: cov.rwLabel,
        rtLabel: cov.rtLabel,
        anakList: matchedAnak,
        atsList: matchedAts,
        anakSekolahCount: anakSekolah,
        anakBelumSekolahCount: anakBelum,
      });
    });

    return map;
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

    // Pencarian Teks
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((a) => {
        const nama = (a.nama_lengkap || "").toLowerCase();
        const ortu = (a.nama_orangtua || "").toLowerCase();
        const alasan = (a.alasan_tidak_sekolah || "").toLowerCase();
        const kel = (a.kelurahan || "").toLowerCase();
        return nama.includes(q) || ortu.includes(q) || alasan.includes(q) || kel.includes(q);
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
    searchQuery,
  ]);

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

  // Cari nama posyandu tempat bernaung untuk kartu anak
  const findChildPosyanduBadge = (child: DataAnakItem) => {
    for (const [posId, info] of posyanduDataMap.entries()) {
      if (info.isMapped && info.anakList.some((c) => c.id === child.id)) {
        return {
          nama: info.posyandu.nama,
          coverage: info.coverageLabel,
          isMapped: true,
          id: posId,
        };
      }
    }
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
    for (const [posId, info] of posyanduDataMap.entries()) {
      if (info.isMapped && info.atsList.some((a) => a.id === ats.id)) {
        return {
          nama: info.posyandu.nama,
          coverage: info.coverageLabel,
          isMapped: true,
          id: posId,
        };
      }
    }
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        {/* Metric 1: Total Sasaran */}
        <div className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase tracking-wider text-muted-foreground">
              {mode === "anak" ? "Total Anak (0–6 Thn)" : "Total Kasus ATS"}
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {mode === "anak" ? <Baby className="h-4 w-4" /> : <GraduationCap className="h-4 w-4" />}
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
            {stats.total.toLocaleString("id-ID")}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">
            {mode === "anak" ? "Seluruh anak usia dini terdata" : "Kasus anak tidak sekolah"}
          </p>
        </div>

        {/* Metric 2: Bersekolah di PAUD / Kelompok Umur ATS */}
        {mode === "anak" ? (
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
        ) : (
          <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-3.5 sm:p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-secondary">
                Kelompok Usia SD (7–12)
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
              {filteredDataAts.filter((a) => {
                const us = parseInt((a as any).usia || "0", 10);
                return us >= 7 && us <= 12;
              }).length}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">Usia wajib pendidikan dasar</p>
          </div>
        )}

        {/* Metric 3: Belum Bersekolah / Kelompok Usia SMP-SMA */}
        {mode === "anak" ? (
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
        ) : (
          <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-3.5 sm:p-4 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-secondary">
                Usia SMP &amp; SMA (13–18)
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary/15 text-secondary">
                <GraduationCap className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
              {filteredDataAts.filter((a) => {
                const us = parseInt((a as any).usia || "0", 10);
                return us >= 13 && us <= 18;
              }).length}
            </div>
            <p className="text-[11px] text-muted-foreground truncate">Pendidikan menengah &amp; kesetaraan</p>
          </div>
        )}

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

      {/* 3. ALAT FILTER & NAVIGASI BERJENJANG */}
      <section className="rounded-xl border border-border bg-card p-4 space-y-3.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary shrink-0" />
            <h4 className="text-xs sm:text-sm font-bold text-foreground">
              Filter Wilayah &amp; Posyandu Berjenjang
            </h4>
          </div>

          {/* Toggle Tampilan: Daftar Kartu vs Rekap Posyandu */}
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
              {mode === "anak" ? "Daftar Anak Usia 0–6 Thn" : "Daftar Kasus ATS"}
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
              <span>Matriks Posyandu</span>
              <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-mono">
                {filteredPosyandus.length}
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

      {/* 4. KONTEN TAMPILAN MATRIKS POSYANDU */}
      {viewTab === "rekap_posyandu" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
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
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-secondary">
                          {info?.atsList.length || 0} Kasus ATS
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
                  <>Daftar Anak Usia 0–6 Tahun ({filteredDataAnak.length} Anak Terdata)</>
                ) : (
                  <>Daftar Kasus Anak Tidak Sekolah ({filteredDataAts.length} Kasus ATS)</>
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

                      return (
                        <div
                          key={child.id || `child-${idx}`}
                          className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs space-y-3 hover:border-primary/40 transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            {/* Baris Atas: Nama Anak, Jenis Kelamin & Status Sekolah */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h5 className="text-xs sm:text-sm font-bold text-foreground truncate">
                                    {child.nama_lengkap}
                                  </h5>
                                  <span
                                    className={cn(
                                      "px-1.5 py-0.2 rounded-md text-[10px] font-bold font-mono",
                                      child.jenis_kelamin === "L"
                                        ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                        : "bg-pink-500/15 text-pink-700 dark:text-pink-300"
                                    )}
                                  >
                                    {child.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                                  </span>
                                </div>
                                <p className="text-2xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-muted-foreground shrink-0" />
                                  <span>Lahir: {child.tanggal_lahir || "-"}</span>
                                </p>
                              </div>

                              {/* Status Sekolah Badge */}
                              {isSekolah ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                                  <School className="h-3 w-3 text-emerald-600" />
                                  <span>Bersekolah</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 shrink-0">
                                  <HeartPulse className="h-3 w-3 text-amber-600" />
                                  <span>Belum Bersekolah</span>
                                </span>
                              )}
                            </div>

                            {/* Info Sekolah / Alasan */}
                            <div className="rounded-lg bg-muted/40 p-2 text-2xs space-y-0.5 border border-border/50">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase block">
                                {isSekolah ? "Satuan PAUD / Sekolah:" : "Keterangan / Alasan Belum Sekolah:"}
                              </span>
                              <p className="text-foreground font-semibold truncate">
                                {isSekolah
                                  ? child.nama_sekolah || "Satuan PAUD Terdaftar"
                                  : child.alasan_sekolah || "Belum Cukup Umur / Belum Masuk PAUD"}
                              </p>
                            </div>

                            {/* Alamat Domisili & KK */}
                            <div className="text-2xs text-muted-foreground space-y-0.5">
                              <div className="flex items-center gap-1 text-foreground font-medium">
                                <MapPin className="h-3 w-3 text-primary shrink-0" />
                                <span className="truncate">
                                  {child.domisili_kelurahan || child.kk_kelurahan || "Kota Tegal"}, RW{" "}
                                  {child.domisili_rw || child.kk_rw || "-"}, RT{" "}
                                  {child.domisili_rt || child.kk_rt || "-"}
                                </span>
                              </div>
                              {child.nama_orangtua && (
                                <div className="text-[11px] text-muted-foreground pl-4">
                                  Orang Tua: <span className="text-foreground font-medium">{child.nama_orangtua}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Posyandu Yang Menaungi Badge */}
                          <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 text-2xs">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <HeartPulse className="h-3 w-3 text-teal-600 shrink-0" />
                              <span className="text-muted-foreground truncate">
                                Posyandu:{" "}
                                <strong className="text-foreground">{posBadge.nama}</strong>{" "}
                                <span
                                  className={cn(
                                    "text-[10px] font-bold",
                                    posBadge.isMapped ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                                  )}
                                >
                                  ({posBadge.isMapped ? "Terpetakan" : "Belum Dipetakan"})
                                </span>
                              </span>
                            </div>

                            {child.status_approval === "approved" ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                                <Check className="h-3 w-3" /> Terverifikasi
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground shrink-0">
                                <Clock className="h-3 w-3" /> Menunggu
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tombol Muat Lebih Banyak */}
                  {visibleCount < filteredDataAnak.length && (
                    <div className="pt-3 text-center">
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

                      return (
                        <div
                          key={ats.id || `ats-${idx}`}
                          className="rounded-xl border border-border bg-card p-3.5 sm:p-4 shadow-2xs space-y-3 hover:border-secondary/40 transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            {/* Baris Atas: Nama Anak & Jenjang Asal */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h5 className="text-xs sm:text-sm font-bold text-foreground truncate">
                                    {ats.nama_lengkap}
                                  </h5>
                                  <span
                                    className={cn(
                                      "px-1.5 py-0.2 rounded-md text-[10px] font-bold font-mono",
                                      ats.jenis_kelamin === "L"
                                        ? "bg-blue-500/15 text-blue-700 dark:text-blue-300"
                                        : "bg-pink-500/15 text-pink-700 dark:text-pink-300"
                                    )}
                                  >
                                    {ats.jenis_kelamin === "L" ? "Laki-laki" : "Perempuan"}
                                  </span>
                                </div>
                                <p className="text-2xs text-muted-foreground">
                                  Lahir: {ats.tanggal_lahir || "-"}
                                </p>
                              </div>

                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-secondary/15 text-secondary border border-secondary/30 shrink-0">
                                <span>{ats.jenjang_asal || "Putus Sekolah"}</span>
                              </span>
                            </div>

                            {/* Alasan Tidak Sekolah & Keinginan Kembali Sekolah */}
                            <div className="rounded-lg bg-muted/40 p-2.5 text-2xs space-y-1 border border-border/50">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                                  Alasan Tidak Sekolah:
                                </span>
                                <span className="text-[10px] font-extrabold text-secondary">
                                  Keinginan: {ats.keinginan_sekolah || "Ada"}
                                </span>
                              </div>
                              <p className="text-foreground font-semibold">
                                {ats.alasan_tidak_sekolah || "Keterbatasan Biaya / Kondisi Keluarga"}
                              </p>
                            </div>

                            {/* Alamat */}
                            <div className="text-2xs text-muted-foreground space-y-0.5">
                              <div className="flex items-center gap-1 text-foreground font-medium">
                                <MapPin className="h-3 w-3 text-secondary shrink-0" />
                                <span className="truncate">
                                  {ats.alamat || `Kelurahan ${ats.kelurahan || "-"}, RW ${ats.rw || "-"}, RT ${ats.rt || "-"}`}
                                </span>
                              </div>
                              {ats.nama_orangtua && (
                                <div className="text-[11px] text-muted-foreground pl-4">
                                  Orang Tua: <span className="text-foreground font-medium">{ats.nama_orangtua}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Posyandu Penanggung Jawab */}
                          <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2 text-2xs">
                            <div className="flex items-center gap-1.5 min-w-0 flex-1">
                              <HeartPulse className="h-3 w-3 text-teal-600 shrink-0" />
                              <span className="text-muted-foreground truncate">
                                Wilayah:{" "}
                                <strong className="text-foreground">{posBadge.nama}</strong>{" "}
                                <span
                                  className={cn(
                                    "text-[10px] font-bold",
                                    posBadge.isMapped ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                                  )}
                                >
                                  ({posBadge.isMapped ? "Terpetakan" : "Belum Dipetakan"})
                                </span>
                              </span>
                            </div>

                            {ats.status_approval === "approved" ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
                                <Check className="h-3 w-3" /> Valid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground shrink-0">
                                <Clock className="h-3 w-3" /> Menunggu
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tombol Muat Lebih Banyak ATS */}
                  {visibleCount < filteredDataAts.length && (
                    <div className="pt-3 text-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 30)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground shadow-2xs transition-all cursor-pointer"
                      >
                        <span>Muat 30 Kasus ATS Lebih Banyak</span>
                        <span className="text-muted-foreground">
                          ({paginatedAts.length} dari {filteredDataAts.length})
                        </span>
                      </button>
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

