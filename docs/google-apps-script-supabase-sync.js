/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT: SINKRONISASI DATA ATS LANGSUNG KE SUPABASE (BYPASS VERCEL)
 * ==============================================================================
 * Skrip ini berjalan langsung di Google Sheets dan berkomunikasi langsung
 * dengan Supabase PostgREST API (Bypass Vercel 100%).
 *
 * KEUNTUNGAN:
 * 1. 0% CPU Vercel (Bebas dari limit kuota 4 jam Vercel).
 * 2. 0 Vercel Function Invocations.
 * 3. Menggunakan Bulk Upsert (Satu request bisa memproses 100+ baris sekaligus).
 * 4. Aman dan tidak memicu Infinite Loop karena tidak menggunakan trigger onEdit.
 *
 * CARA PEMASANGAN DI GOOGLE SHEETS:
 * 1. Buka Google Sheet Anda.
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'.
 * 3. Hapus kode lama, lalu paste seluruh isi skrip ini.
 * 4. Simpan proyek (Ctrl + S) dengan nama 'Jarimas Supabase Sync'.
 * 5. Buka kembali Google Sheet Anda dan Refresh (F5).
 * 6. Akan muncul menu baru di atas: '🚀 Jarimas Sync'.
 * 7. Klik '⚡ Cek Koneksi ke Supabase' untuk otorisasi pertama kali.
 * ==============================================================================
 */

const CONFIG = {
  // URL Project Supabase JARIMAS-ID
  SUPABASE_URL: "https://nzfwkpwabfiettoixtdk.supabase.co",

  // Kunci Anon / Public Supabase (Sudah diberikan izin RLS di data_anak)
  SUPABASE_ANON_KEY: "sb_publishable_cseh0XvvzEyoWjxbj_JoIg_hdungUJk",

  // Akun Admin Pengelola Sistem Jarimas
  SYSTEM_USER_ID: "1d827e22-9253-486a-a948-3fac6d01ae38",

  // ID Default Komunitas Warga Kota Tegal
  DEFAULT_KOMUNITAS_ID: "79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703",

  // Jumlah baris per batch pengiriman (misal: 100 baris per 1 request HTTP)
  BATCH_SIZE: 100,
};

/**
 * Membuat Menu Kustom saat Google Sheet dibuka
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🚀 Jarimas Sync")
    .addItem("📤 Kirim / Sinkronkan Data ATS ke Database", "syncPushDataAtsToSupabase")
    .addItem("📥 Tarik Data ATS Terbaru dari Database", "syncPullDataAtsFromSupabase")
    .addSeparator()
    .addItem("⚡ Cek Koneksi ke Supabase", "testSupabaseConnection")
    .addToUi();
}

/**
 * Uji Coba Koneksi ke Supabase
 */
function testSupabaseConnection() {
  const ui = SpreadsheetApp.getUi();
  try {
    const url = CONFIG.SUPABASE_URL + "/rest/v1/data_anak?select=id&limit=1";
    const response = UrlFetchApp.fetch(url, {
      method: "get",
      headers: {
        apikey: CONFIG.SUPABASE_ANON_KEY,
        Authorization: "Bearer " + CONFIG.SUPABASE_ANON_KEY,
      },
      muteHttpExceptions: true,
    });

    const statusCode = response.getResponseCode();
    if (statusCode >= 200 && statusCode < 300) {
      ui.alert(
        "✅ Koneksi Berhasil",
        "Google Sheets berhasil terhubung langsung ke database Supabase Jarimas!\nStatus HTTP: " + statusCode,
        ui.ButtonSet.OK
      );
    } else {
      ui.alert(
        "❌ Koneksi Gagal",
        "Gagal terhubung ke Supabase. Kode: " + statusCode + "\nRespon: " + response.getContentText(),
        ui.ButtonSet.OK
      );
    }
  } catch (err) {
    ui.alert("❌ Error", "Terjadi kesalahan: " + err.message, ui.ButtonSet.OK);
  }
}

/**
 * Helper: Normalisasi Header Kolom
 */
function cleanHeader(header) {
  if (!header) return "";
  return String(header)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Helper: Temukan indeks kolom berdasarkan variasi kata kunci
 */
function findColIndex(headers, aliases) {
  for (let i = 0; i < headers.length; i++) {
    const cleaned = cleanHeader(headers[i]);
    for (let j = 0; j < aliases.length; j++) {
      if (cleaned === cleanHeader(aliases[j])) {
        return i;
      }
    }
  }
  return -1;
}

/**
 * Helper: Normalisasi Keinginan Sekolah
 */
function normalizeKeinginanSekolah(val) {
  if (!val) return "Masih Ada";
  const s = String(val).trim().toLowerCase();
  if (
    s.includes("tidak") ||
    s.includes("tida") ||
    s.includes("tdk") ||
    s.includes("bukan") ||
    s.includes("belum") ||
    s.includes("gamau") ||
    s.includes("ga mau") ||
    s === "false" ||
    s === "0"
  ) {
    return "Tidak Ada";
  }
  return "Masih Ada";
}

/**
 * Helper: Format Tanggal Lahir (YYYY-MM-DD) atau estimasi dari Usia
 */
function parseBirthDateOrAge(rawDate, rawAge) {
  const currentYear = new Date().getFullYear();

  if (rawDate) {
    if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
      return Utilities.formatDate(rawDate, "GMT+7", "yyyy-MM-dd");
    }
    const s = String(rawDate).trim();
    const isoMatch = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
      return isoMatch[1] + "-" + ("0" + isoMatch[2]).slice(-2) + "-" + ("0" + isoMatch[3]).slice(-2);
    }
    const dmyMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (dmyMatch) {
      return dmyMatch[3] + "-" + ("0" + dmyMatch[2]).slice(-2) + "-" + ("0" + dmyMatch[1]).slice(-2);
    }
  }

  if (rawAge !== undefined && rawAge !== null && rawAge !== "") {
    const sAge = String(rawAge).trim();
    if (sAge.includes(">") || sAge.includes("25") || sAge.includes("24")) {
      return (currentYear - 25) + "-07-01";
    }
    const match = sAge.match(/(\d+)/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed >= 4 && parsed <= 40) {
        return (currentYear - parsed) + "-07-01";
      }
    }
  }

  // Fallback standar usia ATS SMP (14 tahun)
  return (currentYear - 14) + "-07-01";
}

/**
 * Helper: Hitung usia dari tanggal lahir
 */
function calculateAge(birthDateStr) {
  if (!birthDateStr) return "14";
  try {
    const bDate = new Date(birthDateStr);
    const now = new Date();
    let age = now.getFullYear() - bDate.getFullYear();
    const m = now.getMonth() - bDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < bDate.getDate())) {
      age--;
    }
    return age >= 4 ? String(age) : "14";
  } catch (e) {
    return "14";
  }
}

/**
 * Helper: Susun format string terstruktur alasan_sekolah untuk data ATS
 */
function serializeAtsAlasan(params) {
  const keinginan = normalizeKeinginanSekolah(params.keinginan);
  const alasan = (params.alasan || "Tidak ada biaya").toString().trim();

  let res = "[KEINGINAN:" + keinginan + "] [ALASAN:" + alasan + "]";
  if (params.alamat) res += " [ALAMAT:" + String(params.alamat).trim() + "]";
  if (params.rt) res += " [RT:" + String(params.rt).trim() + "]";
  if (params.rw) res += " [RW:" + String(params.rw).trim() + "]";
  if (params.kelurahan) res += " [KEL:" + String(params.kelurahan).trim() + "]";
  if (params.kecamatan) res += " [KEC:" + String(params.kecamatan).trim() + "]";
  if (params.jenjangAsal) res += " [JENJANG:" + String(params.jenjangAsal).trim() + "]";
  if (params.sekolahSebelumnya) res += " [SEKOLAH:" + String(params.sekolahSebelumnya).trim() + "]";
  if (params.kelasTerakhir) res += " [KELAS:" + String(params.kelasTerakhir).trim() + "]";
  if (params.keterangan) res += " [KET:" + String(params.keterangan).trim() + "]";

  return res;
}

/**
 * Helper: Parse string terstruktur alasan_sekolah
 */
function parseAtsAlasan(raw) {
  const s = String(raw || "");
  const extract = function (key) {
    const m = s.match(new RegExp("\\[" + key + ":([^\\]]*)\\]", "i"));
    return m ? m[1].trim() : "";
  };

  return {
    keinginan: extract("KEINGINAN") || "Masih Ada",
    alasan: extract("ALASAN") || "Tidak ada biaya",
    alamat: extract("ALAMAT"),
    rt: extract("RT"),
    rw: extract("RW"),
    kelurahan: extract("KEL"),
    kecamatan: extract("KEC"),
    jenjangAsal: extract("JENJANG"),
    sekolahSebelumnya: extract("SEKOLAH"),
    kelasTerakhir: extract("KELAS"),
    keterangan: extract("KET"),
  };
}

/**
 * ==============================================================================
 * 1. KIRIM DATA ATS DARI SHEET KE SUPABASE (UPLOAD / UPSERT BULK)
 * ==============================================================================
 */
function syncPushDataAtsToSupabase() {
  const ui = SpreadsheetApp.getUi();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow < 2) {
    ui.alert("⚠️ Data Kosong", "Tidak ada data pada spreadsheet untuk disinkronkan.", ui.ButtonSet.OK);
    return;
  }

  // Tampilkan notifikasi awal
  SpreadsheetApp.getActiveSpreadsheet().toast("Memulai proses sinkronisasi ke Supabase...", "Jarimas Sync", 5);

  const rawHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // Identifikasi Indeks Kolom
  let colId = findColIndex(rawHeaders, ["id", "uuid", "id_anak"]);
  const colNama = findColIndex(rawHeaders, ["namalengkap", "nama", "namaanak"]);
  const colTglLahir = findColIndex(rawHeaders, ["tanggallahir", "tgllahir", "birthdate", "tgl"]);
  const colUsia = findColIndex(rawHeaders, ["usia", "umur", "age"]);
  const colJk = findColIndex(rawHeaders, ["jeniskelamin", "jk", "gender"]);
  const colOrtu = findColIndex(rawHeaders, ["namaorangtua", "orangtua", "wali", "ayah", "ibu", "ortu"]);
  const colHp = findColIndex(rawHeaders, ["nomorhp", "nohp", "telepon", "kontak", "wa"]);
  const colTinggal = findColIndex(rawHeaders, ["tinggalbersama", "tinggal"]);
  const colAlamat = findColIndex(rawHeaders, ["alamat", "alamatjalan", "jalan"]);
  const colRt = findColIndex(rawHeaders, ["rt"]);
  const colRw = findColIndex(rawHeaders, ["rw"]);
  const colKel = findColIndex(rawHeaders, ["kelurahan", "desa"]);
  const colKec = findColIndex(rawHeaders, ["kecamatan"]);
  const colJenjang = findColIndex(rawHeaders, ["jenjangasal", "kategoriats", "jenjang"]);
  const colSekolah = findColIndex(rawHeaders, ["sekolahsebelumnya", "sekolahasal", "sekolah"]);
  const colKelas = findColIndex(rawHeaders, ["kelasterakhir", "kelas"]);
  const colKeinginan = findColIndex(rawHeaders, ["keinginansekolah", "keinginan"]);
  const colAlasan = findColIndex(rawHeaders, ["alasantidaksekolah", "alasan"]);
  const colKet = findColIndex(rawHeaders, ["keterangan", "ket", "catatan"]);
  let colStatus = findColIndex(rawHeaders, ["status", "statussinkron", "status_sync"]);

  if (colNama === -1) {
    ui.alert("❌ Error", "Kolom 'Nama Lengkap' tidak ditemukan pada baris header.", ui.ButtonSet.OK);
    return;
  }

  // Buat kolom ID otomatis di paling kanan jika belum ada
  if (colId === -1) {
    colId = lastCol;
    sheet.getRange(1, colId + 1).setValue("ID (Sistem Database)");
  }

  // Buat kolom Status Sinkron jika belum ada
  if (colStatus === -1) {
    colStatus = sheet.getLastColumn();
    sheet.getRange(1, colStatus + 1).setValue("Status Sinkron");
  }

  // Ambil data baris
  const dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
  const rows = dataRange.getValues();

  // 1. Ambil data anak ATS yang sudah ada di Supabase untuk pencocokan nama
  const existingMapByName = {};
  try {
    const existingUrl =
      CONFIG.SUPABASE_URL +
      "/rest/v1/data_anak?select=id,nama_lengkap,nama_orangtua&or=(is_sekolah.is.null,is_sekolah.eq.false)&limit=5000";

    const getRes = UrlFetchApp.fetch(existingUrl, {
      method: "get",
      headers: {
        apikey: CONFIG.SUPABASE_ANON_KEY,
        Authorization: "Bearer " + CONFIG.SUPABASE_ANON_KEY,
      },
      muteHttpExceptions: true,
    });

    if (getRes.getResponseCode() === 200) {
      const existingList = JSON.parse(getRes.getContentText());
      for (let k = 0; k < existingList.length; k++) {
        const item = existingList[k];
        const key =
          String(item.nama_lengkap || "").trim().toLowerCase() +
          "|" +
          String(item.nama_orangtua || "").trim().toLowerCase();
        existingMapByName[key] = item.id;
      }
    }
  } catch (lookupErr) {
    console.warn("Lookup data existing warning:", lookupErr);
  }

  // 2. Susun Payload
  const payloads = [];
  const rowIndexes = [];
  const generatedIds = [];

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    const namaLengkap = String(row[colNama] || "").trim();
    if (!namaLengkap || namaLengkap.length < 2) continue;

    let currentId = String(row[colId] || "").trim();
    const namaOrtu = colOrtu !== -1 ? String(row[colOrtu] || "").trim() : "-";
    const lookupKey = namaLengkap.toLowerCase() + "|" + namaOrtu.toLowerCase();

    // Jika ID di sheet kosong, cek apakah sudah pernah ada di Supabase
    if (!currentId || currentId.length < 15) {
      if (existingMapByName[lookupKey]) {
        currentId = existingMapByName[lookupKey];
      } else {
        // Generate UUIDv4 native Google Apps Script
        currentId = Utilities.getUuid();
      }
    }

    const rawJk = colJk !== -1 ? String(row[colJk] || "").trim().toUpperCase() : "L";
    const jk = rawJk.startsWith("P") || rawJk === "PEREMPUAN" ? "P" : "L";

    const birthDate = parseBirthDateOrAge(
      colTglLahir !== -1 ? row[colTglLahir] : null,
      colUsia !== -1 ? row[colUsia] : null
    );

    const formattedAlasan = serializeAtsAlasan({
      keinginan: colKeinginan !== -1 ? row[colKeinginan] : "Masih Ada",
      alasan: colAlasan !== -1 ? row[colAlasan] : "Tidak ada biaya",
      alamat: colAlamat !== -1 ? row[colAlamat] : "",
      rt: colRt !== -1 ? row[colRt] : "",
      rw: colRw !== -1 ? row[colRw] : "",
      kelurahan: colKel !== -1 ? row[colKel] : "",
      kecamatan: colKec !== -1 ? row[colKec] : "Tegal Selatan",
      jenjangAsal: colJenjang !== -1 ? row[colJenjang] : "",
      sekolahSebelumnya: colSekolah !== -1 ? row[colSekolah] : "",
      kelasTerakhir: colKelas !== -1 ? row[colKelas] : "",
      keterangan: colKet !== -1 ? row[colKet] : "",
    });

    const itemPayload = {
      id: currentId,
      nama_lengkap: namaLengkap,
      tanggal_lahir: birthDate,
      jenis_kelamin: jk,
      nama_orangtua: namaOrtu || "-",
      nomor_hp: colHp !== -1 ? String(row[colHp] || "").trim() : "",
      tinggal_bersama: colTinggal !== -1 ? String(row[colTinggal] || "").trim() || "Orang Tua" : "Orang Tua",
      jarak_rumah_km: 0,
      is_sekolah: false,
      nama_sekolah: "ATS - Anak Tidak Sekolah",
      alasan_sekolah: formattedAlasan,
      komunitas_id: CONFIG.DEFAULT_KOMUNITAS_ID,
      status_approval: "pending",
      created_by: CONFIG.SYSTEM_USER_ID,
      updated_at: new Date().toISOString(),
    };

    payloads.push(itemPayload);
    rowIndexes.push(r);
    generatedIds.push(currentId);
  }

  if (payloads.length === 0) {
    ui.alert("ℹ️ Informasi", "Tidak ada baris data valid untuk disinkronkan.", ui.ButtonSet.OK);
    return;
  }

  // 3. Eksekusi Pengiriman Massal (Bulk Upsert) dalam Chunks
  let successCount = 0;
  let failCount = 0;
  const nowStr = Utilities.formatDate(new Date(), "GMT+7", "yyyy-MM-dd HH:mm");

  for (let i = 0; i < payloads.length; i += CONFIG.BATCH_SIZE) {
    const chunkPayload = payloads.slice(i, i + CONFIG.BATCH_SIZE);
    const chunkRowIndexes = rowIndexes.slice(i, i + CONFIG.BATCH_SIZE);
    const chunkIds = generatedIds.slice(i, i + CONFIG.BATCH_SIZE);

    try {
      const postUrl = CONFIG.SUPABASE_URL + "/rest/v1/data_anak";
      const options = {
        method: "post",
        headers: {
          apikey: CONFIG.SUPABASE_ANON_KEY,
          Authorization: "Bearer " + CONFIG.SUPABASE_ANON_KEY,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates", // Otomatis Upsert Massal
        },
        payload: JSON.stringify(chunkPayload),
        muteHttpExceptions: true,
      };

      const res = UrlFetchApp.fetch(postUrl, options);
      const code = res.getResponseCode();

      if (code >= 200 && code < 300) {
        successCount += chunkPayload.length;
        // Update ID dan Status di sheet untuk baris yang berhasil
        for (let idx = 0; idx < chunkRowIndexes.length; idx++) {
          const rIdx = chunkRowIndexes[idx];
          rows[rIdx][colId] = chunkIds[idx];
          rows[rIdx][colStatus] = "Tersimpan ke Database (" + nowStr + ")";
        }
      } else {
        failCount += chunkPayload.length;
        console.error("Batch error: " + res.getContentText());
        for (let idx = 0; idx < chunkRowIndexes.length; idx++) {
          const rIdx = chunkRowIndexes[idx];
          rows[rIdx][colStatus] = "Gagal (HTTP " + code + ")";
        }
      }
    } catch (chunkErr) {
      failCount += chunkPayload.length;
      console.error("Chunk exception:", chunkErr);
      for (let idx = 0; idx < chunkRowIndexes.length; idx++) {
        const rIdx = chunkRowIndexes[idx];
        rows[rIdx][colStatus] = "Error: " + chunkErr.message;
      }
    }
  }

  // 4. Tulis kembali ID & Status ke Sheet sekali jalan (High Performance)
  dataRange.setValues(rows);

  SpreadsheetApp.getActiveSpreadsheet().toast("Sinkronisasi Selesai!", "Jarimas Sync", 5);

  ui.alert(
    "🎉 Sinkronisasi Selesai",
    "Berhasil menyimpan langsung ke Supabase (Bypass Vercel 100%):\n\n" +
      "• Berhasil : " + successCount + " data\n" +
      "• Gagal    : " + failCount + " data\n\n" +
      "Kolom ID dan Status Sinkron telah diperbarui di spreadsheet.",
    ui.ButtonSet.OK
  );
}

/**
 * ==============================================================================
 * 2. TARIK DATA ATS TERBARU DARI SUPABASE KE SHEET (DOWNLOAD / PULL)
 * ==============================================================================
 */
function syncPullDataAtsFromSupabase() {
  const ui = SpreadsheetApp.getUi();
  const confirm = ui.alert(
    "Tarik Data ATS dari Database",
    "Apakah Anda ingin menarik data ATS terbaru dari Supabase ke sheet ini?\nData yang ada dengan ID yang sama akan diperbarui.",
    ui.ButtonSet.YES_NO
  );

  if (confirm !== ui.Button.YES) return;

  SpreadsheetApp.getActiveSpreadsheet().toast("Mengambil data dari Supabase...", "Jarimas Sync", 5);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const getUrl =
    CONFIG.SUPABASE_URL +
    "/rest/v1/data_anak?select=id,nama_lengkap,tanggal_lahir,jenis_kelamin,nama_orangtua,nomor_hp,tinggal_bersama,alasan_sekolah,status_approval,created_at,updated_at&or=(is_sekolah.is.null,is_sekolah.eq.false)&order=created_at.desc&limit=2000";

  try {
    const res = UrlFetchApp.fetch(getUrl, {
      method: "get",
      headers: {
        apikey: CONFIG.SUPABASE_ANON_KEY,
        Authorization: "Bearer " + CONFIG.SUPABASE_ANON_KEY,
      },
      muteHttpExceptions: true,
    });

    if (res.getResponseCode() !== 200) {
      ui.alert("❌ Gagal", "Gagal mengambil data dari Supabase: " + res.getContentText(), ui.ButtonSet.OK);
      return;
    }

    const items = JSON.parse(res.getContentText());
    if (!items || items.length === 0) {
      ui.alert("ℹ️ Informasi", "Tidak ada data ATS yang ditemukan di database.", ui.ButtonSet.OK);
      return;
    }

    // Siapkan Header Standar jika sheet masih kosong
    if (sheet.getLastRow() < 1) {
      const standardHeaders = [
        "Nama Lengkap",
        "Tanggal Lahir",
        "Usia",
        "Jenis Kelamin",
        "Nama Orang Tua",
        "No HP",
        "Tinggal Bersama",
        "Alamat",
        "RT",
        "RW",
        "Kelurahan",
        "Kecamatan",
        "Jenjang Asal",
        "Sekolah Asal",
        "Kelas Terakhir",
        "Keinginan Sekolah",
        "Alasan Tidak Sekolah",
        "Keterangan",
        "Status Verifikasi",
        "ID (Sistem Database)",
      ];
      sheet.getRange(1, 1, 1, standardHeaders.length).setValues([standardHeaders]);
    }

    const lastCol = sheet.getLastColumn();
    const rawHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // Buat mapping ID baris yang sudah ada di sheet
    const existingRowMap = {};
    const colId = findColIndex(rawHeaders, ["id", "uuid", "id_anak"]);

    if (colId !== -1 && sheet.getLastRow() > 1) {
      const idValues = sheet.getRange(2, colId + 1, sheet.getLastRow() - 1, 1).getValues();
      for (let r = 0; r < idValues.length; r++) {
        const idVal = String(idValues[r][0] || "").trim();
        if (idVal) existingRowMap[idVal] = r + 2; // Baris riil di sheet (1-based)
      }
    }

    let addedCount = 0;
    let updatedCount = 0;
    const newRowsToAppend = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const parsed = parseAtsAlasan(item.alasan_sekolah);
      const usia = calculateAge(item.tanggal_lahir);
      const statusVerif = item.status_approval === "approved" ? "Terverifikasi" : "Pending";

      const rowData = [
        item.nama_lengkap || "",
        item.tanggal_lahir || "",
        usia,
        item.jenis_kelamin || "L",
        item.nama_orangtua || "-",
        item.nomor_hp || "",
        item.tinggal_bersama || "Orang Tua",
        parsed.alamat || "",
        parsed.rt || "",
        parsed.rw || "",
        parsed.kelurahan || "",
        parsed.kecamatan || "",
        parsed.jenjangAsal || "",
        parsed.sekolahSebelumnya || "",
        parsed.kelasTerakhir || "",
        parsed.keinginan || "Masih Ada",
        parsed.alasan || "Tidak ada biaya",
        parsed.keterangan || "",
        statusVerif,
        item.id,
      ];

      // Jika ID sudah ada di sheet, update baris tersebut
      if (item.id && existingRowMap[item.id]) {
        const targetRowNum = existingRowMap[item.id];
        sheet.getRange(targetRowNum, 1, 1, rowData.length).setValues([rowData]);
        updatedCount++;
      } else {
        newRowsToAppend.push(rowData);
        addedCount++;
      }
    }

    // Tambahkan baris baru secara massal jika ada
    if (newRowsToAppend.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, newRowsToAppend.length, newRowsToAppend[0].length).setValues(newRowsToAppend);
    }

    SpreadsheetApp.getActiveSpreadsheet().toast("Tarik data selesai!", "Jarimas Sync", 5);

    ui.alert(
      "✅ Selesai Menarik Data",
      "Data dari database Supabase berhasil ditarik:\n\n" +
        "• Data Baru Ditambahkan : " + addedCount + "\n" +
        "• Data Diperbarui       : " + updatedCount,
      ui.ButtonSet.OK
    );
  } catch (err) {
    ui.alert("❌ Error", "Terjadi kesalahan saat menarik data: " + err.message, ui.ButtonSet.OK);
  }
}
