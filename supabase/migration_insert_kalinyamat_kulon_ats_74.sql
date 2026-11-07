-- ==============================================================================
-- JARIMAS-ID: REKAPITULASI & SINKRONISASI 74 DATA ANAK TIDAK SEKOLAH (ATS)
-- KELURAHAN KALINYAMAT KULON, KECAMATAN MARGADANA, KOTA TEGAL
-- Sumber Data: Rekap Data Verval ATS - Kalinyamat Kulon (Pusdatin Kemendikdasmen)
-- ==============================================================================

-- Anak #1: KLARESTA AFRA MAULANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '8fc18341-9dc0-4204-bee8-d32984ab3405',
  'KLARESTA AFRA MAULANI',
  '2009-07-01',
  'P',
  'SURTINI',
  '083956557532',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya,] [ALAMAT:-, RT -/RW -] [RT:Belum Tahu] [RW:Belum Tahu] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MIS NURUL HUDA 01] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3092520551 | 20329823]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.755+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #2: LENI NIA SARI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '339bacbb-52df-4cbd-8188-9b6668204efa',
  'LENI NIA SARI',
  '2008-07-01',
  'P',
  'SITI ANINGSIH',
  '083106266074',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Kalinyamat Kulon, RT 4/RW 4] [RT:4] [RW:4] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:SMK ASTRINDO KOTA TEGAL] [KELAS:Kelas 11 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 0082309890 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #3: AZKA ANDHIKA PRATAMA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '34cba32b-7064-4bee-94b0-dadf5bfc0974',
  'AZKA ANDHIKA PRATAMA',
  '2013-07-01',
  'L',
  'NURSOIMAH',
  '084500608972',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Ki Hajar dewantara , RT 3/RW 1] [RT:3] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KALINYAMAT KULON 3] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0134305129 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #4: FIKRI HAIKAL AL AZZAM (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '493a1bd7-46b5-42fe-bfac-63b42f2c555d',
  'FIKRI HAIKAL AL AZZAM',
  '2014-07-01',
  'L',
  'WARYANI',
  '085158063605',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Kalinyamat Kulon Gang 21, RT 6/RW 1] [RT:6] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KALINYAMAT KULON 1 TEGAL] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3145119511 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #5: MAULIDA NURUL ASHFIAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '63b671a7-acce-4b84-8344-761063f6499e',
  'MAULIDA NURUL ASHFIAH',
  '2014-07-01',
  'P',
  'DEWI HARYANTI',
  '083047186575',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Ki Hajar Dewantara Gg. 2, RT 4/RW 3] [RT:4] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KALINYAMAT KULON 2 TEGAL] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0143453220 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #6: GHINA SAFINATUN NAJA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '7e1e6320-30fb-4481-b29b-a7ce022e14d1',
  'GHINA SAFINATUN NAJA',
  '2014-07-01',
  'P',
  'YULI HERLIANA',
  '086889245783',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 2/RW 1] [RT:2] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MI BAROKATUL QURAN] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3134685642 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #7: ZIDAN NUR FADHILLAH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '458923dc-e3aa-48ff-b479-38072f3c957b',
  'ZIDAN NUR FADHILLAH',
  '2012-07-01',
  'L',
  'SUNARSIH',
  '087423564614',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Ki Hajar Dewantara, RT 5/RW 1] [RT:5] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP NEGERI 18] [KELAS:Kelas 8 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0121393960 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #8: NAZZWA MAULIDA BAFIRA. P.W (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '33dc89bf-18e1-40f9-9a0f-ca2640985ccf',
  'NAZZWA MAULIDA BAFIRA. P.W',
  '2009-07-01',
  'P',
  'MUSTAGHFIROH',
  '088191723202',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 4/RW 1] [RT:4] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #9: SHEMINA AL FATIH HUMAEROH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '0e3ce81d-aa37-42b9-bb01-8a59e25796d2',
  'SHEMINA AL FATIH HUMAEROH',
  '2018-07-01',
  'P',
  'SESTINA RINI',
  '082068940105',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 8/RW 1] [RT:8] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #10: MUHAMMAD TEGUH SANTOSO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'b147256d-e1b7-4480-821b-db40b6b10bad',
  'MUHAMMAD TEGUH SANTOSO',
  '2009-07-01',
  'L',
  'NURYANI',
  '089082716934',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 3/RW 2] [RT:3] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:Madrasah Hidayatul Mubtadi''en Pesantren Lirboyo] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0097434469 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #11: ABU DZAR ALGHIFARI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '9730defd-e394-4176-957a-b6daa56f1213',
  'ABU DZAR ALGHIFARI',
  '2014-07-01',
  'L',
  'TETI NURHAYATI',
  '086907571069',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Ki Hajar Dewantara Gg 6, RT 4/RW 2] [RT:4] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KALINYAMAT KULON 3] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3140372485 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #12: MAFRIHATIN NISA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1ca6d957-2a93-49ec-86e7-cbb9d1f2c60a',
  'MAFRIHATIN NISA',
  '2009-07-01',
  'P',
  'ROKHANI',
  '081715286511',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya, sudah lulus sdlb belum bisa melanjutkan ke jenjang smplb] [ALAMAT:Kalinyamat kulon, RT 3/RW 4] [RT:3] [RW:4] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SLB SPK MUHAMMADIYAH] [KELAS:Kelas 7 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0096533590 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #13: ARDAN EKA FARZANA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'd93f4912-137c-4fdf-a6ac-c8aadd282812',
  'ARDAN EKA FARZANA',
  '2011-07-01',
  'L',
  'ENDRIYANI',
  '088792334728',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. KIHAJAR DEWANTORO GG. 13, RT 6/RW 2] [RT:6] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #14: MUHAMMAD IRHASH MAFTUH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ccb4d122-fb37-46cd-8fd0-9226c2588d48',
  'MUHAMMAD IRHASH MAFTUH',
  '2012-07-01',
  'L',
  'NUR KHOLILAH',
  '084519222034',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 7/RW 2] [RT:7] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SPM Wustha Pondok Pesantren Assalafiyah] [KELAS:Kelas 7 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0121413692 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #15: SATRIA ANDHIKA PRATAMA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'd5c0bb12-1f0c-4dfd-a074-52f69bb3e045',
  'SATRIA ANDHIKA PRATAMA',
  '2009-07-01',
  'L',
  'SITI DENCI',
  '084836274322',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. KI HAJAR DEWANTORO GANG 2, RT 4/RW 3] [RT:4] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #16: FAKHRI UBAIDIL AMMAR (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '31910696-12ad-445c-82a2-ea11bebb2254',
  'FAKHRI UBAIDIL AMMAR',
  '2013-07-01',
  'L',
  'FAHRUNISA',
  '086366961374',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Kalinyamat Kulon, RT 4/RW 2] [RT:4] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KALINYAMAT KULON 1 TEGAL] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3139821088 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #17: RAKA PUTRA PRATAMA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '34aa5564-84b5-4043-a94f-afc1bf7aaea3',
  'RAKA PUTRA PRATAMA',
  '2020-07-01',
  'L',
  'IKE NURJANAH',
  '087612082193',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 6/RW 3] [RT:6] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #18: MOHAMMAD MAULANA YUSUF (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '92070d18-3112-4174-baa2-c6703bc44278',
  'MOHAMMAD MAULANA YUSUF',
  '2013-07-01',
  'L',
  'MAHFRUDAH',
  '082774102187',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIABANG ROROTAN, RT 5/RW 6] [RT:5] [RW:6] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #19: SILMI NUR AFIFAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '069bc8e6-1796-4e4c-aafb-13dc205c6694',
  'SILMI NUR AFIFAH',
  '2008-07-01',
  'P',
  'NUR HIKMAWATI',
  '082907063183',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Letkol.Pol. Sutaryo No. 21, RT 1/RW 3] [RT:1] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMPIT INSAN HARAPAN] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0087703849 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #20: RAFFA DWIQI RAMADHAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'dcb51cfe-a8ec-4631-90cd-35b557806aac',
  'RAFFA DWIQI RAMADHAN',
  '2020-07-01',
  'L',
  'SALAMI',
  '084090458743',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 2/RW 4] [RT:2] [RW:4] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #21: TIARA VINAN DAMAYANTI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '281fb92c-8f1d-4f3c-a87b-b95c8ec0fcce',
  'TIARA VINAN DAMAYANTI',
  '2009-07-01',
  'P',
  'SITI AISAH',
  '087753231130',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 3/RW 1] [RT:3] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #22: FEBY DEA NOVANTIN (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'fa720b44-c6ab-4f74-9ba4-0eba09edb18f',
  'FEBY DEA NOVANTIN',
  '2010-07-01',
  'P',
  'WAITAH',
  '083759742933',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Tidak mau bersekolah] [ALAMAT:Kalinyamat Wetan, RT 4/RW 4] [RT:4] [RW:4] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD NEGERI KALINYAMAT WETAN 3 TEGAL] [KELAS:Kelas 5 SD/MI/Paket A DO] [KET:NISN: 0091578428 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #23: IRFAN MAULANA SIREGAR (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '4659f4ef-2b6d-4c33-8e3a-ff06f982a1a8',
  'IRFAN MAULANA SIREGAR',
  '2010-07-01',
  'L',
  'FATIMAH',
  '082309705140',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Letkol. Pol. Sutaryo No. 21, RT 1/RW 3] [RT:1] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD NEGERI KENDAL SERUT 02] [KELAS:Kelas 6 SD/MI/Paket A DO] [KET:NISN: 0101272212 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #24: MUHAMMAD WILDAN AFANDI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '7c490ebc-29db-46df-af48-1741a6ebd518',
  'MUHAMMAD WILDAN AFANDI',
  '2009-07-01',
  'L',
  'SARINI',
  '086436434208',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Bekerja] [ALAMAT:Jl. Ki Hajar Dewantara, RT 3/RW 1] [RT:3] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP MUHAMMADIYAH 2] [KELAS:Kelas 8 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0098604407 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #25: ADIVA NAJMA MYSEHA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '3196f2d4-e6c8-4092-ae80-95ea86498baf',
  'ADIVA NAJMA MYSEHA',
  '2019-07-01',
  'P',
  'NOVI YANI',
  '082274013457',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 2/RW 4] [RT:2] [RW:4] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #26: SITI KHANZA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'bb72e167-5308-4478-970d-f3cde92f3f9b',
  'SITI KHANZA',
  '2012-07-01',
  'P',
  'TETI NURHAYATI',
  '081479553973',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 4/RW 2] [RT:4] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MTs AL FATAH PUTRI TEMBORO] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 3117320238 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #27: KHAERUL ANAM MUSTOFA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '29e6c082-f040-4fa0-acb9-cce3d3070ee4',
  'KHAERUL ANAM MUSTOFA',
  '2010-07-01',
  'L',
  'WAHYU NUR CAHYANI',
  '089024738936',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Lainnya, Melanjutkan ke PKBM (Kejar Paket)] [ALAMAT:KI HAJAR DEWANTARA, RT 5/RW 2] [RT:5] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP NEGERI 17 TEGAL] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0106074954 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #28: WAHYU RAMADAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'cb3fda2e-320b-4d25-981b-f9183a329cd1',
  'WAHYU RAMADAN',
  '2008-07-01',
  'L',
  'SUPRIYANIH',
  '082539853790',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Tidak mau bersekolah] [ALAMAT:Jl. Pangeran Antasari, RT 4/RW 4] [RT:4] [RW:4] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP NEGERI 17 TEGAL] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0088092985 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #29: DEWI FATIMAH TU ZAHRO (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '3c727d5f-e119-4215-bc64-f72992ada67f',
  'DEWI FATIMAH TU ZAHRO',
  '2007-07-01',
  'P',
  'SUKIMAH',
  '088089597727',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Bekerja] [ALAMAT:Jl. Ki Hajar Dewantara, RT 4/RW 1] [RT:4] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP NEGERI 18] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0074564044 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #30: BELA OKTAVIANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'b28b1860-de61-4f94-8c23-494a36eb779c',
  'BELA OKTAVIANI',
  '2018-07-01',
  'P',
  'RUNATI WULANDARI',
  '086441358237',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. KI HAJAR DEWANTORO, RT 5/RW 2] [RT:5] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #31: KHAIRIL ANAR MALIKI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'd13c48e8-dee2-4fe9-8ecb-203f3cc61c81',
  'KHAIRIL ANAR MALIKI',
  '2012-07-01',
  'L',
  'SOLICKA',
  '085995724652',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 2/RW 1] [RT:2] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #32: SITI KHODIJAH SUSANTO (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '8fa96de3-135a-40f7-9a12-b4b055916ed7',
  'SITI KHODIJAH SUSANTO',
  '2019-07-01',
  'P',
  'MUNIROH',
  '082618795999',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL KI HAJAR DEWANTORO, RT 3/RW 2] [RT:3] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #33: GUSTI DIMAS TARUNA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '36c3e640-e514-4046-9a15-5eef49725be2',
  'GUSTI DIMAS TARUNA',
  '2008-07-01',
  'L',
  'RIYANTI',
  '083582692528',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Tidak mau bersekolah] [ALAMAT:Jl. Ki Hajar Dewantara No. 17 A, RT 5/RW 2] [RT:5] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD NEGERI KALINYAMAT KULON 3] [KELAS:Kelas 6 SD/MI/Paket A DO] [KET:NISN: 0084458572 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #34: FINA NILATUL IZZAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '364d7477-f522-4d1a-9aaa-89dfaed1e256',
  'FINA NILATUL IZZAH',
  '2016-07-01',
  'P',
  'CHUNAENI',
  '088860141337',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Nanggewer Mekar, RT 8/RW 1] [RT:8] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD N NANGGEWER 01] [KELAS:Kelas 4 SD/MI/Paket A DO] [KET:NISN: 3163479241 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #35: RAHMAT NUR HIDAYAT (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'f1d4a5a3-d09e-4499-aba8-e8ee1eaeb026',
  'RAHMAT NUR HIDAYAT',
  '2015-07-01',
  'L',
  'RUNATI WULANDARI',
  '088291178959',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. KI HAJAR DEWANTORO, RT 5/RW 2] [RT:5] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #36: ADE KURNIAWAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '3675b334-e621-4c1d-b6db-e1cf925291c5',
  'ADE KURNIAWAN',
  '2009-07-01',
  'L',
  'SUNAYAH',
  '085441016541',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KP. HARAPAN KITA, RT 12/RW 23] [RT:12] [RW:23] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #37: FIRMAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '97c94a66-390d-4f95-a28c-e9ac8adb9498',
  'FIRMAN',
  '2009-07-01',
  'L',
  'RATNANINGSIH',
  '085318832656',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Ki Hajar Dewantara, RT 4/RW 1] [RT:4] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KALINYAMAT KULON 3] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0096047097 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #38: AZZAKY MAULANA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '774542db-3698-43f2-b2f7-358eb967a38b',
  'AZZAKY MAULANA',
  '2020-07-01',
  'L',
  'LINA SAPRIYANA',
  '088302473681',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 4/RW 4] [RT:4] [RW:4] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #39: MUTYARA FITRI RAHAYU (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'c4d52737-db81-4357-8e6c-903394dd5b4d',
  'MUTYARA FITRI RAHAYU',
  '2013-07-01',
  'P',
  'KUNIRAH',
  '085382519017',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 7/RW 3] [RT:7] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #40: HANDIKA DWI PUJIYAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'c07f84e4-5e92-44e1-9cc9-21632f9908f1',
  'HANDIKA DWI PUJIYAN',
  '2010-07-01',
  'L',
  'ENDANG MUJIARTI',
  '085005130035',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 4/RW 3] [RT:4] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #41: AZMI SAPUTRA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '9c827dcc-1a0e-426b-ac4e-09726a91edba',
  'AZMI SAPUTRA',
  '2011-07-01',
  'L',
  'SITI NUR KHIKMAH',
  '087166197502',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Balamoa, RT 4/RW 2] [RT:4] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP NU 1 HASYIM ASY ARI TARUB] [KELAS:Kelas 8 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 3117538597 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #42: QIANA ZAFINA MAZIYA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a799f181-ae95-437b-b1ba-6e458023ab40',
  'QIANA ZAFINA MAZIYA',
  '2019-07-01',
  'P',
  'ENI ROHIYAH',
  '082261340964',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 5/RW 3] [RT:5] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #43: DINDA KEYSA HARINA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'b86f454c-d4bf-4567-a272-8e73540d1a11',
  'DINDA KEYSA HARINA',
  '2009-07-01',
  'P',
  'RINAWATI',
  '085459649863',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 1/RW 1] [RT:1] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #44: SALMAN AL-FARISI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '340564e4-214a-439c-817c-bf595841b552',
  'SALMAN AL-FARISI',
  '2017-07-01',
  'L',
  'MUSTOFIYAH',
  '089739022830',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 2/RW 1] [RT:2] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #45: STARLA AUDI SILVIA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'c3110531-89a9-4c65-b2fe-6009ce0cefd1',
  'STARLA AUDI SILVIA',
  '2020-07-01',
  'P',
  'ISNAWATI',
  '084854137932',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL.KI HAJAR DEWANTARA , RT 4/RW 2] [RT:4] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #46: RENDI SAPUTRA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a01c2c24-c1dc-4fbf-9642-b01ff513c302',
  'RENDI SAPUTRA',
  '2010-07-01',
  'L',
  'ENDANG',
  '081638158172',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Ki Hajar Dewantara, RT 2/RW 2] [RT:2] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP NEGERI 13] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0093332694 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #47: SHAFEEYA AYU HUMAIRA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '5347c66f-2629-4808-b4ca-443c8918e0a2',
  'SHAFEEYA AYU HUMAIRA',
  '2018-07-01',
  'P',
  'PUSPA INDAH SRI EKOWATI',
  '084013580022',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 1/RW 3] [RT:1] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #48: SITI AMINAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'deeecc90-b0a8-43ec-a8dc-8be0eaeed451',
  'SITI AMINAH',
  '2009-07-01',
  'P',
  'YUNI WAHYUNI',
  '086889120206',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 5/RW 3] [RT:5] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #49: AHMAD IBRAHIM TAFURAHMAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '9ac5fd09-e753-4cb4-a407-011f8f62541a',
  'AHMAD IBRAHIM TAFURAHMAN',
  '2019-07-01',
  'L',
  'NURHIKMAH',
  '086616539700',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 2/RW 4] [RT:2] [RW:4] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #50: MUKHAMMAD BILAL HAMIZAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '7e105560-2137-4ac4-943b-9d73cc43e2f2',
  'MUKHAMMAD BILAL HAMIZAN',
  '2014-07-01',
  'L',
  'THIAS FEBRIANI SUCIYATI',
  '089540309920',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:KH. DEWANTORO, RT 1/RW 1] [RT:1] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KALINYAMAT KULON 1 TEGAL] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0144634492 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #51: RIFAN LUTFI ZAKI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '6eef6fc9-d5e8-4120-bf19-5a83dbbd25c8',
  'RIFAN LUTFI ZAKI',
  '2008-07-01',
  'L',
  'NANI MURNIATI',
  '085029700531',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 7/RW 3] [RT:7] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #52: WULAN FUJIARTI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1cd9e9c0-ac5c-4fa9-b975-354c0dd80deb',
  'WULAN FUJIARTI',
  '2008-07-01',
  'P',
  'LIS SUGIARTI',
  '082342566471',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Tidak mau bersekolah] [ALAMAT:Kalinyamat Kulon, RT 4/RW 4] [RT:4] [RW:4] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KALINYAMAT WETAN 3 TEGAL] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0086077551 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #53: DWI AFRIYANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '545fb346-3f67-49dc-bdda-a2d5c2b36c2c',
  'DWI AFRIYANI',
  '2013-07-01',
  'P',
  'SAADAH',
  '086897131508',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 3/RW 1] [RT:3] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #54: HENDI PURNAMA PUTRA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '162dc94c-a3ad-4bcf-bf1a-3c7ed6f2be94',
  'HENDI PURNAMA PUTRA',
  '2008-07-01',
  'L',
  'IKA MALINI',
  '085828962243',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 3/RW 2] [RT:3] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #55: ZALFA ARSYANA NAZIHAH TSANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '86fc1a0e-032c-4909-8eb4-42521ccad936',
  'ZALFA ARSYANA NAZIHAH TSANI',
  '2020-07-01',
  'P',
  'NURKHASANAH',
  '081230851462',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 2/RW 4] [RT:2] [RW:4] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #56: YOGI DERMAWAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'adf1e96c-246c-4e74-a7fa-32814d0e03a4',
  'YOGI DERMAWAN',
  '2009-07-01',
  'L',
  'SUKEMI',
  '086325718148',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Tidak mau bersekolah] [ALAMAT:Kalinyamat Kulon, RT 4/RW 4] [RT:4] [RW:4] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD NEGERI KALINYAMAT WETAN 3 TEGAL] [KELAS:Kelas 5 SD/MI/Paket A DO] [KET:NISN: 0086963043 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #57: NUR ALFISYIFA'SA'ADAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1ecc346c-fc6b-45bc-8ba4-2bc22428f7f5',
  'NUR ALFISYIFA''SA''ADAH',
  '2011-07-01',
  'P',
  'YUSTI ARIYANTI',
  '081525726508',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 4/RW 3] [RT:4] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MTS ALHIKMAH 1] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 3108990549 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #58: MUHAMMAD KHAIRAN RAMADHAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'c9a066c3-5b3f-470d-aaab-9483d66bc9b3',
  'MUHAMMAD KHAIRAN RAMADHAN',
  '2020-07-01',
  'L',
  'NANI KARLINA',
  '089513156984',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 1/RW 3] [RT:1] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #59: IKHSANUL ARKHA TAFURAHMAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ea9a72ed-a2de-4a27-a13a-dbded31b9e19',
  'IKHSANUL ARKHA TAFURAHMAN',
  '2013-07-01',
  'L',
  'NURHIKMAH',
  '083823445209',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Kosambi Timur, RT 2/RW 4] [RT:2] [RW:4] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD N SUKAMAJU] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3133374196 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #60: RIFKI ABDUL HARIS NUR HAKIKI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a735ff27-661f-470b-b731-b06e46c57f4a',
  'RIFKI ABDUL HARIS NUR HAKIKI',
  '2010-07-01',
  'L',
  'NURYATI',
  '089000608124',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 3/RW 2] [RT:3] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:Madrasah Hidayatul Mubtadi-ien Lirboyo] [KELAS:Kelas 6 SD/MI/Paket A DO] [KET:NISN: 0101277582 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #61: ANGGIETA SILVIA MAHARANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1491fd37-6931-4786-a11c-878700bf4fea',
  'ANGGIETA SILVIA MAHARANI',
  '2009-07-01',
  'P',
  'SITI HAJAR',
  '082409843740',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Ki Hajar Dewantara, RT 2/RW 1] [RT:2] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:PKBM MEKAR] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0096226412 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #62: AYU NATASYANIAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '3be2b52d-d1a8-4bbb-b4c0-92368ac70a41',
  'AYU NATASYANIAH',
  '2012-07-01',
  'P',
  'EKA RAHAYU',
  '086047528194',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Ki Hajar Dewantoro, RT 3/RW 1] [RT:3] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP NEGERI 17 TEGAL] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0111257976 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #63: DEA NUR AROFAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '03420338-d1db-4c0b-9832-d66206a02e17',
  'DEA NUR AROFAH',
  '2012-07-01',
  'P',
  'KARTINI',
  '087906623186',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Letkol Pol Sutaryo, RT 1/RW 3] [RT:1] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KALINYAMAT KULON 2 TEGAL] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0122985999 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #64: RIZKI AMIRULOH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ae65ac06-08cc-4f54-b271-40ea9399b5ce',
  'RIZKI AMIRULOH',
  '2007-07-01',
  'L',
  'WARULAH',
  '084058685188',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Pindah Domisili] [ALAMAT:Kp. Baru, RT 4/RW 7] [RT:4] [RW:7] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP Ash Solihin] [KELAS:Kelas 8 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0073166022 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #65: TUBAGUS MUHAMMAD AZZAM (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'e6a7139b-da37-4ea2-aa33-59efcb0c5287',
  'TUBAGUS MUHAMMAD AZZAM',
  '2009-07-01',
  'L',
  'ENDANG NURYANI',
  '086625238095',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 1/RW 1] [RT:1] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #66: ADHWA MUNTO HANIIFAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '65049946-8eeb-40f6-961b-c72f2bded7db',
  'ADHWA MUNTO HANIIFAH',
  '2011-07-01',
  'P',
  'SITI MASITOH',
  '084813619073',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 1/RW 2] [RT:1] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:TMI Tsanawiyah Pondok Pesantren Riyadhul Huda Bogor] [KELAS:Kelas 8 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0116379529 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #67: AMELIA PUTRI RAMADHANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '7b196fe8-2ad5-49e4-ac59-63d0df675df1',
  'AMELIA PUTRI RAMADHANI',
  '2010-07-01',
  'P',
  'RIRIN HIDAYATI',
  '082220548796',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 1/RW 1] [RT:1] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #68: MOH. FAHRI ALFARIZKI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '5130ccd8-ca35-498e-b1c7-6aace0645616',
  'MOH. FAHRI ALFARIZKI',
  '2009-07-01',
  'L',
  'PATMAWATI',
  '083060848961',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 5/RW 3] [RT:5] [RW:3] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #69: SYAHIDAH SAFANAH ROMADHONI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'badf744c-71f2-48f1-b083-a55b5c2f2337',
  'SYAHIDAH SAFANAH ROMADHONI',
  '2020-07-01',
  'P',
  'PUTRI NOPIANTI',
  '082092372566',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:MARGADANA, RT 7/RW 1] [RT:7] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #70: MOHAMAD FIKIH KHERULLAH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '60e55391-418b-48a5-b555-536d2474e9fc',
  'MOHAMAD FIKIH KHERULLAH',
  '2020-07-01',
  'L',
  'SITI AMALIAH',
  '084373002804',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 8/RW 2] [RT:8] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #71: MUHAMAD RIZKI ADITIA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1207a792-b474-4c0f-ac82-a4bfd5626bc3',
  'MUHAMAD RIZKI ADITIA',
  '2016-07-01',
  'L',
  'SAUDAH',
  '082318032571',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 2/RW 2] [RT:2] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #72: FURQON KHARIS (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '2efe8e52-9bae-4c40-bd8a-8b7437855cc5',
  'FURQON KHARIS',
  '2010-07-01',
  'L',
  'SUMIDAH',
  '085015151060',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 1/RW 2] [RT:1] [RW:2] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #73: MUHAMAD RAIHAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1f38f47e-4dc1-4a2b-8291-03cb7bc840ed',
  'MUHAMAD RAIHAN',
  '2011-07-01',
  'L',
  'RAHAYU',
  '082409848985',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Tidak mau bersekolah] [ALAMAT:-, RT -/RW -] [RT:Belum Tahu] [RW:Belum Tahu] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:MIS MIFTAHUL HUDA] [KELAS:Kelas 4 SD/MI/Paket A DO] [KET:NISN: 3117675460 | Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #74: SAILA TRI MAULIDA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'b5a2f870-7897-4ff8-ae17-cd3733bcd85b',
  'SAILA TRI MAULIDA',
  '2020-07-01',
  'P',
  'JARIYAH',
  '088828654129',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALINYAMAT KULON, RT 3/RW 1] [RT:3] [RW:1] [KEL:Kalinyamat Kulon] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '12686d54-9eee-4025-8d47-8dc12952d0c4',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:51:05.772+00:00'
) ON CONFLICT (id) DO NOTHING;

