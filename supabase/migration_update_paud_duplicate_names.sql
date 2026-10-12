-- ==============================================================================
-- Migration: Pembaruan Nama Satuan PAUD dengan Penambahan Kelurahan
-- Diferensiasi 16 Satuan PAUD (8 Pasangan) dengan nama yang sama/beririsan
-- ==============================================================================

-- 1. RA Permata Hati Kejambon
UPDATE public.komunitas 
SET 
  nama = 'RA Permata Hati Kejambon',
  nama_komunitas = 'RA Permata Hati Kejambon',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (RA Permata Hati Kejambon) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = '37270cc5-beae-446d-8317-4db53bcc295b';

-- 2. KB Permata Hati Slerok
UPDATE public.komunitas 
SET 
  nama = 'KB Permata Hati Slerok',
  nama_komunitas = 'KB Permata Hati Slerok',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (KB Permata Hati Slerok) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = 'd1e30c58-b32f-4e8e-86b3-f7b526c0db17';

-- 3. KB Bina Iman Anak Sholeh (BIAS) Panggung
UPDATE public.komunitas 
SET 
  nama = 'KB Bina Iman Anak Sholeh (BIAS) Panggung',
  nama_komunitas = 'KB Bina Iman Anak Sholeh (BIAS) Panggung',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (KB Bina Iman Anak Sholeh (BIAS) Panggung) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = '6448b6d1-a2b6-4844-8595-ba29636faa7d';

-- 4. KB Bina Iman Anak Sholeh (BIAS) Kemandungan
UPDATE public.komunitas 
SET 
  nama = 'KB Bina Iman Anak Sholeh (BIAS) Kemandungan',
  nama_komunitas = 'KB Bina Iman Anak Sholeh (BIAS) Kemandungan',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (KB Bina Iman Anak Sholeh (BIAS) Kemandungan) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = 'e001abba-d414-4cf2-886e-913577dbfcc5';

-- 5. KB Sekar Melati Panggung
UPDATE public.komunitas 
SET 
  nama = 'KB Sekar Melati Panggung',
  nama_komunitas = 'KB Sekar Melati Panggung',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (KB Sekar Melati Panggung) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = '1af0c1cb-41b6-4346-8f87-752576a648a5';

-- 6. Pos PAUD Sekar Melati Tegalsari
UPDATE public.komunitas 
SET 
  nama = 'Pos PAUD Sekar Melati Tegalsari',
  nama_komunitas = 'Pos PAUD Sekar Melati Tegalsari',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (Pos PAUD Sekar Melati Tegalsari) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = 'd7366691-3515-497c-8956-cb299412f69d';

-- 7. PAUD TPQ Nurul Huda Panggung
UPDATE public.komunitas 
SET 
  nama = 'PAUD TPQ Nurul Huda Panggung',
  nama_komunitas = 'PAUD TPQ Nurul Huda Panggung',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (PAUD TPQ Nurul Huda Panggung) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = 'cfa2e2a4-dfdb-4081-8966-e93d3c965114';

-- 8. TK Nurul Huda Muarareja
UPDATE public.komunitas 
SET 
  nama = 'TK Nurul Huda Muarareja',
  nama_komunitas = 'TK Nurul Huda Muarareja',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (TK Nurul Huda Muarareja) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = '69a407c5-026b-42bd-8fe9-7d494266c419';

-- 9. Pos PAUD Kartini Kraton
UPDATE public.komunitas 
SET 
  nama = 'Pos PAUD Kartini Kraton',
  nama_komunitas = 'Pos PAUD Kartini Kraton',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (Pos PAUD Kartini Kraton) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = '21283b97-a8a0-4031-8641-2349ad207e87';

-- 10. Pos PAUD Kartini Slerok
UPDATE public.komunitas 
SET 
  nama = 'Pos PAUD Kartini Slerok',
  nama_komunitas = 'Pos PAUD Kartini Slerok',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (Pos PAUD Kartini Slerok) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = '3ff83fb1-b19c-45c8-871a-a6bd264d56c0';

-- 11. TK Little Star Kraton
UPDATE public.komunitas 
SET 
  nama = 'TK Little Star Kraton',
  nama_komunitas = 'TK Little Star Kraton',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (TK Little Star Kraton) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = '402b25de-13bc-4bdb-861e-7b298e2449e5';

-- 12. KB Little Star Tegalsari
UPDATE public.komunitas 
SET 
  nama = 'KB Little Star Tegalsari',
  nama_komunitas = 'KB Little Star Tegalsari',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (KB Little Star Tegalsari) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = '8b999637-20c5-41f9-8913-d5857e0009a9';

-- 13. KB Mutiara Shahabat Kemandungan
UPDATE public.komunitas 
SET 
  nama = 'KB Mutiara Shahabat Kemandungan',
  nama_komunitas = 'KB Mutiara Shahabat Kemandungan',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (KB Mutiara Shahabat Kemandungan) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = '6247e885-e1ab-4851-89ca-eb795b1cdc55';

-- 14. PKBM Mutiara Shahabat Pekauman
UPDATE public.komunitas 
SET 
  nama = 'PKBM Mutiara Shahabat Pekauman',
  nama_komunitas = 'PKBM Mutiara Shahabat Pekauman',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (PKBM Mutiara Shahabat Pekauman) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = '165f31bb-b754-478a-8385-4a2dc69cfa96';

-- 15. RA At Taqwa Pekauman
UPDATE public.komunitas 
SET 
  nama = 'RA At Taqwa Pekauman',
  nama_komunitas = 'RA At Taqwa Pekauman',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (RA At Taqwa Pekauman) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = '15c639f8-83e2-4c52-8df2-398d069aaca4';

-- 16. PAUD TPQ At Taqwa Cabawan
UPDATE public.komunitas 
SET 
  nama = 'PAUD TPQ At Taqwa Cabawan',
  nama_komunitas = 'PAUD TPQ At Taqwa Cabawan',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (PAUD TPQ At Taqwa Cabawan) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = '973faf52-ffd0-451c-87cf-5461b003057a';

-- Update sinkronisasi pada data_anak (nama_sekolah)
UPDATE public.data_anak
SET nama_sekolah = 'KB Bina Iman Anak Sholeh (BIAS) Kemandungan'
WHERE nama_sekolah ILIKE '%BIAS%TB%' OR nama_sekolah ILIKE '%BINA ANAK SHOLEH (BIAS) TB%';

UPDATE public.data_anak
SET nama_sekolah = 'KB Bina Iman Anak Sholeh (BIAS) Panggung'
WHERE nama_sekolah ILIKE '%BIAS%TT%' OR nama_sekolah ILIKE '%BINA ANAK SHOLEH (BIAS) TT%';

UPDATE public.data_anak
SET nama_sekolah = 'KB Permata Hati Slerok'
WHERE nama_sekolah ILIKE 'KB Permata Hati';

UPDATE public.data_anak
SET nama_sekolah = 'KB Little Star Tegalsari'
WHERE nama_sekolah ILIKE 'KB Little Star';

UPDATE public.data_anak
SET nama_sekolah = 'KB Sekar Melati Panggung'
WHERE nama_sekolah ILIKE 'KB Sekar Melati' OR nama_sekolah ILIKE 'KB. Sekar Melati';

UPDATE public.data_anak
SET nama_sekolah = 'KB Mutiara Shahabat Kemandungan'
WHERE nama_sekolah ILIKE 'KB Mutiara Shahabat';

UPDATE public.data_anak
SET nama_sekolah = 'PAUD TPQ At Taqwa Cabawan'
WHERE nama_sekolah ILIKE 'PAUD TPQ At Taqwa';
