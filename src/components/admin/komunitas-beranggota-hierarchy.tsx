"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Baby,
  Sparkles,
  School,
  HeartPulse,
  MapPin,
  RefreshCw,
  Loader2,
  Search,
  CheckCircle2,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  getHierarchicalActiveKomunitasAction,
  type HierarchicalActiveKomunitasSummary,
  type KomunitasBerjenjangItem,
} from "@/app/actions/komunitas";

export function KomunitasBeranggotaHierarchy() {
  const [data, setData] = useState<HierarchicalActiveKomunitasSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJenis, setFilterJenis] = useState<string>("semua");

  // Accordion state: map of expanded kecamatans
  const [expandedKecamatans, setExpandedKecamatans] = useState<Record<string, boolean>>({});

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getHierarchicalActiveKomunitasAction();
      if (res.success && res.data) {
        setData(res.data);
        // Collapse all kecamatan by default
        const initialExpand: Record<string, boolean> = {};
        res.data.kecamatanList.forEach((kec) => {
          initialExpand[kec.kecamatan] = false;
        });
        setExpandedKecamatans(initialExpand);
      } else {
        setError(res.message || "Gagal memuat data hierarki komunitas.");
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleKecamatan = (kecName: string) => {
    setExpandedKecamatans((prev) => ({
      ...prev,
      [kecName]: !prev[kecName],
    }));
  };

  const toggleAll = (expand: boolean) => {
    if (!data) return;
    const newState: Record<string, boolean> = {};
    data.kecamatanList.forEach((kec) => {
      newState[kec.kecamatan] = expand;
    });
    setExpandedKecamatans(newState);
  };

  // Filter logic based on search and jenis
  const filteredKecamatanList = useMemo(() => {
    if (!data) return [];
    const query = searchQuery.trim().toLowerCase();

    return data.kecamatanList
      .map((kec) => {
        const filteredKelurahans = kec.kelurahanList
          .map((kel) => {
            const filteredItems = kel.komunitasList.filter((item) => {
              // Filter jenis
              if (filterJenis !== "semua" && item.jenis !== filterJenis) {
                return false;
              }
              // Filter search
              if (query) {
                const matchName = item.nama.toLowerCase().includes(query);
                const matchKel = item.kelurahan.toLowerCase().includes(query);
                const matchKec = item.kecamatan.toLowerCase().includes(query);
                const matchLokasi = (item.lokasi || "").toLowerCase().includes(query);
                if (!matchName && !matchKel && !matchKec && !matchLokasi) {
                  return false;
                }
              }
              return true;
            });

            return {
              ...kel,
              totalKomunitas: filteredItems.length,
              totalAnggota: filteredItems.reduce((sum, i) => sum + i.jumlahAnggota, 0),
              totalDataAnak: filteredItems.reduce((sum, i) => sum + i.dataAnakCount, 0),
              komunitasList: filteredItems,
            };
          })
          .filter((kel) => kel.komunitasList.length > 0);

        return {
          ...kec,
          totalKomunitas: filteredKelurahans.reduce((sum, k) => sum + k.totalKomunitas, 0),
          totalAnggota: filteredKelurahans.reduce((sum, k) => sum + k.totalAnggota, 0),
          totalDataAnak: filteredKelurahans.reduce((sum, k) => sum + k.totalDataAnak, 0),
          kelurahanList: filteredKelurahans,
        };
      })
      .filter((kec) => kec.kelurahanList.length > 0);
  }, [data, searchQuery, filterJenis]);

  const totalFilteredKomunitas = useMemo(() => {
    return filteredKecamatanList.reduce((sum, k) => sum + k.totalKomunitas, 0);
  }, [filteredKecamatanList]);

  return (
    <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-xs">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Pemantauan Komunitas Beranggota (Struktur Berjenjang)
              </h3>
              <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 text-xs font-bold">
                BERJENJANG
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar komunitas yang telah memiliki anggota aktif dan rincian perannya per wilayah kecamatan &amp; kelurahan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="inline-flex min-h-[42px] items-center gap-2 px-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-98"
            title="Segarkan Data Hierarki"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRICS CARDS */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Metric 1: Total Komunitas Beranggota */}
          <div className="p-4 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/20 dark:bg-indigo-950/10 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <span>Komunitas Beranggota</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.2 rounded-full">
                AKTIF
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {data.totalKomunitasBeranggota}
            </div>
            <p className="text-[11px] text-slate-500">
              Entitas Posyandu, PAUD, &amp; Warga Kita
            </p>
          </div>

          {/* Metric 2: Total Anggota Terdaftar */}
          <div className="p-4 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>Total Anggota Aktif</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.2 rounded-full">
                TERVERIFIKASI
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {data.totalSeluruhAnggota}
            </div>
            <p className="text-[11px] text-slate-500">
              Kader, Pengurus, &amp; Warga/Murid
            </p>
          </div>

          {/* Metric 3: Total Data Anak */}
          <div className="p-4 rounded-2xl border-2 border-blue-100 dark:border-blue-900/40 bg-blue-50/20 dark:bg-blue-950/10 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
              <div className="flex items-center gap-1.5">
                <Baby className="h-4 w-4" />
                <span>Data Anak Terhubung</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-blue-100 dark:bg-blue-900/60 px-2 py-0.2 rounded-full">
                0-6 THN &amp; ATS
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono">
              {data.totalDataAnak}
            </div>
            <p className="text-[11px] text-slate-500">
              Tercatat di Posyandu &amp; PAUD terkait
            </p>
          </div>
        </div>
      )}

      {/* 3. FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama komunitas, kelurahan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Category Pills & Collapse All */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterJenis("semua")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterJenis === "semua"
                  ? "bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilterJenis("posyandu")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterJenis === "posyandu"
                  ? "bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Posyandu
            </button>
            <button
              type="button"
              onClick={() => setFilterJenis("satuan_paud")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterJenis === "satuan_paud"
                  ? "bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              PAUD
            </button>
            <button
              type="button"
              onClick={() => setFilterJenis("warga_kita")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterJenis === "warga_kita"
                  ? "bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Warga Kita
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const allOpen = Object.values(expandedKecamatans).every(Boolean);
              toggleAll(!allOpen);
            }}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline px-2 cursor-pointer"
          >
            {Object.values(expandedKecamatans).every(Boolean) ? "Tutup Semua" : "Buka Semua"}
          </button>
        </div>
      </div>

      {/* 4. HIERARCHY ACCORDION LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500 gap-3 border-t border-slate-100 dark:border-slate-800">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <span className="text-sm font-medium">Memuat hierarki komunitas beranggota...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-2xl border-2 border-rose-200 bg-rose-50 text-rose-800 text-xs font-bold">
          {error}
        </div>
      ) : data?.totalKomunitasBeranggota === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 border border-indigo-200 dark:border-indigo-900">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Semua Komunitas Bersih &amp; Siap
            </h4>
            <p className="text-xs text-slate-500 max-w-md">
              Belum ada anggota yang terdaftar di komunitas (0 data anggota). Saat ada pengguna atau kader baru yang bergabung, komunitas terkait akan langsung muncul secara berjenjang di sini.
            </p>
          </div>
        </div>
      ) : filteredKecamatanList.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
          Tidak ada komunitas beranggota yang cocok dengan pencarian atau filter kategori.
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {filteredKecamatanList.map((kec) => {
            const isExpanded = expandedKecamatans[kec.kecamatan] !== false;

            return (
              <div
                key={kec.kecamatan}
                className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 overflow-hidden transition-all shadow-2xs"
              >
                {/* Level 1: Kecamatan Header Accordion */}
                <button
                  type="button"
                  onClick={() => toggleKecamatan(kec.kecamatan)}
                  className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-left cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-bold border border-indigo-200 dark:border-indigo-800 text-xs">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                          Kecamatan {kec.kecamatan}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {kec.totalKomunitas} Komunitas
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                        <span>
                          👥 <strong>{kec.totalAnggota}</strong> Total Anggota
                        </span>
                        {kec.totalDataAnak > 0 && (
                          <span>
                            👶 <strong>{kec.totalDataAnak}</strong> Data Anak
                          </span>
                        )}
                        <span>• {kec.kelurahanList.length} Kelurahan</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hidden sm:inline">
                      {isExpanded ? "Sembunyikan" : "Tampilkan"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Level 2 & 3: Kelurahan Groups and Community Cards */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-5 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                    {kec.kelurahanList.map((kel) => (
                      <div key={kel.kelurahan} className="space-y-2.5">
                        {/* Kelurahan Badge Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-indigo-500" />
                            <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                              Kelurahan {kel.kelurahan}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                            <span>{kel.totalKomunitas} Komunitas</span>
                            <span>•</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {kel.totalAnggota} Anggota
                            </span>
                          </div>
                        </div>

                        {/* Community Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {kel.komunitasList.map((item) => (
                            <div
                              key={item.id}
                              className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between gap-3 shadow-2xs hover:shadow-xs group"
                            >
                              <div className="space-y-2">
                                {/* Category Badge & Member Count Pill */}
                                <div className="flex items-center justify-between gap-2">
                                  {item.jenis === "posyandu" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                                      <HeartPulse className="h-3 w-3" /> Posyandu
                                    </span>
                                  )}
                                  {item.jenis === "satuan_paud" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 text-[10px] font-bold">
                                      <School className="h-3 w-3" /> Satuan PAUD
                                    </span>
                                  )}
                                  {item.jenis === "warga_kita" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-0.5 text-[10px] font-bold">
                                      <Users className="h-3 w-3" /> Warga Kita
                                    </span>
                                  )}

                                  {/* Total Anggota Badge */}
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-0.5 text-[11px] font-mono font-bold">
                                    <Users className="h-3 w-3 text-indigo-600" />
                                    <span>{item.jumlahAnggota} Anggota</span>
                                  </span>
                                </div>

                                {/* Community Name */}
                                <div>
                                  <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                    {item.nama}
                                  </h5>
                                  <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                                    <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                                    <span className="line-clamp-1">
                                      {[
                                        item.rt ? `RT ${item.rt}` : "",
                                        item.rw ? `RW ${item.rw}` : "",
                                        item.kelurahan ? `Kel. ${item.kelurahan}` : "",
                                      ]
                                        .filter(Boolean)
                                        .join(" / ") || item.lokasi}
                                    </span>
                                  </div>
                                </div>

                                {/* Role Breakdown Tags */}
                                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                                  {item.kaderCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-bold font-mono">
                                      {item.kaderCount} Kader
                                    </span>
                                  )}
                                  {item.pengurusCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 font-bold font-mono">
                                      {item.pengurusCount} Pengurus
                                    </span>
                                  )}
                                  {item.wargaCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium font-mono">
                                      {item.wargaCount} Warga/Murid
                                    </span>
                                  )}
                                  {item.dataAnakCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 font-bold font-mono">
                                      👶 {item.dataAnakCount} Data Anak
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Footer Action Buttons */}
                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                                <Link
                                  href={`/komunitas/${item.id}/anggota`}
                                  className="text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1"
                                >
                                  <span>Kelola Anggota</span>
                                </Link>

                                <Link
                                  href={`/komunitas/${item.id}`}
                                  className="inline-flex min-h-[30px] items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-bold transition-colors cursor-pointer"
                                >
                                  <span>Buka Komunitas</span>
                                  <ExternalLink className="h-3 w-3" />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
