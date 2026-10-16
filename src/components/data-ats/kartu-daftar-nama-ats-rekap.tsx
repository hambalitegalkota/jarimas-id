"use client";

import React, { useState, useEffect, useTransition, useMemo, useRef } from "react";
import {
  GraduationCap,
  Users,
  Search,
  Printer,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Building2,
  Phone,
  Home,
  School,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  MapPin,
  Filter,
  Eye,
  X,
  Compass,
  BookOpen,
  ArrowRight,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDaftarNamaAtsRekapAction,
  type DaftarNamaAtsItem,
} from "@/app/actions/rekap-data-ats";
import { normalizeKeinginanSekolah } from "@/lib/ats-helpers";

interface KartuDaftarNamaAtsRekapProps {
  tingkat: "kota" | "kecamatan" | "kelurahan";
  selectedKecamatan: string;
  selectedKelurahan: string;
  currentWilayahNama: string;
  totalAts: number;
  canAccess: boolean;
  userPeran?: string;
}

export function KartuDaftarNamaAtsRekap({
  tingkat,
  selectedKecamatan,
  selectedKelurahan,
  currentWilayahNama,
  totalAts,
  canAccess,
  userPeran,
}: KartuDaftarNamaAtsRekapProps) {
  // Hanya tampil untuk Admin Komunitas dan Super Admin
  if (!canAccess) {
    return null;
  }

  const cardRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dataList, setDataList] = useState<DaftarNamaAtsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [kategoriFilter, setKategoriFilter] = useState<"semua" | "do" | "ltm" | "bpb" | "bps">("semua");
  const [keinginanFilter, setKeinginanFilter] = useState<"semua" | "ingin" | "tidak">("semua");
  const [genderFilter, setGenderFilter] = useState<"semua" | "L" | "P">("semua");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch data ketika kartu dibuka atau filter wilayah berubah
  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg(null);
    startTransition(async () => {
      const res = await getDaftarNamaAtsRekapAction({
        tingkat,
        kecamatan: tingkat !== "kota" ? selectedKecamatan : undefined,
        kelurahan: tingkat === "kelurahan" ? selectedKelurahan : undefined,
      });

      if (res.success) {
        setDataList(res.data);
      } else {
        setErrorMsg(res.message || "Gagal memuat daftar anak tidak sekolah.");
      }
    });
  }, [isOpen, tingkat, selectedKecamatan, selectedKelurahan]);

  // Client-side instant filtering
  const filteredData = useMemo(() => {
    return dataList.filter((item) => {
      // Filter Kategori
      if (kategoriFilter === "do" && !item.kategoriAts.includes("DO") && !item.kategoriAts.includes("Putus")) {
        return false;
      }
      if (kategoriFilter === "ltm" && !item.kategoriAts.includes("LTM") && !item.kategoriAts.includes("Lulus")) {
        return false;
      }
      if (
        (kategoriFilter === "bpb" || kategoriFilter === "bps") &&
        !item.kategoriAts.includes("BPB") &&
        !item.kategoriAts.includes("BPS") &&
        !item.kategoriAts.includes("Belum")
      ) {
        return false;
      }

      // Filter Keinginan Sekolah
      const isIngin = normalizeKeinginanSekolah(item.keinginanSekolah) === "Masih Ada";
      if (keinginanFilter === "ingin" && !isIngin) {
        return false;
      }
      if (keinginanFilter === "tidak" && isIngin) {
        return false;
      }

      // Filter Gender
      if (genderFilter !== "semua" && item.jenisKelamin !== genderFilter) {
        return false;
      }

      // Filter Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.namaLengkap.toLowerCase().includes(q);
        const matchParent = item.namaOrangtua.toLowerCase().includes(q);
        const matchSchool = (item.sekolahSebelumnya || "").toLowerCase().includes(q);
        const matchReason = (item.alasanTidakSekolah || "").toLowerCase().includes(q);
        const matchKet = (item.keterangan || "").toLowerCase().includes(q);
        const matchAddr = `${item.alamat} ${item.kelurahan} ${item.kecamatan}`.toLowerCase().includes(q);
        const matchKom = item.komunitasNama.toLowerCase().includes(q);

        return matchName || matchParent || matchSchool || matchReason || matchKet || matchAddr || matchKom;
      }

      return true;
    });
  }, [dataList, kategoriFilter, keinginanFilter, genderFilter, searchQuery]);

  useEffect(() => {
    const handleAfterPrint = () => {
      cardRef.current?.classList.remove("print-target-active");
      document.body.classList.remove("print-daftar-nama-only");
    };
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
      cardRef.current?.classList.remove("print-target-active");
      document.body.classList.remove("print-daftar-nama-only");
    };
  }, []);

  const handlePrint = () => {
    cardRef.current?.classList.add("print-target-active");
    document.body.classList.add("print-daftar-nama-only");
    window.print();
    setTimeout(() => {
      cardRef.current?.classList.remove("print-target-active");
      document.body.classList.remove("print-daftar-nama-only");
    }, 2000);
  };

  return (
    <div
      ref={cardRef}
      className="rounded-3xl border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/20 transition-all duration-200 overflow-hidden shadow-sm print:border-none print:shadow-none print:bg-white print:p-0 print:m-0 print:w-full print:rounded-none print-daftar-nama-container"
    >
      {/* KOP RESMI LAPORAN A4 (HANYA MUNCUL SAAT CETAK / PRINT) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-3 mb-3 text-center">
        <div className="flex items-center justify-between gap-4">
          <div className="w-12 h-12 border-2 border-slate-900 rounded-md flex flex-col items-center justify-center p-1 shrink-0">
            <span className="text-[8px] font-bold font-mono leading-none text-center">TEGAL</span>
            <span className="text-[6px] font-mono leading-none mt-0.5 text-center">BAHARI</span>
          </div>
          <div className="flex-1 text-center space-y-0.5">
            <h2 className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-700">
              PEMERINTAH KOTA TEGAL • JARINGAN INFORMASI &amp; LAYANAN MASYARAKAT (JARIMAS-ID)
            </h2>
            <h1 className="text-sm font-black uppercase tracking-tight text-slate-900">
              DAFTAR RINCIAN DATA ANAK TIDAK SEKOLAH (ATS) KOTA TEGAL
            </h1>
            <p className="text-[9.5px] font-semibold text-slate-800">
              Cakupan Wilayah: Kelurahan {currentWilayahNama} • Kecamatan {selectedKecamatan} • Kota Tegal
            </p>
            <p className="text-[8.5px] text-slate-600 font-mono">
              Dokumen Rekapitulasi Berjenjang Terverifikasi • Tanggal Akses: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="w-12 h-12 border-2 border-slate-900 rounded-md flex flex-col items-center justify-center p-1 shrink-0">
            <span className="text-[8px] font-bold font-mono leading-none text-center">JARIMAS</span>
            <span className="text-[6px] font-mono leading-none mt-0.5 text-center">RESMI</span>
          </div>
        </div>
      </div>

      {/* Header Banner Kartu */}
      <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                <span>Khusus Admin Komunitas (Warga Kita, PAUD, Posyandu, PKBM dan SKB) &amp; Super Admin</span>
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-900/60 dark:text-indigo-300 dark:border-indigo-700">
                Wilayah: {currentWilayahNama}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Daftar Rincian Anak Tidak Sekolah (ATS)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Sesuai ketentuan perlindungan privasi data, rincian identitas lengkap anak tidak sekolah hanya dapat diakses di Tingkat KELURAHAN oleh Admin di Komunitas Warga Kita, Admin PAUD, Admin Posyandu dan Admin PKBM dan SKB.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-md bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 cursor-pointer"
          >
            {isOpen ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Tutup Daftar ATS</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Lihat Daftar ATS ({totalAts} Anak)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Konten Terbuka (Expanded Panel) */}
      {isOpen && (
        <div className="border-t-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 print:border-none print:p-0 print:space-y-2 print:bg-white">
          {/* Controls: Search, Filters & Print */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 print:hidden">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama anak, orang tua, sekolah asal, alasan ATS, atau alamat..."
                className="w-full h-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Filter Kategori ATS */}
              <select
                value={kategoriFilter}
                onChange={(e) => setKategoriFilter(e.target.value as any)}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="semua">Semua Kategori ATS</option>
                <option value="do">Putus Sekolah (DO)</option>
                <option value="ltm">Lulus Tdk Lanjut (LTM)</option>
                <option value="bpb">Belum Pernah Bersekolah (BPB)</option>
              </select>

              {/* Filter Keinginan Sekolah */}
              <select
                value={keinginanFilter}
                onChange={(e) => setKeinginanFilter(e.target.value as any)}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="semua">Semua Status Keinginan</option>
                <option value="ingin">Siap Sekolah (Masih Ada)</option>
                <option value="tidak">Tidak Ingin / Belum Siap</option>
              </select>

              {/* Gender Filter */}
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setGenderFilter("semua")}
                  className={cn(
                    "px-2 py-1 rounded-lg font-bold transition-all cursor-pointer text-2xs",
                    genderFilter === "semua"
                      ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter("L")}
                  className={cn(
                    "px-2 py-1 rounded-lg font-bold transition-all cursor-pointer text-2xs",
                    genderFilter === "L"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-blue-600"
                  )}
                >
                  L
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter("P")}
                  className={cn(
                    "px-2 py-1 rounded-lg font-bold transition-all cursor-pointer text-2xs",
                    genderFilter === "P"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-rose-600"
                  )}
                >
                  P
                </button>
              </div>

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex h-9 items-center gap-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Cetak Rekapitulasi Daftar ATS"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cetak</span>
              </button>
            </div>
          </div>

          {/* Status / Feedback / Loading */}
          {isPending && (
            <div className="py-12 text-center space-y-2">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              <p className="text-xs font-medium text-slate-500">
                Memuat data daftar anak tidak sekolah di wilayah {currentWilayahNama}...
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-3 text-red-700 dark:text-red-300 text-xs font-medium">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isPending && !errorMsg && filteredData.length === 0 && (
            <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-2">
              <Users className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Tidak ada data ATS yang sesuai dengan filter
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery
                  ? `Tidak ditemukan hasil pencarian "${searchQuery}" di wilayah ${currentWilayahNama}.`
                  : `Belum ada data anak tidak sekolah yang tercatat di wilayah ${currentWilayahNama}.`}
              </p>
            </div>
          )}

          {/* TABEL DAFTAR NAMA ATS (Desktop & Tablet) */}
          {!isPending && !errorMsg && filteredData.length > 0 && (
            <>
              {/* Counter Info Bar */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 print:bg-slate-100 print:border-slate-400 print:text-black print:px-3 print:py-1.5 print:my-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 print:hidden" />
                  <span>
                    Menampilkan <strong>{filteredData.length}</strong> dari total <strong>{dataList.length}</strong> anak ATS di wilayah {currentWilayahNama}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono print:text-slate-700">
                  {userPeran ? `Peran: ${userPeran}` : "Hak Akses Admin Aktif"}
                </span>
              </div>

              {/* Desktop Table (Layar penuh di monitor dan selalu tampil saat print) */}
              <div className="hidden lg:block print:block overflow-hidden print:overflow-visible rounded-2xl border border-slate-200 dark:border-slate-800 print:border-slate-300 print:rounded-none w-full">
                <table className="w-full text-left text-xs border-collapse table-fixed print:text-[9px]">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 print:bg-slate-200 print:text-black print:border-slate-400">
                      <th className="py-3 px-2 w-[4%] text-center font-bold print:py-2">No</th>
                      <th className="py-3 px-3 w-[21%] font-bold print:py-2">Nama Lengkap &amp; Usia</th>
                      <th className="py-3 px-3 w-[15%] font-bold print:py-2">Kategori &amp; Keinginan</th>
                      <th className="py-3 px-3 w-[17%] font-bold print:py-2">Sekolah Asal &amp; Alasan</th>
                      <th className="py-3 px-3 w-[16%] font-bold print:py-2">Orang Tua / Wali &amp; Kontak</th>
                      <th className="py-3 px-3 w-[15%] font-bold print:py-2">Alamat Domisili</th>
                      <th className="py-3 px-3 w-[12%] font-bold print:py-2">Komunitas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 print:divide-slate-200">
                    {filteredData.map((item, idx) => {
                      const isL = item.jenisKelamin === "L";
                      const isIngin = normalizeKeinginanSekolah(item.keinginanSekolah) === "Masih Ada";

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors print:break-inside-avoid print:bg-white"
                        >
                          <td className="py-3 px-2 text-center font-mono text-slate-500 print:text-black print:py-1.5 align-top">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3 align-top break-words print:py-1.5">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm print:text-black leading-tight">
                                  {item.namaLengkap}
                                </span>
                                <span
                                  className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 print:border print:border-slate-400 print:text-[8.5px]",
                                    isL
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 print:bg-white print:text-blue-800"
                                      : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 print:bg-white print:text-rose-800"
                                  )}
                                >
                                  {isL ? "Laki-laki" : "Perempuan"}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 print:text-slate-600 flex flex-wrap items-center gap-1 leading-tight">
                                <span className="font-semibold text-slate-700 dark:text-slate-300 print:text-black">
                                  Usia {item.usia} Tahun
                                </span>
                                {item.tanggalLahir && (
                                  <span className="text-slate-400 print:text-slate-500">
                                    • Lahir: {item.tanggalLahir}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Kategori & Keinginan */}
                          <td className="py-3 px-3 align-top break-words print:py-1.5">
                            <div className="space-y-1">
                              <span
                                className={cn(
                                  "inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold print:border print:border-slate-400 print:bg-white print:text-black",
                                  item.kategoriAts.includes("DO") || item.kategoriAts.includes("Putus")
                                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                    : item.kategoriAts.includes("LTM") || item.kategoriAts.includes("Lulus")
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                                )}
                              >
                                {item.kategoriAts}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] print:text-black">
                                <span
                                  className={cn(
                                    "h-2 w-2 rounded-full shrink-0 print:hidden",
                                    isIngin ? "bg-emerald-500" : "bg-slate-400"
                                  )}
                                />
                                <span className="font-semibold text-slate-700 dark:text-slate-300 print:text-black leading-tight">
                                  {isIngin ? "Ingin Sekolah" : "Tidak Ingin"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Sekolah Asal & Alasan */}
                          <td className="py-3 px-3 align-top break-words print:py-1.5">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-800 dark:text-slate-200 print:text-black flex items-start gap-1 leading-tight break-words">
                                <School className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5 print:hidden" />
                                <span>{item.sekolahSebelumnya}</span>
                                {item.kelasTerakhir && item.kelasTerakhir !== "-" && (
                                  <span className="text-[10px] text-slate-500 print:text-slate-600 font-mono">
                                    ({item.kelasTerakhir})
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 print:text-slate-700 leading-tight break-words">
                                {item.alasanTidakSekolah}
                              </p>
                              {item.keterangan && (
                                <p className="text-[10px] text-slate-400 print:text-slate-500 italic break-words">
                                  &quot;{item.keterangan}&quot;
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Orang Tua */}
                          <td className="py-3 px-3 align-top break-words print:py-1.5">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-800 dark:text-slate-200 print:text-black leading-tight break-words">
                                {item.namaOrangtua}
                              </div>
                              {item.nomorHp && item.nomorHp !== "-" && (
                                <div>
                                  <a
                                    href={`https://wa.me/${item.nomorHp.replace(/\D/g, "").replace(/^0/, "62")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 hover:underline print:text-black print:no-underline"
                                  >
                                    <Phone className="h-3 w-3 shrink-0 print:hidden" />
                                    <span>{item.nomorHp}</span>
                                  </a>
                                </div>
                              )}
                              <div className="text-[10px] text-slate-400 print:text-slate-500">
                                Tinggal: {item.tinggalBersama}
                              </div>
                            </div>
                          </td>

                          {/* Alamat Domisili */}
                          <td className="py-3 px-3 align-top break-words print:py-1.5">
                            <div className="space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300 print:text-black leading-tight">
                              <div className="font-medium text-slate-800 dark:text-slate-200 print:text-black break-words">
                                {item.alamat || "Alamat belum tercatat lengkap"}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 print:text-slate-600 font-mono text-[10px]">
                                {item.rt === "Belum Tahu" && item.rw === "Belum Tahu"
                                  ? "RT/RW Belum Tahu"
                                  : item.rw === "Belum Tahu"
                                  ? `RT ${item.rt} (RW Belum Tahu)`
                                  : item.rt === "Belum Tahu"
                                  ? `RW ${item.rw} (RT Belum Tahu)`
                                  : `RT ${item.rt || "-"} / RW ${item.rw || "-"}`} • Kel. {item.kelurahan}
                              </div>
                              <div className="text-slate-400 print:text-slate-500 text-[10px]">
                                Kec. {item.kecamatan}
                              </div>
                            </div>
                          </td>

                          {/* Komunitas */}
                          <td className="py-3 px-3 align-top break-words print:py-1.5">
                            <div className="space-y-1">
                              <span className="font-medium text-slate-700 dark:text-slate-300 print:text-black text-[11px] leading-tight break-words block">
                                {item.komunitasNama}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 print:bg-white print:border print:border-black print:text-black">
                                <CheckCircle2 className="h-3 w-3 shrink-0 print:hidden" />
                                <span>Terdata ATS</span>
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Kolom Tanda Tangan Resmi (Hanya Muncul saat Cetak / Print) */}
              <div className="hidden print:grid grid-cols-2 text-center text-[10px] font-sans break-inside-avoid mt-8 pt-4 border-t border-slate-400">
                <div className="space-y-12">
                  <p className="text-slate-700">
                    Mengetahui,<br />Pengurus / Petugas Komunitas Wilayah
                  </p>
                  <p className="font-bold underline text-slate-900">
                    ( .................................................... )
                  </p>
                </div>
                <div className="space-y-12">
                  <p className="text-slate-700">
                    Kota Tegal, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}<br />
                    Admin Pendataan Wilayah {currentWilayahNama}
                  </p>
                  <p className="font-bold underline text-slate-900">
                    ( {userPeran ? userPeran : "Petugas Administrator"} )
                  </p>
                </div>
              </div>

              {/* Mobile Card List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden print:hidden gap-3">
                {filteredData.map((item, idx) => (
                  <DaftarNamaAtsMobileCardItem key={item.id} item={item} idx={idx} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DaftarNamaAtsMobileCardItem({
  item,
  idx,
}: {
  item: DaftarNamaAtsItem;
  idx: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isL = item.jenisKelamin === "L";
  const isIngin = normalizeKeinginanSekolah(item.keinginanSekolah) === "Masih Ada";

  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3 shadow-xs transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-white text-xs",
              isL ? "bg-blue-600" : "bg-rose-600"
            )}
          >
            {item.namaLengkap.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm line-clamp-1">
              {item.namaLengkap}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Usia {item.usia} Thn
              </span>
              <span>•</span>
              <span>{isL ? "Laki-laki" : "Perempuan"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-mono font-bold text-slate-400">
            #{idx + 1}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            title={isExpanded ? "Sembunyikan Detail" : "Tampilkan Detail"}
          >
            <span>{isExpanded ? "Tutup" : "Detail"}</span>
            {isExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Detail Konten (Disembunyikan secara default) */}
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 animate-in fade-in duration-150">
          {/* Info Status / Kategori ATS */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-extrabold",
                  item.kategoriAts.includes("DO") || item.kategoriAts.includes("Putus")
                    ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                    : item.kategoriAts.includes("LTM") || item.kategoriAts.includes("Lulus")
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                )}
              >
                {item.kategoriAts}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold",
                  isIngin ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"
                )}
              >
                {isIngin ? "✓ Ingin Sekolah" : "✗ Belum Ingin"}
              </span>
            </div>
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
              <strong>Faktor:</strong> {item.alasanTidakSekolah}
            </div>
            {item.sekolahSebelumnya && item.sekolahSebelumnya !== "-" && (
              <div className="text-[11px] text-slate-500">
                Sekolah Asal: {item.sekolahSebelumnya} ({item.kelasTerakhir})
              </div>
            )}
          </div>

          {/* Info Orang Tua & Domisili */}
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Orang Tua / Wali:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {item.namaOrangtua}
              </span>
            </div>
            {item.nomorHp && item.nomorHp !== "-" && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">WhatsApp:</span>
                <a
                  href={`https://wa.me/${item.nomorHp.replace(/\D/g, "").replace(/^0/, "62")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  {item.nomorHp}
                </a>
              </div>
            )}
            <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800">
              <span className="text-slate-500 shrink-0">Alamat:</span>
              <span className="text-right text-[11px] text-slate-700 dark:text-slate-300 line-clamp-2">
                {item.alamat ? `${item.alamat}, ` : ""}
                {item.rt === "Belum Tahu" && item.rw === "Belum Tahu"
                  ? "RT/RW Belum Tahu"
                  : item.rw === "Belum Tahu"
                  ? `RT ${item.rt} (RW Belum Tahu)`
                  : item.rt === "Belum Tahu"
                  ? `RW ${item.rw} (RT Belum Tahu)`
                  : `RT ${item.rt || "-"}/RW ${item.rw || "-"}`}, Kel. {item.kelurahan}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
