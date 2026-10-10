-- ==============================================================================
-- Migration: Kebijakan Keamanan (RLS) Sinkronisasi Data Anak dari Google Sheet
-- ==============================================================================
-- Menambahkan izin bagi akun sinkronisasi sistem dan role service untuk memasukkan data anak

DROP POLICY IF EXISTS "Pengguna terautentikasi dapat menambah data anak" ON public.data_anak;

CREATE POLICY "Pengguna terautentikasi dapat menambah data anak" ON public.data_anak 
FOR INSERT WITH CHECK (
  auth.uid() = created_by 
  OR created_by = '1d827e22-9253-486a-a948-3fac6d01ae38'::uuid
  OR auth.role() = 'anon'
  OR auth.role() = 'service_role'
);
