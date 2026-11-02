-- ==============================================================================
-- JARIMAS-ID: OPTIMASI PERFORMA DATABASE, INDEKS, DAN RPC CEK PROGRES
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. INDEKS B-TREE UNTUK MENGHILANGKAN FULL TABLE SCAN PADA TABEL DATA_ANAK
CREATE INDEX IF NOT EXISTS idx_data_anak_komunitas_id 
ON public.data_anak (komunitas_id);

CREATE INDEX IF NOT EXISTS idx_data_anak_is_sekolah 
ON public.data_anak (is_sekolah);

CREATE INDEX IF NOT EXISTS idx_data_anak_status_approval 
ON public.data_anak (status_approval);

CREATE INDEX IF NOT EXISTS idx_data_anak_created_at_desc 
ON public.data_anak (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_data_anak_komunitas_status 
ON public.data_anak (komunitas_id, status_approval);

-- 2. INDEKS UNTUK ANGGOTA_KOMUNITAS
CREATE INDEX IF NOT EXISTS idx_anggota_komunitas_kom_status 
ON public.anggota_komunitas (komunitas_id, status);

CREATE INDEX IF NOT EXISTS idx_anggota_komunitas_user_status 
ON public.anggota_komunitas (user_id, status);

-- 3. INDEKS TRIGRAM UNTUK PENCARIAN TEKS CEPAT (NAMA SEKOLAH)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_data_anak_nama_sekolah_trgm 
ON public.data_anak USING gin (nama_sekolah gin_trgm_ops);

-- 4. PERBAIKAN DAN OPTIMASI RPC get_cek_progres_paud
-- Mengganti kueri lambat & memperbaiki error 'column k.jenis_institusi does not exist'
DROP FUNCTION IF EXISTS public.get_cek_progres_paud(UUID, TEXT, TEXT);

CREATE OR REPLACE FUNCTION public.get_cek_progres_paud(
  p_user_id UUID DEFAULT NULL,
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
BEGIN
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
      da.komunitas_id,
      COUNT(da.id) AS student_count,
      COUNT(CASE 
        WHEN (
          da.status_approval = 'approved' 
          OR da.validated_at IS NOT NULL 
          OR (da.is_updated_by_paud = TRUE AND da.diperbarui_oleh IS NOT NULL)
        ) THEN 1 
      END) AS updated_count
    FROM public.data_anak da
    WHERE da.is_sekolah = TRUE
      AND da.komunitas_id IS NOT NULL
    GROUP BY da.komunitas_id
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
    AND (p_kecamatan IS NULL OR p_kecamatan = 'semua' OR k.kecamatan = p_kecamatan)
    AND (p_kelurahan IS NULL OR p_kelurahan = 'semua' OR k.kelurahan = p_kelurahan)
  ORDER BY 
    CASE WHEN COALESCE(pm.member_count, 0) > 0 THEN 1 ELSE 0 END DESC,
    CASE 
      WHEN COALESCE(ps.student_count, 0) = 0 THEN 0.0
      ELSE ROUND((COALESCE(ps.updated_count, 0)::NUMERIC / ps.student_count::NUMERIC) * 100, 1)
    END DESC,
    COALESCE(ps.updated_count, 0) DESC,
    COALESCE(ps.student_count, 0) DESC,
    COALESCE(pm.member_count, 0) DESC,
    k.nama ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_cek_progres_paud(UUID, TEXT, TEXT) TO authenticated, anon;

