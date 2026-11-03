-- Migration: Update Cakupan Wilayah Posyandu & Cleanup Data Anomali Kelurahan Kraton, Kecamatan Tegal Barat

-- 1. Posyandu Nusa Indah: RW 1 (RT 01 s/d RT 09)
UPDATE public.komunitas
SET 
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Kraton, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Nusa Indah Kraton cakupan sinkronisasi wilayah RW 01 (RT 01 s/d RT 09): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '174b9b13-3385-42b8-8ab9-7f654ce7ba09';

-- 2. Posyandu Mawar A: RW 2 (RT 01, RT 02, RT 04, RT 05)
UPDATE public.komunitas
SET 
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Kraton, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mawar A Kraton cakupan sinkronisasi wilayah RW 02 (RT 01, RT 02, RT 04, RT 05): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '5085d8eb-a3e1-4906-80c8-29e1e597b3b8';

-- 3. Posyandu Mawar B: RW 2 (RT 03, RT 06, RT 07, RT 08, RT 09)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Mawar B',
  rw = '02',
  rt = '03',
  lokasi = 'Balai Posyandu / RW 02, Kraton, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mawar B Kraton cakupan sinkronisasi wilayah RW 02 (RT 03, RT 06, RT 07, RT 08, RT 09): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '95086f40-9590-4684-8db6-ed8139608504';

-- 4. Posyandu Kenanga A: RW 3 (RT 01, RT 02, RT 03, RT 08)
UPDATE public.komunitas
SET 
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Kraton, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kenanga A Kraton cakupan sinkronisasi wilayah RW 03 (RT 01, RT 02, RT 03, RT 08): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '99daf535-ef51-46fd-8d9c-39b9ec645a81';

-- 5. Posyandu Kenanga B: RW 3 (RT 04, RT 05, RT 06, RT 07)
INSERT INTO public.komunitas (
  id, nama, jenis, kecamatan, kelurahan, rw, rt, lokasi, deskripsi, kontak, jadwal
) VALUES (
  '99daf535-ef51-46fd-8d9c-39b9ec645a82',
  'Posyandu Kenanga B',
  'posyandu',
  'Tegal Barat',
  'Kraton',
  '03',
  '04',
  'Balai Posyandu / RW 03, Kraton, Tegal Barat, Kota Tegal',
  'Layanan terpadu Posyandu Kenanga B Kraton cakupan sinkronisasi wilayah RW 03 (RT 04, RT 05, RT 06, RT 07): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.',
  '0813-2233-4455',
  'Setiap Hari Rabu Minggu ke-2 Pukul 08.30 - 11.30 WIB'
)
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  rw = EXCLUDED.rw,
  rt = EXCLUDED.rt,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  kontak = EXCLUDED.kontak,
  jadwal = EXCLUDED.jadwal;

-- 6. Posyandu Astika A: RW 4 (RT 01, RT 02, RT 03, RT 09)
UPDATE public.komunitas
SET 
  rw = '04',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 04, Kraton, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Astika A Kraton cakupan sinkronisasi wilayah RW 04 (RT 01, RT 02, RT 03, RT 09): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '1416e589-a3e1-4906-87ab-04b1091e723a';

-- 7. Posyandu Astika B: RW 4 (RT 04, RT 06, RT 07, RT 08)
UPDATE public.komunitas
SET 
  rw = '04',
  rt = '04',
  lokasi = 'Balai Posyandu / RW 04, Kraton, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Astika B Kraton cakupan sinkronisasi wilayah RW 04 (RT 04, RT 06, RT 07, RT 08): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '214a0998-cfbd-425e-8ea4-0d89ab534df7';

-- 8. Posyandu Astika C: RW 4 (RT 05, RT 10)
UPDATE public.komunitas
SET 
  rw = '04',
  rt = '05',
  lokasi = 'Balai Posyandu / RW 04, Kraton, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Astika C Kraton cakupan sinkronisasi wilayah RW 04 (RT 05, RT 10): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'fbf076ab-cfbd-425e-8a15-7af12567838c';

-- 9. Posyandu Kartini A: RW 5 (RT 03, RT 07, RT 09, RT 10, RT 11)
UPDATE public.komunitas
SET 
  rw = '05',
  rt = '03',
  lokasi = 'Balai Posyandu / RW 05, Kraton, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kartini A Kraton cakupan sinkronisasi wilayah RW 05 (RT 03, RT 07, RT 09, RT 10, RT 11): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '75df6bd8-a3e1-4906-831c-72196b837e23';

-- 10. Posyandu Kartini B: RW 5 (RT 01, RT 02, RT 03, RT 04, RT 05, RT 06, RT 08)
UPDATE public.komunitas
SET 
  rw = '05',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 05, Kraton, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kartini B Kraton cakupan sinkronisasi wilayah RW 05 (RT 01, RT 02, RT 03, RT 04, RT 05, RT 06, RT 08): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '3ca52e00-3385-42b8-8865-372dbb245ac8';

-- 11. Posyandu Sekar Indah A: RW 6 (RT 01, RT 02, RT 03, RT 04, RT 05)
UPDATE public.komunitas
SET 
  rw = '06',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 06, Kraton, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Sekar Indah A Kraton cakupan sinkronisasi wilayah RW 06 (RT 01, RT 02, RT 03, RT 04, RT 05): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '49ec2216-30fe-4a39-8ea1-775ddc8966a2';

-- 12. Posyandu Sekar Indah B: RW 6 (RT 06, RT 07, RT 08)
UPDATE public.komunitas
SET 
  rw = '06',
  rt = '06',
  lokasi = 'Balai Posyandu / RW 06, Kraton, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Sekar Indah B Kraton cakupan sinkronisasi wilayah RW 06 (RT 06, RT 07, RT 08): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'abb4a865-30fe-4a39-8330-09f5569d9c37';

-- 13. Posyandu Mayang Sari: RW 7 (RT 01 s/d RT 08)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Mayang Sari',
  rw = '07',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 07, Kraton, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mayang Sari Kraton cakupan sinkronisasi wilayah RW 07 (RT 01 s/d RT 08): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '6faedc53-9590-4684-800b-35b9bf4c4f6f';

-- 14. Posyandu Seruni: RW 8 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  rw = '08',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 08, Kraton, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Seruni Kraton cakupan sinkronisasi wilayah RW 08 (RT 01 s/d RT 05): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '43073336-7eaf-4e5d-8bba-60ddb10cf89a';

-- 15. Posyandu Dewi Sartika: RW 9 (RT 01 s/d RT 06)
UPDATE public.komunitas
SET 
  rw = '09',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 09, Kraton, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Dewi Sartika Kraton cakupan sinkronisasi wilayah RW 09 (RT 01 s/d RT 06): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'd3af708d-5195-41eb-80aa-72ad29d264c4';

-- 16. Hapus semua data yang tidak sesuai dengan ketentuan (RW 10 di Kraton)
DELETE FROM public.data_anak
WHERE id IN ('289ff0fc-45a2-4678-a016-29b5e5c1ac32', '7d047228-ff7c-4144-a7c8-edd3e0957f94');

