"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  GraduationCap,
  HeartPulse,
  Building2,
  Home,
  ShieldAlert,
  HeartHandshake,
  ShieldCheck,
  Users,
  Search,
  ArrowRight,
  UserPlus,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Info,
  Layers,
} from "lucide-react";
import { JoinKomunitasModal } from "@/components/komunitas/join-komunitas-modal";
import type { KomunitasWithMembership } from "@/types/database";
import { SEED_SPM_TEGAL } from "@/lib/constants/tegal-data";
import { cn } from "@/lib/utils";

interface SpmKomunitasSectionProps {
  komunitasList: KomunitasWithMembership[];
  currentUserId?: string | null;
  initialSearch?: string;
}

interface SpmFieldMeta {
  id: string;
  nama: string;
  shortTitle: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  colorTheme: {
    bg: string;
    border: string;
    hoverBorder: string;
    iconBg: string;
    iconColor: string;
    buttonBg: string;
    badgeBg: string;
  };
  dasarHukum: string;
  targetLayanan: string;
  instansi: string;
  lokasi: string;
}

const SPM_FIELDS_DATA: SpmFieldMeta[] = [
  {
    id: "kom-spm-pendidikan",
    nama: "Komunitas Bidang Pendidikan",
    shortTitle: "Pendidikan",
    tagline: "Pemenuhan Hak Pendidikan Anak Usia Dini, Pendidikan Dasar & Penanganan ATS",
    icon: GraduationCap,
    colorTheme: {
      bg: "bg-indigo-50/70 dark:bg-indigo-950/30",
      border: "border-indigo-200 dark:border-indigo-800/80",
      hoverBorder: "hover:border-indigo-500",
      iconBg: "bg-indigo-600 text-white",
      iconColor: "text-indigo-600",
      buttonBg: "bg-indigo-600 hover:bg-indigo-700",
      badgeBg: "bg-indigo-100 text-indigo-800 border-indigo-200",
    },
    dasarHukum: "Permendikbudristek No. 32 Tahun 2022",
    targetLayanan: "Pendidikan Anak Usia Dini (PAUD), SD, SMP, & Kesetaraan PKBM",
    instansi: "Dinas Pendidikan dan Kebudayaan Kota Tegal",
    lokasi: "Jl. Ki Gede Sebayu No. 1, Kota Tegal",
  },
  {
    id: "kom-spm-kesehatan",
    nama: "Komunitas Bidang Kesehatan",
    shortTitle: "Kesehatan",
    tagline: "Pelayanan Kesehatan Ibu Hamil, Balita Bebas Stunting, DDTK & Usia Produktif",
    icon: HeartPulse,
    colorTheme: {
      bg: "bg-emerald-50/70 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800/80",
      hoverBorder: "hover:border-emerald-500",
      iconBg: "bg-emerald-600 text-white",
      iconColor: "text-emerald-600",
      buttonBg: "bg-emerald-600 hover:bg-emerald-700",
      badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    dasarHukum: "Permenkes No. 4 Tahun 2019",
    targetLayanan: "Kesehatan Ibu Hamil, Balita, Balita Stunting, Imunisasi & Lansia",
    instansi: "Dinas Kesehatan Kota Tegal",
    lokasi: "Jl. Hang Tuah No. 1, Kota Tegal",
  },
  {
    id: "kom-spm-pekerjaan-umum",
    nama: "Komunitas Bidang Pekerjaan Umum",
    shortTitle: "Pekerjaan Umum",
    tagline: "Akses Air Minum Layak, Sanitasi Sehat Lingkungan & Drainase Ramah Keluarga",
    icon: Building2,
    colorTheme: {
      bg: "bg-blue-50/70 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800/80",
      hoverBorder: "hover:border-blue-500",
      iconBg: "bg-blue-600 text-white",
      iconColor: "text-blue-600",
      buttonBg: "bg-blue-600 hover:bg-blue-700",
      badgeBg: "bg-blue-100 text-blue-800 border-blue-200",
    },
    dasarHukum: "Permen PUPR No. 29/PRT/M/2018",
    targetLayanan: "Penyediaan Air Minum Curah & Pengelolaan Air Limbah Domestik",
    instansi: "DPUPR Kota Tegal",
    lokasi: "Jl. Proklamasi No. 1, Kota Tegal",
  },
  {
    id: "kom-spm-perumahan-rakyat",
    nama: "Komunitas Bidang Perumahan Rakyat",
    shortTitle: "Perumahan Rakyat",
    tagline: "Rehabilitasi Rumah Tidak Layak Huni (RTLH) & Kawasan Permukiman Sehat",
    icon: Home,
    colorTheme: {
      bg: "bg-sky-50/70 dark:bg-sky-950/30",
      border: "border-sky-200 dark:border-sky-800/80",
      hoverBorder: "hover:border-sky-500",
      iconBg: "bg-sky-600 text-white",
      iconColor: "text-sky-600",
      buttonBg: "bg-sky-600 hover:bg-sky-700",
      badgeBg: "bg-sky-100 text-sky-800 border-sky-200",
    },
    dasarHukum: "Permen PUPR No. 22/PRT/M/2018",
    targetLayanan: "Penyediaan & Rehabilitasi Rumah Layak Huni bagi Korban & Warga Relokasi",
    instansi: "Disperkim Kota Tegal",
    lokasi: "Jl. Ki Gede Sebayu No. 12, Kota Tegal",
  },
  {
    id: "kom-spm-trantibumlinmas",
    nama: "Komunitas Bidang Trantibumlinmas",
    shortTitle: "Trantibumlinmas",
    tagline: "Ketenteraman, Ketertiban Umum, Keamanan Lingkungan & Perlindungan Warga",
    icon: ShieldAlert,
    colorTheme: {
      bg: "bg-amber-50/70 dark:bg-amber-950/30",
      border: "border-amber-200 dark:border-amber-800/80",
      hoverBorder: "hover:border-amber-500",
      iconBg: "bg-amber-600 text-white",
      iconColor: "text-amber-600",
      buttonBg: "bg-amber-600 hover:bg-amber-700",
      badgeBg: "bg-amber-100 text-amber-900 border-amber-200",
    },
    dasarHukum: "Permendagri No. 121 Tahun 2018",
    targetLayanan: "Pelayanan Ketenteraman Masyarakat & Kesiapsiagaan Bencana",
    instansi: "Satpol PP & Linmas Kota Tegal",
    lokasi: "Jl. Ki Gede Sebayu No. 5, Kota Tegal",
  },
  {
    id: "kom-spm-sosial",
    nama: "Komunitas Bidang Sosial",
    shortTitle: "Sosial",
    tagline: "Perlindungan Sosial, Penanganan PPKS, Bantuan Terpadu & Keluarga Rentan",
    icon: HeartHandshake,
    colorTheme: {
      bg: "bg-teal-50/70 dark:bg-teal-950/30",
      border: "border-teal-200 dark:border-teal-800/80",
      hoverBorder: "hover:border-teal-500",
      iconBg: "bg-teal-700 text-white",
      iconColor: "text-teal-700",
      buttonBg: "bg-teal-700 hover:bg-teal-800",
      badgeBg: "bg-teal-100 text-teal-900 border-teal-200",
    },
    dasarHukum: "Permensos No. 9 Tahun 2018",
    targetLayanan: "Rehabilitasi Sosial Dasar & Bantuan Korban Bencana/PPKS",
    instansi: "Dinas Sosial Kota Tegal",
    lokasi: "Jl. Sipelem No. 2, Kota Tegal",
  },
];

export function SpmKomunitasSection({
  komunitasList,
  currentUserId,
  initialSearch = "",
}: SpmKomunitasSectionProps) {
  const [search, setSearch] = useState(initialSearch);
  const [selectedKomunitasForJoin, setSelectedKomunitasForJoin] =
    useState<KomunitasWithMembership | null>(null);

  // Map data database/seed komunitas ke daftar SPM
  const mergedSpmList = useMemo(() => {
    return SPM_FIELDS_DATA.map((meta) => {
      const foundInDb = komunitasList.find(
        (k) =>
          k.id === meta.id ||
          k.nama.toLowerCase().includes(meta.shortTitle.toLowerCase())
      );
      const seedItem = SEED_SPM_TEGAL.find((s) => s.id === meta.id);

      const komunitasObj: KomunitasWithMembership = foundInDb || {
        id: meta.id,
        nama: seedItem?.nama || meta.nama,
        jenis: "bidang_spm",
        lokasi: seedItem?.lokasi || meta.lokasi,
        deskripsi: seedItem?.deskripsi || meta.tagline,
        kontak: seedItem?.kontak || null,
        jadwal: seedItem?.jadwal || null,
        jumlah_anggota: 0,
        currentUserMembership: undefined,
      };

      return {
        meta,
        komunitas: komunitasObj,
      };
    });
  }, [komunitasList]);

  // Filter pencarian
  const filteredList = useMemo(() => {
    if (!search.trim()) return mergedSpmList;
    const q = search.toLowerCase();
    return mergedSpmList.filter(
      (item) =>
        item.meta.nama.toLowerCase().includes(q) ||
        item.meta.tagline.toLowerCase().includes(q) ||
        item.meta.instansi.toLowerCase().includes(q) ||
        item.meta.targetLayanan.toLowerCase().includes(q)
    );
  }, [mergedSpmList, search]);

  const handleOpenJoin = (kom: KomunitasWithMembership) => {
    if (!currentUserId) {
      window.location.href = `/login?redirectTo=/komunitas/${kom.id}`;
      return;
    }
    setSelectedKomunitasForJoin(kom);
  };

  return (
    <div className="space-y-6">
      {/* 1. OVERVIEW BANNER STANDAR PELAYANAN MINIMAL (SPM) */}
      <div className="rounded-3xl border-2 border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-900 via-slate-900 to-indigo-950 text-white p-5 sm:p-7 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full bg-teal-500/20 border border-teal-400/40 px-3 py-0.5 text-xs font-bold text-teal-300 backdrop-blur-xs">
                PP NO. 2 TAHUN 2018
              </span>
              <span className="text-xs font-bold text-slate-300 font-mono">
                URUSAN PEMERINTAHAN WAJIB
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Komunitas 6 Bidang Standar Pelayanan Minimal (SPM)
            </h3>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              Wadah koordinasi, pendataan, verifikasi faktual, dan pemantauan terpadu pemenuhan jenis dan mutu pelayanan dasar bagi seluruh warga Kota Tegal.
            </p>
          </div>

          <div className="shrink-0 flex sm:flex-col items-center gap-2">
            <div className="px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs text-center">
              <span className="text-xl font-black block font-mono text-teal-300">
                6
              </span>
              <span className="text-[10px] text-slate-200 uppercase font-bold">
                Bidang SPM
              </span>
            </div>
          </div>
        </div>

        {/* 5 PILIHAN PERAN DI BIDANG SPM */}
        <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-2 text-2xs sm:text-xs">
          <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
            <span className="font-extrabold block text-teal-300">1. Tim Pembina</span>
            <span className="text-slate-300 text-[10px]">Pengarah &amp; Kebijakan SPM</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
            <span className="font-extrabold block text-teal-300">2. Pendamping</span>
            <span className="text-slate-300 text-[10px]">Fasilitator &amp; Calon Admin</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
            <span className="font-extrabold block text-teal-300">3. Kader</span>
            <span className="text-slate-300 text-[10px]">Pelaksana &amp; Pelapor Faktual</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 border border-white/10">
            <span className="font-extrabold block text-teal-300">4. Mitra</span>
            <span className="text-slate-300 text-[10px]">Kolaborator Lembaga/CSO</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 col-span-2 sm:col-span-1">
            <span className="font-extrabold block text-teal-300">5. Pengunjung</span>
            <span className="text-slate-300 text-[10px]">Akses Awal Sebelum Verifikasi</span>
          </div>
        </div>
      </div>

      {/* 2. SEARCH BAR PENCARIAN BIDANG SPM */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari bidang SPM (misal: Pendidikan, Kesehatan, Air Minum, RTLH, Linmas, Sosial)..."
          className="w-full min-h-[44px] h-11 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-11 pr-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-teal-600 focus:outline-hidden transition-all shadow-xs"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            Hapus
          </button>
        )}
      </div>

      {/* 3. LIST 6 KARTU BIDANG SPM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredList.map(({ meta, komunitas }) => {
          const Icon = meta.icon;
          const membership = komunitas.currentUserMembership;
          const isApprovedMember = membership?.status === "approved";
          const isPending = Boolean(membership?.peran_diajukan);

          return (
            <div
              key={meta.id}
              className={cn(
                "rounded-3xl border-2 p-4 sm:p-5 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between gap-4 bg-white dark:bg-slate-900",
                meta.colorTheme.border,
                meta.colorTheme.hoverBorder
              )}
            >
              {/* Top Header Card */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-bold shadow-md",
                        meta.colorTheme.iconBg
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          SPM KOTA TEGAL
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.2 rounded-md border",
                            meta.colorTheme.badgeBg
                          )}
                        >
                          {meta.dasarHukum}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                        {meta.nama}
                      </h4>
                    </div>
                  </div>

                  {/* Membership Status Badge */}
                  {membership && (
                    <div className="shrink-0">
                      {isApprovedMember && !isPending && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{membership.peran.toUpperCase()}</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 text-[11px] font-bold text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          <span>AJUAN: {membership.peran_diajukan?.toUpperCase()}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {meta.tagline}
                </p>

                {/* Info Detail Box */}
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 p-3 space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <strong className="text-slate-900 dark:text-slate-100">Fokus Sasaran:</strong>{" "}
                      <span>{meta.targetLayanan}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="truncate">{meta.instansi} • {meta.lokasi}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href={`/komunitas/${komunitas.id}`}
                  className={cn(
                    "flex-1 inline-flex min-h-[42px] h-10.5 items-center justify-center gap-1.5 rounded-xl border-2 px-4 text-xs font-bold transition-all shadow-2xs active:scale-98",
                    isApprovedMember
                      ? `${meta.colorTheme.buttonBg} text-white border-transparent`
                      : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                  )}
                >
                  <span>Kunjungi Halaman Bidang</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                {!isApprovedMember && (
                  <button
                    type="button"
                    onClick={() => handleOpenJoin(komunitas)}
                    className={cn(
                      "inline-flex min-h-[42px] h-10.5 items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-bold text-white transition-all shadow-xs cursor-pointer active:scale-98 shrink-0",
                      meta.colorTheme.buttonBg
                    )}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Gabung</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Join Community Modal */}
      {selectedKomunitasForJoin && (
        <JoinKomunitasModal
          komunitas={selectedKomunitasForJoin}
          isOpen={Boolean(selectedKomunitasForJoin)}
          onClose={() => setSelectedKomunitasForJoin(null)}
          onSuccess={() => {
            setSelectedKomunitasForJoin(null);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
