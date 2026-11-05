-- Migration: Update Posyandu Bandung & Cleanup Invalid Warga Kita & Data Anak
-- Khusus Kelurahan Bandung, Kecamatan Tegal Selatan, Kota Tegal
-- Ketentuan Wilayah:
-- Jumlah RW: 5
-- RW 1: Jumlah RT 4 (RT 01 s/d RT 04)
-- RW 2: Jumlah RT 6 (RT 01 s/d RT 06)
-- RW 3: Jumlah RT 4 (RT 01 s/d RT 04)
-- RW 4: Jumlah RT 4 (RT 01 s/d RT 04)
-- RW 5: Jumlah RT 5 (RT 01 s/d RT 05)

-- 1. Update 5 Posyandu resmi Kelurahan Bandung
UPDATE public.komunitas
SET 
  nama = 'Posyandu Melati I',
  rw = '01',
  rt = '01',
  lokasi = 'Balai RW 01, Kelurahan Bandung, Kecamatan Tegal Selatan, Kota Tegal',
  deskripsi = 'Posyandu Melati I Kelurahan Bandung cakupan sinkronisasi wilayah RW 01 (RT 01 s/d RT 04): layanan kesehatan balita, imunisasi, dan pemantauan tumbuh kembang anak usia dini.'
WHERE id = 'ce057279-6468-4616-83dc-602d548a8530';

UPDATE public.komunitas
SET 
  nama = 'Posyandu Melati II',
  rw = '02',
  rt = '01',
  lokasi = 'Balai RW 02, Kelurahan Bandung, Kecamatan Tegal Selatan, Kota Tegal',
  deskripsi = 'Posyandu Melati II Kelurahan Bandung cakupan sinkronisasi wilayah RW 02 (RT 01 s/d RT 06): layanan kesehatan balita, imunisasi, dan pemantauan tumbuh kembang anak usia dini.'
WHERE id = '6c3cec2a-6468-4616-8630-a8652d5b6175';

UPDATE public.komunitas
SET 
  nama = 'Posyandu Melati III',
  rw = '03',
  rt = '01',
  lokasi = 'Balai RW 03, Kelurahan Bandung, Kecamatan Tegal Selatan, Kota Tegal',
  deskripsi = 'Posyandu Melati III Kelurahan Bandung cakupan sinkronisasi wilayah RW 03 (RT 01 s/d RT 04): layanan kesehatan balita, imunisasi, dan pemantauan tumbuh kembang anak usia dini.'
WHERE id = '6ebd6959-6b52-41a6-8c0d-093d0b1669c8';

UPDATE public.komunitas
SET 
  nama = 'Posyandu Melati IV',
  rw = '04',
  rt = '01',
  lokasi = 'Balai RW 04, Kelurahan Bandung, Kecamatan Tegal Selatan, Kota Tegal',
  deskripsi = 'Posyandu Melati IV Kelurahan Bandung cakupan sinkronisasi wilayah RW 04 (RT 01 s/d RT 04): layanan kesehatan balita, imunisasi, dan pemantauan tumbuh kembang anak usia dini.'
WHERE id = '189a6054-01b2-4271-83fd-59a52d00164f';

UPDATE public.komunitas
SET 
  nama = 'Posyandu Melati V',
  rw = '05',
  rt = '01',
  lokasi = 'Balai RW 05, Kelurahan Bandung, Kecamatan Tegal Selatan, Kota Tegal',
  deskripsi = 'Posyandu Melati V Kelurahan Bandung cakupan sinkronisasi wilayah RW 05 (RT 01 s/d RT 05): layanan kesehatan balita, imunisasi, dan pemantauan tumbuh kembang anak usia dini.'
WHERE id = 'f340cd67-01b2-4271-81a9-116d9b3cb70e';

-- 2. Hapus data anak anomali/tidak sesuai ketentuan di Kelurahan Bandung
DELETE FROM public.data_anak
WHERE id IN (
  '10fad56b-f11c-4fda-8314-c8f9dc4ff628', -- Zahida Khaira Nadhifa Faza (RW 06 - Bandung hanya s/d RW 05)
  '54e9886b-5db7-43a8-9caf-bdd376c62758'  -- CHILYA LUBBI CHAMIDAH (RW 04 RT 05 - RW 04 hanya s/d RT 04)
);

-- 3. Hapus anggota_komunitas dan komunitas warga_kita di luar RW 1-5 dan batas RT resmi per RW di Bandung
DELETE FROM public.anggota_komunitas
WHERE komunitas_id IN (
  SELECT id FROM public.komunitas
  WHERE kelurahan ILIKE '%bandung%'
    AND jenis = 'warga_kita'
    AND (
      -- RW tidak valid (< 1 atau > 5)
      (rw IS NOT NULL AND rw != '' AND rw NOT ILIKE '%belum%' AND rw != '0' AND rw != '00' AND rw != '-' AND (regexp_replace(rw, '\D', '', 'g')::int < 1 OR regexp_replace(rw, '\D', '', 'g')::int > 5))
      OR
      -- RW 1 RT > 4
      (regexp_replace(rw, '\D', '', 'g')::int = 1 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 4)
      OR
      -- RW 2 RT > 6
      (regexp_replace(rw, '\D', '', 'g')::int = 2 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 6)
      OR
      -- RW 3 RT > 4
      (regexp_replace(rw, '\D', '', 'g')::int = 3 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 4)
      OR
      -- RW 4 RT > 4
      (regexp_replace(rw, '\D', '', 'g')::int = 4 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 4)
      OR
      -- RW 5 RT > 5
      (regexp_replace(rw, '\D', '', 'g')::int = 5 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 5)
    )
);

DELETE FROM public.komunitas
WHERE kelurahan ILIKE '%bandung%'
  AND jenis = 'warga_kita'
  AND (
    -- RW tidak valid (< 1 atau > 5)
    (rw IS NOT NULL AND rw != '' AND rw NOT ILIKE '%belum%' AND rw != '0' AND rw != '00' AND rw != '-' AND (regexp_replace(rw, '\D', '', 'g')::int < 1 OR regexp_replace(rw, '\D', '', 'g')::int > 5))
    OR
    -- RW 1 RT > 4
    (regexp_replace(rw, '\D', '', 'g')::int = 1 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 4)
    OR
    -- RW 2 RT > 6
    (regexp_replace(rw, '\D', '', 'g')::int = 2 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 6)
    OR
    -- RW 3 RT > 4
    (regexp_replace(rw, '\D', '', 'g')::int = 3 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 4)
    OR
    -- RW 4 RT > 4
    (regexp_replace(rw, '\D', '', 'g')::int = 4 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 4)
    OR
    -- RW 5 RT > 5
    (regexp_replace(rw, '\D', '', 'g')::int = 5 AND rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND regexp_replace(rt, '\D', '', 'g')::int > 5)
  );

