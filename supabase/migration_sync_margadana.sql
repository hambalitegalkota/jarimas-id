-- ==============================================================================
-- JARIMAS-ID: MIGRATION SINKRONISASI WILAYAH & POSYANDU KELURAHAN MARGADANA
-- KECAMATAN MARGADANA KOTA TEGAL
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Bersihkan komunitas warga_kita di Kelurahan Margadana yang tidak sesuai ketentuan:
-- Ketentuan Kelurahan Margadana Kecamatan Margadana:
-- Jumlah RW ada 13:
-- - RW 1: Jumlah RT 4 (RT 01 s/d RT 04)
-- - RW 2: Jumlah RT 3 (RT 01 s/d RT 03)
-- - RW 3: Jumlah RT 3 (RT 01 s/d RT 03)
-- - RW 4: Jumlah RT 4 (RT 01 s/d RT 04)
-- - RW 5: Jumlah RT 8 (RT 01 s/d RT 08)
-- - RW 6: Jumlah RT 4 (RT 01 s/d RT 04)
-- - RW 7: Jumlah RT 8 (RT 01 s/d RT 08)
-- - RW 8: Jumlah RT 5 (RT 01 s/d RT 05)
-- - RW 9: Jumlah RT 5 (RT 01 s/d RT 05)
-- - RW 10: Jumlah RT 5 (RT 01 s/d RT 05)
-- - RW 11: Jumlah RT 6 (RT 01 s/d RT 06)
-- - RW 12: Jumlah RT 6 (RT 01 s/d RT 06)
-- - RW 13: Jumlah RT 7 (RT 01 s/d RT 07)
-- Total RT: 68 RT

DELETE FROM public.komunitas
WHERE jenis = 'warga_kita'
  AND lower(trim(kelurahan)) = 'margadana'
  AND (
    -- Hapus RW selain 1 s/d 13 (kecuali tingkat kelurahan yang RW-nya null)
    (rw IS NOT NULL AND rw NOT IN ('01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '1', '2', '3', '4', '5', '6', '7', '8', '9'))
    -- Hapus RT > 4 di RW 1
    OR (rw IN ('01', '1') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '1', '2', '3', '4'))
    -- Hapus RT > 3 di RW 2
    OR (rw IN ('02', '2') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '1', '2', '3'))
    -- Hapus RT > 3 di RW 3
    OR (rw IN ('03', '3') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '1', '2', '3'))
    -- Hapus RT > 4 di RW 4
    OR (rw IN ('04', '4') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '1', '2', '3', '4'))
    -- Hapus RT > 8 di RW 5
    OR (rw IN ('05', '5') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '06', '07', '08', '1', '2', '3', '4', '5', '6', '7', '8'))
    -- Hapus RT > 4 di RW 6
    OR (rw IN ('06', '6') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '1', '2', '3', '4'))
    -- Hapus RT > 8 di RW 7
    OR (rw IN ('07', '7') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '06', '07', '08', '1', '2', '3', '4', '5', '6', '7', '8'))
    -- Hapus RT > 5 di RW 8
    OR (rw IN ('08', '8') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '1', '2', '3', '4', '5'))
    -- Hapus RT > 5 di RW 9
    OR (rw IN ('09', '9') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '1', '2', '3', '4', '5'))
    -- Hapus RT > 5 di RW 10
    OR (rw = '10' AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '1', '2', '3', '4', '5'))
    -- Hapus RT > 6 di RW 11
    OR (rw = '11' AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '06', '1', '2', '3', '4', '5', '6'))
    -- Hapus RT > 6 di RW 12
    OR (rw = '12' AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '06', '1', '2', '3', '4', '5', '6'))
    -- Hapus RT > 7 di RW 13
    OR (rw = '13' AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '06', '07', '1', '2', '3', '4', '5', '6', '7'))
  );

-- 2. Pastikan kecamatan pada seluruh komunitas di Kelurahan Margadana adalah Margadana
UPDATE public.komunitas
SET 
  kecamatan = 'Margadana',
  updated_at = now()
WHERE lower(trim(kelurahan)) = 'margadana';

-- 3. Perbarui 14 Posyandu di Kelurahan Margadana sesuai cakupan wilayah masing-masing:

-- Posyandu Bougenville -> cakupan sinkronisasi wilayah RW 1
UPDATE public.komunitas
SET 
  nama = 'Posyandu Bougenville',
  nama_komunitas = 'Posyandu Bougenville',
  kecamatan = 'Margadana',
  kelurahan = 'Margadana',
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Margadana, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Bougenville Margadana cakupan sinkronisasi wilayah RW 01 (RT 01 s/d RT 04): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '27d67053-6b98-45f4-8cf6-fa9d16bdda32'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana' AND lower(nama) LIKE '%bougenville%');

-- Posyandu Dahlia -> cakupan sinkronisasi wilayah RW 2
UPDATE public.komunitas
SET 
  nama = 'Posyandu Dahlia',
  nama_komunitas = 'Posyandu Dahlia',
  kecamatan = 'Margadana',
  kelurahan = 'Margadana',
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Margadana, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Dahlia Margadana cakupan sinkronisasi wilayah RW 02 (RT 01 s/d RT 03): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '15067d30-2514-4384-8dc6-3301267e3ff8'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana' AND lower(nama) LIKE '%dahlia%');

-- Posyandu Jagadipa -> cakupan sinkronisasi wilayah RW 3
UPDATE public.komunitas
SET 
  nama = 'Posyandu Jagadipa',
  nama_komunitas = 'Posyandu Jagadipa',
  kecamatan = 'Margadana',
  kelurahan = 'Margadana',
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Margadana, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Jagadipa Margadana cakupan sinkronisasi wilayah RW 03 (RT 01 s/d RT 03): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = 'efacea43-2514-4384-801a-7b39ac6a0a63'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana' AND lower(nama) LIKE '%jagadipa%');

-- Posyandu Kenanga -> cakupan sinkronisasi wilayah RW 4
UPDATE public.komunitas
SET 
  nama = 'Posyandu Kenanga',
  nama_komunitas = 'Posyandu Kenanga',
  kecamatan = 'Margadana',
  kelurahan = 'Margadana',
  rw = '04',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 04, Margadana, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kenanga Margadana cakupan sinkronisasi wilayah RW 04 (RT 01 s/d RT 04): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '754a89ca-c47f-437e-81e7-ecc52d87adbd'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana' AND lower(nama) LIKE '%kenanga%');

-- Posyandu Cempaka 1 -> cakupan sinkronisasi wilayah RW 5
UPDATE public.komunitas
SET 
  nama = 'Posyandu Cempaka 1',
  nama_komunitas = 'Posyandu Cempaka 1',
  kecamatan = 'Margadana',
  kelurahan = 'Margadana',
  rw = '05',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 05, Margadana, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Cempaka 1 Margadana cakupan sinkronisasi wilayah RW 05 (RT 01 s/d RT 08): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '85b90e85-83c5-4691-8362-e44de02b34d0'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana' AND lower(nama) LIKE '%cempaka 1%');

-- Posyandu Cempaka 2 -> cakupan sinkronisasi wilayah RW 5
UPDATE public.komunitas
SET 
  nama = 'Posyandu Cempaka 2',
  nama_komunitas = 'Posyandu Cempaka 2',
  kecamatan = 'Margadana',
  kelurahan = 'Margadana',
  rw = '05',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 05, Margadana, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Cempaka 2 Margadana cakupan sinkronisasi wilayah RW 05 (RT 01 s/d RT 08): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '4d300340-6b98-45f4-8185-8d357922e61b'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana' AND lower(nama) LIKE '%cempaka 2%');

-- Posyandu Anyelir -> cakupan sinkronisasi wilayah RW 6
UPDATE public.komunitas
SET 
  nama = 'Posyandu Anyelir',
  nama_komunitas = 'Posyandu Anyelir',
  kecamatan = 'Margadana',
  kelurahan = 'Margadana',
  rw = '06',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 06, Margadana, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Anyelir Margadana cakupan sinkronisasi wilayah RW 06 (RT 01 s/d RT 04): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '3327785a-f4dd-420e-840a-a8f5a1a51f19'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana' AND lower(nama) LIKE '%anyelir%');

-- Posyandu Sambisari -> cakupan sinkronisasi wilayah RW 7
UPDATE public.komunitas
SET 
  nama = 'Posyandu Sambisari',
  nama_komunitas = 'Posyandu Sambisari',
  kecamatan = 'Margadana',
  kelurahan = 'Margadana',
  rw = '07',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 07, Margadana, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Sambisari Margadana cakupan sinkronisasi wilayah RW 07 (RT 01 s/d RT 08): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = 'ca8fcaf5-b790-4be1-8a59-7dd9ad19c6c1'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana' AND (lower(nama) LIKE '%sambisari%' OR lower(nama) LIKE '%kesambi sari%'));

-- Posyandu Suplir -> cakupan sinkronisasi wilayah RW 8
UPDATE public.komunitas
SET 
  nama = 'Posyandu Suplir',
  nama_komunitas = 'Posyandu Suplir',
  kecamatan = 'Margadana',
  kelurahan = 'Margadana',
  rw = '08',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 08, Margadana, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Suplir Margadana cakupan sinkronisasi wilayah RW 08 (RT 01 s/d RT 05): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '0ed7a033-6287-4764-8d76-c651610374dc'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana' AND (lower(nama) LIKE '%suplir%' OR lower(nama) LIKE '%suflir%'));

-- Posyandu Wijaya Kusuma -> cakupan sinkronisasi wilayah RW 9
UPDATE public.komunitas
SET 
  nama = 'Posyandu Wijaya Kusuma',
  nama_komunitas = 'Posyandu Wijaya Kusuma',
  kecamatan = 'Margadana',
  kelurahan = 'Margadana',
  rw = '09',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 09, Margadana, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Wijaya Kusuma Margadana cakupan sinkronisasi wilayah RW 09 (RT 01 s/d RT 05): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '561272b8-3e1a-44f6-832d-ed1d0e6b65d4'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana' AND lower(nama) LIKE '%wijaya kusuma%');

-- Posyandu Sedap Malam -> cakupan sinkronisasi wilayah RW 10
UPDATE public.komunitas
SET 
  nama = 'Posyandu Sedap Malam',
  nama_komunitas = 'Posyandu Sedap Malam',
  kecamatan = 'Margadana',
  kelurahan = 'Margadana',
  rw = '10',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 10, Margadana, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Sedap Malam Margadana cakupan sinkronisasi wilayah RW 10 (RT 01 s/d RT 05): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = 'd138d905-ad66-4e85-8bad-91bd5698aeb8'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana' AND lower(nama) LIKE '%sedap malam%');

-- Posyandu Anggrek Bulan -> cakupan sinkronisasi wilayah RW 11
UPDATE public.komunitas
SET 
  nama = 'Posyandu Anggrek Bulan',
  nama_komunitas = 'Posyandu Anggrek Bulan',
  kecamatan = 'Margadana',
  kelurahan = 'Margadana',
  rw = '11',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 11, Margadana, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Anggrek Bulan Margadana cakupan sinkronisasi wilayah RW 11 (RT 01 s/d RT 06): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = 'a76483a7-8690-4859-8a4a-36fd65ba61ee'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana' AND lower(nama) LIKE '%anggrek bulan%');

-- Posyandu Lavender -> cakupan sinkronisasi wilayah RW 12
UPDATE public.komunitas
SET 
  nama = 'Posyandu Lavender',
  nama_komunitas = 'Posyandu Lavender',
  kecamatan = 'Margadana',
  kelurahan = 'Margadana',
  rw = '12',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 12, Margadana, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Lavender Margadana cakupan sinkronisasi wilayah RW 12 (RT 01 s/d RT 06): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '8ab9619a-a89b-4c46-8598-1501d3c2c98a'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana' AND lower(nama) LIKE '%lavender%');

-- Posyandu Edelweis -> cakupan sinkronisasi wilayah RW 13
UPDATE public.komunitas
SET 
  nama = 'Posyandu Edelweis',
  nama_komunitas = 'Posyandu Edelweis',
  kecamatan = 'Margadana',
  kelurahan = 'Margadana',
  rw = '13',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 13, Margadana, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Edelweis Margadana cakupan sinkronisasi wilayah RW 13 (RT 01 s/d RT 07): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '51757092-2514-4384-84a9-0dd13255d4ce'
   OR (jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana' AND (lower(nama) LIKE '%edelweis%' OR lower(nama) LIKE '%edelweiss%'));

-- 4. Mapping kembali data anak yang tidak sesuai batas RT resmi:
-- Anak ID '7e98cc74-113d-4693-a000-1ba597e477c2' (NAZALIA ASRI ZANJABILA) di RW 12 yang tercatat RT 07 (melebihi batas max RT 6)
-- diremapping ke RT 'Belum Tahu' agar tetap valid dan tersinkronisasi ke Posyandu Lavender (RW 12).
UPDATE public.data_anak
SET 
  alasan_sekolah = replace(replace(alasan_sekolah, '[KK_RT:07]', '[KK_RT:Belum Tahu]'), '[DOM_RT:07]', '[DOM_RT:Belum Tahu]'),
  updated_at = now()
WHERE id = '7e98cc74-113d-4693-a000-1ba597e477c2';

-- 5. Verifikasi hasil pembersihan dan sinkronisasi
-- Cek 14 Posyandu di Margadana beserta RW cakupan wilayahnya:
SELECT id, nama, jenis, kecamatan, kelurahan, rw, rt
FROM public.komunitas
WHERE jenis = 'posyandu' AND lower(trim(kelurahan)) = 'margadana'
ORDER BY rw, nama;

-- Cek jumlah komunitas per RW di Kelurahan Margadana (harus hanya RW 01 s/d 13):
SELECT rw, count(*) as jumlah_komunitas
FROM public.komunitas
WHERE lower(trim(kelurahan)) = 'margadana'
GROUP BY rw
ORDER BY rw;

