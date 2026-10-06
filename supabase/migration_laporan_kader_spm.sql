-- ==============================================================================
-- MIGRATION: TABEL LAPORAN KADER POSYANDU 6 BIDANG STANDAR PELAYANAN MINIMAL (SPM)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.laporan_kader_spm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  komunitas_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  posyandu_nama TEXT NOT NULL,
  kelurahan TEXT NOT NULL,
  kecamatan TEXT NOT NULL,
  kota TEXT NOT NULL DEFAULT 'Kota Tegal',
  bidang TEXT NOT NULL, -- 'Pendidikan' | 'Kesehatan' | 'Pekerjaan Umum' | 'Perumahan Rakyat' | 'Trantibum Linmas' | 'Sosial'
  bulan TEXT NOT NULL, -- 'Januari' .. 'Desember'
  tahun INT NOT NULL DEFAULT 2026,
  tanggal_laporan DATE NOT NULL DEFAULT CURRENT_DATE,
  nama_kader TEXT NOT NULL,
  nomor_hp_kader TEXT,
  jenis_kegiatan TEXT[] NOT NULL DEFAULT '{}',
  narasi_pendataan TEXT,
  narasi_verifikasi_validasi TEXT,
  narasi_penyuluhan_edukasi TEXT,
  narasi_penyaluran_aspirasi TEXT,
  status TEXT NOT NULL DEFAULT 'terkirim', -- 'draft' | 'terkirim' | 'diverifikasi'
  catatan_admin TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indeks untuk pencarian & agregasi cepat
CREATE INDEX IF NOT EXISTS idx_laporan_kader_komunitas_id ON public.laporan_kader_spm(komunitas_id);
CREATE INDEX IF NOT EXISTS idx_laporan_kader_wilayah ON public.laporan_kader_spm(kecamatan, kelurahan);
CREATE INDEX IF NOT EXISTS idx_laporan_kader_bidang ON public.laporan_kader_spm(bidang);
CREATE INDEX IF NOT EXISTS idx_laporan_kader_periode ON public.laporan_kader_spm(tahun, bulan);
CREATE INDEX IF NOT EXISTS idx_laporan_kader_created_at ON public.laporan_kader_spm(created_at DESC);

-- Enable RLS
ALTER TABLE public.laporan_kader_spm ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses (RLS Policies):
-- 1. Read: Pengguna terautentikasi dapat membaca laporan
CREATE POLICY "Laporan kader dapat dibaca pengguna terautentikasi"
  ON public.laporan_kader_spm
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. Insert: Pengguna terautentikasi dapat mengirim laporan
CREATE POLICY "Pengguna terautentikasi dapat membuat laporan kader"
  ON public.laporan_kader_spm
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. Update: Pembuat atau Super Admin dapat mengubah laporan
CREATE POLICY "Pembuat laporan dapat mengubah laporannya"
  ON public.laporan_kader_spm
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
    )
  );

-- 4. Delete: Pembuat atau Super Admin dapat menghapus laporan
CREATE POLICY "Pembuat laporan dapat menghapus laporannya"
  ON public.laporan_kader_spm
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_super_admin = true
    )
  );
