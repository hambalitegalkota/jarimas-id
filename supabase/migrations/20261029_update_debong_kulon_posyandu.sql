-- Migration: Update Cakupan Wilayah Posyandu Kelurahan Debong Kulon, Kecamatan Tegal Selatan
-- 1. Posyandu Mawar: RW 1 (RT 03, RT 04, RT 06)
UPDATE public.komunitas
SET 
  rw = '01',
  rt = '03',
  lokasi = 'Balai Posyandu / RW 01, Debong Kulon, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mawar Debong Kulon cakupan sinkronisasi wilayah RW 01 (RT 03, RT 04, RT 06): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '5ed1310a-8c1d-4362-8518-3469e3262955';

-- 2. Posyandu Cempaka: RW 1 (RT 01, RT 02, RT 05)
UPDATE public.komunitas
SET 
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Debong Kulon, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Cempaka Debong Kulon cakupan sinkronisasi wilayah RW 01 (RT 01, RT 02, RT 05): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '58cedef8-322d-45ca-83de-c1f9716b29ef';

-- 3. Posyandu Kenanga: RW 2 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Debong Kulon, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kenanga Debong Kulon cakupan sinkronisasi wilayah RW 02 (RT 01 s/d RT 05): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'c099b759-8c1d-4362-8089-a1d15d3a5eea';

-- 4. Posyandu Melati: RW 3 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Debong Kulon, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Melati Debong Kulon cakupan sinkronisasi wilayah RW 03 (RT 01 s/d RT 05): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '301ddd91-0d8e-40a0-80a9-3031ac9f1642';

-- 5. Posyandu Nusa Indah: RW 4 (RT 01 s/d RT 04)
UPDATE public.komunitas
SET 
  rw = '04',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 04, Debong Kulon, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Nusa Indah Debong Kulon cakupan sinkronisasi wilayah RW 04 (RT 01 s/d RT 04): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '06e8fa37-05e8-4ae9-82dd-ac2d08bd809a';
