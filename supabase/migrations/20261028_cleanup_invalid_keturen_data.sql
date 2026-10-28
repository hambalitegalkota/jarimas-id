-- Migration: Pembersihan Data Tidak Sesuai Ketentuan di Kelurahan Keturen, Tegal Selatan
-- Ketentuan Resmi:
-- 1. Jumlah RW ada 4 (RW 1 s/d 4)
-- 2. RW 1: RT 1 s/d 6
-- 3. RW 2: RT 1 s/d 7
-- 4. RW 3: RT 1 s/d 5
-- Menghapus 5 data anomali (RW 5 yang tidak ada di Keturen, dan RW 1 RT 8 yang melebihi batas RT):

DELETE FROM public.data_anak
WHERE id IN (
  '46209411-e32d-43f0-9388-423a3a5fdf6a', -- Al Farizki (RW 1 RT 8)
  'd7c62eb4-4b08-4720-b118-68fabb4a26cd', -- Alea Putri (RW 1 RT 8)
  'd490ac27-f96f-496b-a753-141260899aa4', -- ANNISA RUMAISA (RW 5 RT 2)
  '18e358d9-1cff-40c8-8234-8bdfc459965d', -- ANNISA RUMAISA duplicate (RW 5 RT 2)
  '1e11aad5-f26d-419e-bbb9-b1ee25995eb0'  -- AKHMAD GIBRAN MUZAKI (RW 5 RT 2)
);

-- Update RW resmi Posyandu di tabel komunitas:
UPDATE public.komunitas SET rw = '01' WHERE id = 'f4ee9ad6-e43a-44a1-8e5d-c701d09f0dee';
UPDATE public.komunitas SET rw = '02' WHERE id = '713452f1-ed3a-45cc-8d36-13c56b2c418b';
UPDATE public.komunitas SET rw = '03' WHERE id = 'd704a3cb-88eb-49b2-8a7c-fa211f69f50c';
UPDATE public.komunitas SET rw = '03' WHERE id = 'a5582b58-4c94-4bf6-885e-f371256ae4b0';

