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
import { getPendingApprovals } from "@/app/actions/admin";
import { ApprovalList } from "@/components/admin/approval-list";
import { DatabaseSeedTools } from "@/components/admin/database-seed-tools";
import { KecamatanMonitoringAccordion } from "@/components/admin/kecamatan-monitoring-accordion";
import { formatPeranDisplay } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sun, UserCheck } from "lucide-react";
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

  // 3. Ambil data permohonan pending & komunitas user
  const [pendingApprovalsResult, userJoinedResult] = await Promise.all([
    getPendingApprovals(),
    supabase
      .from("anggota_komunitas")
      .select("id, komunitas_id, peran, peran_diajukan, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const pendingApprovals: PendingApprovalItem[] = pendingApprovalsResult.data || [];
  const allHierarchyPendingApprovals: PendingApprovalItem[] =
    pendingApprovalsResult.allHierarchyItems || [];
  const rawUserCommunities = userJoinedResult.data || [];
  let userCommunities: any[] = [];

  if (rawUserCommunities.length > 0) {
    const komIds = [
      ...new Set(rawUserCommunities.map((r: any) => r.komunitas_id).filter(Boolean)),
    ];
    const { data: komData } =
      komIds.length > 0
        ? await supabase
          .from("komunitas")
          .select("id, nama, jenis, kecamatan, kelurahan, rw, rt, lokasi, deskripsi")
          .in("id", komIds)
        : { data: [] };

    const komMap = new Map((komData || []).map((k: any) => [k.id, k]));

    userCommunities = rawUserCommunities.map((row: any) => {
      const kom = komMap.get(row.komunitas_id);

      const namaKomunitas = kom?.nama || "Komunitas Tegal";
      const jenisKomunitas = kom?.jenis || "posyandu";
      const lokasiKomunitas =
        kom?.lokasi ||
        [kom?.kelurahan, kom?.kecamatan, "Kota Tegal"].filter(Boolean).join(", ") ||
        "Kota Tegal";

      return {
        id: row.id,
        komunitas_id: row.komunitas_id,
        peran: formatPeranDisplay(row.peran),
        peran_diajukan: row.peran_diajukan || null,
        status: row.status,
        created_at: row.created_at,
        komunitas: {
          id: row.komunitas_id,
          nama: namaKomunitas,
          jenis: jenisKomunitas,
          lokasi: lokasiKomunitas,
          deskripsi: kom?.deskripsi || null,
        },
      };
    });
  }

  return (
    <div className="flex flex-col flex-1 px-4 py-8 gap-8">
      {/* Header Profil Card - Evervault Monochrome Box */}
      <section className="relative rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Avatar */}
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-muted/40 text-foreground font-mono text-xl font-bold">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            {isSuperAdmin && (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded bg-emerald-500 text-black shadow-xs">
                <Crown className="h-3 w-3" />
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  {namaLengkap}
                </h1>

                {/* Role Badge */}
                {isSuperAdmin ? (
                  <span className="cyber-badge text-[11px]">
                    <Crown className="h-3 w-3 text-emerald-400" />
                    SUPER_ADMIN
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded border border-border bg-muted/40 px-2 py-0.5 text-[11px] font-mono text-muted-foreground">
                    <ShieldCheck className="h-3 w-3 text-emerald-400" />
                    VERIFIED
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-muted-foreground font-mono">
                <Mail className="h-3.5 w-3.5" />
                <span>{userEmail}</span>
              </div>
            </div>

            {/* Logout Action */}
            <div className="pt-2 flex justify-center sm:justify-start">
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-xs font-mono font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar Akun</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Pengaturan Tampilan & Tema */}
      <section className="rounded-lg border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              Tema &amp; Tampilan Antarmuka
            </h2>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            HIGH-CONTRAST / OLED
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Pilih mode tampilan preferensi Anda: <strong className="text-foreground">Dark</strong> (OLED Pure Black), <strong className="text-foreground">Light</strong> (High-Contrast Monochrome), atau ikuti setelan <strong className="text-foreground">Sistem</strong>.
        </p>
        <ThemeToggle />
      </section>

      {/* Main Content Area: Super Admin / Community Admin / Regular User */}
      {isSuperAdmin && (
        /* SUPER ADMIN VIEW: Approval Dashboard & Seeding Tools */
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-0.5">
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Panel Kendali Super Admin
            </h2>
          </div>

          {/* Database Seed Tools for Posyandu & Warga Kota Tegal */}
          <DatabaseSeedTools />

          {/* Persetujuan Langsung Super Admin (Hanya Permohonan Admin Kecamatan & Layanan Kota) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-amber-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                  Persetujuan Langsung Super Admin (Admin Kecamatan &amp; Layanan Kota)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                {pendingApprovals.length} PERMOHONAN
              </span>
            </div>
            <ApprovalList initialApprovals={pendingApprovals} isSuperAdmin={true} />
          </div>

          {/* Monitoring Seluruh Permohonan Wilayah Berjenjang (Accordion per Kecamatan) */}
          <KecamatanMonitoringAccordion initialItems={allHierarchyPendingApprovals} />
        </section>
      )}

      {!isSuperAdmin && pendingApprovals.length > 0 && (
        /* COMMUNITY ADMIN VIEW: Tiered Approval List */
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-0.5">
            <UserCheck className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Persetujuan Peran &amp; Admin Komunitas
            </h2>
          </div>
          <ApprovalList initialApprovals={pendingApprovals} isSuperAdmin={false} />
        </section>
      )}

      {/* VIEW: Komunitas Saya */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Komunitas &amp; Saya
            </h2>
          </div>
            <span className="text-xs font-mono text-muted-foreground">
              {userCommunities.length} TERDAFTAR
            </span>
          </div>

          {/* List Komunitas yang Diikuti */}
          {userCommunities.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 p-8 text-center space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted/30 text-muted-foreground">
                <Compass className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-foreground">
                  Belum Bergabung dengan Komunitas
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs font-mono">
                  Bergabunglah dengan Posyandu atau Komunitas setempat untuk memantau tumbuh kembang anak.
                </p>
              </div>
              <Link
                href="/komunitas"
                className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-4 text-xs font-medium text-background transition-colors hover:bg-foreground/90 font-mono"
              >
                <span>Jelajahi Komunitas</span>
                <ArrowRight className="h-3.5 w-3.5" />
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
                    className="rounded-lg border border-border bg-card p-4 space-y-3 transition-colors hover:border-zinc-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm text-foreground">
                          {kom.nama || "Komunitas"}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                          <span className="font-medium text-foreground">
                            {kom.jenis || "Posyandu"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {kom.lokasi || "Kota Tegal"}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      {status === "approved" && (
                        <span className="cyber-badge font-mono text-[11px]">
                          <CheckCircle2 className="h-3 w-3" />
                          AKTIF ({item.peran})
                        </span>
                      )}
                      {status === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-mono text-amber-400">
                          <Clock className="h-3 w-3" />
                          PENDING ({item.peran})
                        </span>
                      )}
                      {status === "rejected" && (
                        <span className="inline-flex items-center gap-1 rounded border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[11px] font-mono text-destructive">
                          <XCircle className="h-3 w-3" />
                          DITOLAK
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
                  className="flex w-full h-10 items-center justify-center gap-2 rounded-md border border-border bg-card px-4 text-xs font-mono font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <Compass className="h-4 w-4 text-emerald-400" />
                  <span>Jelajahi Komunitas Lainnya</span>
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }
