"use client";

import { useRef } from "react";
import {
  Printer,
  X,
  FileText,
  Download,
  GraduationCap,
  HeartPulse,
  Wrench,
  Home,
  ShieldCheck,
  Users,
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles,
} from "lucide-react";
import type { LaporanKaderSpmItem } from "@/types/database";

interface ModalPrintLaporanSpmProps {
  laporan: LaporanKaderSpmItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ModalPrintLaporanSpm({
  laporan,
  isOpen,
  onClose,
}: ModalPrintLaporanSpmProps) {
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !laporan) return null;

  const handlePrint = () => {
    window.print();
  };

  const getBidangIcon = (bidang: string) => {
    switch (bidang) {
      case "Pendidikan":
        return <GraduationCap className="h-5 w-5 text-blue-700" />;
      case "Kesehatan":
        return <HeartPulse className="h-5 w-5 text-emerald-700" />;
      case "Pekerjaan Umum":
        return <Wrench className="h-5 w-5 text-amber-700" />;
      case "Perumahan Rakyat":
        return <Home className="h-5 w-5 text-cyan-700" />;
      case "Trantibum Linmas":
        return <ShieldCheck className="h-5 w-5 text-indigo-700" />;
      case "Sosial":
        return <Users className="h-5 w-5 text-rose-700" />;
      default:
        return <Sparkles className="h-5 w-5 text-blue-700" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      {/* Container Dialog */}
      <div className="relative w-full max-w-3xl my-6 rounded-3xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl z-10 flex flex-col max-h-[92dvh] overflow-hidden">
        {/* Modal Top Bar (Hidden on Print) */}
        <div className="print:hidden flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
                Pratinjau Cetak Laporan Kader 6 Bidang SPM
              </h3>
              <p className="text-xs text-slate-500">
                Format resmi surat laporan Posyandu Kota Tegal (Siap Cetak / Save to PDF)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak / Simpan PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* AREA DOKUMEN LAPORAN RESMI (TAMPILAN CETAK PDF A4)        */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 dark:bg-slate-950/60 print:bg-white print:p-0">
          <div
            ref={printContentRef}
            className="mx-auto max-w-2xl bg-white text-slate-900 p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none text-xs sm:text-sm font-serif leading-relaxed"
          >
            {/* 1. KOP SURAT RESMI POSYANDU KOTA TEGAL */}
            <div className="text-center space-y-1 pb-3 border-b-4 border-double border-slate-900 mb-5">

              <h1 className="text-base sm:text-lg font-black uppercase tracking-wide font-sans text-blue-900">
                POS PELAYANAN TERPADU - {laporan.posyandu_nama.toUpperCase()}
              </h1>
              <p className="text-[11px] sm:text-xs font-sans text-slate-700">
                Kelurahan {laporan.kelurahan}, Kecamatan {laporan.kecamatan}, Kota Tegal, Jawa Tengah
              </p>
            </div>

            {/* 2. JUDUL LAPORAN */}
            <div className="text-center my-4 space-y-1">
              <h3 className="text-sm sm:text-base font-black uppercase font-sans tracking-wide underline underline-offset-4">
                LAPORAN BULANAN KADER POSYANDU 6 BIDANG SPM
              </h3>
              <p className="text-xs font-sans font-bold text-slate-700">
                Periode Bulan: <span className="uppercase text-blue-900">{laporan.bulan} {laporan.tahun}</span> &bull; Bidang:{" "}
                <span className="text-blue-900">Kader Bidang {laporan.bidang}</span>
              </p>
            </div>

            {/* 3. IDENTITAS & DATA UMUM */}
            <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 font-sans text-xs space-y-1.5 print:bg-slate-50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-semibold block text-[11px]">NAMA POSYANDU:</span>
                  <span className="font-bold text-slate-900">{laporan.posyandu_nama}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[11px]">WILAYAH:</span>
                  <span className="font-bold text-slate-900">
                    Kel. {laporan.kelurahan}, Kec. {laporan.kecamatan}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[11px]">NAMA KADER PELAPOR:</span>
                  <span className="font-bold text-slate-900">{laporan.nama_kader}</span>
                  {laporan.nomor_hp_kader && (
                    <span className="text-slate-500 text-[11px] block">
                      No. HP: {laporan.nomor_hp_kader}
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[11px]">TANGGAL PELAPORAN:</span>
                  <span className="font-bold text-slate-900">
                    {new Date(laporan.tanggal_laporan || laporan.created_at).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. URAIAN KEGIATAN KADER 6 BIDANG SPM */}
            <div className="space-y-4 my-5 font-sans">
              <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex items-center gap-1.5">
                <span>URAIAN HASIL PELAKSANAAN TUGAS KADER</span>
              </h4>

              {/* Butir 1: Pendataan */}
              {laporan.narasi_pendataan && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-blue-900">
                    <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-black shrink-0">
                      1
                    </span>
                    <span>Kegiatan Pendataan:</span>
                  </div>
                  <div className="pl-6 text-xs sm:text-sm text-slate-800 font-serif whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    {laporan.narasi_pendataan}
                  </div>
                </div>
              )}

              {/* Butir 2: Verifikasi dan Validasi */}
              {laporan.narasi_verifikasi_validasi && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-emerald-900">
                    <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black shrink-0">
                      2
                    </span>
                    <span>Kegiatan Verifikasi dan Validasi:</span>
                  </div>
                  <div className="pl-6 text-xs sm:text-sm text-slate-800 font-serif whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    {laporan.narasi_verifikasi_validasi}
                  </div>
                </div>
              )}

              {/* Butir 3: Penyuluhan, Edukasi dan Motivasi */}
              {laporan.narasi_penyuluhan_edukasi && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-purple-900">
                    <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-xs font-black shrink-0">
                      3
                    </span>
                    <span>Kegiatan Penyuluhan, Edukasi dan Motivasi:</span>
                  </div>
                  <div className="pl-6 text-xs sm:text-sm text-slate-800 font-serif whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    {laporan.narasi_penyuluhan_edukasi}
                  </div>
                </div>
              )}

              {/* Butir 4: Penyaluran Aspirasi */}
              {laporan.narasi_penyaluran_aspirasi && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-amber-900">
                    <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs font-black shrink-0">
                      4
                    </span>
                    <span>Kegiatan Penyaluran Aspirasi &amp; Aduan Warga:</span>
                  </div>
                  <div className="pl-6 text-xs sm:text-sm text-slate-800 font-serif whitespace-pre-wrap leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    {laporan.narasi_penyaluran_aspirasi}
                  </div>
                </div>
              )}
            </div>

            {/* 5. LEMBAR PENGESAHAN & TANDA TANGAN */}
            <div className="mt-8 pt-4 font-sans text-xs">
              <div className="grid grid-cols-2 gap-4 text-center">
                {/* Kiri: Mengetahui Ketua Posyandu / Kelurahan */}
                <div className="space-y-16">
                  <div>
                    <p className="font-semibold text-slate-600">Mengetahui,</p>
                    <p className="font-bold text-slate-900">
                      Pengurus Posyandu / Kelurahan
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 underline underline-offset-4">
                      ( ..................................................... )
                    </p>
                    <p className="text-[11px] text-slate-500">NIP / Jabatan</p>
                  </div>
                </div>

                {/* Kanan: Tanggal & Nama Kader Pelapor */}
                <div className="space-y-16">
                  <div>
                    <p className="font-semibold text-slate-600">
                      Tegal,{" "}
                      {new Date(laporan.tanggal_laporan || laporan.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <p className="font-bold text-slate-900">
                      Kader Bidang {laporan.bidang}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 underline underline-offset-4">
                      {laporan.nama_kader}
                    </p>
                    <p className="text-[11px] text-slate-500">Kader Posyandu</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Cetak */}
            <div className="mt-8 pt-3 border-t border-slate-200 text-[10px] font-sans text-slate-400 flex items-center justify-between">
              <span>Sistem Informasi Posyandu Jarimas Kota Tegal</span>
              <span>Dokumen Resmi 6 Bidang SPM</span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Bar (Hidden on Print) */}
        <div className="print:hidden flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
          <span className="text-xs text-slate-500">
            Gunakan opsi <strong>Save as PDF</strong> pada dialog cetak peramban.
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Dokumen</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
