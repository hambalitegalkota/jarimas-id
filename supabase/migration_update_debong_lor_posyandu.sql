-- Migration: Penyesuaian RW/RT dan Pemetaan Posyandu di Kelurahan Debong Lor, Kecamatan Tegal Barat
--
-- Ketentuan Kelurahan Debong Lor:
-- Jumlah RW: 3 (RW 1 s/d RW 3)
-- RW 1: 8 RT (RT 1 s/d RT 8)
-- RW 2: 5 RT (RT 1 s/d RT 5)
-- RW 3: 4 RT (RT 1 s/d RT 4)
-- Tetap pertahankan RW "Belum Tahu" dan RT "Belum Tahu"
--
-- Ketentuan Cakupan Posyandu:
-- 1. Posyandu Seruni 1 : RW 01 (RT 01, RT 02, RT 03, RT 07, RT 08)
-- 2. Posyandu Seruni 2 : RW 01 (RT 04, RT 05, RT 06)
-- 3. Posyandu Sartika  : RW 02 (RT 01 s/d RT 05)
-- 4. Posyandu Mawar    : RW 03 (RT 01 s/d RT 04)

UPDATE public.komunitas
SET 
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Debong Lor, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Seruni 1 Debong Lor cakupan sinkronisasi wilayah RW 01 RT 1, 2, 3, 7 dan 8: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '2d1654eb-575c-488e-8c7e-98c90607f3a7';

UPDATE public.komunitas
SET 
  rw = '01',
  rt = '04',
  lokasi = 'Balai Posyandu / RW 01, Debong Lor, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Seruni 2 Debong Lor cakupan sinkronisasi wilayah RW 01 RT 4, 5 dan 6: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '526fe7d8-575c-488e-87f0-0631801c293c';

UPDATE public.komunitas
SET 
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Debong Lor, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Sartika Debong Lor cakupan sinkronisasi wilayah RW 02 (RT 01 s/d RT 05): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'f0a76189-575c-488e-8361-739911df887d';

UPDATE public.komunitas
SET 
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Debong Lor, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mawar Debong Lor cakupan sinkronisasi wilayah RW 03 (RT 01 s/d RT 04): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '8a3e27d7-c6b0-4cf9-8b2b-6425e1f79f59';
