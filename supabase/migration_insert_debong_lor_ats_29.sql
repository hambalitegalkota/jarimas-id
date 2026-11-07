-- ==============================================================================
-- JARIMAS-ID: REKAPITULASI & SINKRONISASI 29 DATA ANAK TIDAK SEKOLAH (ATS)
-- KELURAHAN DEBONG LOR, KECAMATAN TEGAL BARAT, KOTA TEGAL
-- Sumber Data: Rekap Data Verval ATS - Debong Lor (Pusdatin Kemendikdasmen)
-- ==============================================================================

-- Anak #1: NIKY AINUN ZAKIAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a998ab49-1d21-487d-bd1c-fcfe39e429b9',
  'NIKY AINUN ZAKIAH',
  '2010-07-01',
  'P',
  'RATNA DEWI',
  '081499608790',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Tidak ada biaya] [ALAMAT:JL.Kompol suprapto Gg Janoko, RT 4/RW 0] [RT:4] [RW:Belum Tahu] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KEMANDUNGAN 1 TEGAL] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0105147715 | Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.242+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #2: MUFIDATUL MAULA MUNAWAR (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'd3c69a88-1494-49cf-9183-b72f60e662f9',
  'MUFIDATUL MAULA MUNAWAR',
  '2011-07-01',
  'P',
  'SITI ULFIYAH',
  '088163803668',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Melanjutkan ke Pondok Pesantren atau Lainnya] [ALAMAT:Jalan Metro Gg. Setyaki No. 3A, RT 1/RW 1] [RT:1] [RW:1] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD IT USAMAH] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0114887750 | Pondok Pesantren Al-Ikhsan Slawi]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #3: BINTANG DAVINIO KHIMMORA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '0b3e419d-b771-4630-b50c-9085bd48bbdf',
  'BINTANG DAVINIO KHIMMORA',
  '2020-07-01',
  'L',
  'SEPTANIA NUREKA PUTRI',
  '085682719859',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:GANG SRIKANDI, RT 4/RW 2] [RT:4] [RW:2] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #4: ADINDA CAHYA MAHARANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ea781dbb-f58c-4299-a94d-bab81447239d',
  'ADINDA CAHYA MAHARANI',
  '2011-07-01',
  'P',
  'DIANA ARIEFIATHI',
  '082243367416',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya,] [ALAMAT:-, RT -/RW -] [RT:Belum Tahu] [RW:Belum Tahu] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP NEGERI 13] [KELAS:Kelas 8 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0104001689 | 20329825]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #5: FEBRI ALFINA RAHMAWATI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '55572ef8-ca4c-403b-90d2-31427d782b21',
  'FEBRI ALFINA RAHMAWATI',
  '2010-07-01',
  'P',
  'RATNAWATI',
  '089268138136',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:PERUM METRO II NO. 47, RT 7/RW 1] [RT:7] [RW:1] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #6: BILAL NUR MUKMININ (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '5040f1b0-2bd7-4442-b1a3-6ba4c0f24249',
  'BILAL NUR MUKMININ',
  '2019-07-01',
  'L',
  'CAHYUNI',
  '088543935070',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. KOMPOL SUPRAPTO GG.JANOKO, RT 4/RW 1] [RT:4] [RW:1] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #7: ANGELINA PANDOJO LUKMAN (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'f9c6a787-3bda-41d0-8c6e-ad89f0de03cd',
  'ANGELINA PANDOJO LUKMAN',
  '2008-07-01',
  'P',
  'ELYZABET',
  '081938632771',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Lainnya, Pindah Di Jakarta] [ALAMAT:JL. KAPT. SUDIBYO NO. 38 B, RT 4/RW 3] [RT:4] [RW:3] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #8: WIDIARTO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '77a0615c-3326-4f11-8572-c52171857d76',
  'WIDIARTO',
  '2020-07-01',
  'L',
  'SARILAH',
  '087398913299',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:GG. ARJUNA, RT 4/RW 2] [RT:4] [RW:2] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #9: AULIA TSABITUN NISA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '24f00aa1-b8b8-4c2d-a398-02b92a7c4f71',
  'AULIA TSABITUN NISA',
  '2009-07-01',
  'P',
  'PUDJI HASTARI',
  '081364149197',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Lainnya, Pindah Di Slawi] [ALAMAT:Jalan. Kompol Suprapto Gg. Sumbodro, RT 4/RW 2] [RT:4] [RW:2] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP NEGERI 6 TEGAL] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0085171623 | Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #10: MUHAMMAD GIGIH IBROHIM (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '62ba1de4-7c84-4efb-bb73-095b80c8f621',
  'MUHAMMAD GIGIH IBROHIM',
  '2017-07-01',
  'L',
  'LILIS SUGIARTI',
  '084468596081',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. METRO, RT 1/RW 1] [RT:1] [RW:1] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #11: MUIZUL HIDAYAT MUNAWAR (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ec34a22a-e1b5-4b74-9864-9e1457f2af3b',
  'MUIZUL HIDAYAT MUNAWAR',
  '2008-07-01',
  'L',
  'SITI ULFIYAH',
  '085424351065',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Melanjutkan ke Pondok Pesantren atau Lainnya] [ALAMAT:-, RT -/RW -] [RT:Belum Tahu] [RW:Belum Tahu] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MIS DARUNNAJAH] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0085614388 | Ponpes At-Tauhidiyah Giren]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #12: MUHAMMAD TONTOWI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '484807ff-bd98-4e81-a470-95a184982c32',
  'MUHAMMAD TONTOWI',
  '2013-07-01',
  'L',
  'NURJANAH',
  '082104804039',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Dewi Sartika, RT 5/RW 2] [RT:5] [RW:2] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI KEMANDUNGAN 1 TEGAL] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3134119990 | Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #13: KHALISA PUTRI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'c41ecb81-5b71-47c6-9a93-3e743a3dfee3',
  'KHALISA PUTRI',
  '2020-07-01',
  'P',
  'MARIA ULFA',
  '085088018156',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL.KOMPOL.SUPRAPTO GG.JANOKO, RT 4/RW 1] [RT:4] [RW:1] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #14: TAZKIA SYIFA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '3bda8b80-5f4a-4bf8-84e2-d5e5be954985',
  'TAZKIA SYIFA',
  '2019-07-01',
  'P',
  'NANIK ASTRIYANI',
  '089841604360',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. GATOT SUBROTO, RT 2/RW 3] [RT:2] [RW:3] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #15: ERWIN ARDIANSYAH WIJAYA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '28c2aadc-fb68-4b69-a37c-988b106b66df',
  'ERWIN ARDIANSYAH WIJAYA',
  '2020-07-01',
  'L',
  'RISQI WAHYU AMBARWATI',
  '087549991116',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. KOMPOL. SUPRAPTO GG. JANOKO, RT 5/RW 1] [RT:5] [RW:1] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #16: NAILUL ZULFA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '2b32242d-7438-403d-8199-681c6053fedf',
  'NAILUL ZULFA',
  '2013-07-01',
  'P',
  'SA''DIYAH',
  '083877932023',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:JL. METRO NO.13, RT 2/RW 2] [RT:2] [RW:2] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI PESURUNGAN KIDUL 2 TEGAL] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3131664911 | Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.262+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #17: FERDIYANSYAH DWI PRASETIO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '251b9e04-0835-4202-a245-e116c3978cff',
  'FERDIYANSYAH DWI PRASETIO',
  '2008-07-01',
  'L',
  'FUDJIARTI',
  '082109709212',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Bekerja] [ALAMAT:Jalan Kompol Suprapto Gang Sumbodro, RT 5/RW 2] [RT:5] [RW:2] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP NEGERI 6 TEGAL] [KELAS:Kelas 8 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0087354662 | Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.263+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #18: ADE WIJAYA KUSUMA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '4429cd35-eaca-4777-b716-0a8cab89fd4c',
  'ADE WIJAYA KUSUMA',
  '2013-07-01',
  'L',
  'RANTI',
  '086523060849',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:JL. METRO, RT 2/RW 2] [RT:2] [RW:2] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD NEGERI KEMANDUNGAN 3 TEGAL] [KELAS:Kelas 5 SD/MI/Paket A DO] [KET:NISN: 0124323677 | Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.263+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #19: MAYA AZIZAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '8ed8e42c-a5ef-4763-91e2-a40dbc871e66',
  'MAYA AZIZAH',
  '2009-07-01',
  'P',
  'SRI MULYATI',
  '082071731986',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Melanjutkan ke Pondok Pesantren atau Lainnya] [ALAMAT:-, RT -/RW -] [RT:Belum Tahu] [RW:Belum Tahu] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:MTS MAMBAUL HIKMAH TALANG] [KELAS:Kelas 8 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 3096129340 | Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.263+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #20: PUTRA DWI ARDIANSYAH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '8791444b-aa28-481b-96e4-7f97f38f7e99',
  'PUTRA DWI ARDIANSYAH',
  '2013-07-01',
  'L',
  'UMROTUN KHASANAH',
  '082612781899',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Tidak mau bersekolah] [ALAMAT:Tembok lor, RT 15/RW 3] [RT:15] [RW:3] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD NEGERI KEMANDUNGAN 1 TEGAL] [KELAS:Kelas 3 SD/MI/Paket A DO] [KET:NISN: 3136288242 | Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.263+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #21: SYAH LUENA AYU NINGTYAS (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a742e04e-e364-4f2c-9de3-ff82263817b6',
  'SYAH LUENA AYU NINGTYAS',
  '2008-07-01',
  'P',
  'MUNINGSIH',
  '087023727104',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:KP PERIGI, RT 2/RW 2] [RT:2] [RW:2] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI BEDAHAN 4] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0081115445 | Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.263+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #22: RAHADIAN FATTAH KHAERURRIZKY (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'edd75aaf-466a-45ff-8f8e-6fafe5e778e6',
  'RAHADIAN FATTAH KHAERURRIZKY',
  '2019-07-01',
  'L',
  'RIZKY AYUNINGTYAS',
  '082559636593',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. KOMPOL SUPRAPTO GG.JANOKO, RT 5/RW 1] [RT:5] [RW:1] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.263+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #23: ALDERIC LOUISON ZHAOZIYU WANG (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '41ec04a2-4ecb-45c7-afea-286bdabab9a6',
  'ALDERIC LOUISON ZHAOZIYU WANG',
  '2016-07-01',
  'L',
  'RAFAELA',
  '086484796756',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Lainnya, Tidak di temukan] [ALAMAT:PERUM CITRA BAHARI D-62, RT 6/RW 1] [RT:6] [RW:1] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.263+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #24: SHEEVA AZIZAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '8e352018-ab65-4e84-adad-ed0e953e8c7f',
  'SHEEVA AZIZAH',
  '2017-07-01',
  'P',
  'SISKA DEWI SARTIKA',
  '086002301833',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL KAPTEN SUDIBYO, RT 4/RW 3] [RT:4] [RW:3] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.263+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #25: ALDI WINATA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '3973c59c-c2c9-42e2-9eb6-c91c0db0a10a',
  'ALDI WINATA',
  '2010-07-01',
  'L',
  'HERLINA',
  '082412476188',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Mengundurkan Diri] [ALAMAT:Jl. Metro Gg Sriyani, RT 1/RW 1] [RT:1] [RW:1] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP NEGERI 13] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0102431980 | Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.263+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #26: HUSNA ZALFATHUNISA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '9ef537be-cbd2-4184-ad04-3c5ebcfa3d1c',
  'HUSNA ZALFATHUNISA',
  '2020-07-01',
  'P',
  'WAHIDAH',
  '084161307333',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. KAPT. SUDIBYO, RT 4/RW 3] [RT:4] [RW:3] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.263+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #27: ROBI'AH AL ADAWIYAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '30a0a191-fbf0-4b77-92d2-159bfe39f9b0',
  'ROBI''AH AL ADAWIYAH',
  '2008-07-01',
  'P',
  'TJASMIRAH',
  '081841417979',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Melanjutkan ke Pondok Pesantren atau Lainnya] [ALAMAT:-, RT -/RW -] [RT:Belum Tahu] [RW:Belum Tahu] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:MIS DARUNNAJAH] [KELAS:Kelas 6 SD/MI/Paket A DO] [KET:NISN: 0089431555 | Ponpes Attauhidiyah Giren]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.263+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #28: YUSUF ARFAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '0db3b043-4180-4d58-bbc7-971d3a4d4344',
  'YUSUF ARFAN',
  '2017-07-01',
  'L',
  'SUPRIATIN',
  '083115851403',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. KOMPOL. SUPRAPTO GG. JANOKO, RT 5/RW 1] [RT:5] [RW:1] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.263+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #29: CHAYRA FAYYOLA RAMADHANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '6737d34c-ffa6-48bd-bbc4-2166c01c3c67',
  'CHAYRA FAYYOLA RAMADHANI',
  '2012-07-01',
  'P',
  'HELVI DWI LINDYA PUSPITASARI',
  '081753394151',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:SAMADIKUN, RT 1/RW 3] [RT:1] [RW:3] [KEL:Debong Lor] [KEC:Tegal Barat] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP NEGERI 5 TEGAL] [KELAS:Kelas 7 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 3128338693 | Mohon untuk dilakukan verval]',
  '99f02e22-d6e9-4e28-8e8f-48c1c428c002',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:27:29.263+00:00'
) ON CONFLICT (id) DO NOTHING;

