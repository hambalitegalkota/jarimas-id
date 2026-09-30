-- ==============================================================================
-- JARIMAS-ID: MIGRATION FIX HIERARKI PERSETUJUAN ADMIN BERJENJANG & RLS SUPABASE
-- Jalankan skrip ini di: Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Pastikan kolom-kolom penting tersedia pada tabel anggota_komunitas
ALTER TABLE public.anggota_komunitas ADD COLUMN IF NOT EXISTS peran TEXT NOT NULL DEFAULT 'Pengunjung';
ALTER TABLE public.anggota_komunitas ADD COLUMN IF NOT EXISTS peran_diajukan TEXT;
ALTER TABLE public.anggota_komunitas ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE public.anggota_komunitas ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.anggota_komunitas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- 2. Helper function: Memeriksa wewenang hierarki admin (Kecamatan -> Kelurahan -> RW -> RT)
CREATE OR REPLACE FUNCTION public.check_user_can_manage_community(
  p_user_id UUID,
  p_target_komunitas_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_super BOOLEAN;
  v_target_nama TEXT;
  v_target_jenis TEXT;
  v_target_kec TEXT;
  v_target_kel TEXT;
  v_target_rw TEXT;
  v_target_rt TEXT;
BEGIN
  IF p_user_id IS NULL OR p_target_komunitas_id IS NULL THEN
    RETURN false;
  END IF;

  -- 1. Cek apakah Super Admin
  SELECT is_super_admin INTO v_is_super FROM public.profiles WHERE id = p_user_id;
  IF v_is_super = true THEN
    RETURN true;
  END IF;

  -- 2. Cek apakah Admin/Pengurus langsung di komunitas yang sama
  IF EXISTS (
    SELECT 1 FROM public.anggota_komunitas ak
    WHERE ak.komunitas_id = p_target_komunitas_id
      AND ak.user_id = p_user_id
      AND ak.status::text = 'approved'
      AND (
        ak.peran::text ILIKE '%pengurus%' OR 
        ak.peran::text ILIKE '%kader%' OR 
        ak.peran::text ILIKE '%admin%' OR
        ak.peran::text ILIKE '%ketua%' OR
        ak.peran::text ILIKE '%pengelola%'
      )
  ) THEN
    RETURN true;
  END IF;

  -- 3. Ambil metadata komunitas target
  SELECT nama, jenis, kecamatan, kelurahan, rw, rt
  INTO v_target_nama, v_target_jenis, v_target_kec, v_target_kel, v_target_rw, v_target_rt
  FROM public.komunitas
  WHERE id = p_target_komunitas_id;

  IF v_target_jenis IS NULL OR v_target_jenis != 'warga_kita' THEN
    RETURN false;
  END IF;

  -- Fallback ekstraksi kelurahan jika kosong dari nama
  IF v_target_kel IS NULL OR v_target_kel = '' THEN
    v_target_kel := substring(v_target_nama from '(?i)Kelurahan[:\s]*([a-zA-Z\s]+?)(?:,|$)');
  END IF;

  -- Fallback ekstraksi rw jika kosong dari nama
  IF v_target_rw IS NULL OR v_target_rw = '' THEN
    v_target_rw := substring(v_target_nama from '(?i)RW[:\s]*([0-9]+)');
  END IF;

  -- 4. Cek Wewenang Hierarkis:
  -- A. Admin Kecamatan -> Mengelola Kelurahan, RW, RT dalam Kecamatan yang sama
  IF EXISTS (
    SELECT 1 FROM public.anggota_komunitas ak
    JOIN public.komunitas k ON k.id = ak.komunitas_id
    WHERE ak.user_id = p_user_id
      AND ak.status::text = 'approved'
      AND (ak.peran::text ILIKE '%pengurus%' OR ak.peran::text ILIKE '%admin%')
      AND k.jenis = 'warga_kita'
      AND (
        (v_target_kec IS NOT NULL AND LOWER(TRIM(k.kecamatan)) = LOWER(TRIM(v_target_kec))) OR
        (v_target_nama ILIKE '%' || k.kecamatan || '%')
      )
      AND (k.kelurahan IS NULL OR k.kelurahan = '' OR LOWER(TRIM(k.kelurahan)) = 'semua kelurahan' OR k.nama NOT ILIKE '%kelurahan%')
      AND (k.rw IS NULL OR k.rw = '' OR k.rw = '00')
      AND (k.rt IS NULL OR k.rt = '' OR k.rt = '00')
  ) THEN
    RETURN true;
  END IF;

  -- B. Admin Kelurahan -> Mengelola RW dan RT dalam Kelurahan yang sama
  IF v_target_kel IS NOT NULL AND v_target_kel != '' AND EXISTS (
    SELECT 1 FROM public.anggota_komunitas ak
    JOIN public.komunitas k ON k.id = ak.komunitas_id
    WHERE ak.user_id = p_user_id
      AND ak.status::text = 'approved'
      AND (ak.peran::text ILIKE '%pengurus%' OR ak.peran::text ILIKE '%admin%')
      AND k.jenis = 'warga_kita'
      AND (
        LOWER(TRIM(k.kelurahan)) = LOWER(TRIM(v_target_kel)) OR
        k.nama ILIKE '%' || v_target_kel || '%'
      )
      AND (k.rw IS NULL OR k.rw = '' OR k.rw = '00')
      AND (k.rt IS NULL OR k.rt = '' OR k.rt = '00')
  ) THEN
    RETURN true;
  END IF;

  -- C. Admin RW -> Mengelola RT dalam RW yang sama
  IF v_target_rw IS NOT NULL AND v_target_rw != '' AND EXISTS (
    SELECT 1 FROM public.anggota_komunitas ak
    JOIN public.komunitas k ON k.id = ak.komunitas_id
    WHERE ak.user_id = p_user_id
      AND ak.status::text = 'approved'
      AND (ak.peran::text ILIKE '%pengurus%' OR ak.peran::text ILIKE '%admin%')
      AND k.jenis = 'warga_kita'
      AND (
        v_target_kel IS NULL OR
        LOWER(TRIM(k.kelurahan)) = LOWER(TRIM(v_target_kel)) OR
        k.nama ILIKE '%' || v_target_kel || '%'
      )
      AND REGEXP_REPLACE(k.rw, '[^0-9]', '', 'g') = REGEXP_REPLACE(v_target_rw, '[^0-9]', '', 'g')
      AND (k.rt IS NULL OR k.rt = '' OR k.rt = '00')
  ) THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- 3. Perbarui RLS Policy pada public.anggota_komunitas
DROP POLICY IF EXISTS "Pengguna/Admin dapat mengelola keanggotaan" ON public.anggota_komunitas;
CREATE POLICY "Pengguna/Admin dapat mengelola keanggotaan" ON public.anggota_komunitas FOR UPDATE USING (
  auth.uid() = user_id OR
  public.check_user_can_manage_community(auth.uid(), anggota_komunitas.komunitas_id)
);

-- 4. Stored Procedure RPC: Menyetujui Peran Anggota / Admin Berjenjang (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.approve_member_role_hierarchical(
  p_member_id UUID,
  p_target_role TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_member RECORD;
  v_role_to_set TEXT;
  v_can_approve BOOLEAN;
BEGIN
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak: Anda belum masuk.');
  END IF;

  SELECT * INTO v_member FROM public.anggota_komunitas WHERE id = p_member_id;
  IF v_member.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Data permohonan anggota tidak ditemukan.');
  END IF;

  v_can_approve := public.check_user_can_manage_community(v_caller_id, v_member.komunitas_id);
  IF NOT v_can_approve THEN
    RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak: Anda tidak memiliki wewenang hierarkis untuk menyetujui permohonan ini.');
  END IF;

  v_role_to_set := COALESCE(p_target_role, v_member.peran_diajukan, v_member.peran, 'Penduduk');

  -- Update anggota target menjadi approved dengan peran baru
  UPDATE public.anggota_komunitas
  SET 
    peran = v_role_to_set,
    peran_diajukan = NULL,
    status = 'approved',
    approved_by = v_caller_id,
    updated_at = now()
  WHERE id = p_member_id;

  -- Jika disetujui sebagai Pengurus/Admin:
  IF v_role_to_set ILIKE '%pengurus%' OR v_role_to_set ILIKE '%admin%' THEN
    -- Bersihkan pengajuan peran Admin lainnya yang masih pending pada komunitas tersebut
    UPDATE public.anggota_komunitas
    SET peran_diajukan = NULL, updated_at = now()
    WHERE komunitas_id = v_member.komunitas_id
      AND peran_diajukan = 'Pengurus'
      AND id != p_member_id;

    -- Bersihkan pengajuan pending pada keanggotaan lain milik user ini
    UPDATE public.anggota_komunitas
    SET peran_diajukan = NULL, status = 'approved', peran = 'Penduduk', updated_at = now()
    WHERE user_id = v_member.user_id
      AND id != p_member_id
      AND peran = 'Pengunjung';
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Permohonan peran berhasil disetujui.');
END;
$$;

-- 5. Stored Procedure RPC: Menolak Peran Anggota / Admin Berjenjang (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.reject_member_role_hierarchical(
  p_member_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_member RECORD;
  v_can_approve BOOLEAN;
BEGIN
  IF v_caller_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak: Anda belum masuk.');
  END IF;

  SELECT * INTO v_member FROM public.anggota_komunitas WHERE id = p_member_id;
  IF v_member.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Data permohonan anggota tidak ditemukan.');
  END IF;

  v_can_approve := public.check_user_can_manage_community(v_caller_id, v_member.komunitas_id);
  IF NOT v_can_approve THEN
    RETURN jsonb_build_object('success', false, 'message', 'Akses ditolak: Anda tidak memiliki wewenang hierarkis untuk menolak permohonan ini.');
  END IF;

  IF v_member.status = 'approved' AND v_member.peran_diajukan IS NOT NULL THEN
    UPDATE public.anggota_komunitas
    SET peran_diajukan = NULL, approved_by = v_caller_id, updated_at = now()
    WHERE id = p_member_id;
  ELSE
    UPDATE public.anggota_komunitas
    SET status = 'rejected', peran_diajukan = NULL, approved_by = v_caller_id, updated_at = now()
    WHERE id = p_member_id;
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Permohonan peran berhasil ditolak.');
END;
$$;

-- 6. Berikan hak akses eksekusi RPC ke pengguna terautentikasi
GRANT EXECUTE ON FUNCTION public.check_user_can_manage_community(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_member_role_hierarchical(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_member_role_hierarchical(UUID) TO authenticated;
