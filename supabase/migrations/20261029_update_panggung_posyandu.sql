-- Migration: Update Cakupan Wilayah Posyandu & Cleanup Data Anomali Kelurahan Panggung, Kecamatan Tegal Timur

-- 1. Posyandu Dahlia: RW 1 (RT 01 s/d RT 09)
UPDATE public.komunitas
SET 
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Dahlia Panggung: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '2fc50ff0-9d53-42bc-8b1b-e4ad73e274a8';

-- 2. Posyandu Anyelir: RW 2 (RT 01 s/d RT 11)
UPDATE public.komunitas
SET 
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Anyelir Panggung: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'cd56796d-8dee-4007-8730-02b14bce06aa';

-- 3. Posyandu Jaya Abadi: RW 3 (RT 01 s/d RT 09)
UPDATE public.komunitas
SET 
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Jaya Abadi Panggung: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'ffadd058-40be-47a6-8ff2-19eddce9c530';

-- 4. Posyandu Harapan: RW 4 (RT 01 s/d RT 09)
UPDATE public.komunitas
SET 
  rw = '04',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 04, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Harapan Panggung: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '9ebc29ec-a5e5-4aff-8b13-12190735836b';

-- 5. Posyandu Mekarsari: RW 5 (RT 01 s/d RT 09)
UPDATE public.komunitas
SET 
  rw = '05',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 05, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mekarsari Panggung: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '9a8a12f0-0a2a-4680-84bf-ce21a26b6830';

-- 6. Posyandu Seruni: RW 6 (RT 01 s/d RT 10)
UPDATE public.komunitas
SET 
  rw = '06',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 06, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Seruni Panggung: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '87d14abf-fee3-4e2f-8c91-e115debc0a75';

-- 7. Posyandu Anggrek 1: RW 7 RT 1, 2, 3, 4, 5, 6, 17, 18
UPDATE public.komunitas
SET 
  rw = '07',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 07, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Anggrek 1 Panggung cakupan sinkronisasi wilayah RW 07 (RT 1, 2, 3, 4, 5, 6, 17, 18): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'b02a2aa6-c19a-4e35-8e61-07e189d39062';

-- 8. Posyandu Anggrek 2: RW 7 RT 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 20
UPDATE public.komunitas
SET 
  rw = '07',
  rt = '07',
  lokasi = 'Balai Posyandu / RW 07, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Anggrek 2 Panggung cakupan sinkronisasi wilayah RW 07 (RT 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 20): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '11f2b0f5-c19a-4e35-80b5-50190fbf5acd';

-- 9. Posyandu Bahtera Serayu: RW 8 (RT 01 s/d RT 06)
UPDATE public.komunitas
SET 
  rw = '08',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 08, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Bahtera Serayu Panggung: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'be4e95a4-fd43-4e21-863d-419d649de22c';

-- 10. Posyandu Nusa Indah A: RW 9 RT 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 20
UPDATE public.komunitas
SET 
  nama = 'Posyandu Nusa Indah A',
  nama_komunitas = 'Posyandu Nusa Indah A',
  rw = '09',
  rt = '04',
  lokasi = 'Balai Posyandu / RW 09, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Nusa Indah A Panggung cakupan sinkronisasi wilayah RW 09 (RT 4, 5, 6, 7, 8, 9, 10, 11, 14, 15, 20): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'e6cd570b-74d9-4cd6-8b08-ed5dce09561e';

-- 11. Posyandu Nusa Indah B: RW 9 RT 1, 2, 3, 12, 13, 16, 17, 18, 19
UPDATE public.komunitas
SET 
  nama = 'Posyandu Nusa Indah B',
  nama_komunitas = 'Posyandu Nusa Indah B',
  rw = '09',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 09, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Nusa Indah B Panggung cakupan sinkronisasi wilayah RW 09 (RT 1, 2, 3, 12, 13, 16, 17, 18, 19): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '0c26e9f8-74d9-4cd6-8f97-7ff5306e6207';

-- 12. Posyandu Melati 10A: RW 10 RT 1, 2, 3, 6, 8, 9, 10, 11
UPDATE public.komunitas
SET 
  nama = 'Posyandu Melati 10A',
  nama_komunitas = 'Posyandu Melati 10A',
  rw = '10',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 10, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Melati 10A Panggung cakupan sinkronisasi wilayah RW 10 (RT 1, 2, 3, 6, 8, 9, 10, 11): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '3ad8d111-ff02-47b8-8882-be25c8aba197';

-- 13. Posyandu Kuntum Melati 10B: RW 10 RT 4, 5, 7
UPDATE public.komunitas
SET 
  nama = 'Posyandu Kuntum Melati 10B',
  nama_komunitas = 'Posyandu Kuntum Melati 10B',
  rw = '10',
  rt = '04',
  lokasi = 'Balai Posyandu / RW 10, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kuntum Melati 10B Panggung cakupan sinkronisasi wilayah RW 10 (RT 4, 5, 7): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '2f857e20-5dc1-4f78-8784-3991b875fdf8';

-- 14. Posyandu Dewi Shinta: RW 11 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  rw = '11',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 11, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Dewi Shinta Panggung: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '354459e2-bba6-4af4-81bc-ace901825749';

-- 15. Posyandu Bahtera A: RW 12 RT 1, 2, 3, 4, 5, 6, 7, 8
UPDATE public.komunitas
SET 
  rw = '12',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 12, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Bahtera A Panggung cakupan sinkronisasi wilayah RW 12 (RT 1, 2, 3, 4, 5, 6, 7, 8): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '3f81947c-cd1a-49d7-8018-5091b1208ed0';

-- 16. Posyandu Bahtera B: RW 12 RT 9, 10, 11, 12, 13
UPDATE public.komunitas
SET 
  rw = '12',
  rt = '09',
  lokasi = 'Balai Posyandu / RW 12, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Bahtera B Panggung cakupan sinkronisasi wilayah RW 12 (RT 9, 10, 11, 12, 13): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '1a28018f-cd1a-49d7-84a6-e329370c593b';

-- 17. Posyandu Tulip: RW 13 (RT 01 s/d RT 07)
UPDATE public.komunitas
SET 
  rw = '13',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 13, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Tulip Panggung: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '3099b01d-e5e2-49e7-885f-94b9b4f18209';

-- 18. Posyandu Teratai Putih: RW 14 (RT 01 s/d RT 05)
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
  '3898c3f2-0122-4ddf-833d-99bfd5fb682c',
  'Posyandu Teratai Putih',
  'posyandu',
  'Posyandu Teratai Putih',
  'posyandu',
  'Tegal Timur',
  'Panggung',
  '14',
  '01',
  'Balai Posyandu / RW 14, Panggung, Tegal Timur, Kota Tegal',
  'Layanan terpadu Posyandu Teratai Putih Panggung: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.',
  '0813-2233-4455',
  'Setiap Hari Rabu Minggu ke-2 Pukul 08.30 - 11.30 WIB'
)
ON CONFLICT (id) DO UPDATE SET
  rw = '14',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 14, Panggung, Tegal Timur, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Teratai Putih Panggung: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.';

-- 19. Hapus data anomali yang tidak sesuai dengan ketentuan resmi RW & RT Kelurahan Panggung
DELETE FROM public.data_anak
WHERE id IN (
  '497b541a-a9a0-449c-8e06-ee48345404f5',
  '5ddd670f-51db-4de5-b843-fd47454f73a3',
  'e8c0485a-24da-486c-b6cc-0ebe7ff3f093'
);
