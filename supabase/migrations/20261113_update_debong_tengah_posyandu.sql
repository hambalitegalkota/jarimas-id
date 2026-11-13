-- ==============================================================================
-- Migration: Update Cakupan Wilayah Posyandu & Cleanup Data Anomali
-- Khusus Kelurahan Debong Tengah, Kecamatan Tegal Selatan, Kota Tegal
-- Generated on 2026-11-13
--
-- Ketentuan Resmi:
-- 1. Jumlah RW ada 6:
--    - RW 1: Jumlah RT 5 (RT 01 s/d RT 05)
--    - RW 2: Jumlah RT 6 (RT 01 s/d RT 06)
--    - RW 3: Jumlah RT 5 (RT 01 s/d RT 05)
--    - RW 4: Jumlah RT 7 (RT 01 s/d RT 07)
--    - RW 5: Jumlah RT 6 (RT 01 s/d RT 06)
--    - RW 6: Jumlah RT 6 (RT 01 s/d RT 06)
--    - Total RT: 35 RT
-- 2. Cakupan Posyandu:
--    - Posyandu Anggrek 1: RW 1 (RT 1, 2, 3, 4, 5)
--    - Posyandu Anggrek 2: RW 2 (RT 1, 2, 3, 4)
--    - Posyandu Lengkeng: RW 2 (RT 5, 6)
--    - Posyandu Teratai: RW 3 (RT 1, 2, 3, 4, 5)
--    - Posyandu Anyelir A: RW 4 (RT 1, 2, 3, 5)
--    - Posyandu Anyelir B: RW 4 (RT 4, 6, 7)
--    - Posyandu Bougenvil: RW 5 (RT 1, 2, 3, 4, 5, 6)
--    - Posyandu Tulip: RW 6 (RT 1, 2, 3, 4, 5, 6)
-- 3. Tetap pertahankan pilihan RW "Belum Tahu" dan RT "Belum Tahu"
-- 4. Hapus data yang tidak sesuai ketentuan (anomali data_anak & komunitas warga_kita berlebih)
-- ==============================================================================

-- 1. Posyandu Anggrek 1: RW 1 (RT 1, 2, 3, 4, 5 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Debong Tengah, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Anggrek 1 Debong Tengah cakupan sinkronisasi wilayah RW 01 (RT 01, RT 02, RT 03, RT 04, RT 05 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'e03b01d3-de95-4180-851b-be5148b17b34';

-- 2. Posyandu Anggrek 2: RW 2 (RT 1, 2, 3, 4 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Debong Tengah, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Anggrek 2 Debong Tengah cakupan sinkronisasi wilayah RW 02 (RT 01, RT 02, RT 03, RT 04 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '26de4aa8-7853-41e6-8af1-fc857630ef1b';

-- 3. Posyandu Lengkeng: RW 2 (RT 5, 6 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '02',
  rt = '05',
  lokasi = 'Balai Posyandu / RW 02, Debong Tengah, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Lengkeng Debong Tengah cakupan sinkronisasi wilayah RW 02 (RT 05, RT 06 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '1ecec6ae-c23e-451b-8621-0b51d72d79b2';

-- 4. Posyandu Teratai: RW 3 (RT 1, 2, 3, 4, 5 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Debong Tengah, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Teratai Debong Tengah cakupan sinkronisasi wilayah RW 03 (RT 01, RT 02, RT 03, RT 04, RT 05 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '56f2303c-d42d-430f-825f-447d2446bc00';

-- 5. Posyandu Anyelir A: RW 4 (RT 1, 2, 3, 5 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '04',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 04, Debong Tengah, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Anyelir A Debong Tengah cakupan sinkronisasi wilayah RW 04 (RT 01, RT 02, RT 03, RT 05 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '0184b7bb-7853-41e6-889d-b44d13cbe332';

-- 6. Posyandu Anyelir B: RW 4 (RT 4, 6, 7 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '04',
  rt = '04',
  lokasi = 'Balai Posyandu / RW 04, Debong Tengah, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Anyelir B Debong Tengah cakupan sinkronisasi wilayah RW 04 (RT 04, RT 06, RT 07 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '634d3e0a-7853-41e6-840f-21b599b7ad9d';

-- 7. Posyandu Bougenvil: RW 5 (RT 1, 2, 3, 4, 5, 6 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Bougenvil',
  rw = '05',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 05, Debong Tengah, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Bougenvil Debong Tengah cakupan sinkronisasi wilayah RW 05 (RT 01, RT 02, RT 03, RT 04, RT 05, RT 06 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '80974cfd-c23e-451b-8aaf-9de95d19441d';

-- 8. Posyandu Tulip: RW 6 (RT 1, 2, 3, 4, 5, 6 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '06',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 06, Debong Tengah, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Tulip Debong Tengah cakupan sinkronisasi wilayah RW 06 (RT 01, RT 02, RT 03, RT 04, RT 05, RT 06 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '31989d4f-d42d-430f-86ed-d715b60a1b41';

-- 9. Hapus 5 data_anak anomali di Debong Tengah (RT yang melebihi batas ketentuan masing-masing RW)
DELETE FROM public.data_anak
WHERE id IN (
  'b5dd2b1d-546e-4f86-a548-b520a5799046', -- ACHMAD BASITHUL ILMI ALFARIZI (RW 02 RT 07 -> batas 6 RT)
  '8dd7198c-a475-467b-9702-5a449a6448cb', -- MUHAMMAD KHOTIBUL UMAM (RW 02 RT 07 -> batas 6 RT)
  '60ca06e4-8dbd-4976-806a-7f3a1c28b30c', -- KANAKA RAZKA ABIZAR (RW 01 RT 08 -> batas 5 RT)
  'adc60170-e21a-4313-b9bb-2b6be23e70f2', -- MUHAMMAD ATHARRAZKA ALFARIZQI ARNA (RW 03 RT 06 -> batas 5 RT)
  '634b53b6-dd88-4ec1-ab28-1498be3990b1'  -- Muhamad Daffin Alhusayn (RW 01 RT 07 -> batas 5 RT)
);

-- 10. Hapus komunitas warga_kita berlebih/anomali di Debong Tengah
-- (RW > 6, atau RT melebihi ketentuan masing-masing RW: RW 1 > 5, RW 2 > 6, RW 3 > 5, RW 4 > 7, RW 5 > 6, RW 6 > 6)
DELETE FROM public.komunitas
WHERE jenis = 'warga_kita'
  AND (lokasi ILIKE '%debong tengah%' OR kelurahan ILIKE '%debong tengah%')
  AND (
    (rw ~ '^[0-9]+$' AND rw::int > 6)
    OR (rw ~ '^[0-9]+$' AND rw::int = 1 AND rt ~ '^[0-9]+$' AND rt::int > 5)
    OR (rw ~ '^[0-9]+$' AND rw::int = 2 AND rt ~ '^[0-9]+$' AND rt::int > 6)
    OR (rw ~ '^[0-9]+$' AND rw::int = 3 AND rt ~ '^[0-9]+$' AND rt::int > 5)
    OR (rw ~ '^[0-9]+$' AND rw::int = 4 AND rt ~ '^[0-9]+$' AND rt::int > 7)
    OR (rw ~ '^[0-9]+$' AND rw::int = 5 AND rt ~ '^[0-9]+$' AND rt::int > 6)
    OR (rw ~ '^[0-9]+$' AND rw::int = 6 AND rt ~ '^[0-9]+$' AND rt::int > 6)
  );

