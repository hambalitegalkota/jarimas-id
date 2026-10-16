-- ==============================================================================
-- JARIMAS DATABASE MIGRATION SCRIPT:
-- FITUR PERCAKAPAN GRUP KEGIATAN (ADMIN PUSAT & SUPER ADMIN)
-- ==============================================================================
-- Fitur ini memungkinkan Admin Pusat dan Super Admin membuat grup percakapan
-- kegiatan tanpa batas dan mengundang pengguna secara langsung (auto-approved).
-- ==============================================================================

-- 1. Tambahkan kolom created_by pada tabel public.komunitas jika belum ada
ALTER TABLE public.komunitas 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_komunitas_created_by ON public.komunitas(created_by);
CREATE INDEX IF NOT EXISTS idx_komunitas_jenis_kegiatan ON public.komunitas(jenis) WHERE jenis = 'kegiatan';

-- 2. Pastikan kolom is_admin_pusat ada pada tabel public.profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin_pusat BOOLEAN NOT NULL DEFAULT FALSE;

-- 3. HILANGKAN SEMUA HAMBATAN NOT NULL PADA TABEL KOMUNITAS
-- Kolom wilayah (kecamatan, kelurahan, rt, rw, lokasi) tidak boleh memblokir pembentukan grup kegiatan
ALTER TABLE public.komunitas ALTER COLUMN kecamatan DROP NOT NULL;
ALTER TABLE public.komunitas ALTER COLUMN kelurahan DROP NOT NULL;
ALTER TABLE public.komunitas ALTER COLUMN rt DROP NOT NULL;
ALTER TABLE public.komunitas ALTER COLUMN rw DROP NOT NULL;
ALTER TABLE public.komunitas ALTER COLUMN lokasi DROP NOT NULL;

-- Tetapkan nilai default yang ramah bagi grup kegiatan tingkat kota
ALTER TABLE public.komunitas ALTER COLUMN kecamatan SET DEFAULT 'Kota Tegal';
ALTER TABLE public.komunitas ALTER COLUMN kelurahan SET DEFAULT 'Semua Kelurahan';
ALTER TABLE public.komunitas ALTER COLUMN lokasi SET DEFAULT 'Kota Tegal';

-- 4. Perbarui Policy RLS pada public.komunitas agar Semua Pengguna Terdaftar dapat membuat grup kegiatan
--    serta Pembuat Grup (created_by) dan Admin dapat mengelola & menghapus grup
DROP POLICY IF EXISTS "Admin dapat mengelola komunitas" ON public.komunitas;
DROP POLICY IF EXISTS "Pengguna dapat membuat komunitas kegiatan" ON public.komunitas;
CREATE POLICY "Pengguna dapat membuat komunitas kegiatan" ON public.komunitas 
FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Pembuat atau Admin dapat mengelola komunitas" ON public.komunitas;
CREATE POLICY "Pembuat atau Admin dapat mengelola komunitas" ON public.komunitas 
FOR UPDATE USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_super_admin = true OR is_admin_pusat = true)
  )
);

DROP POLICY IF EXISTS "Pembuat atau Admin dapat menghapus komunitas" ON public.komunitas;
CREATE POLICY "Pembuat atau Admin dapat menghapus komunitas" ON public.komunitas 
FOR DELETE USING (
  auth.uid() = created_by OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_super_admin = true OR is_admin_pusat = true)
  )
);

-- 5. Perbarui Policy RLS pada public.anggota_komunitas agar Pembuat Grup & Admin
--    dapat langsung menambahkan pengguna terpilih ke dalam anggota komunitas / grup
DROP POLICY IF EXISTS "Pengguna dapat mendaftar ke komunitas" ON public.anggota_komunitas;
DROP POLICY IF EXISTS "Pengguna dapat mendaftar atau didaftarkan admin ke komunitas" ON public.anggota_komunitas;

CREATE POLICY "Pengguna dapat mendaftar atau didaftarkan admin ke komunitas" 
ON public.anggota_komunitas FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND (is_super_admin = true OR is_admin_pusat = true)
  ) OR
  EXISTS (
    SELECT 1 FROM public.komunitas
    WHERE id = komunitas_id AND created_by = auth.uid()
  ) OR
  public.check_user_can_manage_community(auth.uid(), komunitas_id)
);

-- 6. Perbarui Policy RLS UPDATE & DELETE pada public.anggota_komunitas
DROP POLICY IF EXISTS "Pengguna dapat menghapus keanggotaan sendiri" ON public.anggota_komunitas;
DROP POLICY IF EXISTS "Pengguna atau Admin dapat menghapus keanggotaan" ON public.anggota_komunitas;

CREATE POLICY "Pengguna atau Admin dapat menghapus keanggotaan" 
ON public.anggota_komunitas FOR DELETE 
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (is_super_admin = true OR is_admin_pusat = true)
  ) OR
  EXISTS (
    SELECT 1 FROM public.komunitas
    WHERE id = komunitas_id AND created_by = auth.uid()
  ) OR
  public.check_user_can_manage_community(auth.uid(), komunitas_id)
);

-- 7. Helper Function dengan SECURITY DEFINER: tambah_anggota_grup_kegiatan
--    Menjamin operasi undang anggota berjalan tanpa terhalang pembatasan RLS
CREATE OR REPLACE FUNCTION public.tambah_anggota_grup_kegiatan(
  p_komunitas_id UUID,
  p_user_ids UUID[],
  p_approved_by UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_can_manage BOOLEAN := FALSE;
  v_inserted_count INTEGER := 0;
  v_uid UUID;
BEGIN
  -- Verifikasi pemanggil adalah Super Admin, Admin Pusat, atau Pembuat Grup
  SELECT (is_super_admin OR is_admin_pusat) INTO v_caller_can_manage
  FROM public.profiles
  WHERE id = auth.uid();

  IF NOT v_caller_can_manage THEN
    SELECT (created_by = auth.uid()) INTO v_caller_can_manage
    FROM public.komunitas
    WHERE id = p_komunitas_id;
  END IF;

  IF NOT v_caller_can_manage THEN
    RAISE EXCEPTION 'Akses ditolak: Hanya Admin atau pembuat grup yang dapat menambahkan anggota ke grup kegiatan';
  END IF;

  FOREACH v_uid IN ARRAY p_user_ids LOOP
    INSERT INTO public.anggota_komunitas (user_id, komunitas_id, peran, status, approved_by)
    VALUES (v_uid, p_komunitas_id, 'anggota', 'approved', p_approved_by)
    ON CONFLICT (user_id, komunitas_id) 
    DO UPDATE SET status = 'approved', updated_at = now();
    
    v_inserted_count := v_inserted_count + 1;
  END LOOP;

  RETURN v_inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.tambah_anggota_grup_kegiatan(UUID, UUID[], UUID) TO authenticated, service_role;

-- 8. Pastikan Supabase Realtime mereplikasi perubahan pesan dan keanggotaan grup
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.anggota_komunitas;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.komunitas;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pesan_pribadi;
  EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pesan_grup;
  EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- 9. Refresh Schema Cache
NOTIFY pgrst, 'reload schema';
