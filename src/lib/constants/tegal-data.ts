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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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

  return list;
}

export const MASTER_KOMUNITAS_SEED = buildMasterKomunitasSeed();


export const SEED_DATA_ANAK: import("@/types/database").DataAnakItem[] = [
  {
    id: "anak-1",
    nama_lengkap: "Arka Rayyan Pratama",
    tanggal_lahir: "2023-04-15",
    jenis_kelamin: "L",
    nama_orangtua: "Budi Santoso & Ratna Sari",
    nomor_hp: "081234567890",
    tinggal_bersama: "Orang Tua",
    jarak_rumah_km: 0.3,
    is_sekolah: true,
    nama_sekolah: "RA Sakila Kerti Panggung",
    alasan_sekolah: "Sudah Usia PAUD & Persiapan Ke SD",
    komunitas_id: "kom-paud-1",
    komunitas_nama: "RA Sakila Kerti Panggung",
    status_approval: "approved",
    validated_by: "Kader Posyandu Mawar",
    validated_at: "2026-08-10T08:00:00Z",
    created_by: "user-1",
    created_at: "2026-08-01T09:00:00Z",
    latest_ddks: {
      id: "ddks-1-2",
      data_anak_id: "anak-1",
      berat_badan: 14.5,
      tinggi_badan: 96.0,
      panjang_badan: 96.0,
      lingkar_kepala: 48.5,
      catatan: "Gizi baik, perkembangan motorik sesuai kurva WHO.",
      created_at: "2026-09-15T08:30:00Z",
      profiles: { nama_lengkap: "Ibu Rahayu (Bidan Posyandu)" },
    },
    ddks_history: [
      {
        id: "ddks-1-2",
        data_anak_id: "anak-1",
        berat_badan: 14.5,
        tinggi_badan: 96.0,
        panjang_badan: 96.0,
        lingkar_kepala: 48.5,
        catatan: "Gizi baik, perkembangan motorik sesuai kurva WHO.",
        created_at: "2026-09-15T08:30:00Z",
        profiles: { nama_lengkap: "Ibu Rahayu (Bidan Posyandu)" },
      },
      {
        id: "ddks-1-1",
        data_anak_id: "anak-1",
        berat_badan: 13.8,
        tinggi_badan: 94.0,
        panjang_badan: 94.0,
        lingkar_kepala: 48.0,
        catatan: "Penimbangan rutin balita.",
        created_at: "2026-08-12T08:30:00Z",
        profiles: { nama_lengkap: "Ibu Siti (Kader Kamboja)" },
      },
    ],
  },
  {
    id: "anak-2",
    nama_lengkap: "Aisyah Nur Khalifah",
    tanggal_lahir: "2024-01-20",
    jenis_kelamin: "P",
    nama_orangtua: "Ahmad Fauzi",
    nomor_hp: "081399887766",
    tinggal_bersama: "Orang Tua",
    jarak_rumah_km: 0.1,
    is_sekolah: false,
    nama_sekolah: "Belum Sekolah",
    alasan_sekolah: "Belum Wajib (Masih Balita)",
    komunitas_id: "kom-posyandu-1",
    komunitas_nama: "Posyandu Kamboja 1 Kejambon",
    status_approval: "pending",
    created_by: "user-2",
    created_at: "2026-09-20T10:15:00Z",
    latest_ddks: {
      id: "ddks-2-1",
      data_anak_id: "anak-2",
      berat_badan: 11.2,
      tinggi_badan: 84.5,
      panjang_badan: 84.5,
      lingkar_kepala: 46.0,
      catatan: "Imunisasi lengkap dan vitamin A diberikan.",
      created_at: "2026-09-20T10:20:00Z",
      profiles: { nama_lengkap: "Kader Posyandu Kamboja" },
    },
    ddks_history: [
      {
        id: "ddks-2-1",
        data_anak_id: "anak-2",
        berat_badan: 11.2,
        tinggi_badan: 84.5,
        panjang_badan: 84.5,
        lingkar_kepala: 46.0,
        catatan: "Imunisasi lengkap dan vitamin A diberikan.",
        created_at: "2026-09-20T10:20:00Z",
        profiles: { nama_lengkap: "Kader Posyandu Kamboja" },
      },
    ],
  },
  {
    id: "anak-3",
    nama_lengkap: "Muhammad Bilal Al-Ghifari",
    tanggal_lahir: "2022-11-10",
    jenis_kelamin: "L",
    nama_orangtua: "Hendrawan & Maya",
    nomor_hp: "087811223344",
    tinggal_bersama: "Kakek / Nenek",
    jarak_rumah_km: 0.5,
    is_sekolah: true,
    nama_sekolah: "KB / TK Pembina Kejambon",
    alasan_sekolah: "Agar Mandiri & Bersosialisasi",
    komunitas_id: "kom-warga-1",
    komunitas_nama: "Warga RT 03 RW 02 Kejambon",
    status_approval: "approved",
    validated_by: "Pengurus RT 03",
    validated_at: "2026-09-01T14:00:00Z",
    created_by: "user-3",
    created_at: "2026-08-25T11:00:00Z",
    latest_ddks: {
      id: "ddks-3-1",
      data_anak_id: "anak-3",
      berat_badan: 16.0,
      tinggi_badan: 102.0,
      panjang_badan: 102.0,
      lingkar_kepala: 49.5,
      catatan: "Pertumbuhan tinggi badan sangat optimal.",
      created_at: "2026-09-10T09:00:00Z",
      profiles: { nama_lengkap: "Bidan Desa" },
    },
    ddks_history: [
      {
        id: "ddks-3-1",
        data_anak_id: "anak-3",
        berat_badan: 16.0,
        tinggi_badan: 102.0,
        panjang_badan: 102.0,
        lingkar_kepala: 49.5,
        catatan: "Pertumbuhan tinggi badan sangat optimal.",
        created_at: "2026-09-10T09:00:00Z",
        profiles: { nama_lengkap: "Bidan Desa" },
      },
    ],
  },
];

export const SEED_MARKET_PRODUK: import("@/types/database").MarketProduk[] = [
  {
    id: "prod-1",
    nama: "Paket Alat Permainan Edukatif (APE Kit) PAUD & Balita",
    deskripsi:
      "Paket mainan edukatif kayu bersertifikasi SNI untuk melatih motorik halus, pengenalan warna, bentuk geometri, dan stimulasi kognitif anak usia 1-6 tahun. Cocok untuk Posyandu dan Satuan PAUD.",
    kategori: "Edukasi PAUD",
    harga: 145000,
    stok: 25,
    gambar_url:
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80",
    is_active: true,
    berat_gram: 1200,
  },
  {
    id: "prod-2",
    nama: "Pita LiLA & Meteran Lingkar Kepala Standar Kemenkes",
    deskripsi:
      "Pita ukur Lingkar Lengan Atas (LiLA) dan meteran lingkar kepala anak dengan indikator warna deteksi dini risiko KEK (Kekurangan Energi Kronis) dan stunting.",
    kategori: "Alat Posyandu",
    harga: 35000,
    stok: 50,
    gambar_url:
      "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80",
    is_active: true,
    berat_gram: 150,
  },
  {
    id: "prod-3",
    nama: "Buku KIA (Kesehatan Ibu & Anak) Edisi Resmi Revisi Kota Tegal",
    deskripsi:
      "Buku pedoman catatan kesehatan ibu hamil, nifas, bayi, dan balita lengkap dengan kurva KMS (Kartu Menuju Sehat) WHO terbaru dan grafik evaluasi imunisasi.",
    kategori: "Buku & Modul",
    harga: 28000,
    stok: 80,
    gambar_url:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
    is_active: true,
    berat_gram: 300,
  },
  {
    id: "prod-4",
    nama: "Timbangan Digital Bayi & Balita Presisi Tinggi (Kapasitas 25kg)",
    deskripsi:
      "Timbangan digital multifungsi dengan nampan ergonomis aman untuk bayi baru lahir hingga balita mandiri. Tingkat akurasi 5 gram, layar LCD backlight terang.",
    kategori: "Alat Posyandu",
    harga: 385000,
    stok: 12,
    gambar_url:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80",
    is_active: true,
    berat_gram: 2500,
  },
  {
    id: "prod-5",
    nama: "Kaos Polo Seragam Kader Jarimas (Bahan Katun Pique Premium)",
    deskripsi:
      "Seragam resmi Kader Posyandu dan Pengurus RT Jarimas-ID dengan bordir logo Jarimas presisi. Bahan adem, menyerap keringat, dan tahan luntur.",
    kategori: "Merchandise & Seragam",
    harga: 85000,
    stok: 40,
    gambar_url:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
    is_active: true,
    berat_gram: 250,
  },
  {
    id: "prod-6",
    nama: "Paket Suplemen MPASI & Taburia Multivitamin Balita Sehat",
    deskripsi:
      "Paket mikronutrien tabur bubuk untuk memperkaya kandungan gizi makanan pendamping ASI balita usia 6-24 bulan, diperkaya zat besi, zink, dan 14 vitamin esensial.",
    kategori: "Kesehatan & Gizi",
    harga: 45000,
    stok: 60,
    gambar_url:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
    is_active: true,
    berat_gram: 200,
  },
];

export const SEED_PESANAN: import("@/types/database").MarketPesanan[] = [
  {
    id: "pesanan-1",
    user_id: "user-1",
    produk_id: "prod-1",
    jumlah: 2,
    total_harga: 290000,
    status_pembayaran: "diproses",
    metode_pembayaran: "qris",
    nama_penerima: "Budi Santoso",
    nomor_hp: "081234567890",
    alamat_lengkap: "Jl. Ki Gede Sebayu No. 12, RT 03 RW 02",
    kecamatan: "Tegal Timur",
    kelurahan: "Kejambon",
    catatan: "Mohon dikirim pada jam kerja pagi",
    nomor_resi: "JRM-TG0129384",
    created_at: "2026-09-26T14:30:00Z",
    produk: SEED_MARKET_PRODUK[0],
    profiles: {
      nama_lengkap: "Budi Santoso",
      email: "budi.santoso@gmail.com",
      nomor_hp: "081234567890",
    },
  },
  {
    id: "pesanan-2",
    user_id: "user-2",
    produk_id: "prod-2",
    jumlah: 3,
    total_harga: 105000,
    status_pembayaran: "pending",
    metode_pembayaran: "transfer_bca",
    nama_penerima: "Siti Rahmawati (Kader Posyandu)",
    nomor_hp: "081399887766",
    alamat_lengkap: "Posyandu Mawar 1, Jl. Panggung Baru No. 4",
    kecamatan: "Tegal Timur",
    kelurahan: "Panggung",
    catatan: "Untuk kebutuhan penimbangan balita minggu ini",
    created_at: "2026-09-27T09:15:00Z",
    produk: SEED_MARKET_PRODUK[1],
    profiles: {
      nama_lengkap: "Siti Rahmawati",
      email: "siti.kader@gmail.com",
      nomor_hp: "081399887766",
    },
  },
];

