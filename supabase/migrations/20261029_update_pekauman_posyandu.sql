-- Migration: Update Cakupan Wilayah Posyandu & Cleanup Data Anomali Kelurahan Pekauman, Kecamatan Tegal Barat

-- 1. Posyandu Tunas: RW 1 dan RW 8 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01 & RW 08, Pekauman, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Tunas Pekauman cakupan sinkronisasi wilayah RW 01 dan RW 08: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '1ba20db1-a59e-4198-8a8c-42e1c533e3e6';

-- 2. Posyandu Delima: RW 2 (RT 01 s/d RT 07)
INSERT INTO public.komunitas (
  id,
  nama_komunitas,
  jenis_komunitas,
  nama,
  jenis,
  kecamatan,
  kelurahan,
  rw,
  rt,
  lokasi,
  deskripsi,
  kontak,
  jadwal
) VALUES (
  '5c47a988-d1a2-4752-94b1-ca48e24c25d8',
  'Posyandu Delima',
  'posyandu',
  'Posyandu Delima',
  'posyandu',
  'Tegal Barat',
  'Pekauman',
  '02',
  '01',
  'Balai Posyandu / RW 02, Pekauman, Tegal Barat, Kota Tegal',
  'Layanan terpadu Posyandu Delima Pekauman cakupan sinkronisasi wilayah RW 02: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.',
  '0813-2233-4455',
  'Setiap Hari Rabu Minggu ke-2 Pukul 08.30 - 11.30 WIB'
)
ON CONFLICT (id) DO UPDATE SET
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Pekauman, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Delima Pekauman cakupan sinkronisasi wilayah RW 02: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.';

-- 3. Posyandu Duku: RW 3 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Pekauman, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Duku Pekauman cakupan sinkronisasi wilayah RW 03: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '17781170-34ce-4a78-89c2-91190ebe0263';

-- 4. Posyandu Garuda: RW 4 (RT 01 s/d RT 07)
UPDATE public.komunitas
SET 
  rw = '04',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 04, Pekauman, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Garuda Pekauman cakupan sinkronisasi wilayah RW 04: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '8b197084-7d24-43a1-81e1-01452e11eb73';

-- 5. Posyandu Nanas: RW 5 (RT 01 s/d RT 06)
UPDATE public.komunitas
SET 
  rw = '05',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 05, Pekauman, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Nanas Pekauman cakupan sinkronisasi wilayah RW 05: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'abf64cd0-4dca-4a68-8acb-eab110f9c010';

-- 6. Posyandu Jalak: RW 6 (RT 01 s/d RT 09)
UPDATE public.komunitas
SET 
  rw = '06',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 06, Pekauman, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Jalak Pekauman cakupan sinkronisasi wilayah RW 06: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '869cb9e3-4dca-4a68-8f5a-7d4996e58a7b';

-- 7. Posyandu Belimbing: RW 7 (RT 01 s/d RT 06)
UPDATE public.komunitas
SET 
  rw = '07',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 07, Pekauman, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Belimbing Pekauman cakupan sinkronisasi wilayah RW 07: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '76ea213c-362e-4073-87cb-aacd851ab8bc';

-- 8. Hapus data anomali yang tidak sesuai dengan ketentuan resmi RW & RT Kelurahan Pekauman
DELETE FROM public.data_anak
WHERE id IN (
  '82a2466c-f1f4-436b-9e6b-e0e1d2a9b226',
  'fb00dd4c-2e65-4fab-b1ca-08d3032db67d',
  'f29fdc71-afb1-4c0b-ba23-297389c907a6',
  '15eff2c9-1611-404a-b304-29ce06e6e9b5'
);

