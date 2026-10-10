-- ==============================================================================
-- JARIMAS-ID: MIGRATION SET SUPER ADMIN UNTUK AKUN JARIMAS INDONESIA
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Pastikan kolom is_super_admin dan is_admin_pusat ada pada tabel profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin_pusat BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Update akun jarimas.id@gmail.com dan nama Jarimas Indonesia menjadi is_super_admin = TRUE
UPDATE public.profiles
SET is_super_admin = TRUE, updated_at = now()
WHERE lower(COALESCE(email, '')) = 'jarimas.id@gmail.com'
   OR lower(COALESCE(email, '')) LIKE 'jarimas.id@%'
   OR lower(COALESCE(nama_lengkap, '')) LIKE '%jarimas indonesia%'
   OR id = '00000000-0000-0000-0000-000000000001';

-- 3. Perbarui trigger handle_new_user agar akun Jarimas Indonesia otomatis mendapatkan is_super_admin = TRUE saat sign up / login
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nama_lengkap, email, is_super_admin)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nama_lengkap', split_part(new.email, '@', 1)),
    new.email,
    CASE 
      WHEN lower(COALESCE(new.email, '')) = 'jarimas.id@gmail.com' 
        OR lower(COALESCE(new.email, '')) LIKE 'jarimas.id@%'
        OR lower(COALESCE(new.raw_user_meta_data->>'nama_lengkap', '')) LIKE '%jarimas indonesia%'
      THEN TRUE
      ELSE FALSE
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nama_lengkap = COALESCE(EXCLUDED.nama_lengkap, profiles.nama_lengkap),
    is_super_admin = CASE 
      WHEN lower(COALESCE(EXCLUDED.email, '')) = 'jarimas.id@gmail.com' 
        OR lower(COALESCE(EXCLUDED.email, '')) LIKE 'jarimas.id@%'
        OR lower(COALESCE(EXCLUDED.nama_lengkap, profiles.nama_lengkap, '')) LIKE '%jarimas indonesia%'
      THEN TRUE
      ELSE profiles.is_super_admin
    END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Verifikasi status profil Super Admin
SELECT id, nama_lengkap, email, is_super_admin, is_admin_pusat, created_at
FROM public.profiles
WHERE is_super_admin = TRUE OR lower(COALESCE(email, '')) = 'jarimas.id@gmail.com';
