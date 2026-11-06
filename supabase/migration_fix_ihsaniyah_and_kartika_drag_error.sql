-- Migration: Perbaikan Data Anak KB Ihsaniyah 3 dan TK Kartika III-28
-- Masalah: Anomali drag/autofill excel saat impor data awal menyebabkan penomoran bertambah otomatis
-- 1. KB Ihsaniyah 3: KB IHSANIYAH 4 s/d 18 (15 anak) seharusnya masuk ke KB Ihsaniyah 3 (total menjadi 16 anak)
-- 2. TK Kartika III-28: TK KARTIKA 111-29 dan 111-30 (2 anak) seharusnya masuk ke TK Kartika III-28 (total menjadi 12 anak)

-- 1. Perbaikan KB Ihsaniyah 3
UPDATE public.data_anak
SET 
  nama_sekolah = 'KB Ihsaniyah 3',
  komunitas_id = 'e4bf87aa-96fe-433e-8c1f-9fc1d2fc8b76'
WHERE 
  nama_sekolah IN (
    'KB IHSANIYAH 3',
    'KB IHSANIYAH 4',
    'KB IHSANIYAH 5',
    'KB IHSANIYAH 6',
    'KB IHSANIYAH 7',
    'KB IHSANIYAH 8',
    'KB IHSANIYAH 9',
    'KB IHSANIYAH 10',
    'KB IHSANIYAH 11',
    'KB IHSANIYAH 12',
    'KB IHSANIYAH 13',
    'KB IHSANIYAH 14',
    'KB IHSANIYAH 15',
    'KB IHSANIYAH 16',
    'KB IHSANIYAH 17',
    'KB IHSANIYAH 18'
  )
  OR id IN (
    '49e67860-60fe-4146-acbb-ea0ddb4f27a8',
    'bb28f42e-5495-422e-89da-1ba4d3982f4e',
    '049afb2b-1295-47ce-b9bc-fdcdd10f2c19',
    '9392089b-4801-4dfe-bdef-324ab38746f8',
    '53833601-b96a-470b-b593-eb825ac8c1da',
    '14bd441f-d1fa-4606-b7c1-9b31917e4faa',
    '84370ac9-e7a0-4d42-9f9c-e3153907d9db',
    'd5fb6bfe-43c3-4a41-bf44-2731edcd4f14',
    'd8e640a8-63d5-489c-b6c0-75dbc68782f5',
    'd818aa11-c29e-49b8-b6bd-b71432fe7e06',
    '30fcfd45-eb7d-4b8e-b2f6-ed4439449a76',
    '416d24cd-2262-4051-85b6-fadc68cefba4',
    'd8a93e19-59db-4220-bffa-7fffdc0200b9',
    '05464851-56fa-47d0-9afd-bad450339f0c',
    '61823abc-a866-4b10-be86-196b22e5edce',
    'bf47222b-817b-453d-ba2d-df00769e643f'
  );

-- 2. Perbaikan TK Kartika III-28
UPDATE public.data_anak
SET 
  nama_sekolah = 'TK Kartika III-28',
  komunitas_id = 'c8a928ca-de31-415a-8fe3-95b5b2ad050d'
WHERE 
  nama_sekolah IN (
    'TK Kartika III-28',
    'TK KARTIKA III-28',
    'TK KARTIKA 111-28',
    'TK KARTIKA 111-29',
    'TK KARTIKA 111-30',
    'TK KARTIKA III-29',
    'TK KARTIKA III-30'
  )
  OR id IN (
    '118ff545-b5b4-476f-859b-2202ea5f5210',
    '85063f7b-d91d-4afb-aecc-1b7ab366236b'
  );
