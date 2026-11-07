-- ==============================================================================
-- JARIMAS-ID: REKAPITULASI & SINKRONISASI 57 DATA ANAK TIDAK SEKOLAH (ATS)
-- KELURAHAN CABAWAN, KECAMATAN MARGADANA, KOTA TEGAL
-- Sumber Data: Rekap Data Verval ATS - Cabawan (Pusdatin Kemendikdasmen)
-- ==============================================================================

-- Anak #1: AISYA KARIM (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ac60af46-8fd7-437d-af57-e40da2b04149',
  'AISYA KARIM',
  '2011-07-01',
  'P',
  'EKA WAHYUNI',
  '082825354419',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:JL. M. KAHFI II GG MUAMALAH II, RT 2/RW 1] [RT:2] [RW:1] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP PGRI KASIHAN] [KELAS:Kelas 7 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0116953595 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.673+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #2: AHMAD FAHRUDIN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '6061614e-6e18-4995-a7d0-bec49ae987cc',
  'AHMAD FAHRUDIN',
  '2011-07-01',
  'L',
  'KERINING WASTUTI',
  '081575939318',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Melanjutkan ke Pondok Pesantren atau Lainnya] [ALAMAT:WANAHERANG, RT 0/RW 0] [RT:Belum Tahu] [RW:Belum Tahu] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD N WANAHERANG 01] [KELAS:Kelas 5 SD/MI/Paket A DO] [KET:NISN: 0117618272 | PESANTREN KOBONG TANPA SEKOLAH]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #3: M. RIZKI RAMADHANY (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '0e57431f-17e4-477c-bb0f-e876c7b3c57d',
  'M. RIZKI RAMADHANY',
  '2008-07-01',
  'L',
  'TUTI WAHYUNI',
  '085330072774',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. SLAMET RIYADI, RT 4/RW 2] [RT:4] [RW:2] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #4: RAFKA PUTRA SANTOSO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '72afaedf-4eb5-43b7-a8fa-4d0d7e7e799e',
  'RAFKA PUTRA SANTOSO',
  '2009-07-01',
  'L',
  'DEDEH KURNIASIH SEPTIANI',
  '087131413690',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. SLAMET RIYADI NO. 67, RT 3/RW 3] [RT:3] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #5: RIKI SAEPUL (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '2bc51809-efb4-455a-ac93-01ddf4ed89e4',
  'RIKI SAEPUL',
  '2011-07-01',
  'L',
  'BADRIYAH',
  '089249274640',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Ki Ragasela, RT 1/RW 1] [RT:1] [RW:1] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP NEGERI 18] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0113642379 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #6: KALILA AZALEA INAYAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '255dd664-af37-41b5-af03-72a9c97cd659',
  'KALILA AZALEA INAYAH',
  '2012-07-01',
  'P',
  'DARWATI',
  '085639037967',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. BRIGJEN SLAMET RIYADI, RT 3/RW 2] [RT:3] [RW:2] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #7: RISKA TRIANA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'cf710aa5-3c42-4798-b8d4-56813c798762',
  'RISKA TRIANA',
  '2010-07-01',
  'P',
  'WATRI',
  '081131929724',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Jepara gg. Apel VI, RT 1/RW 1] [RT:1] [RW:1] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP NEGERI 18] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0108312811 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #8: SYIFA FAUZIAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '8ccd4fa7-559a-412c-9809-f150e8ee8921',
  'SYIFA FAUZIAH',
  '2011-07-01',
  'P',
  'DEWI SUSIWATI',
  '082891805696',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jalan Ki Ageng Tirtayasa, RT 4/RW 3] [RT:4] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP NEGERI 13] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0118533896 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #9: KEVIN FIRMANSYAH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '593765bf-3a6b-4cae-8a7c-3d1baa415a69',
  'KEVIN FIRMANSYAH',
  '2007-07-01',
  'L',
  'TUNIROH',
  '085395454244',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 3/RW 3] [RT:3] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MTsS MA''ARIF NU 1 WANGON] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0071788123 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #10: FAHRUL FANANI FATKHUROHMAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '4081e58a-49c0-4db8-8545-742a479cc897',
  'FAHRUL FANANI FATKHUROHMAN',
  '2010-07-01',
  'L',
  'SOLASTRI',
  '087771979665',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 2/RW 4] [RT:2] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MTS ALHIKMAH 1] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 3101806276 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #11: SAPUTRA INDRA RAMADHAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '15b14027-39e4-4031-b4f7-e31916e59a40',
  'SAPUTRA INDRA RAMADHAN',
  '2007-07-01',
  'L',
  'NUR INDAH WATI',
  '082955488665',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 5/RW 2] [RT:5] [RW:2] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:MAN TEGAL] [KELAS:Kelas 11 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 0073809827 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #12: HALIMAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '46dfa719-ffa7-492b-806c-291e131e746d',
  'HALIMAH',
  '2018-07-01',
  'P',
  'SRI HAYATI',
  '084649924885',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. SULTAN HASANUDIN, RT 3/RW 3] [RT:3] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #13: DIFO FERNANDEZ GOZALI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '24b42dce-48ba-4644-a531-4a3fde7c2716',
  'DIFO FERNANDEZ GOZALI',
  '2018-07-01',
  'L',
  'SRIYATUN',
  '083412000147',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:GANG DELIMA 6 NO 23, RT 3/RW 3] [RT:3] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #14: MIRZA MAHARDHIKA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '334bde5d-a41d-4756-897f-0fd34b73c8fc',
  'MIRZA MAHARDHIKA',
  '2014-07-01',
  'L',
  'AFIANAH FAUZIAH',
  '088716679898',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. SULTAN HASANUDIN, RT 3/RW 4] [RT:3] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #15: MUHAMMAD NUR FAIZAL (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '9893dc59-a01d-48c4-983d-7cb2ee63d9fb',
  'MUHAMMAD NUR FAIZAL',
  '2019-07-01',
  'L',
  'WARSINAH',
  '088528293680',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:GG DUKUH 8, RT 3/RW 4] [RT:3] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD NEGERI CABAWAN 2 TEGAL] [KELAS:Kelas 1 SD/MI/Paket A DO] [KET:NISN: 3190717661 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #16: RIZA WINADA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '5dfcfd99-540e-4813-bfd5-624ffaeb88ce',
  'RIZA WINADA',
  '2009-07-01',
  'P',
  'RIYANTI',
  '088431578137',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Melanjutkan ke Pondok Pesantren atau Lainnya] [ALAMAT:Jl Sultan Hasanudin Gang Duku 3, RT 4/RW 4] [RT:4] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP FATAHILLAH] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0085946179 | Pesantren di Bogor]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #17: SITI KARTIKA DEWI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '38aaa7ba-b594-477c-ac80-130a362b8bf5',
  'SITI KARTIKA DEWI',
  '2010-07-01',
  'P',
  'SUHIROH',
  '083502855340',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:SULTAN HASANUDIN, RT 2/RW 2] [RT:2] [RW:2] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:SMK MUHAMMADIYAH 2 TEGAL] [KELAS:Kelas 10 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 0107988461 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #18: MOHAMMAD AZAM AENUROFIK (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '4dcad13a-20dc-41f6-a263-981bc150c8a2',
  'MOHAMMAD AZAM AENUROFIK',
  '2012-07-01',
  'L',
  'MELLY AMAIYAH',
  '084839046808',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:Jl. Bridgen Slamet Riyadi, RT 0/RW 0] [RT:Belum Tahu] [RW:Belum Tahu] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP MUHAMMADIYAH SAWOJAJAR] [KELAS:Kelas 8 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 3126107247 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #19: ZAKIA ALLYA HAFIZAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'f606f5d8-3fc4-4033-a13d-32fb0b153756',
  'ZAKIA ALLYA HAFIZAH',
  '2013-07-01',
  'P',
  'KASMUNI',
  '082544645555',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:CABAWAN, RT 2/RW 4] [RT:2] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI CABAWAN 2 TEGAL] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3130086965 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #20: MUHAMMAD GAVIN AR RASYID (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '63556966-d2cd-4b88-91c6-0f9e46625618',
  'MUHAMMAD GAVIN AR RASYID',
  '2019-07-01',
  'L',
  'WIDIA OKTA VIKI ASIH',
  '087253064952',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. SLAMET RIYADI, RT 2/RW 3] [RT:2] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #21: TEGUH PRAYITNO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '7ba04811-266b-42c5-8865-6efb3052f440',
  'TEGUH PRAYITNO',
  '2010-07-01',
  'L',
  'DARWATI',
  '087507730154',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 4/RW 3] [RT:4] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MTSS RAUDHATUL ULUM] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0109397896 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #22: ATHAYA MAIRA ARSA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1d81df30-9d15-412d-a7aa-68a76de25a46',
  'ATHAYA MAIRA ARSA',
  '2014-07-01',
  'P',
  'SEPTYANA ARISANTI',
  '082315037918',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. MERPATI NO. 147B, RT 2/RW 6] [RT:2] [RW:6] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #23: TIARA SHAVITRI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '222154f6-170f-4829-ac43-bfca45ecf16d',
  'TIARA SHAVITRI',
  '2007-07-01',
  'P',
  'KASRI',
  '083881599930',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 1/RW 3] [RT:1] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:MTS Nurul Ummah] [KELAS:Kelas 9 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0073844862 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #24: TAKWA SAPUTRA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '3e5c9461-f937-492a-9a8f-702bc6b28692',
  'TAKWA SAPUTRA',
  '2009-07-01',
  'L',
  'ROKHANI',
  '085978737802',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Tidak mau bersekolah] [ALAMAT:JL.AMBARAWA, RT 3/RW 9] [RT:3] [RW:9] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD NEGERI MARGADANA 8] [KELAS:Kelas 3 SD/MI/Paket A DO] [KET:NISN: 0094238330 | orang tua pindah rumah ke cabawan dan anaknya tidak mau sekolah dengan alasan jauh dari domisili]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #25: MUJI SAPUTRA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'dc14bbdd-a477-4be2-af09-66839856d4a2',
  'MUJI SAPUTRA',
  '2020-07-01',
  'L',
  'SRI WIDIANTI',
  '082495131931',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:GG. NANGKA 3, RT 2/RW 2] [RT:2] [RW:2] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #26: MUHAMMAD ZAVITRA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '713bb3b9-14e3-4058-ae61-d4fe515de0ac',
  'MUHAMMAD ZAVITRA',
  '2010-07-01',
  'L',
  'IDA ELISAH',
  '088352338809',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:CABAWAN, RT 4/RW 2] [RT:4] [RW:2] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP ISLAM ASSAADATUL ABADIYAH] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 3100124438 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #27: ARJUN SYAHIR RAMADHAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ab882444-2e4a-49fc-86a3-48af3621412a',
  'ARJUN SYAHIR RAMADHAN',
  '2019-07-01',
  'L',
  'CARITA',
  '086515363529',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:GANG APEL 3, RT 2/RW 1] [RT:2] [RW:1] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #28: RIZKY ADITYA SAPUTRA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '0c59d0cb-0d9c-417a-9410-b15e3c194658',
  'RIZKY ADITYA SAPUTRA',
  '2010-07-01',
  'L',
  'KOMARIAH',
  '085376516669',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 1/RW 4] [RT:1] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MTSS RAUDHATUL ULUM] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0101377376 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #29: NADHIFA AL ZHAFRAN HIDAYAT (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '738cb308-7eb3-4584-baef-e1d8362aa9a2',
  'NADHIFA AL ZHAFRAN HIDAYAT',
  '2020-07-01',
  'L',
  'WINDA AYU DIAN NINGSIH',
  '084463284918',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL SULTAN HASANUDIN, RT 4/RW 4] [RT:4] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.685+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #30: DINO PRATOMO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '2b0e9514-68a4-4471-843b-b2a0a4646c43',
  'DINO PRATOMO',
  '2009-07-01',
  'L',
  'SUTINAH',
  '083717884891',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:CABAWAN, RT 2/RW 2] [RT:2] [RW:2] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SDN Karet Tengsin 13 Pg.] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0071765799 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #31: AZRIL SAN ALFAREZI (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'b804f55a-1dda-4bb0-8fce-9630c2c1f7f1',
  'AZRIL SAN ALFAREZI',
  '2019-07-01',
  'L',
  'GINA ALI MULIANA',
  '089892079522',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. BRIGJEND SLAMET RIYADI, RT 2/RW 3] [RT:2] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #32: KINANTI PUTRI LARASATI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ff6a0465-88b0-455e-b5df-13c6640f7cd1',
  'KINANTI PUTRI LARASATI',
  '2020-07-01',
  'P',
  'SRI SUGIANTI',
  '084501191304',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. S HASANUDIN NO.5 GG DUKU, RT 2/RW 4] [RT:2] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #33: VITA NUR AISYAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'bf417c1e-2797-42d1-8ef7-6f3626d82e68',
  'VITA NUR AISYAH',
  '2019-07-01',
  'P',
  'SETIA NINGRUM',
  '081917641125',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:CABAWAN, RT 1/RW 3] [RT:1] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #34: RENDI PRASETYO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a46651c4-f727-4809-872b-dea9121c0abd',
  'RENDI PRASETYO',
  '2012-07-01',
  'L',
  'ENI PARIASIH',
  '081200481697',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. SULTAN HASANUDIN, RT 5/RW 2] [RT:5] [RW:2] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #35: NASYWA APRILIANI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '148f065a-04ee-4670-bf26-49c16d9a93c7',
  'NASYWA APRILIANI',
  '2010-07-01',
  'P',
  'SARINI',
  '083029159944',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. BRIGJEN S RIYADI, RT 4/RW 3] [RT:4] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #36: KENZIE VISTA APRILIO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '2d554806-ba6c-4d8c-8d78-60509f6c9bdb',
  'KENZIE VISTA APRILIO',
  '2019-07-01',
  'L',
  'ELLY LIDYAWATI',
  '084300227932',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. CIPTO MANGUNKUSUMO GG. NANGKA 4, RT 2/RW 2] [RT:2] [RW:2] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #37: FATIYAH AZAHRA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '7d5f61fd-9ff2-47d9-9e1b-3e134da29caa',
  'FATIYAH AZAHRA',
  '2020-07-01',
  'P',
  'KOMARIYAH',
  '088204638352',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:CABAWAN, RT 1/RW 1] [RT:1] [RW:1] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #38: NESYA LITUHAYU (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '73869611-53f8-42f9-8d94-cee328624a52',
  'NESYA LITUHAYU',
  '2019-07-01',
  'P',
  'RATNAWATI',
  '088817992662',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:CABAWAN, RT 1/RW 4] [RT:1] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #39: ACHMAD NANDA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '451f99c6-b302-43bd-9a5d-34888c5ba99c',
  'ACHMAD NANDA',
  '2011-07-01',
  'L',
  'INDAH ANGGRIWAN',
  '086927153771',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:GG DELIMA5 NO. 14, RT 2/RW 3] [RT:2] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:SMP KRISTEN WIDHODHO] [KELAS:Kelas 8 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0114966518 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #40: NUR DODI SETIAWAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '4e58a669-600b-433f-a0e8-246b67dd0587',
  'NUR DODI SETIAWAN',
  '2013-07-01',
  'L',
  'TARINI',
  '089519686658',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:GANG NANGKA 2, RT 1/RW 2] [RT:1] [RW:2] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #41: MUHAMAD FIKI HADIYANSAH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '76a7e108-f952-4882-8b1b-a5a0aeb114cf',
  'MUHAMAD FIKI HADIYANSAH',
  '2010-07-01',
  'L',
  'EVI TIWI NARTI',
  '084241582661',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:SIDAKATON, RT 4/RW 3] [RT:4] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD Negeri 5 Pojok] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0105889248 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #42: NADIF FUADI RAMADHAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '78bf4c9f-476f-4c63-bf57-5210fc70f1ac',
  'NADIF FUADI RAMADHAN',
  '2009-07-01',
  'L',
  'TUNINGSIH',
  '084442198788',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Sudah cukup dengan tingkat pendidikan yang dimiliki saat ini] [ALAMAT:Cabawan Gg. Apel, RT 1/RW 1] [RT:1] [RW:1] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD NEGERI MARGADANA 3] [KELAS:Kelas 3 SD/MI/Paket A DO] [KET:NISN: 0091480565 | pindah rumah mengikuti orang tua]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #43: NOVA PUTRIANI SALSABILAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '58a01035-d4a6-44f3-b0f9-05e58f91d1ac',
  'NOVA PUTRIANI SALSABILAH',
  '2009-07-01',
  'P',
  'SUMERI',
  '085409103426',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:GANG NANGKA 4, RT 2/RW 2] [RT:2] [RW:2] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #44: INDRI MULYANA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a007bb90-6375-463c-856d-18514a2b277c',
  'INDRI MULYANA',
  '2011-07-01',
  'P',
  'KASRI',
  '083562243815',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:GANG APEL 6, RT 2/RW 1] [RT:2] [RW:1] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #45: DIAS SAPUTRA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '08d8fcb8-e9aa-4a41-ac6e-be9bb32f692c',
  'DIAS SAPUTRA',
  '2009-07-01',
  'L',
  'PRIHANDINI BUDIARTI',
  '086049644415',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:JL. SULTAN HASANUDIN GANG DUKU 3, RT 4/RW 4] [RT:4] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMA/SMK/MA/Paket C Putus Sekolah / DO] [SEKOLAH_ASAL:SMK ASTRINDO KOTA TEGAL] [KELAS:Kelas 11 SMA/SMK/MA/Paket C Putus Sekolah DO] [KET:NISN: 0091861628 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #46: UMI AZIZAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'b767d130-c9da-4789-ab24-b2c66934238b',
  'UMI AZIZAH',
  '2009-07-01',
  'P',
  'SUNARTI',
  '083061627379',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 4/RW 3] [RT:4] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MTSS RAUDHATUL ULUM] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0095504926 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #47: AULIA FAUZIAH (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'dddc8d90-c5b2-4083-a5c1-8f27f0533f64',
  'AULIA FAUZIAH',
  '2008-07-01',
  'P',
  'SUSI',
  '082047592155',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. S HASANUDIN GG DUKU 1, RT 4/RW 4] [RT:4] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #48: WULAN SYAHPUTRI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'f8bfc4e1-23a4-4351-bf00-95fb8067b8dc',
  'WULAN SYAHPUTRI',
  '2013-07-01',
  'P',
  'TAESAH',
  '086628686995',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:GG. DUKU II, RT 3/RW 4] [RT:3] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #49: MOHAMMAD RIFKI MAULANA (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'ec1e441a-a6fc-4977-9cb6-bcd2d5d46afe',
  'MOHAMMAD RIFKI MAULANA',
  '2010-07-01',
  'L',
  'RIYANTI',
  '083350746985',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Tidak mau bersekolah] [ALAMAT:JL. SULTAN HASANUDIN, RT 1/RW 4] [RT:1] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI CABAWAN 2 TEGAL] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0105722145 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #50: MOH ARIF RIYANTO (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'd84e1282-ecd9-4eda-a420-451c9dd25882',
  'MOH ARIF RIYANTO',
  '2011-07-01',
  'L',
  'SUMITRI',
  '083178963166',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:JL. PAJAJARAN, RT 1/RW 3] [RT:1] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SMP NEGERI 10 DEPOK] [KELAS:Kelas 9 SMP/MTs/Paket B Lulus Tidak Melanjutkan] [KET:NISN: 0113315996 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #51: EVAN DIMAS AL FARIZY (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'cb3a06a3-45f5-476e-9c34-82c22c6ec2ff',
  'EVAN DIMAS AL FARIZY',
  '2013-07-01',
  'L',
  'DEVI YULIYANTI',
  '082916251968',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:KRANDON, RT 1/RW 2] [RT:1] [RW:2] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:SD NEGERI SIDAKATON 02] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0134581667 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #52: DZAKI FAA'IZAN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'a3bec86b-7d0e-431a-837b-b3cb436481c4',
  'DZAKI FAA''IZAN',
  '2012-07-01',
  'L',
  'WASEM DWI WINDYATI',
  '088574143974',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Masalah Kesehatan / Penyandang Disabilitas] [ALAMAT:Jl. Ki Ragasela Gg. Apel 8, RT 2/RW 1] [RT:2] [RW:1] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Putus Sekolah / DO] [SEKOLAH_ASAL:SD NEGERI KRANDON 4] [KELAS:Kelas 2 SD/MI/Paket A DO] [KET:NISN: 0124439055 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #53: DINDA JULIANA PUTRI (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'c5b16e0b-ea8b-4a48-b29d-1bc41caee066',
  'DINDA JULIANA PUTRI',
  '2009-07-01',
  'P',
  'SURATIH',
  '083389346801',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:GANG DUKUH 7, RT 3/RW 4] [RT:3] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #54: FAHMI IRVANSYAH (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  'f4c1185f-d6af-4980-91da-37703ee11a27',
  'FAHMI IRVANSYAH',
  '2008-07-01',
  'L',
  'DARWATI',
  '089582176613',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Tidak Ada] [ALASAN:Sudah cukup dengan tingkat pendidikan yang dimiliki saat ini] [ALAMAT:SLAMET RIYADI, RT 4/RW 3] [RT:4] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SMP/MTs/Paket B Putus Sekolah / DO] [SEKOLAH_ASAL:MTSS RAUDHATUL ULUM] [KELAS:Kelas 9 SMP/MTs/Paket B Putus Sekolah DO] [KET:NISN: 0078051836 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'approved',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #55: ZAYYAN ZAINUL MUTTAQIN (L)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '596b572e-41d2-4e0b-a9fd-e35b5c453470',
  'ZAYYAN ZAINUL MUTTAQIN',
  '2013-07-01',
  'L',
  'UNI KURNIWATI',
  '083604521504',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 1/RW 4] [RT:1] [RW:4] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MIS MIDANUTTA''LIM II] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 3134279569 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #56: ADELIA AZ-ZAHRA (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '1f668c10-97bb-4b86-b22d-192f543ca322',
  'ADELIA AZ-ZAHRA',
  '2014-07-01',
  'P',
  'DEWI ASTRIYANI',
  '085196957359',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Lainnya] [ALAMAT:-, RT 1/RW 1] [RT:1] [RW:1] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:SD/MI/Paket A Lulus Tidak Melanjutkan] [SEKOLAH_ASAL:MIS Ihsaniyah 01 Kaligangsa] [KELAS:Kelas 6 SD/MI/Paket A Lulus Tidak Melanjutkan] [KET:NISN: 0141692239 | Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

-- Anak #57: AZKHAIRAZ OLIVIA MARSHALL (P)
INSERT INTO public.data_anak (id, nama_lengkap, tanggal_lahir, jenis_kelamin, nama_orangtua, nomor_hp, tinggal_bersama, jarak_rumah_km, is_sekolah, nama_sekolah, alasan_sekolah, komunitas_id, status_approval, created_by, created_at)
VALUES (
  '75f1db00-66d7-4849-8197-9c57f73d1423',
  'AZKHAIRAZ OLIVIA MARSHALL',
  '2019-07-01',
  'P',
  'KOLIFAH',
  '085084370562',
  'Orangtua',
  0,
  false,
  'ATS - Anak Tidak Sekolah',
  '[KEINGINAN:Masih Ada] [ALASAN:Belum Pernah Bersekolah] [ALAMAT:JL. SLAMET RIYADI, RT 2/RW 3] [RT:2] [RW:3] [KEL:Cabawan] [KEC:Margadana] [JENJANG_ASAL:Belum Pernah Bersekolah] [SEKOLAH_ASAL:Belum Pernah Bersekolah] [KELAS:Belum Pernah Bersekolah] [KET:Mohon untuk dilakukan verval]',
  'c5c76fb2-f138-4274-874f-c1454a3d2039',
  'pending',
  '1d827e22-9253-486a-a948-3fac6d01ae38',
  '2026-11-07T00:14:39.686+00:00'
) ON CONFLICT (id) DO NOTHING;

