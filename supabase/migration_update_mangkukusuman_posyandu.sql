-- Migration: Update Posyandu Mangkukusuman & Cleanup Invalid Warga Kita & Data Anak
-- Khusus Kelurahan Mangkukusuman, Kecamatan Tegal Timur, Kota Tegal
-- Ketentuan Wilayah:
-- Jumlah RW: 4
-- RW 1: Jumlah RT 10 (RT 01 s/d RT 10)
-- RW 2: Jumlah RT 10 (RT 01 s/d RT 10)
-- RW 3: Jumlah RT 11 (RT 01 s/d RT 11)
-- RW 4: Jumlah RT 14 (RT 01 s/d RT 14)
-- Tetap pertahankan RW "Belum Tahu" dan RT "Belum Tahu"

-- 1. Update 4 Posyandu resmi Kelurahan Mangkukusuman
-- Posyandu Kenanga -> RW 01 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Kenanga',
  nama_komunitas = 'Posyandu Kenanga',
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01 (RT 01 s/d RT 05), Mangkukusuman, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kenanga Mangkukusuman cakupan sinkronisasi wilayah RW 01 (RT 01, RT 02, RT 03, RT 04, RT 05 dan RW - RT Tidak Tahu): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.'
WHERE id = 'a0d414e2-df5d-448c-88df-e60568a22dc1';

-- Posyandu Cempaka -> RW 01 (RT 06 s/d RT 10)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Cempaka',
  nama_komunitas = 'Posyandu Cempaka',
  rw = '01',
  rt = '06',
  lokasi = 'Balai Posyandu / RW 01 (RT 06 s/d RT 10), Mangkukusuman, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Cempaka Mangkukusuman cakupan sinkronisasi wilayah RW 01 (RT 06, RT 07, RT 08, RT 09, RT 10 dan RW - RT Tidak Tahu): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.'
WHERE id = 'c933d5bb-5789-47de-8375-c15d0136b676';

-- Posyandu Melati -> RW 02 (RT 01 s/d RT 10)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Melati',
  nama_komunitas = 'Posyandu Melati',
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Mangkukusuman, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Melati Mangkukusuman cakupan sinkronisasi wilayah RW 02 (RT 01 s/d RT 10 dan RW - RT Tidak Tahu): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.'
WHERE id = 'eba39233-1cd5-47f4-8c44-30b15ba67820';

-- Posyandu Fatmawati -> RW 03 (RT 01 s/d RT 11)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Fatmawati',
  nama_komunitas = 'Posyandu Fatmawati',
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Mangkukusuman, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Fatmawati Mangkukusuman cakupan sinkronisasi wilayah RW 03 (RT 01 s/d RT 11 dan RW - RT Tidak Tahu): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.'
WHERE id = '6f3d79cf-9ab4-436b-8cfe-59751a6b3a6d';

-- 2. Hapus Posyandu Kartini (tidak termasuk dalam daftar 4 posyandu resmi Mangkukusuman)
DELETE FROM public.anggota_komunitas WHERE komunitas_id = '82d27a19-8c67-48ee-85ff-460da197e010';
DELETE FROM public.komunitas WHERE id = '82d27a19-8c67-48ee-85ff-460da197e010';

-- 3. Hapus data anak anomali/tidak sesuai ketentuan di Kelurahan Mangkukusuman
DELETE FROM public.data_anak
WHERE id IN (
  'e4734063-d059-42e1-a6eb-96c97acdd7bf', -- EIJAZ ELZIO ATHARRAZKA (RW 13)
  'f6270193-f61f-4700-af03-4eda441e3afa', -- Nazaleya Shereen Al Mujahida (RW 06)
  'a9e9027f-cdee-4f17-8cb5-e03e9c246a49', -- MUHAMMAD ZAHAAN MAS UD (RW 07)
  '994f5707-5933-42a6-a4c8-12cd078fd31b', -- Felicia Nazwa Oktavia (RW 11)
  '0b40796b-f0fc-43b6-821d-c7583d21da39'  -- RIZQYA MEGA RATU ASPILLA (RW 13)
);

-- 4. Hapus anggota_komunitas dan komunitas warga_kita di luar RW 1-4 dan batas RT resmi per RW di Mangkukusuman
DELETE FROM public.anggota_komunitas
WHERE komunitas_id IN (
  SELECT id FROM public.komunitas
  WHERE kelurahan ILIKE '%mangkukusuman%'
    AND jenis = 'warga_kita'
    AND (
      (rw IS NOT NULL AND rw != '' AND rw NOT ILIKE '%belum%' AND rw != '0' AND rw != '00' AND rw != '-' AND (regexp_replace(rw, '\D', '', 'g')::int < 1 OR regexp_replace(rw, '\D', '', 'g')::int > 4))
      OR
      (rw ILIKE '%1%' AND regexp_replace(rw, '\D', '', 'g')::int = 1 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 10)
      OR
      (rw ILIKE '%2%' AND regexp_replace(rw, '\D', '', 'g')::int = 2 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 10)
      OR
      (rw ILIKE '%3%' AND regexp_replace(rw, '\D', '', 'g')::int = 3 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 11)
      OR
      (rw ILIKE '%4%' AND regexp_replace(rw, '\D', '', 'g')::int = 4 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 14)
    )
);

DELETE FROM public.komunitas
WHERE kelurahan ILIKE '%mangkukusuman%'
  AND jenis = 'warga_kita'
  AND (
    (rw IS NOT NULL AND rw != '' AND rw NOT ILIKE '%belum%' AND rw != '0' AND rw != '00' AND rw != '-' AND (regexp_replace(rw, '\D', '', 'g')::int < 1 OR regexp_replace(rw, '\D', '', 'g')::int > 4))
    OR
    (rw ILIKE '%1%' AND regexp_replace(rw, '\D', '', 'g')::int = 1 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 10)
    OR
    (rw ILIKE '%2%' AND regexp_replace(rw, '\D', '', 'g')::int = 2 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 10)
    OR
    (rw ILIKE '%3%' AND regexp_replace(rw, '\D', '', 'g')::int = 3 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 11)
    OR
    (rw ILIKE '%4%' AND regexp_replace(rw, '\D', '', 'g')::int = 4 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 14)
  );

