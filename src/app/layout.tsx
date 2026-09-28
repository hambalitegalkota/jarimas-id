import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
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
    "Platform kolaboratif mobile-first interkoneksi data anak 0-7 tahun, DDKS tumbuh kembang, validasi lintas komunitas PAUD & Posyandu, serta pengadaan resmi Jarimas Market Kota Tegal.",
  keywords: [
    "Jarimas",
    "Posyandu",
    "PAUD",
    "Kota Tegal",
    "DDKS",
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
  themeColor: "#000000",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans pb-24 transition-colors duration-150">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <main className="flex-1 w-full max-w-md mx-auto sm:max-w-xl md:max-w-3xl lg:max-w-5xl flex flex-col">
            {children}
          </main>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}

