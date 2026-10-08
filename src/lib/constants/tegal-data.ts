import { SEED_POSYANDU_TEGAL } from "./seed-posyandu-tegal";
import { SEED_PAUD_PKBM_TEGAL, RAW_PAUD_PKBM_TEGAL } from "./seed-paud-tegal";
import { toValidUUID } from "@/lib/utils";

export { SEED_PAUD_PKBM_TEGAL, RAW_PAUD_PKBM_TEGAL };

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
    "nama": "Tegal Timur",
    "kelurahan": {
      "Kejambon": {
        "nama": "Kejambon",
        "posyandu": [
          "Posyandu Arimbi",
          "Posyandu Kamboja 1",
          "Posyandu Kamboja 2",
          "Posyandu Kemuning 1",
          "Posyandu Kemuning 2",
          "Posyandu Seruni",
          "Posyandu Tanjungsari",
          "Posyandu Teratai Merah"
        ],
        "paud": [
          "KB Aisyiyah Kejambon",
          "KB Ananda Mandiri",
          "KB Nurullah",
          "Pos PAUD Al Maemunah",
          "Pos PAUD Sekar Kamboja",
          "RA Permata Hati",
          "RA Perwanida",
          "TK Aisyiyah Bustanul Athfal III",
          "TK Aisyiyah Bustanul Athfal V",
          "TK Aisyiyah Bustanul Athfal XI",
          "TK Cendrawasih",
          "TK Masyithoh II",
          "TK Masyithoh IV",
          "TK Permata Ibu",
          "TK Pertiwi 25.13 Kejambon",
          "TPA Aisyiyah Kejambon",
          "TPA Ananda Mandiri"
        ]
      },
      "Panggung": {
        "nama": "Panggung",
        "posyandu": [
          "Posyandu Anggrek 1",
          "Posyandu Anggrek 2",
          "Posyandu Anyelir",
          "Posyandu Bahtera A",
          "Posyandu Bahtera B",
          "Posyandu Bahtera Serayu",
          "Posyandu Dahlia",
          "Posyandu Dewi Shinta",
          "Posyandu Harapan",
          "Posyandu Jaya Abadi",
          "Posyandu Kuntum Melati",
          "Posyandu Mekarsari",
          "Posyandu Melati",
          "Posyandu Nusa Indah 1",
          "Posyandu Nusa Indah 2",
          "Posyandu Seruni",
          "Posyandu Tulip"
        ],
        "paud": [
          "KB Aisyiyah Anak Sholeh",
          "KB Amalia",
          "KB Bina Anak Sholeh (BIAS)",
          "KB Ihsaniyah 3",
          "KB Prima Universal",
          "KB Sakila Kerti",
          "KB Sekar Melati",
          "KB Syi'arul Islam",
          "KB Syuhada",
          "KBI Usamah",
          "PAUD TPQ Nurul Huda",
          "PKBM Citra Mandiri",
          "PKBM Sakila Kerti",
          "Pos PAUD Anyelir",
          "Pos PAUD Nusa Indah",
          "Pos PAUD Seruni Panggung",
          "RA Sakila Kerti",
          "RA Syiarul Islam",
          "RA Syuhada",
          "RA Usamah",
          "TK Aisyiyah BA IX",
          "TK Aisyiyah Bustanul Athfal IV",
          "TK Aisyiyah Bustanul Athfal VI",
          "TK Aisyiyah Bustanul Athfal XII",
          "TK Ihsaniyah III",
          "TK Islam Ash Sholihin",
          "TK Kartika III-28",
          "TK Masyithoh VI",
          "TK Negeri Pembina Tegal Timur",
          "TK PGRI",
          "TK Pertiwi 25.6 Panggung",
          "TK Syiarul Islam",
          "TPA Usamah"
        ]
      },
      "Slerok": {
        "nama": "Slerok",
        "posyandu": [
          "Posyandu Abimanyu",
          "Posyandu Arjuna 1",
          "Posyandu Arjuna 2",
          "Posyandu Bima 1",
          "Posyandu Bima 2",
          "Posyandu Nakula 1",
          "Posyandu Nakula 2",
          "Posyandu Srikandi",
          "Posyandu Subali",
          "Posyandu Sukosrono",
          "Posyandu Sumbodro 1",
          "Posyandu Sumbodro 2",
          "Posyandu Werkudoro 1",
          "Posyandu Werkudoro 2"
        ],
        "paud": [
          "KB Darul Kifaah",
          "KB Istiqomah",
          "KB Nurunnisa",
          "KB Permata Hati",
          "KB Riyaadul Jannah",
          "KB Tarbiyatul Khasanah",
          "KB Transisi Anilo",
          "PAUD TPQ Ath Thohiriyah",
          "PKBM Sarana Maju",
          "PKBM Transisi Anilo",
          "Pos PAUD Kartini RW. VI",
          "Pos PAUD Sumbodro",
          "Pos PAUD Werkudoro",
          "RA Al Hasaniyah",
          "RA Istiqomah",
          "RA Miftahussalam",
          "TK Masyithoh VIII",
          "TK Nurunnisa",
          "TK Pertiwi 25.3 Slerok"
        ]
      },
      "Mintaragen": {
        "nama": "Mintaragen",
        "posyandu": [
          "Posyandu Anggrek",
          "Posyandu Anyelir",
          "Posyandu Bougenville",
          "Posyandu Flamboyan",
          "Posyandu Kenanga",
          "Posyandu Mawar",
          "Posyandu Melati",
          "Posyandu Nusa Indah 1",
          "Posyandu Nusa Indah 2",
          "Posyandu Sedap Malam",
          "Posyandu Seruni",
          "Posyandu Teratai"
        ],
        "paud": [
          "KB Ihsaniyah 1",
          "Pos PAUD Kenanga Mintaragen",
          "RA Usamah 2",
          "TK Aisyiyah Bustanul Athfal VII",
          "TK Al Hidayah 1",
          "TK Ihsaniyah 1"
        ]
      },
      "Mangkukusuman": {
        "nama": "Mangkukusuman",
        "posyandu": [
          "Posyandu Cempaka",
          "Posyandu Fatmawati",
          "Posyandu Kartini",
          "Posyandu Kenanga",
          "Posyandu Melati"
        ],
        "paud": [
          "PKBM Star of Tomorrow",
          "Pos PAUD Cermai",
          "TK Aisyiyah Bustanul Athfal I",
          "TK Masyithoh III"
        ]
      }
    }
  },
  "Tegal Barat": {
    "nama": "Tegal Barat",
    "kelurahan": {
      "Kraton": {
        "nama": "Kraton",
        "posyandu": [
          "Posyandu Astika A",
          "Posyandu Astika B",
          "Posyandu Astika C",
          "Posyandu Dewi Sartika",
          "Posyandu Kartini A",
          "Posyandu Kartini B",
          "Posyandu Kenanga A",
          "Posyandu Mawar A",
          "Posyandu Mawar A",
          "Posyandu Mayangsari",
          "Posyandu Nusa Indah",
          "Posyandu Sekar Indah A",
          "Posyandu Sekar Indah B",
          "Posyandu Seruni"
        ],
        "paud": [
          "KB Aisyiyah Tegal Barat",
          "KB Elkana",
          "KB Pelita Harapan Bangsa",
          "KB Pius",
          "Pos PAUD Dewi Sartika Kraton",
          "Pos PAUD Kartini",
          "Pos PAUD Kenanga Kraton",
          "TK Aisyiyah Bustanul Athfal VIII",
          "TK Al Khairiyyah",
          "TK Assyifa",
          "TK Elkana",
          "TK Little Star",
          "TK Pertiwi 25.5 Kraton",
          "TK Pius",
          "UPTD SPNF Sanggar Kegiatan Belajar Kota Tegal"
        ]
      },
      "Tegalsari": {
        "nama": "Tegalsari",
        "posyandu": [
          "Posyandu Anggrek Unggu",
          "Posyandu Bougenville",
          "Posyandu Kamboja",
          "Posyandu Kenanga A",
          "Posyandu Kenanga B",
          "Posyandu Kuncup Mekar",
          "Posyandu Layangsari A",
          "Posyandu Layangsari B",
          "Posyandu Mawar  Merah",
          "Posyandu Mekarsari",
          "Posyandu Melatisari A",
          "Posyandu Melatisari B",
          "Posyandu Mina Bahari",
          "Posyandu Minasari",
          "Posyandu Sejahtera 1",
          "Posyandu Sejahtera 2",
          "Posyandu Tunas Bahari",
          "Posyandu Wijayakusuma A",
          "Posyandu Wijayakusuma B"
        ],
        "paud": [
          "KB Insan Mandiri",
          "KB Kalimasada",
          "KB Little Star",
          "KB Tunas Hidup Harapan Kita",
          "PKBM Maju Bersama",
          "Pos PAUD Bougenville Tegalsari",
          "Pos PAUD Mawar Merah",
          "Pos PAUD Melati Sari",
          "Pos PAUD Sekar Melati",
          "TK Persatuan Ummat Islam (PUI) Cabang Tegal",
          "TK Pertiwi 25.4 Tegalsari",
          "TK Shining Little Star",
          "TK Tunas Hidup Harapan Kita",
          "TK Tut Wuri"
        ]
      },
      "Kemandungan": {
        "nama": "Kemandungan",
        "posyandu": [
          "Posyandu Cempaka",
          "Posyandu Melati",
          "Posyandu Seruni"
        ],
        "paud": [
          "KB Bina Anak Sholeh (BIAS)",
          "KB Global Inbyra School",
          "KB Mutiara Shahabat",
          "Pos PAUD Kenanga Kemandungan",
          "TK Global Inbyra School",
          "TK Pertiwi 25.2 Kemandungan"
        ]
      },
      "Pekauman": {
        "nama": "Pekauman",
        "posyandu": [
          "Posyandu Belimbing",
          "Posyandu Duku",
          "Posyandu Garuda",
          "Posyandu Jalak",
          "Posyandu Nanas",
          "Posyandu Tunas"
        ],
        "paud": [
          "KB Al-Irsyad",
          "KB At-Taqwa",
          "KB Azzurofah",
          "KB Elfath Kids",
          "KB Homeschooling ABC D",
          "KB Kiddy Care",
          "PKBM Bina Harapan",
          "PKBM Budi Luhur",
          "PKBM Mutiara Shahabat",
          "Pos PAUD Delima",
          "RA At Taqwa",
          "TK Al-Irsyad Al-Islamiyah",
          "TK Bagya Wacana",
          "TK Hang Tuah 16",
          "TK Islam Azzurofah",
          "TK Kiddy Care",
          "TK Negeri Pembina Kota Tegal",
          "TK Pertiwi 25.7 Pekauman"
        ]
      },
      "Muarareja": {
        "nama": "Muarareja",
        "posyandu": [
          "Posyandu Anggrek",
          "Posyandu Cempaka",
          "Posyandu Dahlia",
          "Posyandu Kemuning",
          "Posyandu Mawar",
          "Posyandu Melati",
          "Posyandu Nusa Indah"
        ],
        "paud": [
          "PAUD TPQ Plus Insan Kamil",
          "Pos PAUD Mawar",
          "TK Nurul Huda"
        ]
      },
      "Debong Lor": {
        "nama": "Debong Lor",
        "posyandu": [
          "Posyandu Mawar",
          "Posyandu Sartika",
          "Posyandu Seruni 1",
          "Posyandu Seruni 2"
        ],
        "paud": [
          "Pos PAUD Seruni Debong Lor"
        ]
      },
      "Pesurungan Kidul": {
        "nama": "Pesurungan Kidul",
        "posyandu": [
          "Posyandu Anggrek Kidul",
          "Posyandu Kamboja Asri",
          "Posyandu Mawar Kidul",
          "Posyandu Melati Kidul 1",
          "Posyandu Melati Kidul 2",
          "Posyandu Teratai Pesurungan Kidul 1",
          "Posyandu Teratai Pesurungan Kidul 2"
        ],
        "paud": [
          "KB Islam Al Azhar 66 Kota Tegal",
          "KB Mekar",
          "KB Sofa Marwah",
          "PKBM Mekar",
          "Pos PAUD Melati Pesurungan Kidul",
          "TK Islam Al Azhar 66 Kota Tegal",
          "TK Pertiwi 25.8 Pesurungan Kidul"
        ]
      }
    }
  },
  "Tegal Selatan": {
    "nama": "Tegal Selatan",
    "kelurahan": {
      "Bandung": {
        "nama": "Bandung",
        "posyandu": [
          "Posyandu Melati I",
          "Posyandu Melati II",
          "Posyandu Melati III",
          "Posyandu Melati IV",
          "Posyandu Melati V"
        ],
        "paud": [
          "Pos PAUD Sejahtera",
          "TK Aisyiyah Bustanul Athfal XIII",
          "TK Pertiwi 25.9 Bandung"
        ]
      },
      "Debong Kidul": {
        "nama": "Debong Kidul",
        "posyandu": [
          "Posyandu Seruni I",
          "Posyandu Seruni II",
          "Posyandu Seruni III",
          "Posyandu Seruni IV"
        ],
        "paud": [
          "KB Debong Kidul",
          "PKBM Arum Indah",
          "Pos PAUD Mekar Sari"
        ]
      },
      "Debong Kulon": {
        "nama": "Debong Kulon",
        "posyandu": [
          "Posyandu Cempaka",
          "Posyandu Kenanga",
          "Posyandu Mawar",
          "Posyandu Melati",
          "Posyandu Nusa Indah"
        ],
        "paud": [
          "Pos PAUD Dewi Sartika Debong Kulon",
          "TK Darunnajah"
        ]
      },
      "Debong Tengah": {
        "nama": "Debong Tengah",
        "posyandu": [
          "Posyandu Anggrek 1",
          "Posyandu Anggrek 2",
          "Posyandu Anyelir A",
          "Posyandu Anyelir B",
          "Posyandu Bougenville",
          "Posyandu Lengkeng",
          "Posyandu Teratai",
          "Posyandu Tulip"
        ],
        "paud": [
          "KB Aisyiyah Baitul Karim",
          "KB Qurrota A'yun",
          "PAUD TPQ Al-Mukhlishin",
          "Pos PAUD Bianglala",
          "TK Al Khidmah",
          "TK Baiturrokhman",
          "TK Kemala Bhayangkari 25",
          "TK Pertiwi 25.10 Debong Tengah"
        ]
      },
      "Kalinyamat Wetan": {
        "nama": "Kalinyamat Wetan",
        "posyandu": [
          "Posyandu Dahlia I",
          "Posyandu Dahlia II",
          "Posyandu Dahlia III",
          "Posyandu Dahlia IV"
        ],
        "paud": [
          "KB Jaya Lestari",
          "Pos PAUD Balita Jaya",
          "TK Al Quran Al Haromain"
        ]
      },
      "Keturen": {
        "nama": "Keturen",
        "posyandu": [
          "Posyandu Kemuning I",
          "Posyandu Kemuning II",
          "Posyandu Kemuning III Selatan",
          "Posyandu Kemuning III Utara"
        ],
        "paud": [
          "KB Sekar Kemuning",
          "TK Negeri Pembina Tegal Selatan"
        ]
      },
      "Randugunting": {
        "nama": "Randugunting",
        "posyandu": [
          "Posyandu Ababil",
          "Posyandu Cendrawasih",
          "Posyandu Garuda A",
          "Posyandu Garuda B",
          "Posyandu Gelatik",
          "Posyandu Kasuari",
          "Posyandu Ketilang",
          "Posyandu Merak",
          "Posyandu Merpati",
          "Posyandu Mliwis",
          "Posyandu Nuri",
          "Posyandu Puter",
          "Posyandu Rajawali"
        ],
        "paud": [
          "KB Bias Assalam",
          "KB Hidayatul Mubtadi-ien",
          "KB Pelita Hati",
          "KB Primagama Islami",
          "KB Raudlotul Jannah",
          "KB Tunas Harapan Bangsa",
          "Pos PAUD Tunas Harapan Randugunting",
          "RA BIAS Assalam",
          "RA Hidayatul Mubtadiien",
          "SPS PAUD TPQ Tahfidz Cahaya Quran",
          "TK Aisyiyah Bustanul Athfal II",
          "TK Al Hidayah II",
          "TK Masyithoh 1",
          "TK Nurus Sunnah",
          "TK Pelita Hati",
          "TK Pertiwi 25.1 Randugunting",
          "TK Primagama Islami",
          "TPA Bias Assalam"
        ]
      },
      "Tunon": {
        "nama": "Tunon",
        "posyandu": [
          "Posyandu Mawar I",
          "Posyandu Mawar II",
          "Posyandu Mawar III",
          "Posyandu Mawar IV"
        ],
        "paud": [
          "Pos PAUD Tunas Mutiara",
          "RA Baitush Shobirin",
          "TK Masyithoh V"
        ]
      }
    }
  },
  "Margadana": {
    "nama": "Margadana",
    "kelurahan": {
      "Margadana": {
        "nama": "Margadana",
        "posyandu": [
          "Posyandu Anggrek Bulan",
          "Posyandu Anyelir",
          "Posyandu Bougenville",
          "Posyandu Cempaka 1",
          "Posyandu Cempaka 2",
          "Posyandu Dahlia",
          "Posyandu Edelweis",
          "Posyandu Jagadipa",
          "Posyandu Kenanga",
          "Posyandu Kesambi Sari",
          "Posyandu Lavender",
          "Posyandu Sedap Malam",
          "Posyandu Suflir",
          "Posyandu Wijaya Kusuma"
        ],
        "paud": [
          "KB Minat",
          "KB Pelita Bangsa",
          "KB Rumah Bintang",
          "PAUD TPQ Al-Munawwaroh",
          "Pos PAUD Anggrek Bulan",
          "Pos PAUD Bougenville Margadana",
          "Pos PAUD Kesambi Sari",
          "RA Al Furqon",
          "TK Negeri Pembina Kecamatan Margadana"
        ]
      },
      "Cabawan": {
        "nama": "Cabawan",
        "posyandu": [
          "Posyandu Anggerk RW 1",
          "Posyandu Bougenville RW 2",
          "Posyandu Cempaka RW 3",
          "Posyandu Dahlia RW 4"
        ],
        "paud": [
          "PAUD TPQ At Taqwa",
          "Pos PAUD Tunas Ceria"
        ]
      },
      "Kaligangsa": {
        "nama": "Kaligangsa",
        "posyandu": [
          "Posyandu Anggrek",
          "Posyandu Bougenville",
          "Posyandu Cempaka",
          "Posyandu Dahlia",
          "Posyandu Flamboyan",
          "Posyandu Melati",
          "Posyandu Rosela"
        ],
        "paud": [
          "KB Al-Izzah",
          "PAUD TPQ Al-Izzah",
          "Pos PAUD Anggrek",
          "Pos PAUD Sakura",
          "RA Al-Izzah",
          "RA Miftahun Najah"
        ]
      },
      "Kalinyamat Kulon": {
        "nama": "Kalinyamat Kulon",
        "posyandu": [
          "Posyandu Anggrek Kalinyamat Kulon 1",
          "Posyandu Anggrek Kalinyamat Kulon 2",
          "Posyandu Dahlia Sejahtera",
          "Posyandu Kenanga Kulon",
          "Posyandu Mawar Kalinyamat",
          "Posyandu Melati Kulon",
          "Posyandu Teratai Sehat"
        ],
        "paud": [
          "PAUD TPQ Al-Hikmah",
          "Pos PAUD Melati Kalinyamat Kulon",
          "TK Pertiwi 25.12 Kalinyamat Kulon"
        ]
      },
      "Krandon": {
        "nama": "Krandon",
        "posyandu": [
          "Posyandu Berlian",
          "Posyandu Intan",
          "Posyandu Mutiara",
          "Posyandu Permata"
        ],
        "paud": [
          "KB Telaga Ilmu",
          "Pos PAUD Tunas Bangsa",
          "Pos PAUD Tunas Harapan Krandon",
          "Pos PAUD Tunas Muda"
        ]
      },
      "Pesurungan Lor": {
        "nama": "Pesurungan Lor",
        "posyandu": [
          "Posyandu Anggrek",
          "Posyandu Jaya Samudera",
          "Posyandu Mawar",
          "Posyandu Melati"
        ],
        "paud": [
          "Pos PAUD Insan Cendikia",
          "RA Baitul Iman",
          "TK Mubarokah"
        ]
      },
      "Sumurpanggang": {
        "nama": "Sumurpanggang",
        "posyandu": [
          "Posyandu Cempaka",
          "Posyandu Manggis",
          "Posyandu Mawar",
          "Posyandu Melati",
          "Posyandu Nur Hikmah",
          "Posyandu Ragasela"
        ],
        "paud": [
          "KB Insan Cerdas",
          "PAUD TPQ Fahmal Qur'an",
          "PKBM Ki Hajar Dewantara",
          "Pos PAUD Seruni Sumurpanggang",
          "TK Aisyiyah Bustanul Athfal X",
          "TK Masyithoh VII",
          "TK Tarbiyatul Islamiyah"
        ]
      }
    }
  }
};

export const DAFTAR_KECAMATAN_TEGAL = Object.keys(KOTA_TEGAL_DATA);

export const DAFTAR_RW_TEGAL = Array.from({ length: 15 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

export const DAFTAR_RT_TEGAL = Array.from({ length: 15 }, (_, i) =>
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
  jenis_institusi?: "TK" | "KB" | "RA" | "SPS" | "TPA" | "PKBM" | "SKB" | string;
  npsn?: string;
  kecamatan: string;
  kelurahan: string;
  rt?: string;
  rw?: string;
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
    // --- SPECIAL PRE-CONFIGURED SEED ITEMS (Warga Kita) ---
    {
      id: "kom-warga-kota-tegal",
      nama: "Warga Kota Tegal",
      jenis: "warga_kita",
      kecamatan: "Kota Tegal",
      kelurahan: "Semua Kelurahan",
      rt: "",
      rw: "",
      lokasi: "Pemerintah Kota Tegal, Jawa Tengah",
      deskripsi:
        "Komunitas resmi seluruh warga masyarakat Kota Tegal, Jawa Tengah. Wadah kebersamaan, koordinasi layanan publik, kesehatan keluarga, dan partisipasi warga se-Kota Tegal.",
      kontak: "Pemerintah Kota Tegal / Forum Warga Kota Tegal",
      jadwal: "Forum Komunikasi & Pelayanan Warga Tingkat Kota Tegal",
    },
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
      jadwal: "Senin Lansia & Balita Sehat Setiap Sabtu",
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
  ];

  const existingIds = new Set(list.map((item) => item.id));

  // Loop through all kecamatan and kelurahan in Kota Tegal untuk Komunitas Warga
  for (const [kecName, kecData] of Object.entries(KOTA_TEGAL_DATA)) {
    for (const kelName of Object.keys(kecData.kelurahan)) {
      const kelSlug = slugify(kelName);
      const kecSlug = slugify(kecName);

      // Warga Kita (Generate 2 RT/RW per kelurahan if not exists)
      const warga1Id = `kom-warga-${kecSlug}-${kelSlug}-rt01-rw01`;
      if (
        !existingIds.has(warga1Id) &&
        !(kelName === "Kejambon" && kecName === "Tegal Timur") &&
        !(kelName === "Panggung" && kecName === "Tegal Timur") &&
        !(kelName === "Kraton" && kecName === "Tegal Barat") &&
        !(kelName === "Margadana" && kecName === "Margadana")
      ) {
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
    }
  }

  // Masukkan seluruh 236 Posyandu resmi se-Kota Tegal dari SEED_POSYANDU_TEGAL
  if (Array.isArray(SEED_POSYANDU_TEGAL)) {
    for (const pos of SEED_POSYANDU_TEGAL) {
      if (!existingIds.has(pos.id)) {
        list.push(pos);
        existingIds.add(pos.id);
      }
    }
  }

  // Masukkan seluruh Satuan PAUD & PKBM resmi se-Kota Tegal dari SEED_PAUD_PKBM_TEGAL
  if (Array.isArray(SEED_PAUD_PKBM_TEGAL)) {
    for (const paud of SEED_PAUD_PKBM_TEGAL) {
      if (!existingIds.has(paud.id)) {
        list.push(paud);
        existingIds.add(paud.id);
      }
    }
  }

  return list;
}

export const MASTER_KOMUNITAS_SEED = buildMasterKomunitasSeed();

export function generateWargaKomunitasHierarchy({
  kecamatan,
  kelurahan,
  rw,
  rt,
}: {
  kecamatan?: string;
  kelurahan?: string;
  rw?: string;
  rt?: string;
}): MasterKomunitasSeedItem[] {
  const hasKec = Boolean(kecamatan && kecamatan !== "semua");
  const hasKel = Boolean(kelurahan && kelurahan !== "semua");
  const hasRw = Boolean(rw && rw !== "semua");
  const hasRt = Boolean(rt && rt !== "semua");

  // 1. Kasus 4 Filter Lengkap: Kecamatan, Kelurahan, RW, RT
  if (hasKec && hasKel && hasRw && hasRt) {
    const cleanRt = (rt || "01").replace(/\D/g, "").padStart(2, "0");
    const cleanRw = (rw || "01").replace(/\D/g, "").padStart(2, "0");
    const id = `kom-warga-${slugify(kecamatan!)}-${slugify(kelurahan!)}-rw${cleanRw}-rt${cleanRt}`;
    return [
      {
        id,
        nama: `Warga RT: ${cleanRt}, RW: ${cleanRw}, Kelurahan: ${kelurahan}, Kecamatan: ${kecamatan}`,
        jenis: "warga_kita",
        kecamatan: kecamatan!,
        kelurahan: kelurahan!,
        rt: cleanRt,
        rw: cleanRw,
        lokasi: `Lingkungan RT ${cleanRt} / RW ${cleanRw}, Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal`,
        deskripsi: `Komunitas paguyuban rukun tetangga warga RT ${cleanRt} RW ${cleanRw} Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal.`,
        kontak: `Pengurus RT ${cleanRt} / RW ${cleanRw}`,
        jadwal: "Pertemuan Rutin Warga Setiap Bulan",
      },
    ];
  }

  // 2. Kasus 3 Filter: Kecamatan, Kelurahan, RW
  if (hasKec && hasKel && hasRw) {
    const cleanRw = (rw || "01").replace(/\D/g, "").padStart(2, "0");
    const mainId = `kom-warga-${slugify(kecamatan!)}-${slugify(kelurahan!)}-rw${cleanRw}`;
    const items: MasterKomunitasSeedItem[] = [
      {
        id: mainId,
        nama: `Warga RW: ${cleanRw}, Kelurahan: ${kelurahan}, Kecamatan: ${kecamatan}`,
        jenis: "warga_kita",
        kecamatan: kecamatan!,
        kelurahan: kelurahan!,
        rt: "",
        rw: cleanRw,
        lokasi: `Balai RW ${cleanRw}, Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal`,
        deskripsi: `Komunitas rukun warga tingkat RW ${cleanRw} Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal.`,
        kontak: `Pengurus RW ${cleanRw}`,
        jadwal: "Rembug RW dan Pertemuan Warga Bulanan",
      },
    ];

    // Sertakan 15 Komunitas RT di bawah RW ini (RT 01 s/d RT 15)
    for (let i = 1; i <= 15; i++) {
      const rtStr = String(i).padStart(2, "0");
      items.push({
        id: `kom-warga-${slugify(kecamatan!)}-${slugify(kelurahan!)}-rw${cleanRw}-rt${rtStr}`,
        nama: `Warga RT: ${rtStr}, RW: ${cleanRw}, Kelurahan: ${kelurahan}, Kecamatan: ${kecamatan}`,
        jenis: "warga_kita",
        kecamatan: kecamatan!,
        kelurahan: kelurahan!,
        rt: rtStr,
        rw: cleanRw,
        lokasi: `Lingkungan RT ${rtStr} / RW ${cleanRw}, Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal`,
        deskripsi: `Komunitas warga RT ${rtStr} RW ${cleanRw} Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal.`,
        kontak: `Pengurus RT ${rtStr}`,
        jadwal: "Pertemuan Rutin RT Bulanan",
      });
    }

    return items;
  }

  // 3. Kasus 2 Filter: Kecamatan, Kelurahan
  if (hasKec && hasKel) {
    const mainId = `kom-warga-${slugify(kecamatan!)}-${slugify(kelurahan!)}`;
    const items: MasterKomunitasSeedItem[] = [
      {
        id: mainId,
        nama: `Warga Kelurahan: ${kelurahan}, Kecamatan: ${kecamatan}`,
        jenis: "warga_kita",
        kecamatan: kecamatan!,
        kelurahan: kelurahan!,
        rt: "",
        rw: "",
        lokasi: `Kantor Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal`,
        deskripsi: `Komunitas seluruh warga di wilayah Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal.`,
        kontak: `Sekretariat Kelurahan ${kelurahan}`,
        jadwal: "Forum Komunikasi Warga Kelurahan",
      },
    ];

    // Sertakan 15 Komunitas RW di bawah Kelurahan ini (RW 01 s/d RW 15)
    for (let r = 1; r <= 15; r++) {
      const rwStr = String(r).padStart(2, "0");
      items.push({
        id: `kom-warga-${slugify(kecamatan!)}-${slugify(kelurahan!)}-rw${rwStr}`,
        nama: `Warga RW: ${rwStr}, Kelurahan: ${kelurahan}, Kecamatan: ${kecamatan}`,
        jenis: "warga_kita",
        kecamatan: kecamatan!,
        kelurahan: kelurahan!,
        rt: "",
        rw: rwStr,
        lokasi: `Balai RW ${rwStr}, Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal`,
        deskripsi: `Komunitas rukun warga tingkat RW ${rwStr} Kelurahan ${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal.`,
        kontak: `Pengurus RW ${rwStr}`,
        jadwal: "Rembug RW Bulanan",
      });
    }

    return items;
  }

  // 4. Kasus 1 Filter: Kecamatan
  if (hasKec) {
    const mainId = `kom-warga-${slugify(kecamatan!)}`;
    const items: MasterKomunitasSeedItem[] = [
      {
        id: mainId,
        nama: `Warga Kecamatan: ${kecamatan}`,
        jenis: "warga_kita",
        kecamatan: kecamatan!,
        kelurahan: "Semua Kelurahan",
        rt: "",
        rw: "",
        lokasi: `Kecamatan ${kecamatan}, Kota Tegal`,
        deskripsi: `Komunitas paguyuban warga se-Kecamatan ${kecamatan}, Kota Tegal.`,
        kontak: `Sekretariat Kecamatan ${kecamatan}`,
        jadwal: "Pertemuan Komunitas Warga Kecamatan",
      },
    ];

    // Ambil semua kelurahan di kecamatan ini dari KOTA_TEGAL_DATA
    const kecData = KOTA_TEGAL_DATA[kecamatan!];
    if (kecData && kecData.kelurahan) {
      Object.keys(kecData.kelurahan).forEach((kel) => {
        items.push({
          id: `kom-warga-${slugify(kecamatan!)}-${slugify(kel)}`,
          nama: `Warga Kelurahan: ${kel}, Kecamatan: ${kecamatan}`,
          jenis: "warga_kita",
          kecamatan: kecamatan!,
          kelurahan: kel,
          rt: "",
          rw: "",
          lokasi: `Kelurahan ${kel}, Kecamatan ${kecamatan}, Kota Tegal`,
          deskripsi: `Komunitas warga tingkat Kelurahan ${kel}, Kecamatan ${kecamatan}, Kota Tegal.`,
          kontak: `Sekretariat Kelurahan ${kel}`,
          jadwal: "Pertemuan Warga Kelurahan",
        });
      });
    }

    return items;
  }

  // 5. Kasus Semua Kecamatan (Default tanpa filter)
  // Menampilkan 1 Komunitas Kota Tegal + 4 Komunitas Kecamatan + Komunitas Seluruh 27 Kelurahan Se-Kota Tegal
  const items: MasterKomunitasSeedItem[] = [
    {
      id: "kom-warga-kota-tegal",
      nama: "Warga Kota Tegal",
      jenis: "warga_kita",
      kecamatan: "Kota Tegal",
      kelurahan: "Semua Kelurahan",
      rt: "",
      rw: "",
      lokasi: "Pemerintah Kota Tegal, Jawa Tengah",
      deskripsi:
        "Komunitas resmi seluruh warga masyarakat Kota Tegal, Jawa Tengah. Wadah kebersamaan, koordinasi layanan publik, kesehatan keluarga, dan partisipasi warga se-Kota Tegal.",
      kontak: "Pemerintah Kota Tegal / Forum Warga Kota Tegal",
      jadwal: "Forum Komunikasi & Pelayanan Warga Tingkat Kota Tegal",
    },
  ];

  const kecamatans = ["Tegal Timur", "Tegal Barat", "Tegal Selatan", "Margadana"];

  // Tambahkan 4 Komunitas Tingkat Kecamatan
  kecamatans.forEach((kec) => {
    items.push({
      id: `kom-warga-${slugify(kec)}`,
      nama: `Warga Kecamatan: ${kec}`,
      jenis: "warga_kita",
      kecamatan: kec,
      kelurahan: "Semua Kelurahan",
      rt: "",
      rw: "",
      lokasi: `Kecamatan ${kec}, Kota Tegal`,
      deskripsi: `Komunitas paguyuban warga se-Kecamatan ${kec}, Kota Tegal.`,
      kontak: `Sekretariat Kecamatan ${kec}`,
      jadwal: "Pertemuan Komunitas Warga Tingkat Kecamatan",
    });
  });

  // Tambahkan 27 Komunitas Tingkat Kelurahan se-Kota Tegal
  for (const [kecName, kecData] of Object.entries(KOTA_TEGAL_DATA)) {
    for (const kelName of Object.keys(kecData.kelurahan)) {
      items.push({
        id: `kom-warga-${slugify(kecName)}-${slugify(kelName)}`,
        nama: `Warga Kelurahan: ${kelName}, Kecamatan: ${kecName}`,
        jenis: "warga_kita",
        kecamatan: kecName,
        kelurahan: kelName,
        rt: "",
        rw: "",
        lokasi: `Kantor Kelurahan ${kelName}, Kecamatan ${kecName}, Kota Tegal`,
        deskripsi: `Komunitas seluruh warga di wilayah Kelurahan ${kelName}, Kecamatan ${kecName}, Kota Tegal.`,
        kontak: `Sekretariat Kelurahan ${kelName}`,
        jadwal: "Forum Komunikasi Warga Kelurahan",
      });
    }
  }

  return items;
}

export function findOrGenerateKomunitasSeed(
  komunitasId: string
): MasterKomunitasSeedItem | null {
  if (!komunitasId) return null;

  const targetUuid = toValidUUID(komunitasId);
  const directMatch = MASTER_KOMUNITAS_SEED.find(
    (k) =>
      k.id === komunitasId ||
      toValidUUID(k.id) === targetUuid ||
      toValidUUID(k.id) === komunitasId
  );
  if (directMatch) return directMatch;

  // 0. Cocokkan Tingkat Kota Tegal
  if (
    komunitasId === "kom-warga-kota-tegal" ||
    komunitasId === "kom-warga-tegal" ||
    toValidUUID("kom-warga-kota-tegal") === targetUuid ||
    toValidUUID("kom-warga-kota-tegal") === komunitasId
  ) {
    return {
      id: "kom-warga-kota-tegal",
      nama: "Warga Kota Tegal",
      jenis: "warga_kita",
      kecamatan: "Kota Tegal",
      kelurahan: "Semua Kelurahan",
      rt: "",
      rw: "",
      lokasi: "Pemerintah Kota Tegal, Jawa Tengah",
      deskripsi:
        "Komunitas resmi seluruh warga masyarakat Kota Tegal, Jawa Tengah. Wadah kebersamaan, koordinasi layanan publik, kesehatan keluarga, dan partisipasi warga se-Kota Tegal.",
      kontak: "Pemerintah Kota Tegal / Forum Warga Kota Tegal",
      jadwal: "Forum Komunikasi & Pelayanan Warga Tingkat Kota Tegal",
    };
  }

  // Cek seluruh kemungkinan hierarki Warga Kota Tegal (Kecamatan, Kelurahan, RW 1..15, RT 1..15)
  for (const [kecName, kecData] of Object.entries(KOTA_TEGAL_DATA)) {
    const kecSlug = slugify(kecName);

    // 1. Cocokkan Tingkat Kecamatan: kom-warga-tegal-timur
    const kecId = `kom-warga-${kecSlug}`;
    if (
      komunitasId === kecId ||
      toValidUUID(kecId) === targetUuid ||
      toValidUUID(kecId) === komunitasId
    ) {
      return {
        id: kecId,
        nama: `Warga Kecamatan: ${kecName}`,
        jenis: "warga_kita",
        kecamatan: kecName,
        kelurahan: "Semua Kelurahan",
        rt: "",
        rw: "",
        lokasi: `Kecamatan ${kecName}, Kota Tegal`,
        deskripsi: `Komunitas paguyuban warga se-Kecamatan ${kecName}, Kota Tegal.`,
        kontak: `Sekretariat Kecamatan ${kecName}`,
        jadwal: "Pertemuan Komunitas Warga Tingkat Kecamatan",
      };
    }

    for (const kelName of Object.keys(kecData.kelurahan)) {
      const kelSlug = slugify(kelName);

      // 2. Cocokkan Tingkat Kelurahan: kom-warga-tegal-timur-kejambon
      const kelId = `kom-warga-${kecSlug}-${kelSlug}`;
      if (
        komunitasId === kelId ||
        toValidUUID(kelId) === targetUuid ||
        toValidUUID(kelId) === komunitasId
      ) {
        return {
          id: kelId,
          nama: `Warga Kelurahan: ${kelName}, Kecamatan: ${kecName}`,
          jenis: "warga_kita",
          kecamatan: kecName,
          kelurahan: kelName,
          rt: "",
          rw: "",
          lokasi: `Kantor Kelurahan ${kelName}, Kecamatan ${kecName}, Kota Tegal`,
          deskripsi: `Komunitas seluruh warga di wilayah Kelurahan ${kelName}, Kecamatan ${kecName}, Kota Tegal.`,
          kontak: `Sekretariat Kelurahan ${kelName}`,
          jadwal: "Forum Komunikasi Warga Kelurahan",
        };
      }

      // 3. Cocokkan Tingkat RW (RW 01 s/d RW 15)
      for (let r = 1; r <= 15; r++) {
        const rwStr = String(r).padStart(2, "0");
        const rwId = `kom-warga-${kecSlug}-${kelSlug}-rw${rwStr}`;
        if (
          komunitasId === rwId ||
          toValidUUID(rwId) === targetUuid ||
          toValidUUID(rwId) === komunitasId
        ) {
          return {
            id: rwId,
            nama: `Warga RW: ${rwStr}, Kelurahan: ${kelName}, Kecamatan: ${kecName}`,
            jenis: "warga_kita",
            kecamatan: kecName,
            kelurahan: kelName,
            rt: "",
            rw: rwStr,
            lokasi: `Balai RW ${rwStr}, Kelurahan ${kelName}, Kecamatan ${kecName}, Kota Tegal`,
            deskripsi: `Komunitas rukun warga tingkat RW ${rwStr} Kelurahan ${kelName}, Kecamatan ${kecName}, Kota Tegal.`,
            kontak: `Pengurus RW ${rwStr}`,
            jadwal: "Rembug RW dan Pertemuan Warga Bulanan",
          };
        }

        // 4. Cocokkan Tingkat RT (RT 01 s/d RT 15)
        for (let t = 1; t <= 15; t++) {
          const rtStr = String(t).padStart(2, "0");
          const rtId = `kom-warga-${kecSlug}-${kelSlug}-rw${rwStr}-rt${rtStr}`;
          if (
            komunitasId === rtId ||
            toValidUUID(rtId) === targetUuid ||
            toValidUUID(rtId) === komunitasId
          ) {
            return {
              id: rtId,
              nama: `Warga RT: ${rtStr}, RW: ${rwStr}, Kelurahan: ${kelName}, Kecamatan: ${kecName}`,
              jenis: "warga_kita",
              kecamatan: kecName,
              kelurahan: kelName,
              rt: rtStr,
              rw: rwStr,
              lokasi: `Lingkungan RT ${rtStr} / RW ${rwStr}, Kelurahan ${kelName}, Kecamatan ${kecName}, Kota Tegal`,
              deskripsi: `Komunitas paguyuban rukun tetangga warga RT ${rtStr} RW ${rwStr} Kelurahan ${kelName}, Kecamatan ${kecName}, Kota Tegal.`,
              kontak: `Pengurus RT ${rtStr} / RW ${rwStr}`,
              jadwal: "Pertemuan Rutin Warga Setiap Bulan",
            };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Mencari nama Kecamatan berdasarkan nama Kelurahan di Kota Tegal
 */
export function findKecamatanByKelurahan(kelurahanName?: string | null): string | null {
  if (!kelurahanName) return null;
  const cleanKel = kelurahanName
    .toLowerCase()
    .replace(/^(kelurahan|kel\.)\s+/i, "")
    .trim();

  for (const [kecName, kecData] of Object.entries(KOTA_TEGAL_DATA)) {
    for (const kName of Object.keys(kecData.kelurahan)) {
      if (kName.toLowerCase() === cleanKel) {
        return kecName;
      }
    }
  }
  return null;
}

/**
 * Mengambil rantai hierarki Warga Kita dari tingkat Kecamatan, Kelurahan, RW, hingga RT.
 * Digunakan agar saat user bergabung ke 1 RT, otomatis bergabung ke RW, Kelurahan, dan Kecamatan di atasnya.
 */
export function getWargaHierarchyChain(params: {
  kecamatan?: string | null;
  kelurahan?: string | null;
  rw?: string | null;
  rt?: string | null;
}): MasterKomunitasSeedItem[] {
  const { kecamatan, kelurahan, rw, rt } = params;

  const chain: MasterKomunitasSeedItem[] = [];

  // 0. Tingkat Kota Tegal (Puncak Hierarki Warga)
  const kotaItem: MasterKomunitasSeedItem = {
    id: "kom-warga-kota-tegal",
    nama: "Warga Kota Tegal",
    jenis: "warga_kita",
    kecamatan: "Kota Tegal",
    kelurahan: "Semua Kelurahan",
    rt: "",
    rw: "",
    lokasi: "Pemerintah Kota Tegal, Jawa Tengah",
    deskripsi:
      "Komunitas resmi seluruh warga masyarakat Kota Tegal, Jawa Tengah. Wadah kebersamaan, koordinasi layanan publik, kesehatan keluarga, dan partisipasi warga se-Kota Tegal.",
    kontak: "Pemerintah Kota Tegal / Forum Warga Kota Tegal",
    jadwal: "Forum Komunikasi & Pelayanan Warga Tingkat Kota Tegal",
  };
  chain.push(kotaItem);

  let targetKecamatan = kecamatan;
  if (
    (!targetKecamatan || targetKecamatan === "semua" || targetKecamatan === "Kota Tegal") &&
    kelurahan &&
    kelurahan !== "semua" &&
    kelurahan !== "Semua Kelurahan"
  ) {
    const foundKec = findKecamatanByKelurahan(kelurahan);
    if (foundKec) {
      targetKecamatan = foundKec;
    }
  }

  if (!targetKecamatan || targetKecamatan === "semua" || targetKecamatan === "Kota Tegal") {
    return chain;
  }

  const kecSlug = slugify(targetKecamatan);

  // 1. Tingkat Kecamatan
  const kecId = `kom-warga-${kecSlug}`;
  const kecItem = findOrGenerateKomunitasSeed(kecId) || {
    id: kecId,
    nama: `Warga Kecamatan: ${targetKecamatan}`,
    jenis: "warga_kita",
    kecamatan: targetKecamatan,
    kelurahan: "Semua Kelurahan",
    rt: "",
    rw: "",
    lokasi: `Kecamatan ${targetKecamatan}, Kota Tegal`,
    deskripsi: `Komunitas paguyuban warga se-Kecamatan ${targetKecamatan}, Kota Tegal.`,
    kontak: `Sekretariat Kecamatan ${targetKecamatan}`,
    jadwal: "Pertemuan Komunitas Warga Tingkat Kecamatan",
  };
  chain.push(kecItem);

  // 2. Tingkat Kelurahan (jika ada)
  if (kelurahan && kelurahan !== "semua" && kelurahan !== "Semua Kelurahan") {
    const kelSlug = slugify(kelurahan);
    const kelId = `kom-warga-${kecSlug}-${kelSlug}`;
    const kelItem = findOrGenerateKomunitasSeed(kelId) || {
      id: kelId,
      nama: `Warga Kelurahan: ${kelurahan}, Kecamatan: ${targetKecamatan}`,
      jenis: "warga_kita",
      kecamatan: targetKecamatan,
      kelurahan: kelurahan,
      rt: "",
      rw: "",
      lokasi: `Kantor Kelurahan ${kelurahan}, Kecamatan ${targetKecamatan}, Kota Tegal`,
      deskripsi: `Komunitas seluruh warga di wilayah Kelurahan ${kelurahan}, Kecamatan ${targetKecamatan}, Kota Tegal.`,
      kontak: `Sekretariat Kelurahan ${kelurahan}`,
      jadwal: "Forum Komunikasi Warga Kelurahan",
    };
    chain.push(kelItem);

    // 3. Tingkat RW (jika ada)
    if (rw && rw !== "semua" && rw.trim() !== "") {
      const cleanRw = rw.replace(/\D/g, "").padStart(2, "0");
      const rwId = `kom-warga-${kecSlug}-${kelSlug}-rw${cleanRw}`;
      const rwItem = findOrGenerateKomunitasSeed(rwId) || {
        id: rwId,
        nama: `Warga RW: ${cleanRw}, Kelurahan: ${kelurahan}, Kecamatan: ${targetKecamatan}`,
        jenis: "warga_kita",
        kecamatan: targetKecamatan,
        kelurahan: kelurahan,
        rt: "",
        rw: cleanRw,
        lokasi: `Balai RW ${cleanRw}, Kelurahan ${kelurahan}, Kecamatan ${targetKecamatan}, Kota Tegal`,
        deskripsi: `Komunitas rukun warga tingkat RW ${cleanRw} Kelurahan ${kelurahan}, Kecamatan ${targetKecamatan}, Kota Tegal.`,
        kontak: `Pengurus RW ${cleanRw}`,
        jadwal: "Rembug RW dan Pertemuan Warga Bulanan",
      };
      chain.push(rwItem);

      // 4. Tingkat RT (jika ada)
      if (rt && rt !== "semua" && rt.trim() !== "") {
        const cleanRt = rt.replace(/\D/g, "").padStart(2, "0");
        const rtId = `kom-warga-${kecSlug}-${kelSlug}-rw${cleanRw}-rt${cleanRt}`;
        const rtItem = findOrGenerateKomunitasSeed(rtId) || {
          id: rtId,
          nama: `Warga RT: ${cleanRt}, RW: ${cleanRw}, Kelurahan: ${kelurahan}, Kecamatan: ${targetKecamatan}`,
          jenis: "warga_kita",
          kecamatan: targetKecamatan,
          kelurahan: kelurahan,
          rt: cleanRt,
          rw: cleanRw,
          lokasi: `Lingkungan RT ${cleanRt} / RW ${cleanRw}, Kelurahan ${kelurahan}, Kecamatan ${targetKecamatan}, Kota Tegal`,
          deskripsi: `Komunitas paguyuban rukun tetangga warga RT ${cleanRt} RW ${cleanRw} Kelurahan ${kelurahan}, Kecamatan ${targetKecamatan}, Kota Tegal.`,
          kontak: `Pengurus RT ${cleanRt} / RW ${cleanRw}`,
          jadwal: "Pertemuan Rutin Warga Setiap Bulan",
        };
        chain.push(rtItem);
      }
    }
  }

  return chain;
}

export interface RekapKelurahanItem {
  kelurahan: string;
  count: number;
}

export interface RekapKecamatanItem {
  kecamatan: string;
  totalCount: number;
  kelurahanList: RekapKelurahanItem[];
}

export const DAFTAR_BENTUK_PENDIDIKAN = [
  "TK",
  "KB",
  "SPS",
  "RA",
  "PKBM",
  "TPA",
  "SKB",
] as const;

export type BentukPendidikanType = (typeof DAFTAR_BENTUK_PENDIDIKAN)[number];

export interface BentukPendidikanRekapItem {
  bentuk: BentukPendidikanType;
  labelSingkat: string;
  namaLengkap: string;
  kategori: "Formal" | "Nonformal";
  keterangan: string;
  totalCount: number;
  filteredCount: number;
}

export function getBentukPendidikanRekap(filter?: {
  kecamatan?: string;
  kelurahan?: string;
}): {
  totalSemua: number;
  totalFiltered: number;
  list: BentukPendidikanRekapItem[];
} {
  const kecTarget =
    filter?.kecamatan && filter.kecamatan !== "semua"
      ? filter.kecamatan.toLowerCase().trim()
      : null;
  const kelTarget =
    filter?.kelurahan && filter.kelurahan !== "semua"
      ? filter.kelurahan.toLowerCase().trim()
      : null;

  const metadata: Record<
    BentukPendidikanType,
    { namaLengkap: string; kategori: "Formal" | "Nonformal"; keterangan: string }
  > = {
    TK: {
      namaLengkap: "Taman Kanak-Kanak",
      kategori: "Formal",
      keterangan: "Pendidikan formal anak usia 4–6 tahun",
    },
    KB: {
      namaLengkap: "Kelompok Bermain",
      kategori: "Nonformal",
      keterangan: "Pendidikan nonformal usia 2–4 tahun",
    },
    SPS: {
      namaLengkap: "Satuan PAUD Sejenis / Pos PAUD",
      kategori: "Nonformal",
      keterangan: "Layanan pos PAUD terintegrasi posyandu & BKB",
    },
    RA: {
      namaLengkap: "Raudhatul Athfal",
      kategori: "Formal",
      keterangan: "PAUD formal binaan Kemenag berciri khas Islam",
    },
    PKBM: {
      namaLengkap: "Pusat Kegiatan Belajar Masyarakat",
      kategori: "Nonformal",
      keterangan: "Pendidikan kesetaraan Paket A, B, C & kecakapan hidup",
    },
    TPA: {
      namaLengkap: "Taman Penitipan Anak",
      kategori: "Nonformal",
      keterangan: "Layanan pengasuhan anak usia dini 0–6 tahun",
    },
    SKB: {
      namaLengkap: "Sanggar Kegiatan Belajar",
      kategori: "Nonformal",
      keterangan: "Unit pelaksana teknis dinas pendidikan nonformal",
    },
  };

  const list: BentukPendidikanRekapItem[] = DAFTAR_BENTUK_PENDIDIKAN.map((b) => {
    const totalCount = RAW_PAUD_PKBM_TEGAL.filter(
      (p) => (p.jenis_institusi || "").toUpperCase() === b
    ).length;

    const filteredCount = RAW_PAUD_PKBM_TEGAL.filter((p) => {
      if ((p.jenis_institusi || "").toUpperCase() !== b) return false;
      if (kecTarget && p.kecamatan?.toLowerCase().trim() !== kecTarget)
        return false;
      if (kelTarget && p.kelurahan?.toLowerCase().trim() !== kelTarget)
        return false;
      return true;
    }).length;

    return {
      bentuk: b,
      labelSingkat: b,
      namaLengkap: metadata[b].namaLengkap,
      kategori: metadata[b].kategori,
      keterangan: metadata[b].keterangan,
      totalCount,
      filteredCount,
    };
  });

  const totalSemua = list.reduce((acc, curr) => acc + curr.totalCount, 0);
  const totalFiltered = list.reduce((acc, curr) => acc + curr.filteredCount, 0);

  return {
    totalSemua,
    totalFiltered,
    list,
  };
}

export interface RekapTabSummary {
  tab: "posyandu" | "warga_kita" | "satuan_paud";
  labelSingkat: string;
  satuanLabel: string;
  totalSemua: number;
  totalKecamatan: number;
  totalKelurahan: number;
  kecamatanList: RekapKecamatanItem[];
}

export function getKomunitasRekapData(
  tab: "posyandu" | "warga_kita" | "satuan_paud" | string = "posyandu",
  filter?: {
    bentuk?: string;
  }
): RekapTabSummary {
  const isPosyandu = tab === "posyandu";
  const isPaud = tab === "satuan_paud";
  const activeBentuk =
    filter?.bentuk && filter.bentuk !== "semua"
      ? filter.bentuk.toUpperCase().trim()
      : null;

  const labelSingkat = isPosyandu
    ? "Posyandu Balita"
    : isPaud
    ? activeBentuk
      ? `Satuan ${activeBentuk}`
      : "Satuan PAUD & PKBM"
    : "Komunitas Warga Kita";

  const satuanLabel = isPosyandu
    ? "Posyandu"
    : isPaud
    ? "Lembaga"
    : "Komunitas";

  const kecamatanList: RekapKecamatanItem[] = [];
  let totalSemua = 0;
  let totalKelurahanCount = 0;

  for (const [kecName, kecData] of Object.entries(KOTA_TEGAL_DATA)) {
    const kelurahanList: RekapKelurahanItem[] = [];
    let kecTotal = 0;

    for (const [kelName, kelData] of Object.entries(kecData.kelurahan)) {
      totalKelurahanCount++;
      let count = 0;

      if (isPosyandu) {
        count = SEED_POSYANDU_TEGAL.filter(
          (p) =>
            p.kecamatan?.toLowerCase().trim() === kecName.toLowerCase().trim() &&
            p.kelurahan?.toLowerCase().trim() === kelName.toLowerCase().trim()
        ).length;
        if (count === 0 && Array.isArray(kelData.posyandu)) {
          count = kelData.posyandu.length;
        }
      } else if (isPaud) {
        count = RAW_PAUD_PKBM_TEGAL.filter((p) => {
          if (p.kecamatan?.toLowerCase().trim() !== kecName.toLowerCase().trim())
            return false;
          if (p.kelurahan?.toLowerCase().trim() !== kelName.toLowerCase().trim())
            return false;
          if (activeBentuk && (p.jenis_institusi || "").toUpperCase() !== activeBentuk)
            return false;
          return true;
        }).length;
      } else {
        const wargaCount = MASTER_KOMUNITAS_SEED.filter(
          (w) =>
            w.jenis === "warga_kita" &&
            w.kecamatan?.toLowerCase().trim() === kecName.toLowerCase().trim() &&
            w.kelurahan?.toLowerCase().trim() === kelName.toLowerCase().trim()
        ).length;
        count = wargaCount > 0 ? wargaCount : 2;
      }

      kecTotal += count;
      kelurahanList.push({
        kelurahan: kelName,
        count,
      });
    }

    totalSemua += kecTotal;
    kecamatanList.push({
      kecamatan: kecName,
      totalCount: kecTotal,
      kelurahanList,
    });
  }

  return {
    tab: (tab as any) || "posyandu",
    labelSingkat,
    satuanLabel,
    totalSemua,
    totalKecamatan: kecamatanList.length,
    totalKelurahan: totalKelurahanCount,
    kecamatanList,
  };
}
