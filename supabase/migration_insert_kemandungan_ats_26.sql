-- ==============================================================================
-- JARIMAS-ID: REKAPITULASI & SINKRONISASI 26 DATA ANAK TIDAK SEKOLAH (ATS)
-- KELURAHAN KEMANDUNGAN, KECAMATAN TEGAL BARAT, KOTA TEGAL
-- Sumber Data: Rekap Data Verval ATS - Kemandungan (Pusdatin Kemendikdasmen)
-- ==============================================================================

-- Anak #1: SLAMET MULYADI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1b3526ad-49cd-4ec9-91bd-2a3d344aa4dd',
  'SLAMET MULYADI',
  '2007-07-01',
  'L',
  'HARINI SUMARLINA',
  '085398838155',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Bekerja] [ALAMAT:Jl. Bakti No. 43, RT 4/RW 2] [RT:4] [RW:2] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:SMK ASTRINDO KOTA TEGAL] [KELAS:Kelas 11 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 0077162555 | Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.938+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #2: FEIFEL JOHENDI RIFKIANSYAH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'aa88ae2d-b88e-42bb-9232-563ecdf83050',
  'FEIFEL JOHENDI RIFKIANSYAH',
  '2009-07-01',
  'L',
  'NURTI',
  '084276558738',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:JL. RUSLANI HS GG.3 NO.15, RT 3/RW 1] [RT:3] [RW:1] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:UPTD SPNF SANGGAR KEGIATAN BELAJAR KOTA TEGAL] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0092728945 | Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #3: NUR KHIKMAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '671dab2f-a46d-49da-a6c3-a1540c3c973a',
  'NUR KHIKMAH',
  '2008-07-01',
  'P',
  'RAIMAH',
  '082531700183',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:PEKAUMAN KULON, RT 2/RW 2] [RT:2] [RW:2] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:PKBM SIDA MULYA] [KELAS:Kelas 7 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0082383766 | Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #4: ARJUNA FAIQ AMMAR SYAH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '100cb1c1-7d09-4483-b80f-b29cd4afbc00',
  'ARJUNA FAIQ AMMAR SYAH',
  '2012-07-01',
  'L',
  'MARIA ULFA',
  '089448424666',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. KOL. SUGIONO NO. 49 TEGAL, RT 1/RW 1] [RT:1] [RW:1] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #5: NEO HUI XIAN RICHELLE (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'dc1b6529-c9d9-4aa4-9c62-d5e0fe61b70e',
  'NEO HUI XIAN RICHELLE',
  '2012-07-01',
  'P',
  'ERVINA',
  '082397165879',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Bersekolah] [ALAMAT:JL. KOMPOL SUPRAPTO NO. 8, RT 1/RW 3] [RT:1] [RW:3] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #6: MUHAMAD FATHIR AL FAHRI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '9ff2d7b0-fdc3-41bc-9b3c-4642af9fd88c',
  'MUHAMAD FATHIR AL FAHRI',
  '2014-07-01',
  'L',
  'ERSA NUR APRIANTI',
  '088559369448',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. SUKARDI GG. II, RT 4/RW 1] [RT:4] [RW:1] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #7: MARIA SALEH BAWAZIR (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'b16dcabf-d094-487c-9a08-577d1abfd8c5',
  'MARIA SALEH BAWAZIR',
  '2016-07-01',
  'P',
  'FERRA WIDIYANTI',
  '084345950266',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. KOMPOL SUPRAPTO NO 3 PERUM DE HOEK, RT 3/RW 2] [RT:3] [RW:2] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #8: MURTANTY DWI CAHYANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'd51e3e1e-db20-44fd-a3d6-2b6d58c70ca8',
  'MURTANTY DWI CAHYANI',
  '2008-07-01',
  'P',
  'SUKENI',
  '081494988288',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:JL. BHAKTI NO. 34 B, RT 4/RW 2] [RT:4] [RW:2] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:SMK ASTRINDO KOTA TEGAL] [KELAS:Kelas 11 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 0082157101 | Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #9: HAFSHAH ALIKA SYIFA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'b22ad4af-e351-402e-85a0-5fefdda354b6',
  'HAFSHAH ALIKA SYIFA',
  '2011-07-01',
  'P',
  'IKA SUPRININGSIH',
  '087250399817',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Sukardi, RT 4/RW 1] [RT:4] [RW:1] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP MUHAMMADIYAH 3 TEGAL] [KELAS:Kelas 9 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 3119331661 | Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #10: RUMAYSHO (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '4d70e9c4-1ddd-4f37-982a-cc30d19ed5ae',
  'RUMAYSHO',
  '2010-07-01',
  'P',
  'SITI AMINAH',
  '081725571516',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. KOL SUGIONO, RT 2/RW 2] [RT:2] [RW:2] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #11: KURNIAWAN ARBANI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '4e5abb18-d79f-407f-9fe4-990052797249',
  'KURNIAWAN ARBANI',
  '2013-07-01',
  'L',
  'SITI ZUMROTUL ROISAH',
  '089903621089',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Lainnya, Pindah rumah, ikut ibunya di Surabaya] [ALAMAT:JL. RUSLANI HS GG. 4, RT 6/RW 2] [RT:6] [RW:2] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #12: SURYA MAHADIKA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '80abfb20-6ce1-44dd-aa63-43fb8dbb6a52',
  'SURYA MAHADIKA',
  '2008-07-01',
  'L',
  'RETNO SETIYAWATI',
  '083175243432',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Lainnya, Pindah rumah di Yogjakarta] [ALAMAT:JL. SUKARDI NO. 30, RT 3/RW 1] [RT:3] [RW:1] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #13: ATILLA ZIDAN MERCAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '5b0798c6-7480-4c8d-922f-9eb86e3e3e31',
  'ATILLA ZIDAN MERCAN',
  '2013-07-01',
  'L',
  'ASTRIANI ARUMSARI',
  '084711774580',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Lainnya, Pindah rumah, ikut keluarganya di TURKI] [ALAMAT:JL. SUKARDI NO.19, RT 4/RW 1] [RT:4] [RW:1] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #14: NADYA AYU OCTA DAMAYANTI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '9099b218-1373-4238-91d0-a99cdb17fce7',
  'NADYA AYU OCTA DAMAYANTI',
  '2008-07-01',
  'P',
  'SRI LATIFAH UTAMI',
  '088670150638',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Ruslani HS No. 18, RT 6/RW 2] [RT:6] [RW:2] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:SMK NEGERI 1 TEGAL] [KELAS:Kelas 12 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 0089508703 | Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #15: NICHOLE LEE JIA YI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '7b7d91e4-3e94-4eec-995d-91d98fa060ef',
  'NICHOLE LEE JIA YI',
  '2010-07-01',
  'P',
  'ERNA',
  '084030622490',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Bersekolah] [ALAMAT:JL. KOMPOL SUPRAPTO NO. 8, RT 1/RW 3] [RT:1] [RW:3] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #16: FINNA SYIFA NUR AINI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '0a1b86ba-0824-4b6d-be00-34590dbd2fb9',
  'FINNA SYIFA NUR AINI',
  '2015-07-01',
  'P',
  'NUNIK ROSALINA',
  '089011056057',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Masalah Kesehatan / Penyandang Disabilitas] [ALAMAT:JL. RUSLANI, RT 2/RW 1] [RT:2] [RW:1] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #17: ALEESYA SYAQILA LATHIFA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'f69c31a1-f7c1-4ac1-96f3-9edfe8fd11b5',
  'ALEESYA SYAQILA LATHIFA',
  '2011-07-01',
  'P',
  'SELVY WULANDARI',
  '089316910403',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Perum Sapphire Regency Blok E/8, RT 2/RW 2] [RT:2] [RW:2] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP GLOBAL INBYRA SCHOOL] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0115215858 | Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #18: HANA ALIKA HUMAIRA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '87eb803f-4b28-49a7-8c86-b2ff853e6f30',
  'HANA ALIKA HUMAIRA',
  '2013-07-01',
  'P',
  'IKA SUPRININGSIH',
  '083249993766',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:JL. SUKARDI, RT 4/RW 1] [RT:4] [RW:1] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP NEGERI 6 TEGAL] [KELAS:Kelas 7 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0135635436 | Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #19: SAFA VILDAN MERCAN (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '23914bae-22ec-4974-af67-c9e30579b57b',
  'SAFA VILDAN MERCAN',
  '2010-07-01',
  'P',
  'ASTRIANI ARUMSARI',
  '082965783361',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Lainnya, Pindah rumah, ikut keluarganya di TURKI] [ALAMAT:JL. SUKARDI NO.19, RT 4/RW 1] [RT:4] [RW:1] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #20: RENO AKBAR MAULANA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '85735afb-f77f-4636-8fcf-80962ccfe266',
  'RENO AKBAR MAULANA',
  '2008-07-01',
  'L',
  'SUKINI',
  '089487352582',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. SD Inpres Kemandungan, RT 3/RW 2] [RT:3] [RW:2] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:SMK NEGERI 2 TEGAL] [KELAS:Kelas 10 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 0087564517 | Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #21: FATHAN DINAR AL KHADRAA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'c5b5a9de-58dd-43f0-861b-6bddb950c01b',
  'FATHAN DINAR AL KHADRAA',
  '2011-07-01',
  'L',
  'ROKHANAH',
  '087764693169',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Candi Bujang No. 9A Kelurahan Kemandungan Kecamatan Tegal Barat Kota Tegal , RT 2/RW 1] [RT:2] [RW:1] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:PKBM MUTIARA SHAHABAT] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 2119227486 | Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #22: MUHAMMAD DESVARGA ALBIFARDZAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '3ca0e9c7-5d1f-49e9-9e57-65d6470a6589',
  'MUHAMMAD DESVARGA ALBIFARDZAN',
  '2020-07-01',
  'L',
  'RIZKA AYU LOVIANA',
  '081203627092',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. SUKARDI NO. 36, RT 3/RW 1] [RT:3] [RW:1] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #23: SHELMA SALEH BAWAZIR (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'cab34b65-94c0-498c-9265-33132ea24f21',
  'SHELMA SALEH BAWAZIR',
  '2015-07-01',
  'P',
  'FERRA WIDIYANTI',
  '083673312168',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. KOMPOL SUPRAPTO NO 3 PERUM DE HOEK, RT 3/RW 2] [RT:3] [RW:2] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #24: ETHAN GAVINE BRAMANTIA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '8abf4012-adde-4b2f-8593-9ca47ab608b7',
  'ETHAN GAVINE BRAMANTIA',
  '2010-07-01',
  'L',
  'SUMARNI',
  '085969007600',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Lainnya, Pindah di pamulang] [ALAMAT:JL. DEWI SARTIKA NO. 3, RT 2/RW 3] [RT:2] [RW:3] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #25: MUHAMMAD FATIH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ea295efd-de56-40eb-b734-14ed12ad9896',
  'MUHAMMAD FATIH',
  '2020-07-01',
  'L',
  'SETIYAWATI',
  '087419867779',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. SUKARDI NO.2, RT 3/RW 1] [RT:3] [RW:1] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #26: JULIA DINIARTY (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '838f11a9-b43d-4751-9bc4-6f29e161f2f5',
  'JULIA DINIARTY',
  '2010-07-01',
  'P',
  'CIPTA KANTHI',
  '081465031973',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Lainnya, Pindah rumah, tidak di kemandungan] [ALAMAT:JL.BAKTI, RT 5/RW 2] [RT:5] [RW:2] [KEL:Kemandungan] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '74e428e0-b759-418c-8a18-1b8d011b2f00',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:58:15.951+00:00'
) ON CONFLICT (id) DO NOTHING;

