-- ==============================================================================
-- JARIMAS-ID: MIGRASI DISTRIBUSI DATA ANAK KE KOMUNITAS SATUAN PAUD
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- Skrip ini mengupdate komunitas_id pada tabel data_anak agar terdistribusi ke PAUD masing-masing
-- ==============================================================================

-- KB Aisyiyah Kejambon
UPDATE public.data_anak
SET komunitas_id = '1d486915-ff3b-4a99-890b-c1411859265e', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB AISYIYAH KEJAMBON' OR lower(trim(nama_sekolah)) = lower('KB AISYIYAH KEJAMBON'));

-- KB Al-Irsyad
UPDATE public.data_anak
SET komunitas_id = 'c1dbf59c-4c1d-4a6b-8e23-d729e366d68f', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB AL-IRSYAD' OR lower(trim(nama_sekolah)) = lower('KB AL-IRSYAD'));

-- KB Aisyiyah Anak Sholeh
UPDATE public.data_anak
SET komunitas_id = 'a8bb8c9b-07f3-431e-8097-68d586f9f245', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB AISYIYAH ANAK SHOLEH' OR lower(trim(nama_sekolah)) = lower('KB AISYIYAH ANAK SHOLEH'));

-- KB Al-Izzah
UPDATE public.data_anak
SET komunitas_id = '7dd32d02-9369-4368-85bc-727ddf642796', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB AL-IZZAH' OR lower(trim(nama_sekolah)) = lower('KB AL-IZZAH'));

-- KB Aisyiyah Baitul Karim
UPDATE public.data_anak
SET komunitas_id = 'e7875c3d-ee04-4ca7-8fc7-6d654f3068e7', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB AISYIYAH BAITUL KARIM' OR lower(trim(nama_sekolah)) = lower('KB AISYIYAH BAITUL KARIM'));

-- KB Amalia
UPDATE public.data_anak
SET komunitas_id = 'bfc2d859-7725-4be6-865b-2edd931b811c', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB AMALIA' OR lower(trim(nama_sekolah)) = lower('KB AMALIA'));

-- KB Ananda Mandiri
UPDATE public.data_anak
SET komunitas_id = '7f013f84-2684-46b5-8da8-81151ce9e6bb', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB ANANDA MANDIRI' OR lower(trim(nama_sekolah)) = lower('KB ANANDA MANDIRI'));

-- KB At-Taqwa
UPDATE public.data_anak
SET komunitas_id = '0af22a32-caa0-40ec-8be5-a6cdf8df23be', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB AT-TAQWA' OR lower(trim(nama_sekolah)) = lower('KB AT-TAQWA'));

-- KB Azzurofah
UPDATE public.data_anak
SET komunitas_id = '4f812e2e-35b3-4b4b-863b-0c19fb10c559', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB AZZUROFAH' OR lower(trim(nama_sekolah)) = lower('KB AZZUROFAH'));

-- KB Bias Assalam
UPDATE public.data_anak
SET komunitas_id = '3ed6ceb4-df21-4ab1-8311-2a8570ee5f97', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB BIAS ASSALAM' OR lower(trim(nama_sekolah)) = lower('KB BIAS ASSALAM'));

-- KB Bina Iman Anak Sholeh (BIAS) TB
UPDATE public.data_anak
SET komunitas_id = 'e001abba-d414-4cf2-886e-913577dbfcc5', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB BINA ANAK SHOLEH (BIAS) TB' OR lower(trim(nama_sekolah)) = lower('KB BINA ANAK SHOLEH (BIAS) TB'));

-- KB Bina Iman Anak Sholeh (BIAS) TT
UPDATE public.data_anak
SET komunitas_id = '6448b6d1-a2b6-4844-8595-ba29636faa7d', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB BINA ANAK SHOLEH (BIAS) TT' OR lower(trim(nama_sekolah)) = lower('KB BINA ANAK SHOLEH (BIAS) TT'));

-- KB Darul Kifaah
UPDATE public.data_anak
SET komunitas_id = '43ec7070-2eae-4de4-8155-0dd5e2533483', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB DARUL KIFAAH' OR lower(trim(nama_sekolah)) = lower('KB DARUL KIFAAH'));

-- KB Debong Kidul
UPDATE public.data_anak
SET komunitas_id = '67747f94-7327-4e95-8ae8-7c05d377a577', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB DEBONG KIDUL' OR lower(trim(nama_sekolah)) = lower('KB DEBONG KIDUL'));

-- KB Elfath Kids
UPDATE public.data_anak
SET komunitas_id = '56d6cab2-1618-4e0c-820d-ac81daa565ee', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB ELFATH KIDS' OR lower(trim(nama_sekolah)) = lower('KB ELFATH KIDS'));

-- KB Elkana
UPDATE public.data_anak
SET komunitas_id = '431518a1-b9bb-476c-8759-1285a98ce2cb', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB ELKANA' OR lower(trim(nama_sekolah)) = lower('KB ELKANA'));

-- KB Global Inbyra School
UPDATE public.data_anak
SET komunitas_id = 'ffc0485b-b7f2-48ca-821e-ede952af492f', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB GLOBAL INBYRA SCHOOL' OR lower(trim(nama_sekolah)) = lower('KB GLOBAL INBYRA SCHOOL'));

-- KB Hidayatul Mubtadi-ien
UPDATE public.data_anak
SET komunitas_id = '02f93111-e529-4a34-800a-70d9cfbbc07d', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB HIDAYATUL MUBTADI-IEN' OR lower(trim(nama_sekolah)) = lower('KB HIDAYATUL MUBTADI-IEN'));

-- KB Homeschooling ABC D
UPDATE public.data_anak
SET komunitas_id = '3e754fb7-e476-44a1-818a-0809a92a7d03', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB HOMESCHOOLING ABC D' OR lower(trim(nama_sekolah)) = lower('KB HOMESCHOOLING ABC D'));

-- KB Ihsaniyah 3
UPDATE public.data_anak
SET komunitas_id = 'e4bf87aa-96fe-433e-8c1f-9fc1d2fc8b76', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB IHSANIYAH 3' OR lower(trim(nama_sekolah)) = lower('KB IHSANIYAH 3'));

-- KB Insan Cerdas
UPDATE public.data_anak
SET komunitas_id = 'a9e9930f-1f8e-4753-8074-c8b96d72b217', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB INSAN CERDAS' OR lower(trim(nama_sekolah)) = lower('KB INSAN CERDAS'));

-- KB Insan Mandiri
UPDATE public.data_anak
SET komunitas_id = '2fcc93e0-3199-4b24-8186-0825335e2be7', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB INSAN MANDIRI' OR lower(trim(nama_sekolah)) = lower('KB INSAN MANDIRI'));

-- KB Islam Al Azhar 66 Kota Tegal
UPDATE public.data_anak
SET komunitas_id = 'bba016a0-bd1d-4738-8019-e19de6cfe544', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB ISLAM AL AZHAR 66 KOTA TEGAL' OR lower(trim(nama_sekolah)) = lower('KB ISLAM AL AZHAR 66 KOTA TEGAL'));

-- KB Istiqomah
UPDATE public.data_anak
SET komunitas_id = 'a730cab2-5679-4c74-8eb0-fe8150173506', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB ISTIQOMAH' OR lower(trim(nama_sekolah)) = lower('KB ISTIQOMAH'));

-- KB Jaya Lestari
UPDATE public.data_anak
SET komunitas_id = '59d7dcbb-9411-4fbe-8768-12bd2a4601b2', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB JAYA LESTARI' OR lower(trim(nama_sekolah)) = lower('KB JAYA LESTARI'));

-- KB Sofa Marwah
UPDATE public.data_anak
SET komunitas_id = 'cece6646-9bae-404d-8805-0171ff4f9cfa', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB SOFA MARWAH' OR lower(trim(nama_sekolah)) = lower('KB SOFA MARWAH'));

-- KB Kiddy Care
UPDATE public.data_anak
SET komunitas_id = '2c3035db-068f-48ba-867a-483d655e0a96', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB KIDDY CARE' OR lower(trim(nama_sekolah)) = lower('KB KIDDY CARE'));

-- KB Little Star
UPDATE public.data_anak
SET komunitas_id = '8b999637-20c5-41f9-8913-d5857e0009a9', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB LITTLE STAR' OR lower(trim(nama_sekolah)) = lower('KB LITTLE STAR'));

-- KB Mekar
UPDATE public.data_anak
SET komunitas_id = 'bd2b4a40-3ee7-4e64-8a59-2c0963b17f97', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB MEKAR' OR lower(trim(nama_sekolah)) = lower('KB MEKAR'));

-- KB Minat
UPDATE public.data_anak
SET komunitas_id = 'aac5e8fd-67b5-42d7-8676-29f58a52106f', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB MINAT' OR lower(trim(nama_sekolah)) = lower('KB MINAT'));

-- KB Mutiara Shahabat
UPDATE public.data_anak
SET komunitas_id = '6247e885-e1ab-4851-89ca-eb795b1cdc55', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB MUTIARA SHAHABAT' OR lower(trim(nama_sekolah)) = lower('KB MUTIARA SHAHABAT'));

-- KB Nurullah
UPDATE public.data_anak
SET komunitas_id = '5f4db20d-2606-449b-8f5d-5bb5a5a14697', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB NURULLAH' OR lower(trim(nama_sekolah)) = lower('KB NURULLAH'));

-- KB Nurunnisa
UPDATE public.data_anak
SET komunitas_id = '9fa42bf8-342a-4aa2-856b-b811e1fbdda8', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB NURUNNISA' OR lower(trim(nama_sekolah)) = lower('KB NURUNNISA'));

-- KB Pelita Bangsa
UPDATE public.data_anak
SET komunitas_id = '0330dba2-db2f-4d50-8551-cbed5ee01ca6', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB PELITA BANGSA' OR lower(trim(nama_sekolah)) = lower('KB PELITA BANGSA'));

-- KB Pelita Harapan Bangsa
UPDATE public.data_anak
SET komunitas_id = '66a19705-99ed-426d-89f6-1539f958401d', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB PELITA HARAPAN BANGSA' OR lower(trim(nama_sekolah)) = lower('KB PELITA HARAPAN BANGSA'));

-- KB Pelita Hati
UPDATE public.data_anak
SET komunitas_id = '092c437c-d2e1-49af-8906-1c09f486dc3f', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB PELITA HATI' OR lower(trim(nama_sekolah)) = lower('KB PELITA HATI'));

-- KB Permata Hati
UPDATE public.data_anak
SET komunitas_id = 'd1e30c58-b32f-4e8e-86b3-f7b526c0db17', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB PERMATA HATI' OR lower(trim(nama_sekolah)) = lower('KB PERMATA HATI'));

-- KB Pius
UPDATE public.data_anak
SET komunitas_id = '74c7a1b2-8f48-44ec-867f-eda51b1bdb61', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB PIUS' OR lower(trim(nama_sekolah)) = lower('KB PIUS'));

-- KB Prima Universal
UPDATE public.data_anak
SET komunitas_id = '07da5037-80e7-45b9-801a-32b9a903e66f', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB PRIMA UNIVERSAL' OR lower(trim(nama_sekolah)) = lower('KB PRIMA UNIVERSAL'));

-- KB Primagama Islami
UPDATE public.data_anak
SET komunitas_id = '785791f3-5c7e-4aa0-85e2-57ad7a451896', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB PRIMAGAMA ISLAMI' OR lower(trim(nama_sekolah)) = lower('KB PRIMAGAMA ISLAMI'));

-- KB Qurrota A'yun
UPDATE public.data_anak
SET komunitas_id = '5312b83a-14da-4ee2-8e6b-385db87b7122', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB QURROTA A YUN' OR lower(trim(nama_sekolah)) = lower('KB QURROTA A YUN'));

-- KB Raudlotul Jannah
UPDATE public.data_anak
SET komunitas_id = '6e84ae83-ca26-4438-8884-eccd35363b72', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB RAUDLOTUL JANNAH' OR lower(trim(nama_sekolah)) = lower('KB RAUDLOTUL JANNAH'));

-- KB Riyaadul Jannah
UPDATE public.data_anak
SET komunitas_id = '2e77393f-00a2-45f3-8f8b-f5b195a263cc', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB RIYAADUL JANNAH' OR lower(trim(nama_sekolah)) = lower('KB RIYAADUL JANNAH'));

-- KB Rumah Bintang
UPDATE public.data_anak
SET komunitas_id = 'dfffdb75-764d-4ded-8f46-b6653c6376eb', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB RUMAH BINTANG' OR lower(trim(nama_sekolah)) = lower('KB RUMAH BINTANG'));

-- KB Sakila Kerti
UPDATE public.data_anak
SET komunitas_id = '242364b1-bb61-4188-8da4-f095be00880f', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB SAKILA KERTI' OR lower(trim(nama_sekolah)) = lower('KB SAKILA KERTI'));

-- KB Sekar Kemuning
UPDATE public.data_anak
SET komunitas_id = 'f08f64a9-ac0c-40f6-8198-e329af951121', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB SEKAR KEMUNING' OR lower(trim(nama_sekolah)) = lower('KB SEKAR KEMUNING'));

-- KB Syi'arul Islam
UPDATE public.data_anak
SET komunitas_id = 'f2e889e9-7024-4ee2-8760-212d3cc63f48', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB SYI ARUL ISLAM' OR lower(trim(nama_sekolah)) = lower('KB SYI ARUL ISLAM'));

-- KB Syuhada
UPDATE public.data_anak
SET komunitas_id = '8fab5ec3-b9d5-4cfc-8ee4-3df9d36e7617', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB SYUHADA' OR lower(trim(nama_sekolah)) = lower('KB SYUHADA'));

-- KB Telaga Ilmu
UPDATE public.data_anak
SET komunitas_id = '5621f619-402b-442a-8013-42e56748f9ef', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB TELAGA ILMU' OR lower(trim(nama_sekolah)) = lower('KB TELAGA ILMU'));

-- KB Tunas Harapan Bangsa
UPDATE public.data_anak
SET komunitas_id = 'f1e108f0-59c4-4af4-8aa2-6e45179a37d3', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB TUNAS HARAPAN BANGSA' OR lower(trim(nama_sekolah)) = lower('KB TUNAS HARAPAN BANGSA'));

-- KB Tunas Hidup Harapan Kita
UPDATE public.data_anak
SET komunitas_id = 'f0c4c9b0-d522-4744-84fd-bfa92329da0b', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB TUNAS HIDUP HARAPAN KITA' OR lower(trim(nama_sekolah)) = lower('KB TUNAS HIDUP HARAPAN KITA'));

-- KB Aisyiyah Tegal Barat
UPDATE public.data_anak
SET komunitas_id = '548b49e9-6f8f-4102-8c70-28ad49f01ee0', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB. AISYIYAH TEGAL BARAT' OR lower(trim(nama_sekolah)) = lower('KB. AISYIYAH TEGAL BARAT'));

-- KB Ihsaniyah 1
UPDATE public.data_anak
SET komunitas_id = '90640e5b-7d2d-462e-8716-e5f13a0b4478', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB. IHSANIYAH 1' OR lower(trim(nama_sekolah)) = lower('KB. IHSANIYAH 1'));

-- KB Sekar Melati
UPDATE public.data_anak
SET komunitas_id = '1af0c1cb-41b6-4346-8f87-752576a648a5', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB. SEKAR MELATI' OR lower(trim(nama_sekolah)) = lower('KB. SEKAR MELATI'));

-- KB Tarbiyatul Khasanah
UPDATE public.data_anak
SET komunitas_id = '5f9a436c-1368-40a3-8cf4-da996c30461b', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KB. TARBIYATUL KHASANAH' OR lower(trim(nama_sekolah)) = lower('KB. TARBIYATUL KHASANAH'));

-- KBI Usamah
UPDATE public.data_anak
SET komunitas_id = '5464192a-1ac9-49c6-820f-b4e11b9460c2', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'KBI USAMAH' OR lower(trim(nama_sekolah)) = lower('KBI USAMAH'));

-- PAUD TPQ Al-Hikmah
UPDATE public.data_anak
SET komunitas_id = 'dc1c8234-45ee-4d7d-8233-293958f6d467', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'PAUD TPQ AL-HIKMAH' OR lower(trim(nama_sekolah)) = lower('PAUD TPQ AL-HIKMAH'));

-- PAUD TPQ Al-Izzah
UPDATE public.data_anak
SET komunitas_id = 'b5c9a463-4297-4ab4-8728-bebdaa19d692', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'PAUD TPQ AL-IZZAH' OR lower(trim(nama_sekolah)) = lower('PAUD TPQ AL-IZZAH'));

-- PAUD TPQ Al-Mukhlishin
UPDATE public.data_anak
SET komunitas_id = '2205706e-2c37-43b7-8c60-23659f6e6db1', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'PAUD TPQ AL-MUKHLISHIN' OR lower(trim(nama_sekolah)) = lower('PAUD TPQ AL-MUKHLISHIN'));

-- PAUD TPQ Al-Munawwaroh
UPDATE public.data_anak
SET komunitas_id = '9f8c8b70-492e-47c4-8007-b57508df1eab', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'PAUD TPQ AL-MUNAWWAROH' OR lower(trim(nama_sekolah)) = lower('PAUD TPQ AL-MUNAWWAROH'));

-- PAUD TPQ At Taqwa
UPDATE public.data_anak
SET komunitas_id = '973faf52-ffd0-451c-87cf-5461b003057a', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'PAUD TPQ AT TAQWA' OR lower(trim(nama_sekolah)) = lower('PAUD TPQ AT TAQWA'));

-- PAUD TPQ Ath Thohiriyah
UPDATE public.data_anak
SET komunitas_id = '08f6cd27-44b7-4071-819e-532d4c54569a', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'PAUD TPQ ATH THOHIRIYAH' OR lower(trim(nama_sekolah)) = lower('PAUD TPQ ATH THOHIRIYAH'));

-- PAUD TPQ Fahmal Qur'an
UPDATE public.data_anak
SET komunitas_id = '4ec999e6-6fbb-4ce9-883e-84c513da2fb5', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'PAUD TPQ FAHMAL QUR`AN' OR lower(trim(nama_sekolah)) = lower('PAUD TPQ FAHMAL QUR`AN'));

-- PAUD TPQ Plus Insan Kamil
UPDATE public.data_anak
SET komunitas_id = '98de5444-3cde-4c41-83ba-6771f425d3b4', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'PAUD TPQ PLUS INSAN KAMIL' OR lower(trim(nama_sekolah)) = lower('PAUD TPQ PLUS INSAN KAMIL'));

-- PKBM Star of Tomorrow
UPDATE public.data_anak
SET komunitas_id = '74e6f803-6de9-4128-801a-b589c842bcf3', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'PKBM STAR OF TOMORROW' OR lower(trim(nama_sekolah)) = lower('PKBM STAR OF TOMORROW'));

-- Pos PAUD Al Maemunah
UPDATE public.data_anak
SET komunitas_id = '003b3db6-f88c-40a5-81f7-2859807fdc5d', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD AL MAEMUNAH' OR lower(trim(nama_sekolah)) = lower('POS PAUD AL MAEMUNAH'));

-- Pos PAUD Anggrek
UPDATE public.data_anak
SET komunitas_id = 'a6450729-ac40-461a-8b91-e1b1f24c6cf6', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD ANGGREK' OR lower(trim(nama_sekolah)) = lower('POS PAUD ANGGREK'));

-- Pos PAUD Sekar Melati
UPDATE public.data_anak
SET komunitas_id = 'd7366691-3515-497c-8956-cb299412f69d', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD SEKAR MELATI TEGALSARI' OR lower(trim(nama_sekolah)) = lower('POS PAUD SEKAR MELATI TEGALSARI'));

-- Pos PAUD Anggrek
UPDATE public.data_anak
SET komunitas_id = 'a6450729-ac40-461a-8b91-e1b1f24c6cf6', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD ANGGREK BULAN' OR lower(trim(nama_sekolah)) = lower('POS PAUD ANGGREK BULAN'));

-- Pos PAUD Anyelir
UPDATE public.data_anak
SET komunitas_id = '44e3656c-6d82-4487-8e62-6b9902460af7', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD ANYELIR' OR lower(trim(nama_sekolah)) = lower('POS PAUD ANYELIR'));

-- Pos PAUD Balita Jaya
UPDATE public.data_anak
SET komunitas_id = '812a1214-47b2-4621-82b3-c451159f9234', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD BALITA JAYA' OR lower(trim(nama_sekolah)) = lower('POS PAUD BALITA JAYA'));

-- Pos PAUD Bianglala
UPDATE public.data_anak
SET komunitas_id = '760ea246-7024-4eb5-8ea4-5e0593ce1305', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD BIANGLALA' OR lower(trim(nama_sekolah)) = lower('POS PAUD BIANGLALA'));

-- Pos PAUD Delima
UPDATE public.data_anak
SET komunitas_id = 'c6e73c38-b1e7-41de-8871-d8dde221f038', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD DELIMA' OR lower(trim(nama_sekolah)) = lower('POS PAUD DELIMA'));

-- Pos PAUD Bougenville Margadana
UPDATE public.data_anak
SET komunitas_id = '02d21fab-0ac8-45e6-8dd4-470d68cef05e', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD BOUGENVILLE MARGADANA' OR lower(trim(nama_sekolah)) = lower('POS PAUD BOUGENVILLE MARGADANA'));

-- Pos PAUD Bougenville Tegalsari
UPDATE public.data_anak
SET komunitas_id = 'fbe0de9b-569d-4732-890e-f4e58748e761', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD BOUGENVILLE TEGALSARI' OR lower(trim(nama_sekolah)) = lower('POS PAUD BOUGENVILLE TEGALSARI'));

-- Pos PAUD Cermai
UPDATE public.data_anak
SET komunitas_id = 'cc476c7b-6b2e-4342-87f0-38815da9dc08', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD CERMAI' OR lower(trim(nama_sekolah)) = lower('POS PAUD CERMAI'));

-- Pos PAUD Dewi Sartika Kraton
UPDATE public.data_anak
SET komunitas_id = '03097b50-59c3-4d14-8037-0621eb03733c', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD DEWI SARTIKA KRATON' OR lower(trim(nama_sekolah)) = lower('POS PAUD DEWI SARTIKA KRATON'));

-- Pos PAUD Dewi Sartika Debong Kulon
UPDATE public.data_anak
SET komunitas_id = '850f80e4-b8a5-43d1-823e-09b921c9605b', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD DEWI SARTIKA DEBONG KULON' OR lower(trim(nama_sekolah)) = lower('POS PAUD DEWI SARTIKA DEBONG KULON'));

-- Pos PAUD Insan Cendikia
UPDATE public.data_anak
SET komunitas_id = '10831026-b7bd-48cd-89b1-ebbd96867452', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD INSAN CENDIKIA' OR lower(trim(nama_sekolah)) = lower('POS PAUD INSAN CENDIKIA'));

-- Pos PAUD Kartini
UPDATE public.data_anak
SET komunitas_id = '21283b97-a8a0-4031-8641-2349ad207e87', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD KARTINI KRATON' OR lower(trim(nama_sekolah)) = lower('POS PAUD KARTINI KRATON'));

-- Pos PAUD Kartini RW. VI
UPDATE public.data_anak
SET komunitas_id = '3ff83fb1-b19c-45c8-871a-a6bd264d56c0', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD KARTINI RW. VI SLEROK' OR lower(trim(nama_sekolah)) = lower('POS PAUD KARTINI RW. VI SLEROK'));

-- Pos PAUD Kenanga Mintaragen
UPDATE public.data_anak
SET komunitas_id = 'a505ba0f-6837-49cb-8fc6-ed1d7b9f65e2', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD KENANGA MINTARAGEN' OR lower(trim(nama_sekolah)) = lower('POS PAUD KENANGA MINTARAGEN'));

-- Pos PAUD Kenanga Kemandungan
UPDATE public.data_anak
SET komunitas_id = 'f397f77c-eb3b-4be7-8674-af7d082f8c88', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD KENANGA KEMANDUNGAN' OR lower(trim(nama_sekolah)) = lower('POS PAUD KENANGA KEMANDUNGAN'));

-- Pos PAUD Kenanga Kraton
UPDATE public.data_anak
SET komunitas_id = '5c629cfc-94bf-4453-8406-3bf516deef93', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD KENANGA KRATON' OR lower(trim(nama_sekolah)) = lower('POS PAUD KENANGA KRATON'));

-- Pos PAUD Kesambi Sari
UPDATE public.data_anak
SET komunitas_id = 'bf023524-9e9d-4b3d-8b85-47498c34f4f7', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD KESAMBI SARI' OR lower(trim(nama_sekolah)) = lower('POS PAUD KESAMBI SARI'));

-- Pos PAUD Mawar Merah
UPDATE public.data_anak
SET komunitas_id = '7033308c-e4cd-44d7-872c-4e458e7324cf', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD MAWAR' OR lower(trim(nama_sekolah)) = lower('POS PAUD MAWAR'));

-- Pos PAUD Mawar Merah
UPDATE public.data_anak
SET komunitas_id = '7033308c-e4cd-44d7-872c-4e458e7324cf', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD MAWAR MERAH' OR lower(trim(nama_sekolah)) = lower('POS PAUD MAWAR MERAH'));

-- Pos PAUD Mekar Sari
UPDATE public.data_anak
SET komunitas_id = '204b041f-90f9-49ff-8585-10bd7e02cade', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD MEKAR SARI' OR lower(trim(nama_sekolah)) = lower('POS PAUD MEKAR SARI'));

-- Pos PAUD Melati Kalinyamat Kulon
UPDATE public.data_anak
SET komunitas_id = '0ff55749-ba50-421e-8636-5cc96ea8ada1', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD MELATI KALINYAMAT KULON' OR lower(trim(nama_sekolah)) = lower('POS PAUD MELATI KALINYAMAT KULON'));

-- Pos PAUD Melati Pesurungan Kidul
UPDATE public.data_anak
SET komunitas_id = '13f83ced-6560-4513-8acc-d2510726c7e6', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD MELATI PESURUNGAN KIDUL' OR lower(trim(nama_sekolah)) = lower('POS PAUD MELATI PESURUNGAN KIDUL'));

-- Pos PAUD Melati Sari
UPDATE public.data_anak
SET komunitas_id = '2d5613d6-67ea-40e9-860a-74655bd160e9', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD MELATI SARI' OR lower(trim(nama_sekolah)) = lower('POS PAUD MELATI SARI'));

-- Pos PAUD Nusa Indah
UPDATE public.data_anak
SET komunitas_id = '420dda76-64f4-4221-82ab-9a5dcd41116a', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD NUSA INDAH' OR lower(trim(nama_sekolah)) = lower('POS PAUD NUSA INDAH'));

-- Pos PAUD Sakura
UPDATE public.data_anak
SET komunitas_id = '4bc1f105-5aeb-46c9-8472-83855c9520b7', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD SAKURA' OR lower(trim(nama_sekolah)) = lower('POS PAUD SAKURA'));

-- Pos PAUD Sejahtera
UPDATE public.data_anak
SET komunitas_id = 'f7ff695e-b2cd-4287-82de-8dad883f812a', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD SEJAHTERA' OR lower(trim(nama_sekolah)) = lower('POS PAUD SEJAHTERA'));

-- Pos PAUD Sekar Kamboja
UPDATE public.data_anak
SET komunitas_id = 'ede81ba2-98e5-474c-8a2f-a131b41f43ee', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD SEKAR KAMBOJA' OR lower(trim(nama_sekolah)) = lower('POS PAUD SEKAR KAMBOJA'));

-- Pos PAUD Seruni Panggung
UPDATE public.data_anak
SET komunitas_id = '7a4bd770-6ee6-4e30-88e6-cd89ef9a64eb', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD SERUNI PANGGUNG' OR lower(trim(nama_sekolah)) = lower('POS PAUD SERUNI PANGGUNG'));

-- Pos PAUD Seruni Debong Lor
UPDATE public.data_anak
SET komunitas_id = 'b6dc28f3-8980-4f28-8049-b34114fc4eb4', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD SERUNI DEBONG LOR' OR lower(trim(nama_sekolah)) = lower('POS PAUD SERUNI DEBONG LOR'));

-- Pos PAUD Seruni Sumurpanggang
UPDATE public.data_anak
SET komunitas_id = 'b6c60b13-f707-4e7c-85a7-3ca1541b0440', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD SERUNI SUMURPANGGANG' OR lower(trim(nama_sekolah)) = lower('POS PAUD SERUNI SUMURPANGGANG'));

-- Pos PAUD Sumbodro
UPDATE public.data_anak
SET komunitas_id = 'c3045b68-af75-4042-8a14-aa5d35a71948', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD SUMBODRO' OR lower(trim(nama_sekolah)) = lower('POS PAUD SUMBODRO'));

-- Pos PAUD Tunas Bangsa
UPDATE public.data_anak
SET komunitas_id = '71521343-636b-4e30-8094-e199838a6c3b', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD TUNAS BANGSA' OR lower(trim(nama_sekolah)) = lower('POS PAUD TUNAS BANGSA'));

-- Pos PAUD Tunas Ceria
UPDATE public.data_anak
SET komunitas_id = '3405c9ad-8e32-4fcf-87eb-b1bd3f59893c', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD TUNAS CERIA' OR lower(trim(nama_sekolah)) = lower('POS PAUD TUNAS CERIA'));

-- Pos PAUD Tunas Harapan Krandon
UPDATE public.data_anak
SET komunitas_id = 'afb26340-99ee-4ee8-8438-b47d6ff9821c', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD TUNAS HARAPAN KRANDON' OR lower(trim(nama_sekolah)) = lower('POS PAUD TUNAS HARAPAN KRANDON'));

-- Pos PAUD Tunas Harapan Randugunting
UPDATE public.data_anak
SET komunitas_id = 'a9bbb224-9db2-4f39-8c79-79d5fd703b93', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD TUNAS HARAPAN RANDUGUNTING' OR lower(trim(nama_sekolah)) = lower('POS PAUD TUNAS HARAPAN RANDUGUNTING'));

-- Pos PAUD Tunas Muda
UPDATE public.data_anak
SET komunitas_id = '01f810f6-da56-44b9-8c3b-06497e38c6ed', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD TUNAS MUDA' OR lower(trim(nama_sekolah)) = lower('POS PAUD TUNAS MUDA'));

-- Pos PAUD Tunas Mutiara
UPDATE public.data_anak
SET komunitas_id = '506aaf35-cbe4-46d9-85e1-bb3d4951f19c', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD TUNAS MUTIARA' OR lower(trim(nama_sekolah)) = lower('POS PAUD TUNAS MUTIARA'));

-- Pos PAUD Werkudoro
UPDATE public.data_anak
SET komunitas_id = 'c53fe2ef-a929-4eb7-8887-c5419c4e9038', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'POS PAUD WERKUDORO' OR lower(trim(nama_sekolah)) = lower('POS PAUD WERKUDORO'));

-- SPS PAUD TPQ Tahfidz Cahaya Quran
UPDATE public.data_anak
SET komunitas_id = '6f1da60a-5c18-4b26-8cbe-4c0d09c29a5a', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'SPS PAUD TPQ TAHFIDZ CAHAYA QURAN' OR lower(trim(nama_sekolah)) = lower('SPS PAUD TPQ TAHFIDZ CAHAYA QURAN'));

-- TK Aisyiyah BA IX
UPDATE public.data_anak
SET komunitas_id = 'a02f65ff-ae6a-40cb-8cd9-fc1d8a094c8a', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AISYIYAH BA IX' OR lower(trim(nama_sekolah)) = lower('TK AISYIYAH BA IX'));

-- TK Aisyiyah Bustanul Athfal I
UPDATE public.data_anak
SET komunitas_id = 'fa0cb4ab-a5b7-4eb6-8243-90698cab0f4b', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AISYIYAH BUSTANUL ATHFAL I' OR lower(trim(nama_sekolah)) = lower('TK AISYIYAH BUSTANUL ATHFAL I'));

-- TK Aisyiyah Bustanul Athfal II
UPDATE public.data_anak
SET komunitas_id = 'd621a5d0-71e7-4d98-8ca9-1359a8409e0f', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AISYIYAH BUSTANUL ATHFAL II' OR lower(trim(nama_sekolah)) = lower('TK AISYIYAH BUSTANUL ATHFAL II'));

-- TK Aisyiyah Bustanul Athfal III
UPDATE public.data_anak
SET komunitas_id = 'a6039321-6de7-4fac-83bb-b2b55fa24677', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AISYIYAH BUSTANUL ATHFAL III' OR lower(trim(nama_sekolah)) = lower('TK AISYIYAH BUSTANUL ATHFAL III'));

-- TK Aisyiyah Bustanul Athfal IV
UPDATE public.data_anak
SET komunitas_id = 'b0c0d03f-1619-403b-8b7c-0479985d808b', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AISYIYAH BUSTANUL ATHFAL IV' OR lower(trim(nama_sekolah)) = lower('TK AISYIYAH BUSTANUL ATHFAL IV'));

-- TK Aisyiyah Bustanul Athfal V
UPDATE public.data_anak
SET komunitas_id = 'bfe994fe-90ed-4e3f-86a5-cea5b8bad415', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AISYIYAH BUSTANUL ATHFAL V' OR lower(trim(nama_sekolah)) = lower('TK AISYIYAH BUSTANUL ATHFAL V'));

-- TK Aisyiyah Bustanul Athfal VI
UPDATE public.data_anak
SET komunitas_id = '6d97394f-221d-4ea7-89c3-31a95d41e557', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AISYIYAH BUSTANUL ATHFAL VI' OR lower(trim(nama_sekolah)) = lower('TK AISYIYAH BUSTANUL ATHFAL VI'));

-- TK Aisyiyah Bustanul Athfal VII
UPDATE public.data_anak
SET komunitas_id = '7324c5a5-1d8e-47b1-8d8a-af2df446ced8', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AISYIYAH BUSTANUL ATHFAL VII' OR lower(trim(nama_sekolah)) = lower('TK AISYIYAH BUSTANUL ATHFAL VII'));

-- TK Aisyiyah Bustanul Athfal VIII
UPDATE public.data_anak
SET komunitas_id = 'e22b4fb2-0d5b-4114-88ec-40f113835b3a', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AISYIYAH BUSTANUL ATHFAL VIII' OR lower(trim(nama_sekolah)) = lower('TK AISYIYAH BUSTANUL ATHFAL VIII'));

-- TK Aisyiyah Bustanul Athfal X
UPDATE public.data_anak
SET komunitas_id = 'bea91693-c6f9-4bc4-814e-a9814bbf7a6c', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AISYIYAH BUSTANUL ATHFAL X' OR lower(trim(nama_sekolah)) = lower('TK AISYIYAH BUSTANUL ATHFAL X'));

-- TK Aisyiyah Bustanul Athfal XI
UPDATE public.data_anak
SET komunitas_id = 'a8e2f569-cc38-41a2-88a7-86797d74e3c9', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AISYIYAH BUSTANUL ATHFAL XI' OR lower(trim(nama_sekolah)) = lower('TK AISYIYAH BUSTANUL ATHFAL XI'));

-- TK Aisyiyah Bustanul Athfal XII
UPDATE public.data_anak
SET komunitas_id = '8ab555a8-0cf2-42ee-8c47-d89d6d834100', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AISYIYAH BUSTANUL ATHFAL XII' OR lower(trim(nama_sekolah)) = lower('TK AISYIYAH BUSTANUL ATHFAL XII'));

-- TK Aisyiyah Bustanul Athfal XIII
UPDATE public.data_anak
SET komunitas_id = 'fcf7faa0-0863-4f30-833f-cfa51c460727', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AISYIYAH BUSTANUL ATHFAL XIII' OR lower(trim(nama_sekolah)) = lower('TK AISYIYAH BUSTANUL ATHFAL XIII'));

-- TK Al Hidayah 1
UPDATE public.data_anak
SET komunitas_id = 'e7b7f6fd-5d93-4fdf-8625-a9dd8fd309e0', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AL HIDAYAH 1' OR lower(trim(nama_sekolah)) = lower('TK AL HIDAYAH 1'));

-- TK Al Hidayah II
UPDATE public.data_anak
SET komunitas_id = '25066e1f-e9af-425f-8fd0-7b397c5083a3', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AL HIDAYAH II' OR lower(trim(nama_sekolah)) = lower('TK AL HIDAYAH II'));

-- TK Al Khairiyyah
UPDATE public.data_anak
SET komunitas_id = '1be8f7d2-adec-4b90-8e1d-4141a2c7ce46', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AL KHAIRIYYAH' OR lower(trim(nama_sekolah)) = lower('TK AL KHAIRIYYAH'));

-- TK Al Khidmah
UPDATE public.data_anak
SET komunitas_id = '14c1df71-6f4f-48c0-809a-1981ee0ad7f2', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AL KHIDMAH' OR lower(trim(nama_sekolah)) = lower('TK AL KHIDMAH'));

-- TK Al Quran Al Haromain
UPDATE public.data_anak
SET komunitas_id = '14de368c-7178-46e7-80f7-e3e5e46bd787', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AL QURAN AL HAROMAIN' OR lower(trim(nama_sekolah)) = lower('TK AL QURAN AL HAROMAIN'));

-- TK Al-Irsyad Al-Islamiyah
UPDATE public.data_anak
SET komunitas_id = 'f0e8a594-839f-43ed-8d25-f2f50f5b3e33', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK AL-IRSYAD AL-ISLAMIYAH' OR lower(trim(nama_sekolah)) = lower('TK AL-IRSYAD AL-ISLAMIYAH'));

-- TK Assyifa
UPDATE public.data_anak
SET komunitas_id = '9263e3cd-ce0d-4ea7-8933-4e0162b3bfc6', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK ASSYIFA' OR lower(trim(nama_sekolah)) = lower('TK ASSYIFA'));

-- TK Bagya Wacana
UPDATE public.data_anak
SET komunitas_id = '01f7b1d4-03e2-4d39-873a-c0dd17207300', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK BAGYA WACANA' OR lower(trim(nama_sekolah)) = lower('TK BAGYA WACANA'));

-- TK Baiturrokhman
UPDATE public.data_anak
SET komunitas_id = '17d7dc3e-f113-4a1f-856f-caad9182cea2', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK BAITURROKHMAN' OR lower(trim(nama_sekolah)) = lower('TK BAITURROKHMAN'));

-- TK Cendrawasih
UPDATE public.data_anak
SET komunitas_id = '0839aa15-c60b-4441-85de-59495ce935b5', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK CENDRAWASIH' OR lower(trim(nama_sekolah)) = lower('TK CENDRAWASIH'));

-- TK Darunnajah
UPDATE public.data_anak
SET komunitas_id = '2ab65909-f7db-49a6-874b-9415f59c086f', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK DARUNNAJAH' OR lower(trim(nama_sekolah)) = lower('TK DARUNNAJAH'));

-- TK Elkana
UPDATE public.data_anak
SET komunitas_id = '702a31a7-2c1d-4c45-89bc-754537c2e5a9', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK ELKANA' OR lower(trim(nama_sekolah)) = lower('TK ELKANA'));

-- TK Global Inbyra School
UPDATE public.data_anak
SET komunitas_id = 'd0b819dd-6909-4633-89d0-a1997242cb6d', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK GLOBAL INBYRA SCHOOL' OR lower(trim(nama_sekolah)) = lower('TK GLOBAL INBYRA SCHOOL'));

-- TK Hang Tuah 16
UPDATE public.data_anak
SET komunitas_id = '864bf4b1-ce62-41ac-80f5-d66520481a0f', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK HANG TUAH 16' OR lower(trim(nama_sekolah)) = lower('TK HANG TUAH 16'));

-- TK Ihsaniyah 1
UPDATE public.data_anak
SET komunitas_id = '6af8efdd-28b1-4343-8e77-c251063f3b42', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK IHSANIYAH 1' OR lower(trim(nama_sekolah)) = lower('TK IHSANIYAH 1'));

-- TK Ihsaniyah III
UPDATE public.data_anak
SET komunitas_id = 'f2bca6c6-e153-4845-8a32-3909a756d8d5', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK IHSANIYAH III' OR lower(trim(nama_sekolah)) = lower('TK IHSANIYAH III'));

-- TK Islam Al Azhar 66 Kota Tegal
UPDATE public.data_anak
SET komunitas_id = 'd993e306-4d52-4d49-8952-c8bd0558f45e', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK ISLAM AL AZHAR 66 KOTA TEGAL' OR lower(trim(nama_sekolah)) = lower('TK ISLAM AL AZHAR 66 KOTA TEGAL'));

-- TK Islam Ash Sholihin
UPDATE public.data_anak
SET komunitas_id = '1711ba58-d049-4f22-855e-c9457c5cb697', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK ISLAM ASH SHOLIHIN' OR lower(trim(nama_sekolah)) = lower('TK ISLAM ASH SHOLIHIN'));

-- TK Islam Azzurofah
UPDATE public.data_anak
SET komunitas_id = 'd473fe5f-897e-4543-89e8-6f29a6eb2287', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK ISLAM AZZUROFAH' OR lower(trim(nama_sekolah)) = lower('TK ISLAM AZZUROFAH'));

-- TK Kartika III-28
UPDATE public.data_anak
SET komunitas_id = 'c8a928ca-de31-415a-8fe3-95b5b2ad050d', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK KARTIKA 111-28' OR lower(trim(nama_sekolah)) = lower('TK KARTIKA 111-28'));

-- TK Kemala Bhayangkari 25
UPDATE public.data_anak
SET komunitas_id = '5236b128-a832-49f2-80ac-16ade07522f0', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK KEMALA BHAYANGKARI 25' OR lower(trim(nama_sekolah)) = lower('TK KEMALA BHAYANGKARI 25'));

-- TK Kiddy Care
UPDATE public.data_anak
SET komunitas_id = '86625afd-4d61-48bb-88cd-d9bdf540501c', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK KIDDY CARE' OR lower(trim(nama_sekolah)) = lower('TK KIDDY CARE'));

-- TK Little Star
UPDATE public.data_anak
SET komunitas_id = '402b25de-13bc-4bdb-861e-7b298e2449e5', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK LITTLE STAR KRATON' OR lower(trim(nama_sekolah)) = lower('TK LITTLE STAR KRATON'));

-- TK Masyithoh 1
UPDATE public.data_anak
SET komunitas_id = 'ce12aa5e-b45a-4c5f-824a-817937e41635', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK MASYITHOH 1' OR lower(trim(nama_sekolah)) = lower('TK MASYITHOH 1'));

-- TK Masyithoh II
UPDATE public.data_anak
SET komunitas_id = 'bc8ca2f7-0b1d-4149-8e35-5d958172c0d9', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK MASYITHOH II' OR lower(trim(nama_sekolah)) = lower('TK MASYITHOH II'));

-- TK Masyithoh III
UPDATE public.data_anak
SET komunitas_id = '0b5b1aa4-ba92-4e15-8f9e-60f5c8cc973f', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK MASYITHOH III' OR lower(trim(nama_sekolah)) = lower('TK MASYITHOH III'));

-- TK Masyithoh IV
UPDATE public.data_anak
SET komunitas_id = '3e3bb7b8-ed7d-438a-8be1-155d23947f54', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK MASYITHOH IV' OR lower(trim(nama_sekolah)) = lower('TK MASYITHOH IV'));

-- TK Masyithoh V
UPDATE public.data_anak
SET komunitas_id = '3decca53-02e5-46d0-8138-ebdde7ee1622', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK MASYITHOH V' OR lower(trim(nama_sekolah)) = lower('TK MASYITHOH V'));

-- TK Masyithoh VI
UPDATE public.data_anak
SET komunitas_id = 'ade56720-8c17-4fb0-8314-73bd7572bcd4', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK MASYITHOH VI' OR lower(trim(nama_sekolah)) = lower('TK MASYITHOH VI'));

-- TK Masyithoh VII
UPDATE public.data_anak
SET komunitas_id = '9b8a6b22-c7e3-4a38-84db-314dc541dc66', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK MASYITHOH VII' OR lower(trim(nama_sekolah)) = lower('TK MASYITHOH VII'));

-- TK Masyithoh VIII
UPDATE public.data_anak
SET komunitas_id = 'deca3d8f-33f6-415b-8ff0-2c0524c0e5fd', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK MASYITHOH VIII' OR lower(trim(nama_sekolah)) = lower('TK MASYITHOH VIII'));

-- TK Mubarokah
UPDATE public.data_anak
SET komunitas_id = 'eb7787fc-5d88-4ecb-8552-b8691e1ce713', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK MUBAROKAH' OR lower(trim(nama_sekolah)) = lower('TK MUBAROKAH'));

-- TK Negeri Pembina Kecamatan Margadana
UPDATE public.data_anak
SET komunitas_id = 'e595220e-5ce2-444b-85cd-18593b9fd299', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK NEGERI PEMBINA KECAMATAN MARGADANA' OR lower(trim(nama_sekolah)) = lower('TK NEGERI PEMBINA KECAMATAN MARGADANA'));

-- TK Negeri Pembina Kota Tegal
UPDATE public.data_anak
SET komunitas_id = '144347a7-41a4-40c1-8362-bc6146326f64', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK NEGERI PEMBINA KOTA TEGAL' OR lower(trim(nama_sekolah)) = lower('TK NEGERI PEMBINA KOTA TEGAL'));

-- TK Negeri Pembina Tegal Selatan
UPDATE public.data_anak
SET komunitas_id = '5c3da87c-773a-4dc7-8784-7c09a67b14c7', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK NEGERI PEMBINA TEGAL SELATAN' OR lower(trim(nama_sekolah)) = lower('TK NEGERI PEMBINA TEGAL SELATAN'));

-- TK Negeri Pembina Tegal Timur
UPDATE public.data_anak
SET komunitas_id = '9e3b4599-1472-4856-88e5-710dfd0bb988', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK NEGERI PEMBINA TEGAL TIMUR' OR lower(trim(nama_sekolah)) = lower('TK NEGERI PEMBINA TEGAL TIMUR'));

-- TK Nurul Huda
UPDATE public.data_anak
SET komunitas_id = '69a407c5-026b-42bd-8fe9-7d494266c419', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK NURUL HUDA' OR lower(trim(nama_sekolah)) = lower('TK NURUL HUDA'));

-- TK Nurunnisa
UPDATE public.data_anak
SET komunitas_id = 'a31034de-de4a-4337-8337-96b1d871ec5e', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK NURUNNISA' OR lower(trim(nama_sekolah)) = lower('TK NURUNNISA'));

-- TK Nurus Sunnah
UPDATE public.data_anak
SET komunitas_id = '5fa200db-4fe5-406a-8f4d-84ed68527aca', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK NURUS SUNNAH' OR lower(trim(nama_sekolah)) = lower('TK NURUS SUNNAH'));

-- TK Pelita Hati
UPDATE public.data_anak
SET komunitas_id = 'ec1c5efa-112f-4f1a-8090-0ac92ce5448d', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PELITA HATI' OR lower(trim(nama_sekolah)) = lower('TK PELITA HATI'));

-- TK Persatuan Ummat Islam (PUI) Cabang Tegal
UPDATE public.data_anak
SET komunitas_id = 'c7a2cc26-bfbc-4f79-8163-2299cc9fba19', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PERSATUAN UMMAT ISLAM (PUI) CABANG TEGAL' OR lower(trim(nama_sekolah)) = lower('TK PERSATUAN UMMAT ISLAM (PUI) CABANG TEGAL'));

-- TK Pertiwi 25.13 Kejambon
UPDATE public.data_anak
SET komunitas_id = '7593f83a-3b1e-47b2-8892-c11591fbda7d', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PERTIWI 25.13 KEJAMBON' OR lower(trim(nama_sekolah)) = lower('TK PERTIWI 25.13 KEJAMBON'));

-- TK Pertiwi 25.1 Randugunting
UPDATE public.data_anak
SET komunitas_id = '5b35dffe-032f-4a07-8d9d-dc01e173b826', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PERTIWI 25.1 RANDUGUNTIN' OR lower(trim(nama_sekolah)) = lower('TK PERTIWI 25.1 RANDUGUNTIN'));

-- TK Pertiwi 25.10 Debong Tengah
UPDATE public.data_anak
SET komunitas_id = '884da83e-8005-4087-8e69-485524f99841', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PERTIWI 25.10 DEBONG TENGAH' OR lower(trim(nama_sekolah)) = lower('TK PERTIWI 25.10 DEBONG TENGAH'));

-- TK Pertiwi 25.12 Kalinyamat Kulon
UPDATE public.data_anak
SET komunitas_id = 'ddab5d7c-47c7-431f-8459-9a6dffc4d6a4', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PERTIWI 25.12 KALINYAMAT KULON' OR lower(trim(nama_sekolah)) = lower('TK PERTIWI 25.12 KALINYAMAT KULON'));

-- TK Pertiwi 25.2 Kemandungan
UPDATE public.data_anak
SET komunitas_id = '501caf89-e96e-4e1a-8f1b-107947bf0c55', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PERTIWI 25.2 KEMANDUNGAN' OR lower(trim(nama_sekolah)) = lower('TK PERTIWI 25.2 KEMANDUNGAN'));

-- TK Pertiwi 25.3 Slerok
UPDATE public.data_anak
SET komunitas_id = '5a45ae0b-31d7-4cee-8ffd-41e192fe2a48', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PERTIWI 25.3 SLEROK' OR lower(trim(nama_sekolah)) = lower('TK PERTIWI 25.3 SLEROK'));

-- TK Pertiwi 25.4 Tegalsari
UPDATE public.data_anak
SET komunitas_id = 'dbf9bd4f-06fd-4dc7-8a86-af19362ab623', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PERTIWI 25.4 TEGALSARI' OR lower(trim(nama_sekolah)) = lower('TK PERTIWI 25.4 TEGALSARI'));

-- TK Pertiwi 25.5 Kraton
UPDATE public.data_anak
SET komunitas_id = '6298a9fe-5f4c-4faf-821c-dcc9ec57ae99', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PERTIWI 25.5 KRATON' OR lower(trim(nama_sekolah)) = lower('TK PERTIWI 25.5 KRATON'));

-- TK Pertiwi 25.6 Panggung
UPDATE public.data_anak
SET komunitas_id = '25cef33e-a796-461b-8add-34a95692b3b5', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PERTIWI 25.6 PANGGUNG' OR lower(trim(nama_sekolah)) = lower('TK PERTIWI 25.6 PANGGUNG'));

-- TK Pertiwi 25.7 Pekauman
UPDATE public.data_anak
SET komunitas_id = 'ba4008ec-77cd-479b-8065-edb9647f6bdf', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PERTIWI 25.7 PEKAUMAN' OR lower(trim(nama_sekolah)) = lower('TK PERTIWI 25.7 PEKAUMAN'));

-- TK Pertiwi 25.8 Pesurungan Kidul
UPDATE public.data_anak
SET komunitas_id = '47717e83-07f5-4f58-8499-5971e08e5e4c', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PERTIWI 25.8 PESURUNGAN KIDUL' OR lower(trim(nama_sekolah)) = lower('TK PERTIWI 25.8 PESURUNGAN KIDUL'));

-- TK Pertiwi 25.9 Bandung
UPDATE public.data_anak
SET komunitas_id = 'f2e83e06-f1a6-4091-8bc8-3549120de295', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PERTIWI 25.9 BANDUNG' OR lower(trim(nama_sekolah)) = lower('TK PERTIWI 25.9 BANDUNG'));

-- TK PGRI
UPDATE public.data_anak
SET komunitas_id = 'c73eafda-3385-4092-89a8-1b3df20db236', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PGRI' OR lower(trim(nama_sekolah)) = lower('TK PGRI'));

-- TK Pius
UPDATE public.data_anak
SET komunitas_id = '34b66c74-50f5-463d-889b-b065173ccbd3', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PIUS' OR lower(trim(nama_sekolah)) = lower('TK PIUS'));

-- TK Primagama Islami
UPDATE public.data_anak
SET komunitas_id = '496c2b55-8f87-4a41-867a-33ed5f5dfd64', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK PRIMAGAMA ISLAMI' OR lower(trim(nama_sekolah)) = lower('TK PRIMAGAMA ISLAMI'));

-- TK Shining Little Star
UPDATE public.data_anak
SET komunitas_id = '8ec9d080-30c4-409c-8d2d-41fd58b3bea0', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK SHINING LITTLE STAR' OR lower(trim(nama_sekolah)) = lower('TK SHINING LITTLE STAR'));

-- TK Syiarul Islam
UPDATE public.data_anak
SET komunitas_id = '359d4ac8-4ac5-4f6a-894f-381902e816f7', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK SYIARUL ISLAM' OR lower(trim(nama_sekolah)) = lower('TK SYIARUL ISLAM'));

-- TK Tarbiyatul Islamiyah
UPDATE public.data_anak
SET komunitas_id = 'd14e0e7a-bd9e-433a-831f-e4e1d4cf30c6', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK TARBIYATUL ISLAMIYAH' OR lower(trim(nama_sekolah)) = lower('TK TARBIYATUL ISLAMIYAH'));

-- TK Tunas Hidup Harapan Kita
UPDATE public.data_anak
SET komunitas_id = 'ccd94216-9117-43f5-8303-e759d76fb505', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK TUNAS HIDUP HARAPAN KITA' OR lower(trim(nama_sekolah)) = lower('TK TUNAS HIDUP HARAPAN KITA'));

-- TK Tut Wuri
UPDATE public.data_anak
SET komunitas_id = '292cc575-2e71-4f35-8b96-ad810dd5d22e', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TK TUT WURI' OR lower(trim(nama_sekolah)) = lower('TK TUT WURI'));

-- TPA Aisyiyah Kejambon
UPDATE public.data_anak
SET komunitas_id = '88de5d09-7bdc-44da-8593-4b6d19ba9ab0', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TPA AISYIYAH KEJAMBON' OR lower(trim(nama_sekolah)) = lower('TPA AISYIYAH KEJAMBON'));

-- TPA Ananda Mandiri
UPDATE public.data_anak
SET komunitas_id = '892c8e78-767f-412a-80e9-e931e8d0410c', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TPA ANANDA MANDIRI' OR lower(trim(nama_sekolah)) = lower('TPA ANANDA MANDIRI'));

-- TPA Bias Assalam
UPDATE public.data_anak
SET komunitas_id = '497721e8-8290-41c6-89b3-6eb11ceb0a38', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TPA BIAS ASSALAM' OR lower(trim(nama_sekolah)) = lower('TPA BIAS ASSALAM'));

-- TPA Usamah
UPDATE public.data_anak
SET komunitas_id = '74794d6f-d597-4ff7-8e39-1ef9dcbda83f', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'TPA USAMAH' OR lower(trim(nama_sekolah)) = lower('TPA USAMAH'));

-- UPTD SPNF Sanggar Kegiatan Belajar Kota Tegal
UPDATE public.data_anak
SET komunitas_id = '01d13c7b-8969-48b2-86dc-93057ffd20dd', updated_at = now()
WHERE is_sekolah = true
  AND (nama_sekolah = 'UPTD SPNF SANGGAR KEGIATAN BELAJAR KOTA TEGAL' OR lower(trim(nama_sekolah)) = lower('UPTD SPNF SANGGAR KEGIATAN BELAJAR KOTA TEGAL'));

-- Verifikasi hasil distribusi:
SELECT k.nama AS nama_paud, count(d.id) AS jumlah_murid
FROM public.komunitas k
JOIN public.data_anak d ON d.komunitas_id = k.id
WHERE k.jenis = 'satuan_paud'
GROUP BY k.nama
ORDER BY jumlah_murid DESC;
