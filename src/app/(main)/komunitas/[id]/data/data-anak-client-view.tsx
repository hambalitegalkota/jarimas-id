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
  canEditDdks: boolean;
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
  canEditDdks,
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
  const isPaud = komunitas.jenis === "satuan_paud";
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
      {/* 1. Notice Banner untuk Peran Read-Only di Satuan PAUD (Orangtua/Wali Murid, Komite, Alumni, Pengunjung) */}
      {isPaud && isReadOnly && canViewDetail && (
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/80 p-4 sm:p-5 flex items-start gap-3 text-blue-950 shadow-xs">
          <Eye className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-blue-950">
              Mode Akses: Tinjauan Siswa ({effectiveRole})
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Sebagai {effectiveRole} di Satuan PAUD ini, Anda memiliki akses melihat (Read-Only) data profil siswa dan riwayat DDTK secara transparan. Pembuatan, pengeditan, dan pengelolaan status siswa dikelola oleh Admin, Kepala Sekolah, dan Guru PAUD.
            </p>
          </div>
        </div>
      )}

      {/* Notice Banner untuk Pengunjung di Warga Kita */}
      {isWargaKita && isReadOnly && canViewDetail && (
        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-4 sm:p-5 flex items-start gap-3 text-amber-950 shadow-xs">
          <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm sm:text-base font-bold text-amber-950">
              Hak Akses Terbatas ({effectiveRole}): Tinjauan Statistik
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              Sesuai ketentuan, status {effectiveRole} memiliki akses membaca data dan statistik. Penambahan data anak dan validasi warga RT dilakukan oleh Warga Penduduk atau Pengurus RT.
            </p>
          </div>
        </div>
      )}

      {/* 2. STATISTIC METRIC CARDS (Dapat dilihat untuk statistik agregat) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 text-center space-y-1.5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
            TOTAL DATA ANAK
          </span>
          <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900">
            {totalChildren}
          </span>
          <span className="text-sm font-semibold text-slate-600 block">
            {isPaud ? "Siswa Terdata" : "Balita Terdaftar"}
          </span>
        </div>

        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-5 text-center space-y-1.5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
            TERVERIFIKASI
          </span>
          <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-700">
            {totalApproved}
          </span>
          <span className="text-sm font-semibold text-emerald-800 block">
            {isWargaKita ? "Tervalidasi Warga RT" : "Tervalidasi Kader/RT"}
          </span>
        </div>

        <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-5 text-center space-y-1.5 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 block">
            MENUNGGU VALIDASI
          </span>
          <span className="text-3xl sm:text-4xl font-black font-mono text-amber-700">
            {totalPending}
          </span>
          <span className="text-sm font-semibold text-amber-900 block">
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
              <Search className="pointer-events-none absolute left-4 top-4 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama anak atau orang tua..."
                className="w-full min-h-[50px] h-13 rounded-2xl border-2 border-slate-300 bg-white pl-12 pr-4 text-base text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden"
              />
            </div>

            {canCreate && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex min-h-[50px] h-13 items-center justify-center gap-2 rounded-2xl bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white px-6 text-base font-bold shadow-md transition-all shrink-0 cursor-pointer"
              >
                <Plus className="h-5 w-5" />
                <span>TAMBAH DATA ANAK</span>
              </button>
            )}
          </div>

          {/* LIST DATA ANAK */}
          <div className="space-y-4 pb-16">
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase text-slate-600 tracking-wider">
                DAFTAR RINCIAN ANAK ({filteredChildren.length} DATA)
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500">
                {filteredChildren.length} dari total {totalChildren} anak
              </span>
            </div>

            {filteredChildren.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-12 text-center space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-700">
                  <Baby className="h-7 w-7" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-base font-bold tracking-tight text-slate-900">
                    Belum Ada Data Anak
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {isPaud
                      ? "Admin, Kepala Sekolah, dan Guru PAUD dapat menambahkan siswa terdaftar di satuan PAUD ini."
                      : "Daftarkan data balita / PAUD 0–6 tahun pertama untuk pemantauan tumbuh kembang dan verifikasi wilayah."}
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
                  canEditDdks={canEditDdks}
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
        <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 text-center space-y-5 shadow-sm">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-amber-50 border-2 border-amber-200 text-amber-700 shadow-xs">
            <Lock className="h-8 w-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              <span>Privasi &amp; Perlindungan Data Anak</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Akses Rincian Data Anak &amp; Pencarian Terkunci
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Sesuai dengan ketentuan perlindungan privasi dan keamanan data anak, pencarian data serta daftar rincian identitas anak (nama lengkap, orang tua/wali, alamat KK, domisili, dan rekam medis tumbuh kembang DDTK) hanya dapat diakses oleh <strong>anggota terdaftar dan terverifikasi</strong> di {komunitas.nama}.
            </p>
          </div>

          <div className="pt-2 max-w-md mx-auto">
            {!isAuthenticated ? (
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-left">
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  Anda belum masuk ke akun JARIMAS-ID. Silakan masuk atau buat akun baru untuk mengakses data komunitas:
                </p>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <Link
                    href={`/login?redirect=/komunitas/${komunitas.id}/data`}
                    className="flex-1 inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow-xs transition-all active:scale-[0.98]"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>Masuk ke Akun</span>
                  </Link>
                  <Link
                    href={`/register?redirect=/komunitas/${komunitas.id}/data`}
                    className="flex-1 inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-100 border-2 border-slate-300 text-slate-800 text-sm font-bold transition-all active:scale-[0.98]"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Daftar Akun</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 text-left">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-700 leading-relaxed">
                    Status akun Anda saat ini di komunitas ini adalah <strong>Pengunjung</strong>. Silakan ajukan keanggotaan resmi (misal: <em>Orang Tua/Wali Murid</em>, <em>Pendidik/Guru</em>, <em>Penduduk RT</em>, atau <em>Kader</em>) untuk membuka akses rincian data anak.
                  </p>
                </div>
                <Link
                  href={`/komunitas/${komunitas.id}`}
                  className="w-full inline-flex min-h-[44px] h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-sm font-bold shadow-xs transition-all active:scale-[0.98]"
                >
                  <span>Buka Halaman Komunitas &amp; Gabung</span>
                  <ArrowRight className="h-4 w-4" />
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

          <div className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-4 border-b-2 border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Baby className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 leading-tight">
                    Pendaftaran Data Anak (0–6 Thn)
                  </h3>
                  <p className="text-sm font-medium text-slate-500 line-clamp-1">
                    {komunitas.nama}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-4 sm:p-6 pb-12 overflow-y-auto flex-1 overscroll-contain bg-slate-50/50">
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
