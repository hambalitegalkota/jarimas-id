-- ==============================================================================
-- JARIMAS COMPLETE SELF-HEALING DATABASE MIGRATION SCRIPT (Supabase / Postgres)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABEL PROFILES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama_lengkap TEXT NOT NULL DEFAULT '',
  email TEXT,
  nomor_hp TEXT,
  avatar_url TEXT,
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pastikan seluruh kolom profiles tersedia
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nama_lengkap TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nomor_hp TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

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
-- 3. TABEL KOMUNITAS
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

-- Pastikan seluruh kolom komunitas tersedia
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS nama TEXT;
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS jenis TEXT;
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS nama_komunitas TEXT;
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS jenis_komunitas TEXT;
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS kecamatan TEXT;
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS kelurahan TEXT;
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS rt TEXT;
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS rw TEXT;
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS lokasi TEXT;
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS deskripsi TEXT;
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS kontak TEXT;
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS jadwal TEXT;
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.komunitas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
  -- Jika jenis_komunitas bertipe ENUM (komunitas_type_enum), ubah ke TEXT
  BEGIN
    ALTER TABLE public.komunitas ALTER COLUMN jenis_komunitas TYPE TEXT USING jenis_komunitas::text;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    ALTER TABLE public.komunitas ALTER COLUMN nama_komunitas DROP NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    ALTER TABLE public.komunitas ALTER COLUMN nama DROP NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;

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
-- 4. TABEL ANGGOTA KOMUNITAS
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

ALTER TABLE public.anggota_komunitas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.anggota_komunitas ADD COLUMN IF NOT EXISTS komunitas_id UUID REFERENCES public.komunitas(id) ON DELETE CASCADE;
ALTER TABLE public.anggota_komunitas ADD COLUMN IF NOT EXISTS peran TEXT NOT NULL DEFAULT 'anggota';
ALTER TABLE public.anggota_komunitas ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.anggota_komunitas ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.anggota_komunitas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.anggota_komunitas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

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
  konten TEXT NOT NULL DEFAULT '',
  visibilitas TEXT NOT NULL DEFAULT 'publik',
  komunitas_id UUID REFERENCES public.komunitas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.kabar_jarimas ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.kabar_jarimas ADD COLUMN IF NOT EXISTS konten TEXT NOT NULL DEFAULT '';
ALTER TABLE public.kabar_jarimas ADD COLUMN IF NOT EXISTS visibilitas TEXT NOT NULL DEFAULT 'publik';
ALTER TABLE public.kabar_jarimas ADD COLUMN IF NOT EXISTS komunitas_id UUID REFERENCES public.komunitas(id) ON DELETE SET NULL;
ALTER TABLE public.kabar_jarimas ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.kabar_jarimas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

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

ALTER TABLE public.reaksi_kabar ADD COLUMN IF NOT EXISTS kabar_id UUID REFERENCES public.kabar_jarimas(id) ON DELETE CASCADE;
ALTER TABLE public.reaksi_kabar ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.reaksi_kabar ADD COLUMN IF NOT EXISTS tipe_reaksi TEXT NOT NULL DEFAULT '❤️';
ALTER TABLE public.reaksi_kabar ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_reaksi_kabar ON public.reaksi_kabar(kabar_id);

CREATE TABLE IF NOT EXISTS public.komentar_kabar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kabar_id UUID NOT NULL REFERENCES public.kabar_jarimas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  konten TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.komentar_kabar ADD COLUMN IF NOT EXISTS kabar_id UUID REFERENCES public.kabar_jarimas(id) ON DELETE CASCADE;
ALTER TABLE public.komentar_kabar ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.komentar_kabar ADD COLUMN IF NOT EXISTS konten TEXT NOT NULL DEFAULT '';
ALTER TABLE public.komentar_kabar ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_komentar_kabar ON public.komentar_kabar(kabar_id);

-- ==============================================================================
-- 6. TABEL DATA ANAK & DDKS RECORDS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.data_anak (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama_lengkap TEXT NOT NULL DEFAULT '',
  tanggal_lahir DATE NOT NULL DEFAULT CURRENT_DATE,
  jenis_kelamin TEXT NOT NULL DEFAULT 'L',
  nama_orangtua TEXT NOT NULL DEFAULT '',
  nomor_hp TEXT NOT NULL DEFAULT '',
  tinggal_bersama TEXT NOT NULL DEFAULT 'Orang Tua',
  jarak_rumah_km NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_sekolah BOOLEAN NOT NULL DEFAULT FALSE,
  nama_sekolah TEXT,
  alasan_sekolah TEXT,
  komunitas_id UUID REFERENCES public.komunitas(id) ON DELETE CASCADE,
  status_approval TEXT NOT NULL DEFAULT 'pending',
  validated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS nama_lengkap TEXT NOT NULL DEFAULT '';
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS tanggal_lahir DATE NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS jenis_kelamin TEXT NOT NULL DEFAULT 'L';
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS nama_orangtua TEXT NOT NULL DEFAULT '';
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS nomor_hp TEXT NOT NULL DEFAULT '';
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS tinggal_bersama TEXT NOT NULL DEFAULT 'Orang Tua';
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS jarak_rumah_km NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS is_sekolah BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS nama_sekolah TEXT;
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS alasan_sekolah TEXT;
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS komunitas_id UUID REFERENCES public.komunitas(id) ON DELETE CASCADE;
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS status_approval TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS validated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS validated_at TIMESTAMPTZ;
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.data_anak ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
  -- Safe type casts
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
  data_anak_id UUID REFERENCES public.data_anak(id) ON DELETE CASCADE,
  berat_badan NUMERIC(5,2) NOT NULL DEFAULT 0,
  tinggi_badan NUMERIC(5,2) NOT NULL DEFAULT 0,
  panjang_badan NUMERIC(5,2),
  lingkar_kepala NUMERIC(5,2) NOT NULL DEFAULT 0,
  catatan TEXT,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pastikan SEMUA kolom ddks_records tersedia
ALTER TABLE public.ddks_records ADD COLUMN IF NOT EXISTS data_anak_id UUID REFERENCES public.data_anak(id) ON DELETE CASCADE;
ALTER TABLE public.ddks_records ADD COLUMN IF NOT EXISTS berat_badan NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.ddks_records ADD COLUMN IF NOT EXISTS tinggi_badan NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.ddks_records ADD COLUMN IF NOT EXISTS panjang_badan NUMERIC(5,2);
ALTER TABLE public.ddks_records ADD COLUMN IF NOT EXISTS lingkar_kepala NUMERIC(5,2) NOT NULL DEFAULT 0;
ALTER TABLE public.ddks_records ADD COLUMN IF NOT EXISTS catatan TEXT;
ALTER TABLE public.ddks_records ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.ddks_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
  -- Migrasi data user_id / created_by jika ada dari skema lama
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ddks_records' AND column_name = 'user_id') THEN
    UPDATE public.ddks_records SET recorded_by = user_id WHERE recorded_by IS NULL;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ddks_records' AND column_name = 'created_by') THEN
    UPDATE public.ddks_records SET recorded_by = created_by WHERE recorded_by IS NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ddks_anak ON public.ddks_records(data_anak_id);

-- ==============================================================================
-- 7. TABEL MARKET PRODUK & PESANAN (DENGAN DUAL COLUMN NAMA & NAMA_PRODUK)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.market_produk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT,
  nama_produk TEXT,
  deskripsi TEXT NOT NULL DEFAULT '',
  kategori TEXT NOT NULL DEFAULT 'Umum',
  harga INTEGER NOT NULL DEFAULT 0 CHECK (harga >= 0),
  stok INTEGER NOT NULL DEFAULT 0 CHECK (stok >= 0),
  gambar_url TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  berat_gram INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pastikan SEMUA kolom market_produk tersedia
ALTER TABLE public.market_produk ADD COLUMN IF NOT EXISTS nama TEXT;
ALTER TABLE public.market_produk ADD COLUMN IF NOT EXISTS nama_produk TEXT;
ALTER TABLE public.market_produk ADD COLUMN IF NOT EXISTS deskripsi TEXT NOT NULL DEFAULT '';
ALTER TABLE public.market_produk ADD COLUMN IF NOT EXISTS kategori TEXT NOT NULL DEFAULT 'Umum';
ALTER TABLE public.market_produk ADD COLUMN IF NOT EXISTS harga INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.market_produk ADD COLUMN IF NOT EXISTS stok INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.market_produk ADD COLUMN IF NOT EXISTS gambar_url TEXT NOT NULL DEFAULT '';
ALTER TABLE public.market_produk ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.market_produk ADD COLUMN IF NOT EXISTS berat_gram INTEGER DEFAULT 0;
ALTER TABLE public.market_produk ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.market_produk ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
  -- Lepas NOT NULL constraint pada nama_produk dan nama jika ada di database lama
  BEGIN
    ALTER TABLE public.market_produk ALTER COLUMN nama_produk DROP NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    ALTER TABLE public.market_produk ALTER COLUMN nama DROP NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    ALTER TABLE public.market_produk ALTER COLUMN deskripsi DROP NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    ALTER TABLE public.market_produk ALTER COLUMN kategori DROP NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- Sinkronkan data nama dan nama_produk
  BEGIN
    UPDATE public.market_produk SET nama = nama_produk WHERE (nama IS NULL OR nama = '') AND nama_produk IS NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    UPDATE public.market_produk SET nama_produk = nama WHERE (nama_produk IS NULL OR nama_produk = '') AND nama IS NOT NULL;
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

CREATE INDEX IF NOT EXISTS idx_market_produk_kategori ON public.market_produk(kategori);
CREATE INDEX IF NOT EXISTS idx_market_produk_active ON public.market_produk(is_active);

CREATE TABLE IF NOT EXISTS public.market_pesanan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  produk_id UUID NOT NULL REFERENCES public.market_produk(id) ON DELETE RESTRICT,
  jumlah INTEGER NOT NULL DEFAULT 1 CHECK (jumlah > 0),
  total_harga INTEGER NOT NULL CHECK (total_harga >= 0),
  status_pembayaran TEXT NOT NULL DEFAULT 'pending',
  metode_pembayaran TEXT NOT NULL DEFAULT 'qris',
  nama_penerima TEXT NOT NULL DEFAULT '',
  nomor_hp TEXT NOT NULL DEFAULT '',
  alamat_lengkap TEXT NOT NULL DEFAULT '',
  kecamatan TEXT NOT NULL DEFAULT '',
  kelurahan TEXT NOT NULL DEFAULT '',
  catatan TEXT,
  nomor_resi TEXT,
  bukti_bayar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pastikan SEMUA kolom market_pesanan tersedia
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS produk_id UUID REFERENCES public.market_produk(id) ON DELETE RESTRICT;
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS jumlah INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS total_harga INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS status_pembayaran TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS metode_pembayaran TEXT NOT NULL DEFAULT 'qris';
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS nama_penerima TEXT NOT NULL DEFAULT '';
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS nomor_hp TEXT NOT NULL DEFAULT '';
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS alamat_lengkap TEXT NOT NULL DEFAULT '';
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS kecamatan TEXT NOT NULL DEFAULT '';
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS kelurahan TEXT NOT NULL DEFAULT '';
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS catatan TEXT;
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS nomor_resi TEXT;
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS bukti_bayar_url TEXT;
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.market_pesanan ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

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

DROP POLICY IF EXISTS "Perekam atau Admin dapat menghapus DDKS" ON public.ddks_records;
CREATE POLICY "Perekam atau Admin dapat menghapus DDKS" ON public.ddks_records FOR DELETE USING (
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
-- 9. SEED PRODUK KATALOG AWAL (IDEMPOTENT INSERT DENGAN DUAL COLUMN SUPPORT)
-- ==============================================================================
INSERT INTO public.market_produk (nama, nama_produk, deskripsi, kategori, harga, stok, gambar_url, is_active, berat_gram)
SELECT 
  'Paket Alat Permainan Edukatif (APE Kit) PAUD & Balita',
  'Paket Alat Permainan Edukatif (APE Kit) PAUD & Balita',
  'Paket mainan edukatif kayu bersertifikasi SNI untuk melatih motorik halus, pengenalan warna, bentuk geometri, dan stimulasi kognitif anak usia 1-6 tahun. Cocok untuk Posyandu dan Satuan PAUD.',
  'Edukasi PAUD',
  145000,
  25,
  'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=80',
  true,
  1200
WHERE NOT EXISTS (
  SELECT 1 FROM public.market_produk 
  WHERE nama = 'Paket Alat Permainan Edukatif (APE Kit) PAUD & Balita'
     OR nama_produk = 'Paket Alat Permainan Edukatif (APE Kit) PAUD & Balita'
);

INSERT INTO public.market_produk (nama, nama_produk, deskripsi, kategori, harga, stok, gambar_url, is_active, berat_gram)
SELECT 
  'Pita LiLA & Meteran Lingkar Kepala Standar Kemenkes',
  'Pita LiLA & Meteran Lingkar Kepala Standar Kemenkes',
  'Pita ukur Lingkar Lengan Atas (LiLA) dan meteran lingkar kepala anak dengan indikator warna deteksi dini risiko KEK (Kekurangan Energi Kronis) dan stunting.',
  'Alat Posyandu',
  35000,
  50,
  'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
  true,
  150
WHERE NOT EXISTS (
  SELECT 1 FROM public.market_produk 
  WHERE nama = 'Pita LiLA & Meteran Lingkar Kepala Standar Kemenkes'
     OR nama_produk = 'Pita LiLA & Meteran Lingkar Kepala Standar Kemenkes'
);

INSERT INTO public.market_produk (nama, nama_produk, deskripsi, kategori, harga, stok, gambar_url, is_active, berat_gram)
SELECT 
  'Buku KIA (Kesehatan Ibu & Anak) Edisi Resmi Revisi Kota Tegal',
  'Buku KIA (Kesehatan Ibu & Anak) Edisi Resmi Revisi Kota Tegal',
  'Buku pedoman catatan kesehatan ibu hamil, nifas, bayi, dan balita lengkap dengan kurva KMS (Kartu Menuju Sehat) WHO terbaru dan grafik evaluasi imunisasi.',
  'Buku & Modul',
  28000,
  80,
  'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
  true,
  300
WHERE NOT EXISTS (
  SELECT 1 FROM public.market_produk 
  WHERE nama = 'Buku KIA (Kesehatan Ibu & Anak) Edisi Resmi Revisi Kota Tegal'
     OR nama_produk = 'Buku KIA (Kesehatan Ibu & Anak) Edisi Resmi Revisi Kota Tegal'
);

INSERT INTO public.market_produk (nama, nama_produk, deskripsi, kategori, harga, stok, gambar_url, is_active, berat_gram)
SELECT 
  'Timbangan Digital Bayi & Balita Presisi Tinggi (Kapasitas 25kg)',
  'Timbangan Digital Bayi & Balita Presisi Tinggi (Kapasitas 25kg)',
  'Timbangan digital multifungsi dengan nampan ergonomis aman untuk bayi baru lahir hingga balita mandiri. Tingkat akurasi 5 gram, layar LCD backlight terang.',
  'Alat Posyandu',
  385000,
  12,
  'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80',
  true,
  2500
WHERE NOT EXISTS (
  SELECT 1 FROM public.market_produk 
  WHERE nama = 'Timbangan Digital Bayi & Balita Presisi Tinggi (Kapasitas 25kg)'
     OR nama_produk = 'Timbangan Digital Bayi & Balita Presisi Tinggi (Kapasitas 25kg)'
);

INSERT INTO public.market_produk (nama, nama_produk, deskripsi, kategori, harga, stok, gambar_url, is_active, berat_gram)
SELECT 
  'Kaos Polo Seragam Kader Jarimas (Bahan Katun Pique Premium)',
  'Kaos Polo Seragam Kader Jarimas (Bahan Katun Pique Premium)',
  'Seragam resmi Kader Posyandu dan Pengurus RT Jarimas-ID dengan bordir logo Jarimas presisi. Bahan adem, menyerap keringat, dan tahan luntur.',
  'Merchandise & Seragam',
  85000,
  40,
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
  true,
  250
WHERE NOT EXISTS (
  SELECT 1 FROM public.market_produk 
  WHERE nama = 'Kaos Polo Seragam Kader Jarimas (Bahan Katun Pique Premium)'
     OR nama_produk = 'Kaos Polo Seragam Kader Jarimas (Bahan Katun Pique Premium)'
);

INSERT INTO public.market_produk (nama, nama_produk, deskripsi, kategori, harga, stok, gambar_url, is_active, berat_gram)
SELECT 
  'Paket Suplemen MPASI & Taburia Multivitamin Balita Sehat',
  'Paket Suplemen MPASI & Taburia Multivitamin Balita Sehat',
  'Paket mikronutrien tabur bubuk untuk memperkaya kandungan gizi makanan pendamping ASI balita usia 6-24 bulan, diperkaya zat besi, zink, dan 14 vitamin esensial.',
  'Kesehatan & Gizi',
  45000,
  60,
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
  true,
  200
WHERE NOT EXISTS (
  SELECT 1 FROM public.market_produk 
  WHERE nama = 'Paket Suplemen MPASI & Taburia Multivitamin Balita Sehat'
     OR nama_produk = 'Paket Suplemen MPASI & Taburia Multivitamin Balita Sehat'
);
