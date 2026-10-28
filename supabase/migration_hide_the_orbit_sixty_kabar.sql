-- ==============================================================================
-- MIGRATION: PRIVASI KABAR KOMUNITAS THE ORBIT SIXTY
-- ==============================================================================
-- Memastikan seluruh postingan kabar yang terkait dengan Komunitas The Orbit Sixty
-- memiliki visibilitas 'komunitas' (tertutup dari publik / khusus anggota komunitas).
-- ==============================================================================

DO $$
DECLARE
  v_orbit_sixty_id UUID := '6b73e2b8-e708-4d31-a467-333b068b4fd8'::uuid;
BEGIN
  -- 1. Update semua kabar yang merujuk langsung ke ID komunitas The Orbit Sixty
  UPDATE public.kabar_jarimas
  SET visibilitas = 'komunitas',
      updated_at = now()
  WHERE komunitas_id = v_orbit_sixty_id
    AND visibilitas <> 'komunitas';

  -- 2. Update semua kabar yang komunitasnya bernama 'The Orbit Sixty' atau mengandung 'orbit sixty'
  UPDATE public.kabar_jarimas
  SET visibilitas = 'komunitas',
      updated_at = now()
  WHERE komunitas_id IN (
    SELECT id FROM public.komunitas 
    WHERE LOWER(nama) LIKE '%the orbit sixty%' OR LOWER(nama) LIKE '%orbit sixty%'
  )
  AND visibilitas <> 'komunitas';

  -- 3. Update postingan yang kontennya spesifik mengenai The Orbit Sixty
  UPDATE public.kabar_jarimas
  SET visibilitas = 'komunitas',
      updated_at = now()
  WHERE (
    LOWER(konten) LIKE '%the orbit sixty%'
    OR LOWER(konten) LIKE '%orbit sixty%'
  )
  AND visibilitas <> 'komunitas';

  RAISE NOTICE 'Sukses memperbarui visibilitas kabar The Orbit Sixty menjadi komunitas.';
END $$;

-- 4. Tambahkan komentar dokumentasi kebijakan privasi
COMMENT ON COLUMN public.kabar_jarimas.visibilitas IS 'Nilai visibilitas: publik, teman, atau komunitas. Khusus The Orbit Sixty selalu dikunci ke komunitas.';
