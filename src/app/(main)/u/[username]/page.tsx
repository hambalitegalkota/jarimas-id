import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  User,
  Crown,
  ShieldCheck,
  Building2,
  Users,
  MapPin,
  Share2,
  Phone,
  Mail,
  ArrowLeft,
  Lock,
  Globe,
  Sparkles,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { isSuperOrAdminPusatOrKota } from "@/lib/utils";
import { getPublicProfileData } from "@/app/actions/profil";
import { PublicProfileShareButtons } from "@/components/profil/public-profile-share-buttons";

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

interface PublicProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({
  params,
}: PublicProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const data = await getPublicProfileData(username);

  if (!data?.profile) {
    return {
      title: "Profil Tidak Ditemukan | JARIMAS",
      description: "Profil pengguna tidak ditemukan di JARIMAS Kota Tegal.",
    };
  }

  const { profile } = data;
  const title = `${profile.nama_lengkap} (@${profile.username || username}) | JARIMAS`;
  const description =
    profile.bio ||
    `Lihat profil ${profile.nama_lengkap} di JARIMAS Kota Tegal - Interkoneksi Komunitas & Data Anak.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
    },
  };
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;

  // 1. Cek sesi pengunjung saat ini untuk hak akses Super Admin / Admin Pusat
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  let viewerIsAdmin = false;
  if (currentUser) {
    const { data: viewerProfile } = await supabase
      .from("profiles")
      .select("id, email, is_super_admin, is_admin_pusat, is_admin_kota, peran, nama_lengkap")
      .eq("id", currentUser.id)
      .maybeSingle();

    const userCtx = {
      ...viewerProfile,
      id: currentUser.id,
      email: viewerProfile?.email || currentUser.email,
      nama_lengkap: viewerProfile?.nama_lengkap || currentUser.user_metadata?.nama_lengkap,
    };

    viewerIsAdmin = isSuperOrAdminPusatOrKota(userCtx);

    // Jika belum terdeteksi dari profil langsung, cek apakah terdaftar sebagai admin di komunitas tingkat kota
    if (!viewerIsAdmin) {
      const { data: kotaMemberships } = await supabase
        .from("anggota_komunitas")
        .select(`
          peran,
          komunitas:komunitas_id(nama, jenis)
        `)
        .eq("user_id", currentUser.id)
        .eq("status", "approved");

      viewerIsAdmin = (kotaMemberships || []).some((m: any) => {
        const p = (m.peran || "").toLowerCase();
        const kName = (m.komunitas?.nama || "").toLowerCase();
        return (
          p.includes("admin kota") ||
          p.includes("admin_kota") ||
          (kName.includes("kota tegal") && (p.includes("admin") || p.includes("pengurus")))
        );
      });
    }
  }

  // Ambil data profil (jika admin/pemilik, muat seluruh data termasuk yang diset privat)
  const result = await getPublicProfileData(username, viewerIsAdmin);

  if (!result || !result.profile) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12 text-center">
        <div className="rounded-2xl border border-border bg-card p-8 max-w-md w-full shadow-xs space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <User className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-foreground">Pengguna Tidak Ditemukan</h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Pengguna dengan pengenal <span className="font-mono font-semibold text-foreground">@{username}</span> tidak ditemukan atau belum membuat profil publik.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary-hover transition-colors shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { profile, communities } = result;
  const isOwner = currentUser?.id === profile.id;
  const isPrivate = profile.is_profil_publik === false;
  // Super Admin, Admin Kota, dan pemilik akun dapat melihat seluruh profil baik publik maupun privat
  const canViewFullProfile = !isPrivate || viewerIsAdmin || isOwner;

  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Navigation */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Beranda JARIMAS</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-2xs font-bold text-primary">
              JARIMAS PROFILE
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 space-y-6">
        {/* Main Social Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {/* Header Banner - Berfungsi sebagai Digital ID Card Header */}
          <div className="relative w-full bg-gradient-to-br from-emerald-800 via-teal-700 to-emerald-900 text-white p-5 sm:p-7 overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Top row: badge privat/publik & share buttons */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/15 mb-5">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-md px-3 py-1 text-2xs text-white/95 border border-white/20 font-medium">
                  {isPrivate ? (
                    <>
                      <Lock className="h-3 w-3 text-amber-300" />
                      <span>Profil Privat</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-3 w-3 text-emerald-300" />
                      <span>Profil Publik</span>
                    </>
                  )}
                </span>
              </div>

              {/* Action / Share Buttons */}
              <div className="flex items-center gap-2">
                <PublicProfileShareButtons
                  namaLengkap={profile.nama_lengkap}
                  username={profile.username || username}
                />
              </div>
            </div>

            {/* Main Identity Row: Avatar + Name + Badges + Username + Metadata */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
              {/* Avatar Box */}
              <div className="relative shrink-0">
                <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/10 backdrop-blur-md shadow-lg overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.nama_lengkap}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-extrabold text-white select-none">
                      {profile.nama_lengkap.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {profile.is_super_admin ? (
                  <div
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-white shadow-md border-2 border-emerald-900"
                    title="Super Admin JARIMAS"
                  >
                    <Crown className="h-4 w-4" />
                  </div>
                ) : profile.is_admin_pusat ? (
                  <div
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-md border-2 border-emerald-900"
                    title="Admin Pusat"
                  >
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                ) : (
                  <div
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md border-2 border-emerald-900"
                    title="Warga Terverifikasi"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Text Info yang dinaikkan ke banner */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-xs">
                    {profile.nama_lengkap}
                  </h1>

                  {profile.is_super_admin ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-400 text-slate-950 font-bold px-2.5 py-0.5 text-2xs shadow-xs">
                      <Crown className="h-3 w-3 text-slate-950" />
                      SUPER ADMIN
                    </span>
                  ) : profile.is_admin_pusat ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/20 border border-white/30 text-white font-bold px-2.5 py-0.5 text-2xs backdrop-blur-xs shadow-xs">
                      <ShieldCheck className="h-3 w-3 text-emerald-200" />
                      ADMIN PUSAT
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white/15 border border-white/25 text-emerald-100 font-semibold px-2.5 py-0.5 text-2xs backdrop-blur-xs">
                      <ShieldCheck className="h-3 w-3 text-emerald-300" />
                      WARGA TERVERIFIKASI
                    </span>
                  )}
                </div>

                {profile.username && (
                  <p className="text-xs sm:text-sm font-mono text-emerald-100/90 font-medium">
                    @{profile.username}
                  </p>
                )}

                {/* Quick Meta in Banner */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 pt-1 text-2xs sm:text-xs text-white/80">
                  {joinDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-emerald-200" />
                      <span>Bergabung sejak {joinDate}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-200" />
                    <span>Kota Tegal, Jawa Tengah</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details Content (Di Bawah Banner) */}
          <div className="relative px-5 sm:px-8 py-6 sm:py-7">
            {/* If profile is set to private and viewer is NOT authorized */}
            {!canViewFullProfile ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-center space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-600">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Profil Ini Bersifat Privat</h2>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Pemilik akun memilih untuk menyembunyikan detail profil dan daftar komunitasnya dari pandangan publik.
                </p>
              </div>
            ) : (
              /* Public / Admin Info Content */
              <div className="space-y-5">
                {/* Banner Akses Khusus jika Profil Privat dibuka oleh Admin / Pemilik */}
                {isPrivate && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>Mode Akses Khusus:</strong> Profil ini disetel privat oleh pengguna, namun terbuka penuh untuk Anda sebagai <strong>{viewerIsAdmin ? "Super Admin / Admin Kota" : "Pemilik Akun"}</strong>.
                      </span>
                    </div>
                    <span className="shrink-0 px-2 py-0.5 rounded-md bg-amber-500/20 text-[10px] font-extrabold border border-amber-500/30">
                      PRIVAT
                    </span>
                  </div>
                )}

                {/* Bio */}
                {profile.bio && (
                  <div className="rounded-xl bg-muted/40 p-4 border border-border/60">
                    <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Email (Khusus Admin / Pemilik) */}
                {(viewerIsAdmin || isOwner) && profile.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-3 rounded-lg border border-border bg-card">
                    <Mail className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-mono text-foreground font-medium">{profile.email}</span>
                    <span className="rounded bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary ml-auto">
                      Email Terverifikasi
                    </span>
                  </div>
                )}

                {/* Social Media & Contact Links (Terbuka untuk publik jika diizinkan, atau selalu untuk Admin) */}
                {(profile.tampilkan_kontak !== false || viewerIsAdmin || isOwner) && (profile.nomor_wa || profile.instagram_username) && (
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {profile.nomor_wa && (
                      <a
                        href={`https://wa.me/${profile.nomor_wa.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[36px] items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs active:scale-98"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Kirim Pesan WhatsApp ({profile.nomor_wa})</span>
                      </a>
                    )}

                    {profile.instagram_username && (
                      <a
                        href={`https://instagram.com/${profile.instagram_username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[36px] items-center gap-2 rounded-lg border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 text-pink-700 dark:text-pink-400 px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs active:scale-98"
                      >
                        <InstagramIcon className="h-3.5 w-3.5" />
                        <span>@{profile.instagram_username}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Joined Communities Section (Terbuka untuk publik jika diizinkan, atau selalu untuk Admin) */}
                {(profile.tampilkan_komunitas !== false || viewerIsAdmin || isOwner) && communities && communities.length > 0 && (
                  <div className="space-y-3 pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-primary" />
                        <span>Komunitas yang Diikuti</span>
                      </h2>
                      <span className="text-2xs font-semibold text-muted-foreground">
                        {communities.length} Komunitas
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {communities.map((kom: any) => (
                        <div
                          key={kom.id}
                          className="rounded-xl border border-border bg-card p-3 shadow-2xs space-y-1.5 hover:border-primary/40 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xs font-bold text-foreground line-clamp-1">
                              {kom.nama}
                            </h3>
                            <span className="inline-flex shrink-0 rounded-md bg-primary/10 border border-primary/20 px-2 py-0.2 text-2xs font-semibold text-primary capitalize">
                              {kom.peran}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-2xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{kom.lokasi}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Call to Action Footer Card */}
        <div className="rounded-2xl border border-border bg-gradient-to-r from-card via-muted/40 to-card p-5 sm:p-6 text-center space-y-3 shadow-xs">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">Bergabung dengan JARIMAS Kota Tegal</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
              Interkoneksi data anak, pemantauan tumbuh kembang, dan jejaring komunitas warga Kota Tegal terpadu.
            </p>
          </div>
          <div className="pt-1 flex justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground px-4 py-2 text-xs font-semibold shadow-xs transition-colors"
            >
              <span>Daftar Akun Gratis</span>
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-lg border border-border bg-background hover:bg-muted text-foreground px-4 py-2 text-xs font-semibold transition-colors"
            >
              <span>Masuk</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
