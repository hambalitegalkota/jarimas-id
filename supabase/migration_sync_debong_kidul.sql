-- ==============================================================================
-- JARIMAS-ID: MIGRATION SINKRONISASI WILAYAH & POSYANDU KELURAHAN DEBONG KIDUL
-- KECAMATAN TEGAL SELATAN KOTA TEGAL
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Bersihkan komunitas warga_kita di Kelurahan Debong Kidul yang tidak sesuai ketentuan:
-- Ketentuan Kelurahan Debong Kidul Kecamatan Tegal Selatan:
-- Jumlah RW ada 4 bernomor:
-- - RW 1: Jumlah RT 5 (RT 01 s/d RT 05)
-- - RW 2: Jumlah RT 5 (RT 01 s/d RT 05)
-- - RW 3: Jumlah RT 5 (RT 01 s/d RT 05)
-- - RW 4: Jumlah RT 5 (RT 01 s/d RT 05)
-- Alternatif pilihan "Belum Tahu" tetap valid dan dipertahankan.
-- Hapus semua RW selain 1, 2, 3, 4 (dan bukan tingkat kelurahan yang RW-nya null)
-- serta RT yang melebihi kuota (RT > 5) di RW 1, 2, 3, dan 4.

DELETE FROM public.komunitas
WHERE jenis = 'warga_kita'
  AND (lower(kelurahan) LIKE '%debong kidul%' OR lower(nama) LIKE '%debong kidul%')
  AND (
    -- Hapus RW selain 1, 2, 3, 4 (dan bukan tingkat kelurahan yang RW-nya null)
    (rw IS NOT NULL AND rw NOT IN ('01', '02', '03', '04', '1', '2', '3', '4'))
    -- Hapus RT > 5 di RW 1
    OR (rw IN ('01', '1') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '1', '2', '3', '4', '5'))
    -- Hapus RT > 5 di RW 2
    OR (rw IN ('02', '2') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '1', '2', '3', '4', '5'))
    -- Hapus RT > 5 di RW 3
    OR (rw IN ('03', '3') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '1', '2', '3', '4', '5'))
    -- Hapus RT > 5 di RW 4
    OR (rw IN ('04', '4') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '1', '2', '3', '4', '5'))
  );

-- 2. Pastikan kecamatan pada seluruh komunitas di Kelurahan Debong Kidul adalah Tegal Selatan
UPDATE public.komunitas
SET 
  kecamatan = 'Tegal Selatan',
  updated_at = now()
WHERE (lower(kelurahan) LIKE '%debong kidul%' OR lower(nama) LIKE '%debong kidul%');

-- 3. Perbarui 4 Posyandu di Kelurahan Debong Kidul sesuai ketentuan cakupan wilayah masing-masing:
-- Posyandu Seruni 1: cakupan sinkronisasi wilayah RW 1 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Seruni 1',
  nama_komunitas = 'Posyandu Seruni 1',
  kecamatan = 'Tegal Selatan',
  kelurahan = 'Debong Kidul',
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Debong Kidul, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Seruni 1 Debong Kidul cakupan sinkronisasi wilayah RW 01 (RT 01 s/d RT 05): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '69759427-9ff6-42a9-80d4-36a91e42c627'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) LIKE '%debong kidul%' AND (lower(nama) LIKE '%seruni 1%' OR lower(nama) LIKE '%seruni i%'));

-- Posyandu Seruni 2: cakupan sinkronisasi wilayah RW 2 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Seruni 2',
  nama_komunitas = 'Posyandu Seruni 2',
  kecamatan = 'Tegal Selatan',
  kelurahan = 'Debong Kidul',
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Debong Kidul, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Seruni 2 Debong Kidul cakupan sinkronisasi wilayah RW 02 (RT 01 s/d RT 05): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '8ecf2714-9ff6-42a9-8c45-a4119856fbbc'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) LIKE '%debong kidul%' AND (lower(nama) LIKE '%seruni 2%' OR lower(nama) LIKE '%seruni ii%'));

-- Posyandu Seruni 3: cakupan sinkronisasi wilayah RW 3 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Seruni 3',
  nama_komunitas = 'Posyandu Seruni 3',
  kecamatan = 'Tegal Selatan',
  kelurahan = 'Debong Kidul',
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Debong Kidul, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Seruni 3 Debong Kidul cakupan sinkronisasi wilayah RW 03 (RT 01 s/d RT 05): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '9947ded5-9cb9-40c9-8da8-b92d1324eb04'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) LIKE '%debong kidul%' AND (lower(nama) LIKE '%seruni 3%' OR lower(nama) LIKE '%seruni iii%'));

-- Posyandu Seruni 4: cakupan sinkronisasi wilayah RW 4 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Seruni 4',
  nama_komunitas = 'Posyandu Seruni 4',
  kecamatan = 'Tegal Selatan',
  kelurahan = 'Debong Kidul',
  rw = '04',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 04, Debong Kidul, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Seruni 4 Debong Kidul cakupan sinkronisasi wilayah RW 04 (RT 01 s/d RT 05): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '377f5886-9cb9-40c9-8ffd-01655ddacd41'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) LIKE '%debong kidul%' AND (lower(nama) LIKE '%seruni 4%' OR lower(nama) LIKE '%seruni iv%'));

-- 4. Mapping kembali data anak yang tidak sesuai ketentuan:
-- Jika terdapat data anak warga Debong Kidul dengan RW > 4 atau RT > 5, remap ke "Belum Tahu"
-- agar tetap valid dan otomatis dialirkan ke seluruh Posyandu di Kelurahan Debong Kidul.
UPDATE public.data_anak
SET 
  alasan_sekolah = regexp_replace(
    alasan_sekolah,
    '\[(KK_RW|DOM_RW):(0[5-9]|[1-9][0-9])\]',
    '[\1:Belum Tahu]',
    'g'
  ),
  updated_at = now()
WHERE lower(COALESCE(alasan_sekolah, '')) LIKE '%debong kidul%'
  AND alasan_sekolah ~ '\[(KK_RW|DOM_RW):(0[5-9]|[1-9][0-9])\]';

UPDATE public.data_anak
SET 
  alasan_sekolah = regexp_replace(
    alasan_sekolah,
    '\[(KK_RT|DOM_RT):(0[6-9]|[1-9][0-9])\]',
    '[\1:Belum Tahu]',
    'g'
  ),
  updated_at = now()
WHERE lower(COALESCE(alasan_sekolah, '')) LIKE '%debong kidul%'
  AND alasan_sekolah ~ '\[(KK_RT|DOM_RT):(0[6-9]|[1-9][0-9])\]';

-- 5. Verifikasi hasil pembersihan dan sinkronisasi
-- Cek 4 Posyandu di Debong Kidul beserta RW cakupan wilayahnya (RW 01, 02, 03, 04):
SELECT id, nama, jenis, kecamatan, kelurahan, rw, rt
FROM public.komunitas
WHERE jenis = 'posyandu' AND lower(trim(kelurahan)) LIKE '%debong kidul%'
ORDER BY rw, nama;

-- Cek jumlah komunitas per RW di Kelurahan Debong Kidul (harus hanya RW 01 s/d 04):
SELECT rw, count(*) as jumlah_komunitas
FROM public.komunitas
WHERE lower(trim(kelurahan)) LIKE '%debong kidul%'
GROUP BY rw
ORDER BY rw;
