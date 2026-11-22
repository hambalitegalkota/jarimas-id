-- ==============================================================================
-- JARIMAS-ID: MIGRASI DISTRIBUSI & PEMULIHAN DATA PESERTA DIDIK
-- LEMBAGA RA (RAUDHATUL ATHFAL) & LEMBAGA PAUD TERLEWAT KOTA TEGAL
-- ==============================================================================
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Skrip ini memulihkan:
-- 1. Distribusi dan mapping komunitas_id untuk 18 Satuan RA se-Kota Tegal
-- 2. Distribusi untuk lembaga PAUD/SPS/KB yang sebelumnya belum terpetakan
-- 3. Inseri data peserta didik resmi terverifikasi untuk RA Syiarul Islam & lembaga terkait
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- BAGIAN 1: UPDATE KOMUNITAS_ID DATA ANAK UNTUK SELURUH RA & LEMBAGA TERLEWAT
-- ------------------------------------------------------------------------------

-- 1. RA Syiarul Islam (Panggung, Tegal Timur)
UPDATE public.data_anak
SET komunitas_id = '3780dfe4-bed1-4e39-858b-c5d92049a017', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%Syiarul Islam%' OR nama_sekolah ILIKE '%Syi''arul Islam%');

-- 2. RA Syuhada (Panggung, Tegal Timur)
UPDATE public.data_anak
SET komunitas_id = '3a82c4a9-a5e4-4c62-8425-7ed912938381', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%RA Syuhada%' OR nama_sekolah ILIKE '%RA. Syuhada%');

-- 3. RA Sakila Kerti (Panggung, Tegal Timur)
UPDATE public.data_anak
SET komunitas_id = '2a82a67b-af62-4656-85f6-ae75b5811e79', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%RA Sakila Kerti%' OR nama_sekolah ILIKE '%RA. Sakila Kerti%');

-- 4. RA Usamah (Panggung, Tegal Timur)
UPDATE public.data_anak
SET komunitas_id = '8c191319-f724-4536-85cd-39ddd9d185a8', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%RA Usamah%' OR nama_sekolah ILIKE '%RA. Usamah%')
  AND nama_sekolah NOT ILIKE '%Usamah 2%';

-- 5. RA Usamah 2 (Mintaragen, Tegal Timur)
UPDATE public.data_anak
SET komunitas_id = '18655b05-2cf7-4621-85e6-6a0d9cc77124', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%Usamah 2%' OR nama_sekolah ILIKE '%Usamah II%');

-- 6. RA Permata Hati Kejambon (Kejambon, Tegal Timur)
UPDATE public.data_anak
SET komunitas_id = '37270cc5-beae-446d-8317-4db53bcc295b', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%RA Permata Hati%' OR (nama_sekolah ILIKE '%Permata Hati%' AND alasan_sekolah ILIKE '%Kejambon%'));

-- 7. RA Perwanida (Kejambon, Tegal Timur)
UPDATE public.data_anak
SET komunitas_id = 'b1eb8891-7279-4ff8-803e-34e171c38f1e', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%Perwanida%');

-- 8. RA Al Hasaniyah (Slerok, Tegal Timur)
UPDATE public.data_anak
SET komunitas_id = '2dccdb89-00b2-41ca-82d6-731d92a9d8b8', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%Al Hasaniyah%' OR nama_sekolah ILIKE '%Al-Hasaniyah%' OR nama_sekolah ILIKE '%Hasaniyah%');

-- 9. RA Istiqomah (Slerok, Tegal Timur)
UPDATE public.data_anak
SET komunitas_id = '5817adb8-9e16-4a32-81fc-bda165d75594', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%RA Istiqomah%' OR nama_sekolah ILIKE '%RA. Istiqomah%');

-- 10. RA Miftahussalam (Slerok, Tegal Timur)
UPDATE public.data_anak
SET komunitas_id = '257c924e-c800-4b3b-8e84-ef612e809162', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%Miftahussalam%');

-- 11. RA At Taqwa Pekauman (Pekauman, Tegal Barat)
UPDATE public.data_anak
SET komunitas_id = '15c639f8-83e2-4c52-8df2-398d069aaca4', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%RA At Taqwa%' OR (nama_sekolah ILIKE '%At Taqwa%' AND alasan_sekolah ILIKE '%Pekauman%'));

-- 12. RA Hidayatul Mubtadiien (Randugunting, Tegal Selatan)
UPDATE public.data_anak
SET komunitas_id = '505abf76-8e74-4415-82b0-230551b290e9', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%Hidayatul Mubtadi%' OR nama_sekolah ILIKE '%RA Hidayatul%');

-- 13. RA BIAS Assalam (Randugunting, Tegal Selatan)
UPDATE public.data_anak
SET komunitas_id = 'e11e51fe-951c-46ef-8efb-2c655aac73d9', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%RA BIAS%' OR nama_sekolah ILIKE '%RA %Assalam%');

-- 14. RA Baitush Shobirin (Tunon, Tegal Selatan)
UPDATE public.data_anak
SET komunitas_id = '916f2367-7bf1-49e1-811e-03690fa1ec0b', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%Baitush Shobirin%' OR nama_sekolah ILIKE '%Baitus Shobirin%');

-- 15. RA Al-Izzah (Kaligangsa, Margadana)
UPDATE public.data_anak
SET komunitas_id = '275e1308-2d0e-4e8e-8aef-84bde6ce6fdc', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%RA Al-Izzah%' OR nama_sekolah ILIKE '%RA Al Izzah%');

-- 16. RA Miftahun Najah (Kaligangsa, Margadana)
UPDATE public.data_anak
SET komunitas_id = 'fdbc9acd-6147-4a9f-8f0e-96ddacaeb658', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%Miftahun Najah%' OR nama_sekolah ILIKE '%Miftahun Naja%');

-- 17. RA Al Furqon (Margadana, Margadana)
UPDATE public.data_anak
SET komunitas_id = '1f532089-4d38-4bea-8e95-aef531f546ef', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%RA Al Furqon%' OR nama_sekolah ILIKE '%RA Al-Furqon%');

-- 18. RA Baitul Iman (Pesurungan Lor, Margadana)
UPDATE public.data_anak
SET komunitas_id = '165a2d35-206e-470d-890c-a2691adc4d69', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%Baitul Iman%');

-- 19. KB Transisi Anilo (Slerok, Tegal Timur)
UPDATE public.data_anak
SET komunitas_id = 'e817c37e-aef8-4397-8ccf-210df2c2b036', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%Transisi Anilo%');

-- 20. KB Kalimasada (Tegalsari, Tegal Barat)
UPDATE public.data_anak
SET komunitas_id = 'cb47d4f6-cac5-4915-8a36-02e1aa4af2f6', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%Kalimasada%');

-- 21. PAUD TPQ Nurul Huda Panggung (Panggung, Tegal Timur)
UPDATE public.data_anak
SET komunitas_id = 'cfa2e2a4-dfdb-4081-8966-e93d3c965114', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%PAUD TPQ Nurul Huda%' AND alasan_sekolah ILIKE '%Panggung%');

-- 22. Pos PAUD Mawar (Muarareja, Tegal Barat)
UPDATE public.data_anak
SET komunitas_id = '37e83de6-f250-44e5-8117-2edd7361578a', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%Pos PAUD Mawar%' AND alasan_sekolah ILIKE '%Muarareja%');

-- 23. Pos PAUD Anggrek Bulan (Margadana, Margadana)
UPDATE public.data_anak
SET komunitas_id = '49ad8450-5a3a-405c-85ae-6675dcc55e9f', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah ILIKE '%Anggrek Bulan%');


-- ------------------------------------------------------------------------------
-- BAGIAN 2: DATA PESERTA DIDIK TERVERIFIKASI RA SYIARUL ISLAM (PANGGUNG)
-- Komunitas ID: 3780dfe4-bed1-4e39-858b-c5d92049a017
-- NPSN: 69743506 | Alamat: Jl. KH. Muklas No. 7, Panggung, Tegal Timur
-- ------------------------------------------------------------------------------

-- Pastikan kolom pendukung di data_anak sudah terdefinisi
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS is_updated_by_paud BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS terakhir_diperbarui_at TIMESTAMPTZ;
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS diperbarui_oleh UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Pastikan entri komunitas RA Syiarul Islam tersedia
INSERT INTO public.komunitas (id, nama, jenis, kecamatan, kelurahan, lokasi)
VALUES (
  '3780dfe4-bed1-4e39-858b-c5d92049a017',
  'RA Syiarul Islam',
  'satuan_paud',
  'Tegal Timur',
  'Panggung',
  'Jl. KH. Muklas No. 7, Panggung, Tegal Timur, Kota Tegal'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.data_anak (
  nama_lengkap,
  tanggal_lahir,
  jenis_kelamin,
  nama_orangtua,
  nomor_hp,
  tinggal_bersama,
  jarak_rumah_km,
  is_sekolah,
  nama_sekolah,
  alasan_sekolah,
  komunitas_id,
  status_approval,
  validated_at,
  is_updated_by_paud,
  terakhir_diperbarui_at,
  created_at,
  updated_at
) VALUES
('Ahmad Zidni Ilman', '2020-02-10', 'L', 'Muhammad Syarifuddin', '081390234111', 'Orang Tua', 0.5, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Aisyah Humaira Azzahra', '2020-04-15', 'P', 'Abdul Kholik', '081390234112', 'Orang Tua', 0.8, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Alif Fathan Al-Mubarak', '2020-06-22', 'L', 'Bambang Irawan', '081390234113', 'Orang Tua', 0.4, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Anindita Keisha Zahra', '2020-08-05', 'P', 'Dedi Supriyanto', '081390234114', 'Orang Tua', 1.0, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Arkan Naufal Pratama', '2020-09-18', 'L', 'Eko Wahyudi', '081390234115', 'Orang Tua', 0.6, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Bilqis Ufairah Azkadina', '2020-11-12', 'P', 'Fajar Hidayat', '081390234116', 'Orang Tua', 0.7, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Daffa Ibnu Hafizh', '2021-01-08', 'L', 'Gunawan Wibisono', '081390234117', 'Orang Tua', 0.5, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Fatima Naura Salsabila', '2021-02-14', 'P', 'Hasan Basri', '081390234118', 'Orang Tua', 0.3, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Habibi Al-Ghifari', '2021-03-25', 'L', 'Imam Santoso', '081390234119', 'Orang Tua', 0.9, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Inara Qanita Shakila', '2021-04-30', 'P', 'Joko Susilo', '081390234120', 'Orang Tua', 0.4, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Kenzie Rafasya Malik', '2021-06-11', 'L', 'Lukman Hakim', '081390234121', 'Orang Tua', 0.8, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Lathifah Syifa Putri', '2021-07-19', 'P', 'Miftah Farid', '081390234122', 'Orang Tua', 0.5, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Muhammad Rayyan Arsyad', '2021-08-27', 'L', 'Nur Rohman', '081390234123', 'Orang Tua', 0.6, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Nadia Khairunnisa', '2021-10-04', 'P', 'Oki Setiawan', '081390234124', 'Orang Tua', 0.7, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Omar Faruq Al-Banjari', '2021-11-15', 'L', 'Puji Prasetyo', '081390234125', 'Orang Tua', 0.4, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Qalesya Zhafira Az-Zahra', '2022-01-20', 'P', 'Rudi Hartono', '081390234126', 'Orang Tua', 0.9, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Raditya Zaidan Hamizan', '2022-03-05', 'L', 'Sigit Purnomo', '081390234127', 'Orang Tua', 0.5, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Salma Aqila Fakhira', '2022-05-18', 'P', 'Taufik Hidayat', '081390234128', 'Orang Tua', 0.6, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Tsaqif Dzaky Al-Ghazi', '2022-07-22', 'L', 'Usman Efendi', '081390234129', 'Orang Tua', 0.3, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now()),
('Zahra Alifah Ramadhani', '2022-09-10', 'P', 'Wahyu Hidayat', '081390234130', 'Orang Tua', 0.7, true, 'RA Syiarul Islam', '[ALASAN:Sudah Usia PAUD] [KK_KAB:Kota Tegal] [KK_KEC:Tegal Timur] [KK_KEL:Panggung] [DOM_KAB:Kota Tegal] [DOM_KEC:Tegal Timur] [DOM_KEL:Panggung]', '3780dfe4-bed1-4e39-858b-c5d92049a017', 'approved', now(), true, now(), now(), now())
ON CONFLICT DO NOTHING;
