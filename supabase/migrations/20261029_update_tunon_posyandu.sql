-- Migration: Update Cakupan Wilayah Posyandu & Cleanup Data Anomali Kelurahan Tunon, Kecamatan Tegal Selatan

-- 1. Posyandu Mawar I: RW 1 (RT 01 s/d RT 06)
UPDATE public.komunitas
SET 
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Tunon, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mawar I Tunon cakupan sinkronisasi wilayah RW 01 (RT 01 s/d RT 06): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'f73b16ab-c16e-4572-8423-6a3d5cec3d4a';

-- 2. Posyandu Mawar II: RW 2 (RT 01 s/d RT 06)
UPDATE public.komunitas
SET 
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Tunon, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mawar II Tunon cakupan sinkronisasi wilayah RW 02 (RT 01 s/d RT 06): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '1c94a998-c16e-4572-88b1-fcd58ff2f5db';

-- 3. Posyandu Mawar III: RW 3 (RT 01 s/d RT 04)
UPDATE public.komunitas
SET 
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Tunon, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mawar III Tunon cakupan sinkronisasi wilayah RW 03 (RT 01 s/d RT 04): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '1cfd9970-a971-434c-8221-cd859e2cda3f';

-- 4. Posyandu Mawar IV: RW 4 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  rw = '04',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 04, Tunon, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mawar IV Tunon cakupan sinkronisasi wilayah RW 04 (RT 01 s/d RT 05): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '73857d1e-31fe-4277-8ad6-4139a5a87ed1';

-- 5. Hapus data anomali yang tidak sesuai dengan ketentuan (RW 5 di Tunon)
DELETE FROM public.data_anak
WHERE id = '27619591-4d7c-4219-b32d-82b43d5f2258';

