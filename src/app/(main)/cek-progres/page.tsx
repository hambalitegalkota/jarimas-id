import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert, ArrowLeft, LogIn } from "lucide-react";
import { getCekProgresPaudAction } from "@/app/actions/cek-progres";
import { CekProgresClientView } from "@/components/cek-progres/cek-progres-client-view";

export const metadata: Metadata = {
  title: "Cek Progres Kegiatan Administratif | JARIMAS-ID",
  description:
    "Dashboard pemantauan capaian target dan persentase penyelesaian kegiatan administratif berjenjang se-Kota Tegal.",
};

export const dynamic = "force-dynamic";

interface CekProgresPageProps {
  searchParams: Promise<{
    kecamatan?: string;
    kelurahan?: string;
    status?: string;
    search?: string;
  }>;
}

export default async function CekProgresPage({
  searchParams,
}: CekProgresPageProps) {
  const resolvedParams = await searchParams;

  const result = await getCekProgresPaudAction({
    kecamatan: resolvedParams.kecamatan,
    kelurahan: resolvedParams.kelurahan,
    status: resolvedParams.status,
    search: resolvedParams.search,
  });

  // Jika tidak memiliki akses Admin
  if (!result.authorized) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center px-4 py-16 text-center max-w-lg mx-auto">
        <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20 shadow-xs">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight mb-2">
          Akses Khusus Admin
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-6">
          {result.message ||
            "Fitur Cek Progres hanya dapat diakses oleh Admin Kota, Admin Kecamatan, Admin Kelurahan, atau Pengurus/Guru Satuan PAUD terdaftar."}
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/profil"
            className="inline-flex min-h-[44px] items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Ke Profil Saya</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-[44px] items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-xs font-bold text-primary-foreground transition-all shadow-xs"
          >
            <LogIn className="h-4 w-4" />
            <span>Masuk Akun</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen bg-background py-4 sm:py-6 print:py-0 print:bg-white print:min-h-0">
      <CekProgresClientView
        kegiatan={result.kegiatan!}
        initialItems={result.items}
        summary={result.summary}
        userRoleLabel={result.userRoleLabel || "Admin"}
        adminScopeLabel={result.adminScopeLabel || "Seluruh Kota Tegal"}
      />
    </main>
  );
}
