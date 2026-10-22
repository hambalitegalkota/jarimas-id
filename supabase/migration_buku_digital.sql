-- ==============================================================================
-- MIGRATION: TABEL BUKU DIGITAL (PERPUSTAKAAN DIGITAL / DIREKTORI MODUL & BUKU)
-- ==============================================================================
-- Tabel ini menyimpan direktori kurasi buku digital, modul parenting, panduan kader,
-- serta materi edukasi yang dapat diakses dan dibaca oleh publik.
-- ==============================================================================

-- 1. Pastikan ekstensi UUID tersedia
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Buat tabel buku_digital
CREATE TABLE IF NOT EXISTS public.buku_digital (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judul TEXT NOT NULL,
  kategori TEXT,
  url_sampul TEXT,
  sinopsis TEXT,
  url_baca TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tambahkan Index untuk mempercepat pencarian, filter kategori, dan pengurutan
CREATE INDEX IF NOT EXISTS idx_buku_digital_kategori ON public.buku_digital(kategori);
CREATE INDEX IF NOT EXISTS idx_buku_digital_created_at ON public.buku_digital(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_buku_digital_judul ON public.buku_digital(judul);

-- 4. Aktifkan Row Level Security (RLS)
ALTER TABLE public.buku_digital ENABLE ROW LEVEL SECURITY;

-- 5. Kebijakan RLS: Publik (Anonim & Authenticated) dapat membaca (SELECT) data buku
DROP POLICY IF EXISTS "Buku digital dapat dibaca oleh publik" ON public.buku_digital;
CREATE POLICY "Buku digital dapat dibaca oleh publik"
  ON public.buku_digital
  FOR SELECT
  USING (true);

-- 6. Kebijakan RLS Tambahan (Admin): Super Admin & Admin Pusat dapat mengelola (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admin dapat mengelola buku digital" ON public.buku_digital;
CREATE POLICY "Admin dapat mengelola buku digital"
  ON public.buku_digital
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND (profiles.is_super_admin = true OR profiles.is_admin_pusat = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND (profiles.is_super_admin = true OR profiles.is_admin_pusat = true)
    )
  );

-- ==============================================================================
-- CONTOH DATA AWAL / SEED DATA (Opsional - Jalankan jika ingin mengisi data awal)
-- ==============================================================================
/*
INSERT INTO public.buku_digital (judul, kategori, url_sampul, sinopsis, url_baca)
VALUES 
  (
    'Panduan Pola Asuh Positif Anak Usia Dini',
    'Modul Parenting',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    'Panduan praktis pengasuhan anak usia dini berbasis stimulasi holistik integratif untuk keluarga Indonesia.',
    'https://example.com/modul-pola-asuh.pdf'
  ),
  (
    'Buku Saku Kader Posyandu & SPM 6 Bidang',
    'Panduan Kader',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    'Pegangan ringkas kader Posyandu dalam pendataan lapangan, validasi ATS, serta pelaporan 6 Bidang SPM.',
    'https://example.com/buku-saku-kader.pdf'
  ),
  (
    'Kisah Si Kancil yang Bijak & Sahabat Hutan',
    'Buku Cerita Anak',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80',
    'Cerita bergambar edukatif untuk melatih nilai moral, empati, dan kecerdasan emosional anak usia prasekolah.',
    'https://example.com/cerita-anak.pdf'
  );
*/
