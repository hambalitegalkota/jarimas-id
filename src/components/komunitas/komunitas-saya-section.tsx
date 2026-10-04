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
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-blue-200 bg-blue-50 text-blue-700 font-mono">
            <UserCheck className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              Ingin melihat komunitas yang Anda ikuti?
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Masuk ke akun Anda untuk mengakses Posyandu, RT/RW Warga Kita, dan PAUD &amp; Kesetaraan yang telah Anda ikuti.
            </p>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 px-6 text-base font-bold text-white transition-all shadow-xs shrink-0"
        >
          <LogIn className="h-4 w-4" />
          <span>Masuk / Daftar</span>
        </Link>
      </div>
    );
  }

  // Jika user sudah login tapi belum bergabung ke komunitas manapun
  if (userJoinedList.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-6 sm:p-8 space-y-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 border-2 border-blue-200 text-blue-700 mx-auto">
          <UserCheck className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900">
            Komunitas Saya (0 Tergabung)
          </h3>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Anda belum bergabung dengan komunitas manapun. Temukan Posyandu di lingkungan Anda, RT/RW Warga Kita, atau PAUD &amp; Kesetaraan pada daftar di bawah dan klik tombol <span className="font-bold text-blue-700">Gabung</span> untuk mulai terhubung.
          </p>
        </div>
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

  return (
    <section className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-xs">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Komunitas Saya
              </h2>
              <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
                {totalSummaryCount} KOMUNITAS
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600">
              Komunitas yang telah Anda ikuti. Klik tingkatan wilayah lalu pilih &ldquo;Lihat Komunitas&rdquo;.
            </p>
          </div>
        </div>
      </div>

      {/* Grid Komunitas yang Diikuti */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            const cleanName = (item.nama || "").replace(/^(Posyandu\s*)+/gi, "").trim();
            formattedTitle = cleanName ? `Posyandu ${cleanName}` : "Posyandu";
          } else if (item.jenis === "satuan_paud") {
            formattedTitle = item.nama;
          }

          const isApproved = item.status === "approved";
          const isPending = item.status === "pending";

          return (
            <div
              key={item.membershipId}
              className="flex flex-col justify-between rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-4 transition-all hover:border-slate-300 shadow-xs"
            >
              {/* Top Header Card */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2",
                      item.jenis === "posyandu" &&
                        "bg-emerald-50 text-emerald-700 border-emerald-200",
                      item.jenis === "satuan_paud" &&
                        "bg-amber-50 text-amber-800 border-amber-200"
                    )}
                  >
                    {item.jenis === "posyandu" && (
                      <Sparkles className="h-5 w-5" />
                    )}
                    {item.jenis === "satuan_paud" && (
                      <Building2 className="h-5 w-5" />
                    )}
                  </div>

                  {/* Status & Peran Badge */}
                  <div className="shrink-0">
                    {isApproved && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 border-2 border-emerald-300">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span>{item.peran.toUpperCase()}</span>
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 border-2 border-amber-300">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span>PENDING</span>
                      </span>
                    )}
                    {item.status === "rejected" && (
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-900 border-2 border-rose-300">
                        <XCircle className="h-4 w-4 text-rose-600" />
                        <span>DITOLAK</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Nama & Wilayah */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 leading-snug">
                    {formattedTitle}
                  </h3>
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      {item.kelurahan || "Tegal"}, {item.kecamatan || "Kota Tegal"}
                    </span>
                    <span>•</span>
                    <span className="font-mono text-slate-900">{item.jumlah_anggota} Anggota</span>
                  </div>
                </div>

                {/* Jadwal jika ada */}
                {item.jadwal && (
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700">
                    <Calendar className="h-4 w-4 text-blue-700 shrink-0" />
                    <span className="truncate">{item.jadwal}</span>
                  </div>
                )}
              </div>

              {/* Tombol Lihat Komunitas */}
              <div className="pt-2 border-t-2 border-slate-100">
                {isApproved ? (
                  <Link
                    href={`/komunitas/${item.id}`}
                    className={cn(
                      "group flex min-h-[48px] h-12 w-full items-center justify-center gap-2 rounded-xl px-4 text-base font-bold text-white transition-all shadow-xs",
                      item.jenis === "warga_kita" && "bg-blue-700 hover:bg-blue-800",
                      item.jenis === "posyandu" && "bg-blue-700 hover:bg-blue-800",
                      item.jenis === "satuan_paud" && "bg-amber-600 hover:bg-amber-700",
                      !["warga_kita", "posyandu", "satuan_paud"].includes(item.jenis) && "bg-blue-700 hover:bg-blue-800"
                    )}
                    title={`Masuk ke ${formattedTitle}`}
                  >
                    <span>Lihat Komunitas</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                ) : (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <Link
                      href={`/komunitas/${item.id}`}
                      className="group flex flex-1 min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 text-base font-bold text-slate-800 transition-colors hover:bg-slate-50"
                    >
                      <span>Kunjungi</span>
                      <ArrowRight className="h-4 w-4 text-slate-500 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <span className="inline-flex items-center justify-center gap-1.5 px-4 min-h-[48px] h-12 rounded-xl bg-amber-50 border-2 border-amber-200 text-sm font-bold text-amber-900 shrink-0">
                      <Clock className="h-4 w-4 text-amber-600" />
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
