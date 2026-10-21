-- ==============================================================================
-- Migration: Koreksi Wilayah Administrasi & Penyelarasan Nama Satuan PAUD
-- 1. Koreksi Kecamatan Kelurahan Kalinyamat Kulon dari 'Tegal Selatan' ke 'Margadana'
-- 2. Diferensiasi Nama Satuan PAUD dengan Kelurahan (Pos PAUD Melati, TK Pertiwi, dll.)
-- 3. Sinkronisasi data_anak dengan ID & Nama PAUD Terverifikasi
-- ==============================================================================

-- 1. Koreksi Wilayah Komunitas Kalinyamat Kulon (PAUD, Posyandu, dan Warga)
UPDATE public.komunitas
SET 
  kecamatan = 'Margadana',
  lokasi = REPLACE(lokasi, 'Tegal Selatan', 'Margadana'),
  nama = REPLACE(nama, 'Kecamatan: Tegal Selatan', 'Kecamatan: Margadana'),
  nama_komunitas = REPLACE(nama_komunitas, 'Kecamatan: Tegal Selatan', 'Kecamatan: Margadana'),
  updated_at = NOW()
WHERE LOWER(TRIM(kelurahan)) = 'kalinyamat kulon'
  AND (kecamatan = 'Tegal Selatan' OR lokasi ILIKE '%Tegal Selatan%' OR nama ILIKE '%Tegal Selatan%');

-- 2. Pastikan Komunitas PAUD Pesurungan Kidul Terdaftar di Tegal Barat
UPDATE public.komunitas
SET 
  kecamatan = 'Tegal Barat',
  lokasi = REPLACE(lokasi, 'Margadana', 'Tegal Barat'),
  updated_at = NOW()
WHERE LOWER(TRIM(kelurahan)) = 'pesurungan kidul'
  AND kecamatan <> 'Tegal Barat';

-- 3. Penyelarasan Nama Satuan PAUD di Pesurungan Kidul
-- Pos PAUD Melati Pesurungan Kidul
UPDATE public.komunitas
SET 
  nama = 'Pos PAUD Melati Pesurungan Kidul',
  nama_komunitas = 'Pos PAUD Melati Pesurungan Kidul',
  kecamatan = 'Tegal Barat',
  kelurahan = 'Pesurungan Kidul',
  updated_at = NOW()
WHERE id = '13f83ced-6560-4513-8acc-d2510726c7e6';

-- TK Pertiwi 25.8 Pesurungan Kidul
UPDATE public.komunitas
SET 
  nama = 'TK Pertiwi 25.8 Pesurungan Kidul',
  nama_komunitas = 'TK Pertiwi 25.8 Pesurungan Kidul',
  kecamatan = 'Tegal Barat',
  kelurahan = 'Pesurungan Kidul',
  updated_at = NOW()
WHERE id = '47717e83-07f5-4f58-8499-5971e08e5e4c';

-- 4. Penyelarasan Nama Satuan PAUD di Kalinyamat Kulon
-- Pos PAUD Melati Kalinyamat Kulon
UPDATE public.komunitas
SET 
  nama = 'Pos PAUD Melati Kalinyamat Kulon',
  nama_komunitas = 'Pos PAUD Melati Kalinyamat Kulon',
  kecamatan = 'Margadana',
  kelurahan = 'Kalinyamat Kulon',
  updated_at = NOW()
WHERE id = '0ff55749-ba50-421e-8636-5cc96ea8ada1';

-- TK Pertiwi 25.12 Kalinyamat Kulon
UPDATE public.komunitas
SET 
  nama = 'TK Pertiwi 25.12 Kalinyamat Kulon',
  nama_komunitas = 'TK Pertiwi 25.12 Kalinyamat Kulon',
  kecamatan = 'Margadana',
  kelurahan = 'Kalinyamat Kulon',
  updated_at = NOW()
WHERE id = 'ddab5d7c-47c7-431f-8459-9a6dffc4d6a4';

-- PAUD TPQ Al-Hikmah Kalinyamat Kulon
UPDATE public.komunitas
SET 
  kecamatan = 'Margadana',
  kelurahan = 'Kalinyamat Kulon',
  updated_at = NOW()
WHERE id = 'dc1c8234-45ee-4d7d-8233-293958f6d467';

-- 5. Sinkronisasi Data Anak untuk Pos PAUD Melati berdasarkan Domisili/Kelurahan
-- Pesurungan Kidul (Tegal Barat)
UPDATE public.data_anak
SET 
  nama_sekolah = 'Pos PAUD Melati Pesurungan Kidul',
  komunitas_id = '13f83ced-6560-4513-8acc-d2510726c7e6',
  updated_at = NOW()
WHERE is_sekolah = TRUE
  AND (
    nama_sekolah ILIKE '%Melati%Pesurungan%'
    OR (
      (LOWER(TRIM(nama_sekolah)) = 'pos paud melati' OR LOWER(TRIM(nama_sekolah)) = 'paud melati')
      AND (
        LOWER(TRIM(kelurahan)) = 'pesurungan kidul'
        OR LOWER(TRIM(kecamatan)) = 'tegal barat'
        OR alamat ILIKE '%pesurungan kidul%'
      )
    )
  );

-- Kalinyamat Kulon (Margadana)
UPDATE public.data_anak
SET 
  nama_sekolah = 'Pos PAUD Melati Kalinyamat Kulon',
  komunitas_id = '0ff55749-ba50-421e-8636-5cc96ea8ada1',
  updated_at = NOW()
WHERE is_sekolah = TRUE
  AND (
    nama_sekolah ILIKE '%Melati%Kalinyamat%'
    OR (
      (LOWER(TRIM(nama_sekolah)) = 'pos paud melati' OR LOWER(TRIM(nama_sekolah)) = 'paud melati')
      AND (
        LOWER(TRIM(kelurahan)) = 'kalinyamat kulon'
        OR LOWER(TRIM(kecamatan)) = 'margadana'
        OR alamat ILIKE '%kalinyamat kulon%'
      )
    )
  );

-- 6. Sinkronisasi Data Anak untuk TK Pertiwi berdasarkan Domisili/Kelurahan
-- TK Pertiwi 25.8 Pesurungan Kidul
UPDATE public.data_anak
SET 
  nama_sekolah = 'TK Pertiwi 25.8 Pesurungan Kidul',
  komunitas_id = '47717e83-07f5-4f58-8499-5971e08e5e4c',
  updated_at = NOW()
WHERE is_sekolah = TRUE
  AND (
    nama_sekolah ILIKE '%Pertiwi%25.8%'
    OR nama_sekolah ILIKE '%Pertiwi%Pesurungan%'
    OR (
      LOWER(TRIM(nama_sekolah)) = 'tk pertiwi'
      AND (
        LOWER(TRIM(kelurahan)) = 'pesurungan kidul'
        OR alamat ILIKE '%pesurungan kidul%'
      )
    )
  );

-- TK Pertiwi 25.12 Kalinyamat Kulon
UPDATE public.data_anak
SET 
  nama_sekolah = 'TK Pertiwi 25.12 Kalinyamat Kulon',
  komunitas_id = 'ddab5d7c-47c7-431f-8459-9a6dffc4d6a4',
  updated_at = NOW()
WHERE is_sekolah = TRUE
  AND (
    nama_sekolah ILIKE '%Pertiwi%25.12%'
    OR nama_sekolah ILIKE '%Pertiwi%Kalinyamat%'
    OR (
      LOWER(TRIM(nama_sekolah)) = 'tk pertiwi'
      AND (
        LOWER(TRIM(kelurahan)) = 'kalinyamat kulon'
        OR alamat ILIKE '%kalinyamat kulon%'
      )
    )
  );

-- 7. Verifikasi Perubahan
SELECT k.id, k.nama, k.jenis, k.kecamatan, k.kelurahan, COUNT(d.id) AS jumlah_anak
FROM public.komunitas k
LEFT JOIN public.data_anak d ON d.komunitas_id = k.id
WHERE k.kelurahan IN ('Pesurungan Kidul', 'Kalinyamat Kulon')
GROUP BY k.id, k.nama, k.jenis, k.kecamatan, k.kelurahan
ORDER BY k.kelurahan, k.jenis, k.nama;
