"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Baby,
  Plus,
  X,
  Search,
  ShieldCheck,
  AlertCircle,
  Eye,
  Lock,
  ShieldAlert,
  LogIn,
  UserPlus,
  ArrowRight,
  BarChart3,
  Users,
  GraduationCap,
  HeartHandshake,
  CheckCircle2,
  Clock,
  Sparkles,
  School,
} from "lucide-react";
import { CardDataAnak } from "@/components/data-anak/card-data-anak";
import { FormDataAnak } from "@/components/data-anak/form-data-anak";
import { KomunitasRekapGrafikView } from "@/components/data-anak/komunitas-rekap-grafik-view";
import { isKomunitasLayananPaud } from "@/lib/data-anak-helpers";
import {
  buildKomunitasScopedRekap,
  type KomunitasScopedRekapResult,
} from "@/lib/komunitas-rekap-calculator";
import type {
  KomunitasWithMembership,
  DataAnakItem,
} from "@/types/database";
import type { WilayahRekapItem } from "@/lib/rekap-data-anak-shared";
import { cn } from "@/lib/utils";

interface DataAnakClientViewProps {
  komunitas: KomunitasWithMembership;
  initialChildren: DataAnakItem[];
  stats?: {
    total: number;
    approved: number;
    pending: number;
  };
  scopedRekapItem?: WilayahRekapItem;
  subTierItems?: WilayahRekapItem[];
  subTierTitle?: string;
  subTierColumnLabel?: string;
  scopeType?: "kota" | "kecamatan" | "kelurahan" | "rw" | "rt" | "paud" | "posyandu";
  canViewDetail?: boolean;
  isAuthenticated?: boolean;
  canValidate: boolean;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  isReadOnly?: boolean;
  userRole?: string;
}

export function DataAnakClientView({
  komunitas,
  initialChildren,
  stats,
  scopedRekapItem: initialScopedRekap,
  subTierItems: initialSubTierItems,
  subTierTitle: initialSubTierTitle,
  subTierColumnLabel: initialSubTierColumnLabel,
  scopeType: initialScopeType,
  canViewDetail = false,
  isAuthenticated = false,
  canValidate,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  isReadOnly = false,
  userRole,
}: DataAnakClientViewProps) {
  const [childrenList, setChildrenList] = useState<DataAnakItem[]>(initialChildren);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Nav Switcher: 📊 Rekapitulasi & Grafik vs 📋 Daftar Rincian Anak
  const [mainViewTab, setMainViewTab] = useState<"rekap" | "rincian">("rekap");

  // Sub-Tab Pemisah Jenis Data: Semua Anak | Bersekolah | Belum Bersekolah
  const [dataFilterTab, setDataFilterTab] = useState<
    "semua" | "bersekolah" | "belum_bersekolah"
  >("semua");

  const effectiveRole =
    userRole || komunitas.currentUserMembership?.peran || "Pengunjung";
  const isWargaKita = komunitas.jenis === "warga_kita";
  const isPaud = isKomunitasLayananPaud(komunitas, komunitas.nama, komunitas.jenis);
  const isPosyandu = komunitas.jenis === "posyandu";

  // Hitung ulang rekap scoped jika data anak diperbarui di client
  const rekapCalc: KomunitasScopedRekapResult = useMemo(() => {
    if (initialScopedRekap && initialSubTierItems) {
      return {
        scopeRekapItem: initialScopedRekap,
        subTierItems: initialSubTierItems,
        subTierTitle: initialSubTierTitle || `Rekapitulasi ${komunitas.nama}`,
        subTierColumnLabel: initialSubTierColumnLabel || "Wilayah",
        scopeType: initialScopeType || (isPaud ? "paud" : "kelurahan"),
      };
    }
    return buildKomunitasScopedRekap(komunitas, childrenList);
  }, [
    komunitas,
    childrenList,
    initialScopedRekap,
    initialSubTierItems,
    initialSubTierTitle,
    initialSubTierColumnLabel,
    initialScopeType,
    isPaud,
  ]);

  // Pemisahan yang Sangat Jelas antara Kedua Jenis Data
  const bersekolahChildren = useMemo(
    () =>
      childrenList.filter(
        (c) =>
          c.is_sekolah === true ||
          Boolean(
            c.nama_sekolah &&
              !c.nama_sekolah.toLowerCase().includes("belum")
          )
      ),
    [childrenList]
  );

  const belumBersekolahChildren = useMemo(
    () =>
      childrenList.filter(
        (c) =>
          !c.is_sekolah ||
          (c.nama_sekolah && c.nama_sekolah.toLowerCase().includes("belum"))
      ),
    [childrenList]
  );

  const totalChildren = stats?.total ?? childrenList.length;
  const totalBersekolahCount = bersekolahChildren.length;
  const totalBelumBersekolahCount = belumBersekolahChildren.length;
  const totalApproved =
    stats?.approved ??
    childrenList.filter((c) => c.status_approval === "approved").length;
  const totalPending =
    stats?.pending ??
    childrenList.filter((c) => c.status_approval === "pending").length;

  // Filter daftar berdasarkan sub-tab & search
  const displayedChildren = useMemo(() => {
    let baseList = childrenList;
    if (dataFilterTab === "bersekolah") {
      baseList = bersekolahChildren;
    } else if (dataFilterTab === "belum_bersekolah") {
      baseList = belumBersekolahChildren;
    }

    if (!searchQuery.trim()) return baseList;
    const q = searchQuery.toLowerCase().trim();
    return baseList.filter(
      (c) =>
        c.nama_lengkap.toLowerCase().includes(q) ||
        c.nama_orangtua.toLowerCase().includes(q) ||
        (c.nama_sekolah && c.nama_sekolah.toLowerCase().includes(q)) ||
        (c.alasan_sekolah && c.alasan_sekolah.toLowerCase().includes(q))
    );
  }, [childrenList, bersekolahChildren, belumBersekolahChildren, dataFilterTab, searchQuery]);

  return (
    <div className="space-y-6">
      {/* 1. Notice Banner untuk Peran Read-Only di Satuan PAUD */}
      {isPaud && isReadOnly && canViewDetail && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 sm:p-4 flex items-start gap-3 text-foreground shadow-2xs">
          <Eye className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-foreground">
              Mode Akses: Tinjauan Siswa ({effectiveRole})
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Sebagai {effectiveRole} di Satuan PAUD ini, Anda memiliki akses melihat (Read-Only) data profil siswa dan riwayat DDTK secara transparan. Pembuatan, pengeditan, dan pengelolaan status siswa dikelola oleh Admin, Kepala Sekolah, dan Guru PAUD.
            </p>
          </div>
        </div>
      )}

      {/* Notice Banner untuk Pengunjung di Warga Kita */}
      {isWargaKita && isReadOnly && canViewDetail && (
        <div className="rounded-lg border border-secondary/30 bg-secondary/10 p-3.5 sm:p-4 flex items-start gap-3 text-foreground shadow-2xs">
          <AlertCircle className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-foreground">
              Hak Akses Warga / Tinjauan Statistik ({effectiveRole})
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Anda dapat meninjau statistik rekapitulasi, grafik partisipasi PAUD, serta rincian data anak. Penambahan anak usia 0–6 tahun yang belum bersekolah dapat dilakukan melalui tombol Tambah Data di bawah ini.
            </p>
          </div>
        </div>
      )}

      {/* 2. TOP ACTION BAR: Action Buttons & Main View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        {/* View Switcher Tabs: Rekapitulasi & Grafik vs Rincian Data Anak */}
        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setMainViewTab("rekap")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer border",
              mainViewTab === "rekap"
                ? "bg-card text-foreground border-border shadow-xs font-black"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <BarChart3 className="h-4 w-4 text-primary" />
            <span>Rekap, Grafik &amp; Diagram</span>
          </button>

          <button
            type="button"
            onClick={() => setMainViewTab("rincian")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-bold transition-all cursor-pointer border",
              mainViewTab === "rincian"
                ? "bg-card text-foreground border-border shadow-xs font-black"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>Daftar Rincian Anak ({totalChildren})</span>
          </button>
        </div>

        {/* Action Button: Contextual Tambah Data */}
        {canCreate && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground px-4 text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>
              {isPaud
                ? "TAMBAH SISWA PAUD BARU"
                : "TAMBAH DATA ANAK BELUM BERSEKOLAH"}
            </span>
          </button>
        )}
      </div>

      {/* 3. TAMPILAN UTAMA: TAB REKAPITULASI & GRAFIK DIAGRAM */}
      {mainViewTab === "rekap" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <KomunitasRekapGrafikView
            scopeRekapItem={rekapCalc.scopeRekapItem}
            subTierItems={rekapCalc.subTierItems}
            subTierTitle={rekapCalc.subTierTitle}
            subTierColumnLabel={rekapCalc.subTierColumnLabel}
            scopeType={rekapCalc.scopeType}
            komunitasNama={komunitas.nama}
          />
        </div>
      )}

      {/* 4. TAMPILAN UTAMA: TAB RINCIAN DATA ANAK DENGAN PEMISAHAN JELAS */}
      {mainViewTab === "rincian" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {canViewDetail ? (
            <>
              {/* METRIC COUNTER MINI BAR */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div
                  onClick={() => setDataFilterTab("semua")}
                  className={cn(
                    "rounded-lg border p-3.5 text-center space-y-1 shadow-xs cursor-pointer transition-all",
                    dataFilterTab === "semua"
                      ? "border-primary bg-primary/10 shadow-2xs"
                      : "border-border bg-card hover:bg-muted/30"
                  )}
                >
                  <span className="text-2xs font-bold uppercase tracking-wider text-muted-foreground block">
                    TOTAL SELURUH ANAK
                  </span>
                  <span className="text-2xl font-bold font-mono text-foreground">
                    {totalChildren}
                  </span>
                  <span className="text-2xs font-semibold text-muted-foreground block">
                    {isPaud ? "Siswa Terdaftar" : "Balita & Anak 0–6 Thn"}
                  </span>
                </div>

                <div
                  onClick={() => setDataFilterTab("bersekolah")}
                  className={cn(
                    "rounded-lg border p-3.5 text-center space-y-1 shadow-xs cursor-pointer transition-all",
                    dataFilterTab === "bersekolah"
                      ? "border-teal-500 bg-teal-500/15 shadow-2xs"
                      : "border-teal-500/25 bg-teal-500/5 hover:bg-teal-500/10"
                  )}
                >
                  <span className="text-2xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 block">
                    ANAK BERSEKOLAH (PAUD)
                  </span>
                  <span className="text-2xl font-bold font-mono text-teal-700 dark:text-teal-300">
                    {totalBersekolahCount}
                  </span>
                  <span className="text-2xs font-semibold text-teal-800 dark:text-teal-300 block">
                    Sumber: Satuan PAUD
                  </span>
                </div>

                <div
                  onClick={() => setDataFilterTab("belum_bersekolah")}
                  className={cn(
                    "rounded-lg border p-3.5 text-center space-y-1 shadow-xs cursor-pointer transition-all",
                    dataFilterTab === "belum_bersekolah"
                      ? "border-amber-500 bg-amber-500/20 shadow-2xs"
                      : "border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10"
                  )}
                >
                  <span className="text-2xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 block">
                    BELUM BERSEKOLAH
                  </span>
                  <span className="text-2xl font-bold font-mono text-amber-700 dark:text-amber-300">
                    {totalBelumBersekolahCount}
                  </span>
                  <span className="text-2xs font-semibold text-amber-900 dark:text-amber-200 block">
                    Pendataan Warga / RT
                  </span>
                </div>
              </div>

              {/* PEMISAHAN KATEGORI DATA: TAB FILTER JELAS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setDataFilterTab("semua")}
                    className={cn(
                      "px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center gap-1.5",
                      dataFilterTab === "semua"
                        ? "bg-primary text-primary-foreground border-primary shadow-xs"
                        : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span>Semua Anak</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-background/20 font-mono text-2xs">
                      {totalChildren}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDataFilterTab("bersekolah")}
                    className={cn(
                      "px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center gap-1.5",
                      dataFilterTab === "bersekolah"
                        ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                        : "bg-card text-muted-foreground border-border hover:bg-teal-500/10 hover:text-teal-700"
                    )}
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>Anak Bersekolah (PAUD / PKBM / SKB)</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-background/20 font-mono text-2xs">
                      {totalBersekolahCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDataFilterTab("belum_bersekolah")}
                    className={cn(
                      "px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border shrink-0 flex items-center gap-1.5",
                      dataFilterTab === "belum_bersekolah"
                        ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                        : "bg-card text-muted-foreground border-border hover:bg-amber-500/10 hover:text-amber-800"
                    )}
                  >
                    <Baby className="h-3.5 w-3.5" />
                    <span>Anak Belum Bersekolah</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-background/20 font-mono text-2xs">
                      {totalBelumBersekolahCount}
                    </span>
                  </button>
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-64">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama anak, ortu, sekolah..."
                    className="w-full h-9 rounded-lg border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
                  />
                </div>
              </div>

              {/* INFORMATIVE NOTICE BERDASARKAN TAB AKTIF */}
              {dataFilterTab === "bersekolah" && (
                <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-3 sm:p-3.5 flex items-start gap-2.5 shadow-xs">
                  <ShieldCheck className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs text-foreground">
                    <span className="font-bold text-teal-900 dark:text-teal-100 block">
                      Data Anak Bersekolah PAUD (Read-Only di Luar Komunitas PAUD)
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {isPaud
                        ? "Seluruh siswa terdaftar di satuan PAUD ini. Pendidik/Admin PAUD dapat melakukan fungsi Edit Data, Keluar / Hapus, dan Validasi (TERVERIFIKASI / MENUNGGU)."
                        : "Data anak usia 0–6 tahun yang bersekolah bersumber dari Komunitas Satuan PAUD, PKBM Star of Tomorrow, dan SKB Kota Tegal. Data ini ditampilkan sebagai referensi pemantauan warga dan tidak dapat di-edit di komunitas ini."}
                    </p>
                  </div>
                </div>
              )}

              {dataFilterTab === "belum_bersekolah" && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 sm:p-3.5 flex items-start gap-2.5 shadow-xs">
                  <Baby className="h-4.5 w-4.5 text-amber-700 dark:text-amber-300 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs text-foreground">
                    <span className="font-bold text-amber-950 dark:text-amber-100 block">
                      Data Anak Usia 0–6 Tahun Belum Bersekolah
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      Daftar anak usia dini yang belum mengikuti layanan PAUD hasil pendataan kader/pengurus di lingkungan {komunitas.nama}. Gunakan tombol <strong>Tambah Data Anak Belum Bersekolah</strong> untuk mendaftarkan balita baru.
                    </p>
                  </div>
                </div>
              )}

              {/* LIST KARTU DATA ANAK */}
              <div className="space-y-2.5 pb-16">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="text-xs font-bold uppercase text-foreground tracking-wider flex items-center gap-1.5">
                    <span>DAFTAR RINCIAN ANAK</span>
                    <span className="font-mono text-muted-foreground">
                      ({displayedChildren.length} DATA)
                    </span>
                  </h3>
                  <span className="text-xs font-mono font-bold text-muted-foreground">
                    {displayedChildren.length} dari total {totalChildren} anak
                  </span>
                </div>

                {displayedChildren.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-10 text-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <Baby className="h-6 w-6" />
                    </div>
                    <div className="space-y-1 max-w-sm">
                      <h4 className="text-sm font-bold tracking-tight text-foreground">
                        Belum Ada Data Anak Ditampilkan
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {dataFilterTab === "bersekolah"
                          ? "Belum ada anak yang bersekolah PAUD tercatat di wilayah ini."
                          : dataFilterTab === "belum_bersekolah"
                          ? "Belum ada anak yang dicatat sebagai belum bersekolah."
                          : "Belum ada data anak balita / PAUD 0–6 tahun yang terdata di komunitas ini."}
                      </p>
                    </div>
                  </div>
                ) : (
                  displayedChildren.map((child) => (
                    <CardDataAnak
                      key={child.id}
                      anak={child}
                      komunitas={komunitas}
                      canValidate={isPaud && canValidate}
                      canEdit={isPaud ? canEdit : !child.is_sekolah && canEdit}
                      canDelete={isPaud ? canDelete : !child.is_sekolah && canDelete}
                      isReadOnly={isReadOnly}
                      onUpdate={(updated) => {
                        setChildrenList((prev) =>
                          prev.map((c) => (c.id === updated.id ? updated : c))
                        );
                      }}
                      onDelete={(deletedId) => {
                        setChildrenList((prev) =>
                          prev.filter((c) => c.id !== deletedId)
                        );
                      }}
                    />
                  ))
                )}
              </div>
            </>
          ) : (
            /* BLOK AKSES TERBATAS UNTUK PENGUNJUNG / TAMU BELUM TEREGISTRASI */
            <div className="rounded-lg border border-border bg-card p-6 text-center space-y-4 shadow-sm">
              <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-lg bg-secondary/15 border border-secondary/30 text-secondary shadow-2xs">
                <Lock className="h-7 w-7" />
              </div>

              <div className="space-y-1.5 max-w-lg mx-auto">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground border border-border">
                  <ShieldAlert className="h-3.5 w-3.5 text-secondary" />
                  <span>Privasi &amp; Perlindungan Data Anak</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  Akses Rincian Identitas Anak Terkunci
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Sesuai ketentuan perlindungan privasi data, rincian identitas lengkap hanya dapat diakses oleh Admin di Komunitas Warga Kita, Admin PAUD, Admin Posyandu, dan Admin PKBM / SKB. Anda tetap dapat meninjau statistik pada tab <strong>Rekapitulasi &amp; Grafik Diagram</strong>.
                </p>
              </div>

              <div className="pt-2 max-w-md mx-auto">
                {!isAuthenticated ? (
                  <div className="space-y-3 bg-muted/30 border border-border rounded-lg p-4 text-left">
                    <p className="text-xs text-foreground font-semibold leading-relaxed">
                      Silakan masuk atau daftar akun JARIMAS-ID untuk mengakses fitur komunitas lengkap:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <Link
                        href={`/login?redirect=/komunitas/${komunitas.id}/data`}
                        className="flex-1 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
                      >
                        <LogIn className="h-3.5 w-3.5" />
                        <span>Masuk ke Akun</span>
                      </Link>
                      <Link
                        href={`/register?redirect=/komunitas/${komunitas.id}/data`}
                        className="flex-1 inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-card hover:bg-muted border border-border text-foreground text-xs font-bold transition-all active:scale-[0.98]"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span>Daftar Akun</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 bg-muted/30 border border-border rounded-lg p-4 text-left">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="h-4 w-4 text-secondary shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground leading-relaxed">
                        Status peran Anda saat ini di komunitas ini adalah <strong>{effectiveRole}</strong>. Rincian identitas individu anak hanya dapat diakses oleh Admin atau Pengurus Komunitas yang berwenang demi keamanan anak.
                      </p>
                    </div>
                    <Link
                      href={`/komunitas/${komunitas.id}`}
                      className="w-full inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
                    >
                      <span>Buka Halaman Komunitas &amp; Kelola Peran</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. MODAL PENDAFTARAN ANAK */}
      {isAddModalOpen && canCreate && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-xl sm:rounded-lg border border-border bg-card shadow-xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
            {/* Header Modal */}
            <div className="flex items-start justify-between p-4 pb-3 border-b border-border/60 shrink-0 bg-card">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  {isPaud ? (
                    <GraduationCap className="h-4.5 w-4.5" />
                  ) : (
                    <Baby className="h-4.5 w-4.5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground leading-tight">
                    {isPaud
                      ? "Pendaftaran Peserta Didik PAUD Baru (0–6 Thn)"
                      : "Pendaftaran Data Anak Belum Bersekolah (0–6 Thn)"}
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground line-clamp-1">
                    {komunitas.nama}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-4 sm:p-5 pb-12 overflow-y-auto flex-1 overscroll-contain bg-background">
              <FormDataAnak
                komunitasId={komunitas.id}
                komunitasNama={komunitas.nama}
                jenisKomunitas={komunitas.jenis}
                komunitas={komunitas}
                onSuccess={() => {
                  setIsAddModalOpen(false);
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
