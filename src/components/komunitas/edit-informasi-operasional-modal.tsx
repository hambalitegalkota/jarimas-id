"use client";

import { useState, useTransition } from "react";
import {
  X,
  Edit3,
  MapPin,
  Calendar,
  Phone,
  Info,
  GraduationCap,
  HeartPulse,
  Wrench,
  Home,
  ShieldCheck,
  Users,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { updateKomunitasInformasiOperasional } from "@/app/actions/komunitas";
import {
  parseKontakKomunitas,
  parseJadwalPosyandu,
  serializeJadwalPosyandu,
  parseCakupanWilayah,
} from "@/lib/utils";
import type {
  KomunitasWithMembership,
  KontakKomunitasDetail,
} from "@/types/database";
import { cn } from "@/lib/utils";

interface EditInformasiOperasionalModalProps {
  komunitas: KomunitasWithMembership;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updated: {
    lokasi: string;
    cakupan_wilayah?: string;
    jadwal?: string | null;
    deskripsi?: string | null;
    kontak?: string | null;
  }) => void;
}

export function EditInformasiOperasionalModal({
  komunitas,
  isOpen,
  onClose,
  onSuccess,
}: EditInformasiOperasionalModalProps) {
  const initialKontak = parseKontakKomunitas(komunitas.kontak);
  const initialCakupan = parseCakupanWilayah(komunitas);
  const initialJadwalPosyandu = parseJadwalPosyandu(komunitas.jadwal);

  const [lokasi, setLokasi] = useState(komunitas.lokasi || "");
  const [cakupanWilayah, setCakupanWilayah] = useState(
    komunitas.cakupan_wilayah || initialKontak.cakupan_wilayah || initialCakupan || ""
  );

  // Jadwal Umum (Non-Posyandu)
  const [jadwal, setJadwal] = useState(komunitas.jadwal || "");

  // Jadwal Posyandu Siklus Hidup (ILP)
  const [jadwalBalita, setJadwalBalita] = useState(initialJadwalPosyandu.balita);
  const [jadwalLansia, setJadwalLansia] = useState(initialJadwalPosyandu.lansia);
  const [jadwalRemaja, setJadwalRemaja] = useState(initialJadwalPosyandu.remaja);

  const [deskripsi, setDeskripsi] = useState(komunitas.deskripsi || "");
  const [kontakUtama, setKontakUtama] = useState(initialKontak.utama || "");

  // 6 Bidang SPM Kader
  const [kaderPendidikan, setKaderPendidikan] = useState(initialKontak.kader_pendidikan);
  const [kaderKesehatan, setKaderKesehatan] = useState(initialKontak.kader_kesehatan);
  const [kaderPekerjaanUmum, setKaderPekerjaanUmum] = useState(initialKontak.kader_pekerjaan_umum);
  const [kaderPerumahanRakyat, setKaderPerumahanRakyat] = useState(initialKontak.kader_perumahan_rakyat);
  const [kaderTrantipbumlinmas, setKaderTrantipbumlinmas] = useState(initialKontak.kader_trantipbumlinmas);
  const [kaderSosial, setKaderSosial] = useState(initialKontak.kader_sosial);

  const [activeTab, setActiveTab] = useState<"umum" | "kader_spm">("umum");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const finalJadwal =
      komunitas.jenis === "posyandu"
        ? serializeJadwalPosyandu({
            balita: jadwalBalita,
            lansia: jadwalLansia,
            remaja: jadwalRemaja,
          })
        : jadwal.trim();

    const fullKontakDetail: KontakKomunitasDetail = {
      utama: kontakUtama.trim(),
      cakupan_wilayah: cakupanWilayah.trim(),
      kader_pendidikan: {
        nama: kaderPendidikan.nama.trim(),
        wa: kaderPendidikan.wa.trim(),
      },
      kader_kesehatan: {
        nama: kaderKesehatan.nama.trim(),
        wa: kaderKesehatan.wa.trim(),
      },
      kader_pekerjaan_umum: {
        nama: kaderPekerjaanUmum.nama.trim(),
        wa: kaderPekerjaanUmum.wa.trim(),
      },
      kader_perumahan_rakyat: {
        nama: kaderPerumahanRakyat.nama.trim(),
        wa: kaderPerumahanRakyat.wa.trim(),
      },
      kader_trantipbumlinmas: {
        nama: kaderTrantipbumlinmas.nama.trim(),
        wa: kaderTrantipbumlinmas.wa.trim(),
      },
      kader_sosial: {
        nama: kaderSosial.nama.trim(),
        wa: kaderSosial.wa.trim(),
      },
    };

    startTransition(async () => {
      const res = await updateKomunitasInformasiOperasional({
        komunitasId: komunitas.id,
        lokasi: lokasi.trim(),
        cakupan_wilayah: cakupanWilayah.trim(),
        jadwal: finalJadwal,
        deskripsi: deskripsi.trim(),
        kontakDetail: fullKontakDetail,
      });

      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message || "Informasi operasional berhasil diperbarui!",
        });
        onSuccess?.({
          lokasi: lokasi.trim(),
          cakupan_wilayah: cakupanWilayah.trim(),
          jadwal: finalJadwal,
          deskripsi: deskripsi.trim(),
          kontak: JSON.stringify(fullKontakDetail),
        });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Gagal menyimpan perubahan.",
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity"
        onClick={() => !isPending && onClose()}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[88dvh] flex flex-col rounded-t-lg sm:rounded-lg border border-border bg-card shadow-xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-5 pb-3.5 border-b border-border shrink-0 bg-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground leading-tight">
                  Edit Informasi &amp; Operasional
                </h3>
                <span className="text-2xs font-extrabold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                  {komunitas.jenis === "posyandu" ? "ADMIN, PENGURUS & KADER" : "ADMIN & PENGURUS"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium line-clamp-1 mt-0.5">
                Kelola Informasi: {komunitas.nama}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isPending && onClose()}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation (Hanya tampil untuk Komunitas Posyandu karena memiliki 6 Bidang Kader SPM) */}
        {komunitas.jenis === "posyandu" && (
          <div className="px-4 sm:px-5 pt-3 bg-card shrink-0">
            <div className="flex rounded-lg bg-muted p-1 gap-1 border border-border">
              <button
                type="button"
                onClick={() => setActiveTab("umum")}
                className={cn(
                  "flex-1 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  activeTab === "umum"
                    ? "bg-card text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Info className="h-3.5 w-3.5" />
                <span>Lokasi &amp; Profil</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("kader_spm")}
                className={cn(
                  "flex-1 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  activeTab === "kader_spm"
                    ? "bg-card text-primary shadow-2xs font-extrabold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Phone className="h-3.5 w-3.5 text-primary" />
                <span>Kontak &amp; 6 Kader Bidang</span>
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 overscroll-contain bg-muted/20 text-sm">
            {/* Feedback Alerts */}
            {feedback && (
              <div
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-xs font-semibold animate-in fade-in",
                  feedback.type === "success"
                    ? "border-emerald-500/20 bg-emerald-50 text-emerald-900"
                    : "border-rose-500/20 bg-rose-50 text-rose-900"
                )}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{feedback.message}</span>
              </div>
            )}

            {/* TAB 1: INFORMASI UMUM */}
            {activeTab === "umum" && (
              <div className="space-y-4">
                {/* Alamat Lokasi */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Alamat Lokasi Gedung / Pos</span>
                    <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    placeholder="Contoh: Balai Posyandu / RW 05, Randugunting, Tegal Selatan, Kota Tegal"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-semibold focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Cakupan Wilayah Layanan (RW / RT yang dilayani) */}
                {komunitas.jenis === "posyandu" && (
                  <div className="space-y-1.5 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300 text-xs">
                        <Users className="h-4 w-4 text-emerald-600" />
                        <span>Cakupan Wilayah Layanan (RW &amp; RT yang Dilayani)</span>
                        <span className="text-destructive">*</span>
                      </label>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">
                        RW &amp; RT Sasaran
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={cakupanWilayah}
                      onChange={(e) => setCakupanWilayah(e.target.value)}
                      placeholder="Contoh: Melayani Warga RW 02 (RT 01, RT 02, RT 03, RT 04, RT 05)"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-semibold focus:border-emerald-600 focus:outline-none"
                    />
                    <p className="text-2xs text-muted-foreground font-medium">
                      Tuliskan keterangan RW dan RT berapa saja yang menjadi sasaran dan dilayani oleh posyandu ini.
                    </p>
                  </div>
                )}

                {/* Jadwal Layanan: Posyandu vs Non-Posyandu */}
                {komunitas.jenis === "posyandu" ? (
                  <div className="space-y-3 p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span className="font-bold text-foreground text-xs uppercase tracking-wide">
                          Jadwal Layanan Posyandu Terpadu
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                        Siklus Hidup (ILP)
                      </span>
                    </div>
                    <p className="text-2xs text-muted-foreground font-medium">
                      Atur jadwal kegiatan Posyandu Balita, Posyandu Lansia, dan Posyandu Remaja sesuai jadwal bulanan.
                    </p>

                    <div className="space-y-2.5 pt-0.5">
                      {/* 1. Jadwal Posyandu Balita */}
                      <div className="space-y-1 p-2.5 rounded-lg bg-card border border-border/80">
                        <label className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 text-xs">
                          <span>👶</span>
                          <span>Jadwal Posyandu Balita, Anak &amp; Ibu Hamil</span>
                        </label>
                        <input
                          type="text"
                          value={jadwalBalita}
                          onChange={(e) => setJadwalBalita(e.target.value)}
                          placeholder="Contoh: Setiap Hari Rabu Minggu ke-2 Pukul 08.30 – 11.30 WIB"
                          className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      {/* 2. Jadwal Posyandu Lansia */}
                      <div className="space-y-1 p-2.5 rounded-lg bg-card border border-border/80">
                        <label className="flex items-center gap-1.5 font-bold text-purple-900 dark:text-purple-300 text-xs">
                          <span>🧓</span>
                          <span>Jadwal Posyandu Lansia (Lanjut Usia)</span>
                        </label>
                        <input
                          type="text"
                          value={jadwalLansia}
                          onChange={(e) => setJadwalLansia(e.target.value)}
                          placeholder="Contoh: Setiap Hari Sabtu Minggu ke-1 Pukul 08.30 – 11.00 WIB"
                          className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:border-purple-600 focus:outline-none"
                        />
                      </div>

                      {/* 3. Jadwal Posyandu Remaja */}
                      <div className="space-y-1 p-2.5 rounded-lg bg-card border border-border/80">
                        <label className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-300 text-xs">
                          <span>🧑</span>
                          <span>Jadwal Posyandu Remaja &amp; Usia Produktif Muda</span>
                        </label>
                        <input
                          type="text"
                          value={jadwalRemaja}
                          onChange={(e) => setJadwalRemaja(e.target.value)}
                          placeholder="Contoh: Setiap Hari Minggu Minggu ke-3 Pukul 09.00 – 11.30 WIB"
                          className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>Jadwal Layanan / Kegiatan Rutin</span>
                    </label>
                    <input
                      type="text"
                      value={jadwal}
                      onChange={(e) => setJadwal(e.target.value)}
                      placeholder="Contoh: Setiap Hari Rabu Minggu ke-2 Pukul 08.30 – 11.30 WIB"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-semibold focus:border-primary focus:outline-none"
                    />
                  </div>
                )}

                {/* Kontak Utama / Sekretariat (untuk Komunitas Non-Posyandu) */}
                {komunitas.jenis !== "posyandu" && (
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>Kontak Pengurus Utama / Sekretariat</span>
                    </label>
                    <input
                      type="text"
                      value={kontakUtama}
                      onChange={(e) => setKontakUtama(e.target.value)}
                      placeholder="Contoh: 0813-2233-4455 / 0283-356xxx"
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm font-bold focus:border-primary focus:outline-none"
                    />
                    <p className="text-2xs text-muted-foreground font-medium">
                      Nomor telepon atau WhatsApp pengurus komunitas.
                    </p>
                  </div>
                )}

                {/* Profil & Visi */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                    <Info className="h-4 w-4 text-primary" />
                    <span>Profil &amp; Visi Layanan Komunitas</span>
                  </label>
                  <textarea
                    rows={4}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Tuliskan deskripsi layanan terpadu, visi komunitas, dan kegiatan unggulan..."
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm leading-relaxed focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: KONTAK & 6 KADER BIDANG SPM */}
            {activeTab === "kader_spm" && (
              <div className="space-y-4">
                {/* Kontak Utama / Sekretariat */}
                <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                  <label className="flex items-center gap-2 font-bold text-foreground text-xs uppercase tracking-wider">
                    <Phone className="h-4 w-4 text-primary" />
                    <span>Kontak Utama / Sekretariat</span>
                  </label>
                  <input
                    type="text"
                    value={kontakUtama}
                    onChange={(e) => setKontakUtama(e.target.value)}
                    placeholder="Contoh: 0813-2233-4455 / 0283-356xxx"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono text-sm font-bold focus:border-primary focus:outline-none"
                  />
                  <p className="text-2xs text-muted-foreground font-medium">
                    Nomor telepon atau WhatsApp umum untuk sekretariat komunitas.
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Daftar Kontak Kader 6 Bidang SPM (Permendagri No. 13/2024)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 1. Bidang Pendidikan */}
                    <div className="p-3.5 rounded-lg border border-border bg-card space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-primary font-bold text-xs">
                        <GraduationCap className="h-4 w-4" />
                        <span>Kader Bidang Pendidikan</span>
                      </div>
                      <input
                        type="text"
                        value={kaderPendidikan.nama}
                        onChange={(e) =>
                          setKaderPendidikan((prev) => ({ ...prev, nama: e.target.value }))
                        }
                        placeholder="Nama Kader..."
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:border-primary focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={kaderPendidikan.wa}
                        onChange={(e) =>
                          setKaderPendidikan((prev) => ({ ...prev, wa: e.target.value }))
                        }
                        placeholder="No. WhatsApp (08...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-mono text-xs focus:border-primary focus:outline-none"
                      />
                    </div>

                    {/* 2. Bidang Kesehatan */}
                    <div className="p-3.5 rounded-lg border border-border bg-card space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                        <HeartPulse className="h-4 w-4 text-emerald-600" />
                        <span>Kader Bidang Kesehatan</span>
                      </div>
                      <input
                        type="text"
                        value={kaderKesehatan.nama}
                        onChange={(e) =>
                          setKaderKesehatan((prev) => ({ ...prev, nama: e.target.value }))
                        }
                        placeholder="Nama Kader..."
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={kaderKesehatan.wa}
                        onChange={(e) =>
                          setKaderKesehatan((prev) => ({ ...prev, wa: e.target.value }))
                        }
                        placeholder="No. WhatsApp (08...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    {/* 3. Bidang Pekerjaan Umum */}
                    <div className="p-3.5 rounded-lg border border-border bg-card space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-secondary font-bold text-xs">
                        <Wrench className="h-4 w-4 text-secondary" />
                        <span>Kader Bidang Pekerjaan Umum</span>
                      </div>
                      <input
                        type="text"
                        value={kaderPekerjaanUmum.nama}
                        onChange={(e) =>
                          setKaderPekerjaanUmum((prev) => ({ ...prev, nama: e.target.value }))
                        }
                        placeholder="Nama Kader..."
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:border-secondary focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={kaderPekerjaanUmum.wa}
                        onChange={(e) =>
                          setKaderPekerjaanUmum((prev) => ({ ...prev, wa: e.target.value }))
                        }
                        placeholder="No. WhatsApp (08...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-mono text-xs focus:border-secondary focus:outline-none"
                      />
                    </div>

                    {/* 4. Bidang Perumahan Rakyat */}
                    <div className="p-3.5 rounded-lg border border-border bg-card space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-cyan-700 font-bold text-xs">
                        <Home className="h-4 w-4 text-cyan-600" />
                        <span>Kader Bidang Perumahan Rakyat</span>
                      </div>
                      <input
                        type="text"
                        value={kaderPerumahanRakyat.nama}
                        onChange={(e) =>
                          setKaderPerumahanRakyat((prev) => ({ ...prev, nama: e.target.value }))
                        }
                        placeholder="Nama Kader..."
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:border-cyan-600 focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={kaderPerumahanRakyat.wa}
                        onChange={(e) =>
                          setKaderPerumahanRakyat((prev) => ({ ...prev, wa: e.target.value }))
                        }
                        placeholder="No. WhatsApp (08...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-mono text-xs focus:border-cyan-600 focus:outline-none"
                      />
                    </div>

                    {/* 5. Bidang Trantipbumlinmas */}
                    <div className="p-3.5 rounded-lg border border-border bg-card space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                        <ShieldCheck className="h-4 w-4 text-purple-600" />
                        <span>Kader Bidang Trantipbumlinmas</span>
                      </div>
                      <input
                        type="text"
                        value={kaderTrantipbumlinmas.nama}
                        onChange={(e) =>
                          setKaderTrantipbumlinmas((prev) => ({
                            ...prev,
                            nama: e.target.value,
                          }))
                        }
                        placeholder="Nama Kader..."
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:border-purple-600 focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={kaderTrantipbumlinmas.wa}
                        onChange={(e) =>
                          setKaderTrantipbumlinmas((prev) => ({
                            ...prev,
                            wa: e.target.value,
                          }))
                        }
                        placeholder="No. WhatsApp (08...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-mono text-xs focus:border-purple-600 focus:outline-none"
                      />
                    </div>

                    {/* 6. Bidang Sosial */}
                    <div className="p-3.5 rounded-lg border border-border bg-card space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                        <Users className="h-4 w-4 text-rose-600" />
                        <span>Kader Bidang Sosial</span>
                      </div>
                      <input
                        type="text"
                        value={kaderSosial.nama}
                        onChange={(e) =>
                          setKaderSosial((prev) => ({ ...prev, nama: e.target.value }))
                        }
                        placeholder="Nama Kader..."
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold focus:border-rose-600 focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={kaderSosial.wa}
                        onChange={(e) =>
                          setKaderSosial((prev) => ({ ...prev, wa: e.target.value }))
                        }
                        placeholder="No. WhatsApp (08...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-mono text-xs focus:border-rose-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3.5 sm:p-4 border-t border-border bg-card flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onClose()}
              disabled={isPending}
              className="h-10 px-4 rounded-lg border border-border bg-card font-bold text-xs text-foreground hover:bg-muted cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-[40px] h-10 items-center gap-2 px-5 rounded-lg bg-primary hover:bg-primary-hover font-bold text-xs text-primary-foreground cursor-pointer shadow-xs active:scale-98 disabled:opacity-50 transition-all"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan Perubahan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
