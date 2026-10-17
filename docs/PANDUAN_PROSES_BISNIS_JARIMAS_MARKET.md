# DOKUMEN PROSES BISNIS & PANDUAN RESMI JARIMAS MARKET
**Pedoman Operasional & Teknis Terpadu untuk Admin Market, Pembeli (Kader & Masyarakat), dan Pengembang Aplikasi**  
*Inisiatif Platform Jaringan Informasi Masyarakat (Jarimas) — Kota Tegal*

---

## INFORMASI DOKUMEN
| Atribut | Keterangan |
| :--- | :--- |
| **Judul Dokumen** | Dokumen Proses Bisnis & Panduan Terintegrasi Jarimas Market |
| **Nomor Dokumen** | JRM-MKT-SOP-2026-V1 |
| **Versi** | 1.0.0 (Release Resmi Produksi) |
| **Tanggal Pembaruan** | Oktober 2026 |
| **Klasifikasi** | Publik & Operasional Internal (Admin, Pembeli, Pengembang) |
| **Sistem Terkait** | Platform Jarimas Kota Tegal (`jarimas-id`) |
| **Penulis** | Tim Arsitek Sistem & Pengembang Platform Jarimas |

---

## RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)
**Jarimas Market** merupakan sub-ekosistem e-commerce dan pengadaan logistik terintegrasi dalam platform **Jarimas (Jaringan Informasi Masyarakat Kota Tegal)**. Fitur ini dirancang secara khusus untuk menjawab tantangan pemenuhan sarana dan prasarana Standar Pelayanan Minimal (SPM), khususnya pada pilar **Kesehatan (Posyandu)** dan **Pendidikan (Satuan PAUD / PKBM / SKB)**, serta kebutuhan seragam, merchandise, dan modul kader se-Kota Tegal.

Melalui sistem Jarimas Market, proses pemesanan barang dapat dilakukan secara terstruktur dengan verifikasi instansi lokal (mencakup 4 Kecamatan: Tegal Timur, Tegal Barat, Tegal Selatan, Margadana dan 27 Kelurahan), kebijakan **Bebas Ongkir (Gratis Ongkir se-Kota Tegal)**, opsi pembayaran multi-kanal (QRIS Nasional dan Transfer Rekening Bank Resmi), serta pelacakan resi berbasis sistem logistik internal (`JRM-TG...`).

Dokumen ini disusun sebagai panduan menyeluruh tiga dimensi:
1. **Panduan Pembeli**: Menjelaskan alur pencarian, pemilihan produk, pengisian alamat, transaksi, dan pelacakan pesanan.
2. **Panduan Admin Market**: Menjelaskan SOP pengelolaan katalog produk, verifikasi bukti pembayaran, pengemasan, penerbitan nomor resi, pengiriman, dan pembatalan pesanan.
3. **Panduan Pengembang & Pengelola Sistem**: Menguraikan arsitektur sistem Next.js 16/React 19, database Supabase PostgreSQL, state machine transaksi, server actions, skema validasi Zod, keamanan kontrol akses (RBAC), revalidasi cache, hingga roadmap pengembangan lanjutan (Automated Gateway & WhatsApp API).

---

## DAFTAR ISI
1. **BAB I: PENDAHULUAN & ARSITEKTUR KONSEPTUAL BISNIS**
   - 1.1 Latar Belakang & Filosofi Pengadaan Berbasis Komunitas
   - 1.2 Visi, Misi, dan Tujuan Jarimas Market
   - 1.3 Matriks Peran & Tanggung Jawab (RACI Matrix)
   - 1.4 Ruang Lingkup Layanan & Kebijakan Ongkos Kirim
2. **BAB II: DIAGRAM ALUR PROSES BISNIS END-TO-END (BPMN)**
   - 2.1 Diagram Swimlane Transaksi End-to-End
   - 2.2 Diagram Status Transaksi (State Transition Lifecycle)
   - 2.3 Mekanisme Atomik Reservasi & Pengembalian Stok
3. **BAB III: PANDUAN OPERASIONAL UNTUK PEMBELI (BUYER'S GUIDE)**
   - 3.1 Registrasi & Persiapan Akun Pengguna
   - 3.2 Menjelajahi Katalog & Filter 5 Kategori Produk
   - 3.3 Membaca Detail Spesifikasi & Indikator Ketersediaan Stok
   - 3.4 Panduan Langkah-demi-Langkah Formulir Checkout Pesanan
   - 3.5 Panduan Pembayaran (QRIS Instan & Transfer Bank Manual)
   - 3.6 Memantau Riwayat Transaksi & Rincian Pesanan
   - 3.7 Serah Terima Logistik & Pusat Bantuan
4. **BAB IV: PANDUAN OPERASIONAL UNTUK ADMIN MARKET (MERCHANT GUIDE)**
   - 4.1 Otorisasi & Hak Akses Panel Super Admin
   - 4.2 Manajemen Master Katalog Produk (Tambah, Edit, Stok, Status Aktif)
   - 4.3 Monitoring Antrean Pesanan Masuk & Filter Status
   - 4.4 Prosedur Verifikasi Pembayaran (Validasi Mutasi Bank/QRIS)
   - 4.5 Standar Pengemasan (Packing SOP) & Quality Control
   - 4.6 Penerbitan Nomor Resi Logistik (`JRM-TG...`) & Pengiriman
   - 4.7 Penanganan Pembatalan Pesanan & Retur Barang
   - 4.8 Penyelesaian Transaksi & Rekonsiliasi Harian
5. **BAB V: PANDUAN PENGELOLA & PENGEMBANG APLIKASI (DEVELOPER MANUAL)**
   - 5.1 Arsitektur Teknologi & Dependency Stack
   - 5.2 Skema Database PostgreSQL & Relasi Entitas
   - 5.3 Spesifikasi Server Actions & API Contracts
   - 5.4 Validasi Data Menggunakan Zod Schemas
   - 5.5 Kontrol Akses, Autentikasi & Row Level Security (RLS)
   - 5.6 Strategi Cache & Revalidasi Path Next.js
   - 5.7 Penanganan Kasus Kritis (Edge Cases) & Error Handling
   - 5.8 Matriks Pengujian Fungsional (Test Cases)
   - 5.9 Roadmap Pengembangan Arsitektur Masa Depan
6. **BAB VI: STANDAR OPERASIONAL PROSEDUR (SOP) & SERVICE LEVEL AGREEMENT (SLA)**
   - 6.1 Matriks SLA Pemrosesan Transaksi
   - 6.2 Prosedur Eskalasi Insiden & Kendala Operasional
7. **BAB VII: KESIMPULAN & SALURAN DUKUNGAN RESMI**

---

## BAB I: PENDAHULUAN & ARSITEKTUR KONSEPTUAL BISNIS

### 1.1 Latar Belakang & Filosofi Pengadaan Berbasis Komunitas
Pelaksanaan Standar Pelayanan Minimal (SPM) dan pelayanan sosial kemasyarakatan di Kota Tegal membutuhkan dukungan sarana fisik yang memadai, terstandarisasi, dan mudah diakses oleh para kader di lini terdepan (Kader Posyandu, Pengelola PAUD/PKBM, serta Relawan SPM RT/RW).

Sebelum adanya Jarimas Market, pengadaan logistik seperti timbangan bayi dacin/digital, pita LILA (Lingkar Lengan Atas), alat ukur tinggi badan (stadiometer), Alat Permainan Edukatif (APE) PAUD, buku register posyandu, dan seragam kader dilakukan secara terfragmentasi dan manual. 

**Jarimas Market** hadir sebagai solusi sentralisasi pengadaan resmi yang menghadirkan:
- **Transparansi Harga & Spesifikasi**: Setiap barang tertera jelas harga, berat, foto riil, dan peruntukannya.
- **Katalog Terkurasi**: Produk disesuaikan dengan standarisasi Dinas Kesehatan dan Dinas Pendidikan Kota Tegal.
- **Kemudahan Logistik Lokal**: Alamat pengiriman terintegrasi langsung dengan struktur wilayah 4 Kecamatan dan 27 Kelurahan Kota Tegal.
- **Efisiensi Anggaran**: Diberlakukan kebijakan **Bebas Biaya Pengiriman (Gratis Ongkir)** untuk seluruh wilayah Kota Tegal.

### 1.2 Visi, Misi, dan Tujuan Jarimas Market
- **Visi**: Menjadi ekosistem pengadaan sarana posyandu, pendidikan anak, dan sarana komunitas yang paling transparan, efisien, dan andal di Kota Tegal.
- **Misi**:
  1. Menyediakan sarana posyandu dan edukasi berkualitas tinggi yang sesuai standar teknis pemerintah.
  2. Memangkas rantai distribusi pengadaan agar kader dan masyarakat mendapatkan akses barang secara cepat.
  3. Memastikan pencatatan inventaris dan transaksi tercatat secara digital, akuntabel, dan terlacak secara real-time.
- **Tujuan Utama**:
  - Menghilangkan friksi belanja pengadaan bagi kader dan pengurus posyandu/PAUD.
  - Menjamin ketersediaan stok fisik barang logistik penting di Kota Tegal.
  - Memberikan pengalaman transaksi yang ramah pengguna, baik via ponsel pintar maupun komputer meja.

### 1.3 Matriks Peran & Tanggung Jawab (RACI Matrix)
Untuk menjamin akuntabilitas, pembagian tugas dalam ekosistem Jarimas Market diatur menggunakan model RACI:
*(R = Responsible, A = Accountable, C = Consulted, I = Informed)*

| Aktivitas Operasional / Teknis | Pembeli (Kader/Warga) | Admin Market (Super Admin) | Admin Pusat | Pengembang / IT |
| :--- | :---: | :---: | :---: | :---: |
| **Menjelajahi Katalog & Memilih Produk** | **R / A** | I | I | I |
| **Melakukan Checkout & Input Alamat** | **R / A** | I | I | I |
| **Melakukan Pembayaran (QRIS/Transfer)** | **R / A** | C | I | I |
| **Menambah / Mengedit Katalog Produk** | I | **R / A** | C | I |
| **Memantau Stok & Inventarisasi Gudang** | I | **R / A** | I | C |
| **Verifikasi Pembayaran Masuk** | I | **R / A** | I | C |
| **Pengemasan Barang (Packing & QC)** | I | **R / A** | I | I |
| **Penerbitan Nomor Resi & Dispatch Pengiriman** | I | **R / A** | I | C |
| **Konfirmasi Barang Diterima** | **R / A** | **R / A** | I | I |
| **Pembatalan Pesanan & Restocking** | I | **R / A** | C | I |
| **Pemeliharaan Database & Server Actions** | I | I | I | **R / A** |
| **Audit Keamanan & Penanganan Galat Sistem** | I | C | I | **R / A** |

### 1.4 Ruang Lingkup Layanan & Kebijakan Ongkos Kirim
1. **5 Kategori Resmi Jarimas Market**:
   - **Kesehatan & Gizi**: Makanan Tambahan (PMT) balita/lansia, biskuit gizi, vitamin, suplemen posyandu.
   - **Alat Posyandu**: Timbangan dacin, timbangan digital bayi, stadiometer, infantometer, pita ukur LILA, tensimeter digital.
   - **Edukasi PAUD**: Alat Permainan Edukatif (APE) balok kayu, puzzle alfabet, sensory play, perlengkapan stimulasi motorik anak.
   - **Merchandise & Seragam**: Rompi resmi kader Jarimas, seragam posyandu kelurahan, tote bag kanvas, ID Card lanyard resmi.
   - **Buku & Modul**: Buku register Posyandu, panduan tumbuh kembang KMS (Kartu Menuju Sehat), buku administrasi RT/RW, pedoman 6 pilar SPM.
2. **Wilayah Layanan Resmi (Kota Tegal)**:
   - **Kecamatan Tegal Timur**: Kelurahan Kejambon, Mangkukusuman, Mintaragen, Panggung, Slerok.
   - **Kecamatan Tegal Barat**: Kelurahan Kraton, Kemandungan, Pekauman, Pesurungan Kidul, Tegalsari.
   - **Kecamatan Tegal Selatan**: Kelurahan Bandung, Debong Kidul, Debong Kulon, Debong Lor, Debong Tengah, Kalinyamat Kulon, Kalinyamat Wetan, Randugunting, Tunon.
   - **Kecamatan Margadana**: Kelurahan Cabawan, Kaligangsa, Kalinyamat Kulon, Krandon, Margadana, Pesurungan Lor, Sumurpanggang.
3. **Kebijakan Bebas Ongkos Kirim (Gratis Ongkir)**:
   - Nilai ongkos kirim pada sistem dihitung **Rp 0 (Gratis Ongkir)** secara default untuk seluruh alamat tujuan di wilayah Kota Tegal.
   - Pengiriman dilakukan melalui armada kurir internal tim logistik Jarimas Kota Tegal.

---

## BAB II: DIAGRAM ALUR PROSES BISNIS END-TO-END

### 2.1 Alur Makro Proses Bisnis Jarimas Market (Swimlane Overview)
Proses bisnis Jarimas Market melibatkan 4 entitas utama: **Pembeli**, **Sistem / Database Supabase**, **Admin Market**, dan **Kurir Pengantaran**.

```
[PEMBELI]                     [SISTEM / DB]                   [ADMIN MARKET]            [KURIR LOGISTIK]
   |                                |                               |                         |
   |--- 1. Pilih Produk ----------> |                               |                         |
   |--- 2. Isi Form Checkout -----> |                               |                         |
   |    (Nama, HP, Kel, Alamat)     |                               |                         |
   |                                |-- 3. Validasi Zod & Auth      |                         |
   |                                |-- 4. Cek Stok (db.stok >= qty)|                         |
   |                                |-- 5. Insert pesanan 'pending' |                         |
   |                                |-- 6. Kurangi stok produk ---->| (Stok berkurang)        |
   |<-- 7. Redirect ke /pesanan --- |                               |                         |
   |    (Tampil QRIS/Rekening Bank) |                               |                         |
   |                                |                               |                         |
   |--- 8. Transfer / Scan QRIS     |                               |                         |
   |                                |                               |--- 9. Cek Mutasi Bank   |
   |                                |                               |--- 10. Klik 'Konfirmasi'|
   |                                |<-- 11. Update 'diproses' -----|                         |
   |                                |                               |--- 12. Packing Fisik -> | [Serahkan Barang]
   |                                |                               |--- 13. Input Resi       |         |
   |                                |<-- 14. Update 'dikirim' ------|        (JRM-TG...)      |         |
   |<-- 15. Pantau Status & Resi -- |                               |                         |         |
   |                                |                               |                         |-- 16. Antar Paket
   |<-- 17. Terima Fisik Paket <------------------------------------------------------------------------|
   |                                |                               |                         |
   |--- 18. Konfirmasi Diterima --> |                               |--- 19. Tandai 'Selesai' |
   |                                |<-- 20. Update 'selesai' ------|                         |
   |                                |                               |                         |
   V                                V                               V                         V
[SELESAI]                       [SELESAI]                       [SELESAI]                 [SELESAI]
```

### 2.2 Diagram Status Transaksi (State Transition Lifecycle)
Setiap pesanan di tabel `market_pesanan` mengikuti transisi status ketat dengan aturan bisnis berikut:

```
 +-----------------------------------------------------------------------+
 |                                                                       |
 |   [ PENDING ] (Menunggu Pembayaran)                                   |
 |   - Dibuat saat pembeli menekan tombol 'Buat Pesanan & Bayar'         |
 |   - Stok barang otomatis berkurang dari master produk                 |
 |   - Pembeli melihat petunjuk QRIS atau Rekening Transfer              |
 +-------------------+-----------------------------------+---------------+
                     | (Admin Verifikasi Mutasi Bayar)   | (Batal/Expired/Stok Error)
                     v                                   v
          +--------------------+               +-------------------+
          |    [ DIPROSES ]    |               |  [ DIBATALKAN ]   |
          |  - Bukti sah       |               | - Transaksi gugur |
          |  - Pengemasan QC   |               | - Restock barang  |
          +----------+---------+               +-------------------+
                     | (Admin Input Resi & Dispatch)
                     v
          +--------------------+
          |    [ DIKIRIM ]     |
          |  - Nomor Resi aktif|
          |  - Kurir jalan     |
          +----------+---------+
                     | (Pesanan Diterima di Lokasi)
                     v
          +--------------------+
          |    [ SELESAI ]     |
          | - Transaksi Tuntas |
          | - Arsip Laporan    |
          +--------------------+
```

### 2.3 Mekanisme Atomik Reservasi & Pengembalian Stok
- **Pengurangan Stok Otomatis (Reservation)**:
  Ketika fungsi `createPesanan()` dieksekusi, sistem melakukan query stok terkini. Jika `stok >= jumlah`, sistem membuat baris baru di `market_pesanan` dan sekaligus menurunkan kuantitas stok di tabel `market_produk` sejumlah pesanan. Hal ini mencegah overselling (penjualan melebihi kapasitas stok fisik).
- **Pengembalian Stok (Restocking on Cancellation)**:
  Jika pesanan berstatus `pending` dibatalkan oleh Super Admin (misalnya pembeli tidak melakukan transfer dalam batas waktu toleransi atau membatalkan pesanan), admin memperbarui status menjadi `dibatalkan` dan menambahkan kembali stok produk secara manual melalui panel katalog atau otomasi database.

---

## BAB III: PANDUAN OPERASIONAL UNTUK PEMBELI (BUYER'S GUIDE)

### 3.1 Registrasi & Persiapan Akun Pengguna
1. Buka aplikasi Jarimas melalui browser peramban (Chrome, Edge, Safari, Firefox).
2. Lakukan login akun menggunakan email dan kata sandi yang telah terdaftar.
3. Pastikan profil Anda telah dilengkapi dengan **Nama Lengkap** dan **Nomor Handphone / WhatsApp Aktif** untuk mempermudah kurir menghubungi Anda saat pengantaran.

### 3.2 Menjelajahi Katalog & Filter Kategori Produk
1. Akses menu **Market** melalui navigasi atas desktop atau bilah navigasi bawah (*bottom bar*) pada perangkat ponsel pintar.
2. Anda akan melihat etalase produk terkurasi yang dilengkapi dengan:
   - Foto produk beresolusi tinggi.
   - Badge kategori resmi.
   - Nama produk dan potongan ringkas deskripsi fungsi.
   - Harga resmi (format Rupiah).
   - Label status ketersediaan stok.
3. Gunakan tombol filter kategori di bagian atas untuk menyaring produk berdasarkan kebutuhan Anda:
   - *Semua Produk*
   - *Kesehatan & Gizi*
   - *Alat Posyandu*
   - *Edukasi PAUD*
   - *Merchandise & Seragam*
   - *Buku & Modul*

### 3.3 Membaca Detail Spesifikasi & Indikator Ketersediaan Stok
Klik salah satu kartu produk untuk membuka halaman detail (`/market/[productId]`).
- **Indikator Stok**:
  - **Stok Melimpah**: Ditandai teks stok normal.
  - **Stok Kritis**: Jika stok tersisa antara 1 hingga 5 unit, muncul badge peringatan oranye: `SISA X UNIT`. Segera lakukan checkout sebelum kehabisan.
  - **Stok Habis**: Jika stok bernilai 0, tombol pemesanan akan dinonaktifkan dengan label `Stok Habis`.
- **Spesifikasi Teknis**:
  - Periksa estimasi berat barang (dalam gram).
  - Baca rincian spesifikasi, kelengkapan dalam paket, serta petunjuk penggunaan.

### 3.4 Panduan Langkah-demi-Langkah Formulir Checkout Pesanan
1. Pada halaman detail produk, pilih jumlah kuantitas unit barang yang ingin dipesan (minimal 1 unit, maksimal sesuai stok fisik yang tersedia).
2. Klik tombol **Beli Sekarang**. Anda akan diarahkan ke halaman checkout aman (`/market/checkout`).
3. Lengkapi formulir pengiriman:
   - **Nama Penerima**: Nama kader atau penanggung jawab penerima paket di lokasi.
   - **Nomor Telepon / WA**: Nomor aktif yang dapat dihubungi via panggilan telepon atau WhatsApp.
   - **Kecamatan**: Pilih salah satu dari 4 kecamatan di Kota Tegal (Tegal Timur, Tegal Barat, Tegal Selatan, Margadana).
   - **Kelurahan**: Daftar pilihan kelurahan akan otomatis menyesuaikan secara dinamis sesuai kecamatan yang Anda pilih.
   - **Alamat Lengkap**: Masukkan nama jalan, nomor bangunan, RT/RW, dan patokan lokasi (Contoh: *Jl. Ki Gede Sebayu No. 12, RT 03 RW 02 - Samping Balai Posyandu Mawar*).
   - **Catatan Khusus Pengiriman (Opsional)**: Masukkan instruksi khusus bagi kurir (Contoh: *Titipkan di pos jaga balai RW jika tidak ada orang*).
4. Cek rincian tagihan:
   - Subtotal Produk: `Harga Satuan x Kuantitas`
   - Biaya Pengiriman: **Rp 0 (GRATIS ONGKIR KOTA TEGAL)**
   - Total Pembayaran: Sesuai harga produk murni.

### 3.5 Panduan Pembayaran
Pilih metode pembayaran resmi yang diinginkan:

#### Metode A: QRIS Instan (Rekomendasi Terbaik)
- Mendukung seluruh aplikasi Mobile Banking (BCA Mobile, Livin by Mandiri, BRImo, BNI Mobile, Permata, dll.) dan Dompet Digital (GoPay, OVO, DANA, ShopeePay, LinkAja).
- Cara Pembayaran:
  1. Pilih opsi **QRIS** pada formulir checkout lalu klik **Konfirmasi & Buat Pesanan**.
  2. Buka aplikasi perbankan atau e-wallet pilihan Anda, pilih menu **Scan / Pindai QR**.
  3. Arahkan kamera ke kode QRIS Resmi Jarimas Kota Tegal yang tampil pada layar modal pesanan Anda.
  4. Periksa nama merchant: **JARIMAS KOTA TEGAL**.
  5. Masukkan nominal tepat sesuai total tagihan dan selesaikan otorisasi PIN.

#### Metode B: Transfer Bank Manual
Tersedia 3 rekening bank resmi yang ditunjuk:
1. **Bank BCA**:
   - Nomor Rekening: `138-092-8172`
   - Atas Nama: **Jarimas Peduli Anak**
2. **Bank Mandiri**:
   - Nomor Rekening: `139-00-2918273-1`
   - Atas Nama: **Jarimas Official**
3. **Bank BRI**:
   - Nomor Rekening: `0102-01-092837-50-1`
   - Atas Nama: **Posyandu Jarimas**

*Catatan: Pastikan mentransfer dengan nominal yang persis hingga digit terakhir agar admin dapat melakukan pencocokan data rekening koran secara cepat.*

### 3.6 Memantau Riwayat Transaksi & Rincian Pesanan
1. Buka menu **Pesanan Saya** di alamat URL `/market/pesanan`.
2. Gunakan tab filter status:
   - *Semua*
   - *Menunggu Pembayaran* (`pending`)
   - *Diproses* (`diproses`)
   - *Dikirim* (`dikirim`)
   - *Selesai* (`selesai`)
3. Klik tombol **Rincian** pada kartu pesanan untuk melihat detail lengkap penerima, ringkasan tagihan, petunjuk transfer, maupun status nomor resi pengiriman.
4. Jika pesanan telah dikirim, Anda dapat melihat nomor resi logistik resmi berawalan `JRM-TG...`.

### 3.7 Serah Terima Logistik & Pusat Bantuan
1. Kurir Jarimas akan mengantarkan barang sesuai jadwal operasional.
2. Saat barang tiba, periksa kondisi fisik kemasan dan kelengkapan barang bersama kurir.
3. Jika terdapat kendala fisik barang cacat atau barang tidak sesuai, segera hubungi Pusat Bantuan Admin Jarimas melalui kontak WhatsApp resmi yang tertera pada aplikasi.

---

## BAB IV: PANDUAN OPERASIONAL UNTUK ADMIN MARKET (MERCHANT GUIDE)

### 4.1 Otorisasi & Hak Akses Panel Super Admin
Halaman operasional admin Jarimas Market dilindungi oleh otorisasi berjenjang tingkat tertinggi:
- **Hak Akses Minimum**: Akun pengguna wajib berstatus **Super Admin** (`is_super_admin = true` atau `role_level = 'root_super_admin'` pada tabel `profiles`).
- **URL Operasional**:
  - Manajemen Katalog Produk: `/admin/market`
  - Manajemen Antrean Transaksi: `/admin/pesanan`

### 4.2 Manajemen Master Katalog Produk (`/admin/market`)
Pada panel ini, admin memiliki kontrol penuh terhadap ketersediaan barang:
1. **Menambah Produk Baru**:
   - Klik tombol **+ Tambah Produk Baru**.
   - Isi formulir secara lengkap:
     * *Nama Produk*: Tulis nama jelas (minimal 3 karakter, maksimal 150 karakter).
     * *Deskripsi Lengkap*: Uraikan fungsi, cara penggunaan, dan spesifikasi barang (minimal 5 karakter, maksimal 2000 karakter).
     * *Kategori*: Pilih salah satu dari 5 kategori resmi (*Kesehatan & Gizi*, *Alat Posyandu*, *Edukasi PAUD*, *Merchandise & Seragam*, *Buku & Modul*).
     * *Harga Satuan*: Masukkan angka bulat positif dalam Rupiah (tanpa titik atau koma).
     * *Stok Awal*: Masukkan jumlah unit fisik barang yang siap di gudang (minimal 0).
     * *URL Foto Produk*: Masukkan tautan gambar CDN atau hosting penyimpanan resmi Supabase Storage.
     * *Status Publikasi*: Aktifkan centang *Aktifkan produk di katalog publik*.
   - Klik **Simpan Produk**. Data akan otomatis di-*upsert* ke tabel `market_produk` dan di-revalidasi ke halaman publik.
2. **Mengubah / Memperbarui Produk**:
   - Klik tombol **Edit** pada baris produk yang ingin diubah.
   - Modifikasi harga, deskripsi, atau tambahkan stok baru jika baru saja dilakukan restock gudang.
   - Simpan perubahan.
3. **Mengarsipkan / Menonaktifkan Produk**:
   - Jika suatu produk diskontinu atau tidak lagi didistribusikan, ubah status *Aktif* menjadi nonaktif (`isActive = false`). Produk tidak akan lagi muncul di etalase publik tanpa menghapus riwayat pesanan terdahulu di database.

### 4.3 Monitoring Antrean Pesanan Masuk & Filter Status (`/admin/pesanan`)
Admin memantau antrean pesanan masuk secara berkala dengan navigasi tab:
- **Perlu Konfirmasi (`pending`)**: Daftar transaksi baru yang menunggu konfirmasi pembayaran.
- **Diproses (`diproses`)**: Transaksi yang pembayarannya sah dan sedang disiapkan di gudang logistik.
- **Dikirim (`dikirim`)**: Barang yang telah diserahkan ke kurir dengan nomor resi aktif.
- **Selesai (`selesai`)**: Transaksi yang telah sampai ke tangan kader/pembeli.
- **Dibatalkan (`dibatalkan`)**: Transaksi yang dibatalkan karena tidak ada pembayaran atau permintaan pembeli.

### 4.4 Prosedur Verifikasi Pembayaran (Validasi Mutasi Bank/QRIS)
SOP Verifikasi Pembayaran:
1. Buka tab **Perlu Konfirmasi**.
2. Periksa detail pesanan: ID Pesanan, Nama Pembeli, Metode Pembayaran, dan Total Tagihan.
3. Cocokkan dengan mutasi rekening bank terkait:
   - Jika metode **QRIS**: Cek dashboard mutasi merchant QRIS Jarimas untuk mencocokkan nominal dan timestamp.
   - Jika metode **Transfer BCA/Mandiri/BRI**: Buka internet banking / mutasi bank dan cari mutasi masuk dengan nominal yang persis sama.
4. Jika mutasi ditemukan dan valid:
   - Klik tombol hijau: **Konfirmasi Bayar**.
   - Sistem akan mengeksekusi Server Action `updateStatusPesanan(id, 'diproses')`.
   - Pesanan otomatis berpindah ke tab *Diproses*.

### 4.5 Standar Pengemasan (Packing SOP) & Quality Control (QC)
Sebelum barang dikirim, tim logistik gudang wajib menerapkan SOP:
1. **Pemeriksaan Fisik**: Pastikan barang dalam kondisi baru, tersegel baik, baterai terpasang (jika alat elektronik seperti timbangan bayi/tensimeter), dan tidak ada cacat pabrik.
2. **Pengepakan Aman**:
   - Gunakan bubble wrap berlapis untuk barang pecah belah atau perangkat presisi (alat ukur).
   - Masukkan ke dalam kardus kardus berlogo Jarimas dan segel dengan lakban pengaman.
3. **Pemberian Label Alamat**: Tempelkan label yang memuat Nama Penerima, Nomor HP Aktif, Kelurahan, Kecamatan, dan Nomor Transaksi.

### 4.6 Penerbitan Nomor Resi Logistik & Pengiriman
1. Pada tab **Diproses**, cari pesanan yang telah selesai dikemas.
2. Klik tombol biru: **Input Resi & Kirim**.
3. Sistem secara otomatis men-generate format resi standar:
   `JRM-TG` diikuti oleh 6-digit timestamp unik (Contoh: `JRM-TG819204`). Admin juga dapat menyesuaikan nomor resi jika menggunakan armada ekspedisi khusus.
4. Klik tombol **Kirim Sekarang**.
5. Status pesanan berubah menjadi `dikirim`. Informasi nomor resi langsung tampil pada akun pembeli secara real-time.
6. Serahkan paket ke kurir logistik Jarimas untuk diantar ke balai posyandu/rumah pemesan.

### 4.7 Penanganan Pembatalan Pesanan & Retur Barang
- **Pembatalan Pesanan Belum Bayar**:
  Jika pembeli tidak melakukan transfer dalam batas waktu toleransi 1x24 jam atau membatalkan pesanan, admin mengklik tombol merah: **Batalkan Pesanan**. Status berubah menjadi `dibatalkan` dan admin mengembalikan stok fisik produk ke master katalog.
- **Penanganan Retur (Barang Rusak Saat Pengiriman)**:
  Jika pembeli melaporkan barang rusak saat unboxing:
  1. Minta bukti video unboxing dan foto resi.
  2. Buat jadwal penjemputan barang retur oleh kurir Jarimas.
  3. Kirimkan unit pengganti yang baru dengan mencatatnya pada log audit internal.

### 4.8 Penyelesaian Transaksi & Rekonsiliasi Harian
1. Setelah kurir mengonfirmasi bahwa barang telah diserahterimakan dan ditandatangani oleh penerima:
   - Buka tab **Dikirim**.
   - Klik tombol: **Tandai Selesai Diterima**.
   - Status pesanan berubah menjadi `selesai`.
2. Admin melakukan rekapitulasi harian antara total omset barang terkirim dengan mutasi rekening koran perbankan untuk menjamin transparansi akuntansi 100%.

---

## BAB V: PANDUAN PENGELOLA & PENGEMBANG APLIKASI (DEVELOPER MANUAL)

### 5.1 Arsitektur Teknologi & Dependency Stack
Platform Jarimas Market dibangun di atas fondasi stack web modern dengan performa tinggi:
- **Framework Utama**: Next.js 16 (App Router Architecture).
- **Library UI**: React 19 (Server Components & Client Hooks).
- **Styling**: Tailwind CSS v4 dengan dukungan dark mode dan micro-interactions modern.
- **Database Backend**: Supabase (PostgreSQL 15+).
- **Autentikasi**: Supabase Auth (SSR Client Cookie-based Session).
- **Validasi Skema**: Zod v4 (Type-safe Schema Validation).
- **Ikonografi**: Lucide React.

### 5.2 Skema Database PostgreSQL & Relasi Entitas

#### A. Tabel `market_produk`
Menyimpan master data katalog barang dan inventaris stok:
```sql
CREATE TABLE public.market_produk (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(150) NOT NULL,
    nama_produk VARCHAR(150),
    deskripsi TEXT NOT NULL,
    deskripsi_produk TEXT,
    kategori VARCHAR(50) NOT NULL,
    harga BIGINT NOT NULL CHECK (harga > 0),
    stok INTEGER NOT NULL DEFAULT 0 CHECK (stok >= 0),
    gambar_url TEXT NOT NULL,
    foto_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    berat_gram INTEGER CHECK (berat_gram > 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks Performa
CREATE INDEX idx_market_produk_kategori ON public.market_produk(kategori);
CREATE INDEX idx_market_produk_active ON public.market_produk(is_active);
```

#### B. Tabel `market_pesanan`
Menyimpan seluruh riwayat transaksi pemesanan dan pengiriman:
```sql
CREATE TYPE public.status_pesanan_enum AS ENUM (
    'pending', 
    'diproses', 
    'dikirim', 
    'selesai', 
    'dibatalkan'
);

CREATE TABLE public.market_pesanan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    produk_id UUID NOT NULL REFERENCES public.market_produk(id) ON DELETE RESTRICT,
    jumlah INTEGER NOT NULL CHECK (jumlah > 0),
    total_harga BIGINT NOT NULL CHECK (total_harga > 0),
    status_pembayaran public.status_pesanan_enum NOT NULL DEFAULT 'pending',
    metode_pembayaran VARCHAR(50) NOT NULL DEFAULT 'qris',
    nama_penerima VARCHAR(100) NOT NULL,
    nomor_hp VARCHAR(25) NOT NULL,
    alamat_lengkap TEXT NOT NULL,
    kecamatan VARCHAR(50) NOT NULL,
    kelurahan VARCHAR(50) NOT NULL,
    catatan TEXT,
    nomor_resi VARCHAR(100),
    bukti_bayar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeks Performa
CREATE INDEX idx_pesanan_user ON public.market_pesanan(user_id);
CREATE INDEX idx_pesanan_status ON public.market_pesanan(status_pembayaran);
CREATE INDEX idx_pesanan_created ON public.market_pesanan(created_at DESC);
```

#### C. Row Level Security (RLS) Policy Supabase
```sql
ALTER TABLE public.market_produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_pesanan ENABLE ROW LEVEL SECURITY;

-- Produk: Semua pengguna (termasuk anonim) dapat membaca produk aktif
CREATE POLICY "Public Read Active Products" 
ON public.market_produk FOR SELECT 
USING (is_active = true OR (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- Produk: Hanya Super Admin yang dapat insert, update, delete
CREATE POLICY "Super Admin Manage Products" 
ON public.market_produk FOR ALL 
USING ((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- Pesanan: Pengguna dapat membaca pesanan miliknya sendiri
CREATE POLICY "Users Read Own Orders" 
ON public.market_pesanan FOR SELECT 
USING (auth.uid() = user_id OR (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true);

-- Pesanan: Pengguna terautentikasi dapat membuat pesanan
CREATE POLICY "Users Insert Orders" 
ON public.market_pesanan FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Pesanan: Hanya Super Admin yang dapat mengubah status pesanan & nomor resi
CREATE POLICY "Super Admin Update Orders" 
ON public.market_pesanan FOR UPDATE 
USING ((SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()) = true);
```

### 5.3 Spesifikasi Server Actions & API Contracts

Semua mutasi dan kueri data diisolasi dalam Server Actions di direktori `src/app/actions/`:

#### 1. `getMarketProduk()` — `src/app/actions/market.ts`
- **Deskripsi**: Mengambil seluruh daftar produk aktif dari database dengan pengurutan waktu terbaru.
- **Output**: `Promise<{ success: boolean; data: MarketProduk[]; message?: string }>`

#### 2. `getProdukDetail(productId: string)` — `src/app/actions/market.ts`
- **Deskripsi**: Mengambil rincian produk tunggal berdasarkan UUID.
- **Output**: `Promise<{ success: boolean; data?: MarketProduk | null; message?: string }>`

#### 3. `createPesanan(formData: FormData)` — `src/app/actions/market.ts`
- **Deskripsi**: Validasi data input, otentikasi user, pengecekan stok fisik, pembuatan pesanan berstatus `pending`, pengurangan stok atomik, dan eksekusi `revalidatePath`.
- **Output**: `Promise<{ success: boolean; message: string; pesananId?: string }>`
- **Side Effects**: Memanggil `revalidatePath("/market")`, `revalidatePath("/market/[id]")`, `revalidatePath("/market/pesanan")`, dan `revalidatePath("/admin/pesanan")`.

#### 4. `getPesananUser()` — `src/app/actions/market.ts`
- **Deskripsi**: Mengambil riwayat transaksi pesanan khusus milik pengguna yang sedang login beserta data relasi produk.
- **Output**: `Promise<{ success: boolean; data: MarketPesanan[]; message?: string }>`

#### 5. `upsertProduk(formData: FormData)` — `src/app/actions/admin-market.ts`
- **Deskripsi**: Server Action khusus Super Admin untuk menambah atau memperbarui data produk katalog.
- **Guard**: Memeriksa otentikasi dan mengevaluasi `checkIsSuperAdmin(profile)`.
- **Output**: `Promise<{ success: boolean; message: string; produk?: MarketProduk }>`

#### 6. `getSemuaPesanan()` — `src/app/actions/admin-market.ts`
- **Deskripsi**: Server Action khusus Super Admin untuk menarik seluruh data transaksi pesanan se-Kota Tegal.
- **Output**: `Promise<{ success: boolean; data: MarketPesanan[]; message?: string }>`

#### 7. `updateStatusPesanan(pesananId, statusBaru, nomorResi?)` — `src/app/actions/admin-market.ts`
- **Deskripsi**: Memperbarui status transaksi (`pending` -> `diproses` -> `dikirim` -> `selesai` / `dibatalkan`) dan mencatat nomor resi logistik.
- **Output**: `Promise<{ success: boolean; message: string }>`

### 5.4 Validasi Data Menggunakan Zod Schemas (`src/lib/zod-schemas.ts`)

#### A. Skema Pemesanan: `PesananSchema`
```typescript
export const PesananSchema = z.object({
  produkId: z.string().min(1, "ID Produk wajib diisi"),
  jumlah: z.coerce.number().int().positive("Jumlah pesanan minimal 1 unit"),
  namaPenerima: z.string().trim().min(2, "Nama penerima minimal 2 karakter").max(100),
  nomorHp: z.string().trim().optional().nullable().or(z.literal("")),
  alamatLengkap: z.string().trim().min(5, "Alamat lengkap pengiriman minimal 5 karakter").max(300),
  kecamatan: z.string().trim().min(2, "Kecamatan wajib dipilih"),
  kelurahan: z.string().trim().min(2, "Kelurahan wajib dipilih"),
  catatan: z.string().trim().max(300).optional().nullable(),
  metodePembayaran: z.enum(["qris", "transfer_bca", "transfer_mandiri", "transfer_bri"], {
    message: "Metode pembayaran tidak valid",
  }),
});
```

#### B. Skema Produk: `MarketProdukSchema`
```typescript
export const MarketProdukSchema = z.object({
  id: z.string().optional().nullable(),
  nama: z.string().trim().min(3, "Nama produk minimal 3 karakter").max(150),
  deskripsi: z.string().trim().min(5, "Deskripsi produk minimal 5 karakter").max(2000),
  kategori: z.enum([
    "Kesehatan & Gizi",
    "Alat Posyandu",
    "Edukasi PAUD",
    "Merchandise & Seragam",
    "Buku & Modul",
  ]),
  harga: z.coerce.number().int().positive("Harga produk harus lebih dari 0"),
  stok: z.coerce.number().int().min(0, "Stok tidak boleh bernilai negatif"),
  gambarUrl: z.string().url("URL gambar tidak valid").or(z.literal("")),
  isActive: z.boolean().default(true),
  beratGram: z.coerce.number().int().positive().optional().nullable(),
});
```

### 5.5 Kontrol Akses, Autentikasi & RBAC
- **Verifikasi Super Admin**: Diimplementasikan menggunakan helper `checkIsSuperAdmin()` yang mengecek kolom database `is_super_admin === true`, `role_level === 'root_super_admin'`, atau daftar email root admin yang terkonfigurasi.
- **Client Shielding**: Halaman `/admin/market` dan `/admin/pesanan` melakukan server-side check sebelum melakukan render UI. Jika pengguna tidak berhak, sistem me-redirect ke homepage atau menampilkan notifikasi akses ditolak.

### 5.6 Strategi Cache & Revalidasi Path Next.js
Karena Next.js 16 menggunakan caching agresif untuk data fetching, setiap Server Action mutasi wajib memanggil `revalidatePath` agar UI pengguna dan admin selalu sinkron:
```typescript
revalidatePath("/market");
revalidatePath(`/market/${produkId}`);
revalidatePath("/market/pesanan");
revalidatePath("/admin/pesanan");
revalidatePath("/admin/market");
```

### 5.7 Penanganan Kasus Kritis (Edge Cases) & Error Handling
1. **Overselling Prevention (Race Condition Stok)**:
   Jika dua pembeli memesan produk yang tersisa 1 unit secara bersamaan, pengecekan stok di `createPesanan()` membaca stok realtime dari PostgreSQL. Pembeli kedua akan menerima pesan: *"Stok produk tidak mencukupi. Tersisa 0 unit."*
2. **Koneksi Terputus Saat Submit Form**:
   Tombol submit pada formulir checkout dan formulir admin dibekukan dengan hook `useTransition` (`isPending = true`) untuk mencegah *double submit*.
3. **Resi Pengiriman Hilang atau Salah Ketik**:
   Admin dapat memperbarui nomor resi kapan saja dengan menginputkan resi baru pada pesanan berstatus `diproses` atau `dikirim`.

### 5.8 Matriks Pengujian Fungsional (Test Cases)
| ID Skenario | Langkah Pengujian | Hasil Yang Diharapkan | Status |
| :--- | :--- | :--- | :---: |
| **TC-MKT-01** | Pengguna anonim (belum login) mengakses `/market/checkout` | Diarahkan untuk login terlebih dahulu dengan pesan ramah | **PASS** |
| **TC-MKT-02** | Pengguna memesan produk melebihi stok yang tersedia | Transaksi ditolak dengan pesan: *"Stok produk tidak mencukupi"* | **PASS** |
| **TC-MKT-03** | Pembeli memilih Kecamatan 'Tegal Timur' | Dropdown Kelurahan hanya memuat 5 kelurahan Tegal Timur | **PASS** |
| **TC-MKT-04** | Pembeli memilih metode 'QRIS' | Modal menampilkan QR Code resmi Jarimas Kota Tegal | **PASS** |
| **TC-MKT-05** | Admin mengonfirmasi pesanan 'pending' | Status berubah menjadi 'diproses' dan tercermin di akun pembeli | **PASS** |
| **TC-MKT-06** | Admin menginput resi `JRM-TG123456` | Pesanan berstatus 'dikirim' dengan nomor resi tercatat | **PASS** |
| **TC-MKT-07** | Non-Super Admin mengakses `/admin/market` | Akses ditolak dengan peringatan otorisasi | **PASS** |

### 5.9 Roadmap Pengembangan Arsitektur Masa Depan
1. **Integrasi Payment Gateway Otomatis (Midtrans / Xendit)**:
   - Implementasi Snap Token dan QRIS Dinamis otomatis dengan expire time (15 menit).
   - Penambahan Webhook API Route (`/api/webhooks/payment`) untuk auto-update status `pending` -> `diproses` tanpa perlu verifikasi manual oleh admin.
2. **Gateway Notifikasi WhatsApp (Fonnte / Wablas API)**:
   - Notifikasi otomatis ke nomor WhatsApp pembeli saat pesanan terbit, saat pembayaran diverifikasi, dan saat nomor resi kurir telah diterbitkan.
3. **Sistem Keranjang Belanja Multi-Item (Multi-Item Cart)**:
   - Memungkinkan pembeli memesan beberapa varian sarana posyandu dalam 1 invoice checkout terpadu.
4. **Modul Ekspor Laporan Keuangan (Excel / PDF Reporting)**:
   - Menyediakan fitur download laporan rekonsiliasi pengadaan bulanan untuk Dinas Kesehatan & Dinas Pendidikan Kota Tegal.

---

## BAB VI: STANDAR OPERASIONAL PROSEDUR (SOP) & SERVICE LEVEL AGREEMENT (SLA)

### 6.1 Matriks SLA Pemrosesan Transaksi
| Tahap Operasional | Standar Waktu Maksimum | Penanggung Jawab |
| :--- | :---: | :---: |
| **Verifikasi Pembayaran Masuk** | <= 2 Jam Kerja (08.00 - 17.00 WIB) | Admin Verifikator |
| **Pengemasan Barang (Packing & QC)** | <= 6 Jam setelah Pembayaran Terverifikasi | Tim Logistik Gudang |
| **Penerbitan Nomor Resi Logistik** | <= 1x24 Jam Kerja | Admin Ekspedisi |
| **Pengantaran Sampai Lokasi** | <= 2x24 Jam Kerja (Area Kota Tegal) | Kurir Resmi Jarimas |
| **Penanganan Keluhan / Retur** | Respon awal <= 1 Jam Kerja | Customer Support |

### 6.2 Prosedur Eskalasi Insiden & Kendala Operasional
```
[KENDALA PENGIRIMAN / PEMBAYARAN]
               |
               v
    (Tingkat 1: Customer Service / Admin Market)
    - Verifikasi bukti transfer
    - Koordinasi dengan kurir lapangan
               |
               +---> (Selesai dalam 2 Jam)
               |
    (Tingkat 2: Koordinator Logistik & Pengadaan)
    - Kunjungan langsung ke balai posyandu
    - Penggantian unit fisik barang jika cacat
               |
               +---> (Selesai dalam 24 Jam)
               |
    (Tingkat 3: IT Developer / Database Admin)
    - Investigasi anomali transaksi atau race condition stok
```

---

## BAB VII: KESIMPULAN & SALURAN DUKUNGAN RESMI

### 7.1 Kesimpulan
Jarimas Market merupakan wujud nyata transformasi digital pelayanan publik berbasis komunitas di Kota Tegal. Melalui sinergi proses bisnis yang terstruktur, integrasi teknologi modern Next.js 16 dan Supabase, serta komitmen pelayanan bebas ongkos kirim, platform ini menjamin bahwa seluruh kebutuhan logistik posyandu dan pendidikan usia dini dapat terpenuhi dengan cepat, transparan, dan akuntabel.

### 7.2 Saluran Komunikasi & Pusat Bantuan Resmi
- **Sekretariat Pelaksana Jarimas**: Kompleks Balai Kota Tegal / Dinas Terkait
- **Layanan Pengaduan & CS Market**: WhatsApp Resmi Jarimas (+62 8XX-XXXX-XXXX)
- **Portal Web Resmi**: `https://jarimas.id`
- **Email Dukungan Teknis**: `support@jarimas.id`

---
*Dokumen ini merupakan panduan resmi dan sah yang mengikat operasional Jarimas Market di lingkungan Pemerintah Kota Tegal.*
