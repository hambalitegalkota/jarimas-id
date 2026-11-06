-- Migration: Update Posyandu Kejambon & Cleanup Invalid Warga Kita & Data Anak
-- Khusus Kelurahan Kejambon, Kecamatan Tegal Timur, Kota Tegal
-- Ketentuan Wilayah:
-- Jumlah RW: 6
-- RW 1: Jumlah RT 6 (RT 01 s/d RT 06)
-- RW 2: Jumlah RT 6 (RT 01 s/d RT 06)
-- RW 3: Jumlah RT 9 (RT 01 s/d RT 09)
-- RW 4: Jumlah RT 7 (RT 01 s/d RT 07)
-- RW 5: Jumlah RT 8 (RT 01 s/d RT 08)
-- RW 6: Jumlah RT 8 (RT 01 s/d RT 08)
-- Tetap pertahankan RW "Belum Tahu" dan RT "Belum Tahu"

-- 1. Update 9 Posyandu resmi Kelurahan Kejambon
-- Posyandu Teratai Merah -> RW 1 (RT 01 s/d RT 06)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Teratai Merah',
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Kejambon, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Teratai Merah Kejambon cakupan sinkronisasi wilayah RW 01 (RT 01 s/d RT 06): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '191a9fc1-7ff8-4ee0-8e3b-0c6939ddccb1';

-- Posyandu Kamboja 1 -> RW 2 (RT 01, RT 02, RT 03)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Kamboja 1',
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02 (RT 01, 02, 03), Kejambon, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kamboja 1 Kejambon cakupan sinkronisasi wilayah RW 02 (RT 01, RT 02, RT 03): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '7a4c81ec-e4b0-40db-86ea-7941edae37c8';

-- Posyandu Kamboja 2 -> RW 2 (RT 04, RT 05, RT 06)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Kamboja 2',
  rw = '02',
  rt = '04',
  lokasi = 'Balai Posyandu / RW 02 (RT 04, 05, 06), Kejambon, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kamboja 2 Kejambon cakupan sinkronisasi wilayah RW 02 (RT 04, RT 05, RT 06): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '54f2eeff-e4b0-40db-893e-c179739a0233';

-- Posyandu Kemuning 1 -> RW 3 (RT 01, RT 02, RT 03, RT 08, RT 09)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Kemuning 1',
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03 (RT 01, 02, 03, 08, 09), Kejambon, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kemuning 1 Kejambon cakupan sinkronisasi wilayah RW 03 (RT 01, RT 02, RT 03, RT 08, RT 09): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '078d4905-329e-4ce9-84e7-7cb51a0ffb4b';

-- Posyandu Kemuning 2 -> RW 3 (RT 04, RT 05, RT 06, RT 07)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Kemuning 2',
  rw = '03',
  rt = '04',
  lokasi = 'Balai Posyandu / RW 03 (RT 04, 05, 06, 07), Kejambon, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kemuning 2 Kejambon cakupan sinkronisasi wilayah RW 03 (RT 04, RT 05, RT 06, RT 07): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'a5c4c2b6-329e-4ce9-8058-ea1d9ffbc5b6';

-- Posyandu Tanjungsari -> RW 4 (RT 01 s/d RT 07)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Tanjungsari',
  rw = '04',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 04, Kejambon, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Tanjungsari Kejambon cakupan sinkronisasi wilayah RW 04 (RT 01 s/d RT 07): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '3b4dae25-052e-42ed-81d8-2cf16fcead26';

-- Posyandu Mawar Melati -> RW 5 (RT 01 s/d RT 08)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Mawar Melati',
  rw = '05',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 05, Kejambon, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mawar Melati Kejambon cakupan sinkronisasi wilayah RW 05 (RT 01 s/d RT 08): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '9aab793a-3033-4016-8bdd-91a1dc327206';

-- Posyandu Seruni -> RW 6 (RT 01, RT 02, RT 03, RT 04, RT 07, RT 08)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Seruni',
  rw = '06',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 06 (RT 01, 02, 03, 04, 07, 08), Kejambon, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Seruni Kejambon cakupan sinkronisasi wilayah RW 06 (RT 01, RT 02, RT 03, RT 04, RT 07, RT 08): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '8e113277-1f58-43a1-8a3f-6435839bc0f9';

-- Posyandu Arimbi -> RW 6 (RT 05, RT 06)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Arimbi',
  rw = '06',
  rt = '05',
  lokasi = 'Balai Posyandu / RW 06 (RT 05, 06), Kejambon, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Arimbi Kejambon cakupan sinkronisasi wilayah RW 06 (RT 05, RT 06): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'd3c7fd8d-d7a2-4fff-8a4c-c7d51801b853';

-- 2. Hapus data anak anomali/tidak sesuai ketentuan di Kelurahan Kejambon
DELETE FROM public.data_anak
WHERE id IN (
  '887be1ad-d76e-4955-b601-2c7c39941d5e', -- ISNA MAULIDINA AROZAQ (RW 12)
  'cd6986b9-3409-40e8-9b7b-20bcdbeb5d79', -- ISNA MAULIDINA AROZAQ (RW 12)
  '88d3be5a-dfbc-49e0-9c91-18d5a77bf652', -- MOHAMAD RANGGA SAPUTRA (RW 2 RT 7 - maks RT 6)
  '33322e3e-49c4-4ad0-8914-bcb32976af54', -- ZIDNA ALBANNA YUIVA PUTRI (RW 08)
  '24e80c4b-ac3f-4460-9a56-632e0b51347b', -- Shakayla Shafiya Almahyra (RW 2 RT 11 - maks RT 6)
  '464b1589-5bf1-461d-b65a-43ceab1a87e7', -- RIZQY NABIL ARFADHIA (RW 12)
  '7099c759-39dc-4dbf-a2f6-cb79e2eb68cb', -- Diaz Nareswara (RW 11)
  '3c4b7660-e02d-47f5-ac91-1e2a3104a5ce', -- JIHAN ANINDITA AL KAYYISAH (RW 08)
  '58035256-8ed5-43dd-8c6c-7617939d5120', -- NIRMALA DEVANKA ABRIZAM (RW 6 RT 09 - maks RT 8)
  'c5802632-b183-4b22-9795-60bc0ad39093', -- YAHYA HAIDAR HANIF (RW 08)
  '05cc308c-5bac-41a3-81bb-6c9eb8f4220c', -- Rania Sapna Dwi Anggraeni (RW 10)
  '36133ac7-9e68-4345-9d7a-dbfe1ba9ce70', -- FARIZKI FIRMANSYAH (RW 08)
  '17487cb6-44b6-4197-a1c6-ae6b92bf4e98', -- Khayra Zea Asheeqa (RW 09)
  '49210679-ce12-4db1-8c6e-2f99a12c52bb', -- Bilal Abyasa Al-Hafizh (RW 11)
  '2f8fd6c1-232f-45db-94f6-fec7fe5185da', -- GHAZIA RIZKY SASHENKA (RW 2 RT 08 - maks RT 6)
  '7f268f0a-ed65-4bdb-8f6d-14f49360e698', -- ZAYN QUTHBIE HARIYONO (RW 09)
  'ee577ef3-02ea-4558-97b0-162b0bc1f7f5', -- MUHAMMAD SYAMIL MUMTAZ (RW 13)
  'e79ff0d6-6e77-4c24-b8d2-1761dfe2d63a'  -- Muhammad haqqi syahbani (RW 1 RT 07 - maks RT 6)
);

-- 3. Hapus anggota_komunitas dan komunitas warga_kita di luar RW 1-6 dan batas RT resmi per RW di Kejambon
DELETE FROM public.anggota_komunitas
WHERE komunitas_id IN (
  SELECT id FROM public.komunitas
  WHERE kelurahan ILIKE '%kejambon%'
    AND jenis = 'warga_kita'
    AND (
      (rw IS NOT NULL AND rw != '' AND rw NOT ILIKE '%belum%' AND rw != '0' AND rw != '00' AND rw != '-' AND (regexp_replace(rw, '\D', '', 'g')::int < 1 OR regexp_replace(rw, '\D', '', 'g')::int > 6))
      OR
      (rw ILIKE '%1%' AND regexp_replace(rw, '\D', '', 'g')::int = 1 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 6)
      OR
      (rw ILIKE '%2%' AND regexp_replace(rw, '\D', '', 'g')::int = 2 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 6)
      OR
      (rw ILIKE '%3%' AND regexp_replace(rw, '\D', '', 'g')::int = 3 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 9)
      OR
      (rw ILIKE '%4%' AND regexp_replace(rw, '\D', '', 'g')::int = 4 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 7)
      OR
      (rw ILIKE '%5%' AND regexp_replace(rw, '\D', '', 'g')::int = 5 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 8)
      OR
      (rw ILIKE '%6%' AND regexp_replace(rw, '\D', '', 'g')::int = 6 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 8)
    )
);

DELETE FROM public.komunitas
WHERE kelurahan ILIKE '%kejambon%'
  AND jenis = 'warga_kita'
  AND (
    (rw IS NOT NULL AND rw != '' AND rw NOT ILIKE '%belum%' AND rw != '0' AND rw != '00' AND rw != '-' AND (regexp_replace(rw, '\D', '', 'g')::int < 1 OR regexp_replace(rw, '\D', '', 'g')::int > 6))
    OR
    (rw ILIKE '%1%' AND regexp_replace(rw, '\D', '', 'g')::int = 1 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 6)
    OR
    (rw ILIKE '%2%' AND regexp_replace(rw, '\D', '', 'g')::int = 2 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 6)
    OR
    (rw ILIKE '%3%' AND regexp_replace(rw, '\D', '', 'g')::int = 3 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 9)
    OR
    (rw ILIKE '%4%' AND regexp_replace(rw, '\D', '', 'g')::int = 4 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 7)
    OR
    (rw ILIKE '%5%' AND regexp_replace(rw, '\D', '', 'g')::int = 5 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 8)
    OR
    (rw ILIKE '%6%' AND regexp_replace(rw, '\D', '', 'g')::int = 6 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 8)
  );
