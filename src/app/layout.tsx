import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalMessageNotificationProvider } from "@/components/notifications/global-message-notification-provider";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "JARIMAS-ID | Platform Kolaboratif Warga & Posyandu",
  description:
    "Platform kolaboratif mobile-first interkoneksi data anak 0-6 tahun, DDTK tumbuh kembang, pendataan ATS (Anak Tidak Sekolah), validasi lintas komunitas PAUD & Posyandu, serta pengadaan resmi Jarimas Market Kota Tegal.",
  keywords: [
    "Jarimas",
    "Posyandu",
    "PAUD",
    "Kota Tegal",
    "DDTK",
    "ATS",
    "Anak Tidak Sekolah",
    "Stunting",
    "Tumbuh Kembang Anak",
    "Warga Kita",
  ],
  authors: [{ name: "Pemerintah Kota Tegal & Tim JARIMAS-ID" }],
  openGraph: {
    title: "JARIMAS-ID | Platform Kolaboratif Warga & Posyandu",
    description:
      "Aplikasi kolaborasi cerdas penanganan stunting dan interkoneksi data anak Kota Tegal.",
    siteName: "JARIMAS-ID",
    locale: "id_ID",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${jakartaSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans pb-32 sm:pb-36 transition-colors duration-150">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <GlobalMessageNotificationProvider>
            <main className="flex-1 w-full max-w-md mx-auto sm:max-w-xl md:max-w-3xl lg:max-w-5xl flex flex-col">
              {children}
            </main>
            <BottomNav />
          </GlobalMessageNotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

