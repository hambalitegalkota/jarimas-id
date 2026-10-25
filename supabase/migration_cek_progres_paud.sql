-- ==============================================================================
-- JARIMAS-ID: MIGRASI FITUR CEK PROGRES KEGIATAN ADMINISTRATIF (KASUS PAUD)
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. TABEL MASTER: kegiatan_administratif
CREATE TABLE IF NOT EXISTS public.kegiatan_administratif (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kode TEXT NOT NULL UNIQUE,
  judul TEXT NOT NULL,
  deskripsi TEXT,
  target_entitas TEXT NOT NULL DEFAULT 'satuan_paud', -- 'satuan_paud', 'posyandu', 'warga_kita'
  tanggal_mulai DATE NOT NULL DEFAULT CURRENT_DATE,
  tanggal_selesai DATE,
  status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'selesai', 'arsip')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indeks performa pencarian kode kegiatan
CREATE INDEX IF NOT EXISTS idx_kegiatan_administratif_kode 
ON public.kegiatan_administratif (kode);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.kegiatan_administratif ENABLE ROW LEVEL SECURITY;

-- Policy RLS: Hanya Admin yang dapat membaca daftar kegiatan administratif
DROP POLICY IF EXISTS "Admin dapat melihat kegiatan administratif" ON public.kegiatan_administratif;
CREATE POLICY "Admin dapat melihat kegiatan administratif"
ON public.kegiatan_administratif
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
      AND (p.is_super_admin = TRUE OR p.is_admin_pusat = TRUE)
  )
  OR EXISTS (
    SELECT 1 FROM public.anggota_komunitas ak
    WHERE ak.user_id = auth.uid()
      AND ak.status = 'approved'
      AND lower(ak.peran) SIMILAR TO '%(admin|pengurus|ketua|kepala|guru|tutor|pengelola|kader)%'
  )
);

-- Policy RLS: Hanya Super Admin / Admin Pusat yang dapat menambah/mengedit kegiatan
DROP POLICY IF EXISTS "Super Admin kelola kegiatan administratif" ON public.kegiatan_administratif;
CREATE POLICY "Super Admin kelola kegiatan administratif"
ON public.kegiatan_administratif
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
      AND (p.is_super_admin = TRUE OR p.is_admin_pusat = TRUE)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() 
      AND (p.is_super_admin = TRUE OR p.is_admin_pusat = TRUE)
  )
);

-- 2. SEED KEGIATAN PERTAMA: UPDATE DATA ANAK OLEH SATUAN PAUD
INSERT INTO public.kegiatan_administratif (
  kode,
  judul,
  deskripsi,
  target_entitas,
  status,
  tanggal_mulai
)
VALUES (
  'update_data_anak_paud',
  'Update Data Anak Usia Dini oleh Satuan PAUD',
  'Pembaruan kelengkapan dan validasi data anak usia dini (0-6 tahun) oleh pengurus/guru masing-masing Satuan PAUD se-Kota Tegal.',
  'satuan_paud',
  'aktif',
  CURRENT_DATE
)
ON CONFLICT (kode) DO UPDATE SET
  judul = EXCLUDED.judul,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

-- 3. TAMBAHKAN KOLOM AUDIT PEMBARUAN PADA TABEL data_anak
ALTER TABLE public.data_anak 
ADD COLUMN IF NOT EXISTS is_updated_by_paud BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terakhir_diperbarui_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS diperbarui_oleh UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_data_anak_paud_progress 
ON public.data_anak (komunitas_id, is_updated_by_paud);

-- Koreksi: Pastikan hanya data yang divalidasi atau diedit oleh user yang ditandai aktif
UPDATE public.data_anak
SET is_updated_by_paud = FALSE,
    terakhir_diperbarui_at = NULL
WHERE status_approval = 'pending' 
  AND diperbarui_oleh IS NULL;

-- 4. FUNGSI DATABASE RPC: get_cek_progres_paud
-- Menghitung agregasi persentase progres Satuan PAUD dengan filter ketat hierarki RLS
CREATE OR REPLACE FUNCTION public.get_cek_progres_paud(
  p_user_id UUID,
  p_kecamatan TEXT DEFAULT NULL,
  p_kelurahan TEXT DEFAULT NULL
)
RETURNS TABLE (
  komunitas_id UUID,
  nama_paud TEXT,
  jenis_institusi TEXT,
  kecamatan TEXT,
  kelurahan TEXT,
  jumlah_anggota BIGINT,
  has_anggota BOOLEAN,
  total_peserta_didik BIGINT,
  total_diperbarui BIGINT,
  persentase_selesai NUMERIC,
  status_penyelesaian TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_super_admin BOOLEAN := FALSE;
  v_is_admin_pusat BOOLEAN := FALSE;
  v_is_admin_wilayah BOOLEAN := FALSE;
  v_user_kecamatan TEXT := NULL;
  v_user_kelurahan TEXT := NULL;
  v_admin_komunitas_ids UUID[] := ARRAY[]::UUID[];
BEGIN
  -- 1. Evaluasi Peran Pengguna Aktif jika terautentikasi (Opsional)
  IF p_user_id IS NOT NULL THEN
    SELECT 
      COALESCE(p.is_super_admin, FALSE), 
      COALESCE(p.is_admin_pusat, FALSE)
    INTO v_is_super_admin, v_is_admin_pusat
    FROM public.profiles p
    WHERE p.id = p_user_id;

    -- Ambil komunitas binaan jika ada
    SELECT ARRAY_AGG(ak.komunitas_id)
    INTO v_admin_komunitas_ids
    FROM public.anggota_komunitas ak
    WHERE ak.user_id = p_user_id 
      AND ak.status = 'approved';
  END IF;

  -- 2. Eksekusi Query Agregasi Progres PAUD
  -- Catatan: Hanya PKBM Star of Tomorrow dan SKB yang memiliki layanan PAUD yang disertakan.
  RETURN QUERY
  WITH paud_members AS (
    SELECT 
      ak.komunitas_id,
      COUNT(ak.id) AS member_count
    FROM public.anggota_komunitas ak
    WHERE ak.status = 'approved'
    GROUP BY ak.komunitas_id
  ),
  paud_students AS (
    SELECT 
      k.id AS komunitas_id,
      COUNT(da.id) AS student_count,
      COUNT(CASE 
        WHEN COALESCE(pm.member_count, 0) > 0 AND (
          da.status_approval = 'approved' 
          OR da.validated_at IS NOT NULL 
          OR (da.is_updated_by_paud = TRUE AND da.diperbarui_oleh IS NOT NULL)
        ) THEN 1 
      END) AS updated_count
    FROM public.komunitas k
    LEFT JOIN paud_members pm ON pm.komunitas_id = k.id
    LEFT JOIN public.data_anak da ON (
      da.is_sekolah = TRUE AND (
        da.komunitas_id = k.id 
        OR LOWER(REGEXP_REPLACE(da.nama_sekolah, '[^a-zA-Z0-9]', '', 'g')) = LOWER(REGEXP_REPLACE(k.nama, '[^a-zA-Z0-9]', '', 'g'))
        OR LOWER(REGEXP_REPLACE(da.nama_sekolah, '[^a-zA-Z0-9]', '', 'g')) LIKE '%' || LOWER(REGEXP_REPLACE(k.nama, '[^a-zA-Z0-9]', '', 'g')) || '%'
        OR LOWER(REGEXP_REPLACE(k.nama, '[^a-zA-Z0-9]', '', 'g')) LIKE '%' || LOWER(REGEXP_REPLACE(da.nama_sekolah, '[^a-zA-Z0-9]', '', 'g')) || '%'
      )
    )
    WHERE k.jenis = 'satuan_paud'
      AND (
        k.nama NOT ILIKE '%PKBM%' 
        OR k.nama ILIKE '%STAR OF TOMORROW%'
      )
    GROUP BY k.id
  )
  SELECT
    k.id AS komunitas_id,
    k.nama AS nama_paud,
    CASE 
      WHEN k.nama ILIKE 'TK %' OR k.nama ILIKE 'TK-%' OR k.nama ILIKE '%Taman Kanak%' THEN 'TK'
      WHEN k.nama ILIKE 'KB %' OR k.nama ILIKE '%Kelompok Bermain%' THEN 'KB'
      WHEN k.nama ILIKE 'RA %' OR k.nama ILIKE '%Raudhatul%' THEN 'RA'
      WHEN k.nama ILIKE '%SKB%' OR k.nama ILIKE '%Sanggar Kegiatan%' OR k.nama ILIKE '%SPNF%' THEN 'SKB'
      WHEN k.nama ILIKE '%Star of Tomorrow%' OR k.nama ILIKE 'PKBM %' OR k.nama ILIKE '%PKBM%' THEN 'PKBM'
      WHEN k.nama ILIKE 'Pos PAUD %' OR k.nama ILIKE '%SPS%' THEN 'SPS / Pos PAUD'
      WHEN k.nama ILIKE 'TPA %' THEN 'TPA'
      ELSE 'PAUD'
    END AS jenis_institusi,
    COALESCE(NULLIF(k.kecamatan, ''), 'Kota Tegal') AS kecamatan,
    COALESCE(NULLIF(k.kelurahan, ''), '-') AS kelurahan,
    COALESCE(pm.member_count, 0) AS jumlah_anggota,
    (COALESCE(pm.member_count, 0) > 0) AS has_anggota,
    COALESCE(ps.student_count, 0) AS total_peserta_didik,
    COALESCE(ps.updated_count, 0) AS total_diperbarui,
    CASE 
      WHEN COALESCE(ps.student_count, 0) = 0 THEN 0.0
      ELSE ROUND((COALESCE(ps.updated_count, 0)::NUMERIC / ps.student_count::NUMERIC) * 100, 1)
    END AS persentase_selesai,
    CASE 
      WHEN COALESCE(ps.student_count, 0) = 0 THEN 'KOSONG'
      WHEN COALESCE(pm.member_count, 0) = 0 THEN 'BELUM_MULAI'
      WHEN COALESCE(ps.updated_count, 0) >= ps.student_count AND ps.student_count > 0 THEN 'SELESAI'
      WHEN COALESCE(ps.updated_count, 0) > 0 THEN 'PROGRES'
      ELSE 'BELUM_MULAI'
    END AS status_penyelesaian
  FROM public.komunitas k
  LEFT JOIN paud_members pm ON pm.komunitas_id = k.id
  LEFT JOIN paud_students ps ON ps.komunitas_id = k.id
  WHERE k.jenis = 'satuan_paud'
    AND (
      k.nama NOT ILIKE '%PKBM%' 
      OR k.nama ILIKE '%STAR OF TOMORROW%'
    )
    -- Filter opsional parameter pencarian/filter:
    AND (p_kecamatan IS NULL OR p_kecamatan = 'semua' OR k.kecamatan = p_kecamatan)
    AND (p_kelurahan IS NULL OR p_kelurahan = 'semua' OR k.kelurahan = p_kelurahan)
  ORDER BY 
    CASE 
      WHEN COALESCE(ps.student_count, 0) = 0 THEN 0.0
      ELSE ROUND((COALESCE(ps.updated_count, 0)::NUMERIC / ps.student_count::NUMERIC) * 100, 1)
    END DESC,
    COALESCE(ps.student_count, 0) DESC,
    COALESCE(pm.member_count, 0) DESC,
    k.nama ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_cek_progres_paud(UUID, TEXT, TEXT) TO authenticated, anon;
