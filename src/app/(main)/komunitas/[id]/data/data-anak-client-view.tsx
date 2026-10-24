"use client";

import { useState } from "react";
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
} from "lucide-react";
import { CardDataAnak } from "@/components/data-anak/card-data-anak";
import { FormDataAnak } from "@/components/data-anak/form-data-anak";
import { isKomunitasLayananPaud } from "@/lib/data-anak-helpers";
import type { KomunitasWithMembership, DataAnakItem } from "@/types/database";
import { cn } from "@/lib/utils";

interface DataAnakClientViewProps {
  komunitas: KomunitasWithMembership;
  initialChildren: DataAnakItem[];
  stats?: {
    total: number;
    approved: number;
    pending: number;
  };
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

  const effectiveRole = userRole || komunitas.currentUserMembership?.peran || "Pengunjung";
  const isWargaKita = komunitas.jenis === "warga_kita";
  const isPaud = isKomunitasLayananPaud(komunitas, komunitas.nama, komunitas.jenis);
  const isPosyandu = komunitas.jenis === "posyandu";

  const totalChildren = stats?.total ?? childrenList.length;
  const totalApproved = stats?.approved ?? childrenList.filter(
    (c) => c.status_approval === "approved"
  ).length;
  const totalPending = stats?.pending ?? (totalChildren - totalApproved);

  const filteredChildren = childrenList.filter(
    (c) =>
      c.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nama_orangtua.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5">
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
              Hak Akses Terbatas ({effectiveRole}): Tinjauan Statistik
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Sesuai ketentuan, status {effectiveRole} memiliki akses membaca data dan statistik. Penambahan data anak dan validasi warga RT dilakukan oleh Warga Penduduk atau Pengurus RT.
            </p>
          </div>
        </div>
      )}

      {/* 2. STATISTIC METRIC CARDS (Dapat dilihat untuk statistik agregat) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-card p-4 text-center space-y-1 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            TOTAL DATA ANAK
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-foreground">
            {totalChildren}
          </span>
          <span className="text-xs font-semibold text-muted-foreground block">
            {isPaud ? "Siswa Terdata" : "Balita Terdaftar"}
          </span>
        </div>

        <div className="rounded-lg border border-teal-500/20 bg-teal-500/10 p-4 text-center space-y-1 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300 block">
            TERVERIFIKASI
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-primary">
            {totalApproved}
          </span>
          <span className="text-xs font-semibold text-teal-800 dark:text-teal-300 block">
            {isWargaKita ? "Tervalidasi Warga RT" : "Tervalidasi Kader/RT"}
          </span>
        </div>

        <div className="rounded-lg border border-secondary/30 bg-secondary/15 p-4 text-center space-y-1 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 block">
            MENUNGGU VALIDASI
          </span>
          <span className="text-2xl sm:text-3xl font-bold font-mono text-secondary">
            {totalPending}
          </span>
          <span className="text-xs font-semibold text-amber-900 dark:text-amber-200 block">
            Perlu Verifikasi
          </span>
        </div>
      </div>

      {/* 3. KONTEN BERDASARKAN HAK AKSES (DETAIL & PENCARIAN ATAU PESAN TERBATAS) */}
      {canViewDetail ? (
        <>
          {/* SEARCH & ADD BUTTON */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama anak atau orang tua..."
                className="w-full h-10 rounded-lg border border-border bg-background pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-hidden"
              />
            </div>

            {canCreate && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover active:scale-[0.98] text-primary-foreground px-4 text-xs font-bold shadow-xs transition-all shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>TAMBAH DATA ANAK</span>
              </button>
            )}
          </div>

          {/* LIST DATA ANAK */}
          <div className="space-y-2 sm:space-y-2.5 pb-16">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <h3 className="text-xs font-bold uppercase text-foreground tracking-wider">
                DAFTAR RINCIAN ANAK ({filteredChildren.length} DATA)
              </h3>
              <span className="text-xs font-mono font-bold text-muted-foreground">
                {filteredChildren.length} dari total {totalChildren} anak
              </span>
            </div>

            {filteredChildren.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-10 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                  <Baby className="h-6 w-6" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-sm font-bold tracking-tight text-foreground">
                    Belum Ada Data Anak
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isPaud
                      ? "Admin, Kepala Sekolah, dan Guru PAUD dapat menambahkan siswa terdaftar di satuan PAUD ini."
                      : "Daftarkan data balita / PAUD 0–6 tahun pertama untuk pendataan dan verifikasi wilayah."}
                  </p>
                </div>
              </div>
            ) : (
              filteredChildren.map((child) => (
                <CardDataAnak
                  key={child.id}
                  anak={child}
                  komunitas={komunitas}
                  canValidate={canValidate}
                  canEdit={canEdit}
                  canDelete={canDelete}
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
        /* 4. BLOK AKSES TERBATAS UNTUK PENGUNJUNG & PENGGUNA BELUM TEREGISTRASI */
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
              Akses Rincian Data Anak &amp; Pencarian Terkunci
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sesuai ketentuan perlindungan privasi data, rincian identitas lengkap hanya dapat diakses di <strong>Tingkat KELURAHAN</strong> oleh <strong>Admin di Komunitas Warga Kita</strong>, <strong>Admin PAUD</strong>, <strong>Admin Posyandu</strong> dan <strong>Admin PKBM dan SKB</strong>.
            </p>
          </div>

          <div className="pt-2 max-w-md mx-auto">
            {!isAuthenticated ? (
              <div className="space-y-3 bg-muted/30 border border-border rounded-lg p-4 text-left">
                <p className="text-xs text-foreground font-semibold leading-relaxed">
                  Anda belum masuk ke akun JARIMAS-ID. Silakan masuk atau buat akun baru untuk mengakses data komunitas:
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
                    Status peran Anda saat ini di komunitas ini adalah <strong>{effectiveRole}</strong>. Data lengkap rincian identitas anak hanya dapat diakses oleh Admin Komunitas yang berwenang demi perlindungan privasi anak dan keluarga.
                  </p>
                </div>
                <Link
                  href={`/komunitas/${komunitas.id}`}
                  className="w-full inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
                >
                  <span>Buka Halaman Komunitas &amp; Gabung</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. MODAL PENDAFTARAN ANAK (Hanya jika memiliki akses membuat) */}
      {isAddModalOpen && canCreate && canViewDetail && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-xl sm:rounded-lg border border-border bg-card shadow-xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-4 pb-3 border-b border-border/60 shrink-0 bg-card">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
                  <Baby className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground leading-tight">
                    Pendaftaran Data Anak (0–6 Thn)
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
