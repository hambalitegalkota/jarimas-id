"use client";

import { useMemo } from "react";
import { getJenjangAts, getWilayahScopeInfo, JENJANG_ATS_CONFIG } from "@/lib/ats-helpers";
import type { DataAtsItem, KomunitasWithMembership } from "@/types/database";

interface PrintLaporanAtsProps {
  komunitas: KomunitasWithMembership;
  filteredAts: DataAtsItem[];
  totalAllAts: number;
  activeFilters: {
    jenjang: string;
    keinginan: string;
    alasan: string;
    status: string;
    search: string;
  };
}

export function PrintLaporanAts({
  komunitas,
  filteredAts,
  totalAllAts,
  activeFilters,
}: PrintLaporanAtsProps) {
  const scopeInfo = getWilayahScopeInfo(komunitas);
  const totalFiltered = filteredAts.length;

  const stats = useMemo(() => {
    const approved = filteredAts.filter((c) => c.status_approval === "approved").length;
    const pending = totalFiltered - approved;
    const laki = filteredAts.filter(
      (c) => c.jenis_kelamin === "L" || c.jenis_kelamin?.toLowerCase().startsWith("l")
    ).length;
    const perempuan = filteredAts.filter(
      (c) => c.jenis_kelamin === "P" || c.jenis_kelamin?.toLowerCase().startsWith("p")
    ).length;
    const masihAda = filteredAts.filter(
      (c) => (c.keinginan_sekolah === "Tidak Ada" ? "Tidak Ada" : "Masih Ada") === "Masih Ada"
    ).length;
    const tidakAda = filteredAts.filter((c) => c.keinginan_sekolah === "Tidak Ada").length;

    const sd = filteredAts.filter((c) => getJenjangAts(c).id === "sd").length;
    const smp = filteredAts.filter((c) => getJenjangAts(c).id === "smp").length;
    const sma = filteredAts.filter((c) => getJenjangAts(c).id === "sma").length;
    const dewasa = filteredAts.filter((c) => getJenjangAts(c).id === "dewasa").length;

    return {
      approved,
      pending,
      laki,
      perempuan,
      masihAda,
      tidakAda,
      sd,
      smp,
      sma,
      dewasa,
    };
  }, [filteredAts, totalFiltered]);

  const tanggalCetak = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  const tanggalSimple = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="hidden print:block font-sans text-black bg-white w-full max-w-[210mm] mx-auto p-2">
      {/* 1. KOP DOKUMEN RESMI A4 */}
      <div className="border-b-2 border-black pb-3 mb-4 text-center relative">
        <div className="flex items-center justify-between gap-4">
          {/* Logo / Cap Left */}
          <div className="w-16 h-16 border-2 border-black rounded-md flex flex-col items-center justify-center p-1 shrink-0">
            <span className="text-[10px] font-bold font-mono leading-none text-center">TEGAL</span>
            <span className="text-[7px] font-mono leading-none mt-1 text-center">BAHARI</span>
          </div>

          {/* Kop Title */}
          <div className="flex-1 text-center space-y-0.5">
            <h2 className="text-xs font-bold uppercase tracking-wider font-mono">
              PEMERINTAH KOTA TEGAL
            </h2>
            <h1 className="text-sm font-black uppercase tracking-tight">
              LAPORAN HASIL PENDATAAN & PEMETAAN ANAK TIDAK SEKOLAH (ATS)
            </h1>
            <p className="text-[11px] font-semibold">
              JARIMAS-ID • Jaringan Informasi & Layanan Anak Kota Tegal
            </p>
            <p className="text-[10px] text-gray-700">
              Wilayah: <span className="font-bold">{komunitas.nama}</span> • Cakupan:{" "}
              {scopeInfo.scopeTitle} ({scopeInfo.scopeSubtitle})
            </p>
          </div>

          {/* Logo / Cap Right */}
          <div className="w-16 h-16 border-2 border-black rounded-md flex flex-col items-center justify-center p-1 shrink-0">
            <span className="text-[10px] font-bold font-mono leading-none text-center">JARIMAS</span>
            <span className="text-[7px] font-mono leading-none mt-1 text-center">ATS-2026</span>
          </div>
        </div>

        {/* Double Border Line */}
        <div className="border-t border-black mt-2 pt-0.5" />
      </div>

      {/* 2. METADATA FILTER & WAKTU CETAK */}
      <div className="flex items-start justify-between text-[10px] font-mono border border-gray-400 bg-gray-50 p-2 rounded mb-3">
        <div className="space-y-0.5">
          <div>
            <span className="font-bold">Kriteria Filter: </span>
            <span>
              Jenjang: <b>{activeFilters.jenjang.toUpperCase()}</b> | Keinginan:{" "}
              <b>{activeFilters.keinginan}</b> | Alasan: <b>{activeFilters.alasan}</b> | Status:{" "}
              <b>{activeFilters.status}</b>
            </span>
          </div>
          {activeFilters.search.trim() !== "" && (
            <div>
              <span className="font-bold">Kata Kunci: </span>
              <span>&ldquo;{activeFilters.search}&rdquo;</span>
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div>
            Dicetak: <span className="font-bold">{tanggalCetak}</span>
          </div>
          <div>
            Data: <span className="font-bold">{totalFiltered}</span> dari {totalAllAts} anak
          </div>
        </div>
      </div>

      {/* 3. TABEL REKAPITULASI STATISTIK A4 */}
      <div className="mb-4">
        <h3 className="text-[10px] font-bold uppercase font-mono mb-1">
          I. REKAPITULASI HASIL FILTER
        </h3>
        <table className="w-full text-[10px] border border-black border-collapse text-center">
          <thead>
            <tr className="bg-gray-100 font-bold font-mono">
              <th className="border border-black p-1">Total Terfilter</th>
              <th className="border border-black p-1">Terverifikasi</th>
              <th className="border border-black p-1">Menunggu</th>
              <th className="border border-black p-1">Laki-laki</th>
              <th className="border border-black p-1">Perempuan</th>
              <th className="border border-black p-1">SD (7-12)</th>
              <th className="border border-black p-1">SMP (13-15)</th>
              <th className="border border-black p-1">SMA (16-18)</th>
              <th className="border border-black p-1">Dewasa (19-24+)</th>
              <th className="border border-black p-1">Masih Ada Minat</th>
              <th className="border border-black p-1">Tidak Ada Minat</th>
            </tr>
          </thead>
          <tbody>
            <tr className="font-mono font-bold">
              <td className="border border-black p-1 bg-gray-50">{totalFiltered}</td>
              <td className="border border-black p-1">{stats.approved}</td>
              <td className="border border-black p-1">{stats.pending}</td>
              <td className="border border-black p-1">{stats.laki}</td>
              <td className="border border-black p-1">{stats.perempuan}</td>
              <td className="border border-black p-1">{stats.sd}</td>
              <td className="border border-black p-1">{stats.smp}</td>
              <td className="border border-black p-1">{stats.sma}</td>
              <td className="border border-black p-1">{stats.dewasa}</td>
              <td className="border border-black p-1 bg-gray-50">{stats.masihAda}</td>
              <td className="border border-black p-1 bg-gray-50">{stats.tidakAda}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. TABEL DAFTAR LENGKAP ANAK ATS */}
      <div className="mb-4">
        <h3 className="text-[10px] font-bold uppercase font-mono mb-1">
          II. DAFTAR RINCIAN ANAK TIDAK SEKOLAH (ATS)
        </h3>

        {filteredAts.length === 0 ? (
          <div className="p-4 border border-black text-center text-xs italic">
            Tidak ada data ATS yang sesuai dengan filter yang dipilih.
          </div>
        ) : (
          <table className="w-full text-[9px] border border-black border-collapse">
            <thead>
              <tr className="bg-gray-100 font-bold font-mono text-center">
                <th className="border border-black p-1 w-6">No</th>
                <th className="border border-black p-1 text-left">Nama Anak</th>
                <th className="border border-black p-1 w-8">L/P</th>
                <th className="border border-black p-1 text-left">Orang Tua / Kontak</th>
                <th className="border border-black p-1 text-left">Alamat Domisili</th>
                <th className="border border-black p-1 w-20">Jenjang</th>
                <th className="border border-black p-1 w-20">Keinginan</th>
                <th className="border border-black p-1 text-left">Alasan Tidak Sekolah</th>
                <th className="border border-black p-1 w-16">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAts.map((item, index) => {
                const jenjang = getJenjangAts(item);
                const isApproved = item.status_approval === "approved";
                const isMasihAda =
                  (item.keinginan_sekolah === "Tidak Ada" ? "Tidak Ada" : "Masih Ada") ===
                  "Masih Ada";

                return (
                  <tr
                    key={item.id}
                    className={index % 2 === 1 ? "bg-gray-50/80" : "bg-white"}
                    style={{ pageBreakInside: "avoid" }}
                  >
                    <td className="border border-black p-1 text-center font-mono font-bold">
                      {index + 1}
                    </td>
                    <td className="border border-black p-1 font-bold text-black">
                      <div>{item.nama_lengkap}</div>
                      <div className="text-[8px] font-mono text-gray-600 font-normal">
                        Tgl Lahir: {item.tanggal_lahir || "-"} {item.usia ? `(${item.usia})` : ""}
                      </div>
                    </td>
                    <td className="border border-black p-1 text-center font-mono font-bold">
                      {item.jenis_kelamin === "L" ||
                      item.jenis_kelamin?.toLowerCase().startsWith("l")
                        ? "L"
                        : "P"}
                    </td>
                    <td className="border border-black p-1">
                      <div className="font-semibold">{item.nama_orangtua || "-"}</div>
                      <div className="text-[8px] font-mono text-gray-600">
                        HP: {item.nomor_hp || "-"}
                      </div>
                    </td>
                    <td className="border border-black p-1 text-[8.5px]">
                      <div>{item.alamat || "-"}</div>
                      <div className="text-gray-600 font-mono">
                        RT {item.rt || "-"}/RW {item.rw || "-"}, {item.kelurahan || "-"}
                      </div>
                    </td>
                    <td className="border border-black p-1 text-center font-mono font-semibold">
                      {jenjang.label.split(" ")[0]}
                    </td>
                    <td className="border border-black p-1 text-center font-mono font-bold">
                      <span
                        className={
                          isMasihAda
                            ? "px-1 py-0.5 border border-black rounded bg-gray-100"
                            : "px-1 py-0.5 border border-dashed border-black rounded"
                        }
                      >
                        {item.keinginan_sekolah || "Masih Ada"}
                      </span>
                    </td>
                    <td className="border border-black p-1 font-medium">
                      {item.alasan_tidak_sekolah || "-"}
                    </td>
                    <td className="border border-black p-1 text-center font-mono text-[8px] font-bold">
                      {isApproved ? "VALID" : "PENDING"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* 5. TANDA TANGAN & PENGESAHAN A4 */}
      <div className="mt-8 pt-2 grid grid-cols-2 text-center text-[10px] font-sans break-inside-avoid">
        <div className="space-y-12">
          <p>
            Mengetahui,
            <br />
            <span className="font-bold uppercase">
              Ketua RT / RW / Tokoh Masyarakat
            </span>
          </p>
          <p className="font-bold underline uppercase">( ........................................ )</p>
        </div>

        <div className="space-y-12">
          <p>
            Kota Tegal, {tanggalSimple}
            <br />
            <span className="font-bold uppercase">
              Kader Pendata / Pengurus Jarimas
            </span>
          </p>
          <p className="font-bold underline uppercase">( ........................................ )</p>
        </div>
      </div>

      {/* Catatan Kaki Dokumen */}
      <div className="mt-6 pt-2 border-t border-gray-400 text-[8px] font-mono text-gray-500 flex justify-between">
        <span>JARIMAS-ID • Dicetak otomatis dalam format standar A4 portrait</span>
        <span>Halaman 1 dari 1</span>
      </div>
    </div>
  );
}
