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
import { parseKontakKomunitas } from "@/lib/utils";
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

  const [lokasi, setLokasi] = useState(komunitas.lokasi || "");
  const [jadwal, setJadwal] = useState(komunitas.jadwal || "");
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

    const fullKontakDetail: KontakKomunitasDetail = {
      utama: kontakUtama.trim(),
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
        jadwal: jadwal.trim(),
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
          jadwal: jadwal.trim(),
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
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => !isPending && onClose()}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[92dvh] sm:max-h-[88dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b-2 border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 border-2 border-emerald-200">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  Edit Informasi Resmi &amp; Operasional
                </h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  KADER ONLY
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold line-clamp-1">
                Khusus Kader Resmi: {komunitas.nama}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !isPending && onClose()}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation (Umum vs Kader 6 Bidang SPM) */}
        <div className="px-5 pt-3 bg-white shrink-0">
          <div className="flex rounded-xl bg-slate-100 p-1 gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("umum")}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                activeTab === "umum"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Info className="h-3.5 w-3.5" />
              <span>Lokasi &amp; Profil</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("kader_spm")}
              className={cn(
                "flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5",
                activeTab === "kader_spm"
                  ? "bg-white text-emerald-800 shadow-xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Phone className="h-3.5 w-3.5 text-emerald-600" />
              <span>Kontak Resmi &amp; 6 Kader Bidang</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 overscroll-contain bg-slate-50/50 text-sm">
            {/* Feedback Alerts */}
            {feedback && (
              <div
                className={cn(
                  "flex items-start gap-3 rounded-2xl border-2 p-3.5 text-xs font-bold animate-in fade-in",
                  feedback.type === "success"
                    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                    : "border-rose-300 bg-rose-50 text-rose-900"
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
                  <label className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    <span>Alamat Lokasi Lengkap</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    placeholder="Contoh: Balai Posyandu / RW 05, Randugunting, Tegal Selatan, Kota Tegal"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {/* Jadwal Layanan */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                    <Calendar className="h-4 w-4 text-blue-700" />
                    <span>Jadwal Layanan / Kegiatan Rutin</span>
                  </label>
                  <input
                    type="text"
                    value={jadwal}
                    onChange={(e) => setJadwal(e.target.value)}
                    placeholder="Contoh: Setiap Hari Rabu Minggu ke-2 Pukul 08.30 – 11.30 WIB"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 text-sm font-semibold focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {/* Profil & Visi */}
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                    <Info className="h-4 w-4 text-slate-500" />
                    <span>Profil &amp; Visi Layanan Komunitas</span>
                  </label>
                  <textarea
                    rows={4}
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Tuliskan deskripsi layanan terpadu, visi komunitas, dan kegiatan unggulan..."
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 bg-white text-slate-900 text-sm leading-relaxed focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: KONTAK RESMI & 6 KADER BIDANG SPM */}
            {activeTab === "kader_spm" && (
              <div className="space-y-4">
                {/* Kontak Utama / Sekretariat */}
                <div className="p-4 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 space-y-2">
                  <label className="flex items-center gap-2 font-bold text-emerald-950 text-xs uppercase tracking-wider">
                    <Phone className="h-4 w-4 text-emerald-700" />
                    <span>Kontak Resmi Utama / Sekretariat</span>
                  </label>
                  <input
                    type="text"
                    value={kontakUtama}
                    onChange={(e) => setKontakUtama(e.target.value)}
                    placeholder="Contoh: 0813-2233-4455 / 0283-356xxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-emerald-300 bg-white text-slate-900 font-mono text-sm font-bold focus:border-emerald-600 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 font-medium">
                    Nomor telepon atau WhatsApp umum untuk sekretariat komunitas.
                  </p>
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Daftar Kontak Kader 6 Bidang SPM (Permendagri No. 13/2024)
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 1. Bidang Pendidikan */}
                    <div className="p-3.5 rounded-2xl border-2 border-blue-200 bg-white space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        <span>Kader Bidang Pendidikan</span>
                      </div>
                      <input
                        type="text"
                        value={kaderPendidikan.nama}
                        onChange={(e) =>
                          setKaderPendidikan((prev) => ({ ...prev, nama: e.target.value }))
                        }
                        placeholder="Nama Kader..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:border-blue-600 focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={kaderPendidikan.wa}
                        onChange={(e) =>
                          setKaderPendidikan((prev) => ({ ...prev, wa: e.target.value }))
                        }
                        placeholder="No. WhatsApp (08...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    {/* 2. Bidang Kesehatan */}
                    <div className="p-3.5 rounded-2xl border-2 border-emerald-200 bg-white space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
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
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:border-emerald-600 focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={kaderKesehatan.wa}
                        onChange={(e) =>
                          setKaderKesehatan((prev) => ({ ...prev, wa: e.target.value }))
                        }
                        placeholder="No. WhatsApp (08...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs focus:border-emerald-600 focus:outline-none"
                      />
                    </div>

                    {/* 3. Bidang Pekerjaan Umum */}
                    <div className="p-3.5 rounded-2xl border-2 border-amber-200 bg-white space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                        <Wrench className="h-4 w-4 text-amber-600" />
                        <span>Kader Bidang Pekerjaan Umum</span>
                      </div>
                      <input
                        type="text"
                        value={kaderPekerjaanUmum.nama}
                        onChange={(e) =>
                          setKaderPekerjaanUmum((prev) => ({ ...prev, nama: e.target.value }))
                        }
                        placeholder="Nama Kader..."
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:border-amber-600 focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={kaderPekerjaanUmum.wa}
                        onChange={(e) =>
                          setKaderPekerjaanUmum((prev) => ({ ...prev, wa: e.target.value }))
                        }
                        placeholder="No. WhatsApp (08...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs focus:border-amber-600 focus:outline-none"
                      />
                    </div>

                    {/* 4. Bidang Perumahan Rakyat */}
                    <div className="p-3.5 rounded-2xl border-2 border-cyan-200 bg-white space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-cyan-800 font-bold text-xs">
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
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:border-cyan-600 focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={kaderPerumahanRakyat.wa}
                        onChange={(e) =>
                          setKaderPerumahanRakyat((prev) => ({ ...prev, wa: e.target.value }))
                        }
                        placeholder="No. WhatsApp (08...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs focus:border-cyan-600 focus:outline-none"
                      />
                    </div>

                    {/* 5. Bidang Trantipbumlinmas */}
                    <div className="p-3.5 rounded-2xl border-2 border-purple-200 bg-white space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-purple-800 font-bold text-xs">
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
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:border-purple-600 focus:outline-none"
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
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs focus:border-purple-600 focus:outline-none"
                      />
                    </div>

                    {/* 6. Bidang Sosial */}
                    <div className="p-3.5 rounded-2xl border-2 border-rose-200 bg-white space-y-2 shadow-2xs">
                      <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
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
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold focus:border-rose-600 focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={kaderSosial.wa}
                        onChange={(e) =>
                          setKaderSosial((prev) => ({ ...prev, wa: e.target.value }))
                        }
                        placeholder="No. WhatsApp (08...)"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-xs focus:border-rose-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 border-t-2 border-slate-100 bg-white flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onClose()}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-[44px] items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white cursor-pointer shadow-xs active:scale-98 disabled:opacity-50"
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
