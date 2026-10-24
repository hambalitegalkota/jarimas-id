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
      setError("Gagal memuat hierarki komunitas beranggota. Silakan segarkan halaman.");
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
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-xs">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold border border-primary/20">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Pemantauan Komunitas Beranggota (Struktur Berjenjang)
              </h3>
              <span className="inline-flex items-center rounded-md bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-xs font-bold">
                BERJENJANG
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daftar komunitas yang telah memiliki anggota aktif dan rincian perannya per wilayah kecamatan &amp; kelurahan.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="inline-flex min-h-[44px] h-11 items-center gap-2 px-4 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-98"
            title="Segarkan Data Hierarki"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* 2. SUMMARY METRICS CARDS */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Metric 1: Total Komunitas Beranggota */}
          <div className="p-4 rounded-lg border border-border bg-card space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-primary">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <span>Komunitas Beranggota</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-md font-bold">
                AKTIF
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
              {data.totalKomunitasBeranggota}
            </div>
            <p className="text-xs text-muted-foreground">
              Entitas Posyandu, PAUD, &amp; Warga Kita
            </p>
          </div>

          {/* Metric 2: Total Anggota Terdaftar */}
          <div className="p-4 rounded-lg border border-border bg-card space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-secondary">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>Total Anggota Aktif</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-secondary/15 text-secondary px-2 py-0.5 rounded-md font-bold">
                TERVERIFIKASI
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
              {data.totalSeluruhAnggota}
            </div>
            <p className="text-xs text-muted-foreground">
              Kader, Pengurus, &amp; Warga/Murid
            </p>
          </div>

          {/* Metric 3: Total Data Anak */}
          <div className="p-4 rounded-lg border border-border bg-card space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-700 dark:text-cyan-400">
              <div className="flex items-center gap-1.5">
                <Baby className="h-4 w-4" />
                <span>Data Anak Terhubung</span>
              </div>
              <span className="text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 px-2 py-0.5 rounded-md font-bold">
                0-6 THN &amp; ATS
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-foreground font-mono">
              {data.totalDataAnak}
            </div>
            <p className="text-xs text-muted-foreground">
              Tercatat di Posyandu &amp; PAUD terkait
            </p>
          </div>
        </div>
      )}

      {/* 3. FILTER & SEARCH CONTROLS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama komunitas, kelurahan..."
            className="w-full min-h-[44px] h-11 pl-10 pr-4 rounded-lg border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Category Pills & Collapse All */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
          <div className="flex items-center bg-muted/60 p-1 rounded-lg gap-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterJenis("semua")}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer min-h-[36px] ${
                filterJenis === "semua"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilterJenis("posyandu")}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer min-h-[36px] ${
                filterJenis === "posyandu"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Posyandu
            </button>
            <button
              type="button"
              onClick={() => setFilterJenis("satuan_paud")}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer min-h-[36px] ${
                filterJenis === "satuan_paud"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              PAUD
            </button>
            <button
              type="button"
              onClick={() => setFilterJenis("warga_kita")}
              className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer min-h-[36px] ${
                filterJenis === "warga_kita"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
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
            className="text-xs font-bold text-primary hover:underline px-2 cursor-pointer min-h-[36px] inline-flex items-center"
          >
            {Object.values(expandedKecamatans).every(Boolean) ? "Tutup Semua" : "Buka Semua"}
          </button>
        </div>
      </div>

      {/* 4. HIERARCHY ACCORDION LIST */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3 border-t border-border">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-sm font-medium">Memuat hierarki komunitas beranggota...</span>
        </div>
      ) : error ? (
        <div className="p-4 rounded-lg border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 text-xs font-bold">
          {error}
        </div>
      ) : data?.totalKomunitasBeranggota === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-lg border border-dashed border-border bg-card space-y-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-foreground text-sm">
              Semua Komunitas Bersih &amp; Siap
            </h4>
            <p className="text-xs text-muted-foreground max-w-md">
              Belum ada anggota yang terdaftar di komunitas (0 data anggota). Saat ada pengguna atau kader baru yang bergabung, komunitas terkait akan langsung muncul secara berjenjang di sini.
            </p>
          </div>
        </div>
      ) : filteredKecamatanList.length === 0 ? (
        <div className="py-10 text-center text-xs text-muted-foreground border-t border-border">
          Tidak ada komunitas beranggota yang cocok dengan pencarian atau filter kategori.
        </div>
      ) : (
        <div className="space-y-3 pt-1">
          {filteredKecamatanList.map((kec) => {
            const isExpanded = expandedKecamatans[kec.kecamatan] !== false;

            return (
              <div
                key={kec.kecamatan}
                className="rounded-lg border border-border bg-card overflow-hidden transition-all shadow-xs"
              >
                {/* Level 1: Kecamatan Header Accordion */}
                <button
                  type="button"
                  onClick={() => toggleKecamatan(kec.kecamatan)}
                  className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted/50 transition-colors text-left cursor-pointer select-none min-h-[44px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold border border-primary/20 text-xs">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-foreground">
                          Kecamatan {kec.kecamatan}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                          {kec.totalKomunitas} Komunitas
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
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
                    <span className="text-xs font-bold text-primary hidden sm:inline">
                      {isExpanded ? "Sembunyikan" : "Tampilkan"}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Level 2 & 3: Kelurahan Groups and Community Cards */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 space-y-4 border-t border-border bg-muted/20">
                    {kec.kelurahanList.map((kel) => (
                      <div key={kel.kelurahan} className="space-y-2.5">
                        {/* Kelurahan Badge Header */}
                        <div className="flex items-center justify-between border-b border-border pb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                              Kelurahan {kel.kelurahan}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                            <span>{kel.totalKomunitas} Komunitas</span>
                            <span>•</span>
                            <span className="font-bold text-foreground">
                              {kel.totalAnggota} Anggota
                            </span>
                          </div>
                        </div>

                        {/* Community Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          {kel.komunitasList.map((item) => (
                            <div
                              key={item.id}
                              className="p-4 rounded-lg border border-border bg-card hover:border-primary/40 transition-all flex flex-col justify-between gap-3 shadow-xs group"
                            >
                              <div className="space-y-2">
                                {/* Category Badge & Member Count Pill */}
                                <div className="flex items-center justify-between gap-2">
                                  {item.jenis === "posyandu" && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                                      <HeartPulse className="h-3 w-3" /> Posyandu
                                    </span>
                                  )}
                                  {item.jenis === "satuan_paud" && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold">
                                      <School className="h-3 w-3" /> Satuan PAUD
                                    </span>
                                  )}
                                  {item.jenis === "warga_kita" && (
                                    <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold">
                                      <Users className="h-3 w-3" /> Warga Kita
                                    </span>
                                  )}

                                  {/* Total Anggota Badge */}
                                  <span className="inline-flex items-center gap-1 rounded-md bg-muted text-foreground px-2 py-0.5 text-xs font-mono font-bold">
                                    <Users className="h-3 w-3 text-primary" />
                                    <span>{item.jumlahAnggota} Anggota</span>
                                  </span>
                                </div>

                                {/* Community Name */}
                                <div>
                                  <h5 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                    {item.nama}
                                  </h5>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                    <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
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
                                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-bold font-mono">
                                      {item.kaderCount} Kader
                                    </span>
                                  )}
                                  {item.pengurusCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-bold font-mono">
                                      {item.pengurusCount} Pengurus
                                    </span>
                                  )}
                                  {item.wargaCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-medium font-mono">
                                      {item.wargaCount} Warga/Murid
                                    </span>
                                  )}
                                  {item.dataAnakCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 font-bold font-mono">
                                      👶 {item.dataAnakCount} Data Anak
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Footer Action Buttons */}
                              <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
                                <Link
                                  href={`/komunitas/${item.id}/anggota`}
                                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  <span>Kelola Anggota</span>
                                </Link>

                                <Link
                                  href={`/komunitas/${item.id}`}
                                  className="inline-flex min-h-[36px] items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors cursor-pointer"
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
