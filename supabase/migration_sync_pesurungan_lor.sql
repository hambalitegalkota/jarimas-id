-- ==============================================================================
-- JARIMAS-ID: MIGRATION SINKRONISASI WILAYAH & POSYANDU KELURAHAN PESURUNGAN LOR
-- KECAMATAN MARGADANA KOTA TEGAL
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Bersihkan komunitas warga_kita di Kelurahan Pesurungan Lor yang tidak sesuai ketentuan:
-- Ketentuan Pesurungan Lor Kecamatan Margadana:
-- Jumlah RW ada 4:
-- - RW 1: Jumlah RT 7 (RT 01 s/d RT 07)
-- - RW 2: Jumlah RT 7 (RT 01 s/d RT 07)
-- - RW 3: Jumlah RT 7 (RT 01 s/d RT 07)
-- - RW 4: Jumlah RT 7 (RT 01 s/d RT 07)
-- Hapus semua RW > 4 serta RT yang melebihi kuota (RT > 7) di RW 1, 2, 3, dan 4.

DELETE FROM public.komunitas
WHERE jenis = 'warga_kita'
  AND (lower(kelurahan) LIKE '%pesurungan lor%' OR lower(nama) LIKE '%pesurungan lor%')
  AND (
    -- Hapus RW selain 1, 2, 3, 4 (dan bukan tingkat kelurahan yang RW-nya null)
    (rw IS NOT NULL AND rw NOT IN ('01', '02', '03', '04', '1', '2', '3', '4'))
    -- Hapus RT > 7 di RW 1
    OR (rw IN ('01', '1') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '06', '07', '1', '2', '3', '4', '5', '6', '7'))
    -- Hapus RT > 7 di RW 2
    OR (rw IN ('02', '2') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '06', '07', '1', '2', '3', '4', '5', '6', '7'))
    -- Hapus RT > 7 di RW 3
    OR (rw IN ('03', '3') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '06', '07', '1', '2', '3', '4', '5', '6', '7'))
    -- Hapus RT > 7 di RW 4
    OR (rw IN ('04', '4') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '06', '07', '1', '2', '3', '4', '5', '6', '7'))
  );

-- 2. Pastikan kecamatan pada seluruh komunitas di Pesurungan Lor adalah Margadana
UPDATE public.komunitas
SET 
  kecamatan = 'Margadana',
  updated_at = now()
WHERE (lower(kelurahan) LIKE '%pesurungan lor%' OR lower(nama) LIKE '%pesurungan lor%');

-- 3. Perbarui 4 Posyandu di Kelurahan Pesurungan Lor (Kecamatan Margadana) sesuai mapping cakupan wilayah terbaru:
-- Posyandu Melati: cakupan sinkronisasi wilayah RW 1 (RT 01 s/d RT 07)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Melati',
  nama_komunitas = 'Posyandu Melati',
  kecamatan = 'Margadana',
  kelurahan = 'Pesurungan Lor',
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Pesurungan Lor, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Melati Pesurungan Lor cakupan sinkronisasi wilayah RW 01 (RT 01 s/d RT 07): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '73e00646-c298-4b09-8f7b-3031210ba3e6'
   OR (jenis = 'posyandu' AND lower(nama) LIKE '%melati%pesurungan lor%');

-- Posyandu Mawar: cakupan sinkronisasi wilayah RW 2 (RT 01 s/d RT 07)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Mawar',
  nama_komunitas = 'Posyandu Mawar',
  kecamatan = 'Margadana',
  kelurahan = 'Pesurungan Lor',
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Pesurungan Lor, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mawar Pesurungan Lor cakupan sinkronisasi wilayah RW 02 (RT 01 s/d RT 07): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '1c6dacb2-78ea-4310-8716-dc991371d759'
   OR (jenis = 'posyandu' AND lower(nama) LIKE '%mawar%pesurungan lor%');

-- Posyandu Anggrek: cakupan sinkronisasi wilayah RW 3 (RT 01 s/d RT 07)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Anggrek',
  nama_komunitas = 'Posyandu Anggrek',
  kecamatan = 'Margadana',
  kelurahan = 'Pesurungan Lor',
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Pesurungan Lor, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Anggrek Pesurungan Lor cakupan sinkronisasi wilayah RW 03 (RT 01 s/d RT 07): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '7e363301-78ea-4310-84c2-94618d860cee'
   OR (jenis = 'posyandu' AND lower(nama) LIKE '%anggrek%pesurungan lor%');

-- Posyandu Jaya Samudra: cakupan sinkronisasi wilayah RW 4 (RT 01 s/d RT 07)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Jaya Samudra',
  nama_komunitas = 'Posyandu Jaya Samudra',
  kecamatan = 'Margadana',
  kelurahan = 'Pesurungan Lor',
  rw = '04',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 04, Pesurungan Lor, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Jaya Samudra Pesurungan Lor cakupan sinkronisasi wilayah RW 04 (RT 01 s/d RT 07): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '486ab1b3-1a93-4994-8a68-764910c5bca7'
   OR (jenis = 'posyandu' AND (lower(nama) LIKE '%jaya samudra%pesurungan lor%' OR lower(nama) LIKE '%jaya samudera%pesurungan lor%'));

-- 4. Verifikasi hasil pembersihan dan sinkronisasi
SELECT jenis, kecamatan, kelurahan, rw, rt, count(*) as jumlah
FROM public.komunitas
WHERE lower(kelurahan) LIKE '%pesurungan lor%' OR lower(nama) LIKE '%pesurungan lor%'
GROUP BY jenis, kecamatan, kelurahan, rw, rt
ORDER BY jenis, rw, rt;
