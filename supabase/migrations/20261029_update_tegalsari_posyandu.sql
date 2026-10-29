-- Migration: Update Cakupan Wilayah Posyandu & Cleanup Data Anomali Kelurahan Tegalsari, Kecamatan Tegal Barat

-- 1. Posyandu Tunas Bahari: RW 1 (RT 01 s/d RT 06)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Tunas Bahari',
  nama_komunitas = 'Posyandu Tunas Bahari',
  rw = '01',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 01, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Tunas Bahari Tegalsari: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'cd1adf7b-5be1-4c26-8f3f-99b1c2242d80';

-- 2. Posyandu Minasari: RW 2 RT 1, 2, 3, 4, 5, 6, 7
UPDATE public.komunitas
SET 
  nama = 'Posyandu Minasari',
  nama_komunitas = 'Posyandu Minasari',
  rw = '02',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 02, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Minasari Tegalsari cakupan sinkronisasi wilayah RW 02 (RT 1, 2, 3, 4, 5, 6, 7): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'f6013505-8603-4059-803c-04855b1a6e07';

-- 3. Posyandu Mina Bahari: RW 2 RT 8, 9, 10
UPDATE public.komunitas
SET 
  nama = 'Posyandu Mina Bahari',
  nama_komunitas = 'Posyandu Mina Bahari',
  rw = '02',
  rt = '08',
  lokasi = 'Balai Posyandu / RW 02, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mina Bahari Tegalsari cakupan sinkronisasi wilayah RW 02 (RT 8, 9, 10): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '9438aeb6-8603-4059-8de7-bc4de1063872';

-- 4. Posyandu Melatisari 1: RW 3 RT 1, 2, 3, 4, 5, 6
UPDATE public.komunitas
SET 
  nama = 'Posyandu Melatisari 1',
  nama_komunitas = 'Posyandu Melatisari 1',
  rw = '03',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 03, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Melatisari 1 Tegalsari cakupan sinkronisasi wilayah RW 03 (RT 1, 2, 3, 4, 5, 6): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '376225ad-69fc-44af-82dc-5f21b6ea2f72';

-- 5. Posyandu Melatisari 2: RW 3 RT 7, 8, 9, 10
UPDATE public.komunitas
SET 
  nama = 'Posyandu Melatisari 2',
  nama_komunitas = 'Posyandu Melatisari 2',
  rw = '03',
  rt = '07',
  lokasi = 'Balai Posyandu / RW 03, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Melatisari 2 Tegalsari cakupan sinkronisasi wilayah RW 03 (RT 7, 8, 9, 10): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '5a8a8e3b-9a2c-44aa-8596-d0a1c012b628';

-- 6. Posyandu Sejahtera 1: RW 4 RT 1, 6, 7, 8, 9, 10
UPDATE public.komunitas
SET 
  nama = 'Posyandu Sejahtera 1',
  nama_komunitas = 'Posyandu Sejahtera 1',
  rw = '04',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 04, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Sejahtera 1 Tegalsari cakupan sinkronisasi wilayah RW 04 (RT 1, 6, 7, 8, 9, 10): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'af0feea0-fbca-44c4-8000-d4ed7a0eeeb0';

-- 7. Posyandu Sejahtera 2: RW 4 RT 2, 3, 4, 5
UPDATE public.komunitas
SET 
  nama = 'Posyandu Sejahtera 2',
  nama_komunitas = 'Posyandu Sejahtera 2',
  rw = '04',
  rt = '02',
  lokasi = 'Balai Posyandu / RW 04, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Sejahtera 2 Tegalsari cakupan sinkronisasi wilayah RW 04 (RT 2, 3, 4, 5): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '66aaf1ce-76c3-4363-8f2a-fc2d2749b062';

-- 8. Posyandu Mawar Merah: RW 5 (RT 01 s/d RT 06)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Mawar Merah',
  nama_komunitas = 'Posyandu Mawar Merah',
  rw = '05',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 05, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Mawar Merah Tegalsari: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'c0b56c95-1bd4-4d71-8e2c-35cda656c2c8';

-- 9. Posyandu Kuncup Mekar: RW 6 (RT 01 s/d RT 06)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Kuncup Mekar',
  nama_komunitas = 'Posyandu Kuncup Mekar',
  rw = '06',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 06, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kuncup Mekar Tegalsari: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '1f4e2ab6-ab04-4639-86c1-b995731ae82d';

-- 10. Posyandu Bougenville: RW 7 (RT 01 s/d RT 04)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Bougenville',
  nama_komunitas = 'Posyandu Bougenville',
  rw = '07',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 07, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Bougenville Tegalsari: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'df44de8c-b56b-4b87-8895-35b9e0ba5fa7';

-- 11. Posyandu Kamboja: RW 8 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Kamboja',
  nama_komunitas = 'Posyandu Kamboja',
  rw = '08',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 08, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kamboja Tegalsari: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '6b1baada-093a-403e-86eb-50d54599d1f9';

-- 12. Posyandu Layangsari A: RW 9 RT 1, 2, 3, 4
UPDATE public.komunitas
SET 
  nama = 'Posyandu Layangsari A',
  nama_komunitas = 'Posyandu Layangsari A',
  rw = '09',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 09, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Layangsari A Tegalsari cakupan sinkronisasi wilayah RW 09 (RT 1, 2, 3, 4): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'e16878e7-303e-46fd-89b6-d3e179ff87c0';

-- 13. Posyandu Layangsari B: RW 9 RT 5, 6, 7, 8, 9, 10
UPDATE public.komunitas
SET 
  nama = 'Posyandu Layangsari B',
  nama_komunitas = 'Posyandu Layangsari B',
  rw = '09',
  rt = '05',
  lokasi = 'Balai Posyandu / RW 09, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Layangsari B Tegalsari cakupan sinkronisasi wilayah RW 09 (RT 5, 6, 7, 8, 9, 10): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '78b19802-31d2-4ba4-8c3d-cd09b902bf9d';

-- 14. Posyandu Wijayakusuma 1: RW 10 RT 3, 4, 5, 6, 7, 8, 9
UPDATE public.komunitas
SET 
  nama = 'Posyandu Wijayakusuma 1',
  nama_komunitas = 'Posyandu Wijayakusuma 1',
  rw = '10',
  rt = '03',
  lokasi = 'Balai Posyandu / RW 10, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Wijayakusuma 1 Tegalsari cakupan sinkronisasi wilayah RW 10 (RT 3, 4, 5, 6, 7, 8, 9): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '2de41990-112e-4bf0-8652-c171103f35b4';

-- 15. Posyandu Wijayakusuma 2: RW 10 RT 1, 2, 10
UPDATE public.komunitas
SET 
  nama = 'Posyandu Wijayakusuma 2',
  nama_komunitas = 'Posyandu Wijayakusuma 2',
  rw = '10',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 10, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Wijayakusuma 2 Tegalsari cakupan sinkronisasi wilayah RW 10 (RT 1, 2, 10): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '040db058-8448-4ca2-8010-569131f57218';

-- 16. Posyandu Kenanga A: RW 11 RT 3, 4, 5
UPDATE public.komunitas
SET 
  nama = 'Posyandu Kenanga A',
  nama_komunitas = 'Posyandu Kenanga A',
  rw = '11',
  rt = '03',
  lokasi = 'Balai Posyandu / RW 11, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kenanga A Tegalsari cakupan sinkronisasi wilayah RW 11 (RT 3, 4, 5): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = '88b855cf-e73c-4cf7-8d6c-6751c1702e6c';

-- 17. Posyandu Kenanga B: RW 11 RT 1, 2
UPDATE public.komunitas
SET 
  nama = 'Posyandu Kenanga B',
  nama_komunitas = 'Posyandu Kenanga B',
  rw = '11',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 11, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Kenanga B Tegalsari cakupan sinkronisasi wilayah RW 11 (RT 1, 2): layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'ae11e8bc-e73c-4cf7-81fa-f9e9475bf8d7';

-- 18. Posyandu Anggrek Ungu: RW 12 (RT 01 s/d RT 05) dan RW 13 / RW 31 (RT 01 s/d RT 05)
UPDATE public.komunitas
SET 
  nama = 'Posyandu Anggrek Ungu',
  nama_komunitas = 'Posyandu Anggrek Ungu',
  rw = '12',
  rt = '01',
  lokasi = 'Balai Posyandu / RW 12, Tegalsari, Tegal Barat, Kota Tegal',
  deskripsi = 'Layanan terpadu Posyandu Anggrek Ungu Tegalsari cakupan sinkronisasi wilayah RW 12 dan RW 31: layanan kesehatan balita, imunisasi, dan PMT balita serta ibu hamil.'
WHERE id = 'b9eb4b9f-b56b-4b87-8640-ed815ace953c';

-- 19. Bersihkan Data Anomali yang Melanggar Batas RT Resmi Tegalsari (21 baris data)
DELETE FROM public.data_anak
WHERE LOWER(kelurahan) = 'tegalsari'
  AND (
    (rw IN ('1', '01') AND (rt ~ '^[0-9]+$' AND rt::integer > 6))
    OR (rw IN ('2', '02') AND (rt ~ '^[0-9]+$' AND rt::integer > 10))
    OR (rw IN ('3', '03') AND (rt ~ '^[0-9]+$' AND rt::integer > 10))
    OR (rw IN ('4', '04') AND (rt ~ '^[0-9]+$' AND rt::integer > 10))
    OR (rw IN ('5', '05') AND (rt ~ '^[0-9]+$' AND rt::integer > 6))
    OR (rw IN ('6', '06') AND (rt ~ '^[0-9]+$' AND rt::integer > 6))
    OR (rw IN ('7', '07') AND (rt ~ '^[0-9]+$' AND rt::integer > 4))
    OR (rw IN ('8', '08') AND (rt ~ '^[0-9]+$' AND rt::integer > 5))
    OR (rw IN ('9', '09') AND (rt ~ '^[0-9]+$' AND rt::integer > 10))
    OR (rw IN ('10') AND (rt ~ '^[0-9]+$' AND rt::integer > 10))
    OR (rw IN ('11') AND (rt ~ '^[0-9]+$' AND rt::integer > 5))
    OR (rw IN ('12') AND (rt ~ '^[0-9]+$' AND rt::integer > 5))
    OR (rw IN ('13', '31') AND (rt ~ '^[0-9]+$' AND rt::integer > 5))
    OR (rw ~ '^[0-9]+$' AND rw::integer > 13 AND rw != '31')
  );

