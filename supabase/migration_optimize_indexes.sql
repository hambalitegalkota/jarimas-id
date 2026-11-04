-- ==============================================================================
-- Migration: Optimasi Index Tabel data_anak untuk Mengurangi Log & Beban CPU Supabase
-- Menjadikan kueri agregasi, cek progres, dan filter wilayah jauh lebih cepat
-- ==============================================================================

-- 1. Index pada created_at untuk mempercepat chunking dan sortir tanpa sort in-memory
CREATE INDEX IF NOT EXISTS idx_data_anak_created_at ON public.data_anak(created_at DESC);

-- 2. Index pada is_sekolah untuk mempercepat kueri Cek Progres Satuan PAUD
CREATE INDEX IF NOT EXISTS idx_data_anak_is_sekolah ON public.data_anak(is_sekolah);

-- 3. Composite index pada komunitas_id dan status_approval
CREATE INDEX IF NOT EXISTS idx_data_anak_komunitas_status ON public.data_anak(komunitas_id, status_approval);
