-- ==============================================================================
-- MIGRASI: DUKUNGAN GOOGLE OAUTH & ONBOARDING NAMA ASLI PENGGUNA
-- ==============================================================================

-- 1. Tambahkan kolom status kelengkapan profil pada tabel profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_profile_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Berikan status 'TRUE' bagi pengguna lama yang sudah memiliki nama lengkap valid (bukan split email / kosong)
UPDATE public.profiles
SET is_profile_completed = TRUE
WHERE nama_lengkap IS NOT NULL 
  AND trim(nama_lengkap) != ''
  AND nama_lengkap != split_part(email, '@', 1);

-- 3. Perbarui fungsi trigger handle_new_user() agar dapat membedakan pendaftaran via Google vs Formulir
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_is_google BOOLEAN;
  v_nama TEXT;
  v_avatar TEXT;
  v_completed BOOLEAN;
BEGIN
  -- Cek apakah provider pendaftaran berasal dari Google
  v_is_google := (new.raw_app_meta_data->>'provider' = 'google') 
                 OR (new.raw_user_meta_data->>'iss' LIKE '%google%');

  -- Ambil avatar dari metadata Google jika tersedia
  v_avatar := COALESCE(
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'picture',
    NULL
  );

  -- Jika registrasi email form standar dengan nama_lengkap yang sudah diinput
  IF (new.raw_user_meta_data->>'nama_lengkap' IS NOT NULL AND NOT v_is_google) THEN
    v_nama := new.raw_user_meta_data->>'nama_lengkap';
    v_completed := TRUE;
  ELSE
    -- Jika dari Google, kosongkan nama_lengkap agar dicegat untuk mengisi nama asli resmi
    v_nama := '';
    v_completed := FALSE;
  END IF;

  INSERT INTO public.profiles (
    id, 
    nama_lengkap, 
    email, 
    avatar_url, 
    is_super_admin, 
    is_profile_completed
  )
  VALUES (
    new.id,
    v_nama,
    new.email,
    v_avatar,
    CASE 
      WHEN lower(COALESCE(new.email, '')) = 'jarimas.id@gmail.com' 
        OR lower(COALESCE(new.email, '')) LIKE 'jarimas.id@%'
        OR lower(COALESCE(new.raw_user_meta_data->>'nama_lengkap', '')) LIKE '%jarimas indonesia%'
      THEN TRUE
      ELSE FALSE
    END,
    v_completed
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    avatar_url = COALESCE(profiles.avatar_url, EXCLUDED.avatar_url),
    is_profile_completed = CASE
      -- Jangan timpa nilai jika profil pengguna di DB sudah berstatus completed
      WHEN profiles.is_profile_completed = TRUE THEN TRUE
      ELSE EXCLUDED.is_profile_completed
    END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Pasang ulang trigger pada tabel auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Pastikan kebijakan RLS pada tabel profiles mengizinkan pengguna memperbarui profilnya sendiri
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pengguna dapat mengedit profil sendiri" ON public.profiles;
CREATE POLICY "Pengguna dapat mengedit profil sendiri" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Pengguna dapat menyisipkan profil sendiri" ON public.profiles;
CREATE POLICY "Pengguna dapat menyisipkan profil sendiri" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);
