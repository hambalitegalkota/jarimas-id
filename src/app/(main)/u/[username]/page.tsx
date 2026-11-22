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
  ArrowLeft,
  Lock,
  Globe,
  Sparkles,
  CheckCircle2,
  Calendar,
} from "lucide-react";
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
  const result = await getPublicProfileData(username);

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
  const isPrivate = profile.is_profil_publik === false;

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
          {/* Header Banner */}
          <div className="relative h-32 sm:h-44 w-full bg-gradient-to-r from-primary via-emerald-600 to-teal-700 overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/30 backdrop-blur-md px-3 py-1 text-2xs text-white/90 border border-white/20">
              <Globe className="h-3 w-3" />
              <span>Profil Publik</span>
            </div>
          </div>

          {/* Profile Details Bar */}
          <div className="relative px-5 sm:px-8 pb-6 sm:pb-8 pt-0">
            {/* Avatar Row */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
              <div className="relative inline-block">
                <div className="flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-2xl border-4 border-card bg-primary/10 text-primary font-bold shadow-md text-3xl">
                  {profile.nama_lengkap.charAt(0).toUpperCase()}
                </div>
                {profile.is_super_admin ? (
                  <div
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-white shadow-sm border-2 border-card"
                    title="Super Admin JARIMAS"
                  >
                    <Crown className="h-4 w-4" />
                  </div>
                ) : profile.is_admin_pusat ? (
                  <div
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow-sm border-2 border-card"
                    title="Admin Pusat"
                  >
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                ) : (
                  <div
                    className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm border-2 border-card"
                    title="Warga Terverifikasi"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Action / Share Buttons */}
              <div className="flex items-center gap-2 pt-2 sm:pt-0">
                <PublicProfileShareButtons
                  namaLengkap={profile.nama_lengkap}
                  username={profile.username || username}
                />
              </div>
            </div>

            {/* If profile is set to private */}
            {isPrivate ? (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-center space-y-2 mt-4">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-600">
                  <Lock className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-bold text-foreground">Profil Ini Bersifat Privat</h2>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Pemilik akun memilih untuk menyembunyikan detail profil dan daftar komunitasnya dari pandangan publik.
                </p>
              </div>
            ) : (
              /* Public Info Content */
              <div className="space-y-5">
                {/* Name & Badges */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                      {profile.nama_lengkap}
                    </h1>

                    {profile.is_super_admin ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-secondary/30 bg-secondary/15 px-2.5 py-0.5 text-2xs font-bold text-amber-950 dark:text-amber-200">
                        <Crown className="h-3 w-3 text-secondary" />
                        SUPER ADMIN
                      </span>
                    ) : profile.is_admin_pusat ? (
                      <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/15 px-2.5 py-0.5 text-2xs font-bold text-primary">
                        <ShieldCheck className="h-3 w-3 text-primary" />
                        ADMIN PUSAT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-2xs font-semibold text-emerald-700 dark:text-emerald-400">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        WARGA TERVERIFIKASI
                      </span>
                    )}
                  </div>

                  {profile.username && (
                    <p className="text-xs font-mono font-medium text-muted-foreground">
                      @{profile.username}
                    </p>
                  )}
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div className="rounded-xl bg-muted/40 p-3.5 border border-border/60">
                    <p className="text-xs sm:text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Meta details (Joined date, location) */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  {joinDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Bergabung sejak {joinDate}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Kota Tegal, Jawa Tengah</span>
                  </div>
                </div>

                {/* Social Media & Contact Links */}
                {(profile.tampilkan_kontak !== false && profile.nomor_wa || profile.instagram_username) && (
                  <div className="flex flex-wrap items-center gap-2.5 pt-1">
                    {profile.tampilkan_kontak !== false && profile.nomor_wa && (
                      <a
                        href={`https://wa.me/${profile.nomor_wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[36px] items-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 text-xs font-semibold transition-all shadow-xs active:scale-98"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        <span>Kirim Pesan WhatsApp</span>
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

                {/* Joined Communities Section */}
                {profile.tampilkan_komunitas !== false && communities && communities.length > 0 && (
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
