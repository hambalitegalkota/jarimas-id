-- Migration: Perbarui cakupan wilayah Posyandu Tunas Kelurahan Pekauman (RW 1 dan RW 8)
-- ID Komunitas: 1ba20db1-a59e-4198-8a8c-42e1c533e3e6

UPDATE public.komunitas
SET 
  rw = '01 & 08',
  cakupan_wilayah = 'RW 01 & RW 08 (RT 01 s/d RT 05)',
  lokasi = 'Balai Posyandu / RW 01 & RW 08, Pekauman, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Tunas Pekauman cakupan sinkronisasi wilayah RW 01 (RT 01 s/d RT 05) dan RW 08 (RT 01 s/d RT 05): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.',
  updated_at = NOW()
WHERE id = '1ba20db1-a59e-4198-8a8c-42e1c533e3e6';
