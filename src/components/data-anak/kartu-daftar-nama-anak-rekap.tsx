"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
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

  const handlePrint = () => {
    window.print();
  };

  const accentBorder = isBersekolah
    ? "border-emerald-300 dark:border-emerald-800"
    : "border-blue-300 dark:border-blue-800";
  const accentBg = isBersekolah
    ? "bg-emerald-50/70 dark:bg-emerald-950/20"
    : "bg-blue-50/70 dark:bg-blue-950/20";
  const accentBtn = isBersekolah
    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20";
  const accentText = isBersekolah
    ? "text-emerald-800 dark:text-emerald-300"
    : "text-blue-800 dark:text-blue-300";
  const accentBadge = isBersekolah
    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700"
    : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300 dark:border-blue-700";

  return (
    <div
      className={cn(
        "rounded-3xl border-2 transition-all duration-200 overflow-hidden shadow-sm",
        accentBorder,
        accentBg
      )}
    >
      {/* Header Banner Kartu */}
      <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md",
              isBersekolah ? "bg-emerald-600" : "bg-blue-600"
            )}
          >
            {isBersekolah ? (
              <GraduationCap className="h-6 w-6" />
            ) : (
              <Baby className="h-6 w-6" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700">
                <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                <span>Khusus Admin Komunitas & Super Admin</span>
              </span>
              <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full border", accentBadge)}>
                Wilayah: {currentWilayahNama}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {isBersekolah
                ? "Daftar Nama Anak Bersekolah PAUD"
                : "Daftar Nama Anak Belum Bersekolah PAUD"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
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
              "flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer",
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
        <div className="border-t-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Controls: Search, Filters & Print */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama anak, orang tua, sekolah, alasan, atau alamat..."
                className="w-full h-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden"
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
              {/* Gender Filter */}
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setGenderFilter("semua")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
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
                    "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                    genderFilter === "L"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-blue-600"
                  )}
                >
                  Laki-laki
                </button>
                <button
                  type="button"
                  onClick={() => setGenderFilter("P")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer",
                    genderFilter === "P"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-rose-600"
                  )}
                >
                  Perempuan
                </button>
              </div>

              {/* Usia Filter */}
              <select
                value={ageFilter}
                onChange={(e) => setAgeFilter(e.target.value)}
                className="h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="semua">Semua Usia (0–6 Thn)</option>
                <option value="0">0–1 Tahun (Bayi)</option>
                <option value="2">2 Tahun (Toddler)</option>
                <option value="3">3 Tahun (KB Awal)</option>
                <option value="4">4 Tahun (KB/TK A)</option>
                <option value="5">5 Tahun (TK A/B)</option>
                <option value="6">6 Tahun (TK B/Matang)</option>
              </select>

              {/* Print Button */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex h-9 items-center gap-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Cetak Rekapitulasi Daftar Nama Anak"
              >
                <Printer className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Cetak</span>
              </button>
            </div>
          </div>

          {/* Status / Feedback / Loading */}
          {isPending && (
            <div className="py-12 text-center space-y-2">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-xs font-medium text-slate-500">
                Memuat data daftar nama anak di wilayah {currentWilayahNama}...
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
                Tidak ada data anak yang sesuai dengan filter
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery
                  ? `Tidak ditemukan hasil pencarian "${searchQuery}" di wilayah ${currentWilayahNama}.`
                  : `Belum ada data anak ${isBersekolah ? "bersekolah" : "belum bersekolah"} yang tercatat di wilayah ${currentWilayahNama}.`}
              </p>
            </div>
          )}

          {/* TABEL DAFTAR NAMA ANAK (Desktop & Tablet) */}
          {!isPending && !errorMsg && filteredData.length > 0 && (
            <>
              {/* Counter Info Bar */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>
                    Menampilkan <strong>{filteredData.length}</strong> dari total <strong>{dataList.length}</strong> anak di wilayah {currentWilayahNama}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  {userPeran ? `Peran: ${userPeran}` : "Hak Akses Admin Aktif"}
                </span>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                      <th className="py-3 px-3.5 w-10 text-center">No</th>
                      <th className="py-3 px-3.5 min-w-[200px]">Nama Lengkap & Usia</th>
                      <th className="py-3 px-3.5 min-w-[180px]">
                        {isBersekolah ? "Satuan PAUD / TK" : "Alasan Belum Sekolah"}
                      </th>
                      <th className="py-3 px-3.5 min-w-[180px]">Orang Tua / Wali & Kontak</th>
                      <th className="py-3 px-3.5 min-w-[200px]">Alamat Domisili</th>
                      <th className="py-3 px-3.5 min-w-[150px]">Komunitas Pencatat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredData.map((item, idx) => {
                      const isL = item.jenisKelamin === "L";
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-3.5 text-center font-mono text-slate-500">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                  {item.namaLengkap}
                                </span>
                                <span
                                  className={cn(
                                    "px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase",
                                    isL
                                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300"
                                      : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300"
                                  )}
                                >
                                  {isL ? "Laki-laki" : "Perempuan"}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  Usia {item.usia} Tahun
                                </span>
                                {item.tanggalLahir && (
                                  <span className="text-slate-400">
                                    • Lahir: {item.tanggalLahir}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Sekolah / Alasan */}
                          <td className="py-3 px-3.5">
                            <div className="space-y-1">
                              {isBersekolah ? (
                                <>
                                  <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                    <School className="h-3.5 w-3.5 shrink-0" />
                                    <span>{item.namaSekolah}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 line-clamp-1">
                                    {item.alasan}
                                  </p>
                                </>
                              ) : (
                                <>
                                  <div className="font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                                    <Baby className="h-3.5 w-3.5 shrink-0" />
                                    <span>{item.alasan}</span>
                                  </div>
                                  <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                                    Belum Bersekolah Formal
                                  </span>
                                </>
                              )}
                            </div>
                          </td>

                          {/* Orang Tua */}
                          <td className="py-3 px-3.5">
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                {item.namaOrangtua}
                              </div>
                              {item.nomorHp && item.nomorHp !== "-" && (
                                <a
                                  href={`https://wa.me/${item.nomorHp.replace(/\D/g, "").replace(/^0/, "62")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                                >
                                  <Phone className="h-3 w-3" />
                                  <span>{item.nomorHp}</span>
                                </a>
                              )}
                              <div className="text-[10px] text-slate-400">
                                Tinggal: {item.tinggalBersama}
                              </div>
                            </div>
                          </td>

                          {/* Alamat Domisili */}
                          <td className="py-3 px-3.5">
                            <div className="space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                              <div className="font-medium text-slate-800 dark:text-slate-200">
                                {item.domisiliJalan || "Alamat belum tercatat lengkap"}
                              </div>
                              <div className="text-slate-500 font-mono text-[10px]">
                                RT {item.domisiliRt || "01"} / RW {item.domisiliRw || "01"} • Kel. {item.domisiliKelurahan}
                              </div>
                              <div className="text-slate-400 text-[10px]">
                                Kec. {item.domisiliKecamatan}
                              </div>
                            </div>
                          </td>

                          {/* Komunitas */}
                          <td className="py-3 px-3.5">
                            <div className="space-y-1">
                              <span className="font-medium text-slate-700 dark:text-slate-300 line-clamp-1">
                                {item.komunitasNama}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                                <CheckCircle2 className="h-3 w-3" />
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

              {/* Mobile Card List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:hidden gap-3">
                {filteredData.map((item, idx) => {
                  const isL = item.jenisKelamin === "L";
                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3 shadow-xs"
                    >
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
                        <span className="text-xs font-mono font-bold text-slate-400">
                          #{idx + 1}
                        </span>
                      </div>

                      {/* Info Status / Sekolah */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          {isBersekolah ? "Satuan PAUD Binaan" : "Faktor / Alasan Belum Sekolah"}
                        </div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          {isBersekolah ? (
                            <>
                              <School className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                              <span>{item.namaSekolah}</span>
                            </>
                          ) : (
                            <>
                              <Baby className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                              <span>{item.alasan}</span>
                            </>
                          )}
                        </div>
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
                            {item.domisiliJalan ? `${item.domisiliJalan}, ` : ""}
                            RT {item.domisiliRt || "01"}/RW {item.domisiliRw || "01"}, Kel. {item.domisiliKelurahan}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
