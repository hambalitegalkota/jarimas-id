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
import { CleanupTestDataTool } from "@/components/admin/cleanup-test-data-tool";
import { KomunitasManagementTools } from "@/components/admin/komunitas-management-tools";
import { KecamatanMonitoringAccordion } from "@/components/admin/kecamatan-monitoring-accordion";
import { formatPeranDisplay, isRoleAdmin, toValidUUID } from "@/lib/utils";
import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import { getWargaHierarchyChain, slugify } from "@/lib/constants/tegal-data";
import { UserCheck, Users } from "lucide-react";
import { UnifiedWargaCard, type WargaTierItem } from "@/components/komunitas/unified-warga-card";
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
        raw_peran: row.peran,
        peran_diajukan: row.peran_diajukan || null,
        status: row.status,
        created_at: row.created_at,
        komunitas: {
          id: row.komunitas_id,
          nama: namaKomunitas,
          jenis: jenisKomunitas,
          kecamatan: kom?.kecamatan || null,
          kelurahan: kom?.kelurahan || null,
          rw: kom?.rw || null,
          rt: kom?.rt || null,
          lokasi: lokasiKomunitas,
          deskripsi: kom?.deskripsi || null,
        },
      };
    });
  }

  // Pisahkan Komunitas Warga Kita (untuk diringkas jadi 1 kartu) dan Komunitas lainnya (Posyandu, PAUD)
  const wargaKitaMemberships = userCommunities.filter(
    (item) => item.komunitas.jenis === "warga_kita"
  );
  const nonWargaMemberships = userCommunities.filter(
    (item) => item.komunitas.jenis !== "warga_kita"
  );

  let wargaKitaSummary: {
    title: string;
    lokasi: string;
    highestRole: string;
    highestStatus: "approved" | "pending" | "rejected";
    primaryKomunitasId: string;
    tiers: WargaTierItem[];
  } | null = null;

  if (wargaKitaMemberships.length > 0) {
    let rtItem: (typeof wargaKitaMemberships)[0] | undefined;
    let rwItem: (typeof wargaKitaMemberships)[0] | undefined;
    let kelItem: (typeof wargaKitaMemberships)[0] | undefined;
    let kecItem: (typeof wargaKitaMemberships)[0] | undefined;

    for (const item of wargaKitaMemberships) {
      const meta = extractKomunitasMetadata(item.komunitas);
      if (meta.hasRt) {
        rtItem = item;
      } else if (meta.hasRw) {
        rwItem = item;
      } else if (meta.hasKel) {
        kelItem = item;
      } else {
        kecItem = item;
      }
    }

    const refMeta = extractKomunitasMetadata(
      rtItem?.komunitas ||
        rwItem?.komunitas ||
        kelItem?.komunitas ||
        kecItem?.komunitas ||
        wargaKitaMemberships[0].komunitas
    );

    const rt = rtItem
      ? extractKomunitasMetadata(rtItem.komunitas).rt
      : refMeta.rt;
    const rw = rwItem
      ? extractKomunitasMetadata(rwItem.komunitas).rw
      : rtItem
      ? extractKomunitasMetadata(rtItem.komunitas).rw
      : refMeta.rw;
    const kel = kelItem
      ? extractKomunitasMetadata(kelItem.komunitas).rawKel
      : rwItem
      ? extractKomunitasMetadata(rwItem.komunitas).rawKel
      : rtItem
      ? extractKomunitasMetadata(rtItem.komunitas).rawKel
      : refMeta.rawKel;
    const kec = kecItem
      ? extractKomunitasMetadata(kecItem.komunitas).rawKec
      : kelItem
      ? extractKomunitasMetadata(kelItem.komunitas).rawKec
      : rwItem
      ? extractKomunitasMetadata(rwItem.komunitas).rawKec
      : rtItem
      ? extractKomunitasMetadata(rtItem.komunitas).rawKec
      : refMeta.rawKec || "Kota Tegal";

    // Dapatkan rantai hierarki deterministik 4 tingkat
    const hierarchyChain = getWargaHierarchyChain({
      kecamatan: kec,
      kelurahan: kel,
      rw: rw,
      rt: rt,
    });

    const chainKec = hierarchyChain.find((c) => {
      const m = extractKomunitasMetadata(c);
      return !m.hasKel && !m.hasRw && !m.hasRt;
    });
    const chainKel = hierarchyChain.find((c) => {
      const m = extractKomunitasMetadata(c);
      return m.hasKel && !m.hasRw && !m.hasRt;
    });
    const chainRw = hierarchyChain.find((c) => {
      const m = extractKomunitasMetadata(c);
      return m.hasRw && !m.hasRt;
    });
    const chainRt = hierarchyChain.find((c) => {
      const m = extractKomunitasMetadata(c);
      return m.hasRt;
    });

    // Fallback ID deterministik jika komunitas_id belum tersimpan di memberships
    const fallbackKecId = kec ? toValidUUID(`kom-warga-${slugify(kec)}`) : undefined;
    const fallbackKelId = kec && kel ? toValidUUID(`kom-warga-${slugify(kec)}-${slugify(kel)}`) : undefined;
    const fallbackRwId = kec && kel && rw ? toValidUUID(`kom-warga-${slugify(kec)}-${slugify(kel)}-rw${rw.replace(/\D/g, "").padStart(2, "0")}`) : undefined;
    const fallbackRtId = kec && kel && rw && rt ? toValidUUID(`kom-warga-${slugify(kec)}-${slugify(kel)}-rw${rw.replace(/\D/g, "").padStart(2, "0")}-rt${rt.replace(/\D/g, "").padStart(2, "0")}`) : undefined;

    const rtKomId = rtItem?.komunitas_id || (chainRt ? toValidUUID(chainRt.id) : fallbackRtId);
    const rwKomId = rwItem?.komunitas_id || (chainRw ? toValidUUID(chainRw.id) : fallbackRwId);
    const kelKomId = kelItem?.komunitas_id || (chainKel ? toValidUUID(chainKel.id) : fallbackKelId);
    const kecKomId = kecItem?.komunitas_id || (chainKec ? toValidUUID(chainKec.id) : fallbackKecId);

    let formattedTitle = "Domisili Warga Kita";
    if (rt && rw && kel) {
      formattedTitle = `Warga RT ${rt} / RW ${rw}, Kel. ${kel}`;
    } else if (rw && kel) {
      formattedTitle = `Warga RW ${rw}, Kel. ${kel}`;
    } else if (kel) {
      formattedTitle = `Warga Kelurahan ${kel}`;
    } else if (kec) {
      formattedTitle = `Warga Kecamatan ${kec}`;
    }

    // Tentukan peran tertinggi untuk badge utama
    let highestRole = "Penduduk";
    let highestStatus: "approved" | "pending" | "rejected" = "approved";

    if (rtItem && isRoleAdmin(rtItem.raw_peran)) {
      highestRole = rtItem.peran;
      highestStatus = rtItem.status;
    } else if (rwItem && isRoleAdmin(rwItem.raw_peran)) {
      highestRole = rwItem.peran;
      highestStatus = rwItem.status;
    } else if (kelItem && isRoleAdmin(kelItem.raw_peran)) {
      highestRole = kelItem.peran;
      highestStatus = kelItem.status;
    } else if (kecItem && isRoleAdmin(kecItem.raw_peran)) {
      highestRole = kecItem.peran;
      highestStatus = kecItem.status;
    } else {
      const approvedItem = wargaKitaMemberships.find(
        (i) => i.status === "approved"
      );
      if (approvedItem) {
        highestRole = approvedItem.peran;
        highestStatus = "approved";
      } else {
        highestRole = wargaKitaMemberships[0].peran;
        highestStatus = wargaKitaMemberships[0].status;
      }
    }

    const primaryKomunitasId =
      rtKomId || rwKomId || kelKomId || kecKomId || wargaKitaMemberships[0].komunitas_id;

    wargaKitaSummary = {
      title: formattedTitle,
      lokasi: `${kel ? `Kel. ${kel}, ` : ""}Kec. ${kec}, Kota Tegal`,
      highestRole,
      highestStatus,
      primaryKomunitasId,
      tiers: [
        {
          label: "RT" as const,
          wilayah: rt ? `RT ${rt}` : "-",
          komunitasId: rtKomId,
          peran: rtItem?.peran || "Penduduk",
          status: rtItem?.status || "approved",
        },
        {
          label: "RW" as const,
          wilayah: rw ? `RW ${rw}` : "-",
          komunitasId: rwKomId,
          peran: rwItem?.peran || "Penduduk",
          status: rwItem?.status || "approved",
        },
        {
          label: "Kelurahan" as const,
          wilayah: kel ? `Kel. ${kel}` : "-",
          komunitasId: kelKomId,
          peran: kelItem?.peran || "Penduduk",
          status: kelItem?.status || "approved",
        },
        {
          label: "Kecamatan" as const,
          wilayah: kec ? `Kec. ${kec}` : "-",
          komunitasId: kecKomId,
          peran: kecItem?.peran || "Penduduk",
          status: kecItem?.status || "approved",
        },
      ],
    };
  }

  const totalCardCount = (wargaKitaSummary ? 1 : 0) + nonWargaMemberships.length;

  return (
    <div className="flex flex-col flex-1 px-4 py-6 sm:px-6 md:px-8 max-w-4xl mx-auto w-full gap-6">
      {/* Header Profil Card - Coursera Mobile Clean Card */}
      <section className="relative rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs">
        {/* Tombol Keluar dari Akun di Pojok Kanan Atas */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          <form action={logoutUser}>
            <button
              type="submit"
              className="inline-flex min-h-[40px] h-10 items-center justify-center gap-2 rounded-xl border-2 border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-3.5 sm:px-4 text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-400 transition-colors hover:bg-rose-100 dark:hover:bg-rose-900/50 cursor-pointer active:scale-98 shadow-xs"
              title="Keluar dari Akun"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar dari Akun</span>
              <span className="sm:hidden">Keluar</span>
            </button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left pr-0 sm:pr-36">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs">
              <User className="h-8 w-8 sm:h-9 sm:w-9" />
            </div>
            {isSuperAdmin && (
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md border-2 border-white dark:border-slate-900">
                <Crown className="h-3.5 w-3.5" />
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-2.5 w-full">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {namaLengkap}
                </h1>

                {/* Role Badge */}
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
                    <Crown className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    SUPER ADMIN
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    PENGGUNA TERVERIFIKASI
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-slate-600 dark:text-slate-400 font-mono">
                <Mail className="h-4 w-4 shrink-0 text-slate-500" />
                <span>{userEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area: Super Admin / Community Admin / Regular User */}
      {isSuperAdmin && (
        /* SUPER ADMIN VIEW: Approval Dashboard & Seeding Tools */
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Panel Kendali Super Admin
            </h2>
          </div>

          {/* Pembersih Data Uji Coba (Testing Clean-up) */}
          <CleanupTestDataTool />

          {/* Monitoring Seluruh Permohonan Wilayah Berjenjang (Accordion per Kecamatan) */}
          <KecamatanMonitoringAccordion initialItems={allHierarchyPendingApprovals} />

          {/* Manajemen & Audit Komunitas Kota Tegal (Tambah, Nonaktifkan, Hapus & Cek Kesesuaian) */}
          <KomunitasManagementTools />
        </section>
      )}

      {!isSuperAdmin && pendingApprovals.length > 0 && (
        /* COMMUNITY ADMIN VIEW: Tiered Approval List */
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-base font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Persetujuan Peran &amp; Admin Komunitas
            </h2>
          </div>
          <ApprovalList initialApprovals={pendingApprovals} isSuperAdmin={false} />
        </section>
      )}

      {/* VIEW: Komunitas Saya */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Komunitas Saya
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
            {totalCardCount} TERDAFTAR
          </span>
        </div>

        {/* List Komunitas yang Diikuti */}
        {totalCardCount === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-4 shadow-xs">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/40 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Compass className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Belum Bergabung dengan Komunitas
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                Bergabunglah dengan Posyandu atau Komunitas setempat untuk memantau tumbuh kembang anak dan ATS.
              </p>
            </div>
            <Link
              href="/komunitas"
              className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 text-base font-bold text-white transition-all shadow-sm active:scale-98"
            >
              <span>Jelajahi Komunitas</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1. Kartu Rangkuman Warga Kita (1 Kartu untuk Semua Jenjang, Interaktif) */}
            {wargaKitaSummary && (
              <UnifiedWargaCard
                title={wargaKitaSummary.title}
                lokasi={wargaKitaSummary.lokasi}
                highestRole={wargaKitaSummary.highestRole}
                highestStatus={wargaKitaSummary.highestStatus}
                primaryKomunitasId={wargaKitaSummary.primaryKomunitasId}
                tiers={wargaKitaSummary.tiers}
              />
            )}

            {/* 2. Kartu Komunitas Lainnya (Posyandu, PAUD & Kesetaraan) */}
            {nonWargaMemberships.map((item) => {
              const kom = item.komunitas || {};
              const status = item.status as "pending" | "approved" | "rejected";
              let formattedKomNama = kom.nama || "Komunitas";
              if (kom.jenis === "posyandu") {
                const cleanName = (kom.nama || "").replace(/^(Posyandu\s*)+/gi, "").trim();
                formattedKomNama = cleanName ? `Posyandu ${cleanName}` : "Posyandu";
              }

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 transition-all hover:border-emerald-400 dark:hover:border-emerald-600 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                        {formattedKomNama}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {kom.jenis === "posyandu"
                            ? "Posyandu"
                            : kom.jenis === "satuan_paud"
                            ? "Satuan PAUD"
                            : kom.jenis || "Komunitas"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          {kom.lokasi || "Kota Tegal"}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {status === "approved" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          AKTIF ({item.peran})
                        </span>
                      )}
                      {status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                          <Clock className="h-4 w-4 text-amber-600" />
                          MENUNGGU PERSETUJUAN ({item.peran})
                        </span>
                      )}
                      {status === "rejected" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-rose-500 bg-rose-50 dark:bg-rose-950/40 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-300">
                          <XCircle className="h-4 w-4 text-rose-600" />
                          DITOLAK
                        </span>
                      )}
                    </div>
                  </div>

                  {kom.deskripsi && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {kom.deskripsi}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Link
                      href={`/komunitas/${item.komunitas_id}`}
                      className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-200 dark:border-emerald-800/60 px-4 text-base font-bold text-emerald-700 dark:text-emerald-300 transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-98"
                    >
                      <span>Buka Halaman Komunitas</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Action Button: Explore More Communities */}
            <div className="pt-2">
              <Link
                href="/komunitas"
                className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 text-base font-bold text-slate-800 dark:text-slate-200 transition-all hover:border-emerald-400 dark:hover:border-emerald-600 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 active:scale-98 shadow-xs"
              >
                <Compass className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span>Jelajahi Komunitas Lainnya</span>
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
