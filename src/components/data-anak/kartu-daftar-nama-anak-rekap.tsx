"use client";

import React, { useState, useEffect, useTransition, useMemo, useRef } from "react";
import {
  Users,
  GraduationCap,
  Baby,
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
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDaftarNamaAnakRekapAction,
  type DaftarNamaAnakItem,
} from "@/app/actions/rekap-data-anak";

interface KartuDaftarNamaAnakRekapProps {
  kategori: "bersekolah" | "tidak_sekolah";
  tingkat: "kota" | "kecamatan" | "kelurahan";
  selectedKecamatan: string;
  selectedKelurahan: string;
  currentWilayahNama: string;
  totalCount: number;
  canAccess: boolean;
  userPeran?: string;
}

export function KartuDaftarNamaAnakRekap({
  kategori,
  tingkat,
  selectedKecamatan,
  selectedKelurahan,
  currentWilayahNama,
  totalCount,
  canAccess,
  userPeran,
}: KartuDaftarNamaAnakRekapProps) {
  // Hanya tampil untuk Admin Komunitas dan Super Admin
  if (!canAccess) {
    return null;
  }

  const cardRef = useRef<HTMLDivElement>(null);
  const isBersekolah = kategori === "bersekolah";
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [dataList, setDataList] = useState<DaftarNamaAnakItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [genderFilter, setGenderFilter] = useState<"semua" | "L" | "P">("semua");
  const [ageFilter, setAgeFilter] = useState<string>("semua");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch data ketika dibuka atau filter wilayah berubah
  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg(null);
    startTransition(async () => {
      const res = await getDaftarNamaAnakRekapAction({
        tingkat,
        kecamatan: tingkat !== "kota" ? selectedKecamatan : undefined,
        kelurahan: tingkat === "kelurahan" ? selectedKelurahan : undefined,
        kategori,
      });

      if (res.success) {
        setDataList(res.data);
      } else {
        setErrorMsg(res.message || "Gagal memuat daftar nama anak.");
      }
    });
  }, [isOpen, tingkat, selectedKecamatan, selectedKelurahan, kategori]);

  // Client-side filtering untuk pencarian instan
  const filteredData = useMemo(() => {
    return dataList.filter((item) => {
      // Filter Gender
      if (genderFilter !== "semua" && item.jenisKelamin !== genderFilter) {
        return false;
      }
      // Filter Usia
      if (ageFilter !== "semua") {
        if (parseInt(ageFilter, 10) !== item.usia) {
          return false;
        }
      }
      // Filter Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.namaLengkap.toLowerCase().includes(q);
        const matchParent = item.namaOrangtua.toLowerCase().includes(q);
        const matchSchool = item.namaSekolah.toLowerCase().includes(q);
        const matchReason = item.alasan.toLowerCase().includes(q);
        const matchAddr = `${item.domisiliJalan} ${item.domisiliKelurahan} ${item.domisiliKecamatan}`
          .toLowerCase()
          .includes(q);
        const matchKom = item.komunitasNama.toLowerCase().includes(q);

        return matchName || matchParent || matchSchool || matchReason || matchAddr || matchKom;
      }
      return true;
    });
  }, [dataList, genderFilter, ageFilter, searchQuery]);

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

  const accentBorder = isBersekolah
    ? "border-primary/30"
    : "border-secondary/35";
  const accentBg = isBersekolah
    ? "bg-primary/5"
    : "bg-secondary/5";
  const accentBtn = isBersekolah
    ? "bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm"
    : "bg-secondary hover:bg-secondary-hover text-secondary-foreground shadow-sm";
  const accentText = isBersekolah
    ? "text-primary"
    : "text-secondary";
  const accentBadge = isBersekolah
    ? "bg-primary/10 text-primary border-primary/25"
    : "bg-secondary/15 text-amber-900 dark:text-amber-200 border-secondary/30";

  return (
    <div
      ref={cardRef}
      className={cn(
        "rounded-lg border transition-all duration-200 overflow-hidden shadow-sm break-inside-avoid print:break-inside-avoid",
        accentBorder,
        accentBg,
        "print:border-none print:shadow-none print:bg-white print:p-0 print:m-0 print:w-full print:rounded-none print-daftar-nama-container",
        isOpen ? "is-open" : ""
      )}
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
              {isBersekolah
                ? "DAFTAR NAMA ANAK USIA DINI BERSEKOLAH (PAUD / TK / RA / KB / SPS / TPA / SKB / PKBM)"
                : "DAFTAR NAMA ANAK USIA DINI BELUM BERSEKOLAH PAUD"}
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

      {/* Header Banner Kartu (Layar Monitor) */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white shadow-xs",
              isBersekolah ? "bg-primary" : "bg-secondary"
            )}
          >
            {isBersekolah ? (
              <GraduationCap className="h-5.5 w-5.5" />
            ) : (
              <Baby className="h-5.5 w-5.5" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-secondary/15 text-amber-900 dark:text-amber-200 border border-secondary/30">
                <ShieldCheck className="h-3.5 w-3.5 text-secondary" />
                <span>Khusus Admin Komunitas &amp; Super Admin</span>
              </span>
              <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-lg border", accentBadge)}>
                Wilayah: {currentWilayahNama}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
              {isBersekolah
                ? "Daftar Nama Anak Bersekolah PAUD"
                : "Daftar Nama Anak Belum Bersekolah PAUD"}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {isBersekolah
                ? `Akses identitas lengkap, satuan PAUD, kontak orang tua, dan alamat ${totalCount} anak bersekolah di ${currentWilayahNama}.`
                : `Akses identitas lengkap, faktor belum sekolah, kontak orang tua, dan alamat ${totalCount} anak belum bersekolah di ${currentWilayahNama}.`}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer",
              accentBtn
            )}
          >
            {isOpen ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>Tutup Daftar Nama</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Lihat Daftar Nama ({totalCount} Anak)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Konten Terbuka (Expanded Panel) */}
      {isOpen && (
        <div className="border-t border-border bg-card p-3.5 sm:p-4.5 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200 print:border-none print:p-0 print:space-y-2 print:bg-white">
          {/* Controls: Search, Filters & Print */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 print:hidden">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama anak, orang tua, sekolah, alasan, atau alamat..."
                className="w-full h-10 rounded-lg border border-border bg-background pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Gender Filter */}
              <div className="flex items-center rounded-lg border border-border bg-muted/60 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setGenderFilter("semua")}
                  className={cn(
                    "px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer",
                    genderFilter === "semua"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter("L")}
                  className={cn(
                    "px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer",
                    genderFilter === "L"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  Laki-laki
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter("P")}
                  className={cn(
                    "px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer",
                    genderFilter === "P"
                      ? "bg-rose-600 text-white shadow-2xs"
                      : "text-muted-foreground hover:text-rose-600"
                  )}
                >
                  Perempuan
                </button>
              </div>

              {/* Usia Filter */}
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-hidden"
              >
                <option value="semua">Semua Usia (0–6 Tahun)</option>
                <option value="0">0–1 Tahun</option>
                <option value="2">2 Tahun</option>
                <option value="3">3 Tahun</option>
                <option value="4">4 Tahun</option>
                <option value="5">5 Tahun</option>
                <option value="6">6 Tahun</option>
              </select>

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex h-9 items-center gap-1.5 px-3 rounded-lg border border-border bg-muted/60 text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Cetak / Simpan PDF"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>

          {/* Status / Feedback / Loading */}
          {isPending && (
            <div className="py-12 text-center space-y-2 print:hidden">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs font-medium text-muted-foreground">
                Memuat data daftar nama anak di wilayah {currentWilayahNama}...
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-600 dark:text-red-400 text-xs font-medium print:hidden">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isPending && !errorMsg && filteredData.length === 0 && (
            <div className="py-12 text-center rounded-lg border-2 border-dashed border-border space-y-2 print:hidden">
              <Users className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-bold text-foreground">
                Tidak ada data anak yang sesuai dengan filter
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {searchQuery
                  ? `Tidak ditemukan hasil pencarian "${searchQuery}" di wilayah ${currentWilayahNama}.`
                  : `Belum ada data anak ${isBersekolah ? "bersekolah" : "belum bersekolah"} yang tercatat di wilayah ${currentWilayahNama}.`}
              </p>
            </div>
          )}

          {/* TABEL DAFTAR NAMA ANAK: Layar penuh satu halaman tanpa scroll horizontal & tampil sempurna saat print */}
          {!isPending && !errorMsg && filteredData.length > 0 && (
            <>
              {/* Counter Info Bar */}
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground bg-muted/40 px-3.5 py-2 rounded-lg border border-border print:bg-slate-100 print:border-slate-400 print:text-black print:px-3 print:py-1.5 print:my-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary print:hidden" />
                  <span>
                    Menampilkan <strong>{filteredData.length}</strong> dari total <strong>{dataList.length}</strong> anak di wilayah {currentWilayahNama}
                    {genderFilter !== "semua" && ` • Jenis Kelamin: ${genderFilter === "L" ? "Laki-laki" : "Perempuan"}`}
                    {ageFilter !== "semua" && ` • Usia: ${ageFilter} Tahun`}
                    {searchQuery && ` • Filter: "${searchQuery}"`}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono print:text-slate-700">
                  {userPeran ? `Peran: ${userPeran}` : "Hak Akses Admin Aktif"}
                </span>
              </div>

              {/* Desktop Table (Layar penuh di monitor dan selalu tampil saat print) */}
              <div className="hidden lg:block print:block overflow-hidden print:overflow-visible rounded-lg border border-border print:border-slate-300 print:rounded-none w-full">
                <table className="w-full text-left text-xs border-collapse table-fixed print:text-[9.5px]">
                  <thead>
                    <tr className="bg-muted/70 text-foreground font-bold border-b border-border print:bg-slate-200 print:text-black print:border-slate-400">
                      <th className="py-2 px-1.5 w-[4%] text-center font-bold print:py-1.5">No</th>
                      <th className="py-2 px-2.5 w-[24%] font-bold print:py-1.5">Nama Lengkap &amp; Usia</th>
                      <th className="py-2 px-2 w-[20%] font-bold print:py-1.5">
                        {isBersekolah ? "Satuan PAUD / TK" : "Alasan Belum Sekolah"}
                      </th>
                      <th className="py-2 px-2 w-[18%] font-bold print:py-1.5">Orang Tua / Wali &amp; Kontak</th>
                      <th className="py-2 px-2 w-[21%] font-bold print:py-1.5">Alamat Domisili</th>
                      <th className="py-2 px-2 w-[13%] font-bold print:py-1.5">Komunitas Pencatat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 print:divide-slate-200">
                    {filteredData.map((item, idx) => {
                      const isL = item.jenisKelamin === "L";
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors print:break-inside-avoid print:bg-white"
                        >
                          <td className="py-2 px-1.5 text-center font-mono text-slate-500 print:text-black print:py-1 align-top text-xs">
                            {idx + 1}
                          </td>
                          <td className="py-2 px-2.5 align-top break-words print:py-1">
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

                          {/* Sekolah / Alasan */}
                          <td className="py-2 px-2 align-top break-words print:py-1">
                            <div className="space-y-0.5">
                              {isBersekolah ? (
                                <>
                                  <div className="font-bold text-emerald-700 dark:text-emerald-400 print:text-black flex items-start gap-1 leading-tight text-xs">
                                    <School className="h-3.5 w-3.5 shrink-0 mt-0.5 print:hidden" />
                                    <span className="break-words">{item.namaSekolah}</span>
                                  </div>
                                  {item.alasan && (
                                    <p className="text-[11px] text-slate-500 print:text-slate-600 leading-snug break-words">
                                      {item.alasan}
                                    </p>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="font-bold text-blue-700 dark:text-blue-400 print:text-black flex items-start gap-1 leading-tight text-xs">
                                    <Baby className="h-3.5 w-3.5 shrink-0 mt-0.5 print:hidden" />
                                    <span className="break-words">{item.alasan}</span>
                                  </div>
                                  <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium print:bg-white print:border print:border-slate-300 print:text-black">
                                    Belum Bersekolah Formal
                                  </span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Orang Tua */}
                          <td className="py-2 px-2 align-top break-words print:py-1">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-800 dark:text-slate-200 print:text-black leading-tight break-words text-xs">
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
                          <td className="py-2 px-2 align-top break-words print:py-1">
                            <div className="space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300 print:text-black leading-tight">
                              <div className="font-medium text-slate-800 dark:text-slate-200 print:text-black break-words">
                                {item.domisiliJalan || "Alamat belum tercatat lengkap"}
                              </div>
                              <div className="text-slate-500 dark:text-slate-400 print:text-slate-600 font-mono text-[10px]">
                                RT {item.domisiliRt || "01"} / RW {item.domisiliRw || "01"} • Kel. {item.domisiliKelurahan}
                              </div>
                              <div className="text-slate-400 print:text-slate-500 text-[10px]">
                                Kec. {item.domisiliKecamatan}
                              </div>
                            </div>
                          </td>

                          {/* Komunitas */}
                          <td className="py-2 px-2 align-top break-words print:py-1">
                            <div className="space-y-1">
                              <span className="font-medium text-slate-700 dark:text-slate-300 print:text-black text-[11px] leading-tight break-words block">
                                {item.komunitasNama}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 print:bg-white print:border print:border-black print:text-black">
                                <CheckCircle2 className="h-3 w-3 shrink-0 print:hidden" />
                                <span>Terverifikasi</span>
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
                  <DaftarNamaAnakMobileCardItem
                    key={item.id}
                    item={item}
                    idx={idx}
                    isBersekolah={isBersekolah}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function DaftarNamaAnakMobileCardItem({
  item,
  idx,
  isBersekolah,
}: {
  item: DaftarNamaAnakItem;
  idx: number;
  isBersekolah: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isL = item.jenisKelamin === "L";

  return (
    <div className="p-3 sm:p-3.5 rounded-lg border border-border bg-card space-y-3 shadow-2xs transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-white text-xs",
              isL ? "bg-primary" : "bg-rose-600"
            )}
          >
            {item.namaLengkap.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-foreground text-sm line-clamp-1">
              {item.namaLengkap}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">
                Usia {item.usia} Thn
              </span>
              <span>•</span>
              <span>{isL ? "Laki-laki" : "Perempuan"}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-mono font-bold text-muted-foreground/60">
            #{idx + 1}
          </span>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-muted/60 text-foreground text-[11px] font-bold hover:bg-muted transition-colors cursor-pointer"
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
        <div className="space-y-3 pt-2 border-t border-border/60 animate-in fade-in duration-150">
          {/* Info Status / Sekolah */}
          <div className="p-2.5 rounded-lg bg-muted/30 border border-border/70 space-y-1">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {isBersekolah ? "Satuan PAUD Binaan" : "Faktor / Alasan Belum Sekolah"}
            </div>
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              {isBersekolah ? (
                <>
                  <School className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{item.namaSekolah}</span>
                </>
              ) : (
                <>
                  <Baby className="h-3.5 w-3.5 text-secondary shrink-0" />
                  <span>{item.alasan}</span>
                </>
              )}
            </div>
          </div>

          {/* Info Orang Tua & Domisili */}
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Orang Tua / Wali:</span>
              <span className="font-semibold text-foreground">
                {item.namaOrangtua}
              </span>
            </div>
            {item.nomorHp && item.nomorHp !== "-" && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">WhatsApp:</span>
                <a
                  href={`https://wa.me/${item.nomorHp.replace(/\D/g, "").replace(/^0/, "62")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-primary font-bold hover:underline"
                >
                  {item.nomorHp}
                </a>
              </div>
            )}
            <div className="flex items-start justify-between gap-2 pt-1 border-t border-border/60">
              <span className="text-muted-foreground shrink-0">Alamat:</span>
              <span className="text-right text-[11px] text-foreground line-clamp-2">
                {item.domisiliJalan ? `${item.domisiliJalan}, ` : ""}
                RT {item.domisiliRt || "01"}/RW {item.domisiliRw || "01"}, Kel. {item.domisiliKelurahan}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
