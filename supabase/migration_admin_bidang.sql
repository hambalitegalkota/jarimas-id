-- ==============================================================================
-- Migration: Penugasan dan Hak Akses Admin Bidang (SPM) Kota Tegal
-- ==============================================================================
-- Memberikan fasilitas pengangkatan Admin Bidang (Pendidikan, Kesehatan,
-- Pekerjaan Umum, Perumahan Rakyat, Trantibumlinmas, Sosial) oleh Super Admin,
-- Admin Pusat, dan Admin Kota.
-- Memungkinkan hak akses melihat (Read-Only) seluruh data detail tanpa batasan wilayah.

-- 1. Buat Tabel public.admin_bidang jika belum ada
CREATE TABLE IF NOT EXISTS public.admin_bidang (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bidang TEXT NOT NULL, -- 'pendidikan', 'kesehatan', 'pekerjaan_umum', 'perumahan_rakyat', 'trantibumlinmas', 'sosial'
  assigned_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, bidang)
);

-- 2. Buat Index untuk performa query cepat
CREATE INDEX IF NOT EXISTS idx_admin_bidang_user_id ON public.admin_bidang(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_bidang_bidang ON public.admin_bidang(bidang);

-- 3. Kebijakan Keamanan Row Level Security (RLS)
ALTER TABLE public.admin_bidang ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin bidang dapat dibaca oleh pengguna terautentikasi" ON public.admin_bidang;
CREATE POLICY "Admin bidang dapat dibaca oleh pengguna terautentikasi" ON public.admin_bidang 
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Super Admin, Admin Pusat, dan Admin Kota dapat mengelola admin_bidang" ON public.admin_bidang;
CREATE POLICY "Super Admin, Admin Pusat, dan Admin Kota dapat mengelola admin_bidang" ON public.admin_bidang 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND (is_super_admin = true OR is_admin_pusat = true)
    ) OR
    EXISTS (
      SELECT 1 FROM public.anggota_komunitas ak
      JOIN public.komunitas k ON k.id = ak.komunitas_id
      WHERE ak.user_id = auth.uid() 
        AND ak.status = 'approved'
        AND (ak.peran ILIKE '%admin kota%' OR (k.nama ILIKE '%warga kota tegal%' AND ak.peran ILIKE '%admin%'))
    ) OR
    auth.role() = 'service_role'
  );
