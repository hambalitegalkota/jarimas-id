"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  HeartPulse,
  GraduationCap,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Building2,
  MapPin,
  ExternalLink,
  Phone,
  Sparkles,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalMessageNotification } from "@/components/notifications/global-message-notification-provider";

export interface BerjenjangLembagaDetail {
  id: string;
  nama: string;
  jenis: "posyandu" | "satuan_paud";
  bentuk?: string;
  kelompokBentuk?: "TK" | "RA" | "PNF";
  kecamatan: string;
  kelurahan: string;
  rw?: string;
  rt?: string;
  jumlahAnggota: number;
  anggotaList: {
    userId: string;
    namaLengkap: string;
    email: string;
    nomorHp: string | null;
    avatarUrl: string | null;
    peran: string;
  }[];
  isBergabung: boolean;
}

export interface BerjenjangMemberItem {
  id: string;
  userId: string;
  namaLengkap: string;
  email: string;
  nomorHp: string | null;
  avatarUrl: string | null;
  peran: string;
  peranDiajukan: string | null;
  status: string;
  createdAt: string;
  asalLembaga: {
    id: string;
    nama: string;
    jenis: "posyandu" | "satuan_paud";
    bentuk?: string;
    kelompokBentuk?: "TK" | "RA" | "PNF";
    kecamatan: string;
    kelurahan: string;
    rw?: string;
    rt?: string;
  } | null;
}

export interface KomunitasBerjenjangMemberSummaryResult {
  isBerjenjang: boolean;
  type: "posyandu" | "satuan_paud" | null;
  level: "kota" | "kecamatan" | "kelurahan" | null;
  kelompokBentuk?: "all" | "TK" | "RA" | "PNF";
  kecamatan?: string;
  kelurahan?: string;
  totalAnggota: number;
  totalLembaga: number;
  jumlahLembagaBergabung: number;
  jumlahLembagaBelumBergabung: number;
  persentaseBergabung: number;
  daftarLembagaBergabung: BerjenjangLembagaDetail[];
  daftarLembagaBelumBergabung: BerjenjangLembagaDetail[];
  semuaLembaga: BerjenjangLembagaDetail[];
  anggotaList: BerjenjangMemberItem[];
  rekapBentukPaud?: {
    tk: {
      totalLembaga: number;
      bergabung: number;
      belumBergabung: number;
      totalAnggota: number;
    };
    ra: {
      totalLembaga: number;
      bergabung: number;
      belumBergabung: number;
      totalAnggota: number;
    };
    pnf: {
      totalLembaga: number;
      bergabung: number;
      belumBergabung: number;
      totalAnggota: number;
    };
  };
}

interface KomunitasBerjenjangAnggotaTabProps {
  summary: KomunitasBerjenjangMemberSummaryResult;
  currentUserId?: string | null;
  komunitasNama?: string;
  canChatWithMembers?: boolean;
}

export function KomunitasBerjenjangAnggotaTab({
  summary,
  currentUserId,
  komunitasNama = "Komunitas",
  canChatWithMembers = false,
}: KomunitasBerjenjangAnggotaTabProps) {
  const { openChatWithUser } = useGlobalMessageNotification();
  const [isRincianOpen, setIsRincianOpen] = useState(false);
  const [filterLembagaStatus, setFilterLembagaStatus] = useState<"semua" | "bergabung" | "belum">("semua");
  const [filterBentukLembaga, setFilterBentukLembaga] = useState<string>("semua");
  const [searchLembaga, setSearchLembaga] = useState("");
  const [searchAnggota, setSearchAnggota] = useState("");
  const [filterBentukAnggota, setFilterBentukAnggota] = useState<string>("semua");

  const isPosyandu = summary.type === "posyandu";
  const isPaud = summary.type === "satuan_paud";

  const lembagaLabel = isPosyandu ? "Posyandu" : "Satuan PAUD";
  const anggotaRoleLabel = isPosyandu ? "Kader" : "Pendidik";

  // Filter daftar lembaga di rincian
  const filteredLembaga = useMemo(() => {
    return summary.semuaLembaga.filter((l) => {
      // Filter status
      if (filterLembagaStatus === "bergabung" && !l.isBergabung) return false;
      if (filterLembagaStatus === "belum" && l.isBergabung) return false;

      // Filter bentuk untuk PAUD (3 Bentuk: TK, RA, PNF)
      if (isPaud && filterBentukLembaga !== "semua") {
        if (l.kelompokBentuk !== filterBentukLembaga) return false;
      }

      // Filter search
      if (searchLembaga.trim()) {
        const sq = searchLembaga.toLowerCase().trim();
        const matchName = l.nama.toLowerCase().includes(sq);
        const matchKel = l.kelurahan.toLowerCase().includes(sq);
        const matchKec = l.kecamatan.toLowerCase().includes(sq);
        return matchName || matchKel || matchKec;
      }

      return true;
    });
  }, [summary.semuaLembaga, filterLembagaStatus, filterBentukLembaga, searchLembaga, isPaud]);

  // Filter daftar anggota
  const filteredAnggota = useMemo(() => {
    return summary.anggotaList.filter((m) => {
      // Filter bentuk untuk PAUD
      if (isPaud && filterBentukAnggota !== "semua") {
        if (m.asalLembaga?.kelompokBentuk !== filterBentukAnggota) return false;
      }

      // Filter search
      if (searchAnggota.trim()) {
        const sq = searchAnggota.toLowerCase().trim();
        const matchNama = m.namaLengkap.toLowerCase().includes(sq);
        const matchAsal = m.asalLembaga?.nama.toLowerCase().includes(sq) || false;
        const matchKel = m.asalLembaga?.kelurahan.toLowerCase().includes(sq) || false;
        return matchNama || matchAsal || matchKel;
      }

      return true;
    });
  }, [summary.anggotaList, filterBentukAnggota, searchAnggota, isPaud]);

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. KARTU REKAPITULASI KEANGGOTAAN BERJENJANG              */}
      {/* ========================================================= */}
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                KOMUNITAS BERJENJANG • {summary.level ? summary.level.toUpperCase() : "WILAYAH"}
              </span>
              <span className="text-2xs text-muted-foreground font-semibold">
                {summary.kelurahan ? `${summary.kelurahan}, ${summary.kecamatan}` : summary.kecamatan || "Kota Tegal"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground mt-1">
              Rekapitulasi Keanggotaan {isPosyandu ? "Kader Posyandu" : "Pendidik PAUD"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Menghimpun pengguna dan kader aktif dari seluruh {lembagaLabel} di wilayah ini.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsRincianOpen((prev) => !prev)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background hover:bg-muted px-3 py-2 text-xs font-bold text-foreground transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-center"
          >
            <span>{isRincianOpen ? "Tutup Rincian" : "Buka Rincian Rekapitulasi"}</span>
            {isRincianOpen ? (
              <ChevronUp className="h-4 w-4 text-primary" />
            ) : (
              <ChevronDown className="h-4 w-4 text-primary" />
            )}
          </button>
        </div>

        {/* 3 Kartu Metrik Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card 1: Total Anggota Terdaftar */}
          <div className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase text-muted-foreground">
                Total {anggotaRoleLabel} Bergabung
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-foreground">
                {summary.totalAnggota}
              </span>
              <span className="text-xs text-muted-foreground font-medium">Orang</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Kader/pendidik terverifikasi aktif
            </p>
          </div>

          {/* Card 2: Lembaga yang Sudah Bergabung */}
          <div className="p-3.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase text-emerald-800 dark:text-emerald-300">
                {lembagaLabel} Telah Bergabung
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-300">
                {summary.jumlahLembagaBergabung}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                dari {summary.totalLembaga} {lembagaLabel} ({summary.persentaseBergabung}%)
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 leading-tight">
              Memiliki kader/pendidik yang telah terhubung
            </p>
          </div>

          {/* Card 3: Lembaga yang Belum Bergabung */}
          <div className="p-3.5 rounded-lg bg-amber-500/5 border border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-2xs font-bold uppercase text-amber-800 dark:text-amber-300">
                {lembagaLabel} Belum Bergabung
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-amber-700 dark:text-amber-300">
                {summary.jumlahLembagaBelumBergabung}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                dari {summary.totalLembaga} {lembagaLabel}
              </span>
            </div>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-tight">
              Belum ada kader/pendidik yang bergabung
            </p>
          </div>
        </div>

        {/* Khusus PAUD: Pengelompokan 3 Bentuk Satuan PAUD (TK, RA, PAUD Non Formal) */}
        {isPaud && summary.rekapBentukPaud && (
          <div className="space-y-2 pt-1 border-t border-border">
            <span className="text-2xs font-bold uppercase text-muted-foreground tracking-wider block">
              Pengelompokan 3 Bentuk Satuan PAUD
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* 1. Bentuk TK */}
              <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Taman Kanak-Kanak (TK)
                  </span>
                  <span className="text-2xs font-mono font-bold text-muted-foreground">
                    {summary.rekapBentukPaud.tk.totalAnggota} Pendidik
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Sudah Bergabung:</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {summary.rekapBentukPaud.tk.bergabung} / {summary.rekapBentukPaud.tk.totalLembaga} TK
                  </span>
                </div>
              </div>

              {/* 2. Bentuk RA */}
              <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Raudhatul Athfal (RA)
                  </span>
                  <span className="text-2xs font-mono font-bold text-muted-foreground">
                    {summary.rekapBentukPaud.ra.totalAnggota} Pendidik
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Sudah Bergabung:</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {summary.rekapBentukPaud.ra.bergabung} / {summary.rekapBentukPaud.ra.totalLembaga} RA
                  </span>
                </div>
              </div>

              {/* 3. Bentuk PAUD Non Formal */}
              <div className="p-3 rounded-lg bg-card border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    PAUD Non Formal (KB, SPS, TPA, PKBM, SKB)
                  </span>
                  <span className="text-2xs font-mono font-bold text-muted-foreground">
                    {summary.rekapBentukPaud.pnf.totalAnggota} Pendidik
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Sudah Bergabung:</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {summary.rekapBentukPaud.pnf.bergabung} / {summary.rekapBentukPaud.pnf.totalLembaga} Lembaga
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PANEL RINCIAN REKAPITULASI POSYANDU / SATUAN PAUD         */}
        {/* ========================================================= */}
        {isRincianOpen && (
          <div className="pt-3 border-t border-border space-y-3.5 animate-in fade-in-50 duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <h4 className="text-xs sm:text-sm font-bold text-foreground">
                Rincian Seluruh {lembagaLabel} di Wilayah Ini ({summary.totalLembaga})
              </h4>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/60 border border-border text-2xs font-bold">
                <button
                  type="button"
                  onClick={() => setFilterLembagaStatus("semua")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                    filterLembagaStatus === "semua"
                      ? "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Semua ({summary.totalLembaga})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterLembagaStatus("bergabung")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                    filterLembagaStatus === "bergabung"
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-emerald-700 dark:text-emerald-400 hover:text-emerald-800"
                  )}
                >
                  Sudah ({summary.jumlahLembagaBergabung})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterLembagaStatus("belum")}
                  className={cn(
                    "px-2.5 py-1 rounded-md transition-all cursor-pointer",
                    filterLembagaStatus === "belum"
                      ? "bg-amber-600 text-white shadow-2xs"
                      : "text-amber-700 dark:text-amber-400 hover:text-amber-800"
                  )}
                >
                  Belum ({summary.jumlahLembagaBelumBergabung})
                </button>
              </div>
            </div>

            {/* Filter Bar Rincian: Search & Filter 3 Bentuk PAUD */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchLembaga}
                  onChange={(e) => setSearchLembaga(e.target.value)}
                  placeholder={`Cari nama ${lembagaLabel} atau kelurahan...`}
                  className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>

              {isPaud && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <select
                    value={filterBentukLembaga}
                    onChange={(e) => setFilterBentukLembaga(e.target.value)}
                    className="h-8 px-2.5 text-xs rounded-lg border border-border bg-background text-foreground font-medium cursor-pointer"
                  >
                    <option value="semua">Semua 3 Bentuk PAUD</option>
                    <option value="TK">TK (Taman Kanak-Kanak)</option>
                    <option value="RA">RA (Raudhatul Athfal)</option>
                    <option value="PNF">PAUD Non Formal (KB, SPS, TPA, PKBM, SKB)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Grid Kartu Rincian Lembaga */}
            {filteredLembaga.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground rounded-lg border border-dashed border-border">
                Tidak ditemukan {lembagaLabel} yang sesuai dengan pencarian atau filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {filteredLembaga.map((lem) => (
                  <div
                    key={lem.id}
                    className={cn(
                      "p-3 rounded-lg border transition-all space-y-1.5 flex flex-col justify-between",
                      lem.isBergabung
                        ? "bg-card border-border hover:border-emerald-500/40"
                        : "bg-muted/30 border-dashed border-border"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-foreground truncate">
                            {lem.nama}
                          </h5>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0 text-primary" />
                            <span className="truncate">
                              {lem.kelurahan}, Kecamatan {lem.kecamatan}
                            </span>
                          </div>
                        </div>

                        {lem.isBergabung ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{lem.jumlahAnggota} {anggotaRoleLabel}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shrink-0">
                            <Clock className="h-3 w-3" />
                            <span>Belum Bergabung</span>
                          </span>
                        )}
                      </div>

                      {/* Info Bentuk (PAUD) */}
                      {isPaud && lem.bentuk && (
                        <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-muted text-muted-foreground border border-border">
                          Bentuk: {lem.bentuk}
                        </span>
                      )}
                    </div>

                    <div className="pt-1.5 flex items-center justify-between border-t border-border/60 text-2xs">
                      {lem.isBergabung ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold truncate">
                          Kader: {lem.anggotaList.map((a) => a.namaLengkap).slice(0, 2).join(", ")}
                          {lem.anggotaList.length > 2 ? ` +${lem.anggotaList.length - 2}` : ""}
                        </span>
                      ) : (
                        <span className="text-muted-foreground italic">
                          Belum ada akun kader terdaftar
                        </span>
                      )}

                      <Link
                        href={`/komunitas/${lem.id}`}
                        className="text-primary hover:underline font-bold inline-flex items-center gap-1 shrink-0 ml-2"
                      >
                        <span>Kunjungi</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* 2. DAFTAR ANGGOTA TERHIMPUN DENGAN ASAL LEMBAGA & CHAT    */}
      {/* ========================================================= */}
      <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Daftar Anggota &amp; {anggotaRoleLabel} ({filteredAnggota.length} Orang)
            </h3>
            <p className="text-xs text-muted-foreground">
              Pengguna aktif terdaftar beserta asal {lembagaLabel} masing-masing.
            </p>
          </div>

          {/* Filter Bar Anggota: Search & Filter 3 Bentuk PAUD */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                value={searchAnggota}
                onChange={(e) => setSearchAnggota(e.target.value)}
                placeholder={`Cari nama ${anggotaRoleLabel.toLowerCase()} atau asal...`}
                className="w-full h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:border-primary"
              />
            </div>

            {isPaud && (
              <select
                value={filterBentukAnggota}
                onChange={(e) => setFilterBentukAnggota(e.target.value)}
                className="h-8 px-2 text-xs rounded-lg border border-border bg-background text-foreground font-medium cursor-pointer"
              >
                <option value="semua">Semua Bentuk PAUD</option>
                <option value="TK">Bentuk TK</option>
                <option value="RA">Bentuk RA</option>
                <option value="PNF">PAUD Non Formal</option>
              </select>
            )}
          </div>
        </div>

        {/* List Anggota */}
        {filteredAnggota.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-xs font-semibold text-muted-foreground">
            {summary.anggotaList.length === 0
              ? `Belum ada anggota atau ${anggotaRoleLabel.toLowerCase()} yang terdaftar di komunitas ini`
              : "Tidak ada anggota yang cocok dengan kata kunci pencarian"}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAnggota.map((member) => {
              const name = member.namaLengkap || "Anggota Komunitas";
              const initial = name.charAt(0).toUpperCase();
              const isMe = Boolean(currentUserId && member.userId === currentUserId);

              return (
                <div
                  key={`${member.userId}-${member.asalLembaga?.id || member.id}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 sm:p-3.5 shadow-2xs hover:border-border/80 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-sm">
                      {initial}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        {isMe || !canChatWithMembers ? (
                          <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                            {name}
                          </h4>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openChatWithUser(member.userId)}
                            className="text-xs sm:text-sm font-bold text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors text-left truncate cursor-pointer"
                            title={`Mulai Chat dengan ${name}`}
                          >
                            {name}
                          </button>
                        )}

                        {isMe && (
                          <span className="text-[9px] font-extrabold bg-primary/20 text-primary px-1.5 py-0.2 rounded">
                            ANDA
                          </span>
                        )}

                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground border border-border">
                          {member.peran}
                        </span>
                      </div>

                      {/* Asal Lembaga (Posyandu / Satuan PAUD) */}
                      <div className="flex flex-wrap items-center gap-1.5 text-2xs text-muted-foreground font-medium">
                        {member.asalLembaga ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                            {isPosyandu ? (
                              <HeartPulse className="h-3 w-3 text-rose-500 shrink-0" />
                            ) : (
                              <GraduationCap className="h-3 w-3 text-emerald-600 shrink-0" />
                            )}
                            <span>Asal: {member.asalLembaga.nama}</span>
                            {member.asalLembaga.bentuk && (
                              <span className="text-[10px] font-bold bg-muted px-1 rounded text-muted-foreground">
                                {member.asalLembaga.bentuk}
                              </span>
                            )}
                            <span className="text-muted-foreground font-normal">
                              ({member.asalLembaga.kelurahan})
                            </span>
                          </span>
                        ) : (
                          <span className="italic text-muted-foreground">
                            Terdaftar di Komunitas Wilayah
                          </span>
                        )}

                        {member.nomorHp && (
                          <>
                            <span>•</span>
                            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300">
                              {member.nomorHp}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi: Chat */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {!isMe && canChatWithMembers && (
                      <button
                        type="button"
                        onClick={() => openChatWithUser(member.userId)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700/60 px-3 py-1.5 text-xs font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
                        title={`Kirim pesan pribadi ke ${name}`}
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Chat</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

