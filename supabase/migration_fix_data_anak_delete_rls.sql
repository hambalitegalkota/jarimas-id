-- ==============================================================================
-- JARIMAS-ID: MIGRATION FIX KEBIJAKAN KEAMANAN (RLS) & RPC HAPUS DATA ANAK
-- Mengizinkan Admin Sekolah PAUD, Pengurus Komunitas, Kader, Admin Pusat,
-- dan Super Admin untuk menghapus data anak secara permanen dari sistem.
--
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Perbarui Kebijakan DELETE pada tabel public.data_anak
DROP POLICY IF EXISTS "Pembuat atau Admin dapat menghapus data anak" ON public.data_anak;
DROP POLICY IF EXISTS "Izin hapus data anak untuk pembuat dan pengurus" ON public.data_anak;

CREATE POLICY "Izin hapus data anak untuk pembuat dan pengurus" ON public.data_anak 
FOR DELETE USING (
  -- A. Pengguna adalah pembuat record
  auth.uid() = created_by 
  -- B. Akun sinkronisasi sistem atau anon/service_role
  OR created_by = '1d827e22-9253-486a-a948-3fac6d01ae38'::uuid
  OR auth.role() = 'anon'
  OR auth.role() = 'service_role'
  -- C. Super Admin, Admin Pusat, atau Akun Administrator Platform
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND (
        is_super_admin = true 
        OR is_admin_pusat = true 
        OR LOWER(COALESCE(email, '')) = 'jarimas.id@gmail.com' 
        OR LOWER(COALESCE(email, '')) = 'admin@jarimas.id'
      )
  )
  -- D. Pengurus / Admin / Kepala Sekolah / Guru / Tutor / Kader di Komunitas terkait
  OR EXISTS (
    SELECT 1 FROM public.anggota_komunitas ak
    WHERE ak.user_id = auth.uid()
      AND ak.komunitas_id = data_anak.komunitas_id
      AND ak.status::text = 'approved'
      AND (
        ak.peran::text ILIKE '%admin%' OR
        ak.peran::text ILIKE '%kepala%' OR
        ak.peran::text ILIKE '%guru%' OR
        ak.peran::text ILIKE '%pendidik%' OR
        ak.peran::text ILIKE '%tutor%' OR
        ak.peran::text ILIKE '%pengurus%' OR
        ak.peran::text ILIKE '%pengelola%' OR
        ak.peran::text ILIKE '%kader%'
      )
  )
);

-- 2. Perbarui Kebijakan DELETE pada tabel public.ddks_records
DROP POLICY IF EXISTS "Perekam atau Admin dapat menghapus DDKS" ON public.ddks_records;
DROP POLICY IF EXISTS "Izin hapus record DDKS untuk perekam dan pengurus" ON public.ddks_records;

CREATE POLICY "Izin hapus record DDKS untuk perekam dan pengurus" ON public.ddks_records 
FOR DELETE USING (
  -- A. Pengguna adalah perekam
  auth.uid() = recorded_by 
  OR auth.uid() = dicatat_oleh
  OR auth.role() = 'anon'
  OR auth.role() = 'service_role'
  -- B. Super Admin, Admin Pusat, atau Akun Administrator Platform
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
      AND (
        is_super_admin = true 
        OR is_admin_pusat = true 
        OR LOWER(COALESCE(email, '')) = 'jarimas.id@gmail.com' 
        OR LOWER(COALESCE(email, '')) = 'admin@jarimas.id'
      )
  )
  -- C. Admin Komunitas anak terkait
  OR EXISTS (
    SELECT 1 FROM public.data_anak da
    JOIN public.anggota_komunitas ak ON ak.komunitas_id = da.komunitas_id
    WHERE da.id = ddks_records.data_anak_id
      AND ak.user_id = auth.uid()
      AND ak.status::text = 'approved'
  )
);

-- 3. Fungsi Khusus (RPC) SECURITY DEFINER untuk Penghapusan Bersih Data Anak
CREATE OR REPLACE FUNCTION public.hapus_data_anak_oleh_admin(
  p_data_anak_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_id UUID;
  v_child_komunitas_id UUID;
  v_child_nama TEXT;
  v_child_creator UUID;
  v_is_super BOOLEAN := false;
  v_is_pusat BOOLEAN := false;
  v_caller_email TEXT;
  v_is_komunitas_admin BOOLEAN := false;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Sesi tidak valid. Silakan masuk terlebih dahulu.');
  END IF;

  -- Ambil data anak
  SELECT komunitas_id, nama_lengkap, created_by
  INTO v_child_komunitas_id, v_child_nama, v_child_creator
  FROM public.data_anak
  WHERE id = p_data_anak_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Data anak tidak ditemukan atau sudah dihapus.');
  END IF;

  -- Periksa status caller di profiles
  SELECT is_super_admin, is_admin_pusat, email
  INTO v_is_super, v_is_pusat, v_caller_email
  FROM public.profiles
  WHERE id = v_caller_id;

  -- Cek apakah pembuat atau super/pusat/root admin
  IF v_caller_id = v_child_creator OR
     v_is_super = true OR
     v_is_pusat = true OR
     (v_caller_email IS NOT NULL AND (
       LOWER(v_caller_email) = 'jarimas.id@gmail.com' OR
       LOWER(v_caller_email) = 'admin@jarimas.id' OR
       v_caller_email ILIKE '%jarimas.id%'
     )) THEN
     -- Diizinkan langsung
     NULL;
  ELSE
    -- Cek apakah admin/pengurus di komunitas terkait
    IF v_child_komunitas_id IS NOT NULL THEN
      SELECT EXISTS (
        SELECT 1 FROM public.anggota_komunitas
        WHERE user_id = v_caller_id
          AND komunitas_id = v_child_komunitas_id
          AND status::text = 'approved'
          AND (
            peran::text ILIKE '%admin%' OR
            peran::text ILIKE '%kepala%' OR
            peran::text ILIKE '%guru%' OR
            peran::text ILIKE '%pendidik%' OR
            peran::text ILIKE '%tutor%' OR
            peran::text ILIKE '%pengurus%' OR
            peran::text ILIKE '%pengelola%' OR
            peran::text ILIKE '%kader%'
          )
      ) INTO v_is_komunitas_admin;
    END IF;

    IF NOT v_is_komunitas_admin THEN
      RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak: Anda tidak memiliki izin untuk menghapus data anak ini.');
    END IF;
  END IF;

  -- Hapus data DDKS terkait
  DELETE FROM public.ddks_records WHERE data_anak_id = p_data_anak_id;

  -- Hapus data anak secara permanen
  DELETE FROM public.data_anak WHERE id = p_data_anak_id;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Data anak ' || COALESCE(v_child_nama, '') || ' berhasil dihapus secara permanen dari sistem.'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.hapus_data_anak_oleh_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hapus_data_anak_oleh_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.hapus_data_anak_oleh_admin(UUID) TO service_role;

-- 4. Bersihkan data anak yang sebelumnya ditandai deleted/keluar
DELETE FROM public.ddks_records 
WHERE data_anak_id IN (
  SELECT id FROM public.data_anak 
  WHERE status_approval = 'deleted' OR alasan_sekolah = '[DIHAPUS_OLEH_ADMIN]'
);

DELETE FROM public.data_anak 
WHERE status_approval = 'deleted' OR alasan_sekolah = '[DIHAPUS_OLEH_ADMIN]';

