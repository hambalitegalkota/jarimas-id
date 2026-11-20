import type { DataAtsItem, DataAnakItem } from "@/types/database";

export interface FormattedActionHistoryEntry {
  id?: string;
  tipe: "tambah" | "validasi" | "edit" | "bersekolah" | "mutasi" | "hapus";
  label: string;
  waktu: string;
  waktuFormatted: string;
  pelaku?: string;
  role?: string;
  komunitas?: string;
  keterangan?: string;
  badgeDotColor: string;
}

export function formatWibDateTime(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    return (
      new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Jakarta",
      }).format(d) + " WIB"
    );
  } catch {
    return String(dateStr);
  }
}

/**
 * Ekstraksi riwayat aksi terstruktur untuk Data ATS
 */
export function extractActionHistoryFromAts(ats: DataAtsItem): FormattedActionHistoryEntry[] {
  const entries: FormattedActionHistoryEntry[] = [];
  const rawAlasan = String(ats.alasan_tidak_sekolah || "") + " " + String(ats.alasan_sekolah || "") + " " + String(ats.keterangan || "");

  // 1. Aksi Ditambahkan
  const matchTambahWaktu = rawAlasan.match(/\[DITAMBAHKAN_PADA\s*:\s*([^\]]+)\]/i);
  const matchTambahOleh = rawAlasan.match(/\[DITAMBAHKAN_OLEH\s*:\s*([^\]]+)\]/i);
  const waktuTambah = matchTambahWaktu?.[1]?.trim() || ats.created_at;
  const pelakuTambah = matchTambahOleh?.[1]?.trim() || (ats.created_by ? "Pengurus / Pembuat Data" : "Data Master / Sistem");

  if (waktuTambah) {
    entries.push({
      tipe: "tambah",
      label: "Ditambahkan",
      waktu: waktuTambah,
      waktuFormatted: formatWibDateTime(waktuTambah),
      pelaku: pelakuTambah,
      keterangan: ats.is_manual_added || ats.created_by ? "Input manual via form Tambah ATS" : "Data awal terdaftar",
      badgeDotColor: "bg-indigo-500",
    });
  }

  // 2. Aksi Diverifikasi
  const matchVerifWaktu = rawAlasan.match(/\[DIVERIFIKASI_PADA\s*:\s*([^\]]+)\]/i);
  const matchVerifOleh = rawAlasan.match(/\[DIVERIFIKASI_OLEH\s*:\s*([^\]]+)\]/i);
  const waktuVerif = ats.validated_at || matchVerifWaktu?.[1]?.trim();
  const pelakuVerif = matchVerifOleh?.[1]?.trim() || (ats.validated_by ? "Verifikator" : "Admin Komunitas");

  if (waktuVerif || ats.status_approval === "approved") {
    const finalVerifWaktu = waktuVerif || ats.updated_at || ats.created_at;
    entries.push({
      tipe: "validasi",
      label: "Terverifikasi",
      waktu: finalVerifWaktu,
      waktuFormatted: formatWibDateTime(finalVerifWaktu),
      pelaku: pelakuVerif,
      keterangan: "Data ATS telah diverifikasi valid",
      badgeDotColor: "bg-emerald-500",
    });
  }

  // 3. Aksi Edit dari edit_history jika ada
  if (Array.isArray(ats.edit_history) && ats.edit_history.length > 0) {
    ats.edit_history.forEach((item) => {
      if (item.aksi === "hapus" || item.aksi === "bersekolah") return;
      entries.push({
        tipe: "edit",
        label: "Pembaruan Data",
        waktu: item.waktu,
        waktuFormatted: formatWibDateTime(item.waktu),
        pelaku: item.nama,
        role: item.role,
        komunitas: item.komunitas,
        keterangan: item.catatan || "Pembaruan data ATS",
        badgeDotColor: "bg-amber-500",
      });
    });
  }

  // 4. Aksi Kembali Bersekolah
  const matchBersekolahWaktu = rawAlasan.match(/\[BERSEKOLAH_PADA\s*:\s*([^\]]+)\]/i);
  const matchBersekolahOleh = rawAlasan.match(/\[BERSEKOLAH_OLEH\s*:\s*([^\]]+)\]/i);
  const isBersekolah =
    ats.status_approval === "bersekolah" ||
    ats.is_sekolah === true ||
    rawAlasan.includes("[KEMBALI BERSEKOLAH]") ||
    Boolean(ats.bersekolah_at);

  if (isBersekolah) {
    const waktuBersekolah = ats.bersekolah_at || matchBersekolahWaktu?.[1]?.trim() || ats.updated_at || ats.created_at;
    const pelakuBersekolah = ats.bersekolah_oleh || matchBersekolahOleh?.[1]?.trim() || "Pengurus / Tutor";
    entries.push({
      tipe: "bersekolah",
      label: "Kembali Bersekolah",
      waktu: waktuBersekolah,
      waktuFormatted: formatWibDateTime(waktuBersekolah),
      pelaku: pelakuBersekolah,
      keterangan: ats.nama_sekolah ? `Tercatat di ${ats.nama_sekolah}` : "Telah kembali bersekolah",
      badgeDotColor: "bg-teal-500",
    });
  }

  // 5. Aksi Dihapus
  const matchHapusWaktu = rawAlasan.match(/\[DIHAPUS_PADA\s*:\s*([^\]]+)\]/i);
  const matchHapusOleh = rawAlasan.match(/\[DIHAPUS_OLEH\s*:\s*([^\]]+)\]/i);
  const isDeleted = ats.status_approval === "deleted" || rawAlasan.includes("[DIHAPUS") || Boolean(ats.deleted_at);

  if (isDeleted) {
    const waktuHapus = ats.deleted_at || matchHapusWaktu?.[1]?.trim() || ats.updated_at || new Date().toISOString();
    const pelakuHapus = ats.deleted_by || matchHapusOleh?.[1]?.trim() || "Pengurus";
    entries.push({
      tipe: "hapus",
      label: "Dihapus",
      waktu: waktuHapus,
      waktuFormatted: formatWibDateTime(waktuHapus),
      pelaku: pelakuHapus,
      keterangan: "Data ATS dinonaktifkan / dihapus dari daftar aktif",
      badgeDotColor: "bg-rose-500",
    });
  }

  // Urutkan riwayat dari yang paling baru
  return entries.sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());
}

/**
 * Ekstraksi riwayat aksi terstruktur untuk Data Anak (0-6 Tahun)
 */
export function extractActionHistoryFromDataAnak(anak: DataAnakItem): FormattedActionHistoryEntry[] {
  const entries: FormattedActionHistoryEntry[] = [];
  const rawAlasan = String(anak.alasan_sekolah || "");

  // 1. Aksi Ditambahkan
  const matchTambahWaktu = rawAlasan.match(/\[DITAMBAHKAN_PADA\s*:\s*([^\]]+)\]/i);
  const matchTambahOleh = rawAlasan.match(/\[DITAMBAHKAN_OLEH\s*:\s*([^\]]+)\]/i);
  const waktuTambah = matchTambahWaktu?.[1]?.trim() || anak.created_at;
  const pelakuTambah = matchTambahOleh?.[1]?.trim() || (anak.created_by ? "Pengurus / Kader" : "Data Master / Sistem");

  if (waktuTambah) {
    entries.push({
      tipe: "tambah",
      label: "Ditambahkan",
      waktu: waktuTambah,
      waktuFormatted: formatWibDateTime(waktuTambah),
      pelaku: pelakuTambah,
      keterangan: anak.is_manual_added || anak.created_by ? "Input manual via form Tambah Data Anak" : "Data awal terdaftar",
      badgeDotColor: "bg-blue-500",
    });
  }

  // 2. Aksi Diverifikasi
  const matchVerifWaktu = rawAlasan.match(/\[DIVERIFIKASI_PADA\s*:\s*([^\]]+)\]/i);
  const matchVerifOleh = rawAlasan.match(/\[DIVERIFIKASI_OLEH\s*:\s*([^\]]+)\]/i);
  const waktuVerif = anak.validated_at || matchVerifWaktu?.[1]?.trim();
  const pelakuVerif = matchVerifOleh?.[1]?.trim() || (anak.validated_by ? "Verifikator" : "Admin Komunitas");

  if (waktuVerif || anak.status_approval === "approved") {
    const finalVerifWaktu = waktuVerif || anak.terakhir_diperbarui_at || anak.created_at;
    entries.push({
      tipe: "validasi",
      label: "Terverifikasi",
      waktu: finalVerifWaktu,
      waktuFormatted: formatWibDateTime(finalVerifWaktu),
      pelaku: pelakuVerif,
      keterangan: "Data anak telah diverifikasi valid",
      badgeDotColor: "bg-emerald-500",
    });
  }

  // 3. Aksi Edit dari edit_history jika ada
  if (Array.isArray(anak.edit_history) && anak.edit_history.length > 0) {
    anak.edit_history.forEach((item) => {
      if (item.aksi === "hapus" || item.aksi === "mutasi" || item.aksi === "tambah") return;
      entries.push({
        tipe: "edit",
        label: "Pembaruan Data",
        waktu: item.waktu,
        waktuFormatted: formatWibDateTime(item.waktu),
        pelaku: item.nama,
        role: item.role,
        komunitas: item.komunitas,
        keterangan: item.catatan || "Pembaruan identitas/data anak",
        badgeDotColor: "bg-amber-500",
      });
    });
  } else if (anak.terakhir_diperbarui_at && anak.terakhir_diperbarui_at !== anak.created_at) {
    entries.push({
      tipe: "edit",
      label: "Pembaruan Data",
      waktu: anak.terakhir_diperbarui_at,
      waktuFormatted: formatWibDateTime(anak.terakhir_diperbarui_at),
      pelaku: anak.terakhir_diperbarui_oleh_nama || "Pengurus",
      role: anak.terakhir_diperbarui_oleh_role || undefined,
      komunitas: anak.terakhir_diperbarui_oleh_komunitas || undefined,
      keterangan: "Pembaruan identitas/data anak",
      badgeDotColor: "bg-amber-500",
    });
  }

  // 4. Aksi Mutasi Siswa
  const matchMutasiWaktu = rawAlasan.match(/\[MUTASI_PADA\s*:\s*([^\]]+)\]/i);
  const matchMutasiOleh = rawAlasan.match(/\[MUTASI_OLEH\s*:\s*([^\]]+)\]/i);
  const matchMutasiInfo = rawAlasan.match(/\[MUTASI\s*:\s*([^\]]+)\]/i);
  const isMutasi =
    anak.status_approval === "mutasi" ||
    anak.status_approval === "keluar" ||
    rawAlasan.includes("[MUTASI") ||
    rawAlasan.includes("[KELUAR") ||
    Boolean(anak.mutasi_at);

  if (isMutasi) {
    const waktuMutasi = anak.mutasi_at || matchMutasiWaktu?.[1]?.trim() || anak.terakhir_diperbarui_at || anak.created_at;
    const pelakuMutasi = anak.mutasi_oleh || matchMutasiOleh?.[1]?.trim() || "Pengurus Satuan PAUD";
    const ketMutasi = matchMutasiInfo?.[1]?.trim() || (anak.mutasi_tujuan ? `Mutasi ke ${anak.mutasi_tujuan}` : "Mutasi dari sekolah asal");

    entries.push({
      tipe: "mutasi",
      label: "Mutasi Siswa",
      waktu: waktuMutasi,
      waktuFormatted: formatWibDateTime(waktuMutasi),
      pelaku: pelakuMutasi,
      keterangan: ketMutasi,
      badgeDotColor: "bg-indigo-500",
    });
  }

  // 5. Aksi Dihapus
  const matchHapusWaktu = rawAlasan.match(/\[DIHAPUS_PADA\s*:\s*([^\]]+)\]/i);
  const matchHapusOleh = rawAlasan.match(/\[DIHAPUS_OLEH\s*:\s*([^\]]+)\]/i);
  const isDeleted = anak.status_approval === "deleted" || rawAlasan.includes("[DIHAPUS") || Boolean(anak.deleted_at);

  if (isDeleted) {
    const waktuHapus = anak.deleted_at || matchHapusWaktu?.[1]?.trim() || anak.terakhir_diperbarui_at || new Date().toISOString();
    const pelakuHapus = anak.deleted_by || matchHapusOleh?.[1]?.trim() || "Pengurus";
    entries.push({
      tipe: "hapus",
      label: "Dihapus",
      waktu: waktuHapus,
      waktuFormatted: formatWibDateTime(waktuHapus),
      pelaku: pelakuHapus,
      keterangan: "Data anak dinonaktifkan / dihapus dari daftar aktif",
      badgeDotColor: "bg-rose-500",
    });
  }

  // Urutkan riwayat dari yang paling baru
  return entries.sort((a, b) => new Date(b.waktu).getTime() - new Date(a.waktu).getTime());
}
