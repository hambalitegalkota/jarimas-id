-- Migration: Update Posyandu Kalinyamat Wetan & Cleanup Invalid Warga Kita
-- Khusus Kelurahan Kalinyamat Wetan, Kecamatan Tegal Selatan

-- 1. Update 4 Posyandu resmi Kalinyamat Wetan
UPDATE public.komunitas
SET 
  nama = 'Posyandu Dahlia I',
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Kalinyamat Wetan, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Dahlia I Kalinyamat Wetan cakupan sinkronisasi wilayah RW 01 (RT 01 s/d RT 05): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'fec0168d-20ee-4c27-8b5f-f52168e9ea56';

UPDATE public.komunitas
SET 
  nama = 'Posyandu Dahlia II',
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Kalinyamat Wetan, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Dahlia II Kalinyamat Wetan cakupan sinkronisasi wilayah RW 02 (RT 01 s/d RT 05): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '6d9c48bd-822d-4163-8ebb-480d5edc5858';

UPDATE public.komunitas
SET 
  nama = 'Posyandu Dahlia III',
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Kalinyamat Wetan, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Dahlia III Kalinyamat Wetan cakupan sinkronisasi wilayah RW 03 (RT 01 s/d RT 05): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '0bd3c26e-822d-4163-810f-904565fe523d';

UPDATE public.komunitas
SET 
  nama = 'Posyandu Dahlia IV',
  rw = '04',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 04, Kalinyamat Wetan, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Dahlia IV Kalinyamat Wetan cakupan sinkronisasi wilayah RW 04 (RT 01 s/d RT 05): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '75a7cfd4-75ed-4c79-8dd2-02c164bc8e5c';

-- 2. Hapus anggota_komunitas dan komunitas warga_kita di luar RW 1-4 dan RT 1-5 di Kalinyamat Wetan
DELETE FROM public.anggota_komunitas
WHERE komunitas_id IN (
  SELECT id FROM public.komunitas
  WHERE kelurahan ILIKE '%kalinyamat wetan%'
    AND jenis = 'warga_kita'
    AND (
      (rw IS NOT NULL AND rw != '' AND rw NOT ILIKE '%belum%' AND rw != '0' AND rw != '00' AND rw != '-' AND (regexp_replace(rw, '\D', '', 'g')::int < 1 OR regexp_replace(rw, '\D', '', 'g')::int > 4))
      OR
      (rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND (regexp_replace(rt, '\D', '', 'g')::int < 1 OR regexp_replace(rt, '\D', '', 'g')::int > 5))
    )
);

DELETE FROM public.komunitas
WHERE kelurahan ILIKE '%kalinyamat wetan%'
  AND jenis = 'warga_kita'
  AND (
    (rw IS NOT NULL AND rw != '' AND rw NOT ILIKE '%belum%' AND rw != '0' AND rw != '00' AND rw != '-' AND (regexp_replace(rw, '\D', '', 'g')::int < 1 OR regexp_replace(rw, '\D', '', 'g')::int > 4))
    OR
    (rt IS NOT NULL AND rt != '' AND rt NOT ILIKE '%belum%' AND rt != '0' AND rt != '00' AND rt != '-' AND (regexp_replace(rt, '\D', '', 'g')::int < 1 OR regexp_replace(rt, '\D', '', 'g')::int > 5))
  );

