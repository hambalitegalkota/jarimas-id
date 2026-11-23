"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  AtSign,
  FileText,
  Phone,
  Globe,
  Users,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Edit3,
  X,
  Save,
  Check,
  Camera,
  Trash2,
} from "lucide-react";
import { updateUserProfile, type ProfilActionState } from "@/app/actions/profil";
import type { Profile } from "@/types/database";

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

interface EditProfilDialogProps {
  profile: Profile | null;
}

const initialState: ProfilActionState = {
  success: false,
  message: "",
};

/**
 * Kompresi gambar di sisi browser menggunakan HTML5 Canvas
 * Memotong gambar menjadi rasio persegi 1:1, ukuran maks 400x400 px, format WebP/JPEG kualitas 0.8
 * Menghasilkan ukuran hemat (~30 - 50 KB) sehingga super cepat dan ramah kuota.
 */
function compressImageToSquare(
  file: File,
  maxDim = 400,
  quality = 0.8
): Promise<{ dataUrl: string; sizeKb: number }> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("File yang dipilih bukan gambar yang valid."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const minSide = Math.min(img.width, img.height);
          const startX = (img.width - minSide) / 2;
          const startY = (img.height - minSide) / 2;

          const targetSize = Math.min(minSide, maxDim);
          const canvas = document.createElement("canvas");
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Gagal menginisialisasi canvas untuk kompresi"));
            return;
          }

          ctx.drawImage(img, startX, startY, minSide, minSide, 0, 0, targetSize, targetSize);

          let dataUrl = canvas.toDataURL("image/webp", quality);
          if (!dataUrl.startsWith("data:image/webp")) {
            dataUrl = canvas.toDataURL("image/jpeg", quality);
          }

          const base64Content = dataUrl.split(",")[1] || "";
          const sizeKb = Math.round((base64Content.length * 3) / 4 / 1024);

          resolve({ dataUrl, sizeKb });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Gagal membaca file gambar"));
    reader.readAsDataURL(file);
  });
}

export function EditProfilDialog({ profile }: EditProfilDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [state, formAction, isPending] = useActionState(updateUserProfile, initialState);
  const prevPendingRef = useRef(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null);
  const [avatarBase64, setAvatarBase64] = useState<string>("");
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [namaLengkap, setNamaLengkap] = useState(profile?.nama_lengkap || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");
  const [nomorWa, setNomorWa] = useState(profile?.nomor_wa || profile?.nomor_hp || "");
  const [instagram, setInstagram] = useState(profile?.instagram_username || "");
  const [isPublic, setIsPublic] = useState(profile?.is_profil_publik !== false);
  const [showKomunitas, setShowKomunitas] = useState(profile?.tampilkan_komunitas !== false);
  const [showKontak, setShowKontak] = useState(profile?.tampilkan_kontak !== false);

  // Sinkronkan input state jika prop profile berubah
  useEffect(() => {
    if (profile) {
      setNamaLengkap(profile.nama_lengkap || "");
      setUsername(profile.username || "");
      setBio(profile.bio || "");
      setNomorWa(profile.nomor_wa || profile.nomor_hp || "");
      setInstagram(profile.instagram_username || "");
      setIsPublic(profile.is_profil_publik !== false);
      setShowKomunitas(profile.tampilkan_komunitas !== false);
      setShowKontak(profile.tampilkan_kontak !== false);
      setAvatarPreview(profile.avatar_url || null);
      setAvatarBase64("");
      setRemoveAvatar(false);
      setCompressionInfo(null);
    }
  }, [profile]);

  // Munculkan popup sukses saat proses simpan berhasil
  useEffect(() => {
    if (prevPendingRef.current && !isPending) {
      if (state.success) {
        setShowSuccessPopup(true);
      }
    }
    prevPendingRef.current = isPending;
  }, [isPending, state.success]);

  const handleOpen = () => {
    setShowSuccessPopup(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setShowSuccessPopup(false);
    setIsOpen(false);
  };

  const handleSelesai = () => {
    setShowSuccessPopup(false);
    setIsOpen(false);
    router.refresh();
  };

  const handleEditLagi = () => {
    setShowSuccessPopup(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      setCompressionInfo("Sedang mengompresi gambar...");
      const result = await compressImageToSquare(file, 400, 0.8);
      setAvatarPreview(result.dataUrl);
      setAvatarBase64(result.dataUrl);
      setRemoveAvatar(false);
      setCompressionInfo(`Foto terkompresi otomatis (~${result.sizeKb > 0 ? result.sizeKb : 35} KB, WebP 400x400)`);
    } catch (err: any) {
      alert("Gagal memproses gambar: " + (err?.message || "Format tidak didukung"));
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = () => {
    setAvatarPreview(null);
    setAvatarBase64("");
    setRemoveAvatar(true);
    setCompressionInfo("Foto profil akan dihapus saat disimpan");
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex min-h-[36px] h-9 items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 text-xs font-bold text-primary transition-all hover:bg-primary/20 cursor-pointer active:scale-98 shadow-2xs"
        title="Sesuaikan Profil"
      >
        <Edit3 className="h-4 w-4" />
        <span>Edit Profil</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={handleClose}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-lg max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border-t-2 sm:border border-border bg-card p-5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl z-10 space-y-5 animate-in slide-in-from-bottom sm:zoom-in-95">
            {/* Mobile Drag Indicator */}
            <div className="sm:hidden flex justify-center -mt-2 pb-1">
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header Dialog */}
            <div className="flex items-center justify-between border-b border-border pb-3.5">
              <div className="space-y-0.5">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <span>Pengaturan Profil Pengguna</span>
                </h2>
                <p className="text-2xs sm:text-xs text-muted-foreground">
                  Sesuaikan nama tampilan, bio, tautan medsos, dan privasi profil Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Notification Banner */}
            {state.message && (
              <div
                className={`rounded-lg border p-3 text-xs leading-relaxed flex items-start gap-2.5 ${
                  state.success
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
              >
                {state.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">{state.success ? "Berhasil!" : "Perhatian"}</p>
                  <p className="opacity-90">{state.message}</p>
                </div>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              {/* Foto Profil Pengguna */}
              <div className="space-y-2 pb-3 border-b border-border/60">
                <label className="block text-xs font-semibold text-foreground">
                  Foto Profil Pengguna
                </label>

                <div className="flex items-center gap-4">
                  {/* Avatar Preview Box */}
                  <div className="relative shrink-0">
                    <div className="flex h-18 w-18 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border-2 border-primary/30 bg-primary/10 text-primary font-bold shadow-xs overflow-hidden">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Preview Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold select-none">
                          {namaLengkap ? namaLengkap.charAt(0).toUpperCase() : <User className="h-7 w-7 text-primary/60" />}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Description */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isPending || isCompressing}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isPending || isCompressing}
                        className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-98 disabled:opacity-50"
                      >
                        {isCompressing ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Mengompresi...</span>
                          </>
                        ) : (
                          <>
                            <Camera className="h-3.5 w-3.5" />
                            <span>{avatarPreview ? "Ganti Foto" : "Pilih Foto"}</span>
                          </>
                        )}
                      </button>

                      {avatarPreview && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={isPending || isCompressing}
                          className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs active:scale-98 disabled:opacity-50"
                          title="Hapus Foto Profil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>

                    <p className="text-2xs text-muted-foreground leading-relaxed">
                      {compressionInfo ? (
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {compressionInfo}
                        </span>
                      ) : (
                        "Otomatis dipotong 1:1 & dikompresi ke WebP 400x400 (<50 KB) agar cepat & hemat kuota."
                      )}
                    </p>
                  </div>
                </div>

                <input type="hidden" name="avatar_base64" value={avatarBase64} />
                <input type="hidden" name="remove_avatar" value={removeAvatar ? "true" : "false"} />
              </div>

              {/* Nama Tampilan */}
              <div className="space-y-1.5">
                <label
                  htmlFor="nama_lengkap"
                  className="block text-xs font-semibold text-foreground"
                >
                  Nama Tampilan <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="nama_lengkap"
                    name="nama_lengkap"
                    type="text"
                    required
                    value={namaLengkap}
                    onChange={(e) => setNamaLengkap(e.target.value)}
                    placeholder="Nama Lengkap Anda"
                    className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                  />
                </div>
                {state.errors?.nama_lengkap && (
                  <p className="text-2xs font-semibold text-destructive">
                    {state.errors.nama_lengkap[0]}
                  </p>
                )}
              </div>

              {/* Username Unik untuk Link Shareable */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="username"
                    className="block text-xs font-semibold text-foreground"
                  >
                    Tautan Profil (@username)
                  </label>
                  <span className="text-2xs text-muted-foreground font-mono">
                    jarimas.id/u/{username || "username"}
                  </span>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <AtSign className="h-4 w-4" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
                    placeholder="nama_pengguna"
                    className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-9 pr-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                  />
                </div>
                <p className="text-2xs text-muted-foreground">
                  Gunakan huruf kecil, angka, atau garis bawah untuk membuat tautan profil publik yang mudah dibagikan.
                </p>
                {state.errors?.username && (
                  <p className="text-2xs font-semibold text-destructive">
                    {state.errors.username[0]}
                  </p>
                )}
              </div>

              {/* Bio Singkat */}
              <div className="space-y-1.5">
                <label
                  htmlFor="bio"
                  className="block text-xs font-semibold text-foreground"
                >
                  Bio / Deskripsi Profil
                </label>
                <div className="relative">
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    maxLength={300}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tuliskan peran atau pengantar singkat tentang Anda (misal: Kader Posyandu Aster 1 / Guru PAUD Ceria)..."
                    className="w-full rounded-lg border border-border bg-background p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden resize-none"
                  />
                </div>
                <div className="flex justify-end text-2xs text-muted-foreground">
                  {bio.length} / 300 karakter
                </div>
              </div>

              {/* Tautan Media Sosial / Kontak */}
              <div className="space-y-3 pt-1 border-t border-border/60">
                <h3 className="text-xs font-bold text-foreground">Kontak &amp; Media Sosial</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* WhatsApp */}
                  <div className="space-y-1">
                    <label
                      htmlFor="nomor_wa"
                      className="block text-2xs font-medium text-muted-foreground"
                    >
                      Nomor WhatsApp
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-emerald-600">
                        <Phone className="h-3.5 w-3.5" />
                      </div>
                      <input
                        id="nomor_wa"
                        name="nomor_wa"
                        type="tel"
                        inputMode="numeric"
                        value={nomorWa}
                        onChange={(e) => setNomorWa(e.target.value)}
                        placeholder="08123456789"
                        className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-8.5 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="space-y-1">
                    <label
                      htmlFor="instagram_username"
                      className="block text-2xs font-medium text-muted-foreground"
                    >
                      Akun Instagram (@)
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-pink-600">
                        <InstagramIcon className="h-3.5 w-3.5" />
                      </div>
                      <input
                        id="instagram_username"
                        name="instagram_username"
                        type="text"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value.replace(/^@/, ""))}
                        placeholder="username_ig"
                        className="w-full min-h-[44px] h-11 rounded-lg border border-border bg-background pl-8.5 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pengaturan Privasi Profil Ala Medsos */}
              <div className="space-y-3 pt-2 border-t border-border/60">
                <h3 className="text-xs font-bold text-foreground">Pengaturan Privasi Publik</h3>

                <div className="space-y-2.5 rounded-lg border border-border bg-muted/30 p-3">
                  {/* Toggle Profil Publik */}
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_profil_publik"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="mt-0.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <div className="space-y-0.5 text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-primary" />
                        Izinkan Profil Dilihat Publik
                      </span>
                      <p className="text-2xs text-muted-foreground">
                        Orang lain yang memiliki tautan dapat membuka kartu profil publik Anda.
                      </p>
                    </div>
                  </label>

                  {/* Toggle Tampilkan Komunitas */}
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="tampilkan_komunitas"
                      checked={showKomunitas}
                      onChange={(e) => setShowKomunitas(e.target.checked)}
                      className="mt-0.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <div className="space-y-0.5 text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        Tampilkan Komunitas yang Saya Ikuti
                      </span>
                      <p className="text-2xs text-muted-foreground">
                        Badge dan daftar komunitas binaan/warga akan ditampilkan pada halaman profil publik.
                      </p>
                    </div>
                  </label>

                  {/* Toggle Tampilkan Kontak WhatsApp */}
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      name="tampilkan_kontak"
                      checked={showKontak}
                      onChange={(e) => setShowKontak(e.target.checked)}
                      className="mt-0.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <div className="space-y-0.5 text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-emerald-600" />
                        Tampilkan Tombol WhatsApp
                      </span>
                      <p className="text-2xs text-muted-foreground">
                        Pengunjung dapat langsung mengirim pesan WhatsApp kepada Anda.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={handleClose}
                  className="min-h-[44px] px-4 py-2.5 rounded-lg border border-border text-xs sm:text-sm font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending || isCompressing}
                  className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-xs transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : isCompressing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memproses Foto...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Simpan Perubahan</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup Konfirmasi Sukses: Pilihan Selesai atau Edit Lagi */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={handleEditLagi}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl z-10 text-center space-y-4 animate-in zoom-in-95">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Perubahan Berhasil Disimpan
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {state.message || "Profil Anda telah berhasil diperbarui."}
              </p>
            </div>

            <div className="pt-2 flex flex-col-reverse sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={handleEditLagi}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3.5 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Lagi</span>
              </button>
              <button
                type="button"
                onClick={handleSelesai}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-3.5 py-2.5 text-xs font-semibold text-primary-foreground shadow-xs transition-all active:scale-98 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                <span>Selesai</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
