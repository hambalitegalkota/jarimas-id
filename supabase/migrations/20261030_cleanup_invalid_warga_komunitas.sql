-- ==============================================================================
-- Migration: Pembersihan Komunitas Warga Kita (RT/RW) Anomali / Tidak Sesuai Ketentuan
-- Tanggal: 30 Oktober 2026
-- Wilayah: Tunon, Debong Kulon, Keturen, Pekauman, Debong Lor, Debong Kidul, Panggung, Tegalsari
-- Ketentuan:
-- 1. Pilihan RW "Belum Tahu" dan RT "Belum Tahu" tetap dipertahankan.
-- 2. Menghapus keterkaitan data pada anggota_komunitas terlebih dahulu.
-- 3. Menghapus data rukun tetangga dan rukun warga anomali yang melebihi batas resmi.
-- ==============================================================================

-- 1. IDENTIFIKASI & BERSIHKAN ANGGOTA KOMUNITAS TERKAIT ANOMALI
DELETE FROM public.anggota_komunitas
WHERE komunitas_id IN (
  SELECT id FROM public.komunitas
  WHERE jenis = 'warga_kita'
    AND (
      -- TUNON (Maks 4 RW)
      (LOWER(kelurahan) LIKE '%tunon%' AND (
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 4 AND rw NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 1 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 2 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 3 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 4 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 4 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%')
      ))
      OR
      -- DEBONG KULON (Maks 4 RW)
      (LOWER(kelurahan) LIKE '%debong kulon%' AND (
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 4 AND rw NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 1 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 2 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 3 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 4 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 4 AND rt NOT ILIKE '%belum%')
      ))
      OR
      -- KETUREN (Maks 4 RW)
      (LOWER(kelurahan) LIKE '%keturen%' AND (
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 4 AND rw NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 1 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 2 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 7 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 3 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 4 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%')
      ))
      OR
      -- PEKAUMAN (Maks 8 RW)
      (LOWER(kelurahan) LIKE '%pekauman%' AND (
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 8 AND rw NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 1 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 2 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 7 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 3 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 4 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 7 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 5 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 6 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 9 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 7 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 8 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%')
      ))
      OR
      -- DEBONG LOR (Maks 3 RW)
      (LOWER(kelurahan) LIKE '%debong lor%' AND (
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 3 AND rw NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 1 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 8 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 2 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 3 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 4 AND rt NOT ILIKE '%belum%')
      ))
      OR
      -- DEBONG KIDUL (Maks 4 RW, masing-masing maks 5 RT)
      (LOWER(kelurahan) LIKE '%debong kidul%' AND (
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 4 AND rw NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%')
      ))
      OR
      -- PANGGUNG (Maks 14 RW)
      (LOWER(kelurahan) LIKE '%panggung%' AND (
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 14 AND rw NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 1 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 9 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 2 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 11 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 3 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 9 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 4 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 9 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 5 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 9 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 6 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 10 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 7 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 20 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 8 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 9 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 20 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 10 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 11 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 11 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 12 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 13 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 13 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 7 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 14 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%')
      ))
      OR
      -- TEGALSARI (Maks 13 RW + varian 31)
      (LOWER(kelurahan) LIKE '%tegalsari%' AND (
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 13 AND NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int != 31 AND rw NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 1 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 2 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 10 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 3 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 10 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 4 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 10 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 5 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 6 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 7 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 4 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 8 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 9 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 10 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 10 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 10 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 11 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 12 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
        (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int IN (13, 31) AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%')
      ))
    )
);

-- 2. HAPUS KOMUNITAS WARGA_KITA ANOMALI DARI TABEL KOMUNITAS
DELETE FROM public.komunitas
WHERE jenis = 'warga_kita'
  AND (
    -- TUNON (Maks 4 RW)
    (LOWER(kelurahan) LIKE '%tunon%' AND (
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 4 AND rw NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 1 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 2 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 3 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 4 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 4 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%')
    ))
    OR
    -- DEBONG KULON (Maks 4 RW)
    (LOWER(kelurahan) LIKE '%debong kulon%' AND (
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 4 AND rw NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 1 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 2 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 3 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 4 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 4 AND rt NOT ILIKE '%belum%')
    ))
    OR
    -- KETUREN (Maks 4 RW)
    (LOWER(kelurahan) LIKE '%keturen%' AND (
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 4 AND rw NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 1 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 2 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 7 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 3 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 4 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%')
    ))
    OR
    -- PEKAUMAN (Maks 8 RW)
    (LOWER(kelurahan) LIKE '%pekauman%' AND (
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 8 AND rw NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 1 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 2 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 7 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 3 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 4 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 7 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 5 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 6 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 9 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 7 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 8 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%')
    ))
    OR
    -- DEBONG LOR (Maks 3 RW)
    (LOWER(kelurahan) LIKE '%debong lor%' AND (
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 3 AND rw NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 1 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 8 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 2 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 3 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 4 AND rt NOT ILIKE '%belum%')
    ))
    OR
    -- DEBONG KIDUL (Maks 4 RW, masing-masing maks 5 RT)
    (LOWER(kelurahan) LIKE '%debong kidul%' AND (
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 4 AND rw NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%')
    ))
    OR
    -- PANGGUNG (Maks 14 RW)
    (LOWER(kelurahan) LIKE '%panggung%' AND (
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 14 AND rw NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 1 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 9 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 2 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 11 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 3 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 9 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 4 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 9 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 5 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 9 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 6 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 10 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 7 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 20 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 8 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 9 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 20 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 10 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 11 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 11 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 12 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 13 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 13 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 7 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 14 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%')
    ))
    OR
    -- TEGALSARI (Maks 13 RW + varian 31)
    (LOWER(kelurahan) LIKE '%tegalsari%' AND (
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int > 13 AND NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int != 31 AND rw NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 1 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 2 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 10 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 3 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 10 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 4 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 10 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 5 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 6 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 6 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 7 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 4 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 8 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 9 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 10 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 10 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 10 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 11 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int = 12 AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%') OR
      (NULLIF(regexp_replace(rw, '\D', '', 'g'), '')::int IN (13, 31) AND NULLIF(regexp_replace(rt, '\D', '', 'g'), '')::int > 5 AND rt NOT ILIKE '%belum%')
    ))
  );

