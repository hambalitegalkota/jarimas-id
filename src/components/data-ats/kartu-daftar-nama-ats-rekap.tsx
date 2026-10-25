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
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getDaftarNamaAtsRekapAction,
  type DaftarNamaAtsItem,
} from "@/app/actions/rekap-data-ats";
import { normalizeKeinginanSekolah } from "@/lib/ats-helpers";
import { ModalKembaliBersekolah } from "./modal-kembali-bersekolah";
import { ModalEditAts } from "./modal-edit-ats";
import type { DataAtsItem } from "@/types/database";

function itemToDataAts(item: DaftarNamaAtsItem): DataAtsItem {
  return {
    id: item.id,
    komunitas_id: item.komunitasId,
    nama_lengkap: item.namaLengkap,
    jenis_kelamin: item.jenisKelamin,
    usia: String(item.usia),
    tanggal_lahir: item.tanggalLahir || "",
    nama_orangtua: item.namaOrangtua,
    tinggal_bersama: item.tinggalBersama,
    nomor_hp: item.nomorHp && item.nomorHp !== "-" ? item.nomorHp : "",
    alamat: item.alamat,
    rt: item.rt,
    rw: item.rw,
    kelurahan: item.kelurahan,
    kecamatan: item.kecamatan,
    keinginan_sekolah: item.keinginanSekolah === "Tidak Ada" ? "Tidak Ada" : "Masih Ada",
    alasan_tidak_sekolah: item.alasanTidakSekolah,
    sekolah_sebelumnya: item.sekolahSebelumnya !== "-" ? item.sekolahSebelumnya : undefined,
    kelas_terakhir: item.kelasTerakhir !== "-" ? item.kelasTerakhir : undefined,
    keterangan: item.keterangan || undefined,
    status_approval: "approved",
    created_at: new Date().toISOString(),
  };
}

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

  // Modal States
  const [selectedForBersekolah, setSelectedForBersekolah] = useState<DataAtsItem | null>(null);
  const [selectedForEdit, setSelectedForEdit] = useState<DataAtsItem | null>(null);

  const handleOpenBersekolah = (item: DaftarNamaAtsItem) => {
    setSelectedForBersekolah(itemToDataAts(item));
  };

  const handleOpenEdit = (item: DaftarNamaAtsItem) => {
    setSelectedForEdit(itemToDataAts(item));
  };

  const handleBersekolahSuccess = (atsId: string, namaSekolah: string) => {
    setDataList((prev) => prev.filter((item) => item.id !== atsId));
    setSelectedForBersekolah(null);
  };

  const handleEditSuccess = (updatedItem: DataAtsItem) => {
    setDataList((prev) =>
      prev.map((item) =>
        item.id === updatedItem.id
          ? {
              ...item,
              namaLengkap: updatedItem.nama_lengkap,
              namaOrangtua: updatedItem.nama_orangtua,
              alasanTidakSekolah: updatedItem.alasan_tidak_sekolah,
              alamat: updatedItem.alamat || "",
              kelurahan: updatedItem.kelurahan || "",
              kecamatan: updatedItem.kecamatan || "",
            }
          : item
      )
    );
    setSelectedForEdit(null);
  };

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
      className={cn(
        "rounded-lg border border-primary/30 bg-primary/5 transition-all duration-200 overflow-hidden shadow-sm break-inside-avoid print:break-inside-avoid print:border-none print:shadow-none print:bg-white print:p-0 print:m-0 print:w-full print:rounded-none print-daftar-nama-container",
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
      <div className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 text-amber-900 dark:text-amber-200 border border-secondary/30">
                <ShieldCheck className="h-3 w-3 text-secondary" />
                <span>Khusus Admin Komunitas (Warga Kita, PAUD, Posyandu, PKBM/SKB) &amp; Super Admin</span>
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
                Wilayah: {currentWilayahNama}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Daftar Rincian Anak Tidak Sekolah (ATS)
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Sesuai ketentuan perlindungan privasi data, rincian identitas lengkap anak tidak sekolah hanya dapat diakses di Tingkat KELURAHAN oleh Admin di Komunitas Warga Kita, Admin PAUD, Admin Posyandu dan Admin PKBM dan SKB.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-xs bg-primary hover:bg-primary-hover text-primary-foreground cursor-pointer active:scale-98"
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
        <div className="border-t border-border bg-card p-3.5 sm:p-4.5 space-y-3.5 animate-in fade-in slide-in-from-top-2 duration-200 print:border-none print:p-0 print:space-y-2 print:bg-white">
          {/* Controls: Search, Filters & Print */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 print:hidden">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama anak, orang tua, sekolah asal, alasan ATS, atau alamat..."
                className="w-full h-9.5 rounded-lg border border-border bg-background pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
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
                className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-hidden"
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
                className="h-9 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-hidden"
              >
                <option value="semua">Semua Status Keinginan</option>
                <option value="ingin">Siap Sekolah (Masih Ada)</option>
                <option value="tidak">Tidak Ingin / Belum Siap</option>
              </select>

              {/* Gender Filter */}
              <div className="flex items-center rounded-lg border border-border bg-background p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setGenderFilter("semua")}
                  className={cn(
                    "px-2 py-1 rounded-md font-bold transition-all cursor-pointer text-2xs",
                    genderFilter === "semua"
                      ? "bg-muted text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter("L")}
                  className={cn(
                    "px-2 py-1 rounded-md font-bold transition-all cursor-pointer text-2xs",
                    genderFilter === "L"
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  L
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter("P")}
                  className={cn(
                    "px-2 py-1 rounded-md font-bold transition-all cursor-pointer text-2xs",
                    genderFilter === "P"
                      ? "bg-rose-600 text-white shadow-2xs"
                      : "text-muted-foreground hover:text-rose-600"
                  )}
                >
                  P
                </button>
              </div>

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex h-9 items-center gap-1.5 px-3 rounded-lg border border-border bg-background text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
                title="Cetak / Simpan PDF"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>

          {/* Status / Feedback / Loading */}
          {isPending && (
            <div className="py-12 text-center space-y-2">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-xs font-medium text-muted-foreground">
                Memuat data daftar anak tidak sekolah di wilayah {currentWilayahNama}...
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-medium">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!isPending && !errorMsg && filteredData.length === 0 && (
            <div className="py-12 text-center rounded-lg border border-dashed border-border space-y-2">
              <Users className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <p className="text-sm font-bold text-foreground">
                Tidak ada data ATS yang sesuai dengan filter
              </p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
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
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground bg-muted/40 px-3.5 py-2 rounded-lg border border-border print:bg-slate-100 print:border-slate-400 print:text-black print:px-3 print:py-1.5 print:my-1.5">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary print:hidden" />
                  <span>
                    Menampilkan <strong>{filteredData.length}</strong> dari total <strong>{dataList.length}</strong> anak ATS di wilayah {currentWilayahNama}
                  </span>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono print:text-slate-700">
                  {userPeran ? `Peran: ${userPeran}` : "Hak Akses Admin Aktif"}
                </span>
              </div>

              {/* Desktop Table (Layar penuh di monitor dan selalu tampil saat print) */}
              <div className="hidden lg:block print:block overflow-hidden print:overflow-visible rounded-lg border border-border print:border-slate-300 print:rounded-none w-full">
                <table className="w-full text-left text-xs border-collapse table-fixed print:text-[9px]">
                  <thead>
                    <tr className="bg-muted/70 text-foreground font-bold border-b border-border print:bg-slate-200 print:text-black print:border-slate-400">
                      <th className="py-2.5 px-2 w-[4%] text-center font-bold print:py-1.5">No</th>
                      <th className="py-2.5 px-2 w-[19%] font-bold print:py-1.5">Nama Lengkap &amp; Usia</th>
                      <th className="py-2.5 px-2 w-[13%] font-bold print:py-1.5">Kategori &amp; Keinginan</th>
                      <th className="py-2.5 px-2 w-[15%] font-bold print:py-1.5">Sekolah Asal &amp; Alasan</th>
                      <th className="py-2.5 px-2 w-[14%] font-bold print:py-1.5">Orang Tua / Wali &amp; Kontak</th>
                      <th className="py-2.5 px-2 w-[13%] font-bold print:py-1.5">Alamat Domisili</th>
                      <th className="py-2.5 px-2 w-[10%] font-bold print:py-1.5">Komunitas</th>
                      <th className="py-2.5 px-2 w-[12%] font-bold print:hidden text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 print:divide-slate-200">
                    {filteredData.map((item, idx) => {
                      const isL = item.jenisKelamin === "L";
                      const isIngin = normalizeKeinginanSekolah(item.keinginanSekolah) === "Masih Ada";

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-muted/30 transition-colors print:break-inside-avoid print:bg-white"
                        >
                          <td className="py-2.5 px-2 text-center font-mono text-muted-foreground print:text-black print:py-1 align-top text-xs">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-2.5 align-top break-words print:py-1">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="font-bold text-foreground text-xs sm:text-sm print:text-black leading-tight">
                                  {item.namaLengkap}
                                </span>
                                <span
                                  className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 print:border print:border-slate-400 print:text-[8.5px]",
                                    isL
                                      ? "bg-primary/10 text-primary border border-primary/20 print:bg-white print:text-teal-800"
                                      : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300 print:bg-white print:text-rose-800"
                                  )}
                                >
                                  {isL ? "Laki-laki" : "Perempuan"}
                                </span>
                              </div>
                              <div className="text-[11px] text-muted-foreground print:text-slate-600 flex flex-wrap items-center gap-1 leading-tight">
                                <span className="font-semibold text-foreground print:text-black">
                                  Usia {item.usia} Tahun
                                </span>
                                {item.tanggalLahir && (
                                  <span className="text-muted-foreground/60 print:text-slate-500">
                                    • Lahir: {item.tanggalLahir}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Kategori & Keinginan */}
                          <td className="py-2.5 px-2 align-top break-words print:py-1">
                            <div className="space-y-1">
                              <span
                                className={cn(
                                  "inline-block px-1.5 py-0.5 rounded text-[10px] font-bold print:border print:border-slate-400 print:bg-white print:text-black",
                                  item.kategoriAts.includes("DO") || item.kategoriAts.includes("Putus")
                                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40"
                                    : item.kategoriAts.includes("LTM") || item.kategoriAts.includes("Lulus")
                                    ? "bg-secondary/15 text-amber-900 dark:text-amber-200 border border-secondary/30"
                                    : "bg-primary/10 text-primary border border-primary/20"
                                )}
                              >
                                {item.kategoriAts}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] print:text-black">
                                <span
                                  className={cn(
                                    "h-2 w-2 rounded-full shrink-0 print:hidden",
                                    isIngin ? "bg-primary" : "bg-muted-foreground/40"
                                  )}
                                />
                                <span className="font-semibold text-foreground print:text-black leading-tight">
                                  {isIngin ? "Ingin Sekolah" : "Tidak Ingin"}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Sekolah Asal & Alasan */}
                          <td className="py-2.5 px-2 align-top break-words print:py-1">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-foreground print:text-black flex items-start gap-1 leading-tight break-words">
                                <School className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5 print:hidden" />
                                <span>{item.sekolahSebelumnya}</span>
                                {item.kelasTerakhir && item.kelasTerakhir !== "-" && (
                                  <span className="text-[10px] text-muted-foreground print:text-slate-600 font-mono">
                                    ({item.kelasTerakhir})
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground print:text-slate-700 leading-tight break-words">
                                {item.alasanTidakSekolah}
                              </p>
                              {item.keterangan && (
                                <p className="text-[10px] text-muted-foreground/70 print:text-slate-500 italic break-words">
                                  &quot;{item.keterangan}&quot;
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Orang Tua */}
                          <td className="py-2.5 px-2 align-top break-words print:py-1">
                            <div className="space-y-0.5">
                              <div className="font-semibold text-foreground print:text-black leading-tight break-words">
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
                              <div className="text-[10px] text-muted-foreground print:text-slate-500">
                                Tinggal: {item.tinggalBersama}
                              </div>
                            </div>
                          </td>

                          {/* Alamat Domisili */}
                          <td className="py-2.5 px-2 align-top break-words print:py-1">
                            <div className="space-y-0.5 text-[11px] text-muted-foreground print:text-black leading-tight">
                              <div className="font-medium text-foreground print:text-black break-words">
                                {item.alamat || "Alamat belum tercatat lengkap"}
                              </div>
                              <div className="text-muted-foreground print:text-slate-600 font-mono text-[10px]">
                                {item.rt === "Belum Tahu" && item.rw === "Belum Tahu"
                                  ? "RT/RW Belum Tahu"
                                  : item.rw === "Belum Tahu"
                                  ? `RT ${item.rt} (RW Belum Tahu)`
                                  : item.rt === "Belum Tahu"
                                  ? `RW ${item.rw} (RT Belum Tahu)`
                                  : `RT ${item.rt || "-"} / RW ${item.rw || "-"}`} • Kel. {item.kelurahan}
                              </div>
                              <div className="text-muted-foreground/60 print:text-slate-500 text-[10px]">
                                Kec. {item.kecamatan}
                              </div>
                            </div>
                          </td>

                          {/* Komunitas */}
                          <td className="py-2.5 px-2 align-top break-words print:py-1">
                            <div className="space-y-1">
                              <span className="font-medium text-foreground print:text-black text-[11px] leading-tight break-words block">
                                {item.komunitasNama}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 print:bg-white print:border print:border-black print:text-black">
                                <CheckCircle2 className="h-3 w-3 shrink-0 print:hidden text-primary" />
                                <span>Terdata ATS</span>
                              </span>
                            </div>
                          </td>

                          {/* Aksi Intervensi: Bersekolah & Edit */}
                          <td className="py-2.5 px-2 align-top print:hidden">
                            <div className="flex flex-col gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenBersekolah(item)}
                                className="inline-flex items-center justify-center gap-1 px-2 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white text-[11px] font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
                                title="Catat Kembali Bersekolah ke PKBM / SKB"
                              >
                                <GraduationCap className="h-3 w-3 shrink-0" />
                                <span>BERSEKOLAH</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded-md border border-border bg-muted hover:bg-muted/80 text-foreground text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                                title="Edit Data ATS"
                              >
                                <Pencil className="h-3 w-3 shrink-0 text-muted-foreground" />
                                <span>EDIT</span>
                              </button>
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
                  <DaftarNamaAtsMobileCardItem
                    key={item.id}
                    item={item}
                    idx={idx}
                    onBersekolah={handleOpenBersekolah}
                    onEdit={handleOpenEdit}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal Kembali Bersekolah */}
      {selectedForBersekolah && (
        <ModalKembaliBersekolah
          isOpen={Boolean(selectedForBersekolah)}
          ats={selectedForBersekolah}
          komunitasId={selectedForBersekolah.komunitas_id}
          onClose={() => setSelectedForBersekolah(null)}
          onSuccess={handleBersekolahSuccess}
        />
      )}

      {/* Modal Edit ATS */}
      {selectedForEdit && (
        <ModalEditAts
          isOpen={Boolean(selectedForEdit)}
          ats={selectedForEdit}
          komunitasId={selectedForEdit.komunitas_id}
          onClose={() => setSelectedForEdit(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

function DaftarNamaAtsMobileCardItem({
  item,
  idx,
  onBersekolah,
  onEdit,
}: {
  item: DaftarNamaAtsItem;
  idx: number;
  onBersekolah: (item: DaftarNamaAtsItem) => void;
  onEdit: (item: DaftarNamaAtsItem) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isL = item.jenisKelamin === "L";
  const isIngin = normalizeKeinginanSekolah(item.keinginanSekolah) === "Masih Ada";

  return (
    <div className="p-3.5 rounded-lg border border-border bg-card space-y-3 shadow-2xs transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-xs",
              isL ? "bg-primary text-primary-foreground" : "bg-rose-600 text-white"
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
            className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-muted text-foreground text-[11px] font-bold hover:bg-muted/80 transition-colors cursor-pointer"
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
          {/* Info Status / Kategori ATS */}
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/70 space-y-1.5">
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold",
                  item.kategoriAts.includes("DO") || item.kategoriAts.includes("Putus")
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40"
                    : item.kategoriAts.includes("LTM") || item.kategoriAts.includes("Lulus")
                    ? "bg-secondary/15 text-amber-900 dark:text-amber-200 border border-secondary/30"
                    : "bg-primary/10 text-primary border border-primary/20"
                )}
              >
                {item.kategoriAts}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold",
                  isIngin ? "text-primary font-bold" : "text-muted-foreground"
                )}
              >
                {isIngin ? "✓ Ingin Sekolah" : "✗ Belum Ingin"}
              </span>
            </div>
            <div className="text-xs font-medium text-foreground">
              <strong>Faktor:</strong> {item.alasanTidakSekolah}
            </div>
            {item.sekolahSebelumnya && item.sekolahSebelumnya !== "-" && (
              <div className="text-[11px] text-muted-foreground">
                Sekolah Asal: {item.sekolahSebelumnya} ({item.kelasTerakhir})
              </div>
            )}
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
                  className="font-mono text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  {item.nomorHp}
                </a>
              </div>
            )}
            <div className="flex items-start justify-between gap-2 pt-1 border-t border-border/60">
              <span className="text-muted-foreground shrink-0">Alamat:</span>
              <span className="text-right text-[11px] text-foreground line-clamp-2">
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

      {/* Tombol Aksi Bersekolah & Edit Data (Selalu Tampil di Kartu) */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
        <button
          type="button"
          onClick={() => onBersekolah(item)}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary hover:bg-primary-hover active:scale-98 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
          title="Catat Kembali Bersekolah ke PKBM / SKB"
        >
          <GraduationCap className="h-3.5 w-3.5 shrink-0" />
          <span>BERSEKOLAH</span>
        </button>
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border bg-muted hover:bg-muted/80 active:scale-98 text-foreground text-xs font-bold transition-all cursor-pointer"
          title="Edit Data ATS"
        >
          <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span>EDIT</span>
        </button>
      </div>
    </div>
  );
}
