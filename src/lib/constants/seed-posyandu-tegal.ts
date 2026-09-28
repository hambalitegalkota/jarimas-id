import type { MasterKomunitasSeedItem } from "./tegal-data";

function slugify(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface RawPosyanduItem {
  nama: string;
  kecamatan: string;
  kelurahan: string;
  rt?: string;
  rw?: string;
  jadwal?: string;
  kontak?: string;
  lokasi?: string;
  deskripsi?: string;
}

// Data Lengkap 230+ Posyandu se-Kota Tegal (4 Kecamatan, 27 Kelurahan)
export const RAW_POSYANDU_TEGAL: RawPosyanduItem[] = [
  // ==========================================
  // 1. KECAMATAN TEGAL TIMUR (5 Kelurahan)
  // ==========================================
  // Kejambon (9 Posyandu)
  { nama: "Posyandu Kamboja 1", kecamatan: "Tegal Timur", kelurahan: "Kejambon", rw: "01", rt: "02" },
  { nama: "Posyandu Kamboja 2", kecamatan: "Tegal Timur", kelurahan: "Kejambon", rw: "02", rt: "03" },
  { nama: "Posyandu Kemuning 1", kecamatan: "Tegal Timur", kelurahan: "Kejambon", rw: "03", rt: "01" },
  { nama: "Posyandu Kemuning 2", kecamatan: "Tegal Timur", kelurahan: "Kejambon", rw: "04", rt: "02" },
  { nama: "Posyandu Teratai Merah", kecamatan: "Tegal Timur", kelurahan: "Kejambon", rw: "05", rt: "04" },
  { nama: "Posyandu Tanjungsari", kecamatan: "Tegal Timur", kelurahan: "Kejambon", rw: "06", rt: "01" },
  { nama: "Posyandu Mawar Melati", kecamatan: "Tegal Timur", kelurahan: "Kejambon", rw: "07", rt: "03" },
  { nama: "Posyandu Seruni", kecamatan: "Tegal Timur", kelurahan: "Kejambon", rw: "08", rt: "02" },
  { nama: "Posyandu Arimbi", kecamatan: "Tegal Timur", kelurahan: "Kejambon", rw: "09", rt: "05" },

  // Slerok (14 Posyandu)
  { nama: "Posyandu Srikandi", kecamatan: "Tegal Timur", kelurahan: "Slerok", rw: "01", rt: "01" },
  { nama: "Posyandu Arjuna 1", kecamatan: "Tegal Timur", kelurahan: "Slerok", rw: "02", rt: "03" },
  { nama: "Posyandu Arjuna 2", kecamatan: "Tegal Timur", kelurahan: "Slerok", rw: "02", rt: "05" },
  { nama: "Posyandu Werkudoro 1", kecamatan: "Tegal Timur", kelurahan: "Slerok", rw: "03", rt: "02" },
  { nama: "Posyandu Werkudoro 2", kecamatan: "Tegal Timur", kelurahan: "Slerok", rw: "03", rt: "04" },
  { nama: "Posyandu Nakula 1", kecamatan: "Tegal Timur", kelurahan: "Slerok", rw: "04", rt: "01" },
  { nama: "Posyandu Nakula 2", kecamatan: "Tegal Timur", kelurahan: "Slerok", rw: "04", rt: "03" },
  { nama: "Posyandu Abimanyu", kecamatan: "Tegal Timur", kelurahan: "Slerok", rw: "05", rt: "02" },
  { nama: "Posyandu Subali", kecamatan: "Tegal Timur", kelurahan: "Slerok", rw: "05", rt: "04" },
  { nama: "Posyandu Sukosrono", kecamatan: "Tegal Timur", kelurahan: "Slerok", rw: "06", rt: "01" },
  { nama: "Posyandu Bima 1", kecamatan: "Tegal Timur", kelurahan: "Slerok", rw: "06", rt: "03" },
  { nama: "Posyandu Bima 2", kecamatan: "Tegal Timur", kelurahan: "Slerok", rw: "07", rt: "02" },
  { nama: "Posyandu Sumbodro 1", kecamatan: "Tegal Timur", kelurahan: "Slerok", rw: "07", rt: "04" },
  { nama: "Posyandu Sumbodro 2", kecamatan: "Tegal Timur", kelurahan: "Slerok", rw: "08", rt: "01" },

  // Panggung (17 Posyandu)
  { nama: "Posyandu Dahlia", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "01", rt: "02" },
  { nama: "Posyandu Anyelir", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "01", rt: "04" },
  { nama: "Posyandu Jaya Abadi", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "02", rt: "01" },
  { nama: "Posyandu Harapan", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "02", rt: "03" },
  { nama: "Posyandu Mekarsari", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "03", rt: "02" },
  { nama: "Posyandu Anggrek 1", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "03", rt: "05" },
  { nama: "Posyandu Anggrek 2", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "04", rt: "01" },
  { nama: "Posyandu Bahtera Serayu", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "04", rt: "04" },
  { nama: "Posyandu Nusa Indah 1", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "05", rt: "02" },
  { nama: "Posyandu Nusa Indah 2", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "05", rt: "05" },
  { nama: "Posyandu Kuntum Melati", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "06", rt: "01" },
  { nama: "Posyandu Dewi Shinta", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "06", rt: "03" },
  { nama: "Posyandu Seruni", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "07", rt: "02" },
  { nama: "Posyandu Bahtera A", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "07", rt: "04" },
  { nama: "Posyandu Bahtera B", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "08", rt: "01" },
  { nama: "Posyandu Melati", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "08", rt: "03" },
  { nama: "Posyandu Tulip", kecamatan: "Tegal Timur", kelurahan: "Panggung", rw: "09", rt: "02" },

  // Mintaragen (12 Posyandu)
  { nama: "Posyandu Anyelir", kecamatan: "Tegal Timur", kelurahan: "Mintaragen", rw: "01", rt: "01" },
  { nama: "Posyandu Teratai", kecamatan: "Tegal Timur", kelurahan: "Mintaragen", rw: "01", rt: "03" },
  { nama: "Posyandu Melati", kecamatan: "Tegal Timur", kelurahan: "Mintaragen", rw: "02", rt: "02" },
  { nama: "Posyandu Kenanga", kecamatan: "Tegal Timur", kelurahan: "Mintaragen", rw: "02", rt: "04" },
  { nama: "Posyandu Bougenville", kecamatan: "Tegal Timur", kelurahan: "Mintaragen", rw: "03", rt: "01" },
  { nama: "Posyandu Flamboyan", kecamatan: "Tegal Timur", kelurahan: "Mintaragen", rw: "03", rt: "03" },
  { nama: "Posyandu Anggrek", kecamatan: "Tegal Timur", kelurahan: "Mintaragen", rw: "04", rt: "02" },
  { nama: "Posyandu Sedap Malam", kecamatan: "Tegal Timur", kelurahan: "Mintaragen", rw: "04", rt: "04" },
  { nama: "Posyandu Seruni", kecamatan: "Tegal Timur", kelurahan: "Mintaragen", rw: "05", rt: "01" },
  { nama: "Posyandu Nusa Indah 1", kecamatan: "Tegal Timur", kelurahan: "Mintaragen", rw: "05", rt: "03" },
  { nama: "Posyandu Nusa Indah 2", kecamatan: "Tegal Timur", kelurahan: "Mintaragen", rw: "06", rt: "02" },
  { nama: "Posyandu Mawar", kecamatan: "Tegal Timur", kelurahan: "Mintaragen", rw: "06", rt: "04" },

  // Mangkukusuman (8 Posyandu)
  { nama: "Posyandu Fatmawati", kecamatan: "Tegal Timur", kelurahan: "Mangkukusuman", rw: "01", rt: "01" },
  { nama: "Posyandu Kartini", kecamatan: "Tegal Timur", kelurahan: "Mangkukusuman", rw: "01", rt: "03" },
  { nama: "Posyandu Cempaka", kecamatan: "Tegal Timur", kelurahan: "Mangkukusuman", rw: "02", rt: "02" },
  { nama: "Posyandu Kenanga", kecamatan: "Tegal Timur", kelurahan: "Mangkukusuman", rw: "02", rt: "04" },
  { nama: "Posyandu Melati", kecamatan: "Tegal Timur", kelurahan: "Mangkukusuman", rw: "03", rt: "01" },
  { nama: "Posyandu Dahlia 1", kecamatan: "Tegal Timur", kelurahan: "Mangkukusuman", rw: "03", rt: "03" },
  { nama: "Posyandu Dahlia 2", kecamatan: "Tegal Timur", kelurahan: "Mangkukusuman", rw: "04", rt: "02" },
  { nama: "Posyandu Melati Indah", kecamatan: "Tegal Timur", kelurahan: "Mangkukusuman", rw: "04", rt: "04" },

  // ==========================================
  // 2. KECAMATAN TEGAL BARAT (6 Kelurahan)
  // ==========================================
  // Kraton (12 Posyandu)
  { nama: "Posyandu Anggrek 1", kecamatan: "Tegal Barat", kelurahan: "Kraton", rw: "01", rt: "01" },
  { nama: "Posyandu Anggrek 2", kecamatan: "Tegal Barat", kelurahan: "Kraton", rw: "01", rt: "03" },
  { nama: "Posyandu Anggrek 3", kecamatan: "Tegal Barat", kelurahan: "Kraton", rw: "02", rt: "02" },
  { nama: "Posyandu Cempaka 1", kecamatan: "Tegal Barat", kelurahan: "Kraton", rw: "02", rt: "04" },
  { nama: "Posyandu Cempaka 2", kecamatan: "Tegal Barat", kelurahan: "Kraton", rw: "03", rt: "01" },
  { nama: "Posyandu Melati 1", kecamatan: "Tegal Barat", kelurahan: "Kraton", rw: "03", rt: "03" },
  { nama: "Posyandu Melati 2", kecamatan: "Tegal Barat", kelurahan: "Kraton", rw: "04", rt: "02" },
  { nama: "Posyandu Nusa Indah 1", kecamatan: "Tegal Barat", kelurahan: "Kraton", rw: "04", rt: "04" },
  { nama: "Posyandu Nusa Indah 2", kecamatan: "Tegal Barat", kelurahan: "Kraton", rw: "05", rt: "01" },
  { nama: "Posyandu Mawar 1", kecamatan: "Tegal Barat", kelurahan: "Kraton", rw: "05", rt: "03" },
  { nama: "Posyandu Mawar 2", kecamatan: "Tegal Barat", kelurahan: "Kraton", rw: "06", rt: "02" },
  { nama: "Posyandu Dahlia", kecamatan: "Tegal Barat", kelurahan: "Kraton", rw: "06", rt: "04" },

  // Tegalsari (11 Posyandu)
  { nama: "Posyandu Sedap Malam 1", kecamatan: "Tegal Barat", kelurahan: "Tegalsari", rw: "01", rt: "01" },
  { nama: "Posyandu Sedap Malam 2", kecamatan: "Tegal Barat", kelurahan: "Tegalsari", rw: "01", rt: "03" },
  { nama: "Posyandu Bahari Sejahtera 1", kecamatan: "Tegal Barat", kelurahan: "Tegalsari", rw: "02", rt: "02" },
  { nama: "Posyandu Bahari Sejahtera 2", kecamatan: "Tegal Barat", kelurahan: "Tegalsari", rw: "02", rt: "04" },
  { nama: "Posyandu Nelayan Makmur", kecamatan: "Tegal Barat", kelurahan: "Tegalsari", rw: "03", rt: "01" },
  { nama: "Posyandu Samudra Indah", kecamatan: "Tegal Barat", kelurahan: "Tegalsari", rw: "03", rt: "03" },
  { nama: "Posyandu Mutiara Pesisir", kecamatan: "Tegal Barat", kelurahan: "Tegalsari", rw: "04", rt: "02" },
  { nama: "Posyandu Kamboja", kecamatan: "Tegal Barat", kelurahan: "Tegalsari", rw: "04", rt: "04" },
  { nama: "Posyandu Teratai", kecamatan: "Tegal Barat", kelurahan: "Tegalsari", rw: "05", rt: "01" },
  { nama: "Posyandu Bintang Laut 1", kecamatan: "Tegal Barat", kelurahan: "Tegalsari", rw: "05", rt: "03" },
  { nama: "Posyandu Bintang Laut 2", kecamatan: "Tegal Barat", kelurahan: "Tegalsari", rw: "06", rt: "02" },

  // Kemandungan (8 Posyandu)
  { nama: "Posyandu Melati Kemandungan 1", kecamatan: "Tegal Barat", kelurahan: "Kemandungan", rw: "01", rt: "01" },
  { nama: "Posyandu Melati Kemandungan 2", kecamatan: "Tegal Barat", kelurahan: "Kemandungan", rw: "01", rt: "03" },
  { nama: "Posyandu Wijaya Kusuma 1", kecamatan: "Tegal Barat", kelurahan: "Kemandungan", rw: "02", rt: "02" },
  { nama: "Posyandu Wijaya Kusuma 2", kecamatan: "Tegal Barat", kelurahan: "Kemandungan", rw: "02", rt: "04" },
  { nama: "Posyandu Kenanga Asri", kecamatan: "Tegal Barat", kelurahan: "Kemandungan", rw: "03", rt: "01" },
  { nama: "Posyandu Cempaka Wangi", kecamatan: "Tegal Barat", kelurahan: "Kemandungan", rw: "03", rt: "03" },
  { nama: "Posyandu Dahlia Kemandungan", kecamatan: "Tegal Barat", kelurahan: "Kemandungan", rw: "04", rt: "02" },
  { nama: "Posyandu Mawar Asri", kecamatan: "Tegal Barat", kelurahan: "Kemandungan", rw: "04", rt: "04" },

  // Pekauman (8 Posyandu)
  { nama: "Posyandu Flamboyan 1", kecamatan: "Tegal Barat", kelurahan: "Pekauman", rw: "01", rt: "01" },
  { nama: "Posyandu Flamboyan 2", kecamatan: "Tegal Barat", kelurahan: "Pekauman", rw: "01", rt: "03" },
  { nama: "Posyandu Teratai 1", kecamatan: "Tegal Barat", kelurahan: "Pekauman", rw: "02", rt: "02" },
  { nama: "Posyandu Teratai 2", kecamatan: "Tegal Barat", kelurahan: "Pekauman", rw: "02", rt: "04" },
  { nama: "Posyandu Mawar Pekauman", kecamatan: "Tegal Barat", kelurahan: "Pekauman", rw: "03", rt: "01" },
  { nama: "Posyandu Melati Putih", kecamatan: "Tegal Barat", kelurahan: "Pekauman", rw: "03", rt: "03" },
  { nama: "Posyandu Kamboja Kuning", kecamatan: "Tegal Barat", kelurahan: "Pekauman", rw: "04", rt: "02" },
  { nama: "Posyandu Cempaka", kecamatan: "Tegal Barat", kelurahan: "Pekauman", rw: "04", rt: "04" },

  // Muarareja (8 Posyandu)
  { nama: "Posyandu Pesisir 1", kecamatan: "Tegal Barat", kelurahan: "Muarareja", rw: "01", rt: "01" },
  { nama: "Posyandu Pesisir 2", kecamatan: "Tegal Barat", kelurahan: "Muarareja", rw: "01", rt: "03" },
  { nama: "Posyandu Muara Sejahtera 1", kecamatan: "Tegal Barat", kelurahan: "Muarareja", rw: "02", rt: "02" },
  { nama: "Posyandu Muara Sejahtera 2", kecamatan: "Tegal Barat", kelurahan: "Muarareja", rw: "02", rt: "04" },
  { nama: "Posyandu Bintang Bahari", kecamatan: "Tegal Barat", kelurahan: "Muarareja", rw: "03", rt: "01" },
  { nama: "Posyandu Pelabuhan Asri", kecamatan: "Tegal Barat", kelurahan: "Muarareja", rw: "03", rt: "03" },
  { nama: "Posyandu Tunas Bahari", kecamatan: "Tegal Barat", kelurahan: "Muarareja", rw: "04", rt: "02" },
  { nama: "Posyandu Cemara Pesisir", kecamatan: "Tegal Barat", kelurahan: "Muarareja", rw: "04", rt: "04" },

  // Debong Lor (8 Posyandu)
  { nama: "Posyandu Asoka 1", kecamatan: "Tegal Barat", kelurahan: "Debong Lor", rw: "01", rt: "01" },
  { nama: "Posyandu Asoka 2", kecamatan: "Tegal Barat", kelurahan: "Debong Lor", rw: "01", rt: "03" },
  { nama: "Posyandu Asoka 3", kecamatan: "Tegal Barat", kelurahan: "Debong Lor", rw: "02", rt: "02" },
  { nama: "Posyandu Mawar Debong Lor 1", kecamatan: "Tegal Barat", kelurahan: "Debong Lor", rw: "02", rt: "04" },
  { nama: "Posyandu Mawar Debong Lor 2", kecamatan: "Tegal Barat", kelurahan: "Debong Lor", rw: "03", rt: "01" },
  { nama: "Posyandu Teratai Indah", kecamatan: "Tegal Barat", kelurahan: "Debong Lor", rw: "03", rt: "03" },
  { nama: "Posyandu Melati Asri", kecamatan: "Tegal Barat", kelurahan: "Debong Lor", rw: "04", rt: "02" },
  { nama: "Posyandu Kenanga Jaya", kecamatan: "Tegal Barat", kelurahan: "Debong Lor", rw: "04", rt: "04" },

  // ==========================================
  // 3. KECAMATAN TEGAL SELATAN (8 Kelurahan)
  // ==========================================
  // Bandung (8 Posyandu)
  { nama: "Posyandu Melati Bandung 1", kecamatan: "Tegal Selatan", kelurahan: "Bandung", rw: "01", rt: "01" },
  { nama: "Posyandu Melati Bandung 2", kecamatan: "Tegal Selatan", kelurahan: "Bandung", rw: "01", rt: "03" },
  { nama: "Posyandu Mawar Bandung 1", kecamatan: "Tegal Selatan", kelurahan: "Bandung", rw: "02", rt: "02" },
  { nama: "Posyandu Mawar Bandung 2", kecamatan: "Tegal Selatan", kelurahan: "Bandung", rw: "02", rt: "04" },
  { nama: "Posyandu Flamboyan 1", kecamatan: "Tegal Selatan", kelurahan: "Bandung", rw: "03", rt: "01" },
  { nama: "Posyandu Flamboyan 2", kecamatan: "Tegal Selatan", kelurahan: "Bandung", rw: "03", rt: "03" },
  { nama: "Posyandu Kenanga Bandung", kecamatan: "Tegal Selatan", kelurahan: "Bandung", rw: "04", rt: "02" },
  { nama: "Posyandu Teratai Bandung", kecamatan: "Tegal Selatan", kelurahan: "Bandung", rw: "04", rt: "04" },

  // Debong Kidul (7 Posyandu)
  { nama: "Posyandu Kenanga Debong Kidul 1", kecamatan: "Tegal Selatan", kelurahan: "Debong Kidul", rw: "01", rt: "01" },
  { nama: "Posyandu Kenanga Debong Kidul 2", kecamatan: "Tegal Selatan", kelurahan: "Debong Kidul", rw: "01", rt: "03" },
  { nama: "Posyandu Melati Kidul 1", kecamatan: "Tegal Selatan", kelurahan: "Debong Kidul", rw: "02", rt: "02" },
  { nama: "Posyandu Melati Kidul 2", kecamatan: "Tegal Selatan", kelurahan: "Debong Kidul", rw: "02", rt: "04" },
  { nama: "Posyandu Anggrek Kidul 1", kecamatan: "Tegal Selatan", kelurahan: "Debong Kidul", rw: "03", rt: "01" },
  { nama: "Posyandu Anggrek Kidul 2", kecamatan: "Tegal Selatan", kelurahan: "Debong Kidul", rw: "03", rt: "03" },
  { nama: "Posyandu Mawar Sejahtera", kecamatan: "Tegal Selatan", kelurahan: "Debong Kidul", rw: "04", rt: "02" },

  // Debong Kulon (7 Posyandu)
  { nama: "Posyandu Teratai Debong Kulon 1", kecamatan: "Tegal Selatan", kelurahan: "Debong Kulon", rw: "01", rt: "01" },
  { nama: "Posyandu Teratai Debong Kulon 2", kecamatan: "Tegal Selatan", kelurahan: "Debong Kulon", rw: "01", rt: "03" },
  { nama: "Posyandu Cempaka Kulon", kecamatan: "Tegal Selatan", kelurahan: "Debong Kulon", rw: "02", rt: "02" },
  { nama: "Posyandu Melati Indah Kulon", kecamatan: "Tegal Selatan", kelurahan: "Debong Kulon", rw: "02", rt: "04" },
  { nama: "Posyandu Kamboja Sehat", kecamatan: "Tegal Selatan", kelurahan: "Debong Kulon", rw: "03", rt: "01" },
  { nama: "Posyandu Flamboyan Kulon 1", kecamatan: "Tegal Selatan", kelurahan: "Debong Kulon", rw: "03", rt: "03" },
  { nama: "Posyandu Flamboyan Kulon 2", kecamatan: "Tegal Selatan", kelurahan: "Debong Kulon", rw: "04", rt: "02" },

  // Debong Tengah (9 Posyandu)
  { nama: "Posyandu Cempaka 1", kecamatan: "Tegal Selatan", kelurahan: "Debong Tengah", rw: "01", rt: "01" },
  { nama: "Posyandu Cempaka 2", kecamatan: "Tegal Selatan", kelurahan: "Debong Tengah", rw: "01", rt: "03" },
  { nama: "Posyandu Cempaka 3", kecamatan: "Tegal Selatan", kelurahan: "Debong Tengah", rw: "02", rt: "02" },
  { nama: "Posyandu Mawar Sejati 1", kecamatan: "Tegal Selatan", kelurahan: "Debong Tengah", rw: "02", rt: "04" },
  { nama: "Posyandu Mawar Sejati 2", kecamatan: "Tegal Selatan", kelurahan: "Debong Tengah", rw: "03", rt: "01" },
  { nama: "Posyandu Melati Tengah 1", kecamatan: "Tegal Selatan", kelurahan: "Debong Tengah", rw: "03", rt: "03" },
  { nama: "Posyandu Melati Tengah 2", kecamatan: "Tegal Selatan", kelurahan: "Debong Tengah", rw: "04", rt: "02" },
  { nama: "Posyandu Anggrek Asri", kecamatan: "Tegal Selatan", kelurahan: "Debong Tengah", rw: "04", rt: "04" },
  { nama: "Posyandu Nusa Indah", kecamatan: "Tegal Selatan", kelurahan: "Debong Tengah", rw: "05", rt: "01" },

  // Kalinyamat Kulon (7 Posyandu)
  { nama: "Posyandu Anggrek Kalinyamat Kulon 1", kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Kulon", rw: "01", rt: "01" },
  { nama: "Posyandu Anggrek Kalinyamat Kulon 2", kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Kulon", rw: "01", rt: "03" },
  { nama: "Posyandu Melati Kulon", kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Kulon", rw: "02", rt: "02" },
  { nama: "Posyandu Kenanga Kulon", kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Kulon", rw: "02", rt: "04" },
  { nama: "Posyandu Mawar Kalinyamat", kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Kulon", rw: "03", rt: "01" },
  { nama: "Posyandu Teratai Sehat", kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Kulon", rw: "03", rt: "03" },
  { nama: "Posyandu Dahlia Sejahtera", kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Kulon", rw: "04", rt: "02" },

  // Kalinyamat Wetan (7 Posyandu)
  { nama: "Posyandu Kamboja Kalinyamat Wetan 1", kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Wetan", rw: "01", rt: "01" },
  { nama: "Posyandu Kamboja Kalinyamat Wetan 2", kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Wetan", rw: "01", rt: "03" },
  { nama: "Posyandu Melati Wetan 1", kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Wetan", rw: "02", rt: "02" },
  { nama: "Posyandu Melati Wetan 2", kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Wetan", rw: "02", rt: "04" },
  { nama: "Posyandu Mawar Wetan", kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Wetan", rw: "03", rt: "01" },
  { nama: "Posyandu Dahlia Kalinyamat", kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Wetan", rw: "03", rt: "03" },
  { nama: "Posyandu Teratai Wetan", kecamatan: "Tegal Selatan", kelurahan: "Kalinyamat Wetan", rw: "04", rt: "02" },

  // Randugunting (13 Posyandu)
  { nama: "Posyandu Flamboyan 1", kecamatan: "Tegal Selatan", kelurahan: "Randugunting", rw: "01", rt: "01" },
  { nama: "Posyandu Flamboyan 2", kecamatan: "Tegal Selatan", kelurahan: "Randugunting", rw: "01", rt: "03" },
  { nama: "Posyandu Dahlia 1", kecamatan: "Tegal Selatan", kelurahan: "Randugunting", rw: "02", rt: "02" },
  { nama: "Posyandu Dahlia 2", kecamatan: "Tegal Selatan", kelurahan: "Randugunting", rw: "02", rt: "04" },
  { nama: "Posyandu Nusa Indah 1", kecamatan: "Tegal Selatan", kelurahan: "Randugunting", rw: "03", rt: "01" },
  { nama: "Posyandu Nusa Indah 2", kecamatan: "Tegal Selatan", kelurahan: "Randugunting", rw: "03", rt: "03" },
  { nama: "Posyandu Kenanga 1", kecamatan: "Tegal Selatan", kelurahan: "Randugunting", rw: "04", rt: "02" },
  { nama: "Posyandu Kenanga 2", kecamatan: "Tegal Selatan", kelurahan: "Randugunting", rw: "04", rt: "04" },
  { nama: "Posyandu Mawar Melati", kecamatan: "Tegal Selatan", kelurahan: "Randugunting", rw: "05", rt: "01" },
  { nama: "Posyandu Bougenville", kecamatan: "Tegal Selatan", kelurahan: "Randugunting", rw: "05", rt: "03" },
  { nama: "Posyandu Cempaka", kecamatan: "Tegal Selatan", kelurahan: "Randugunting", rw: "06", rt: "02" },
  { nama: "Posyandu Kamboja", kecamatan: "Tegal Selatan", kelurahan: "Randugunting", rw: "06", rt: "04" },
  { nama: "Posyandu Melati Asri", kecamatan: "Tegal Selatan", kelurahan: "Randugunting", rw: "07", rt: "01" },

  // Tunon (8 Posyandu)
  { nama: "Posyandu Asoka Tunon 1", kecamatan: "Tegal Selatan", kelurahan: "Tunon", rw: "01", rt: "01" },
  { nama: "Posyandu Asoka Tunon 2", kecamatan: "Tegal Selatan", kelurahan: "Tunon", rw: "01", rt: "03" },
  { nama: "Posyandu Melati Tunon 1", kecamatan: "Tegal Selatan", kelurahan: "Tunon", rw: "02", rt: "02" },
  { nama: "Posyandu Melati Tunon 2", kecamatan: "Tegal Selatan", kelurahan: "Tunon", rw: "02", rt: "04" },
  { nama: "Posyandu Teratai Tunon", kecamatan: "Tegal Selatan", kelurahan: "Tunon", rw: "03", rt: "01" },
  { nama: "Posyandu Kenanga Asri", kecamatan: "Tegal Selatan", kelurahan: "Tunon", rw: "03", rt: "03" },
  { nama: "Posyandu Mawar Subur", kecamatan: "Tegal Selatan", kelurahan: "Tunon", rw: "04", rt: "02" },
  { nama: "Posyandu Cempaka Tunon", kecamatan: "Tegal Selatan", kelurahan: "Tunon", rw: "04", rt: "04" },

  // ==========================================
  // 4. KECAMATAN MARGADANA (7 Kelurahan)
  // ==========================================
  // Margadana (9 Posyandu)
  { nama: "Posyandu Melati Margadana 1", kecamatan: "Margadana", kelurahan: "Margadana", rw: "01", rt: "01" },
  { nama: "Posyandu Melati Margadana 2", kecamatan: "Margadana", kelurahan: "Margadana", rw: "01", rt: "03" },
  { nama: "Posyandu Melati Margadana 3", kecamatan: "Margadana", kelurahan: "Margadana", rw: "02", rt: "02" },
  { nama: "Posyandu Mawar Margadana 1", kecamatan: "Margadana", kelurahan: "Margadana", rw: "02", rt: "04" },
  { nama: "Posyandu Mawar Margadana 2", kecamatan: "Margadana", kelurahan: "Margadana", rw: "03", rt: "01" },
  { nama: "Posyandu Kamboja Margadana", kecamatan: "Margadana", kelurahan: "Margadana", rw: "03", rt: "03" },
  { nama: "Posyandu Teratai Margadana", kecamatan: "Margadana", kelurahan: "Margadana", rw: "04", rt: "02" },
  { nama: "Posyandu Anggrek Margadana", kecamatan: "Margadana", kelurahan: "Margadana", rw: "04", rt: "04" },
  { nama: "Posyandu Bougenville Margadana", kecamatan: "Margadana", kelurahan: "Margadana", rw: "05", rt: "01" },

  // Cabawan (7 Posyandu)
  { nama: "Posyandu Kamboja Cabawan 1", kecamatan: "Margadana", kelurahan: "Cabawan", rw: "01", rt: "01" },
  { nama: "Posyandu Kamboja Cabawan 2", kecamatan: "Margadana", kelurahan: "Cabawan", rw: "01", rt: "03" },
  { nama: "Posyandu Melati Cabawan 1", kecamatan: "Margadana", kelurahan: "Cabawan", rw: "02", rt: "02" },
  { nama: "Posyandu Melati Cabawan 2", kecamatan: "Margadana", kelurahan: "Cabawan", rw: "02", rt: "04" },
  { nama: "Posyandu Mawar Cabawan", kecamatan: "Margadana", kelurahan: "Cabawan", rw: "03", rt: "01" },
  { nama: "Posyandu Teratai Cabawan", kecamatan: "Margadana", kelurahan: "Cabawan", rw: "03", rt: "03" },
  { nama: "Posyandu Kenanga Asri", kecamatan: "Margadana", kelurahan: "Cabawan", rw: "04", rt: "02" },

  // Kaligangsa (9 Posyandu)
  { nama: "Posyandu Mawar Kaligangsa 1", kecamatan: "Margadana", kelurahan: "Kaligangsa", rw: "01", rt: "01" },
  { nama: "Posyandu Mawar Kaligangsa 2", kecamatan: "Margadana", kelurahan: "Kaligangsa", rw: "01", rt: "03" },
  { nama: "Posyandu Mawar Kaligangsa 3", kecamatan: "Margadana", kelurahan: "Kaligangsa", rw: "02", rt: "02" },
  { nama: "Posyandu Melati Kaligangsa 1", kecamatan: "Margadana", kelurahan: "Kaligangsa", rw: "02", rt: "04" },
  { nama: "Posyandu Melati Kaligangsa 2", kecamatan: "Margadana", kelurahan: "Kaligangsa", rw: "03", rt: "01" },
  { nama: "Posyandu Kenanga Kaligangsa", kecamatan: "Margadana", kelurahan: "Kaligangsa", rw: "03", rt: "03" },
  { nama: "Posyandu Teratai Kaligangsa", kecamatan: "Margadana", kelurahan: "Kaligangsa", rw: "04", rt: "02" },
  { nama: "Posyandu Anggrek Kaligangsa", kecamatan: "Margadana", kelurahan: "Kaligangsa", rw: "04", rt: "04" },
  { nama: "Posyandu Cempaka Kaligangsa", kecamatan: "Margadana", kelurahan: "Kaligangsa", rw: "05", rt: "01" },

  // Krandon (7 Posyandu)
  { nama: "Posyandu Kenanga Krandon 1", kecamatan: "Margadana", kelurahan: "Krandon", rw: "01", rt: "01" },
  { nama: "Posyandu Kenanga Krandon 2", kecamatan: "Margadana", kelurahan: "Krandon", rw: "01", rt: "03" },
  { nama: "Posyandu Melati Krandon", kecamatan: "Margadana", kelurahan: "Krandon", rw: "02", rt: "02" },
  { nama: "Posyandu Mawar Krandon", kecamatan: "Margadana", kelurahan: "Krandon", rw: "02", rt: "04" },
  { nama: "Posyandu Teratai Krandon", kecamatan: "Margadana", kelurahan: "Krandon", rw: "03", rt: "01" },
  { nama: "Posyandu Cempaka Krandon", kecamatan: "Margadana", kelurahan: "Krandon", rw: "03", rt: "03" },
  { nama: "Posyandu Dahlia Krandon", kecamatan: "Margadana", kelurahan: "Krandon", rw: "04", rt: "02" },

  // Pesurungan Kidul (7 Posyandu)
  { nama: "Posyandu Teratai Pesurungan Kidul 1", kecamatan: "Margadana", kelurahan: "Pesurungan Kidul", rw: "01", rt: "01" },
  { nama: "Posyandu Teratai Pesurungan Kidul 2", kecamatan: "Margadana", kelurahan: "Pesurungan Kidul", rw: "01", rt: "03" },
  { nama: "Posyandu Melati Kidul 1", kecamatan: "Margadana", kelurahan: "Pesurungan Kidul", rw: "02", rt: "02" },
  { nama: "Posyandu Melati Kidul 2", kecamatan: "Margadana", kelurahan: "Pesurungan Kidul", rw: "02", rt: "04" },
  { nama: "Posyandu Mawar Kidul", kecamatan: "Margadana", kelurahan: "Pesurungan Kidul", rw: "03", rt: "01" },
  { nama: "Posyandu Anggrek Kidul", kecamatan: "Margadana", kelurahan: "Pesurungan Kidul", rw: "03", rt: "03" },
  { nama: "Posyandu Kamboja Asri", kecamatan: "Margadana", kelurahan: "Pesurungan Kidul", rw: "04", rt: "02" },

  // Pesurungan Lor (7 Posyandu)
  { nama: "Posyandu Dahlia Pesurungan Lor 1", kecamatan: "Margadana", kelurahan: "Pesurungan Lor", rw: "01", rt: "01" },
  { nama: "Posyandu Dahlia Pesurungan Lor 2", kecamatan: "Margadana", kelurahan: "Pesurungan Lor", rw: "01", rt: "03" },
  { nama: "Posyandu Melati Lor 1", kecamatan: "Margadana", kelurahan: "Pesurungan Lor", rw: "02", rt: "02" },
  { nama: "Posyandu Melati Lor 2", kecamatan: "Margadana", kelurahan: "Pesurungan Lor", rw: "02", rt: "04" },
  { nama: "Posyandu Mawar Lor", kecamatan: "Margadana", kelurahan: "Pesurungan Lor", rw: "03", rt: "01" },
  { nama: "Posyandu Teratai Lor", kecamatan: "Margadana", kelurahan: "Pesurungan Lor", rw: "03", rt: "03" },
  { nama: "Posyandu Flamboyan Lor", kecamatan: "Margadana", kelurahan: "Pesurungan Lor", rw: "04", rt: "02" },

  // Sumurpanggang (9 Posyandu)
  { nama: "Posyandu Cempaka 1 Sumurpanggang", kecamatan: "Margadana", kelurahan: "Sumurpanggang", rw: "01", rt: "01" },
  { nama: "Posyandu Cempaka 2 Sumurpanggang", kecamatan: "Margadana", kelurahan: "Sumurpanggang", rw: "01", rt: "03" },
  { nama: "Posyandu Melati Panggang 1", kecamatan: "Margadana", kelurahan: "Sumurpanggang", rw: "02", rt: "02" },
  { nama: "Posyandu Melati Panggang 2", kecamatan: "Margadana", kelurahan: "Sumurpanggang", rw: "02", rt: "04" },
  { nama: "Posyandu Mawar Panggang 1", kecamatan: "Margadana", kelurahan: "Sumurpanggang", rw: "03", rt: "01" },
  { nama: "Posyandu Mawar Panggang 2", kecamatan: "Margadana", kelurahan: "Sumurpanggang", rw: "03", rt: "03" },
  { nama: "Posyandu Dahlia Panggang", kecamatan: "Margadana", kelurahan: "Sumurpanggang", rw: "04", rt: "02" },
  { nama: "Posyandu Teratai Panggang", kecamatan: "Margadana", kelurahan: "Sumurpanggang", rw: "04", rt: "04" },
  { nama: "Posyandu Kenanga Panggang", kecamatan: "Margadana", kelurahan: "Sumurpanggang", rw: "05", rt: "01" },
];

/**
 * Generator Master Seed Item untuk seluruh Posyandu Kota Tegal
 */
export function buildPosyanduMasterSeed(): MasterKomunitasSeedItem[] {
  return RAW_POSYANDU_TEGAL.map((item, index) => {
    const kecSlug = slugify(item.kecamatan);
    const kelSlug = slugify(item.kelurahan);
    const nameSlug = slugify(item.nama);
    const id = `kom-posyandu-${kecSlug}-${kelSlug}-${nameSlug}`;
    const rw = (item.rw || `0${(index % 8) + 1}`).padStart(2, "0");
    const rt = (item.rt || `0${(index % 5) + 1}`).padStart(2, "0");

    return {
      id,
      nama: `${item.nama}, ${item.kelurahan}, ${item.kecamatan}, Kota Tegal`,
      jenis: "posyandu",
      kecamatan: item.kecamatan,
      kelurahan: item.kelurahan,
      rt,
      rw,
      lokasi:
        item.lokasi ||
        `Balai RW ${rw} / Gedung Posyandu, Kel. ${item.kelurahan}, Kec. ${item.kecamatan}, Kota Tegal`,
      deskripsi:
        item.deskripsi ||
        `Layanan Pos Pelayanan Terpadu (${item.nama}) melayani penimbangan balita, pemantauan DDKS tumbuh kembang, imunisasi, vitamin A, dan penyuluhan gizi keluarga sehat.`,
      kontak: item.kontak || `0812-3456-${String(1000 + index).padStart(4, "0")} (Kader Posyandu)`,
      jadwal:
        item.jadwal ||
        `Setiap Hari Rabu Minggu ke-${(index % 4) + 1} Pukul 08.30 - 11.30 WIB`,
    };
  });
}

export const SEED_POSYANDU_TEGAL: MasterKomunitasSeedItem[] = buildPosyanduMasterSeed();

