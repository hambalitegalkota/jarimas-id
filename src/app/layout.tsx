import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ThemeProvider } from "@/components/theme-provider";
import { GlobalMessageNotificationProvider } from "@/components/notifications/global-message-notification-provider";
import { ChunkErrorRecovery } from "@/components/chunk-error-recovery";

const inter = Inter({
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
  title: "JARIMAS-ID | Kolaborasi Lintas Warga",
  description:
    "Platform digital kolaboratif berbasis warga (dari warga, oleh warga, untuk warga) untuk interkoneksi data anak usia dini (0-6 tahun), pendataan ATS (Anak Tidak Sekolah), gotong royong lintas komunitas PAUD & Posyandu, serta sarana Jarimas Market Kota Tegal.",
  keywords: [
    "Jarimas",
    "Posyandu",
    "PAUD",
    "Kota Tegal",
    "ATS",
    "Anak Usia Dini",
    "Anak Tidak Sekolah",
    "Warga Kita",
    "Jaringan Informasi",
    "Komunitas Warga",
  ],
  authors: [{ name: "Inisiatif Warga & Tim JARIMAS-ID" }],
  creator: "Komunitas Warga Jarimas",
  publisher: "Komunitas Warga Jarimas",
  openGraph: {
    title: "JARIMAS-ID | Kolaborasi Lintas Warga",
    description:
      "Platform digital kolaborasi berbasis warga (dari warga, oleh warga, untuk warga) untuk pemantauan tumbuh kembang dan gotong royong komunitas warga Kota Tegal.",
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
    { media: "(prefers-color-scheme: light)", color: "#0D9488" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1315" },
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
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans text-[15px] leading-relaxed pb-20 sm:pb-24 transition-colors duration-150 print:pb-0 print:bg-white">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ChunkErrorRecovery />
          <GlobalMessageNotificationProvider>
            <main className="flex-1 w-full flex flex-col print:max-w-none print:w-full print:m-0 print:p-0">
              {children}
            </main>
            <BottomNav />
          </GlobalMessageNotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

