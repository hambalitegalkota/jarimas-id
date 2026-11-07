-- ==============================================================================
-- JARIMAS-ID: REKAPITULASI & SINKRONISASI 103 DATA ANAK TIDAK SEKOLAH (ATS)
-- KELURAHAN KALIGANGSA, KECAMATAN MARGADANA, KOTA TEGAL
-- Sumber Data: Rekap Data Verval ATS - Kaligangsa (Pusdatin Kemendikdasmen)
-- ==============================================================================

-- Anak #1: SANDRA DEWI P.E BON (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1070445c-7d1d-4a40-ae24-b6bbc3c00b60',
  'SANDRA DEWI P.E BON',
  '2008-07-01',
  'P',
  'YENI',
  '087123994909',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 3/RW 3] [RT:3] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.537+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #2: MUHAMMAD ARKAN RAFISQY (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ffdfd75b-7218-451e-b382-4eb40b92e6d1',
  'MUHAMMAD ARKAN RAFISQY',
  '2019-07-01',
  'L',
  'SURYANI WATI',
  '087987375735',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. BEKASI SELATAN, RT 2/RW 6] [RT:2] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #3: AUNULLAH ERLANGGA ASSAJID (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '741a75f3-b1b4-4191-910f-be9185068f8e',
  'AUNULLAH ERLANGGA ASSAJID',
  '2019-07-01',
  'L',
  'MURNI ASIH',
  '085726524279',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 2/RW 2] [RT:2] [RW:2] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #4: DEA ALIFIA PUTRI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '6f2baf3f-1fcc-4b3c-8173-ce9645f865a7',
  'DEA ALIFIA PUTRI',
  '2019-07-01',
  'P',
  'NURHIKMAH',
  '084532356773',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 2/RW 6] [RT:2] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #5: NOVRIAN CHOIRILHUDA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '71593991-2cbd-4d64-ab0f-12238552187b',
  'NOVRIAN CHOIRILHUDA',
  '2011-07-01',
  'L',
  'ERNAWATI',
  '082897418092',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Masalah Kesehatan / Penyandang Disabilitas] [ALAMAT:KALIGANGSA, RT 2/RW 1] [RT:2] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #6: SHAMA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'af240466-aa4f-4400-86b1-1054a32e2030',
  'SHAMA',
  '2009-07-01',
  'P',
  'FITRIANI',
  '088480652533',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL CIPTO MANGUNKUSUMO 2 , RT 1/RW 2] [RT:1] [RW:2] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #7: AFIQAH KHOLIFFATUN KHAZANA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'fa010cea-5444-496e-8e00-80b8b3adb195',
  'AFIQAH KHOLIFFATUN KHAZANA',
  '2012-07-01',
  'P',
  'SANATUN',
  '084062924671',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Masalah Kesehatan / Penyandang Disabilitas] [ALAMAT:KALIGANGSA, RT 4/RW 3] [RT:4] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #8: NUR ALAM SYAH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a92d2e36-34ef-4ba3-a584-4cd89f08480c',
  'NUR ALAM SYAH',
  '2010-07-01',
  'L',
  'SAENAH',
  '084410591718',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Kaligangsa, RT 2/RW 3] [RT:2] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP NEGERI 17 TEGAL] [KELAS:Kelas 9 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0106108123 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #9: AMELIA ANJANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'c909954c-49b3-486a-b7a7-2aaa1154ed2e',
  'AMELIA ANJANI',
  '2014-07-01',
  'P',
  'SAPUROH',
  '082837975154',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. M. TOHA, RT 3/RW 3] [RT:3] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #10: RAHMA EKA ADE TIARNI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '7afdce94-1bbc-4369-a9f9-a1b430c5eb03',
  'RAHMA EKA ADE TIARNI',
  '2009-07-01',
  'P',
  'KORIYAH',
  '085336374714',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. CIPTO MANGUNKUSUMO, RT 3/RW 4] [RT:3] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #11: KURNIA NINGSIH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ddac5c14-256a-403a-9c6d-03f483441978',
  'KURNIA NINGSIH',
  '2012-07-01',
  'P',
  'TARUNI',
  '086070503574',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Kaligangsa, RT 1/RW 1] [RT:1] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KALIGANGSA 3] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3125160494 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #12: ASMA AMALIA AMANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '5fe82a3b-80bd-4188-9424-8e3799b24c4d',
  'ASMA AMALIA AMANI',
  '2017-07-01',
  'P',
  'SUSIYANTI',
  '089332307007',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. M. TOHA, RT 5/RW 4] [RT:5] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #13: MEY LINDA DEWI ARYANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '67aeed34-0d72-4b82-900a-afcc2c1518a7',
  'MEY LINDA DEWI ARYANI',
  '2008-07-01',
  'P',
  'TARISAH',
  '084934317906',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Bekerja] [ALAMAT:Jl. Cianjur, RT 1/RW 4] [RT:1] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:SMAS NAHDLATUL ULAMA] [KELAS:Kelas 10 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 0084254196 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #14: MUHAMAD AL FARIZY (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'e49a8e80-4be7-4995-9061-fe058f2acc28',
  'MUHAMAD AL FARIZY',
  '2018-07-01',
  'L',
  'ALIYA PUSPITA LUKASARI',
  '083134166919',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 3/RW 3] [RT:3] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #15: DIMAS BAYU ADJIE (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '24905834-d7b5-4c01-9fa6-b50d78aa6251',
  'DIMAS BAYU ADJIE',
  '2009-07-01',
  'L',
  'ERWANINGSIH',
  '088757503755',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Tidak ada biaya] [ALAMAT:Medang Lestari, RT 8/RW 1] [RT:8] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD N MEDANG] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0094032755 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #16: MUHAMMAD AZMIL ABROR (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'cf365192-305f-455c-92e1-6b2f53450811',
  'MUHAMMAD AZMIL ABROR',
  '2009-07-01',
  'L',
  'SITI AMRIYAH',
  '088478499990',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 7/RW 3] [RT:7] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SPM Madrasah Islamiyah Salafiyah Riyadlotul Uqul MISRIU Al Falah Wustha] [KELAS:Kelas 9 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 3097706110 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #17: MOHAMMAD ARIF ZAENUI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1143d56b-d91f-492d-a83e-4071f696e7a2',
  'MOHAMMAD ARIF ZAENUI',
  '2012-07-01',
  'L',
  'AL MA''IDAH',
  '084178297865',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. BEKASI GANG BUNTU, RT 6/RW 4] [RT:6] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #18: AZZA ROMADHONA AGNESIA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '59c23109-836f-48b4-9604-98c8a71bca58',
  'AZZA ROMADHONA AGNESIA',
  '2010-07-01',
  'P',
  'MASLIHATUN JANNAH',
  '086820922675',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. MOH. TOHA, RT 3/RW 5] [RT:3] [RW:5] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #19: ASHFIYA LU'LU QONITA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '469b362e-74b5-4f71-ae43-dfb899e22235',
  'ASHFIYA LU''LU QONITA',
  '2018-07-01',
  'P',
  'FATIMATUZ ZAHRO',
  '089760344653',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 3/RW 3] [RT:3] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #20: REVALIA RAHMA WATI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '0a288de7-950c-4b9a-889f-1db026199917',
  'REVALIA RAHMA WATI',
  '2010-07-01',
  'P',
  'ERNAWATI',
  '084807127680',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:M TOHA GG PEKING NO 32, RT 4/RW 2] [RT:4] [RW:2] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP NEGERI 18] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0107700964 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #21: AZKA AL DZIKRI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ce2a2ce5-0493-44b2-8c42-86feb625231e',
  'AZKA AL DZIKRI',
  '2014-07-01',
  'L',
  'WINARSIH',
  '084498487792',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:JL. ANGGREK 3 BLOK-23/28, RT 2/RW 2] [RT:2] [RW:2] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD N KUTABUMI III] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3137924952 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #22: VALENSI AKHMAD ROFIQ (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '050970cf-0ebc-4c6b-999f-a6b1712301ad',
  'VALENSI AKHMAD ROFIQ',
  '2010-07-01',
  'L',
  'ALIYAH',
  '088375892258',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 5/RW 3] [RT:5] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:SMK ASTRINDO KOTA TEGAL] [KELAS:Kelas 10 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 0105651359 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #23: HUSAIN AL GHIFARI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'e0124167-de85-4e83-97af-8e1d764cbbea',
  'HUSAIN AL GHIFARI',
  '2011-07-01',
  'L',
  'TRI PENI KUSUMASTUTI',
  '085622617927',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Salak Kelurahan Pekauman Kecamatan Tegal Barat Kota Tegal, RT 1/RW 7] [RT:1] [RW:7] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:PKBM MUTIARA SHAHABAT] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 2113913187 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #24: DEDE YUSUF EFENDI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '7806ad9c-e264-4071-a63c-36b7a1f88234',
  'DEDE YUSUF EFENDI',
  '2010-07-01',
  'L',
  'NURBAETI',
  '087276035294',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 1/RW 6] [RT:1] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SPM Wustha Pondok Pesantren Assalafiyah] [KELAS:Kelas 9 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0107457768 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #25: WAFIK AULIA MARSYA HAFIDZAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '41c1dece-6345-4fc3-8633-34e9a8192821',
  'WAFIK AULIA MARSYA HAFIDZAH',
  '2008-07-01',
  'P',
  'NURIPAH',
  '089107081719',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. CIPTO MANGUNKUSUMO GG.PUYUH, RT 3/RW 4] [RT:3] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #26: SANDI DWI AFRIANTO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '10ef293d-d9db-4197-8fe9-06a79a1b642a',
  'SANDI DWI AFRIANTO',
  '2008-07-01',
  'L',
  'SARITI',
  '089162306143',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jalan Bekasi, RT 3/RW 6] [RT:3] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:SMK MUHAMMADIYAH 2 TEGAL] [KELAS:Kelas 12 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 3081639185 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #27: SYAMIL NURUL HADI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '408f41e2-2c4c-414f-be6a-36d13d03a4e7',
  'SYAMIL NURUL HADI',
  '2012-07-01',
  'P',
  'SAIROH',
  '085187445912',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 1/RW 5] [RT:1] [RW:5] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #28: SUSANA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '971fa434-add6-4368-8115-319dfec3a3aa',
  'SUSANA',
  '2012-07-01',
  'P',
  'WARNINGSIH',
  '087693905493',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Tidak mau bersekolah] [ALAMAT:-, RT -/RW -] [RT:Belum Tahu] [RW:Belum Tahu] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:MIS Ihsaniyah 01 Kaligangsa] [KELAS:Kelas 4 SD/MI/Paket A DO] [KET:NISN: 3129913874 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #29: GENDHIS SYABILA PUTRI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '13fea7ef-4f3f-4aca-a5e6-ef9839dca171',
  'GENDHIS SYABILA PUTRI',
  '2014-07-01',
  'P',
  'ROIDAH',
  '086997015298',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Kh Umar Rawailat, RT 2/RW 1] [RT:2] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SDS ISLAM AN-NUR] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0132725832 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #30: NAFIS MUBAROK (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '9f110f66-f91f-4453-bc1d-9f47adeec7aa',
  'NAFIS MUBAROK',
  '2009-07-01',
  'L',
  'ROHMAH',
  '081421510349',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 3/RW 5] [RT:3] [RW:5] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #31: ADE PRASETIO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1ea87092-48d4-451e-a991-930c35aecdf1',
  'ADE PRASETIO',
  '2010-07-01',
  'L',
  'SUNARTI',
  '089813938764',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. MOH. TOHA, RT 4/RW 3] [RT:4] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #32: AMIRA DZILGHITA MA'ARIEF (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '4b80054e-649e-4062-8b63-095f687551fc',
  'AMIRA DZILGHITA MA''ARIEF',
  '2008-07-01',
  'P',
  'LAELI NURHAYATI',
  '088695898358',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT -/RW -] [RT:Belum Tahu] [RW:Belum Tahu] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:MAN TEGAL] [KELAS:Kelas 10 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 0089370975 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #33: DWI ELVANO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '69e1b529-15f5-433b-99d2-f65954fe5ac9',
  'DWI ELVANO',
  '2018-07-01',
  'L',
  'INTAN SARI',
  '087792361608',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Limo Raya, RT 3/RW 6] [RT:3] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD ISLAM AL-HIDAYAH CINERE] [KELAS:Kelas 1 SD/MI/Paket A DO] [KET:NISN: 3184533705 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #34: QATHRUNNADA MAHFUDZ (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '74e14beb-8433-4001-a850-543932531a4a',
  'QATHRUNNADA MAHFUDZ',
  '2009-07-01',
  'P',
  'SITI KHODIJAH',
  '085371246890',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 6/RW 4] [RT:6] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #35: NOVITA AINUN ZHARA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '28678e00-5d7f-4b5d-9707-9b2daab20324',
  'NOVITA AINUN ZHARA',
  '2018-07-01',
  'P',
  'ENY KUSRINI',
  '088902220522',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 6/RW 1] [RT:6] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #36: M. NIZAR NUR HIDAYAT (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'fd377b7d-1bfc-487d-903d-f1f8bef4d359',
  'M. NIZAR NUR HIDAYAT',
  '2010-07-01',
  'L',
  'KUNAENI',
  '087406193554',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. MOH. TOHA, RT 5/RW 4] [RT:5] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #37: M AMIN AFANDI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '445b17ea-0ba1-4cae-849b-921aeecadac2',
  'M AMIN AFANDI',
  '2015-07-01',
  'L',
  'KARYU',
  '082039080578',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 5/RW 1] [RT:5] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #38: ALIFFA LUTHFIYANA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '3d60b0ab-4de7-4013-a968-eaa1b168f9f5',
  'ALIFFA LUTHFIYANA',
  '2014-07-01',
  'P',
  'WARIDAH',
  '088230886172',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:KALIGANGSA, RT 3/RW 2] [RT:3] [RW:2] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KALIGANGSA 1] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0145065512 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #39: ALIFIYAH IKROMUNISA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '5a3dcbcb-624d-4c34-957f-cf2dfa82772e',
  'ALIFIYAH IKROMUNISA',
  '2013-07-01',
  'P',
  'KHAERUNISAH',
  '088449804441',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 7/RW 3] [RT:7] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MIS Ihsaniyah 01 Kaligangsa] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3132728159 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #40: JAWAD KHAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '72c65b6d-4770-43fd-a397-f96641c41f1a',
  'JAWAD KHAN',
  '2014-07-01',
  'L',
  'FITRIANI',
  '083648967145',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL CIPTO MANGUNKUSUMO 2 , RT 1/RW 2] [RT:1] [RW:2] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #41: RIZA JHULFIKKRI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '8d0728c1-08a0-48a5-91dd-9b8500573dea',
  'RIZA JHULFIKKRI',
  '2010-07-01',
  'L',
  'WULANSARI',
  '084383581964',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Kp.Rawasentul, RT 2/RW 2] [RT:2] [RW:2] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD NEGERI SERTA JAYA 05] [KELAS:Kelas 5 SD/MI/Paket A DO] [KET:NISN: 0109385551 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #42: ALYA KHOERUN NISHA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'c9d105c3-a4b3-4039-a5f5-4238579a9634',
  'ALYA KHOERUN NISHA',
  '2012-07-01',
  'P',
  'WARYUNAH',
  '087049948306',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 4/RW 5] [RT:4] [RW:5] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #43: MUHAMMAD ASYRAF REVANO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'c3b9a0da-2b60-4d01-859a-4d2865485dd2',
  'MUHAMMAD ASYRAF REVANO',
  '2019-07-01',
  'L',
  'TARMUNAH',
  '088327114938',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. MOH TOHA GANG BRANJANGAN, RT 3/RW 3] [RT:3] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #44: ALMIRA ASHADIYA KHIRANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a45d2638-e986-43a1-9e36-2ff2343fc0d2',
  'ALMIRA ASHADIYA KHIRANI',
  '2020-07-01',
  'P',
  'TONISAH',
  '082632756457',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. MOH. TOHA GG. CABAK, RT 4/RW 2] [RT:4] [RW:2] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #45: MOH NEVLIN PRATAMA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ecfc2ab6-65bc-4fe5-bc51-38aa27d25405',
  'MOH NEVLIN PRATAMA',
  '2012-07-01',
  'L',
  'KARTIKA SARI',
  '083165025219',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Masalah Kesehatan / Penyandang Disabilitas] [ALAMAT:KALIGANGSA, RT 5/RW 3] [RT:5] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #46: NAYLA MUAZAHRA ULFA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1167162f-465a-4701-8dd2-b636f037e316',
  'NAYLA MUAZAHRA ULFA',
  '2016-07-01',
  'P',
  'AMAROYA',
  '088206812243',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 1/RW 6] [RT:1] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #47: KIKI FAREL ARDIANSYAH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'd9b475d7-fa4e-44de-9fa8-dd3b115496b3',
  'KIKI FAREL ARDIANSYAH',
  '2008-07-01',
  'L',
  'SAIDAH',
  '086449456303',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 3/RW 5] [RT:3] [RW:5] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #48: MUHAMMAD FATHURROHMAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'da174c1e-3e44-49b4-b80e-028fe1a3df69',
  'MUHAMMAD FATHURROHMAN',
  '2014-07-01',
  'L',
  'ALIYAH ARYANTI',
  '084287757440',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Kaligangsa, RT 1/RW 1] [RT:1] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KALIGANGSA 3] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3145060244 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #49: NAFIZA ALIFIA FARZANAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '64e3b631-ac1b-4f5f-9f70-a8bbd4e8e7fe',
  'NAFIZA ALIFIA FARZANAH',
  '2016-07-01',
  'P',
  'KUNIPAH',
  '083997861646',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:JL. KALIGANGSA, RT 6/RW 1] [RT:6] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD MUHAMMADIYAH 49 JAKARTA] [KELAS:Kelas 4 SD/MI/Paket A DO] [KET:NISN: 3167076962 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #50: ACHMAD SYAHRONIPALAMBY (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '978012a8-3b7f-41ce-b0d3-ff34a94b2ee0',
  'ACHMAD SYAHRONIPALAMBY',
  '2009-07-01',
  'L',
  'MUINAH',
  '083266957230',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 5/RW 3] [RT:5] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #51: FAHMI MALIK AINUDIN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'd9f66973-a434-4524-bdcc-333fb6d32195',
  'FAHMI MALIK AINUDIN',
  '2014-07-01',
  'L',
  'DARWATI',
  '086782991436',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:KALIGANGSA, RT 2/RW 4] [RT:2] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KALIGANGSA 1] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0148982984 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #52: M.MAKFI FARHAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '05d5f788-5324-40a6-b9c3-90c701d26e37',
  'M.MAKFI FARHAN',
  '2011-07-01',
  'L',
  'ERNAWATI',
  '086166667840',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Masalah Kesehatan / Penyandang Disabilitas] [ALAMAT:Jl.Sektor 4, RT 0/RW 0] [RT:Belum Tahu] [RW:Belum Tahu] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KARANG TENGAH 4] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3111342204 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #53: ARSYANA ZAHWA CALLYSA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '96fd8609-cca4-4261-b890-ce8b3a71da1e',
  'ARSYANA ZAHWA CALLYSA',
  '2020-07-01',
  'P',
  'SITI RUBAIAH',
  '084839274671',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. MOH. TOHA GG.PUTER, RT 4/RW 5] [RT:4] [RW:5] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #54: BELVIA KEY SYAWAL (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '54e492d9-d4e7-494c-af8a-28e7c6d0afac',
  'BELVIA KEY SYAWAL',
  '2020-07-01',
  'P',
  'KURNIATI',
  '084807254694',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:GANG BLEKOK, RT 4/RW 1] [RT:4] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #55: NESYA ZAHRA PUSPITA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '4788efce-ac03-4b4b-831d-ee1e94be59ae',
  'NESYA ZAHRA PUSPITA',
  '2009-07-01',
  'P',
  'MUNIROH',
  '083089093451',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 4/RW 4] [RT:4] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #56: MAKIA ISAURA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'c61c52b7-0ef5-405b-b228-e31c973ddf2b',
  'MAKIA ISAURA',
  '2012-07-01',
  'P',
  'EKA OKTAVIANA FAHROZI',
  '081838462029',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. BEKASI SELATAN, RT 2/RW 6] [RT:2] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #57: MEISHA QEELA AYRIANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'd5eaae8e-6f39-43ae-aafe-de572cf6babf',
  'MEISHA QEELA AYRIANI',
  '2013-07-01',
  'P',
  'RODOH',
  '083263024190',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 6/RW 3] [RT:6] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MIS IHSANIYAH 02 KALIGANGSA] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0134815650 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #58: FAJAR ZAKIYATUL UMMAM (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '26fc235f-b331-42cd-b50d-ed3870a8c8dd',
  'FAJAR ZAKIYATUL UMMAM',
  '2009-07-01',
  'L',
  'USWATUN KASANAH',
  '086561831604',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 2/RW 3] [RT:2] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #59: ABIZARD MAULANA ARSHAQ (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '60e8047c-14eb-4bd2-a7bd-119c5658f420',
  'ABIZARD MAULANA ARSHAQ',
  '2020-07-01',
  'L',
  'NURJANAH',
  '086165257893',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 4/RW 3] [RT:4] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #60: MADINA ISAURA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'b815eecb-eb41-4368-a4fd-f3b7a844523c',
  'MADINA ISAURA',
  '2012-07-01',
  'P',
  'EKA OKTAVIANA FAHROZI',
  '087429594820',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. BEKASI SELATAN, RT 2/RW 6] [RT:2] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #61: FAREL ARYA SAPUTRA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ce61a5f7-aff1-450c-ab3e-b9623a05dc1b',
  'FAREL ARYA SAPUTRA',
  '2020-07-01',
  'L',
  'ARIAH',
  '084108617469',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. CIPTO MANGUNKUSUMO GG. KOLIBRI, RT 8/RW 4] [RT:8] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #62: DIMAS SAPUTRA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '4776140b-7f8f-491c-be2e-5a6809613b0f',
  'DIMAS SAPUTRA',
  '2008-07-01',
  'L',
  'KORIYAH',
  '086175380756',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Bekerja] [ALAMAT:KALIGANGSA, RT 2/RW 5] [RT:2] [RW:5] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KALIGANGSA 04] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0085807257 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #63: MOHAMMAD RASYA AZRILLA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'c6a964e0-11a4-4866-bc81-969c8e1fa89a',
  'MOHAMMAD RASYA AZRILLA',
  '2011-07-01',
  'L',
  'ETI KURNIASIH',
  '085498333496',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 1/RW 6] [RT:1] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MTSS RAUDHATUL ULUM] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0101434515 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #64: MUHAMMAD RAHMANSYAH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'cbccd220-0cc3-4003-91aa-056b244c190f',
  'MUHAMMAD RAHMANSYAH',
  '2019-07-01',
  'L',
  'DARWATI',
  '081821115667',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 2/RW 4] [RT:2] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #65: MARYAM SABILLA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '591a8545-fe8e-4143-ad48-bf510826d89c',
  'MARYAM SABILLA',
  '2009-07-01',
  'P',
  'SAIROH',
  '085019615999',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 1/RW 5] [RT:1] [RW:5] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #66: BANYU LATIFAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '04d27b8d-f9e0-482c-9d85-1732981a7827',
  'BANYU LATIFAH',
  '2017-07-01',
  'P',
  'DEWI CITRA AYU',
  '084874066876',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. CIANJUR, RT 5/RW 3] [RT:5] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #67: REYKHAN DWI FIRMANSYAH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '5ef06e2d-8ee2-4a9d-8b9f-90eccc455b2f',
  'REYKHAN DWI FIRMANSYAH',
  '2012-07-01',
  'L',
  'TOHAYAH',
  '081349811644',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Tidak mau bersekolah] [ALAMAT:KALIGANGSA, RT 4/RW 3] [RT:4] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD NEGERI KALIGANGSA 04] [KELAS:Kelas 4 SD/MI/Paket A DO] [KET:NISN: 0118286371 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #68: ARDAN FAIZAL YAMIN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a7fc4a4c-11fa-4cb6-9632-9e8c01b4045f',
  'ARDAN FAIZAL YAMIN',
  '2008-07-01',
  'L',
  'VIVI KUSUMA DEWI',
  '084942910652',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 2/RW 5] [RT:2] [RW:5] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #69: MADA ANDREYANTO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '5386d835-deeb-4992-b834-0206edb074aa',
  'MADA ANDREYANTO',
  '2009-07-01',
  'L',
  'RUSTI',
  '084532843833',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:KALIGANGSA, RT 2/RW 3] [RT:2] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:SMK ASTRINDO KOTA TEGAL] [KELAS:Kelas 11 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 0099060336 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #70: AHMAD AL GHIFARI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'fa4f3e09-51e3-49de-b474-4a0480e5f08c',
  'AHMAD AL GHIFARI',
  '2020-07-01',
  'L',
  'SRI HANDAYANI',
  '087030858724',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 5/RW 2] [RT:5] [RW:2] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #71: EKA OKTAVIA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'dc230dfd-9ccf-4378-be3c-09642f1eb9ea',
  'EKA OKTAVIA',
  '2007-07-01',
  'P',
  'LINDAWATI',
  '082059355423',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Bekerja] [ALAMAT:Jl. Bekasi RT 003 RW 006, RT -/RW -] [RT:3] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP NEGERI 18] [KELAS:Kelas 8 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0073743380 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #72: PELANGI DIVA KAMARATIH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '77041e08-c784-4da6-a470-ee53d3914e0c',
  'PELANGI DIVA KAMARATIH',
  '2011-07-01',
  'P',
  'SRIHENI',
  '085606045117',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 3/RW 1] [RT:3] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MTSS RAUDHATUL ULUM] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0113171558 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #73: RADITYA AL- FIKRI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '86db2182-6fe9-4282-a81f-d921adce4f16',
  'RADITYA AL- FIKRI',
  '2019-07-01',
  'L',
  'TUNISAH SAPUTRI',
  '082740056998',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 4/RW 3] [RT:4] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #74: NIKKO ARY SYAHPUTRA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '68d80021-4c17-4e41-a7a7-e2198716c122',
  'NIKKO ARY SYAHPUTRA',
  '2012-07-01',
  'L',
  'DARNINGSIH',
  '084270488192',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 7/RW 4] [RT:7] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #75: DWI FEBRIYAN MAULIDIN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1b437df1-a82d-4bd7-b9b4-adc0818b97b3',
  'DWI FEBRIYAN MAULIDIN',
  '2011-07-01',
  'L',
  'ROIDAH',
  '082072830443',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Mengundurkan Diri] [ALAMAT:Dr Ciptomangunkusumo, RT 2/RW 1] [RT:2] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP NEGERI 18] [KELAS:Kelas 8 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0119136948 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #76: FAHRUL ZULKARNAIN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a45f2d99-86b6-4874-91ac-77aca67198a5',
  'FAHRUL ZULKARNAIN',
  '2010-07-01',
  'L',
  'WARKHATUN',
  '085599902367',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. BEKASI SELATAN, RT 1/RW 6] [RT:1] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #77: TEGUH SUGIARTO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '6511994b-366b-4bee-b1a8-33c41158ea41',
  'TEGUH SUGIARTO',
  '2009-07-01',
  'L',
  'CARPINAH',
  '081212382248',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. CIPTO MK 2 GG. KEDASIH, RT 5/RW 2] [RT:5] [RW:2] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #78: NAILA AZIZAH PUTRI YANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '83825619-43e7-4520-8ec3-9f5f029cf09c',
  'NAILA AZIZAH PUTRI YANI',
  '2009-07-01',
  'P',
  'TUTIYANI',
  '081061117373',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Tidak mau bersekolah] [ALAMAT:Kaligangsa, RT 4/RW 1] [RT:4] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD NEGERI KALIGANGSA 1] [KELAS:Kelas 6 SD/MI/Paket A DO] [KET:NISN: 0096260255 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #79: JAYA KUSUMAH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'b45bfdd0-f391-412e-97e9-f43762a22c1a',
  'JAYA KUSUMAH',
  '2010-07-01',
  'L',
  'ROKHAYATI',
  '083044082780',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Tidak mau bersekolah] [ALAMAT:-, RT -/RW -] [RT:Belum Tahu] [RW:Belum Tahu] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:MTSS RAUDHATUL ULUM] [KELAS:Kelas 8 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0109626431 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #80: KHOIRUL ANAM (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'b6a6f0ae-d621-4c44-9b4b-cd08ed5cfc84',
  'KHOIRUL ANAM',
  '2009-07-01',
  'L',
  'KUNAENI',
  '088559227742',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Tidak mau bersekolah] [ALAMAT:kaligangsa, RT 2/RW 6] [RT:2] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP MUHAMMADIYAH 2] [KELAS:Kelas 8 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 3098629485 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #81: PRATA BILL JANNAT (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '4f3753bb-4788-4e92-9bb4-cd5aa64c54fa',
  'PRATA BILL JANNAT',
  '2015-07-01',
  'L',
  'CITRA DWI WAHYUNI',
  '082846244770',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Masalah Kesehatan / Penyandang Disabilitas] [ALAMAT:GG PUYUH NO.63, RT 2/RW 4] [RT:2] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #82: ANINDITA DELIA PUTRI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a4896cd9-c458-4f13-ac23-7af46bb9273e',
  'ANINDITA DELIA PUTRI',
  '2008-07-01',
  'P',
  'SAIRAH',
  '084362243129',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. BEKASI, RT 1/RW 6] [RT:1] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #83: ZAHRA AULIYA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '305ae94d-19ee-4a72-b5ba-bc456bbcc2a5',
  'ZAHRA AULIYA',
  '2009-07-01',
  'P',
  'ESTI TRI WURIYANI',
  '088872973007',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Kaligangsa Asri Raya Timur No 13, RT 3/RW 7] [RT:3] [RW:7] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:PKBM KI HAJAR DEWANTARA] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0097114048 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #84: AHMAD AZZAM RASYADI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '6e72067e-7ab4-495b-85de-3cf31042df20',
  'AHMAD AZZAM RASYADI',
  '2014-07-01',
  'L',
  'SITI KHODIJAH',
  '088068933197',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 1/RW 2] [RT:1] [RW:2] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MIS Ihsaniyah 01 Kaligangsa] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3144135246 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #85: PRISKA APRILIANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'e8650fa9-85d0-4956-87fb-4bcad7413b0e',
  'PRISKA APRILIANI',
  '2009-07-01',
  'P',
  'SANIDAH',
  '084587491508',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:KALIGANGSA, RT 2/RW 5] [RT:2] [RW:5] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:SMK ISTEK KALIGANGSA] [KELAS:Kelas 11 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 3090555467 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #86: MUHAMMAD FATIH HAMIZAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '08172df0-89a6-4403-9632-9b273148d3f5',
  'MUHAMMAD FATIH HAMIZAN',
  '2020-07-01',
  'L',
  'NUR AENI',
  '089865478983',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 1/RW 1] [RT:1] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #87: SUWANTO ALIYUDIN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '42a15d2e-8382-4786-95c5-fcf781a7908e',
  'SUWANTO ALIYUDIN',
  '2010-07-01',
  'L',
  'SEPTI YUNANI',
  '089212405213',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 1/RW 3] [RT:1] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MTSS RAUDHATUL ULUM] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0109813513 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #88: RISMA KUSUMA DEWI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '67a51de6-c4ac-42c1-829a-55e81c586d54',
  'RISMA KUSUMA DEWI',
  '2011-07-01',
  'P',
  'SRI PARIAH',
  '085853545858',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 2/RW 5] [RT:2] [RW:5] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MTS AL FALAH] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0113043890 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #89: MUHAMMAD FAKHRI RAMADHAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1d6d8d97-52c6-42fb-8466-ed7dbb2bdbde',
  'MUHAMMAD FAKHRI RAMADHAN',
  '2020-07-01',
  'L',
  'KUSWATI',
  '084172549251',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:GANG KEDASIH NO.42, RT 6/RW 2] [RT:6] [RW:2] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #90: SHELLA FRISHILIA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '7be3d5a2-2ef2-4e23-9df6-32f5c9079539',
  'SHELLA FRISHILIA',
  '2009-07-01',
  'P',
  'SANAWIYAH',
  '082691410527',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 3/RW 6] [RT:3] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #91: KHASYA SALMA VIRA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '495ac762-4451-43e4-9607-4c05e2fa90a8',
  'KHASYA SALMA VIRA',
  '2012-07-01',
  'P',
  'SITI MAFRICHA',
  '082997475733',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. BEKASI SELATAN, RT 2/RW 6] [RT:2] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #92: HABIBI ABDUL MARDANI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '172e0055-83b9-42b5-91d4-527bd2adfa46',
  'HABIBI ABDUL MARDANI',
  '2009-07-01',
  'L',
  'SHOFIYAH',
  '086792090540',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 8/RW 4] [RT:8] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #93: HANAN RAFISQY ALFARIQ (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '07cec616-992c-4854-8946-71c1088615e0',
  'HANAN RAFISQY ALFARIQ',
  '2020-07-01',
  'L',
  'WININGSIH',
  '087047148786',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 6/RW 4] [RT:6] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #94: NAUFFAN HASWAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '4ba9ae0a-0463-4cdd-8fd9-c46f262ec83c',
  'NAUFFAN HASWAN',
  '2008-07-01',
  'L',
  'RESTY HANDAYANI',
  '088320587233',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL.DR CIPTO MANGUNKUSUMO 2, RT 2/RW 1] [RT:2] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #95: M. AKBAR AWALUDZIANSYAH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '5e159a4d-cb20-4d63-8598-25bfe89734ff',
  'M. AKBAR AWALUDZIANSYAH',
  '2009-07-01',
  'L',
  'EKA SURNIATI',
  '081465342280',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. BEKASI, RT 1/RW 6] [RT:1] [RW:6] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #96: MUHAMMAD THOIFUR BUSTHOMI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'bf613f61-76fe-4605-9ac4-c8135f9f6aad',
  'MUHAMMAD THOIFUR BUSTHOMI',
  '2015-07-01',
  'L',
  'NURKHAYATI',
  '088895172615',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 3/RW 5] [RT:3] [RW:5] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #97: MUHAMMAD SALMAN AL FATIH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a4e20282-64c4-4263-9651-79caacd683be',
  'MUHAMMAD SALMAN AL FATIH',
  '2020-07-01',
  'L',
  'HILDAH ALQONITAH',
  '081327992206',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 1/RW 1] [RT:1] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #98: KAFI ISNA AULADI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'e78aa8e6-580a-44b2-9105-fd6ba1503f4e',
  'KAFI ISNA AULADI',
  '2009-07-01',
  'L',
  'UMI KULSUM',
  '089253403914',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Kaligangsa, RT 1/RW 3] [RT:1] [RW:3] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:SMK ISTEK KALIGANGSA] [KELAS:Kelas 11 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 3097277441 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #99: WANDI SAPUTRA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '34c54398-d97e-46f5-939d-26752437c272',
  'WANDI SAPUTRA',
  '2010-07-01',
  'L',
  'WARNINGSIH',
  '081771040638',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 8/RW 4] [RT:8] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MTSS RAUDHATUL ULUM] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0108870949 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #100: REYSHA NUR AMALA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'c488b4fc-ead5-4f5f-8ddc-f0860c34c31c',
  'REYSHA NUR AMALA',
  '2020-07-01',
  'P',
  'SURIAH',
  '081802125242',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 1/RW 2] [RT:1] [RW:2] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #101: AHMAD AZAM KHOIRUMAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '69b05ac7-badb-45e4-964e-8dd39699dc6d',
  'AHMAD AZAM KHOIRUMAN',
  '2010-07-01',
  'L',
  'KASEM',
  '081061650050',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 5/RW 2] [RT:5] [RW:2] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MTSS NU PUTRA 2 BUNTET PESANTREN] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 3108961792 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #102: FAKHRIE ZHAFRAN KHAIRY (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '955f103c-c3ad-4632-8437-5f4323a17eec',
  'FAKHRIE ZHAFRAN KHAIRY',
  '2013-07-01',
  'L',
  'ITA DIANA SARI',
  '082820528065',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:KALIGANGSA, RT 7/RW 4] [RT:7] [RW:4] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #103: AQIL BILL AKBAR ISLAMI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a8509afe-b476-44b3-850a-884f476aee32',
  'AQIL BILL AKBAR ISLAMI',
  '2010-07-01',
  'L',
  'SURIAH',
  '083161070888',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 1/RW 1] [RT:1] [RW:1] [KEL:Kaligangsa] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:Madrasah Hidayatul Mubtadi''en Pesantren Lirboyo] [KELAS:Kelas 9 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0118462904 | Mohon untuk dilakukan verval]',
  '06029e79-783f-4962-85d6-b591c797172e',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:43:28.549+00:00'
) ON CONFLICT (id) DO NOTHING;

