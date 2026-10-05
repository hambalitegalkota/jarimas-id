-- ==============================================================================
-- JARIMAS COMPLETE DATABASE MIGRATION SCRIPT:
-- FITUR PERTEMANAN, PERCAKAPAN PRIBADI (CHAT), & OBROLAN GRUP KOMUNITAS
-- ==============================================================================
-- CARA MENGGUNAKAN:
-- 1. Buka dashboard Supabase (https://supabase.com/dashboard)
-- 2. Pilih Project Anda -> Masuk ke menu "SQL Editor"
-- 3. Tempelkan (paste) seluruh skrip di bawah ini, lalu klik tombol "Run"
-- ==============================================================================

-- 1. TABEL PERTEMANAN (FRIENDSHIPS)
CREATE TABLE IF NOT EXISTS public.pertemanan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected' | 'blocked'
  requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_friend_pair UNIQUE (user_id, friend_id),
  CONSTRAINT check_different_users CHECK (user_id <> friend_id)
);

ALTER TABLE public.pertemanan ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.pertemanan ADD COLUMN IF NOT EXISTS friend_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.pertemanan ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.pertemanan ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.pertemanan ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.pertemanan ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_pertemanan_user ON public.pertemanan(user_id);
CREATE INDEX IF NOT EXISTS idx_pertemanan_friend ON public.pertemanan(friend_id);
CREATE INDEX IF NOT EXISTS idx_pertemanan_status ON public.pertemanan(status);

-- 2. TABEL PESAN PRIBADI (DIRECT 1-ON-1 MESSAGING)
CREATE TABLE IF NOT EXISTS public.pesan_pribadi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pesan TEXT NOT NULL DEFAULT '',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT check_different_chat_users CHECK (sender_id <> receiver_id)
);

ALTER TABLE public.pesan_pribadi ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.pesan_pribadi ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.pesan_pribadi ADD COLUMN IF NOT EXISTS pesan TEXT NOT NULL DEFAULT '';
ALTER TABLE public.pesan_pribadi ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.pesan_pribadi ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.pesan_pribadi ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_pesan_sender ON public.pesan_pribadi(sender_id);
CREATE INDEX IF NOT EXISTS idx_pesan_receiver ON public.pesan_pribadi(receiver_id);
CREATE INDEX IF NOT EXISTS idx_pesan_created_at ON public.pesan_pribadi(created_at ASC);

-- 3. TABEL PESAN GRUP KOMUNITAS (COMMUNITY GROUP CHAT)
CREATE TABLE IF NOT EXISTS public.pesan_grup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  komunitas_id UUID NOT NULL REFERENCES public.komunitas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pesan TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pesan_grup ADD COLUMN IF NOT EXISTS komunitas_id UUID REFERENCES public.komunitas(id) ON DELETE CASCADE;
ALTER TABLE public.pesan_grup ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.pesan_grup ADD COLUMN IF NOT EXISTS pesan TEXT NOT NULL DEFAULT '';
ALTER TABLE public.pesan_grup ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.pesan_grup ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_pesan_grup_komunitas ON public.pesan_grup(komunitas_id);
CREATE INDEX IF NOT EXISTS idx_pesan_grup_user ON public.pesan_grup(user_id);
CREATE INDEX IF NOT EXISTS idx_pesan_grup_created_at ON public.pesan_grup(created_at ASC);

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.pertemanan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesan_pribadi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pesan_grup ENABLE ROW LEVEL SECURITY;

-- 4.1 Pertemanan Policies
DROP POLICY IF EXISTS "Pengguna dapat melihat status pertemanan sendiri" ON public.pertemanan;
CREATE POLICY "Pengguna dapat melihat status pertemanan sendiri" ON public.pertemanan FOR SELECT USING (
  auth.uid() = user_id OR auth.uid() = friend_id
);

DROP POLICY IF EXISTS "Pengguna dapat membuat permintaan pertemanan" ON public.pertemanan;
CREATE POLICY "Pengguna dapat membuat permintaan pertemanan" ON public.pertemanan FOR INSERT WITH CHECK (
  auth.uid() = user_id OR auth.uid() = requested_by
);

DROP POLICY IF EXISTS "Pengguna terkait dapat mengubah status pertemanan" ON public.pertemanan;
CREATE POLICY "Pengguna terkait dapat mengubah status pertemanan" ON public.pertemanan FOR UPDATE USING (
  auth.uid() = user_id OR auth.uid() = friend_id
);

DROP POLICY IF EXISTS "Pengguna terkait dapat menghapus pertemanan" ON public.pertemanan;
CREATE POLICY "Pengguna terkait dapat menghapus pertemanan" ON public.pertemanan FOR DELETE USING (
  auth.uid() = user_id OR auth.uid() = friend_id
);

-- 4.2 Pesan Pribadi Policies
DROP POLICY IF EXISTS "Pengguna dapat membaca pesan yang dikirim atau diterima" ON public.pesan_pribadi;
CREATE POLICY "Pengguna dapat membaca pesan yang dikirim atau diterima" ON public.pesan_pribadi FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

DROP POLICY IF EXISTS "Pengguna dapat mengirim pesan" ON public.pesan_pribadi;
CREATE POLICY "Pengguna dapat mengirim pesan" ON public.pesan_pribadi FOR INSERT WITH CHECK (
  auth.uid() = sender_id
);

DROP POLICY IF EXISTS "Penerima dapat mengubah status pesan terbaca" ON public.pesan_pribadi;
CREATE POLICY "Penerima dapat mengubah status pesan terbaca" ON public.pesan_pribadi FOR UPDATE USING (
  auth.uid() = receiver_id
);

DROP POLICY IF EXISTS "Pengirim atau penerima dapat menghapus pesan" ON public.pesan_pribadi;
CREATE POLICY "Pengirim atau penerima dapat menghapus pesan" ON public.pesan_pribadi FOR DELETE USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);

-- 4.3 Pesan Grup Policies
DROP POLICY IF EXISTS "Pengguna dapat membaca pesan grup" ON public.pesan_grup;
CREATE POLICY "Pengguna dapat membaca pesan grup" ON public.pesan_grup FOR SELECT USING (
  auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Pengguna terautentikasi dapat mengirim pesan grup" ON public.pesan_grup;
CREATE POLICY "Pengguna terautentikasi dapat mengirim pesan grup" ON public.pesan_grup FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

DROP POLICY IF EXISTS "Pengirim atau Admin dapat menghapus pesan grup" ON public.pesan_grup;
CREATE POLICY "Pengirim atau Admin dapat menghapus pesan grup" ON public.pesan_grup FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true)
);

-- 5. HAK AKSES ROLE (PERMISSIONS & GRANTS)
GRANT ALL ON TABLE public.pertemanan TO postgres, authenticated, service_role, anon;
GRANT ALL ON TABLE public.pesan_pribadi TO postgres, authenticated, service_role, anon;
GRANT ALL ON TABLE public.pesan_grup TO postgres, authenticated, service_role, anon;

-- 6. AKTIFKAN SUPABASE REALTIME REPLICATION (SANGAT DIANJURKAN)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pesan_pribadi;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pesan_grup;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pertemanan;
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- 7. REFRESH / RELOAD SCHEMA CACHE POSTGREST
NOTIFY pgrst, 'reload schema';

