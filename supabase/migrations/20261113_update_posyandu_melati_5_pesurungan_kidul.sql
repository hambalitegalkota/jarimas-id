-- ==============================================================================
-- Migration: Update Cakupan Wilayah Posyandu Melati 5
-- Khusus Kelurahan Pesurungan Kidul, Kecamatan Tegal Barat, Kota Tegal
-- Generated on 2026-11-13
--
-- Ketentuan Resmi:
-- Posyandu Melati 5 melayani wilayah RW 06 (RT 01, RT 02, RT 03, RT 04, RT 05 dan RW - RT Tidak Tahu)
-- ==============================================================================

UPDATE public.komunitas
SET 
  rw = '06',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 06, Pesurungan Kidul, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Melati 5 Pesurungan Kidul cakupan sinkronisasi wilayah RW 06 (RT 01, RT 02, RT 03, RT 04, RT 05 dan RW - RT Tidak Tahu): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '5128e73f-508b-4787-8667-a691c6d133ac';

