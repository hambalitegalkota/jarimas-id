-- ==============================================================================
-- Migration: Pembaruan Nama Komunitas PAUD KB BIAS (Tegal Timur & Tegal Barat)
-- ==============================================================================
-- 1. KB Bina Iman Anak Sholeh (BIAS) TT di Kecamatan Tegal Timur (Kelurahan Panggung)
UPDATE public.komunitas 
SET 
  nama = 'KB Bina Iman Anak Sholeh (BIAS) TT',
  nama_komunitas = 'KB Bina Iman Anak Sholeh (BIAS) TT',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (KB Bina Iman Anak Sholeh (BIAS) TT) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = '6448b6d1-a2b6-4844-8595-ba29636faa7d';

-- 2. KB Bina Iman Anak Sholeh (BIAS) TB di Kecamatan Tegal Barat (Kelurahan Kemandungan)
UPDATE public.komunitas 
SET 
  nama = 'KB Bina Iman Anak Sholeh (BIAS) TB',
  nama_komunitas = 'KB Bina Iman Anak Sholeh (BIAS) TB',
  deskripsi = 'Lembaga PAUD & Pendidikan Kesetaraan (KB Bina Iman Anak Sholeh (BIAS) TB) menyelenggarakan layanan stimulasi tumbuh kembang anak usia dini, kesiapan belajar, pendidikan kesetaraan Paket A/B/C, dan parenting keluarga.',
  updated_at = NOW()
WHERE id = 'e001abba-d414-4cf2-886e-913577dbfcc5';
