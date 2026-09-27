import { redirect } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  ShieldCheck,
  Crown,
  LogOut,
  Building2,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Compass,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { logoutUser } from "@/app/actions/auth";
import { ApprovalList } from "@/components/admin/approval-list";
import type { PendingApprovalItem, AnggotaKomunitas } from "@/types/database";

export default async function ProfilePage() {
  const supabase = await createClient();

  // 1. Ambil session user aktif
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Ambil data profil pengguna dari tabel `profiles`
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const isSuperAdmin = profile?.is_super_admin === true;
  const namaLengkap =
    profile?.nama_lengkap ||
    user.user_metadata?.nama_lengkap ||
    user.email?.split("@")[0] ||
    "Pengguna JARIMAS";
  const userEmail = profile?.email || user.email || "-";

  // 3. Ambil data spesifik berdasarkan peran
  let pendingApprovals: PendingApprovalItem[] = [];
  let userCommunities: any[] = [];

  if (isSuperAdmin) {
    // Ambil daftar permohonan pending untuk Super Admin
    const { data: rawPending } = await supabase
      .from("anggota_komunitas")
      .select(`
        id,
        user_id,
        komunitas_id,
        peran,
        status,
        created_at,
        profiles (
          id,
          nama_lengkap,
          email,
          avatar_url
        ),
        komunitas (
          id,
          nama,
          jenis,
          lokasi
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (rawPending) {
      pendingApprovals = rawPending.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        komunitas_id: row.komunitas_id,
        peran: row.peran || "Anggota",
        status: row.status,
        created_at: row.created_at,
        profiles: Array.isArray(row.profiles) ? row.profiles[0] : row.profiles,
        komunitas: Array.isArray(row.komunitas) ? row.komunitas[0] : row.komunitas,
      }));
    }
  } else {
    // Ambil komunitas yang diikuti pengguna biasa
    const { data: rawUserCommunities } = await supabase
      .from("anggota_komunitas")
      .select(`
        id,
        peran,
        status,
        created_at,
        komunitas (
          id,
          nama,
          jenis,
          lokasi,
          deskripsi
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    userCommunities = rawUserCommunities || [];
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-6 gap-6">
      {/* Header Profil Card */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
        {/* Background Subtle Gradient */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          {/* Avatar Icon */}
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary font-bold text-2xl shadow-inner border border-primary/20">
              <User className="h-10 w-10 text-primary" />
            </div>
            {isSuperAdmin && (
              <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-md">
                <Crown className="h-4 w-4" />
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-2">
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  {namaLengkap}
                </h1>

                {/* Role Badge */}
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-3 py-0.5 text-xs font-bold text-white shadow-sm shadow-amber-500/30">
                    <Crown className="h-3.5 w-3.5" />
                    Super Admin Platform
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    Pengguna Terverifikasi
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                <span>{userEmail}</span>
              </div>
            </div>

            {/* Logout Action */}
            <div className="pt-2 flex justify-center sm:justify-start">
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-2 text-xs font-semibold text-destructive transition-all active:scale-95 hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Keluar Akun</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Super Admin vs Regular User */}
      {isSuperAdmin ? (
        /* SUPER ADMIN VIEW: Approval Dashboard */
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold text-foreground">
              Panel Kendali Super Admin
            </h2>
          </div>

          {/* Super Admin Approval List Component */}
          <ApprovalList initialApprovals={pendingApprovals} />
        </section>
      ) : (
        /* REGULAR USER VIEW: Komunitas Saya */
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-base font-bold text-foreground">
                Komunitas &amp; Posyandu Saya
              </h2>
            </div>
            <span className="text-xs text-muted-foreground">
              {userCommunities.length} Terdaftar
            </span>
          </div>

          {/* List Komunitas yang Diikuti */}
          {userCommunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Compass className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">
                  Belum Bergabung dengan Komunitas
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Bergabunglah dengan Posyandu atau Komunitas setempat untuk memantau tumbuh kembang anak bersama kader.
                </p>
              </div>
              <Link
                href="/komunitas"
                className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-xs font-semibold text-white shadow-md shadow-accent/20 transition-transform active:scale-95 hover:brightness-110"
              >
                <span>Jelajahi &amp; Bergabung Komunitas</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {userCommunities.map((item) => {
                const kom = item.komunitas || {};
                const status = item.status as "pending" | "approved" | "rejected";

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-foreground">
                          {kom.nama || "Komunitas"}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground/80">
                            {kom.jenis || "Posyandu"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {kom.lokasi || "Indonesia"}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {status === "approved" && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          Aktif ({item.peran})
                        </span>
                      )}
                      {status === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300">
                          <Clock className="h-3.5 w-3.5 text-amber-500" />
                          Menunggu ({item.peran})
                        </span>
                      )}
                      {status === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-200 dark:bg-red-950 dark:border-red-800 dark:text-red-300">
                          <XCircle className="h-3.5 w-3.5 text-destructive" />
                          Ditolak
                        </span>
                      )}
                    </div>

                    {kom.deskripsi && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {kom.deskripsi}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Action Button: Explore More Communities */}
              <div className="pt-2">
                <Link
                  href="/komunitas"
                  className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-secondary px-5 py-3 text-sm font-bold text-secondary-foreground border border-secondary transition-transform active:scale-95 hover:bg-secondary/80"
                >
                  <Compass className="h-4 w-4" />
                  <span>Jelajahi Komunitas Lainnya</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
