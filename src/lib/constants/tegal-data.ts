import { SEED_POSYANDU_TEGAL } from "./seed-posyandu-tegal";
import { toValidUUID } from "@/lib/utils";

export interface KelurahanData {
  nama: string;
  posyandu: string[];
  paud: string[];
}

export interface KecamatanData {
  nama: string;
  kelurahan: Record<string, KelurahanData>;
}

export const KOTA_TEGAL_DATA: Record<string, KecamatanData> = {
  "Tegal Timur": {
    nama: "Tegal Timur",
    kelurahan: {
      Kejambon: {
        nama: "Kejambon",
        posyandu: [
          "Posyandu Kamboja 1",
          "Posyandu Kamboja 2",
          "Posyandu Kamboja 3",
        ],
        paud: [
          "KB / TK Pembina Kejambon",
          "PAUD Aisyiyah Bustanul Athfal Kejambon",
        ],
      },
      Panggung: {
        nama: "Panggung",
        posyandu: [
          "Posyandu Mawar 1",
          "Posyandu Mawar 2",
          "Posyandu Melati Panggung",
        ],
        paud: [
          "RA Sakila Kerti Panggung",
          "TK Pertiwi Panggung",
          "KB Cahaya Bintang Panggung",
        ],
      },
      Slerok: {
        nama: "Slerok",
        posyandu: ["Posyandu Kenanga 1", "Posyandu Kenanga 2", "Posyandu Nusa Indah"],
        paud: ["PAUD Mutiara Hati Slerok", "TK Al-Irsyad Slerok"],
      },
      Mintaragen: {
        nama: "Mintaragen",
        posyandu: ["Posyandu Teratai 1", "Posyandu Teratai 2", "Posyandu Bougenville"],
        paud: ["PAUD Kasih Ibu Mintaragen", "TK Kemala Bhayangkari Mintaragen"],
      },
      Mangkukusuman: {
        nama: "Mangkukusuman",
        posyandu: ["Posyandu Dahlia 1", "Posyandu Dahlia 2"],
        paud: ["TK Kristen Mangkukusuman", "PAUD Ceria Mangkukusuman"],
      },
    },
  },
  "Tegal Barat": {
    nama: "Tegal Barat",
    kelurahan: {
      Kraton: {
        nama: "Kraton",
        posyandu: ["Posyandu Anggrek 1", "Posyandu Anggrek 2", "Posyandu Cempaka"],
        paud: ["TK Pembina Kraton", "PAUD Harapan Bangsa Kraton"],
      },
      Tegalsari: {
        nama: "Tegalsari",
        posyandu: ["Posyandu Sedap Malam 1", "Posyandu Sedap Malam 2"],
        paud: ["PAUD Bahari Tegalsari", "TK Pertiwi Tegalsari"],
      },
      Kemandungan: {
        nama: "Kemandungan",
        posyandu: ["Posyandu Melati Kemandungan", "Posyandu Wijaya Kusuma"],
        paud: ["PAUD Al-Falah Kemandungan"],
      },
      Pekauman: {
        nama: "Pekauman",
        posyandu: ["Posyandu Flamboyan 1", "Posyandu Flamboyan 2"],
        paud: ["TK Aisyiyah Pekauman"],
      },
      Muarareja: {
        nama: "Muarareja",
        posyandu: ["Posyandu Pesisir 1", "Posyandu Pesisir 2"],
        paud: ["PAUD Bintang Laut Muarareja"],
      },
      "Debong Lor": {
        nama: "Debong Lor",
        posyandu: ["Posyandu Asoka 1", "Posyandu Asoka 2"],
        paud: ["PAUD Tunas Harapan Debong Lor"],
      },
    },
  },
  "Tegal Selatan": {
    nama: "Tegal Selatan",
    kelurahan: {
      Bandung: {
        nama: "Bandung",
        posyandu: ["Posyandu Melati Bandung", "Posyandu Mawar Bandung"],
        paud: ["PAUD Melati Bandung", "TK Pertiwi Bandung"],
      },
      "Debong Kidul": {
        nama: "Debong Kidul",
        posyandu: ["Posyandu Kenanga Debong Kidul"],
        paud: ["PAUD Permata Hati Debong Kidul"],
      },
      "Debong Kulon": {
        nama: "Debong Kulon",
        posyandu: ["Posyandu Teratai Debong Kulon"],
        paud: ["PAUD Tunas Bangsa Debong Kulon"],
      },
      "Debong Tengah": {
        nama: "Debong Tengah",
        posyandu: ["Posyandu Cempaka 1", "Posyandu Cempaka 2"],
        paud: ["TK Al-Ihsan Debong Tengah", "PAUD Pelangi"],
      },
      "Kalinyamat Kulon": {
        nama: "Kalinyamat Kulon",
        posyandu: ["Posyandu Anggrek Kalinyamat Kulon"],
        paud: ["PAUD Bina Insan Kalinyamat Kulon"],
      },
      "Kalinyamat Wetan": {
        nama: "Kalinyamat Wetan",
        posyandu: ["Posyandu Kamboja Kalinyamat Wetan"],
        paud: ["TK Pertiwi Kalinyamat Wetan"],
      },
      Randugunting: {
        nama: "Randugunting",
        posyandu: ["Posyandu Flamboyan 1", "Posyandu Flamboyan 2", "Posyandu Dahlia"],
        paud: ["PAUD Insan Kamil Randugunting", "TK Trisula Randugunting"],
      },
      Tunon: {
        nama: "Tunon",
        posyandu: ["Posyandu Asoka Tunon"],
        paud: ["PAUD Al-Hidayah Tunon"],
      },
    },
  },
  Margadana: {
    nama: "Margadana",
    kelurahan: {
      Margadana: {
        nama: "Margadana",
        posyandu: ["Posyandu Melati Margadana 1", "Posyandu Melati Margadana 2"],
        paud: ["TK Pembina Margadana", "PAUD Kasih Ibu Margadana"],
      },
      Cabawan: {
        nama: "Cabawan",
        posyandu: ["Posyandu Kamboja Cabawan"],
        paud: ["PAUD Tunas Harapan Cabawan"],
      },
      Kaligangsa: {
        nama: "Kaligangsa",
        posyandu: ["Posyandu Mawar Kaligangsa 1", "Posyandu Mawar Kaligangsa 2"],
        paud: ["PAUD An-Nur Kaligangsa", "TK Aisyiyah Kaligangsa"],
      },
      Krandon: {
        nama: "Krandon",
        posyandu: ["Posyandu Kenanga Krandon"],
        paud: ["PAUD Bina Mandiri Krandon"],
      },
      "Pesurungan Kidul": {
        nama: "Pesurungan Kidul",
        posyandu: ["Posyandu Teratai Pesurungan Kidul"],
        paud: ["PAUD Permata Bunda Pesurungan Kidul"],
      },
      "Pesurungan Lor": {
        nama: "Pesurungan Lor",
        posyandu: ["Posyandu Dahlia Pesurungan Lor"],
        paud: ["PAUD Bintang Kecil Pesurungan Lor"],
      },
      Sumurpanggang: {
        nama: "Sumurpanggang",
        posyandu: ["Posyandu Cempaka 1 Sumurpanggang", "Posyandu Cempaka 2"],
        paud: ["TK Pertiwi Sumurpanggang", "PAUD Tunas Bangsa"],
      },
    },
  },
};

export const DAFTAR_KECAMATAN_TEGAL = Object.keys(KOTA_TEGAL_DATA);

export const DAFTAR_RW_TEGAL = Array.from({ length: 17 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

export const DAFTAR_RT_TEGAL = Array.from({ length: 17 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

export function getKelurahanByKecamatan(kecamatan: string): string[] {
  if (!kecamatan || !KOTA_TEGAL_DATA[kecamatan]) {
    return [];
  }
  return Object.keys(KOTA_TEGAL_DATA[kecamatan].kelurahan);
}

// Interface untuk item seed Komunitas
export interface MasterKomunitasSeedItem {
  id: string;
  nama: string;
  jenis: "warga_kita" | "posyandu" | "satuan_paud";
  kecamatan: string;
  kelurahan: string;
  rt: string;
  rw: string;
  lokasi: string;
  deskripsi: string;
  kontak: string;
  jadwal: string;
  logo_url?: string;
  created_at?: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function generateWargaKomunitasItem(
  kecamatan: string,
  kelurahan: string,
  rw: string,
  rt: string
): MasterKomunitasSeedItem {
  const cleanRw = (rw || "01").replace(/\D/g, "").padStart(2, "0");
  const cleanRt = (rt || "01").replace(/\D/g, "").padStart(2, "0");
  const kecSlug = slugify(kecamatan || "tegal");
  const kelSlug = slugify(kelurahan || "tegal");
  const id = `kom-warga-${kecSlug}-${kelSlug}-rw${cleanRw}-rt${cleanRt}`;

  return {
    id,
    nama: `Warga: RT ${cleanRt}, RW ${cleanRw}, ${kelurahan}, ${kecamatan}, Kota Tegal`,
    jenis: "warga_kita",
    kecamatan,
    kelurahan,
    rt: cleanRt,
    rw: cleanRw,
    lokasi: `Balai Pertemuan / Jl. ${kelurahan} No. ${cleanRt}, RT ${cleanRt} / RW ${cleanRw}, ${kelurahan}, ${kecamatan}, Kota Tegal`,
    deskripsi: `Paguyuban rukun warga RT ${cleanRt} RW ${cleanRw} Kelurahan ${kelurahan} yang aktif dalam pemantauan tumbuh kembang balita, pos gizi keluarga, kebersihan lingkungan, dan gotong royong warga.`,
    kontak: `0812-3456-7890 (Pengurus RT ${cleanRt} / RW ${cleanRw})`,
    jadwal: "Pertemuan Rutin Warga Setiap Malam Minggu Pertama",
  };
}

// Master Generator untuk mencakup seluruh Kelurahan & Lembaga di Kota Tegal
function buildMasterKomunitasSeed(): MasterKomunitasSeedItem[] {
  const list: MasterKomunitasSeedItem[] = [
    // --- SPECIAL PRE-CONFIGURED SEED ITEMS ---
    {
      id: "kom-warga-1",
      nama: "Warga: RT 03, RW 02, Kejambon, Tegal Timur, Kota Tegal",
      jenis: "warga_kita",
      kecamatan: "Tegal Timur",
      kelurahan: "Kejambon",
      rt: "03",
      rw: "02",
      lokasi: "Jl. Sultan Agung No. 12, RT 03 / RW 02, Kejambon, Tegal Timur, Kota Tegal",
      deskripsi:
        "Guyub rukun warga RT 03 RW 02 Kejambon dalam menjaga ketenteraman, kebersihan lingkungan, dan pemantauan kesehatan keluarga.",
      kontak: "0812-3456-7890 (Ketua RT)",
      jadwal: "Pertemuan Rutin Setiap Malam Minggu Kliwon",
    },
    {
      id: "kom-warga-2",
      nama: "Warga: RT 05, RW 04, Panggung, Tegal Timur, Kota Tegal",
      jenis: "warga_kita",
      kecamatan: "Tegal Timur",
      kelurahan: "Panggung",
      rt: "05",
      rw: "04",
      lokasi: "Jl. Kolonel Sugiono No. 45, RT 05 / RW 04, Panggung, Tegal Timur, Kota Tegal",
      deskripsi:
        "Paguyuban warga RT 05 RW 04 Panggung, aktif dalam program bank sampah, siskamling, dan gizi balita.",
      kontak: "0813-8899-1122 (Sekretaris RW)",
      jadwal: "Kerja Bakti Minggu Pagi Jam 07.00",
    },
    {
      id: "kom-warga-3",
      nama: "Warga: RT 02, RW 01, Kraton, Tegal Barat, Kota Tegal",
      jenis: "warga_kita",
      kecamatan: "Tegal Barat",
      kelurahan: "Kraton",
      rt: "02",
      rw: "01",
      lokasi: "Jl. Veteran No. 8, RT 02 / RW 01, Kraton, Tegal Barat, Kota Tegal",
      deskripsi:
        "Komunitas warga RT 02 RW 01 Kraton peduli tumbuh kembang balita dan pencegahan stunting berbasis keluarga.",
      kontak: "0857-4422-3311 (Kader RW)",
      jadwal: "Senam Lansia & Balita Sehat Setiap Sabtu",
    },
    {
      id: "kom-warga-4",
      nama: "Warga: RT 01, RW 03, Margadana, Margadana, Kota Tegal",
      jenis: "warga_kita",
      kecamatan: "Margadana",
      kelurahan: "Margadana",
      rt: "01",
      rw: "03",
      lokasi: "Jl. Raya Pantura No. 100, RT 01 / RW 03, Margadana, Kota Tegal",
      deskripsi:
        "Komunitas warga Margadana fokus pada ketahanan pangan mandiri dan gotong royong warga.",
      kontak: "0877-1122-3344",
      jadwal: "Rembug Warga Bulanan",
    },
    {
      id: "kom-posyandu-1",
      nama: "Posyandu Kamboja 1, Kejambon, Tegal Timur, Kota Tegal",
      jenis: "posyandu",
      kecamatan: "Tegal Timur",
      kelurahan: "Kejambon",
      rt: "03",
      rw: "02",
      lokasi: "Balai Warga RW 02, Kejambon, Tegal Timur, Kota Tegal",
      deskripsi:
        "Pos Pelayanan Terpadu Kamboja 1 melayani penimbangan balita, pemantauan DDKS, imunisasi, dan penyuluhan gizi ibu hamil.",
      kontak: "0812-7788-9900 (Ibu Siti - Ketua Kader)",
      jadwal: "Hari Rabu Minggu ke-2 Setiap Bulan, Pukul 08.00 - 11.30 WIB",
    },
    {
      id: "kom-posyandu-2",
      nama: "Posyandu Mawar 2, Panggung, Tegal Timur, Kota Tegal",
      jenis: "posyandu",
      kecamatan: "Tegal Timur",
      kelurahan: "Panggung",
      rt: "05",
      rw: "04",
      lokasi: "Posyandu Terintegrasi RW 04, Panggung, Tegal Timur, Kota Tegal",
      deskripsi:
        "Posyandu Mawar 2 melayani pemantauan tumbuh kembang anak, antropometri digital, pemberian vitamin A, dan PMT gizi lokal.",
      kontak: "0815-6677-8899 (Ibu Rahayu - Bidan Kelurahan)",
      jadwal: "Hari Selasa Minggu ke-1 Setiap Bulan, Pukul 08.30 - 12.00 WIB",
    },
    {
      id: "kom-posyandu-3",
      nama: "Posyandu Kenanga 1, Slerok, Tegal Timur, Kota Tegal",
      jenis: "posyandu",
      kecamatan: "Tegal Timur",
      kelurahan: "Slerok",
      rt: "02",
      rw: "03",
      lokasi: "Gedung Posyandu RW 03, Slerok, Tegal Timur, Kota Tegal",
      deskripsi:
        "Pelayanan Posyandu Siklus Hidup dari ibu hamil, bayi/balita, remaja, hingga lansia.",
      kontak: "0821-3344-5566",
      jadwal: "Hari Kamis Minggu ke-2 Setiap Bulan",
    },
    {
      id: "kom-posyandu-4",
      nama: "Posyandu Anggrek 1, Kraton, Tegal Barat, Kota Tegal",
      jenis: "posyandu",
      kecamatan: "Tegal Barat",
      kelurahan: "Kraton",
      rt: "01",
      rw: "01",
      lokasi: "Balai Pertemuan RW 01, Kraton, Tegal Barat, Kota Tegal",
      deskripsi:
        "Posyandu binaan Puskesmas Tegal Barat dengan fokus pencegahan stunting dan edukasi MPASI sehat.",
      kontak: "0813-9988-7766",
      jadwal: "Hari Sabtu Minggu Pertama Pukul 08.00 WIB",
    },
    {
      id: "kom-paud-1",
      nama: "Satuan PAUD RA Sakila Kerti, Panggung, Tegal Timur, Kota Tegal",
      jenis: "satuan_paud",
      kecamatan: "Tegal Timur",
      kelurahan: "Panggung",
      rt: "04",
      rw: "04",
      lokasi: "Kompleks Terminal Tegal & Pesisir, Panggung, Tegal Timur, Kota Tegal",
      deskripsi:
        "Satuan Pendidikan Anak Usia Dini inklusif dan ramah anak yang mendidik tunas bangsa dengan kurikulum holistik integratif dan pendidikan karakter.",
      kontak: "0812-3344-7788 (Dr. Yusqon - Pengelola)",
      jadwal: "Senin s/d Jumat, Pukul 07.30 - 11.00 WIB",
    },
    {
      id: "kom-paud-2",
      nama: "Satuan PAUD KB / TK Pembina, Kejambon, Tegal Timur, Kota Tegal",
      jenis: "satuan_paud",
      kecamatan: "Tegal Timur",
      kelurahan: "Kejambon",
      rt: "02",
      rw: "02",
      lokasi: "Jl. Pendidikan No. 5, Kejambon, Tegal Timur, Kota Tegal",
      deskripsi:
        "Lembaga PAUD percontohan Kota Tegal dengan fasilitas lengkap bermain motorik, pembelajaran saintifik, dan pengawasan nutrisi anak.",
      kontak: "0813-5566-7788 (Kepala Sekolah)",
      jadwal: "Senin s/d Sabtu, Pukul 07.30 - 10.30 WIB",
    },
    {
      id: "kom-paud-3",
      nama: "Satuan PAUD Mutiara Hati, Slerok, Tegal Timur, Kota Tegal",
      jenis: "satuan_paud",
      kecamatan: "Tegal Timur",
      kelurahan: "Slerok",
      rt: "03",
      rw: "01",
      lokasi: "Jl. Slerok Asri No. 18, Slerok, Tegal Timur, Kota Tegal",
      deskripsi:
        "Kelompok Bermain anak usia 2-6 tahun dengan metode belajar sambil bermain berbasis kecerdasan majemuk.",
      kontak: "0878-9900-1122",
      jadwal: "Senin s/d Kamis, Pukul 08.00 - 11.00 WIB",
    },
    {
      id: "kom-paud-4",
      nama: "Satuan PAUD Kasih Ibu, Margadana, Margadana, Kota Tegal",
      jenis: "satuan_paud",
      kecamatan: "Margadana",
      kelurahan: "Margadana",
      rt: "02",
      rw: "03",
      lokasi: "Jl. Anggrek No. 24, Margadana, Kota Tegal",
      deskripsi:
        "PAUD binaan PKK Margadana yang fokus pada stimulasi motorik, bahasa, dan sosial emosional anak usia dini.",
      kontak: "0856-1122-3344",
      jadwal: "Senin s/d Jumat, Pukul 08.00 - 10.30 WIB",
    },
  ];

  const existingIds = new Set(list.map((item) => item.id));

  // Loop through all kecamatan and kelurahan in Kota Tegal
  for (const [kecName, kecData] of Object.entries(KOTA_TEGAL_DATA)) {
    for (const [kelName, kelData] of Object.entries(kecData.kelurahan)) {
      const kelSlug = slugify(kelName);
      const kecSlug = slugify(kecName);

      // 1. Warga Kita (Generate 2 RT/RW per kelurahan if not exists)
      const warga1Id = `kom-warga-${kecSlug}-${kelSlug}-rt01-rw01`;
      if (!existingIds.has(warga1Id) && !(kelName === "Kejambon" && kecName === "Tegal Timur") && !(kelName === "Panggung" && kecName === "Tegal Timur") && !(kelName === "Kraton" && kecName === "Tegal Barat") && !(kelName === "Margadana" && kecName === "Margadana")) {
        list.push({
          id: warga1Id,
          nama: `Warga: RT 01, RW 01, ${kelName}, ${kecName}, Kota Tegal`,
          jenis: "warga_kita",
          kecamatan: kecName,
          kelurahan: kelName,
          rt: "01",
          rw: "01",
          lokasi: `Jl. ${kelName} Utama No. 10, RT 01 / RW 01, ${kelName}, ${kecName}, Kota Tegal`,
          deskripsi: `Paguyuban rukun warga RT 01 RW 01 Kelurahan ${kelName} yang aktif dalam pemantauan tumbuh kembang balita, pos gizi keluarga, kebersihan lingkungan, dan gotong royong.`,
          kontak: "0812-3344-5566 (Ketua RT 01)",
          jadwal: "Pertemuan Rutin Warga Setiap Malam Minggu Pertama",
        });
        existingIds.add(warga1Id);
      }

      const warga2Id = `kom-warga-${kecSlug}-${kelSlug}-rt02-rw02`;
      if (!existingIds.has(warga2Id)) {
        list.push({
          id: warga2Id,
          nama: `Warga: RT 02, RW 02, ${kelName}, ${kecName}, Kota Tegal`,
          jenis: "warga_kita",
          kecamatan: kecName,
          kelurahan: kelName,
          rt: "02",
          rw: "02",
          lokasi: `Balai Warga RW 02, ${kelName}, ${kecName}, Kota Tegal`,
          deskripsi: `Komunitas keluarga rukun warga RT 02 RW 02 ${kelName} peduli penurunan stunting, sanitasi sehat, dan ketahanan sosial warga.`,
          kontak: "0857-7788-9900 (Pengurus RW 02)",
          jadwal: "Kerja Bakti Lingkungan dan Senam Warga Setiap Minggu Pagi",
        });
        existingIds.add(warga2Id);
      }

      // 2. Posyandu (Generate all posyandu in this kelurahan)
      if (Array.isArray(kelData.posyandu)) {
        kelData.posyandu.forEach((posName, idx) => {
          const posSlug = slugify(posName);
          const posId = `kom-posyandu-${kecSlug}-${kelSlug}-${posSlug}`;
          
          // Cek jika sudah terdaftar di seed statis
          const isAlreadyInSeed = list.some(
            (item) => item.jenis === "posyandu" && item.kelurahan === kelName && item.nama.includes(posName)
          );

          if (!isAlreadyInSeed && !existingIds.has(posId)) {
            list.push({
              id: posId,
              nama: `${posName}, ${kelName}, ${kecName}, Kota Tegal`,
              jenis: "posyandu",
              kecamatan: kecName,
              kelurahan: kelName,
              rt: `0${(idx % 4) + 1}`,
              rw: `0${(idx % 3) + 1}`,
              lokasi: `Posyandu / Balai RW 0${(idx % 3) + 1}, ${kelName}, ${kecName}, Kota Tegal`,
              deskripsi: `Layanan Posyandu ${posName} terpadu: penimbangan berat badan, tinggi badan, imunisasi, penyuluhan DDKS, dan PMT balita serta ibu hamil.`,
              kontak: "0813-2233-4455 (Kader Posyandu)",
              jadwal: `Setiap Hari Rabu Minggu ke-${(idx % 4) + 1} Pukul 08.30 - 11.30 WIB`,
            });
            existingIds.add(posId);
          }
        });
      }

      // 3. Satuan PAUD (Generate all paud in this kelurahan)
      if (Array.isArray(kelData.paud)) {
        kelData.paud.forEach((paudName, idx) => {
          const paudSlug = slugify(paudName);
          const paudId = `kom-paud-${kecSlug}-${kelSlug}-${paudSlug}`;

          const isAlreadyInSeed = list.some(
            (item) => item.jenis === "satuan_paud" && item.kelurahan === kelName && item.nama.includes(paudName)
          );

          if (!isAlreadyInSeed && !existingIds.has(paudId)) {
            list.push({
              id: paudId,
              nama: `Satuan PAUD ${paudName}, ${kelName}, ${kecName}, Kota Tegal`,
              jenis: "satuan_paud",
              kecamatan: kecName,
              kelurahan: kelName,
              rt: `0${(idx % 3) + 1}`,
              rw: `0${(idx % 3) + 1}`,
              lokasi: `Gedung ${paudName}, ${kelName}, ${kecName}, Kota Tegal`,
              deskripsi: `Lembaga Pendidikan Anak Usia Dini (${paudName}) berfokus pada stimulasi tumbuh kembang fisik-motorik, kognitif, moral, dan kemandirian anak.`,
              kontak: "0815-4455-6677 (Pengelola PAUD)",
              jadwal: "Senin s/d Jumat, Pukul 07.30 - 10.30 WIB",
            });
            existingIds.add(paudId);
          }
        });
      }
    }
  }

  // Masukkan seluruh 230+ Posyandu resmi se-Kota Tegal
  if (Array.isArray(SEED_POSYANDU_TEGAL)) {
    for (const pos of SEED_POSYANDU_TEGAL) {
      if (!existingIds.has(pos.id)) {
        list.push(pos);
        existingIds.add(pos.id);
      }
    }
  }

  return list;
}

export const MASTER_KOMUNITAS_SEED = buildMasterKomunitasSeed();

export function findOrGenerateKomunitasSeed(
  komunitasId: string
): MasterKomunitasSeedItem | null {
  if (!komunitasId) return null;

  const targetUuid = toValidUUID(komunitasId);
  const directMatch = MASTER_KOMUNITAS_SEED.find(
    (k) => k.id === komunitasId || toValidUUID(k.id) === targetUuid || toValidUUID(k.id) === komunitasId
  );
  if (directMatch) return directMatch;

  if (komunitasId.startsWith("kom-warga-")) {
    const match = komunitasId.match(/^kom-warga-(.+?)-(?:rw|rt)(\d+)-(?:rw|rt)(\d+)$/);
    if (match) {
      const geoSlug = match[1];
      const val1 = match[2];
      const val2 = match[3];

      let rw = val1;
      let rt = val2;
      if (komunitasId.includes(`rt${val1}`)) {
        rt = val1;
        rw = val2;
      }

      for (const [kecName, kecData] of Object.entries(KOTA_TEGAL_DATA)) {
        const kecSlug = slugify(kecName);
        for (const kelName of Object.keys(kecData.kelurahan)) {
          const kelSlug = slugify(kelName);
          if (
            geoSlug === `${kecSlug}-${kelSlug}` ||
            geoSlug === `${kelSlug}` ||
            geoSlug.includes(kelSlug)
          ) {
            return generateWargaKomunitasItem(kecName, kelName, rw, rt);
          }
        }
      }

      return generateWargaKomunitasItem("Kota Tegal", "Kota Tegal", rw, rt);
    }
  }

  return null;
}

