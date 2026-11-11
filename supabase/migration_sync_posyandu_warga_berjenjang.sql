-- ==============================================================================
-- MIGRATION: SINKRONISASI OTOMATIS KEANGGOTAAN POSYANDU KE WARGA KITA & BERJENJANG
-- Menghubungkan setiap pengguna yang bergabung di Posyandu basis ke:
-- 1. Komunitas Posyandu Berjenjang (Kelurahan, Kecamatan, Kota Tegal)
-- 2. Komunitas Warga Kita (Tingkat Kota, Kecamatan, Kelurahan)
-- 3. Komunitas Warga Kita (Tingkat RW dan RT sesuai cakupan layanan posyandu)
-- ==============================================================================

-- 1. Helper Function: sync_user_posyandu_warga_hierarchy (SECURITY DEFINER)
--    Memungkinkan sistem menyinkronkan keanggotaan pengguna ke komunitas berjenjang & warga
--    tanpa terhambat oleh batasan RLS antar-komunitas.
CREATE OR REPLACE FUNCTION public.sync_user_posyandu_warga_hierarchy(
  p_user_id UUID,
  p_communities JSONB
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item JSONB;
  v_id UUID;
  v_nama TEXT;
  v_jenis TEXT;
  v_kec TEXT;
  v_kel TEXT;
  v_rw TEXT;
  v_rt TEXT;
  v_lokasi TEXT;
  v_deskripsi TEXT;
  v_role TEXT;
  v_count INTEGER := 0;
BEGIN
  IF p_user_id IS NULL OR p_communities IS NULL THEN
    RETURN 0;
  END IF;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_communities)
  LOOP
    v_id := (v_item->>'id')::UUID;
    v_nama := v_item->>'nama';
    v_jenis := v_item->>'jenis';
    v_kec := v_item->>'kecamatan';
    v_kel := v_item->>'kelurahan';
    v_rw := v_item->>'rw';
    v_rt := v_item->>'rt';
    v_lokasi := v_item->>'lokasi';
    v_deskripsi := v_item->>'deskripsi';
    v_role := COALESCE(v_item->>'role', 'Penduduk');

    -- Pastikan record komunitas tersedia
    INSERT INTO public.komunitas (
      id, nama, nama_komunitas, jenis, jenis_komunitas,
      kecamatan, kelurahan, rw, rt, lokasi, deskripsi, updated_at
    )
    VALUES (
      v_id, v_nama, v_nama, v_jenis, v_jenis,
      v_kec, v_kel, v_rw, v_rt, v_lokasi, v_deskripsi, now()
    )
    ON CONFLICT (id) DO UPDATE SET
      nama = COALESCE(EXCLUDED.nama, public.komunitas.nama),
      nama_komunitas = COALESCE(EXCLUDED.nama_komunitas, public.komunitas.nama_komunitas),
      jenis = COALESCE(EXCLUDED.jenis, public.komunitas.jenis),
      jenis_komunitas = COALESCE(EXCLUDED.jenis_komunitas, public.komunitas.jenis_komunitas),
      kecamatan = COALESCE(EXCLUDED.kecamatan, public.komunitas.kecamatan),
      kelurahan = COALESCE(EXCLUDED.kelurahan, public.komunitas.kelurahan),
      updated_at = now();

    -- Daftarkan keanggotaan pengguna
    INSERT INTO public.anggota_komunitas (
      user_id, komunitas_id, peran, status, created_at, updated_at
    )
    VALUES (
      p_user_id, v_id, v_role, 'approved', now(), now()
    )
    ON CONFLICT (user_id, komunitas_id) DO UPDATE SET
      status = 'approved',
      peran = CASE 
        WHEN public.anggota_komunitas.peran ILIKE '%pengurus%' OR public.anggota_komunitas.peran ILIKE '%admin%' 
        THEN public.anggota_komunitas.peran
        WHEN v_role = 'Kader' THEN 'Kader'
        ELSE public.anggota_komunitas.peran
      END,
      updated_at = now();

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_user_posyandu_warga_hierarchy(UUID, JSONB) TO anon, authenticated, service_role;

-- 2. Pastikan Komunitas Posyandu Kota Tegal terdaftar di tabel komunitas
INSERT INTO public.komunitas (
  id, nama, nama_komunitas, jenis, jenis_komunitas,
  kecamatan, kelurahan, lokasi, deskripsi, updated_at
)
VALUES (
  '4559e31a-8079-4146-8aa4-87150211f8cd'::UUID,
  'Komunitas Posyandu Kota Tegal',
  'Komunitas Posyandu Kota Tegal',
  'posyandu',
  'posyandu',
  'Kota Tegal',
  'Semua Kelurahan',
  'Kota Tegal, Jawa Tengah',
  'Forum komunikasi dan koordinasi kader Posyandu tingkat Kota Tegal yang menghimpun seluruh kader posyandu se-Kota Tegal.',
  now()
)
ON CONFLICT (id) DO UPDATE SET
  nama = 'Komunitas Posyandu Kota Tegal',
  nama_komunitas = 'Komunitas Posyandu Kota Tegal',
  jenis = 'posyandu',
  jenis_komunitas = 'posyandu',
  updated_at = now();

-- 3. Pastikan Komunitas Posyandu 4 Kecamatan terdaftar di tabel komunitas
-- Tegal Timur
INSERT INTO public.komunitas (
  id, nama, nama_komunitas, jenis, jenis_komunitas,
  kecamatan, kelurahan, lokasi, deskripsi, updated_at
)
VALUES (
  'adca4334-912b-40fa-8c70-179ad2ae3a6c'::UUID,
  'Komunitas Posyandu Kecamatan: Tegal Timur',
  'Komunitas Posyandu Kecamatan: Tegal Timur',
  'posyandu',
  'posyandu',
  'Tegal Timur',
  'Semua Kelurahan',
  'Kecamatan Tegal Timur, Kota Tegal',
  'Komunitas koordinasi kader Posyandu se-Kecamatan Tegal Timur, Kota Tegal.',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Tegal Barat
INSERT INTO public.komunitas (
  id, nama, nama_komunitas, jenis, jenis_komunitas,
  kecamatan, kelurahan, lokasi, deskripsi, updated_at
)
VALUES (
  'a5069904-747f-4318-8686-2af5f58c7414'::UUID,
  'Komunitas Posyandu Kecamatan: Tegal Barat',
  'Komunitas Posyandu Kecamatan: Tegal Barat',
  'posyandu',
  'posyandu',
  'Tegal Barat',
  'Semua Kelurahan',
  'Kecamatan Tegal Barat, Kota Tegal',
  'Komunitas koordinasi kader Posyandu se-Kecamatan Tegal Barat, Kota Tegal.',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Tegal Selatan
INSERT INTO public.komunitas (
  id, nama, nama_komunitas, jenis, jenis_komunitas,
  kecamatan, kelurahan, lokasi, deskripsi, updated_at
)
VALUES (
  'f7f6a707-ea26-4702-861c-0cfa0b3297a7'::UUID,
  'Komunitas Posyandu Kecamatan: Tegal Selatan',
  'Komunitas Posyandu Kecamatan: Tegal Selatan',
  'posyandu',
  'posyandu',
  'Tegal Selatan',
  'Semua Kelurahan',
  'Kecamatan Tegal Selatan, Kota Tegal',
  'Komunitas koordinasi kader Posyandu se-Kecamatan Tegal Selatan, Kota Tegal.',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Margadana
INSERT INTO public.komunitas (
  id, nama, nama_komunitas, jenis, jenis_komunitas,
  kecamatan, kelurahan, lokasi, deskripsi, updated_at
)
VALUES (
  'c334b071-ea9d-4340-84cf-2d583095aa7a'::UUID,
  'Komunitas Posyandu Kecamatan: Margadana',
  'Komunitas Posyandu Kecamatan: Margadana',
  'posyandu',
  'posyandu',
  'Margadana',
  'Semua Kelurahan',
  'Kecamatan Margadana, Kota Tegal',
  'Komunitas koordinasi kader Posyandu se-Kecamatan Margadana, Kota Tegal.',
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 4. Sinkronisasi Instan Seluruh Kader/Anggota Posyandu yang ada saat ini ke Komunitas Posyandu Kota Tegal
INSERT INTO public.anggota_komunitas (user_id, komunitas_id, peran, status, created_at, updated_at)
SELECT DISTINCT ON (ak.user_id)
  ak.user_id,
  '4559e31a-8079-4146-8aa4-87150211f8cd'::UUID AS komunitas_id,
  CASE 
    WHEN ak.peran ILIKE '%kader%' OR ak.peran ILIKE '%pengurus%' OR ak.peran ILIKE '%admin%' THEN 'Kader'
    ELSE 'Anggota'
  END AS peran,
  ak.status AS status,
  now(),
  now()
FROM public.anggota_komunitas ak
JOIN public.komunitas k ON ak.komunitas_id = k.id
WHERE k.jenis = 'posyandu'
  AND ak.status::text = 'approved'
  AND ak.komunitas_id != '4559e31a-8079-4146-8aa4-87150211f8cd'::UUID
ORDER BY ak.user_id, 
  CASE WHEN ak.peran ILIKE '%kader%' OR ak.peran ILIKE '%pengurus%' OR ak.peran ILIKE '%admin%' THEN 1 ELSE 2 END ASC
ON CONFLICT (user_id, komunitas_id) DO UPDATE SET
  status = EXCLUDED.status,
  updated_at = now();

