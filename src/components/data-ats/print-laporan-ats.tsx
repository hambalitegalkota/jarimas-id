"use client";

import { useMemo } from "react";
import { getJenjangAts, getWilayahScopeInfo } from "@/lib/ats-helpers";
import type { DataAtsItem, KomunitasWithMembership } from "@/types/database";

export interface PrintLaporanAtsProps {
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
  orientation?: "portrait" | "landscape";
  includeStats?: boolean;
  includeSignatures?: boolean;
  customSigner1Title?: string;
  customSigner1Name?: string;
  customSigner2Title?: string;
  customSigner2Name?: string;
  customDate?: string;
}

export function PrintLaporanAts({
  komunitas,
  filteredAts,
  totalAllAts,
  activeFilters,
  orientation = "portrait",
  includeStats = true,
  includeSignatures = true,
  customSigner1Title = "Ketua RT / RW / Tokoh Masyarakat",
  customSigner1Name = "",
  customSigner2Title = "Kader Pendata / Pengurus Jarimas",
  customSigner2Name = "",
  customDate,
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

  const tanggalCetakLengkap = customDate
    ? customDate
    : new Intl.DateTimeFormat("id-ID", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date());

  const tanggalSimple = customDate
    ? customDate
    : new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());

  const isLandscape = orientation === "landscape";

  return (
    <div
      className={`hidden print:block font-sans text-black bg-white w-full mx-auto p-2 ${
        isLandscape ? "max-w-[297mm] print-landscape" : "max-w-[210mm]"
      }`}
    >
      {/* 1. KOP DOKUMEN RESMI A4 */}
      <div className="border-b-2 border-black pb-3 mb-3 text-center relative">
        <div className="flex items-center justify-between gap-4">
          {/* Logo / Cap Left */}
          <div className="w-14 h-14 border-2 border-black rounded-md flex flex-col items-center justify-center p-1 shrink-0">
            <span className="text-[9px] font-bold font-mono leading-none text-center">TEGAL</span>
            <span className="text-[7px] font-mono leading-none mt-1 text-center">BAHARI</span>
          </div>

          {/* Kop Title */}
          <div className="flex-1 text-center space-y-0.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider font-mono">
              PEMERINTAH KOTA TEGAL
            </h2>
            <h1 className="text-sm sm:text-base font-black uppercase tracking-tight">
              LAPORAN HASIL PENDATAAN & PEMETAAN ANAK TIDAK SEKOLAH (ATS)
            </h1>
            <p className="text-[10px] font-semibold">
              JARIMAS-ID • Jaringan Informasi & Layanan Anak Kota Tegal
            </p>
            <p className="text-[9px] text-gray-700">
              Wilayah: <span className="font-bold">{komunitas.nama}</span> • Cakupan:{" "}
              {scopeInfo.scopeTitle} ({scopeInfo.scopeSubtitle})
            </p>
          </div>

          {/* Logo / Cap Right */}
          <div className="w-14 h-14 border-2 border-black rounded-md flex flex-col items-center justify-center p-1 shrink-0">
            <span className="text-[9px] font-bold font-mono leading-none text-center">JARIMAS</span>
            <span className="text-[7px] font-mono leading-none mt-1 text-center">ATS-2026</span>
          </div>
        </div>

        {/* Double Border Line */}
        <div className="border-t border-black mt-2 pt-0.5" />
      </div>

      {/* 2. METADATA FILTER & WAKTU CETAK */}
      <div className="flex items-start justify-between text-[9px] font-mono border border-gray-400 bg-gray-50 p-2 rounded mb-3">
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
              <span className="font-bold">Kata Kunci Pencarian: </span>
              <span>&ldquo;{activeFilters.search}&rdquo;</span>
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div>
            Dicetak: <span suppressHydrationWarning className="font-bold">{tanggalCetakLengkap}</span>
          </div>
          <div>
            Total Rincian: <span className="font-bold">{totalFiltered}</span> dari {totalAllAts} anak
          </div>
        </div>
      </div>

      {/* 3. TABEL REKAPITULASI STATISTIK A4 */}
      {includeStats && (
        <div className="mb-3 break-inside-avoid">
          <h3 className="text-[9.5px] font-bold uppercase font-mono mb-1 text-gray-900">
            I. REKAPITULASI HASIL PEMETAAN ATS
          </h3>
          <table className="w-full text-[9px] border border-black border-collapse text-center">
            <thead>
              <tr className="bg-gray-100 font-bold font-mono">
                <th className="border border-black p-1">Total Terdata</th>
                <th className="border border-black p-1">Tervalidasi</th>
                <th className="border border-black p-1">Menunggu</th>
                <th className="border border-black p-1">Laki-laki</th>
                <th className="border border-black p-1">Perempuan</th>
                <th className="border border-black p-1">SD (7-12)</th>
                <th className="border border-black p-1">SMP (13-15)</th>
                <th className="border border-black p-1">SMA (16-18)</th>
                <th className="border border-black p-1">19-24+ Thn</th>
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
      )}

      {/* 4. TABEL DAFTAR LENGKAP ANAK ATS */}
      <div className="mb-4">
        <h3 className="text-[9.5px] font-bold uppercase font-mono mb-1 text-gray-900">
          {includeStats ? "II." : "I."} DAFTAR RINCIAN ANAK TIDAK SEKOLAH (ATS)
        </h3>

        {filteredAts.length === 0 ? (
          <div className="p-4 border border-black text-center text-xs italic bg-gray-50">
            Tidak ada data ATS yang sesuai dengan filter yang dipilih.
          </div>
        ) : (
          <table className="w-full text-[8.5px] border border-black border-collapse">
            <thead>
              <tr className="bg-gray-100 font-bold font-mono text-center">
                <th className="border border-black p-1 w-6">No</th>
                <th className="border border-black p-1 text-left">Nama Anak</th>
                <th className="border border-black p-1 w-6">L/P</th>
                <th className="border border-black p-1 text-left">Orang Tua & Kontak</th>
                <th className="border border-black p-1 text-left">Alamat / RT-RW</th>
                <th className="border border-black p-1 w-16">Jenjang</th>
                <th className="border border-black p-1 w-16">Keinginan</th>
                <th className="border border-black p-1 text-left">Alasan Tidak Sekolah</th>
                <th className="border border-black p-1 w-14">Status</th>
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
                    className={index % 2 === 1 ? "bg-gray-50/70" : "bg-white"}
                    style={{ pageBreakInside: "avoid", breakInside: "avoid" }}
                  >
                    <td className="border border-black p-1 text-center font-mono font-bold">
                      {index + 1}
                    </td>
                    <td className="border border-black p-1 font-bold text-black">
                      <div className="text-[9px]">{item.nama_lengkap}</div>
                      <div className="text-[7.5px] font-mono text-gray-600 font-normal">
                        Tgl: {item.tanggal_lahir || "-"} {item.usia ? `(${item.usia})` : ""}
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
                      <div className="text-[7.5px] font-mono text-gray-600">
                        HP: {item.nomor_hp || "-"}
                      </div>
                    </td>
                    <td className="border border-black p-1 text-[8px]">
                      <div>{item.alamat || "-"}</div>
                      <div className="text-gray-600 font-mono">
                        RT {item.rt || "-"}/RW {item.rw || "-"}, {item.kelurahan || "-"}
                      </div>
                    </td>
                    <td className="border border-black p-1 text-center font-mono font-semibold">
                      {jenjang.label.split(" ")[0]}
                    </td>
                    <td className="border border-black p-1 text-center font-mono font-bold text-[8px]">
                      <span
                        className={
                          isMasihAda
                            ? "px-1 py-0.5 border border-black rounded bg-gray-100"
                            : "px-1 py-0.5 border border-dashed border-black rounded text-gray-700"
                        }
                      >
                        {item.keinginan_sekolah || "Masih Ada"}
                      </span>
                    </td>
                    <td className="border border-black p-1 font-medium">
                      <div>{item.alasan_tidak_sekolah || "-"}</div>
                      {item.sekolah_sebelumnya && (
                        <div className="text-[7.5px] text-gray-600 font-normal">
                          Eks: {item.sekolah_sebelumnya} ({item.kelas_terakhir || "-"})
                        </div>
                      )}
                    </td>
                    <td className="border border-black p-1 text-center font-mono text-[7.5px] font-bold">
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
      {includeSignatures && (
        <div className="mt-6 pt-2 grid grid-cols-2 text-center text-[9.5px] font-sans break-inside-avoid">
          <div className="space-y-12">
            <p>
              Mengetahui,
              <br />
              <span className="font-bold uppercase">
                {customSigner1Title}
              </span>
            </p>
            <p className="font-bold underline uppercase">
              ( {customSigner1Name.trim() || "........................................"} )
            </p>
          </div>

          <div className="space-y-12">
            <p suppressHydrationWarning>
              Kota Tegal, <span suppressHydrationWarning>{tanggalSimple}</span>
              <br />
              <span className="font-bold uppercase">
                {customSigner2Title}
              </span>
            </p>
            <p className="font-bold underline uppercase">
              ( {customSigner2Name.trim() || "........................................"} )
            </p>
          </div>
        </div>
      )}

      {/* Catatan Kaki Dokumen */}
      <div className="mt-6 pt-2 border-t border-gray-400 text-[8px] font-mono text-gray-500 flex justify-between">
        <span>JARIMAS-ID • Laporan Resmi Pendataan ATS Standar Kertas A4</span>
        <span>Pemerintah Kota Tegal</span>
      </div>
    </div>
  );
}
