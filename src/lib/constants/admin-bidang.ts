import type { BidangSpmId, BidangSpmConfig } from "@/types/database";

export const DAFTAR_BIDANG_SPM_CONFIG: BidangSpmConfig[] = [
  {
    id: "pendidikan",
    nama: "Bidang Pendidikan",
    badgeLabel: "Pendidikan",
    deskripsi:
      "Layanan Pendidikan Usia Dini, Satuan PAUD (TK, RA, KB, SPS, TPA), PKBM, SKB, dan Penanganan Anak Tidak Sekolah (ATS)",
    hakAkses:
      "Melihat rincian detail seluruh data anak usia dini (0–6 tahun), data satuan PAUD/PKBM/SKB, dan data ATS (Anak Tidak Sekolah) se-Kota Tegal secara lengkap tanpa batas wilayah (Read-Only).",
    cakupanData: [
      "Data Anak Usia Dini (0–6 Tahun) & Identitas Lengkap Siswa",
      "Data ATS (Anak Tidak Sekolah) se-Kota Tegal",
      "Profil Lembaga Satuan PAUD, PKBM, dan SKB",
      "Pemantauan Partisipasi Sekolah & Minat Kembali Bersekolah",
    ],
  },
  {
    id: "kesehatan",
    nama: "Bidang Kesehatan",
    badgeLabel: "Kesehatan",
    deskripsi:
      "Layanan Kesehatan Balita, Posyandu, dan Pertumbuhan Anak Sehat",
    hakAkses:
      "Melihat rincian rekapitulasi balita, status gizi, dan cakupan layanan posyandu se-Kota Tegal (Read-Only).",
    cakupanData: [
      "Data Pendataan Balita dan Anak Usia Dini",
      "Data Layanan dan Kehadiran Posyandu",
      "Status Gizi & Kesehatan Balita",
      "Rekapitulasi Layanan Kesehatan Anak & Kader Posyandu",
    ],
  },
  {
    id: "pekerjaan_umum",
    nama: "Bidang Pekerjaan Umum",
    badgeLabel: "Pekerjaan Umum",
    deskripsi:
      "Layanan Sarana Prasarana Wilayah, Jalan Lingkungan, Drainase, dan Titik Fasilitas Publik Warga",
    hakAkses:
      "Melihat data pemetaan sarana prasarana lingkungan, drainase, jalan pemukiman, dan titik fasilitas umum warga se-Kota Tegal (Read-Only).",
    cakupanData: [
      "Pemetaan Titik Fasilitas Publik & Layanan Warga",
      "Infrastruktur Lingkungan Pemukiman RT/RW",
      "Kondisi Drainase & Sarana Fisik Kewilayahan",
      "Aspirasi & Laporan Kebutuhan Fisik Lingkungan Warga",
    ],
  },
  {
    id: "perumahan_rakyat",
    nama: "Bidang Perumahan Rakyat",
    badgeLabel: "Perumahan Rakyat",
    deskripsi:
      "Layanan Kawasan Permukiman Warga, Sanitasi Lingkungan, Air Bersih, dan Rumah Layak Huni",
    hakAkses:
      "Melihat data kelayakan hunian warga, sanitasi lingkungan, ketersediaan air bersih, dan pemetaan permukiman berbasis RT/RW se-Kota Tegal (Read-Only).",
    cakupanData: [
      "Data Kelayakan Rumah Warga (RTLH)",
      "Akses Sanitasi Keluarga & Jamban Sehat",
      "Ketersediaan Sumber Air Bersih Pemukiman",
      "Pemetaan Kawasan Permukiman Sehat Berbasis Lingkungan",
    ],
  },
  {
    id: "trantibumlinmas",
    nama: "Bidang Trantibumlinmas",
    badgeLabel: "Trantibumlinmas",
    deskripsi:
      "Layanan Ketenteraman, Ketertiban Umum, Keamanan Lingkungan, Pos Kamling, dan Linmas",
    hakAkses:
      "Melihat data pemantauan ketertiban umum, keaktifan pos kamling, pos linmas, dan pengaduan ketenteraman warga se-Kota Tegal (Read-Only).",
    cakupanData: [
      "Data Pos Kamling & Keaktifan Linmas Lingkungan",
      "Pemantauan Keamanan & Ketenteraman Warga",
      "Laporan Gangguan Ketertiban Lingkungan",
      "Peta Kerawanan & Saluran Aspirasi Keamanan Lingkungan",
    ],
  },
  {
    id: "sosial",
    nama: "Bidang Sosial",
    badgeLabel: "Sosial",
    deskripsi:
      "Layanan Kesejahteraan Sosial, Pemerlu Pelayanan Kesejahteraan Sosial (PPKS), dan Penyaluran Bantuan Sosial",
    hakAkses:
      "Melihat data kesejahteraan sosial keluarga, data PPKS (disabilitas, lansia rentan, keluarga prasejahtera), dan keterpaduan bantuan sosial se-Kota Tegal (Read-Only).",
    cakupanData: [
      "Data PPKS (Pemerlu Pelayanan Kesejahteraan Sosial)",
      "Pemantauan Warga Lansia Rentan & Penyandang Disabilitas",
      "Data Kerentanan Sosial Ekonomi Keluarga",
      "Rekapitulasi Usulan & Keterpaduan Layanan Kesejahteraan Sosial",
    ],
  },
];

export const BIDANG_LABEL_MAP: Record<BidangSpmId, string> = {
  pendidikan: "Admin Bidang Pendidikan",
  kesehatan: "Admin Bidang Kesehatan",
  pekerjaan_umum: "Admin Bidang Pekerjaan Umum",
  perumahan_rakyat: "Admin Bidang Perumahan Rakyat",
  trantibumlinmas: "Admin Bidang Trantibumlinmas",
  sosial: "Admin Bidang Sosial",
};

export const BIDANG_SLUG_MAP: Record<string, BidangSpmId> = {
  pendidikan: "pendidikan",
  kesehatan: "kesehatan",
  pekerjaan_umum: "pekerjaan_umum",
  "pekerjaan umum": "pekerjaan_umum",
  perumahan_rakyat: "perumahan_rakyat",
  "perumahan rakyat": "perumahan_rakyat",
  trantibumlinmas: "trantibumlinmas",
  "trantibum linmas": "trantibumlinmas",
  sosial: "sosial",
};
