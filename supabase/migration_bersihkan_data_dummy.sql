-- ==============================================================================
-- Migration: Pembersihan Seluruh Data Dummy Anak di Database JARIMAS-ID
-- ==============================================================================
-- Menghapus 54 baris data dummy uji coba dari tabel public.data_anak
-- Menjaga 49 baris data anak Kelompok Bermain (KB) sesungguhnya & seluruh data ATS tetap aman.

-- 1. Hapus riwayat DDKS yang terkait dengan data anak dummy (jika ada)
DELETE FROM public.ddks_records
WHERE data_anak_id IN (
  SELECT id FROM public.data_anak
  WHERE UPPER(nama_lengkap) LIKE 'ANAK TEST %'
     OR UPPER(nama_lengkap) IN ('TEST', 'TEST CEK RETURN')
     OR UPPER(nama_lengkap) LIKE 'TEST %'
     OR UPPER(nama_sekolah) LIKE '%TEST%'
     OR (UPPER(nama_sekolah) = 'ANAK SHOLEH' AND (nama_orangtua = '-' OR nama_orangtua IS NULL OR nama_orangtua = ''))
);

-- 2. Hapus data anak dummy dari tabel public.data_anak
DELETE FROM public.data_anak
WHERE UPPER(nama_lengkap) LIKE 'ANAK TEST %'
   OR UPPER(nama_lengkap) IN ('TEST', 'TEST CEK RETURN')
   OR UPPER(nama_lengkap) LIKE 'TEST %'
   OR UPPER(nama_sekolah) LIKE '%TEST%'
   OR (UPPER(nama_sekolah) = 'ANAK SHOLEH' AND (nama_orangtua = '-' OR nama_orangtua IS NULL OR nama_orangtua = ''));

-- 3. Perbarui kebijakan DELETE agar Super Admin & sistem dapat mengelola data dengan aman
DROP POLICY IF EXISTS "Pembuat atau Admin dapat menghapus data anak" ON public.data_anak;

CREATE POLICY "Pembuat atau Admin dapat menghapus data anak" ON public.data_anak FOR DELETE USING (
  auth.uid() = created_by OR
  created_by = '1d827e22-9253-486a-a948-3fac6d01ae38'::uuid OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_admin = true) OR
  auth.role() = 'service_role'
);
