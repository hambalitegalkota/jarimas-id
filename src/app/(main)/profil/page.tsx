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
import { getRegisteredUsers } from "@/app/actions/pertemanan";
import { ApprovalList } from "@/components/admin/approval-list";
import { CleanupTestDataTool } from "@/components/admin/cleanup-test-data-tool";
import { DistribusiDataAnakTool } from "@/components/admin/distribusi-data-anak-tool";
import { KomunitasManagementTools } from "@/components/admin/komunitas-management-tools";
import { KecamatanMonitoringAccordion } from "@/components/admin/kecamatan-monitoring-accordion";
import { SuperAdminWargaMonitoringTool } from "@/components/admin/super-admin-warga-monitoring-tool";
import {
  formatPeranDisplay,
  isRoleAdmin,
  toValidUUID,
  isSuperAdmin as checkIsSuperAdmin,
  isAdminPusat as checkIsAdminPusat,
} from "@/lib/utils";
import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import { getWargaHierarchyChain, findKecamatanByKelurahan, slugify } from "@/lib/constants/tegal-data";
import { UserCheck, Users } from "lucide-react";
import { type WargaTierItem } from "@/components/komunitas/unified-warga-card";
import { ProfilKomunitasSection } from "@/components/profil/profil-komunitas-section";
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

  const namaLengkap =
    profile?.nama_lengkap ||
    user.user_metadata?.nama_lengkap ||
    user.email?.split("@")[0] ||
    "Pengguna JARIMAS";
  const userEmail = profile?.email || user.email || "-";

  const isSuperAdmin = checkIsSuperAdmin({
    ...profile,
    email: userEmail,
    nama_lengkap: namaLengkap,
    id: user.id,
  });

  const isAdminPusatUser =
    !isSuperAdmin &&
    checkIsAdminPusat({
      ...profile,
      email: userEmail,
      nama_lengkap: namaLengkap,
      id: user.id,
    });

  // Self-healing: jika akun adalah Super Admin tetapi is_super_admin di DB belum true, sinkronkan ke DB
  if (isSuperAdmin && profile?.is_super_admin !== true) {
    try {
      await supabase.from("profiles").upsert(
        {
          id: user.id,
          nama_lengkap: namaLengkap,
          email: userEmail,
          is_super_admin: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
    } catch (dbErr) {
      console.warn("Gagal auto-upgrade Super Admin profile di DB:", dbErr);
    }
  }

  // 3. Ambil data permohonan pending, komunitas user, daftar pengguna terdaftar, dan komunitas buatan admin
  const [
    pendingApprovalsResult,
    userJoinedResult,
    registeredUsersResult,
    createdKomunitasResult,
  ] = await Promise.all([
    getPendingApprovals(),
    supabase
      .from("anggota_komunitas")
      .select("id, komunitas_id, peran, peran_diajukan, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    isSuperAdmin || isAdminPusatUser
      ? getRegisteredUsers()
      : Promise.resolve({
          isAuthenticated: true,
          users: [],
          totalCount: 0,
          totalFriendsCount: 0,
          totalPendingRequestsCount: 0,
        }),
    supabase
      .from("komunitas")
      .select("id, nama, jenis, kecamatan, kelurahan, rw, rt, lokasi, deskripsi, created_by")
      .or(`created_by.eq.${user.id},id.eq.6b73e2b8-e708-4d31-a467-333b068b4fd8`),
  ]);

  const pendingApprovals: PendingApprovalItem[] = pendingApprovalsResult.data || [];
  const allHierarchyPendingApprovals: PendingApprovalItem[] =
    pendingApprovalsResult.allHierarchyItems || [];
  const rawUserCommunities = [...(userJoinedResult.data || [])];

  // Pastikan komunitas yang dibuat oleh admin atau The Orbit Sixty tercakup
  const existingKomIdSet = new Set(rawUserCommunities.map((r: any) => r.komunitas_id));
  for (const createdKom of createdKomunitasResult.data || []) {
    if (!existingKomIdSet.has(createdKom.id)) {
      rawUserCommunities.push({
        id: `created-${createdKom.id}`,
        komunitas_id: createdKom.id,
        peran: isSuperAdmin ? "Super Admin" : isAdminPusatUser ? "Admin Pusat" : "Pengelola",
        peran_diajukan: null,
        status: "approved",
        created_at: new Date().toISOString(),
      });
      existingKomIdSet.add(createdKom.id);
    }
  }

  let userCommunities: any[] = [];

  if (rawUserCommunities.length > 0) {
    const komIds = [
      ...new Set(rawUserCommunities.map((r: any) => r.komunitas_id).filter(Boolean)),
    ];

    const [{ data: komData }, { data: memberCountRows }] = await Promise.all([
      komIds.length > 0
        ? supabase
            .from("komunitas")
            .select("id, nama, jenis, kecamatan, kelurahan, rw, rt, lokasi, deskripsi, created_by")
            .in("id", komIds)
        : Promise.resolve({ data: [] }),
      komIds.length > 0
        ? supabase
            .from("anggota_komunitas")
            .select("komunitas_id")
            .in("komunitas_id", komIds)
        : Promise.resolve({ data: [] }),
    ]);

    const countMap = new Map<string, number>();
    (memberCountRows || []).forEach((row: any) => {
      countMap.set(row.komunitas_id, (countMap.get(row.komunitas_id) || 0) + 1);
    });

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
          created_by: kom?.created_by || null,
          jumlah_anggota: countMap.get(row.komunitas_id) || 1,
        },
      };
    });

    // Urutkan The Orbit Sixty ke posisi teratas
    userCommunities.sort((a, b) => {
      const aIsOrbit =
        a.komunitas_id === "6b73e2b8-e708-4d31-a467-333b068b4fd8" ||
        (a.komunitas.nama || "").toLowerCase().includes("orbit sixty");
      const bIsOrbit =
        b.komunitas_id === "6b73e2b8-e708-4d31-a467-333b068b4fd8" ||
        (b.komunitas.nama || "").toLowerCase().includes("orbit sixty");
      if (aIsOrbit && !bIsOrbit) return -1;
      if (!aIsOrbit && bIsOrbit) return 1;
      return 0;
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
    let kotaItem: (typeof wargaKitaMemberships)[0] | undefined;

    for (const item of wargaKitaMemberships) {
      const meta = extractKomunitasMetadata(item.komunitas);
      if (meta.hasRt) {
        if (!rtItem || isRoleAdmin(item.raw_peran)) rtItem = item;
      } else if (meta.hasRw) {
        if (!rwItem || isRoleAdmin(item.raw_peran)) rwItem = item;
      } else if (meta.hasKel) {
        if (!kelItem || isRoleAdmin(item.raw_peran)) kelItem = item;
      } else if (meta.rawKec && meta.rawKec !== "Kota Tegal") {
        if (!kecItem || isRoleAdmin(item.raw_peran)) kecItem = item;
      } else {
        if (!kotaItem || isRoleAdmin(item.raw_peran)) kotaItem = item;
      }
    }

    // Prioritaskan metadata dari level terdalam (RT -> RW -> Kelurahan -> Kecamatan -> Kota)
    const primaryAnchor =
      rtItem || rwItem || kelItem || kecItem || kotaItem || wargaKitaMemberships[0];
    const anchorMeta = extractKomunitasMetadata(primaryAnchor.komunitas);

    const rt = rtItem
      ? extractKomunitasMetadata(rtItem.komunitas).rt
      : anchorMeta.hasRt
      ? anchorMeta.rt
      : "";

    const rw = rwItem
      ? extractKomunitasMetadata(rwItem.komunitas).rw
      : rtItem
      ? extractKomunitasMetadata(rtItem.komunitas).rw
      : anchorMeta.hasRw
      ? anchorMeta.rw
      : "";

    const rawKelVal = kelItem
      ? extractKomunitasMetadata(kelItem.komunitas).rawKel
      : rwItem
      ? extractKomunitasMetadata(rwItem.komunitas).rawKel
      : rtItem
      ? extractKomunitasMetadata(rtItem.komunitas).rawKel
      : anchorMeta.hasKel
      ? anchorMeta.rawKel
      : "";
    const kel = rawKelVal && rawKelVal !== "Semua Kelurahan" ? rawKelVal : "";

    let kec = kecItem
      ? extractKomunitasMetadata(kecItem.komunitas).rawKec
      : kelItem
      ? extractKomunitasMetadata(kelItem.komunitas).rawKec
      : rwItem
      ? extractKomunitasMetadata(rwItem.komunitas).rawKec
      : rtItem
      ? extractKomunitasMetadata(rtItem.komunitas).rawKec
      : anchorMeta.rawKec !== "Kota Tegal"
      ? anchorMeta.rawKec
      : "";

    if ((!kec || kec === "Kota Tegal") && kel) {
      const foundKec = findKecamatanByKelurahan(kel);
      if (foundKec) kec = foundKec;
    }
    if (!kec) kec = "Kota Tegal";

    // Dapatkan rantai hierarki deterministik 4 tingkat
    const hierarchyChain = getWargaHierarchyChain({
      kecamatan: kec !== "Kota Tegal" ? kec : undefined,
      kelurahan: kel || undefined,
      rw: rw || undefined,
      rt: rt || undefined,
    });

    const chainKec = hierarchyChain.find((c) => {
      const m = extractKomunitasMetadata(c);
      return !m.hasKel && !m.hasRw && !m.hasRt && m.rawKec !== "Kota Tegal";
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
    const fallbackKecId = kec && kec !== "Kota Tegal" ? toValidUUID(`kom-warga-${slugify(kec)}`) : undefined;
    const fallbackKelId = kec && kec !== "Kota Tegal" && kel ? toValidUUID(`kom-warga-${slugify(kec)}-${slugify(kel)}`) : undefined;
    const fallbackRwId = kec && kec !== "Kota Tegal" && kel && rw ? toValidUUID(`kom-warga-${slugify(kec)}-${slugify(kel)}-rw${rw.replace(/\D/g, "").padStart(2, "0")}`) : undefined;
    const fallbackRtId = kec && kec !== "Kota Tegal" && kel && rw && rt ? toValidUUID(`kom-warga-${slugify(kec)}-${slugify(kel)}-rw${rw.replace(/\D/g, "").padStart(2, "0")}-rt${rt.replace(/\D/g, "").padStart(2, "0")}`) : undefined;

    const rtKomId = rtItem?.komunitas_id || (chainRt ? toValidUUID(chainRt.id) : fallbackRtId);
    const rwKomId = rwItem?.komunitas_id || (chainRw ? toValidUUID(chainRw.id) : fallbackRwId);
    const kelKomId = kelItem?.komunitas_id || (chainKel ? toValidUUID(chainKel.id) : fallbackKelId);
    const kecKomId = kecItem?.komunitas_id || (chainKec ? toValidUUID(chainKec.id) : fallbackKecId);

    let formattedTitle = "Warga Kota Tegal";
    if (rt && rw && kel) {
      formattedTitle = `Warga RT ${rt} / RW ${rw}, Kel. ${kel}`;
    } else if (rw && kel) {
      formattedTitle = `Warga RW ${rw}, Kel. ${kel}`;
    } else if (kel) {
      formattedTitle = `Warga Kelurahan ${kel}`;
    } else if (kec && kec !== "Kota Tegal") {
      formattedTitle = `Warga Kecamatan ${kec}`;
    }

    // Tentukan peran tertinggi untuk badge utama (Pengurus jika ada, atau Penduduk)
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
    } else if (kotaItem && isRoleAdmin(kotaItem.raw_peran)) {
      highestRole = kotaItem.peran;
      highestStatus = kotaItem.status;
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
      lokasi: `${kel ? `Kel. ${kel}, ` : ""}${kec !== "Kota Tegal" ? `Kec. ${kec}, ` : ""}Kota Tegal`,
      highestRole,
      highestStatus,
      primaryKomunitasId,
      tiers: [
        {
          label: "RT" as const,
          wilayah: rt ? `RT ${rt}` : "-",
          komunitasId: rtKomId,
          peran: rtItem?.peran || (rt ? "Penduduk" : undefined),
          status: rtItem?.status || (rt ? "approved" : undefined),
        },
        {
          label: "RW" as const,
          wilayah: rw ? `RW ${rw}` : "-",
          komunitasId: rwKomId,
          peran: rwItem?.peran || (rw ? "Penduduk" : undefined),
          status: rwItem?.status || (rw ? "approved" : undefined),
        },
        {
          label: "Kelurahan" as const,
          wilayah: kel ? `Kel. ${kel}` : "-",
          komunitasId: kelKomId,
          peran: kelItem?.peran || (kel ? "Penduduk" : undefined),
          status: kelItem?.status || (kel ? "approved" : undefined),
        },
        {
          label: "Kecamatan" as const,
          wilayah: kec && kec !== "Kota Tegal" ? `Kec. ${kec}` : "Kec. Kota Tegal",
          komunitasId: kecKomId,
          peran: kecItem?.peran || kotaItem?.peran || "Penduduk",
          status: kecItem?.status || kotaItem?.status || "approved",
        },
      ],
    };
  }

  const totalCardCount = (wargaKitaSummary ? 1 : 0) + nonWargaMemberships.length;

  return (
    <div className="flex flex-col flex-1 px-4 sm:px-6 md:px-8 py-4 sm:py-6 gap-5 sm:gap-6 max-w-5xl xl:max-w-6xl mx-auto w-full pb-24 bg-background">
      {/* Header Profil Card - Super App Clean Card */}
      <section className="relative rounded-lg border border-border bg-card p-4 sm:p-6 shadow-sm">
        {/* Tombol Keluar dari Akun di Pojok Kanan Atas */}
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10">
          <form action={logoutUser}>
            <button
              type="submit"
              className="inline-flex min-h-[36px] h-9 items-center justify-center gap-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 bg-rose-50 dark:bg-rose-950/30 px-3 text-xs font-bold text-rose-700 dark:text-rose-400 transition-colors hover:bg-rose-100 dark:hover:bg-rose-900/50 cursor-pointer active:scale-98 shadow-2xs"
              title="Keluar dari Akun"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar dari Akun</span>
              <span className="sm:hidden">Keluar</span>
            </button>
          </form>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left pr-0 sm:pr-36">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary font-bold shadow-xs">
              <User className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>
            {isSuperAdmin && (
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-white shadow-sm border border-card">
                <Crown className="h-3 w-3" />
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex-1 space-y-2 w-full">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                  {namaLengkap}
                </h1>

                {/* Role Badge */}
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-secondary/30 bg-secondary/15 px-2.5 py-1 text-xs font-bold text-amber-950 dark:text-amber-200 shadow-2xs">
                    <Crown className="h-3.5 w-3.5 text-secondary" />
                    SUPER ADMIN
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    PENGGUNA TERVERIFIKASI
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-muted-foreground font-mono">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>{userEmail}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Komunitas Binaan & Dikelola Admin / Komunitas Saya */}
      <ProfilKomunitasSection
        communities={userCommunities}
        wargaKitaSummary={wargaKitaSummary}
        currentUserId={user.id}
        isSuperAdmin={isSuperAdmin}
        isAdminPusat={isAdminPusatUser}
        registeredUsers={registeredUsersResult.users || []}
      />

      {/* Main Content Area: Super Admin Panel */}
      {isSuperAdmin && (
        /* SUPER ADMIN VIEW: Approval Dashboard & Seeding Tools */
        <section className="space-y-6">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="h-5 w-5 text-secondary" />
            <h2 className="text-base font-bold uppercase tracking-wider text-foreground">
              Panel Kendali Super Admin
            </h2>
          </div>

          {/* Monitoring Seluruh Pengguna & Warga Online Realtime */}
          <SuperAdminWargaMonitoringTool
            initialUsers={registeredUsersResult.users || []}
            currentUserId={user.id}
          />

          {/* Pembersih Data Uji Coba (Testing Clean-up) */}
          <CleanupTestDataTool />

          {/* Distribusi & Sinkronisasi Data Anak ke PAUD */}
          <DistribusiDataAnakTool />

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
            <UserCheck className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold uppercase tracking-wider text-foreground">
              Persetujuan Peran &amp; Admin Komunitas
            </h2>
          </div>
          <ApprovalList initialApprovals={pendingApprovals} isSuperAdmin={false} />
        </section>
      )}
    </div>
  );
}
