-- ==============================================================================
-- Migration: Pembersihan Halaman Komunitas Duplikat, Tumpang Tindih & Anomali
-- Tanggal: 14 November 2026
-- 
-- Rincian Penataan & Harmonisasi Wilayah Resmi Kota Tegal:
-- 1. Migrasi seluruh anggota, data anak, kabar, dan pesan dari komunitas anomali ke komunitas resmi:
--    - Bandung RT 03 RW 04: Pindahkan 15 anggota dari 79c0e0c1... ke e8f203be... (dan daftarkan juga ke Kelurahan Bandung 9f2aa63a...).
--    - Posyandu Kecamatan Tegal Timur: Pindahkan anggota dari adca4334... ke 68a40f1c...
-- 2. Perbaikan penamaan resmi:
--    - Posyandu Mawar B Kraton (95086f40...): sebelumnya tertulis ganda Posyandu Mawar A.
-- 3. Hapus halaman komunitas ganda / tumpang tindih:
--    - 8 Komunitas anomali bernama 'Warga Kelurahan [Nama]' padahal tingkat RT (Bandung, Debong Kidul, Debong Kulon, Debong Tengah, Kalinyamat Wetan, Keturen, Randugunting, Tunon).
--    - 4 Komunitas Posyandu Kecamatan duplikat (Margadana, Tegal Barat, Tegal Selatan, Tegal Timur).
--    - 307 Komunitas sampah Pesurungan Kidul di Kecamatan Margadana (seharusnya Tegal Barat).
--    - 313 Komunitas sampah Kalinyamat Kulon di Kecamatan Tegal Selatan (seharusnya Margadana).
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. MIGRASI DATA ANGGOTA DARI KOMUNITAS DUPLIKAT KE KOMUNITAS RESMI
-- ------------------------------------------------------------------------------

-- 1.1 Bandung RT 03 RW 04: Pindahkan anggota dari 79c0e0c1... ke e8f203be...
INSERT INTO public.anggota_komunitas (komunitas_id, user_id, peran, status, berdomisili, kk_terdaftar, peran_diajukan, created_at, updated_at)
SELECT 
  'e8f203be-a1d7-4477-8eea-cd7d31f2dcce'::uuid,
  user_id,
  peran,
  status,
  berdomisili,
  kk_terdaftar,
  peran_diajukan,
  created_at,
  updated_at
FROM public.anggota_komunitas
WHERE komunitas_id = '79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703'::uuid
ON CONFLICT (komunitas_id, user_id) 
DO UPDATE SET
  peran = EXCLUDED.peran,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 1.2 Bandung: Daftarkan juga anggota ke tingkat Kelurahan Bandung resmi (9f2aa63a...) jika belum tergabung
INSERT INTO public.anggota_komunitas (komunitas_id, user_id, peran, status, berdomisili, kk_terdaftar, peran_diajukan, created_at, updated_at)
SELECT 
  '9f2aa63a-53d9-47a6-81ec-f8c5bb6bbbc9'::uuid,
  user_id,
  peran,
  status,
  berdomisili,
  kk_terdaftar,
  peran_diajukan,
  created_at,
  updated_at
FROM public.anggota_komunitas
WHERE komunitas_id = '79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703'::uuid
ON CONFLICT (komunitas_id, user_id) DO NOTHING;

-- Hapus anggota dari komunitas anomali 79c0e0c1...
DELETE FROM public.anggota_komunitas
WHERE komunitas_id = '79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703'::uuid;

-- Pindahkan data pesan grup & kabar jika ada
UPDATE public.pesan_grup
SET komunitas_id = 'e8f203be-a1d7-4477-8eea-cd7d31f2dcce'::uuid
WHERE komunitas_id = '79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703'::uuid;

UPDATE public.kabar_jarimas
SET komunitas_id = 'e8f203be-a1d7-4477-8eea-cd7d31f2dcce'::uuid
WHERE komunitas_id = '79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703'::uuid;

UPDATE public.data_anak
SET komunitas_id = 'e8f203be-a1d7-4477-8eea-cd7d31f2dcce'::uuid
WHERE komunitas_id = '79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703'::uuid;

-- 1.3 Posyandu Kecamatan Tegal Timur: Pindahkan anggota dari adca4334... ke 68a40f1c...
INSERT INTO public.anggota_komunitas (komunitas_id, user_id, peran, status, berdomisili, kk_terdaftar, peran_diajukan, created_at, updated_at)
SELECT 
  '68a40f1c-a475-4b4f-8cd0-3521c0cb3ea4'::uuid,
  user_id,
  peran,
  status,
  berdomisili,
  kk_terdaftar,
  peran_diajukan,
  created_at,
  updated_at
FROM public.anggota_komunitas
WHERE komunitas_id = 'adca4334-912b-40fa-8c70-179ad2ae3a6c'::uuid
ON CONFLICT (komunitas_id, user_id) 
DO UPDATE SET
  peran = EXCLUDED.peran,
  status = EXCLUDED.status,
  updated_at = NOW();

DELETE FROM public.anggota_komunitas
WHERE komunitas_id = 'adca4334-912b-40fa-8c70-179ad2ae3a6c'::uuid;

UPDATE public.pesan_grup
SET komunitas_id = '68a40f1c-a475-4b4f-8cd0-3521c0cb3ea4'::uuid
WHERE komunitas_id = 'adca4334-912b-40fa-8c70-179ad2ae3a6c'::uuid;

UPDATE public.kabar_jarimas
SET komunitas_id = '68a40f1c-a475-4b4f-8cd0-3521c0cb3ea4'::uuid
WHERE komunitas_id = 'adca4334-912b-40fa-8c70-179ad2ae3a6c'::uuid;


-- ------------------------------------------------------------------------------
-- 2. PERBAIKAN PENAMAAN & ATRIBUT WILAYAH RESMI
-- ------------------------------------------------------------------------------

-- 2.1 Perbaikan Posyandu Mawar B Kraton (sebelumnya salah tertulis Posyandu Mawar A ganda)
UPDATE public.komunitas
SET nama = 'Posyandu Mawar B',
    nama_komunitas = 'Posyandu Mawar B',
    rw = '02',
    rt = '03',
    lokasi = 'Balai Posyandu / RW 02, Kraton, Tegal Barat, Kota Tegal',
    deskripsi = 'Layanan terpadu Posyandu Mawar B Kraton cakupan sinkronisasi wilayah RW 02 (RT 03, RT 06, RT 07, RT 08, RT 09): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '95086f40-9590-4684-8db6-ed8139608504'::uuid;


-- ------------------------------------------------------------------------------
-- 3. PENGHAPUSAN HALAMAN KOMUNITAS ANOMALI & DUPLIKAT
-- ------------------------------------------------------------------------------

-- 3.1 Hapus 8 Komunitas Bernama 'Warga Kelurahan [Nama]' padahal tingkat RT
DELETE FROM public.komunitas
WHERE id IN (
  '79c0e0c1-d8a9-41b8-8e0a-f9a5e581e703'::uuid, -- Dobel Bandung RT 03 RW 04
  '57fd21e3-fba0-4d44-8b40-d00135b83564'::uuid, -- Dobel Debong Kidul RT 05 RW 01
  '490a35cf-bafb-42a7-817b-03813d15afb8'::uuid, -- Dobel Debong Kulon RT 03 RW 04
  '137f1c1d-6827-4783-86bb-6fbdc778392c'::uuid, -- Dobel Debong Tengah RT 05 RW 06
  'e2ec7341-6f14-48a0-89c2-73d10368059e'::uuid, -- Dobel Kalinyamat Wetan RT 03 RW 01
  '31e8cd32-5776-4a2c-8552-127db1271f06'::uuid, -- Dobel Keturen RT 03 RW 03
  '1a751c90-16e5-41bc-82ff-97d9effae113'::uuid, -- Dobel Randugunting RT 02 RW 10
  'fe22007a-f1a9-4ef6-8a96-5625f55ec725'::uuid  -- Dobel Tunon RT 01 RW 01
);

-- 3.2 Hapus Komunitas Posyandu Kecamatan Duplikat
DELETE FROM public.komunitas
WHERE id IN (
  'c334b071-ea9d-4340-84cf-2d583095aa7a'::uuid, -- Posyandu Kec. Margadana duplikat
  'a5069904-747f-4318-8686-2af5f58c7414'::uuid, -- Posyandu Kec. Tegal Barat duplikat
  'f7f6a707-ea26-4702-861c-0cfa0b3297a7'::uuid, -- Posyandu Kec. Tegal Selatan duplikat
  'adca4334-912b-40fa-8c70-179ad2ae3a6c'::uuid  -- Posyandu Kec. Tegal Timur duplikat
);

-- 3.3 Hapus 307 Komunitas Kosong Anomali Pesurungan Kidul di Kecamatan Margadana (Resmi di Tegal Barat)
DELETE FROM public.anggota_komunitas
WHERE komunitas_id IN (
  SELECT id FROM public.komunitas
  WHERE LOWER(kelurahan) = 'pesurungan kidul' AND LOWER(kecamatan) LIKE '%margadana%'
);

DELETE FROM public.komunitas
WHERE LOWER(kelurahan) = 'pesurungan kidul' AND LOWER(kecamatan) LIKE '%margadana%';

-- 3.4 Hapus 313 Komunitas Kosong Anomali Kalinyamat Kulon di Kecamatan Tegal Selatan (Resmi di Margadana)
DELETE FROM public.anggota_komunitas
WHERE komunitas_id IN (
  SELECT id FROM public.komunitas
  WHERE LOWER(kelurahan) = 'kalinyamat kulon' AND LOWER(kecamatan) LIKE '%selatan%'
);

DELETE FROM public.komunitas
WHERE LOWER(kelurahan) = 'kalinyamat kulon' AND LOWER(kecamatan) LIKE '%selatan%';

COMMIT;
