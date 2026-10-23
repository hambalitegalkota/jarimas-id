-- ==============================================================================
-- Migration: Hapus Permanen Akun Dummy Test Cleanup
-- ==============================================================================
-- Menghapus akun bot uji coba 'Test Cleanup' (id: 66cb035a-5a95-469a-8df0-381b428cac7d)
-- yang dibuat pada tahap pengujian sistem pembersihan data (11 Oktober 2026).

-- 1. Hapus relasi keanggotaan komunitas jika ada
DELETE FROM public.anggota_komunitas 
WHERE user_id = '66cb035a-5a95-469a-8df0-381b428cac7d' 
   OR user_id IN (SELECT id FROM public.profiles WHERE email = 'test_cleanup_bot_123@example.com');

-- 2. Hapus dari tabel public.profiles
DELETE FROM public.profiles 
WHERE id = '66cb035a-5a95-469a-8df0-381b428cac7d' 
   OR email = 'test_cleanup_bot_123@example.com'
   OR LOWER(nama_lengkap) = 'test cleanup';

-- 3. Hapus dari auth.users jika record auth masih ada
DELETE FROM auth.users 
WHERE id = '66cb035a-5a95-469a-8df0-381b428cac7d' 
   OR email = 'test_cleanup_bot_123@example.com';
