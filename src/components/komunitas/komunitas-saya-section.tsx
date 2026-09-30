"use client";

import Link from "next/link";
import {
  Users,
  Sparkles,
  Building2,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  UserCheck,
  Calendar,
  LogIn,
} from "lucide-react";
import type { UserJoinedKomunitas } from "@/types/database";
import { cn, isRoleAdmin, toValidUUID } from "@/lib/utils";
import { UnifiedWargaCard, type WargaTierItem } from "@/components/komunitas/unified-warga-card";
import { extractKomunitasMetadata } from "@/lib/admin-helpers";
import { getWargaHierarchyChain, slugify } from "@/lib/constants/tegal-data";

interface KomunitasSayaSectionProps {
  userJoinedList: UserJoinedKomunitas[];
  currentUserId?: string | null;
}

export function KomunitasSayaSection({
  userJoinedList,
  currentUserId,
}: KomunitasSayaSectionProps) {
  // Jika user belum login, tampilkan banner ajakan login
  if (!currentUserId) {
    return (
      <div className="rounded-lg border border-border bg-card/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-sky-400 font-mono">
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Ingin melihat komunitas yang Anda ikuti?
            </h3>
            <p className="text-xs text-muted-foreground">
              Masuk ke akun Anda untuk mengakses Posyandu, RT/RW Warga Kita, dan PAUD &amp; Kesetaraan yang telah Anda ikuti.
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-500 px-4 text-xs font-mono font-bold text-white transition-all shadow-sm shrink-0"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>Masuk / Daftar</span>
        </Link>
      </div>
    );
  }

  // Jika user sudah login tapi belum bergabung ke komunitas manapun
  if (userJoinedList.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/40 p-5 sm:p-6 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
            <UserCheck className="h-3.5 w-3.5 text-blue-600 dark:text-sky-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Komunitas Saya
          </h3>
          <span className="cyber-badge font-mono text-[10px]">0 TERGABUNG</span>
        </div>
        <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
          Anda belum bergabung dengan komunitas manapun. Temukan Posyandu di lingkungan Anda, RT/RW Warga Kita, atau PAUD &amp; Kesetaraan pada daftar di bawah dan klik tombol <span className="font-semibold text-foreground">Gabung</span> untuk mulai terhubung.
        </p>
      </div>
    );
  }

  // Pisahkan Komunitas Warga Kita dan Komunitas Lainnya
  const wargaKitaItems = userJoinedList.filter(
    (item) => item.jenis === "warga_kita"
  );
  const otherItems = userJoinedList.filter(
    (item) => item.jenis !== "warga_kita"
  );

  let wargaKitaSummary: {
    title: string;
    lokasi: string;
    highestRole: string;
    highestStatus: "approved" | "pending" | "rejected";
    primaryId: string;
    tiers: WargaTierItem[];
  } | null = null;

  if (wargaKitaItems.length > 0) {
    let rtItem: UserJoinedKomunitas | undefined;
    let rwItem: UserJoinedKomunitas | undefined;
    let kelItem: UserJoinedKomunitas | undefined;
    let kecItem: UserJoinedKomunitas | undefined;

    for (const item of wargaKitaItems) {
      const meta = extractKomunitasMetadata(item);
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
      rtItem || rwItem || kelItem || kecItem || wargaKitaItems[0]
    );

    const rt = rtItem ? extractKomunitasMetadata(rtItem).rt : refMeta.rt;
    const rw = rwItem
      ? extractKomunitasMetadata(rwItem).rw
      : rtItem
      ? extractKomunitasMetadata(rtItem).rw
      : refMeta.rw;
    const kel = kelItem
      ? extractKomunitasMetadata(kelItem).rawKel
      : rwItem
      ? extractKomunitasMetadata(rwItem).rawKel
      : rtItem
      ? extractKomunitasMetadata(rtItem).rawKel
      : refMeta.rawKel;
    const kec = kecItem
      ? extractKomunitasMetadata(kecItem).rawKec
      : kelItem
      ? extractKomunitasMetadata(kelItem).rawKec
      : rwItem
      ? extractKomunitasMetadata(rwItem).rawKec
      : rtItem
      ? extractKomunitasMetadata(rtItem).rawKec
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

    // Fallback ID deterministik jika komunitas_id belum tersimpan di list
    const fallbackKecId = kec ? toValidUUID(`kom-warga-${slugify(kec)}`) : undefined;
    const fallbackKelId = kec && kel ? toValidUUID(`kom-warga-${slugify(kec)}-${slugify(kel)}`) : undefined;
    const fallbackRwId = kec && kel && rw ? toValidUUID(`kom-warga-${slugify(kec)}-${slugify(kel)}-rw${rw.replace(/\D/g, "").padStart(2, "0")}`) : undefined;
    const fallbackRtId = kec && kel && rw && rt ? toValidUUID(`kom-warga-${slugify(kec)}-${slugify(kel)}-rw${rw.replace(/\D/g, "").padStart(2, "0")}-rt${rt.replace(/\D/g, "").padStart(2, "0")}`) : undefined;

    const rtKomId = rtItem?.id || (chainRt ? toValidUUID(chainRt.id) : fallbackRtId);
    const rwKomId = rwItem?.id || (chainRw ? toValidUUID(chainRw.id) : fallbackRwId);
    const kelKomId = kelItem?.id || (chainKel ? toValidUUID(chainKel.id) : fallbackKelId);
    const kecKomId = kecItem?.id || (chainKec ? toValidUUID(chainKec.id) : fallbackKecId);

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

    let highestRole = "Penduduk";
    let highestStatus: "approved" | "pending" | "rejected" = "approved";
    if (rtItem && isRoleAdmin(rtItem.peran)) {
      highestRole = rtItem.peran;
      highestStatus = rtItem.status;
    } else if (rwItem && isRoleAdmin(rwItem.peran)) {
      highestRole = rwItem.peran;
      highestStatus = rwItem.status;
    } else if (kelItem && isRoleAdmin(kelItem.peran)) {
      highestRole = kelItem.peran;
      highestStatus = kelItem.status;
    } else if (kecItem && isRoleAdmin(kecItem.peran)) {
      highestRole = kecItem.peran;
      highestStatus = kecItem.status;
    } else {
      const approvedItem = wargaKitaItems.find((i) => i.status === "approved");
      if (approvedItem) {
        highestRole = approvedItem.peran;
        highestStatus = "approved";
      } else {
        highestRole = wargaKitaItems[0].peran;
        highestStatus = wargaKitaItems[0].status;
      }
    }

    const primaryId =
      rtKomId || rwKomId || kelKomId || kecKomId || wargaKitaItems[0].id;

    wargaKitaSummary = {
      title: formattedTitle,
      lokasi: `${kel ? `Kel. ${kel}, ` : ""}Kec. ${kec}, Kota Tegal`,
      highestRole,
      highestStatus,
      primaryId,
      tiers: [
        {
          label: "RT",
          wilayah: rt ? `RT ${rt}` : "-",
          komunitasId: rtKomId,
          peran: rtItem?.peran || "Penduduk",
          status: rtItem?.status || "approved",
          jumlahAnggota: rtItem?.jumlah_anggota,
        },
        {
          label: "RW",
          wilayah: rw ? `RW ${rw}` : "-",
          komunitasId: rwKomId,
          peran: rwItem?.peran || "Penduduk",
          status: rwItem?.status || "approved",
          jumlahAnggota: rwItem?.jumlah_anggota,
        },
        {
          label: "Kelurahan",
          wilayah: kel ? `Kel. ${kel}` : "-",
          komunitasId: kelKomId,
          peran: kelItem?.peran || "Penduduk",
          status: kelItem?.status || "approved",
          jumlahAnggota: kelItem?.jumlah_anggota,
        },
        {
          label: "Kecamatan",
          wilayah: kec ? `Kec. ${kec}` : "-",
          komunitasId: kecKomId,
          peran: kecItem?.peran || "Penduduk",
          status: kecItem?.status || "approved",
          jumlahAnggota: kecItem?.jumlah_anggota,
        },
      ],
    };
  }

  const totalSummaryCount = (wargaKitaSummary ? 1 : 0) + otherItems.length;

  // Jika user sudah memiliki komunitas yang diikuti
  return (
    <section className="rounded-lg border border-border bg-card p-4 sm:p-6 space-y-4 shadow-xs">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-sky-400">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-foreground">
                Komunitas Saya
              </h2>
              <span className="cyber-badge font-mono text-[10px]">
                {totalSummaryCount} KOMUNITAS
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              Komunitas yang telah Anda ikuti. Klik pada tingkatan wilayah untuk memilih tujuan lalu klik tombol &ldquo;Lihat Komunitas&rdquo;.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Komunitas yang Diikuti */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* 1. Kartu Warga Kita Terpadu (Interaktif 4 Jenjang) */}
        {wargaKitaSummary && (
          <div className="col-span-full">
            <UnifiedWargaCard
              title={wargaKitaSummary.title}
              lokasi={wargaKitaSummary.lokasi}
              highestRole={wargaKitaSummary.highestRole}
              highestStatus={wargaKitaSummary.highestStatus}
              primaryKomunitasId={wargaKitaSummary.primaryId}
              tiers={wargaKitaSummary.tiers}
            />
          </div>
        )}

        {/* 2. Kartu Komunitas Lainnya (Posyandu, PAUD) */}
        {otherItems.map((item) => {
          let formattedTitle = item.nama;
          if (item.jenis === "posyandu") {
            if (!formattedTitle.startsWith("Posyandu")) {
              formattedTitle = `Posyandu ${item.nama}`;
            }
          } else if (item.jenis === "satuan_paud") {
            if (
              !formattedTitle.startsWith("Satuan PAUD") &&
              !formattedTitle.startsWith("PAUD") &&
              !formattedTitle.startsWith("RA") &&
              !formattedTitle.startsWith("TK") &&
              !formattedTitle.startsWith("KB") &&
              !formattedTitle.startsWith("SKB") &&
              !formattedTitle.startsWith("UPTD") &&
              !formattedTitle.startsWith("SPNF") &&
              !formattedTitle.startsWith("PKBM") &&
              !formattedTitle.startsWith("SPS") &&
              !formattedTitle.startsWith("TPA")
            ) {
              formattedTitle = `PAUD & Kesetaraan ${item.nama}`;
            }
          }

          const isApproved = item.status === "approved";
          const isPending = item.status === "pending";

          return (
            <div
              key={item.membershipId}
              className="flex flex-col justify-between rounded-lg border border-border bg-card p-4 space-y-3 transition-all hover:border-blue-500/40 hover:shadow-xs"
            >
              {/* Top Header Card */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-md border font-mono",
                      item.jenis === "posyandu" &&
                        "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
                      item.jenis === "satuan_paud" &&
                        "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    )}
                  >
                    {item.jenis === "posyandu" && (
                      <Sparkles className="h-4 w-4" />
                    )}
                    {item.jenis === "satuan_paud" && (
                      <Building2 className="h-4 w-4" />
                    )}
                  </div>

                  {/* Status & Peran Badge */}
                  <div className="shrink-0">
                    {isApproved && (
                      <span className="cyber-badge font-mono text-[10px] py-0.5">
                        <CheckCircle2 className="h-3 w-3 text-blue-600 dark:text-sky-400" />
                        <span>{item.peran.toUpperCase()}</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-400">
                        <Clock className="h-3 w-3" />
                        <span>PENDING</span>
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 rounded border border-destructive/30 bg-destructive/10 px-2 py-0.5 text-[10px] font-mono text-destructive">
                        <XCircle className="h-3 w-3" />
                        <span>DITOLAK</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Nama & Wilayah */}
                <div>
                  <h3 className="text-sm font-bold text-foreground line-clamp-1 leading-snug">
                    {formattedTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-sky-500" />
                      {item.kelurahan || "Tegal"}, {item.kecamatan || "Kota Tegal"}
                    </span>
                    <span>•</span>
                    <span>{item.jumlah_anggota} Anggota</span>
                  </div>
                </div>

                {/* Jadwal jika ada */}
                {item.jadwal && (
                  <div className="flex items-center gap-1.5 rounded border border-border/60 bg-muted/20 px-2 py-1 text-[10px] text-muted-foreground font-mono">
                    <Calendar className="h-3 w-3 text-blue-600 dark:text-sky-400 shrink-0" />
                    <span className="truncate">{item.jadwal}</span>
                  </div>
                )}
              </div>

              {/* Tombol Lihat Komunitas */}
              <div className="pt-2 border-t border-border">
                {isApproved ? (
                  <Link
                    href={`/komunitas/${item.id}`}
                    className={cn(
                      "group flex h-9 w-full items-center justify-center gap-2 rounded-md px-3 text-xs font-mono font-bold uppercase tracking-wider text-white transition-all shadow-xs",
                      item.jenis === "warga_kita" && "bg-emerald-600 hover:bg-emerald-500",
                      item.jenis === "posyandu" && "bg-blue-600 hover:bg-blue-500",
                      item.jenis === "satuan_paud" && "bg-amber-600 hover:bg-amber-500",
                      !["warga_kita", "posyandu", "satuan_paud"].includes(item.jenis) && "bg-primary hover:bg-primary/90"
                    )}
                    title={`Masuk ke ${formattedTitle}`}
                  >
                    <span>Lihat Komunitas</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/komunitas/${item.id}`}
                      className="group flex flex-1 h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-mono font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      <span>Detail</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </Link>
                    <span className="inline-flex items-center gap-1 px-2.5 h-9 rounded-md bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-400 shrink-0">
                      <Clock className="h-3 w-3" />
                      <span>Menunggu</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
