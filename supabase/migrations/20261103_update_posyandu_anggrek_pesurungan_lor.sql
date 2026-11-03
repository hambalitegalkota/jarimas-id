-- Migration: Update Cakupan & Deskripsi Posyandu Anggrek Kelurahan Pesurungan Lor, Margadana
UPDATE public.komunitas
SET 
  deskripsi = 'Layanan terpadu Posyandu Anggrek Pesurungan Lor cakupan sinkronisasi wilayah RW 03 (RT 01 s/d RT 07): penimbangan berat badan, tinggi badan, imunisasi, DDKS, dan PMT balita serta ibu hamil.'
WHERE id = '7e363301-78ea-4310-84c2-94618d860cee';

