-- ==============================================================================
-- JARIMAS COMPLETE SELF-HEALING DATABASE MIGRATION SCRIPT (Supabase / Postgres)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABEL PROFILES (DENGAN ADAPTIVE COLUMN MIGRATION)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap TEXT NOT NULL,
  email TEXT,
  nomor_hp TEXT,
  avatar_url TEXT,
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_super_admin') THEN
    ALTER TABLE public.profiles ADD COLUMN is_super_admin BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'nomor_hp') THEN
    ALTER TABLE public.profiles ADD COLUMN nomor_hp TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- Trigger otomatis sinkronisasi dari auth.users ke profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_lengkap, email, is_super_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nama_lengkap', split_part(new.email, '@', 1)),
    new.email,
    FALSE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nama_lengkap = COALESCE(EXCLUDED.nama_lengkap, profiles.nama_lengkap);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. TABEL KOMUNITAS (DENGAN ADAPTIVE COLUMN & ENUM-TO-TEXT CONVERSION)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.komunitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT,
  jenis TEXT,
  nama_komunitas TEXT,
  jenis_komunitas TEXT,
  kecamatan TEXT,
  kelurahan TEXT,
  rt TEXT,
  rw TEXT,
  lokasi TEXT,
  deskripsi TEXT,
  logo_url TEXT,
  kontak TEXT,
  jadwal TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  -- Tambah kolom jika belum ada
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'komunitas' AND column_name = 'nama') THEN
    ALTER TABLE public.komunitas ADD COLUMN nama TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'komunitas' AND column_name = 'jenis') THEN
    ALTER TABLE public.komunitas ADD COLUMN jenis TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'nama_komunitas' AND column_name = 'nama_komunitas') THEN
    ALTER TABLE public.komunitas ADD COLUMN nama_komunitas TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'komunitas' AND column_name = 'jenis_komunitas') THEN
    ALTER TABLE public.komunitas ADD COLUMN jenis_komunitas TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'komunitas' AND column_name = 'kecamatan') THEN
    ALTER TABLE public.komunitas ADD COLUMN kecamatan TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'komunitas' AND column_name = 'kelurahan') THEN
    ALTER TABLE public.komunitas ADD COLUMN kelurahan TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'komunitas' AND column_name = 'rt') THEN
    ALTER TABLE public.komunitas ADD COLUMN rt TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'komunitas' AND column_name = 'rw') THEN
    ALTER TABLE public.komunitas ADD COLUMN rw TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'komunitas' AND column_name = 'lokasi') THEN
    ALTER TABLE public.komunitas ADD COLUMN lokasi TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'komunitas' AND column_name = 'deskripsi') THEN
    ALTER TABLE public.komunitas ADD COLUMN deskripsi TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'komunitas' AND column_name = 'logo_url') THEN
    ALTER TABLE public.komunitas ADD COLUMN logo_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'komunitas' AND column_name = 'kontak') THEN
    ALTER TABLE public.komunitas ADD COLUMN kontak TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'komunitas' AND column_name = 'jadwal') THEN
    ALTER TABLE public.komunitas ADD COLUMN jadwal TEXT;
  END IF;

  -- Jika jenis_komunitas bertipe ENUM (komunitas_type_enum), ubah ke TEXT agar tidak ada error type mismatch
  BEGIN
    ALTER TABLE public.komunitas ALTER COLUMN jenis_komunitas TYPE TEXT USING jenis_komunitas::text;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  -- Sinkronkan data yang sudah ada dengan safe casting
  BEGIN
    UPDATE public.komunitas SET nama = nama_komunitas WHERE (nama IS NULL OR nama = '') AND nama_komunitas IS NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    UPDATE public.komunitas SET nama_komunitas = nama WHERE (nama_komunitas IS NULL OR nama_komunitas = '') AND nama IS NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    UPDATE public.komunitas SET jenis = jenis_komunitas::text WHERE (jenis IS NULL OR jenis = '') AND jenis_komunitas IS NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    UPDATE public.komunitas SET jenis_komunitas = jenis WHERE (jenis_komunitas IS NULL OR jenis_komunitas = '') AND jenis IS NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

CREATE INDEX IF NOT EXISTS idx_komunitas_nama ON public.komunitas(nama);
CREATE INDEX IF NOT EXISTS idx_komunitas_jenis ON public.komunitas(jenis);
CREATE INDEX IF NOT EXISTS idx_komunitas_kecamatan ON public.komunitas(kecamatan);
CREATE INDEX IF NOT EXISTS idx_komunitas_kelurahan ON public.komunitas(kelurahan);

-- ==============================================================================
-- 4. TABEL ANGGOTA KOMUNITAS (DENGAN SAFE ENUM HANDLING)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.anggota_komunitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  komunitas_id UUID NOT NULL REFERENCES public.komunitas(id) ON DELETE CASCADE,
  peran TEXT NOT NULL DEFAULT 'anggota',
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, komunitas_id)
);

DO $$
BEGIN
  -- Konversi kolom peran/status bertipe ENUM ke TEXT jika ada di database lama
  BEGIN
    ALTER TABLE public.anggota_komunitas ALTER COLUMN peran TYPE TEXT USING peran::text;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    ALTER TABLE public.anggota_komunitas ALTER COLUMN status TYPE TEXT USING status::text;
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

CREATE INDEX IF NOT EXISTS idx_anggota_user ON public.anggota_komunitas(user_id);
CREATE INDEX IF NOT EXISTS idx_anggota_komunitas ON public.anggota_komunitas(komunitas_id);
CREATE INDEX IF NOT EXISTS idx_anggota_status ON public.anggota_komunitas(status);

-- ==============================================================================
-- 5. TABEL KABAR JARIMAS, REAKSI, & KOMENTAR
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.kabar_jarimas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  konten TEXT NOT NULL,
  visibilitas TEXT NOT NULL DEFAULT 'publik',
  komunitas_id UUID REFERENCES public.komunitas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  BEGIN
    ALTER TABLE public.kabar_jarimas ALTER COLUMN visibilitas TYPE TEXT USING visibilitas::text;
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

CREATE INDEX IF NOT EXISTS idx_kabar_user ON public.kabar_jarimas(user_id);
CREATE INDEX IF NOT EXISTS idx_kabar_created_at ON public.kabar_jarimas(created_at DESC);

CREATE TABLE IF NOT EXISTS public.reaksi_kabar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kabar_id UUID NOT NULL REFERENCES public.kabar_jarimas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipe_reaksi TEXT NOT NULL DEFAULT '❤️',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (kabar_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reaksi_kabar ON public.reaksi_kabar(kabar_id);

CREATE TABLE IF NOT EXISTS public.komentar_kabar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kabar_id UUID NOT NULL REFERENCES public.kabar_jarimas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  konten TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_komentar_kabar ON public.komentar_kabar(kabar_id);

-- ==============================================================================
-- 6. TABEL DATA ANAK & DDKS RECORDS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.data_anak (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_lengkap TEXT NOT NULL,
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin TEXT NOT NULL,
  nama_orangtua TEXT NOT NULL,
  nomor_hp TEXT NOT NULL,
  tinggal_bersama TEXT NOT NULL DEFAULT 'Orang Tua',
  jarak_rumah_km NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_sekolah BOOLEAN NOT NULL DEFAULT FALSE,
  nama_sekolah TEXT,
  alasan_sekolah TEXT,
  komunitas_id UUID NOT NULL REFERENCES public.komunitas(id) ON DELETE CASCADE,
  status_approval TEXT NOT NULL DEFAULT 'pending',
  validated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'data_anak' AND column_name = 'status_approval') THEN
    ALTER TABLE public.data_anak ADD COLUMN status_approval TEXT NOT NULL DEFAULT 'pending';
  END IF;

  BEGIN
    ALTER TABLE public.data_anak ALTER COLUMN status_approval TYPE TEXT USING status_approval::text;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    ALTER TABLE public.data_anak ALTER COLUMN jenis_kelamin TYPE TEXT USING jenis_kelamin::text;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    ALTER TABLE public.data_anak ALTER COLUMN tinggal_bersama TYPE TEXT USING tinggal_bersama::text;
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

CREATE INDEX IF NOT EXISTS idx_data_anak_komunitas ON public.data_anak(komunitas_id);
CREATE INDEX IF NOT EXISTS idx_data_anak_status ON public.data_anak(status_approval);

CREATE TABLE IF NOT EXISTS public.ddks_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_anak_id UUID NOT NULL REFERENCES public.data_anak(id) ON DELETE CASCADE,
  berat_badan NUMERIC(5,2) NOT NULL,
  tinggi_badan NUMERIC(5,2) NOT NULL,
  panjang_badan NUMERIC(5,2),
  lingkar_kepala NUMERIC(5,2) NOT NULL,
  catatan TEXT,
  recorded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ddks_anak ON public.ddks_records(data_anak_id);

-- ==============================================================================
-- 7. TABEL MARKET PRODUK & PESANAN
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.market_produk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  kategori TEXT NOT NULL,
  harga INTEGER NOT NULL CHECK (harga >= 0),
  stok INTEGER NOT NULL DEFAULT 0 CHECK (stok >= 0),
  gambar_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  berat_gram INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_produk_kategori ON public.market_produk(kategori);
CREATE INDEX IF NOT EXISTS idx_market_produk_active ON public.market_produk(is_active);

CREATE TABLE IF NOT EXISTS public.market_pesanan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  produk_id UUID NOT NULL REFERENCES public.market_produk(id) ON DELETE RESTRICT,
  jumlah INTEGER NOT NULL CHECK (jumlah > 0),
  total_harga INTEGER NOT NULL CHECK (total_harga >= 0),
  status_pembayaran TEXT NOT NULL DEFAULT 'pending',
  metode_pembayaran TEXT NOT NULL,
  nama_penerima TEXT NOT NULL,
  nomor_hp TEXT NOT NULL,
  alamat_lengkap TEXT NOT NULL,
  kecamatan TEXT NOT NULL,
  kelurahan TEXT NOT NULL,
  catatan TEXT,
  nomor_resi TEXT,
  bukti_bayar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$
BEGIN
  BEGIN
    ALTER TABLE public.market_pesanan ALTER COLUMN status_pembayaran TYPE TEXT USING status_pembayaran::text;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    ALTER TABLE public.market_pesanan ALTER COLUMN metode_pembayaran TYPE TEXT USING metode_pembayaran::text;
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

CREATE INDEX IF NOT EXISTS idx_market_pesanan_user ON public.market_pesanan(user_id);
CREATE INDEX IF NOT EXISTS idx_market_pesanan_status ON public.market_pesanan(status_pembayaran);

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES DENGAN SAFE TYPE-CASTING
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.komunitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anggota_komunitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kabar_jarimas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reaksi_kabar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.komentar_kabar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_anak ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ddks_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_produk ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_pesanan ENABLE ROW LEVEL SECURITY;

-- 8.1 Profiles Policies
DROP POLICY IF EXISTS "Profiles dapat dibaca oleh publik" ON public.profiles;
CREATE POLICY "Profiles dapat dibaca oleh publik" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Pengguna dapat mengedit profil sendiri" ON public.profiles;
CREATE POLICY "Pengguna dapat mengedit profil sendiri" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Pengguna dapat menyisipkan profil sendiri" ON public.profiles;
CREATE POLICY "Pengguna dapat menyisipkan profil sendiri" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 8.2 Komunitas Policies
DROP POLICY IF EXISTS "Komunitas dapat dibaca publik" ON public.komunitas;
CREATE POLICY "Komunitas dapat dibaca publik" ON public.komunitas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super Admin dapat mengelola komunitas" ON public.komunitas;
CREATE POLICY "Super Admin dapat mengelola komunitas" ON public.komunitas FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- 8.3 Anggota Komunitas Policies (dengan safe ::text cast)
DROP POLICY IF EXISTS "Anggota komunitas dapat dibaca oleh semua pengguna" ON public.anggota_komunitas;
CREATE POLICY "Anggota komunitas dapat dibaca oleh semua pengguna" ON public.anggota_komunitas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Pengguna dapat mendaftar ke komunitas" ON public.anggota_komunitas;
CREATE POLICY "Pengguna dapat mendaftar ke komunitas" ON public.anggota_komunitas FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pengguna/Admin dapat mengelola keanggotaan" ON public.anggota_komunitas;
CREATE POLICY "Pengguna/Admin dapat mengelola keanggotaan" ON public.anggota_komunitas FOR UPDATE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true) OR
  EXISTS (
    SELECT 1 FROM public.anggota_komunitas ak 
    WHERE ak.komunitas_id = anggota_komunitas.komunitas_id 
      AND ak.user_id = auth.uid() 
      AND ak.status::text = 'approved' 
      AND (
        ak.peran::text ILIKE '%pengurus%' OR 
        ak.peran::text ILIKE '%kader%' OR 
        ak.peran::text ILIKE '%admin%'
      )
  )
);

DROP POLICY IF EXISTS "Pengguna dapat menghapus keanggotaan sendiri" ON public.anggota_komunitas;
CREATE POLICY "Pengguna dapat menghapus keanggotaan sendiri" ON public.anggota_komunitas FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- 8.4 Kabar Jarimas Policies
DROP POLICY IF EXISTS "Kabar dapat dibaca publik" ON public.kabar_jarimas;
CREATE POLICY "Kabar dapat dibaca publik" ON public.kabar_jarimas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Pengguna terautentikasi dapat membuat kabar" ON public.kabar_jarimas;
CREATE POLICY "Pengguna terautentikasi dapat membuat kabar" ON public.kabar_jarimas FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pemilik atau Admin dapat menghapus kabar" ON public.kabar_jarimas;
CREATE POLICY "Pemilik atau Admin dapat menghapus kabar" ON public.kabar_jarimas FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- 8.5 Reaksi Kabar Policies
DROP POLICY IF EXISTS "Reaksi dapat dibaca publik" ON public.reaksi_kabar;
CREATE POLICY "Reaksi dapat dibaca publik" ON public.reaksi_kabar FOR SELECT USING (true);

DROP POLICY IF EXISTS "Pengguna terautentikasi dapat memberi reaksi" ON public.reaksi_kabar;
CREATE POLICY "Pengguna terautentikasi dapat memberi reaksi" ON public.reaksi_kabar FOR ALL USING (auth.uid() = user_id);

-- 8.6 Komentar Kabar Policies
DROP POLICY IF EXISTS "Komentar dapat dibaca publik" ON public.komentar_kabar;
CREATE POLICY "Komentar dapat dibaca publik" ON public.komentar_kabar FOR SELECT USING (true);

DROP POLICY IF EXISTS "Pengguna terautentikasi dapat membuat komentar" ON public.komentar_kabar;
CREATE POLICY "Pengguna terautentikasi dapat membuat komentar" ON public.komentar_kabar FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8.7 Data Anak Policies (dengan safe ::text cast)
DROP POLICY IF EXISTS "Data anak dapat dibaca publik/anggota" ON public.data_anak;
CREATE POLICY "Data anak dapat dibaca publik/anggota" ON public.data_anak FOR SELECT USING (true);

DROP POLICY IF EXISTS "Pengguna terautentikasi dapat menambah data anak" ON public.data_anak;
CREATE POLICY "Pengguna terautentikasi dapat menambah data anak" ON public.data_anak FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Validator/Admin dapat memvalidasi data anak" ON public.data_anak;
CREATE POLICY "Validator/Admin dapat memvalidasi data anak" ON public.data_anak FOR UPDATE USING (
  auth.uid() = created_by OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true) OR
  EXISTS (
    SELECT 1 FROM public.anggota_komunitas 
    WHERE user_id = auth.uid() 
      AND status::text = 'approved' 
      AND (
        peran::text ILIKE '%kader%' OR 
        peran::text ILIKE '%pengurus%' OR 
        peran::text ILIKE '%bidan%' OR 
        peran::text ILIKE '%nakes%'
      )
  )
);

DROP POLICY IF EXISTS "Pembuat atau Admin dapat menghapus data anak" ON public.data_anak;
CREATE POLICY "Pembuat atau Admin dapat menghapus data anak" ON public.data_anak FOR DELETE USING (
  auth.uid() = created_by OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- 8.8 DDKS Records Policies
DROP POLICY IF EXISTS "DDKS dapat dibaca publik" ON public.ddks_records;
CREATE POLICY "DDKS dapat dibaca publik" ON public.ddks_records FOR SELECT USING (true);

DROP POLICY IF EXISTS "Kader/Nakes dapat menginput DDKS" ON public.ddks_records;
CREATE POLICY "Kader/Nakes dapat menginput DDKS" ON public.ddks_records FOR INSERT WITH CHECK (
  auth.uid() = recorded_by OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- 8.9 Market Produk Policies
DROP POLICY IF EXISTS "Produk dapat dibaca publik" ON public.market_produk;
CREATE POLICY "Produk dapat dibaca publik" ON public.market_produk FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super Admin dapat mengelola produk market" ON public.market_produk;
CREATE POLICY "Super Admin dapat mengelola produk market" ON public.market_produk FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- 8.10 Market Pesanan Policies
DROP POLICY IF EXISTS "Pengguna dapat melihat pesanan miliknya" ON public.market_pesanan;
CREATE POLICY "Pengguna dapat melihat pesanan miliknya" ON public.market_pesanan FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true)
);

DROP POLICY IF EXISTS "Pengguna dapat membuat pesanan" ON public.market_pesanan;
CREATE POLICY "Pengguna dapat membuat pesanan" ON public.market_pesanan FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Super Admin dapat memperbarui status pesanan" ON public.market_pesanan;
CREATE POLICY "Super Admin dapat memperbarui status pesanan" ON public.market_pesanan FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- ==============================================================================
-- 9. SEED PRODUK KATALOG AWAL (IDEMPOTENT INSERT)
-- ==============================================================================
INSERT INTO public.market_produk (nama, deskripsi, kategori, harga, stok, gambar_url, is_active, berat_gram)
SELECT 
  'Paket Alat Permainan Edukatif (APE Kit) PAUD & Balita',
  'Paket mainan edukatif kayu bersertifikasi SNI untuk melatih motorik halus, pengenalan warna, bentuk geometri, dan stimulasi kognitif anak usia 1-6 tahun. Cocok untuk Posyandu dan Satuan PAUD.',
  'Edukasi PAUD',
  145000,
  25,
  'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80',
  true,
  1200
WHERE NOT EXISTS (SELECT 1 FROM public.market_produk WHERE nama = 'Paket Alat Permainan Edukatif (APE Kit) PAUD & Balita');

INSERT INTO public.market_produk (nama, deskripsi, kategori, harga, stok, gambar_url, is_active, berat_gram)
SELECT 
  'Pita LiLA & Meteran Lingkar Kepala Standar Kemenkes',
  'Pita ukur Lingkar Lengan Atas (LiLA) dan meteran lingkar kepala anak dengan indikator warna deteksi dini risiko KEK (Kekurangan Energi Kronis) dan stunting.',
  'Alat Posyandu',
  35000,
  50,
  'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
  true,
  150
WHERE NOT EXISTS (SELECT 1 FROM public.market_produk WHERE nama = 'Pita LiLA & Meteran Lingkar Kepala Standar Kemenkes');

INSERT INTO public.market_produk (nama, deskripsi, kategori, harga, stok, gambar_url, is_active, berat_gram)
SELECT 
  'Buku KIA (Kesehatan Ibu & Anak) Edisi Resmi Revisi Kota Tegal',
  'Buku pedoman catatan kesehatan ibu hamil, nifas, bayi, dan balita lengkap dengan kurva KMS (Kartu Menuju Sehat) WHO terbaru dan grafik evaluasi imunisasi.',
  'Buku & Modul',
  28000,
  80,
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
  true,
  300
WHERE NOT EXISTS (SELECT 1 FROM public.market_produk WHERE nama = 'Buku KIA (Kesehatan Ibu & Anak) Edisi Resmi Revisi Kota Tegal');

INSERT INTO public.market_produk (nama, deskripsi, kategori, harga, stok, gambar_url, is_active, berat_gram)
SELECT 
  'Timbangan Digital Bayi & Balita Presisi Tinggi (Kapasitas 25kg)',
  'Timbangan digital multifungsi dengan nampan ergonomis aman untuk bayi baru lahir hingga balita mandiri. Tingkat akurasi 5 gram, layar LCD backlight terang.',
  'Alat Posyandu',
  385000,
  12,
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
  true,
  2500
WHERE NOT EXISTS (SELECT 1 FROM public.market_produk WHERE nama = 'Timbangan Digital Bayi & Balita Presisi Tinggi (Kapasitas 25kg)');

INSERT INTO public.market_produk (nama, deskripsi, kategori, harga, stok, gambar_url, is_active, berat_gram)
SELECT 
  'Kaos Polo Seragam Kader Jarimas (Bahan Katun Pique Premium)',
  'Seragam resmi Kader Posyandu dan Pengurus RT Jarimas-ID dengan bordir logo Jarimas presisi. Bahan adem, menyerap keringat, dan tahan luntur.',
  'Merchandise & Seragam',
  85000,
  40,
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
  true,
  250
WHERE NOT EXISTS (SELECT 1 FROM public.market_produk WHERE nama = 'Kaos Polo Seragam Kader Jarimas (Bahan Katun Pique Premium)');

INSERT INTO public.market_produk (nama, deskripsi, kategori, harga, stok, gambar_url, is_active, berat_gram)
SELECT 
  'Paket Suplemen MPASI & Taburia Multivitamin Balita Sehat',
  'Paket mikronutrien tabur bubuk untuk memperkaya kandungan gizi makanan pendamping ASI balita usia 6-24 bulan, diperkaya zat besi, zink, dan 14 vitamin esensial.',
  'Kesehatan & Gizi',
  45000,
  60,
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
  true,
  200
WHERE NOT EXISTS (SELECT 1 FROM public.market_produk WHERE nama = 'Paket Suplemen MPASI & Taburia Multivitamin Balita Sehat');
