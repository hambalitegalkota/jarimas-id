-- ==============================================================================
-- JARIMAS-ID: MIGRATION SINKRONISASI WILAYAH & POSYANDU KELURAHAN DEBONG LOR
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Bersihkan komunitas warga_kita di Kelurahan Debong Lor yang tidak sesuai ketentuan:
-- Ketentuan Debong Lor Kecamatan Tegal Selatan:
-- RW 1: Jumlah RT 8 (RT 01 s/d RT 08)
-- RW 2: Jumlah RT 5 (RT 01 s/d RT 05)
-- RW 3: Jumlah RT 4 (RT 01 s/d RT 04)
-- Hapus semua RW > 3 serta RT yang melebihi kuota di RW 1, 2, dan 3.

DELETE FROM public.komunitas
WHERE jenis = 'warga_kita'
  AND (lower(kelurahan) LIKE '%debong lor%' OR lower(nama) LIKE '%debong lor%')
  AND (
    -- Hapus RW selain 1, 2, 3 (dan bukan tingkat kelurahan yang RW-nya null)
    (rw IS NOT NULL AND rw NOT IN ('01', '02', '03', '1', '2', '3'))
    -- Hapus RT > 8 di RW 1
    OR (rw IN ('01', '1') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '06', '07', '08', '1', '2', '3', '4', '5', '6', '7', '8'))
    -- Hapus RT > 5 di RW 2
    OR (rw IN ('02', '2') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '05', '1', '2', '3', '4', '5'))
    -- Hapus RT > 4 di RW 3
    OR (rw IN ('03', '3') AND rt IS NOT NULL AND rt NOT IN ('01', '02', '03', '04', '1', '2', '3', '4'))
  );

-- 2. Perbarui kecamatan pada seluruh komunitas warga_kita yang tersisa di Debong Lor menjadi Tegal Selatan
UPDATE public.komunitas
SET 
  kecamatan = 'Tegal Selatan',
  updated_at = now()
WHERE jenis = 'warga_kita'
  AND (lower(kelurahan) LIKE '%debong lor%' OR lower(nama) LIKE '%debong lor%');

-- 3. Perbarui 4 Posyandu di Kelurahan Debong Lor sesuai mapping cakupan wilayah terbaru:
-- Posyandu Seruni 1: cakupan sinkronisasi wilayah RW 1 RT 1, 2, 3, 7 dan 8
UPDATE public.komunitas
SET 
  nama = 'Posyandu Seruni 1',
  kecamatan = 'Tegal Selatan',
  kelurahan = 'Debong Lor',
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Debong Lor, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Seruni 1 Debong Lor cakupan sinkronisasi wilayah RW 01 RT 1, 2, 3, 7 dan 8: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '2d1654eb-575c-488e-8c7e-98c90607f3a7'
   OR (jenis = 'posyandu' AND lower(nama) LIKE '%seruni 1%debong lor%');

-- Posyandu Seruni 2: cakupan sinkronisasi wilayah RW 1 RT 4, 5 dan 6
UPDATE public.komunitas
SET 
  nama = 'Posyandu Seruni 2',
  kecamatan = 'Tegal Selatan',
  kelurahan = 'Debong Lor',
  rw = '01',
  rt = '04',
  lokasi = 'Balai Posyandu / RW 01, Debong Lor, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Seruni 2 Debong Lor cakupan sinkronisasi wilayah RW 01 RT 4, 5 dan 6: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '526fe7d8-575c-488e-87f0-0631801c293c'
   OR (jenis = 'posyandu' AND lower(nama) LIKE '%seruni 2%debong lor%');

-- Posyandu Sartika: cakupan sinkronisasi wilayah RW 2 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Sartika',
  kecamatan = 'Tegal Selatan',
  kelurahan = 'Debong Lor',
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Debong Lor, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Sartika Debong Lor cakupan sinkronisasi wilayah RW 02 (RT 01 s/d RT 05): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = 'f0a76189-575c-488e-8361-739911df887d'
   OR (jenis = 'posyandu' AND lower(nama) LIKE '%sartika%debong lor%');

-- Posyandu Mawar: cakupan sinkronisasi wilayah RW 3 (RT 01 s/d RT 04)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Mawar',
  kecamatan = 'Tegal Selatan',
  kelurahan = 'Debong Lor',
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Debong Lor, Tegal Selatan, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mawar Debong Lor cakupan sinkronisasi wilayah RW 03 (RT 01 s/d RT 04): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.',
  kontak = '0813-2233-4455',
  updated_at = now()
WHERE id = '8a3e27d7-c6b0-4cf9-8b2b-6425e1f79f59'
   OR (jenis = 'posyandu' AND lower(nama) LIKE '%mawar%debong lor%');

-- 4. Perbarui Satuan PAUD Pos PAUD Seruni Debong Lor ke Kecamatan Tegal Selatan
UPDATE public.komunitas
SET 
  kecamatan = 'Tegal Selatan',
  lokasi = 'Debong Lor, Tegal Selatan, Kota Tegal',
  updated_at = now()
WHERE id = 'b6dc28f3-8980-4f28-8049-b34114fc4eb4'
   OR (jenis = 'satuan_paud' AND lower(nama) LIKE '%pos paud seruni%debong lor%');

-- 5. Perbarui metadata kecamatan pada data_anak untuk warga Debong Lor dari Tegal Barat ke Tegal Selatan
UPDATE public.data_anak
SET 
  alasan_sekolah = replace(replace(alasan_sekolah, '[KK_KEC:Tegal Barat]', '[KK_KEC:Tegal Selatan]'), '[DOM_KEC:Tegal Barat]', '[DOM_KEC:Tegal Selatan]')
WHERE lower(COALESCE(alasan_sekolah, '')) LIKE '%debong lor%'
  AND (alasan_sekolah LIKE '%[KK_KEC:Tegal Barat]%' OR alasan_sekolah LIKE '%[DOM_KEC:Tegal Barat]%');

-- 6. Verifikasi hasil pembersihan dan sinkronisasi
SELECT jenis, kecamatan, kelurahan, rw, rt, count(*) as jumlah
FROM public.komunitas
WHERE lower(kelurahan) LIKE '%debong lor%' OR lower(nama) LIKE '%debong lor%'
GROUP BY jenis, kecamatan, kelurahan, rw, rt
ORDER BY jenis, rw, rt;
