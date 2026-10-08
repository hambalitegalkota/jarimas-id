"use client";

import { useState, useTransition } from "react";
import {
  User,
  Calendar,
  Phone,
  Home,
  GraduationCap,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  X,
  Pencil,
  MapPin,
  Building2,
  School,
  BookOpen,
  Lock,
} from "lucide-react";
import { updateDataAts } from "@/app/actions/data-ats";
import {
  ALASAN_TIDAK_SEKOLAH_LIST,
  type AlasanTidakSekolah,
  USIA_ATS_OPTIONS,
  JENJANG_SEKOLAH_ASAL_OPTIONS,
  type DataAtsItem,
} from "@/types/database";
import {
  DAFTAR_KECAMATAN_TEGAL,
  getKelurahanByKecamatan,
  DAFTAR_RW_TEGAL,
  DAFTAR_RT_TEGAL,
} from "@/lib/constants/tegal-data";
import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import { KELAS_TERAKHIR_OPTIONS } from "./form-data-ats";
import { cn } from "@/lib/utils";

interface ModalEditAtsProps {
  isOpen: boolean;
  ats: DataAtsItem;
  komunitasId: string;
  komunitasNama?: string;
  onClose: () => void;
  onSuccess: (updatedItem: DataAtsItem) => void;
}

function getUsiaFromBirthDate(birthDateString?: string | null): string {
  if (!birthDateString) return "10";
  const str = birthDateString.trim();
  if (str === "25>" || str === ">25" || str === "24>" || str === ">24" || str.includes(">")) {
    return "25>";
  }
  if (/^\d+$/.test(str)) {
    return str;
  }
  try {
    let birthDate: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split("-").map(Number);
      birthDate = new Date(y, m - 1, d);
    } else {
      birthDate = new Date(str);
    }
    if (isNaN(birthDate.getTime())) return "10";
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    const months = now.getMonth() - birthDate.getMonth();
    if (months < 0 || (months === 0 && now.getDate() < birthDate.getDate())) {
      years--;
    }
    if (years >= 25) return "25>";
    if (years < 0) return "0";
    return String(years);
  } catch {
    return "10";
  }
}

export function ModalEditAts({
  isOpen,
  ats,
  komunitasId,
  komunitasNama,
  onClose,
  onSuccess,
}: ModalEditAtsProps) {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Wilayah Warga & Metadata Komunitas
  const meta = extractKomunitasMetadata({ id: komunitasId, nama: komunitasNama });
  const isLockedKecamatan = Boolean(
    meta.rawKec &&
      meta.rawKec !== "Kota Tegal" &&
      meta.rawKec !== "Semua Kecamatan"
  );
  const isLockedKelurahan = Boolean(
    meta.hasKel &&
      meta.rawKel &&
      meta.rawKel !== "Semua Kelurahan" &&
      meta.rawKel !== "Semua"
  );
  const isLockedRw = false;
  const isLockedRt = false;

  const initialKec = isLockedKecamatan ? meta.rawKec : (ats.kecamatan || "Tegal Selatan");
  const initialKel = isLockedKelurahan ? meta.rawKel : (ats.kelurahan || "Randugunting");
  const initialRw = ats.rw || meta.rawRw || "Belum Tahu";
  const initialRt = ats.rt || meta.rawRt || "Belum Tahu";

  const [kecamatan, setKecamatan] = useState(initialKec);
  const [kelurahan, setKelurahan] = useState(initialKel);
  const [rt, setRt] = useState(initialRt);
  const [rw, setRw] = useState(initialRw);
  const [alamat, setAlamat] = useState(ats.alamat || "");

  // Form Fields
  const [namaLengkap, setNamaLengkap] = useState(ats.nama_lengkap || "");
  const [usia, setUsia] = useState(ats.usia || getUsiaFromBirthDate(ats.tanggal_lahir));
  const [jenisKelamin, setJenisKelamin] = useState<"L" | "P">(
    ats.jenis_kelamin === "P" || ats.jenis_kelamin === "Perempuan" ? "P" : "L"
  );
  const [namaOrangtua, setNamaOrangtua] = useState(ats.nama_orangtua || "");
  const [nomorHp, setNomorHp] = useState(ats.nomor_hp || "");
  const [tinggalBersama, setTinggalBersama] = useState(
    ats.tinggal_bersama || "Orang Tua"
  );

  // Riwayat Pendidikan Sebelumnya
  const [jenjangAsal, setJenjangAsal] = useState<string>(() => {
    if (ats.jenjang_asal && JENJANG_SEKOLAH_ASAL_OPTIONS.includes(ats.jenjang_asal as any)) {
      return ats.jenjang_asal;
    }
    if (ats.sekolah_sebelumnya && JENJANG_SEKOLAH_ASAL_OPTIONS.includes(ats.sekolah_sebelumnya as any)) {
      return ats.sekolah_sebelumnya;
    }
    return JENJANG_SEKOLAH_ASAL_OPTIONS[0];
  });
  const [sekolahSebelumnya, setSekolahSebelumnya] = useState(
    ats.sekolah_sebelumnya || ""
  );
  const [kelasTerakhir, setKelasTerakhir] = useState<string>(
    ats.kelas_terakhir || KELAS_TERAKHIR_OPTIONS[0]
  );

  // ATS Status Fields
  const [keinginanSekolah, setKeinginanSekolah] = useState<"Masih Ada" | "Tidak Ada">(
    ats.keinginan_sekolah === "Tidak Ada" ? "Tidak Ada" : "Masih Ada"
  );
  const [alasanTidakSekolah, setAlasanTidakSekolah] = useState<AlasanTidakSekolah>(
    ats.alasan_tidak_sekolah || ALASAN_TIDAK_SEKOLAH_LIST[0]
  );
  const [keterangan, setKeterangan] = useState(ats.keterangan || "");

  const kelurahanOptions = isLockedKelurahan
    ? [initialKel]
    : getKelurahanByKecamatan(kecamatan);

  const handleKecamatanChange = (newKec: string) => {
    if (isLockedKecamatan) return;
    setKecamatan(newKec);
    const kels = getKelurahanByKecamatan(newKec);
    if (kels.length > 0) {
      setKelurahan(kels[0]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.append("komunitasId", komunitasId);
    if (komunitasNama) {
      formData.append("komunitasNama", komunitasNama);
    }
    formData.append("namaLengkap", namaLengkap);
    formData.append("usia", usia);
    formData.append("jenisKelamin", jenisKelamin);
    formData.append("namaOrangtua", namaOrangtua);
    formData.append("nomorHp", nomorHp);
    formData.append("tinggalBersama", tinggalBersama);

    // Alamat, RT/RW, Wilayah
    formData.append("alamat", alamat);
    formData.append("rt", rt);
    formData.append("rw", rw);
    formData.append("kelurahan", kelurahan);
    formData.append("kecamatan", kecamatan);

    // Sekolah Sebelumnya & Kelas Terakhir
    formData.append("jenjangAsal", jenjangAsal);
    formData.append("sekolahSebelumnya", sekolahSebelumnya);
    formData.append("kelasTerakhir", kelasTerakhir);

    // Status ATS
    formData.append("keinginanSekolah", keinginanSekolah);
    formData.append("alasanTidakSekolah", alasanTidakSekolah);
    formData.append("keterangan", keterangan);

    startTransition(async () => {
      const res = await updateDataAts(ats.id, formData);
      if (res.success && res.data) {
        setFeedback({
          type: "success",
          message: res.message || "Perubahan data ATS berhasil disimpan!",
        });
        setTimeout(() => {
          onSuccess(res.data!);
        }, 600);
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Gagal memperbarui data ATS.",
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg max-h-[min(92dvh,calc(100dvh-2rem))] flex flex-col rounded-xl border border-border bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-border shrink-0 bg-card">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-500">
              <Pencil className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                EDIT DATA ATS (ANAK TIDAK SEKOLAH)
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {ats.nama_lengkap}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 overscroll-contain space-y-4">
          {/* Feedback message */}
          {feedback && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-md p-3.5 text-xs font-mono border",
                feedback.type === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-destructive/40 bg-destructive/10 text-destructive"
              )}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          <form id="form-edit-ats" onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* WILAYAH WARGA */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-amber-400 uppercase tracking-wider">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Wilayah Domisili Anak</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {(isLockedKecamatan || isLockedKelurahan) && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Lock className="h-2.5 w-2.5" />
                      <span>Terkunci</span>
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Kota Tegal
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="flex items-center justify-between gap-1 text-muted-foreground bg-background/50 border border-border rounded px-2.5 py-1.5">
                  <span className="font-semibold text-foreground">Kecamatan:</span>
                  {isLockedKecamatan ? (
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <span>{kecamatan}</span>
                      <Lock className="h-3 w-3 text-amber-500" />
                    </span>
                  ) : (
                    <select
                      value={kecamatan}
                      onChange={(e) => handleKecamatanChange(e.target.value)}
                      className="bg-background border border-border rounded px-2 py-0.5 text-xs text-foreground focus:border-amber-500 focus:outline-hidden"
                    >
                      {DAFTAR_KECAMATAN_TEGAL.map((kec) => (
                        <option key={kec} value={kec}>
                          {kec}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex items-center justify-between gap-1 text-muted-foreground bg-background/50 border border-border rounded px-2.5 py-1.5">
                  <span className="font-semibold text-foreground">Kelurahan:</span>
                  {isLockedKelurahan ? (
                    <span className="font-bold text-foreground flex items-center gap-1">
                      <span>{kelurahan}</span>
                      <Lock className="h-3 w-3 text-amber-500" />
                    </span>
                  ) : (
                    <select
                      value={kelurahan}
                      onChange={(e) => setKelurahan(e.target.value)}
                      className="bg-background border border-border rounded px-2 py-0.5 text-xs text-foreground focus:border-amber-500 focus:outline-hidden"
                    >
                      {kelurahanOptions.map((kel) => (
                        <option key={kel} value={kel}>
                          {kel}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 1: IDENTITAS ANAK */}
            <div className="space-y-3 rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <User className="h-3.5 w-3.5 text-amber-500" />
                <h4 className="text-[11px] font-bold font-mono uppercase tracking-wider text-foreground">
                  1. Identitas Anak Tidak Sekolah (ATS)
                </h4>
              </div>

              {/* Nama Lengkap */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Nama Lengkap Anak *
                </label>
                <input
                  type="text"
                  required
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Usia & Jenis Kelamin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Usia *
                  </label>
                  <div className="relative">
                    <Calendar className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <select
                      required
                      value={usia}
                      onChange={(e) => setUsia(e.target.value)}
                      className="w-full h-9 rounded-md border border-border bg-card pl-8 pr-8 text-xs font-medium text-foreground focus:border-amber-500 focus:outline-hidden appearance-none"
                    >
                      {USIA_ATS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt === "25>" ? "25> (Lebih dari 25 Tahun)" : `${opt} Tahun`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Jenis Kelamin *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setJenisKelamin("L")}
                      className={cn(
                        "flex h-9 items-center justify-center rounded-md border text-xs font-bold transition-all cursor-pointer",
                        jenisKelamin === "L"
                          ? "border-blue-500 bg-blue-500/15 text-blue-600 dark:text-blue-400 font-bold"
                          : "border-border text-muted-foreground hover:bg-card"
                      )}
                    >
                      Laki-laki (L)
                    </button>
                    <button
                      type="button"
                      onClick={() => setJenisKelamin("P")}
                      className={cn(
                        "flex h-9 items-center justify-center rounded-md border text-xs font-bold transition-all cursor-pointer",
                        jenisKelamin === "P"
                          ? "border-rose-500 bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold"
                          : "border-border text-muted-foreground hover:bg-card"
                      )}
                    >
                      Perempuan (P)
                    </button>
                  </div>
                </div>
              </div>

              {/* Nama Orang Tua & Kontak HP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Nama Orang Tua / Wali *
                  </label>
                  <input
                    type="text"
                    required
                    value={namaOrangtua}
                    onChange={(e) => setNamaOrangtua(e.target.value)}
                    placeholder="Nama Orang Tua"
                    className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Nomor WhatsApp / HP (Opsional)
                  </label>
                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="tel"
                      value={nomorHp}
                      onChange={(e) => setNomorHp(e.target.value)}
                      placeholder="081234567890"
                      className="w-full h-9 rounded-md border border-border bg-card pl-8 pr-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Status Tinggal Bersama */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Status Tinggal Bersama *
                </label>
                <div className="relative">
                  <Home className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <select
                    value={tinggalBersama}
                    onChange={(e) => setTinggalBersama(e.target.value)}
                    className="w-full h-9 rounded-md border border-border bg-card pl-8 pr-3 text-xs font-medium text-foreground focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="Orang Tua">Tinggal Bersama Orang Tua</option>
                    <option value="Wali / Kakek-Nenek">Tinggal Bersama Wali / Kakek-Nenek</option>
                    <option value="Kerabat / Saudara">Tinggal Bersama Kerabat / Saudara</option>
                    <option value="Mandiri / Sendiri">Mandiri / Sendiri</option>
                    <option value="Panti / Lembaga Sosial">Panti / Lembaga Sosial</option>
                  </select>
                </div>
              </div>

              {/* ALAMAT LENGKAP */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Alamat (Jalan / Gg / Blok / Nomor) *</span>
                </label>
                <input
                  type="text"
                  required
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                  placeholder="Contoh: Jl. Merpati No. 12, Gg. Kenanga 2"
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Kecamatan & Kelurahan */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Kecamatan *
                  </label>
                  {isLockedKecamatan ? (
                    <div className="flex items-center justify-between h-9 rounded-md border border-border bg-muted/40 px-3 text-xs font-bold text-foreground cursor-not-allowed select-none">
                      <span>Kec. {kecamatan}</span>
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  ) : (
                    <select
                      value={kecamatan}
                      onChange={(e) => handleKecamatanChange(e.target.value)}
                      className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-amber-500 focus:outline-hidden"
                    >
                      {DAFTAR_KECAMATAN_TEGAL.map((k) => (
                        <option key={k} value={k}>
                          Kec. {k}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Kelurahan *
                  </label>
                  {isLockedKelurahan ? (
                    <div className="flex items-center justify-between h-9 rounded-md border border-border bg-muted/40 px-3 text-xs font-bold text-foreground cursor-not-allowed select-none">
                      <span>Kel. {kelurahan}</span>
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </div>
                  ) : (
                    <select
                      value={kelurahan}
                      onChange={(e) => setKelurahan(e.target.value)}
                      className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-amber-500 focus:outline-hidden"
                    >
                      {kelurahanOptions.map((kel) => (
                        <option key={kel} value={kel}>
                          Kel. {kel}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* RW dan RT */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    RW *
                  </label>
                  <select
                    value={rw}
                    onChange={(e) => setRw(e.target.value)}
                    className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-amber-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Belum Tahu">Belum Tahu</option>
                    {DAFTAR_RW_TEGAL.map((r) => (
                      <option key={r} value={r}>
                        RW {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    RT *
                  </label>
                  <select
                    value={rt}
                    onChange={(e) => setRt(e.target.value)}
                    className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-amber-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="Belum Tahu">Belum Tahu</option>
                    {DAFTAR_RT_TEGAL.map((t) => (
                      <option key={t} value={t}>
                        RT {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* JENJANG SEKOLAH ASAL, SEKOLAH SEBELUMNYA & KELAS TERAKHIR */}
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 text-amber-500" />
                    <span>Jenjang Sekolah Sebelumnya / Asal *</span>
                  </label>
                  <select
                    value={jenjangAsal}
                    onChange={(e) => setJenjangAsal(e.target.value)}
                    className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs font-semibold text-foreground focus:border-amber-500 focus:outline-hidden"
                  >
                    {JENJANG_SEKOLAH_ASAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <School className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Nama Sekolah Sebelumnya (Opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={sekolahSebelumnya}
                      onChange={(e) => setSekolahSebelumnya(e.target.value)}
                      placeholder="Contoh: SDN 3 Kejambon"
                      className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Kelas Terakhir Saat Berhenti</span>
                    </label>
                    <select
                      value={kelasTerakhir}
                      onChange={(e) => setKelasTerakhir(e.target.value)}
                      className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-amber-500 focus:outline-hidden"
                    >
                      {KELAS_TERAKHIR_OPTIONS.map((kls) => (
                        <option key={kls} value={kls}>
                          {kls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: STATUS PENDIDIKAN & ALASAN ATS */}
            <div className="space-y-3 rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-2 border-b border-border pb-2">
                <GraduationCap className="h-3.5 w-3.5 text-amber-500" />
                <h4 className="text-[11px] font-bold font-mono uppercase tracking-wider text-foreground">
                  2. Status &amp; Alasan Tidak Sekolah
                </h4>
              </div>

              {/* Keinginan Sekolah */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-amber-500" />
                  <span>Keinginan Melanjutkan Sekolah *</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setKeinginanSekolah("Masih Ada")}
                    className={cn(
                      "flex h-9 items-center justify-center gap-1.5 rounded-md border text-xs font-bold transition-all cursor-pointer",
                      keinginanSekolah === "Masih Ada"
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                        : "border-border text-muted-foreground hover:bg-card"
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Masih Ada</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setKeinginanSekolah("Tidak Ada")}
                    className={cn(
                      "flex h-9 items-center justify-center gap-1.5 rounded-md border text-xs font-bold transition-all cursor-pointer",
                      keinginanSekolah === "Tidak Ada"
                        ? "border-amber-500 bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold shadow-xs"
                        : "border-border text-muted-foreground hover:bg-card"
                    )}
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Tidak Ada</span>
                  </button>
                </div>
              </div>

              {/* Alasan Tidak Sekolah */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Alasan Tidak Sekolah *
                </label>
                <select
                  value={alasanTidakSekolah}
                  onChange={(e) => setAlasanTidakSekolah(e.target.value as AlasanTidakSekolah)}
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground focus:border-amber-500 focus:outline-hidden"
                >
                  {ALASAN_TIDAK_SEKOLAH_LIST.map((alasan) => (
                    <option key={alasan} value={alasan}>
                      {alasan}
                    </option>
                  ))}
                </select>
              </div>

              {/* Keterangan Tambahan */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Keterangan / Rincian Kondisi Anak</span>
                </label>
                <textarea
                  rows={2}
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Keterangan kondisi anak atau rencana penanganan..."
                  className="w-full rounded-md border border-border bg-card p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden leading-relaxed"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="h-9 px-4 rounded-md border border-border bg-background text-xs font-mono text-muted-foreground hover:bg-muted hover:text-foreground transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            type="submit"
            form="form-edit-ats"
            disabled={isPending}
            className="flex h-9 items-center justify-center gap-2 rounded-md bg-amber-600 hover:bg-amber-500 text-white px-4 text-xs font-mono font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>SIMPAN PERUBAHAN</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
