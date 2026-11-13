-- ==============================================================================
-- Migration: Update Cakupan Wilayah Posyandu & Cleanup Data Anomali
-- Khusus Kelurahan Krandon, Kecamatan Margadana, Kota Tegal
-- Generated on 2026-11-13
--
-- Ketentuan Resmi:
-- 1. Jumlah RW ada 4:
--    - RW 1: Jumlah RT 5 (RT 01 s/d RT 05)
--    - RW 2: Jumlah RT 7 (RT 01 s/d RT 07)
--    - RW 3: Jumlah RT 5 (RT 01 s/d RT 05)
--    - RW 4: Jumlah RT 7 (RT 01 s/d RT 07)
--    - Total RT: 24 RT
-- 2. Cakupan Posyandu:
--    - Posyandu Berlian: RW 1 (RT 01 s/d RT 05) & RW 8
--    - Posyandu Intan: RW 2 (RT 01 s/d RT 07)
--    - Posyandu Mutiara: RW 3 (RT 01 s/d RT 05)
--    - Posyandu Permata: RW 4 (RT 01 s/d RT 07)
-- 3. Tetap pertahankan pilihan RW "Belum Tahu" dan RT "Belum Tahu"
-- 4. Hapus data yang tidak sesuai ketentuan (anomali data_anak & komunitas warga_kita berlebih)
-- ==============================================================================

-- 1. Posyandu Berlian: RW 1 (RT 01 s/d RT 05), RW 8 dan RW - RT Tidak Tahu
UPDATE public.komunitas
SET 
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Krandon, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Berlian Krandon cakupan sinkronisasi wilayah RW 01 (RT 01, RT 02, RT 03, RT 04, RT 05), RW 08 dan RW - RT Tidak Tahu: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '1eb438e4-059f-4c39-8218-79a51f09901f';

-- 2. Posyandu Intan: RW 2 (RT 01 s/d RT 07 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Krandon, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Intan Krandon cakupan sinkronisasi wilayah RW 02 (RT 01, RT 02, RT 03, RT 04, RT 05, RT 06, RT 07 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '1d1ed8dd-17b4-4cc7-8710-4c61752f5c2a';

-- 3. Posyandu Mutiara: RW 3 (RT 01 s/d RT 05 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Krandon, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mutiara Krandon cakupan sinkronisasi wilayah RW 03 (RT 01, RT 02, RT 03, RT 04, RT 05 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'c3066451-dac3-47fc-82bf-41258f2cfb7f';

-- 4. Posyandu Permata: RW 4 (RT 01 s/d RT 07 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '04',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 04, Krandon, Margadana, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Permata Krandon cakupan sinkronisasi wilayah RW 04 (RT 01, RT 02, RT 03, RT 04, RT 05, RT 06, RT 07 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '613dde02-dac3-47fc-806a-f8ed1518c5ea';

-- 5. Hapus 2 data_anak anomali di Krandon (RW 03 RT 06 yang melebihi batas 5 RT)
DELETE FROM public.data_anak
WHERE id IN (
  '008e3a4e-3497-48b9-ad65-c5e0d380d916', -- Kayla Amaira (RW 03 RT 06)
  'd438e2bc-11b4-403c-8fd0-dc901bd73089'  -- ADARA SOFFY NAIFA (RW 03 RT 06)
);

-- 6. Hapus komunitas warga_kita berlebih/anomali di Krandon
-- (RW > 4, atau RT melebihi ketentuan masing-masing RW: RW 1 > 5, RW 2 > 7, RW 3 > 5, RW 4 > 7)
DELETE FROM public.komunitas
WHERE jenis = 'warga_kita'
  AND (lokasi ILIKE '%krandon%' OR kelurahan ILIKE '%krandon%')
  AND (
    (rw ~ '^[0-9]+$' AND rw::int > 4)
    OR (rw ~ '^[0-9]+$' AND rw::int = 1 AND rt ~ '^[0-9]+$' AND rt::int > 5)
    OR (rw ~ '^[0-9]+$' AND rw::int = 2 AND rt ~ '^[0-9]+$' AND rt::int > 7)
    OR (rw ~ '^[0-9]+$' AND rw::int = 3 AND rt ~ '^[0-9]+$' AND rt::int > 5)
    OR (rw ~ '^[0-9]+$' AND rw::int = 4 AND rt ~ '^[0-9]+$' AND rt::int > 7)
  );

