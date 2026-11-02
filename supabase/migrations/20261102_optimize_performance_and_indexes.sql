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

-- 4. HAPUS FUNGSI RPC get_cek_progres_paud
-- Kalkulasi Cek Progres secara resmi dan presisi penuh dikelola oleh engine Server Action Next.js
-- yang memiliki algoritma fuzzy matching nama sekolah, disambiguasi kelurahan, dan pelacakan validator aktif.
DROP FUNCTION IF EXISTS public.get_cek_progres_paud(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_cek_progres_paud(UUID, TEXT, TEXT, TEXT);


