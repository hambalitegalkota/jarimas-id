-- ==============================================================================
-- Migration: Pembaruan Nama Komunitas PAUD KB BIAS (Kemandungan & Panggung)
-- Mengubah nama dari KB Bina Iman Anak Sholeh menjadi KB Bina Anak Sholeh (tanpa kata Iman)
-- ==============================================================================

-- 1. KB Bina Anak Sholeh (BIAS) Kemandungan
UPDATE public.komunitas 
SET 
  nama = 'KB Bina Anak Sholeh (BIAS) Kemandungan',
  nama_komunitas = 'KB Bina Anak Sholeh (BIAS) Kemandungan',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (KB Bina Anak Sholeh (BIAS) Kemandungan) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = 'e001abba-d414-4cf2-886e-913577dbfcc5';

-- 2. KB Bina Anak Sholeh (BIAS) Panggung
UPDATE public.komunitas 
SET 
  nama = 'KB Bina Anak Sholeh (BIAS) Panggung',
  nama_komunitas = 'KB Bina Anak Sholeh (BIAS) Panggung',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (KB Bina Anak Sholeh (BIAS) Panggung) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = '6448b6d1-a2b6-4844-8595-ba29636faa7d';

-- 3. Sinkronisasi data_anak nama_sekolah
UPDATE public.data_anak
SET 
  nama_sekolah = 'KB Bina Anak Sholeh (BIAS) Kemandungan',
  updated_at = NOW()
WHERE komunitas_id = 'e001abba-d414-4cf2-886e-913577dbfcc5';

UPDATE public.data_anak
SET 
  nama_sekolah = 'KB Bina Anak Sholeh (BIAS) Panggung',
  updated_at = NOW()
WHERE komunitas_id = '6448b6d1-a2b6-4844-8595-ba29636faa7d';

