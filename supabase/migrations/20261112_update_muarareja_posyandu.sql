-- ==============================================================================
-- Migration: Update Cakupan Wilayah Posyandu & Cleanup Data Anomali
-- Khusus Kelurahan Muarareja, Kecamatan Tegal Barat, Kota Tegal
-- Generated on 2026-11-12
--
-- Ketentuan Resmi:
-- 1. Jumlah RW ada 3:
--    - RW 1: Jumlah RT 5 (RT 1 s/d RT 5)
--    - RW 2: Jumlah RT 5 (RT 1 s/d RT 5)
--    - RW 3: Jumlah RT 5 (RT 1 s/d RT 5)
-- 2. Cakupan Posyandu:
--    - Posyandu Mawar: RW 1 RT 1, 3, 5
--    - Posyandu Dahlia: RW 1 RT 2
--    - Posyandu Anggrek: RW 1 RT 2, 4
--    - Posyandu Nusa Indah: RW 2 RT 2, 3
--    - Posyandu Cempaka: RW 2 RT 1, 4
--    - Posyandu Melati: RW 3 RT 1, 2, 3
--    - Posyandu Kemuning: RW 3 RT 3, 5
-- 3. Hapus data yang tidak sesuai ketentuan (anomali data_anak & komunitas warga_kita berlebih)
-- ==============================================================================

-- 1. Posyandu Mawar: RW 1 (RT 01, RT 03, RT 05 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Muarareja, Tegal Barat, Kota Tegal',
  cakupan_wilayah = 'Melayani Warga RW 01 (RT 01, RT 03, RT 05 dan RW - RT Tidak Tahu)',
  deskripsi = 'Layanan terpadu Posyandu Mawar Muarareja cakupan sinkronisasi wilayah RW 01 (RT 01, RT 03, RT 05 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '194a821a-cb4f-4146-89f9-ad0901f6527d';

-- 2. Posyandu Dahlia: RW 1 (RT 02 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '01',
  rt = '02',
  lokasi = 'Balai Posyandu / RW 01, Muarareja, Tegal Barat, Kota Tegal',
  cakupan_wilayah = 'Melayani Warga RW 01 (RT 02 dan RW - RT Tidak Tahu)',
  deskripsi = 'Layanan terpadu Posyandu Dahlia Muarareja cakupan sinkronisasi wilayah RW 01 (RT 02 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '5202b90c-adfb-499b-8af9-f099b059869b';

-- 3. Posyandu Anggrek: RW 1 (RT 02, RT 04 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '01',
  rt = '02',
  lokasi = 'Balai Posyandu / RW 01, Muarareja, Tegal Barat, Kota Tegal',
  cakupan_wilayah = 'Melayani Warga RW 01 (RT 02, RT 04 dan RW - RT Tidak Tahu)',
  deskripsi = 'Layanan terpadu Posyandu Anggrek Muarareja cakupan sinkronisasi wilayah RW 01 (RT 02, RT 04 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '55c8f953-cbdd-4afc-805f-f601f5ae4c98';

-- 4. Posyandu Nusa Indah: RW 2 (RT 02, RT 03 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '02',
  rt = '02',
  lokasi = 'Balai Posyandu / RW 02, Muarareja, Tegal Barat, Kota Tegal',
  cakupan_wilayah = 'Melayani Warga RW 02 (RT 02, RT 03 dan RW - RT Tidak Tahu)',
  deskripsi = 'Layanan terpadu Posyandu Nusa Indah Muarareja cakupan sinkronisasi wilayah RW 02 (RT 02, RT 03 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '1452e8c7-e16c-4ca1-85a3-d075a51fe415';

-- 5. Posyandu Cempaka: RW 2 (RT 01, RT 04 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Muarareja, Tegal Barat, Kota Tegal',
  cakupan_wilayah = 'Melayani Warga RW 02 (RT 01, RT 04 dan RW - RT Tidak Tahu)',
  deskripsi = 'Layanan terpadu Posyandu Cempaka Muarareja cakupan sinkronisasi wilayah RW 02 (RT 01, RT 04 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'ecfde3e3-a736-444c-8310-b0e5008e3b41';

-- 6. Posyandu Melati: RW 3 (RT 01, RT 02, RT 03 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Muarareja, Tegal Barat, Kota Tegal',
  cakupan_wilayah = 'Melayani Warga RW 03 (RT 01, RT 02, RT 03 dan RW - RT Tidak Tahu)',
  deskripsi = 'Layanan terpadu Posyandu Melati Muarareja cakupan sinkronisasi wilayah RW 03 (RT 01, RT 02, RT 03 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '39ac7bb4-e16c-4ca1-8115-3ddd135c84d4';

-- 7. Posyandu Kemuning: RW 3 (RT 03, RT 05 dan RW - RT Tidak Tahu)
UPDATE public.komunitas
SET 
  rw = '03',
  rt = '03',
  lokasi = 'Balai Posyandu / RW 03, Muarareja, Tegal Barat, Kota Tegal',
  cakupan_wilayah = 'Melayani Warga RW 03 (RT 03, RT 05 dan RW - RT Tidak Tahu)',
  deskripsi = 'Layanan terpadu Posyandu Kemuning Muarareja cakupan sinkronisasi wilayah RW 03 (RT 03, RT 05 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '125776d0-a736-444c-80bc-68ad6ecadc00';

-- 8. Hapus 6 data_anak anomali (RW > 3 atau RT > 5 di Muarareja)
DELETE FROM public.data_anak
WHERE id IN (
  '6be339e1-9202-4493-9181-3de059594bbf', -- ABIZAR ARKHA AFANDI (RW 04)
  '34fb8360-bae0-48d8-916b-3015380a558e', -- PELANGI BERLIANA PUTRI (RW 05 RT 02)
  'd7d43581-b71b-4055-a557-beb0e4020736', -- BERLIAN AULIA AZZAHRA (RW 04)
  '70760406-2b47-4e47-ae8b-04ef5fca53ce', -- JAUSYAN HISHNUL MILLAH (RW 01 RT 10)
  '7538dc92-ea67-42bc-b265-5206ce2128a8', -- GEZA AFNAN AFANDI (RW 04 RT 01)
  '9a9fc689-6597-45e7-8642-2914918f5826'  -- HISYAM AL FARIZQI (RW 04 RT 01)
);

-- 9. Hapus komunitas warga_kita berlebih/anomali di Muarareja (RW > 3 atau RT > 5)
DELETE FROM public.komunitas
WHERE jenis = 'warga_kita'
  AND (lokasi ILIKE '%muarareja%' OR kelurahan ILIKE '%muarareja%')
  AND (
    (rw ~ '^[0-9]+$' AND rw::int > 3)
    OR (rt ~ '^[0-9]+$' AND rt::int > 5)
  );

