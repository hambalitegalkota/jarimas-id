-- ==============================================================================
-- Migration: Fix Foreign Key Pesan Grup & Pastikan Komunitas Berjenjang Terdaftar
-- Generated on 2026-11-13
-- ==============================================================================

-- 1. Lepaskan foreign key constraint pada pesan_grup agar percakapan komunitas berjenjang/virtual tidak gagal
ALTER TABLE public.pesan_grup DROP CONSTRAINT IF EXISTS pesan_grup_komunitas_id_fkey;

-- 2. Daftarkan/Upsert seluruh Komunitas Berjenjang (Posyandu, Warga, PAUD) ke tabel public.komunitas
INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('4559e31a-8079-4146-8aa4-87150211f8cd', 'Komunitas Posyandu Kota Tegal', 'Komunitas Posyandu Kota Tegal', 'posyandu', 'posyandu', 'Kota Tegal', 'Semua Kelurahan', 'Kota Tegal, Jawa Tengah', 'Forum komunikasi dan koordinasi kader Posyandu tingkat Kota Tegal yang menghimpun seluruh kader posyandu se-Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('d31326ff-4fb9-4f2f-895e-abc9be006e7f', 'Komunitas Posyandu Kecamatan: Tegal Barat', 'Komunitas Posyandu Kecamatan: Tegal Barat', 'posyandu', 'posyandu', 'Tegal Barat', 'Semua Kelurahan', 'Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi kader Posyandu se-Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('32a6ae50-e43c-4d74-89c7-bbc9be75d0eb', 'Komunitas Posyandu Kelurahan: Tegalsari, Kecamatan: Tegal Barat', 'Komunitas Posyandu Kelurahan: Tegalsari, Kecamatan: Tegal Barat', 'posyandu', 'posyandu', 'Tegal Barat', 'Tegalsari', 'Kelurahan Tegalsari, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Tegalsari, Kecamatan Tegal Barat, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('33b7c394-35f0-4ea9-8e8b-5cd9951f367f', 'Komunitas Posyandu Kelurahan: Muarareja, Kecamatan: Tegal Barat', 'Komunitas Posyandu Kelurahan: Muarareja, Kecamatan: Tegal Barat', 'posyandu', 'posyandu', 'Tegal Barat', 'Muarareja', 'Kelurahan Muarareja, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Muarareja, Kecamatan Tegal Barat, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('00a8b6df-f416-43e7-8f51-0f2df557baea', 'Komunitas Posyandu Kelurahan: Kraton, Kecamatan: Tegal Barat', 'Komunitas Posyandu Kelurahan: Kraton, Kecamatan: Tegal Barat', 'posyandu', 'posyandu', 'Tegal Barat', 'Kraton', 'Kelurahan Kraton, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Kraton, Kecamatan Tegal Barat, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('11fb926a-203e-4292-8a6a-d6dde1c2f75e', 'Komunitas Posyandu Kelurahan: Pekauman, Kecamatan: Tegal Barat', 'Komunitas Posyandu Kelurahan: Pekauman, Kecamatan: Tegal Barat', 'posyandu', 'posyandu', 'Tegal Barat', 'Pekauman', 'Kelurahan Pekauman, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Pekauman, Kecamatan Tegal Barat, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('b337ffa2-fd43-4d78-8550-406de2c9a42e', 'Komunitas Posyandu Kelurahan: Pesurungan Kidul, Kecamatan: Tegal Barat', 'Komunitas Posyandu Kelurahan: Pesurungan Kidul, Kecamatan: Tegal Barat', 'posyandu', 'posyandu', 'Tegal Barat', 'Pesurungan Kidul', 'Kelurahan Pesurungan Kidul, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Pesurungan Kidul, Kecamatan Tegal Barat, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('7806dffb-3c7c-4122-82d7-aa2d3bde6de6', 'Komunitas Posyandu Kelurahan: Debong Lor, Kecamatan: Tegal Barat', 'Komunitas Posyandu Kelurahan: Debong Lor, Kecamatan: Tegal Barat', 'posyandu', 'posyandu', 'Tegal Barat', 'Debong Lor', 'Kelurahan Debong Lor, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Debong Lor, Kecamatan Tegal Barat, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('385980c9-a894-46ee-8db6-20090c40d419', 'Komunitas Posyandu Kelurahan: Kemandungan, Kecamatan: Tegal Barat', 'Komunitas Posyandu Kelurahan: Kemandungan, Kecamatan: Tegal Barat', 'posyandu', 'posyandu', 'Tegal Barat', 'Kemandungan', 'Kelurahan Kemandungan, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Kemandungan, Kecamatan Tegal Barat, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('68a40f1c-a475-4b4f-8cd0-3521c0cb3ea4', 'Komunitas Posyandu Kecamatan: Tegal Timur', 'Komunitas Posyandu Kecamatan: Tegal Timur', 'posyandu', 'posyandu', 'Tegal Timur', 'Semua Kelurahan', 'Kecamatan Tegal Timur, Kota Tegal', 'Komunitas koordinasi kader Posyandu se-Kecamatan Tegal Timur, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('0d5d9f2a-9c9c-446e-802d-ac0daf9f2a52', 'Komunitas Posyandu Kelurahan: Kejambon, Kecamatan: Tegal Timur', 'Komunitas Posyandu Kelurahan: Kejambon, Kecamatan: Tegal Timur', 'posyandu', 'posyandu', 'Tegal Timur', 'Kejambon', 'Kelurahan Kejambon, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Kejambon, Kecamatan Tegal Timur, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('c31a999d-4dcc-40fb-8661-d71d70d87de8', 'Komunitas Posyandu Kelurahan: Slerok, Kecamatan: Tegal Timur', 'Komunitas Posyandu Kelurahan: Slerok, Kecamatan: Tegal Timur', 'posyandu', 'posyandu', 'Tegal Timur', 'Slerok', 'Kelurahan Slerok, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Slerok, Kecamatan Tegal Timur, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('db03d862-ad32-4950-8862-012d5abf87a6', 'Komunitas Posyandu Kelurahan: Panggung, Kecamatan: Tegal Timur', 'Komunitas Posyandu Kelurahan: Panggung, Kecamatan: Tegal Timur', 'posyandu', 'posyandu', 'Tegal Timur', 'Panggung', 'Kelurahan Panggung, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Panggung, Kecamatan Tegal Timur, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('658685c0-7447-4db4-80bb-58f91b0dfc9b', 'Komunitas Posyandu Kelurahan: Mangkukusuman, Kecamatan: Tegal Timur', 'Komunitas Posyandu Kelurahan: Mangkukusuman, Kecamatan: Tegal Timur', 'posyandu', 'posyandu', 'Tegal Timur', 'Mangkukusuman', 'Kelurahan Mangkukusuman, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Mangkukusuman, Kecamatan Tegal Timur, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('3bfa0cc1-eeac-4de0-88da-c3dd970e3cd4', 'Komunitas Posyandu Kelurahan: Mintaragen, Kecamatan: Tegal Timur', 'Komunitas Posyandu Kelurahan: Mintaragen, Kecamatan: Tegal Timur', 'posyandu', 'posyandu', 'Tegal Timur', 'Mintaragen', 'Kelurahan Mintaragen, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Mintaragen, Kecamatan Tegal Timur, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('f596cdcb-c354-424e-89a3-ceb10711c668', 'Komunitas Posyandu Kecamatan: Tegal Selatan', 'Komunitas Posyandu Kecamatan: Tegal Selatan', 'posyandu', 'posyandu', 'Tegal Selatan', 'Semua Kelurahan', 'Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi kader Posyandu se-Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('8cfcb962-abf1-42d0-8010-88d514bf8fed', 'Komunitas Posyandu Kelurahan: Randugunting, Kecamatan: Tegal Selatan', 'Komunitas Posyandu Kelurahan: Randugunting, Kecamatan: Tegal Selatan', 'posyandu', 'posyandu', 'Tegal Selatan', 'Randugunting', 'Kelurahan Randugunting, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Randugunting, Kecamatan Tegal Selatan, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('654f713d-8acb-4343-8b3e-480dc0177928', 'Komunitas Posyandu Kelurahan: Debong Kulon, Kecamatan: Tegal Selatan', 'Komunitas Posyandu Kelurahan: Debong Kulon, Kecamatan: Tegal Selatan', 'posyandu', 'posyandu', 'Tegal Selatan', 'Debong Kulon', 'Kelurahan Debong Kulon, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Debong Kulon, Kecamatan Tegal Selatan, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('b4fb102f-cb45-44df-8a95-aa19a538e96b', 'Komunitas Posyandu Kelurahan: Debong Tengah, Kecamatan: Tegal Selatan', 'Komunitas Posyandu Kelurahan: Debong Tengah, Kecamatan: Tegal Selatan', 'posyandu', 'posyandu', 'Tegal Selatan', 'Debong Tengah', 'Kelurahan Debong Tengah, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Debong Tengah, Kecamatan Tegal Selatan, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('1b6bf011-a2d6-4850-8947-1dadf8136cd0', 'Komunitas Posyandu Kelurahan: Debong Kidul, Kecamatan: Tegal Selatan', 'Komunitas Posyandu Kelurahan: Debong Kidul, Kecamatan: Tegal Selatan', 'posyandu', 'posyandu', 'Tegal Selatan', 'Debong Kidul', 'Kelurahan Debong Kidul, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Debong Kidul, Kecamatan Tegal Selatan, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('c90e5b53-1ed0-44d4-887a-99f12e1d0814', 'Komunitas Posyandu Kelurahan: Bandung, Kecamatan: Tegal Selatan', 'Komunitas Posyandu Kelurahan: Bandung, Kecamatan: Tegal Selatan', 'posyandu', 'posyandu', 'Tegal Selatan', 'Bandung', 'Kelurahan Bandung, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Bandung, Kecamatan Tegal Selatan, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('f31459a8-0471-434a-87d5-f0d145201640', 'Komunitas Posyandu Kelurahan: Tunon, Kecamatan: Tegal Selatan', 'Komunitas Posyandu Kelurahan: Tunon, Kecamatan: Tegal Selatan', 'posyandu', 'posyandu', 'Tegal Selatan', 'Tunon', 'Kelurahan Tunon, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Tunon, Kecamatan Tegal Selatan, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('5a9452c0-1c54-4748-8cc3-3679a48add0f', 'Komunitas Posyandu Kelurahan: Keturen, Kecamatan: Tegal Selatan', 'Komunitas Posyandu Kelurahan: Keturen, Kecamatan: Tegal Selatan', 'posyandu', 'posyandu', 'Tegal Selatan', 'Keturen', 'Kelurahan Keturen, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Keturen, Kecamatan Tegal Selatan, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('d3f8fa13-67a6-48a4-8242-120d224328b6', 'Komunitas Posyandu Kelurahan: Kalinyamat Wetan, Kecamatan: Tegal Selatan', 'Komunitas Posyandu Kelurahan: Kalinyamat Wetan, Kecamatan: Tegal Selatan', 'posyandu', 'posyandu', 'Tegal Selatan', 'Kalinyamat Wetan', 'Kelurahan Kalinyamat Wetan, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Kalinyamat Wetan, Kecamatan Tegal Selatan, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('c6189d8f-5cc2-4843-86a8-ae91e332e65c', 'Komunitas Posyandu Kecamatan: Margadana', 'Komunitas Posyandu Kecamatan: Margadana', 'posyandu', 'posyandu', 'Margadana', 'Semua Kelurahan', 'Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi kader Posyandu se-Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('b9ecd8d0-0a37-4000-868d-71f15a8486c4', 'Komunitas Posyandu Kelurahan: Margadana, Kecamatan: Margadana', 'Komunitas Posyandu Kelurahan: Margadana, Kecamatan: Margadana', 'posyandu', 'posyandu', 'Margadana', 'Margadana', 'Kelurahan Margadana, Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Margadana, Kecamatan Margadana, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('e659f360-61a9-4ac8-807b-439d68d25ed0', 'Komunitas Posyandu Kelurahan: Kaligangsa, Kecamatan: Margadana', 'Komunitas Posyandu Kelurahan: Kaligangsa, Kecamatan: Margadana', 'posyandu', 'posyandu', 'Margadana', 'Kaligangsa', 'Kelurahan Kaligangsa, Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Kaligangsa, Kecamatan Margadana, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('6166ac1b-9d54-43e6-8302-9af18bd173a4', 'Komunitas Posyandu Kelurahan: Cabawan, Kecamatan: Margadana', 'Komunitas Posyandu Kelurahan: Cabawan, Kecamatan: Margadana', 'posyandu', 'posyandu', 'Margadana', 'Cabawan', 'Kelurahan Cabawan, Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Cabawan, Kecamatan Margadana, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('337dd971-d5c9-4ccc-8903-b241f688a8fe', 'Komunitas Posyandu Kelurahan: Krandon, Kecamatan: Margadana', 'Komunitas Posyandu Kelurahan: Krandon, Kecamatan: Margadana', 'posyandu', 'posyandu', 'Margadana', 'Krandon', 'Kelurahan Krandon, Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Krandon, Kecamatan Margadana, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('ef64da2c-9006-485b-89b9-986d8366854c', 'Komunitas Posyandu Kelurahan: Pesurungan Lor, Kecamatan: Margadana', 'Komunitas Posyandu Kelurahan: Pesurungan Lor, Kecamatan: Margadana', 'posyandu', 'posyandu', 'Margadana', 'Pesurungan Lor', 'Kelurahan Pesurungan Lor, Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Pesurungan Lor, Kecamatan Margadana, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('14efe62d-415d-4a1f-8b8a-be7d63f3a3a8', 'Komunitas Posyandu Kelurahan: Kalinyamat Kulon, Kecamatan: Margadana', 'Komunitas Posyandu Kelurahan: Kalinyamat Kulon, Kecamatan: Margadana', 'posyandu', 'posyandu', 'Margadana', 'Kalinyamat Kulon', 'Kelurahan Kalinyamat Kulon, Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Kalinyamat Kulon, Kecamatan Margadana, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('b03e9219-dc2b-496a-8e22-4f89982f9191', 'Komunitas Posyandu Kelurahan: Sumurpanggang, Kecamatan: Margadana', 'Komunitas Posyandu Kelurahan: Sumurpanggang, Kecamatan: Margadana', 'posyandu', 'posyandu', 'Margadana', 'Sumurpanggang', 'Kelurahan Sumurpanggang, Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi kader Posyandu tingkat Kelurahan Sumurpanggang, Kecamatan Margadana, Kota Tegal yang menghimpun kader dari seluruh Posyandu di wilayah ini.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('cb45f6c3-efbf-404c-8fba-4a39299b710f', 'Komunitas Warga Kota Tegal', 'Komunitas Warga Kota Tegal', 'warga_kita', 'warga_kita', 'Kota Tegal', 'Semua Kelurahan', 'Kota Tegal, Jawa Tengah', 'Komunitas resmi seluruh warga Kota Tegal untuk koordinasi dan aspirasi pembangunan lingkungan.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('8b74d5f6-3904-46ed-87f3-6f4d42f68dfa', 'Komunitas Warga Kecamatan: Tegal Barat', 'Komunitas Warga Kecamatan: Tegal Barat', 'warga_kita', 'warga_kita', 'Tegal Barat', 'Semua Kelurahan', 'Kecamatan Tegal Barat, Kota Tegal', 'Komunitas warga tingkat Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('a89907b9-ed3d-4fd6-840d-a2fd79a68688', 'Komunitas Warga Kelurahan: Tegalsari, Kecamatan: Tegal Barat', 'Komunitas Warga Kelurahan: Tegalsari, Kecamatan: Tegal Barat', 'warga_kita', 'warga_kita', 'Tegal Barat', 'Tegalsari', 'Kelurahan Tegalsari, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas warga tingkat Kelurahan Tegalsari, Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('aec688dd-2bf6-4fbb-8397-68ade10014d0', 'Komunitas Warga Kelurahan: Muarareja, Kecamatan: Tegal Barat', 'Komunitas Warga Kelurahan: Muarareja, Kecamatan: Tegal Barat', 'warga_kita', 'warga_kita', 'Tegal Barat', 'Muarareja', 'Kelurahan Muarareja, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas warga tingkat Kelurahan Muarareja, Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('0c476426-f91f-495d-8db4-2a31fe13b2be', 'Komunitas Warga Kelurahan: Kraton, Kecamatan: Tegal Barat', 'Komunitas Warga Kelurahan: Kraton, Kecamatan: Tegal Barat', 'warga_kita', 'warga_kita', 'Tegal Barat', 'Kraton', 'Kelurahan Kraton, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas warga tingkat Kelurahan Kraton, Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('2ab84673-0984-4a78-8630-3101dda7f280', 'Komunitas Warga Kelurahan: Pekauman, Kecamatan: Tegal Barat', 'Komunitas Warga Kelurahan: Pekauman, Kecamatan: Tegal Barat', 'warga_kita', 'warga_kita', 'Tegal Barat', 'Pekauman', 'Kelurahan Pekauman, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas warga tingkat Kelurahan Pekauman, Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('3fed2ffb-fd15-4932-8a6e-1c7195fe7658', 'Komunitas Warga Kelurahan: Pesurungan Kidul, Kecamatan: Tegal Barat', 'Komunitas Warga Kelurahan: Pesurungan Kidul, Kecamatan: Tegal Barat', 'warga_kita', 'warga_kita', 'Tegal Barat', 'Pesurungan Kidul', 'Kelurahan Pesurungan Kidul, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas warga tingkat Kelurahan Pesurungan Kidul, Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('99f02e22-d6e9-4e28-8e8f-48c1c428c002', 'Komunitas Warga Kelurahan: Debong Lor, Kecamatan: Tegal Barat', 'Komunitas Warga Kelurahan: Debong Lor, Kecamatan: Tegal Barat', 'warga_kita', 'warga_kita', 'Tegal Barat', 'Debong Lor', 'Kelurahan Debong Lor, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas warga tingkat Kelurahan Debong Lor, Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('74e428e0-b759-418c-8a18-1b8d011b2f00', 'Komunitas Warga Kelurahan: Kemandungan, Kecamatan: Tegal Barat', 'Komunitas Warga Kelurahan: Kemandungan, Kecamatan: Tegal Barat', 'warga_kita', 'warga_kita', 'Tegal Barat', 'Kemandungan', 'Kelurahan Kemandungan, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas warga tingkat Kelurahan Kemandungan, Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('feb479b5-00d6-43bd-87b9-79b5208e0c4b', 'Komunitas Warga Kecamatan: Tegal Timur', 'Komunitas Warga Kecamatan: Tegal Timur', 'warga_kita', 'warga_kita', 'Tegal Timur', 'Semua Kelurahan', 'Kecamatan Tegal Timur, Kota Tegal', 'Komunitas warga tingkat Kecamatan Tegal Timur, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('42934513-0d08-49f4-8aef-ae21db273d6c', 'Komunitas Warga Kelurahan: Kejambon, Kecamatan: Tegal Timur', 'Komunitas Warga Kelurahan: Kejambon, Kecamatan: Tegal Timur', 'warga_kita', 'warga_kita', 'Tegal Timur', 'Kejambon', 'Kelurahan Kejambon, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas warga tingkat Kelurahan Kejambon, Kecamatan Tegal Timur, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('0dd41e64-f9d6-4951-8ce0-e4f1c66df16c', 'Komunitas Warga Kelurahan: Slerok, Kecamatan: Tegal Timur', 'Komunitas Warga Kelurahan: Slerok, Kecamatan: Tegal Timur', 'warga_kita', 'warga_kita', 'Tegal Timur', 'Slerok', 'Kelurahan Slerok, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas warga tingkat Kelurahan Slerok, Kecamatan Tegal Timur, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('2147c8bb-4b7f-49aa-8111-3ac1cdee6acc', 'Komunitas Warga Kelurahan: Panggung, Kecamatan: Tegal Timur', 'Komunitas Warga Kelurahan: Panggung, Kecamatan: Tegal Timur', 'warga_kita', 'warga_kita', 'Tegal Timur', 'Panggung', 'Kelurahan Panggung, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas warga tingkat Kelurahan Panggung, Kecamatan Tegal Timur, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('93fbd689-b52f-48e6-8d6a-05dd88c73124', 'Komunitas Warga Kelurahan: Mangkukusuman, Kecamatan: Tegal Timur', 'Komunitas Warga Kelurahan: Mangkukusuman, Kecamatan: Tegal Timur', 'warga_kita', 'warga_kita', 'Tegal Timur', 'Mangkukusuman', 'Kelurahan Mangkukusuman, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas warga tingkat Kelurahan Mangkukusuman, Kecamatan Tegal Timur, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('4f41aad8-ce0a-4b3a-8edc-a861850c5de8', 'Komunitas Warga Kelurahan: Mintaragen, Kecamatan: Tegal Timur', 'Komunitas Warga Kelurahan: Mintaragen, Kecamatan: Tegal Timur', 'warga_kita', 'warga_kita', 'Tegal Timur', 'Mintaragen', 'Kelurahan Mintaragen, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas warga tingkat Kelurahan Mintaragen, Kecamatan Tegal Timur, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('0f639802-5cec-482c-8ff3-ec650ad875ed', 'Komunitas Warga Kecamatan: Tegal Selatan', 'Komunitas Warga Kecamatan: Tegal Selatan', 'warga_kita', 'warga_kita', 'Tegal Selatan', 'Semua Kelurahan', 'Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas warga tingkat Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('f650b41b-20dd-4e5a-8b4e-34f9e9794b7f', 'Komunitas Warga Kelurahan: Randugunting, Kecamatan: Tegal Selatan', 'Komunitas Warga Kelurahan: Randugunting, Kecamatan: Tegal Selatan', 'warga_kita', 'warga_kita', 'Tegal Selatan', 'Randugunting', 'Kelurahan Randugunting, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas warga tingkat Kelurahan Randugunting, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('17e5b204-2925-41e9-87dd-ee617c0e7748', 'Komunitas Warga Kelurahan: Debong Kulon, Kecamatan: Tegal Selatan', 'Komunitas Warga Kelurahan: Debong Kulon, Kecamatan: Tegal Selatan', 'warga_kita', 'warga_kita', 'Tegal Selatan', 'Debong Kulon', 'Kelurahan Debong Kulon, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas warga tingkat Kelurahan Debong Kulon, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('619e9566-541c-408d-8767-329ddfc2ba9e', 'Komunitas Warga Kelurahan: Debong Tengah, Kecamatan: Tegal Selatan', 'Komunitas Warga Kelurahan: Debong Tengah, Kecamatan: Tegal Selatan', 'warga_kita', 'warga_kita', 'Tegal Selatan', 'Debong Tengah', 'Kelurahan Debong Tengah, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas warga tingkat Kelurahan Debong Tengah, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('412c54a8-29ac-422a-8d16-6ea149cad7bc', 'Komunitas Warga Kelurahan: Debong Kidul, Kecamatan: Tegal Selatan', 'Komunitas Warga Kelurahan: Debong Kidul, Kecamatan: Tegal Selatan', 'warga_kita', 'warga_kita', 'Tegal Selatan', 'Debong Kidul', 'Kelurahan Debong Kidul, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas warga tingkat Kelurahan Debong Kidul, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('9f2aa63a-53d9-47a6-81ec-f8c5bb6bbbc9', 'Komunitas Warga Kelurahan: Bandung, Kecamatan: Tegal Selatan', 'Komunitas Warga Kelurahan: Bandung, Kecamatan: Tegal Selatan', 'warga_kita', 'warga_kita', 'Tegal Selatan', 'Bandung', 'Kelurahan Bandung, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas warga tingkat Kelurahan Bandung, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('6f698161-bd56-42e8-82b4-d1c5d4d69e3b', 'Komunitas Warga Kelurahan: Tunon, Kecamatan: Tegal Selatan', 'Komunitas Warga Kelurahan: Tunon, Kecamatan: Tegal Selatan', 'warga_kita', 'warga_kita', 'Tegal Selatan', 'Tunon', 'Kelurahan Tunon, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas warga tingkat Kelurahan Tunon, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('4616c269-3977-46aa-8a96-559dd7bfc528', 'Komunitas Warga Kelurahan: Keturen, Kecamatan: Tegal Selatan', 'Komunitas Warga Kelurahan: Keturen, Kecamatan: Tegal Selatan', 'warga_kita', 'warga_kita', 'Tegal Selatan', 'Keturen', 'Kelurahan Keturen, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas warga tingkat Kelurahan Keturen, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('bea02eaa-7d4a-406e-89fa-4a7152709866', 'Komunitas Warga Kelurahan: Kalinyamat Wetan, Kecamatan: Tegal Selatan', 'Komunitas Warga Kelurahan: Kalinyamat Wetan, Kecamatan: Tegal Selatan', 'warga_kita', 'warga_kita', 'Tegal Selatan', 'Kalinyamat Wetan', 'Kelurahan Kalinyamat Wetan, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas warga tingkat Kelurahan Kalinyamat Wetan, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('9aecca06-88b0-4aa1-8f9f-5ae57969bda1', 'Komunitas Warga Kecamatan: Margadana', 'Komunitas Warga Kecamatan: Margadana', 'warga_kita', 'warga_kita', 'Margadana', 'Semua Kelurahan', 'Kecamatan Margadana, Kota Tegal', 'Komunitas warga tingkat Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('55df8619-15f2-4c72-8279-fb4541fe4f83', 'Komunitas Warga Kelurahan: Margadana, Kecamatan: Margadana', 'Komunitas Warga Kelurahan: Margadana, Kecamatan: Margadana', 'warga_kita', 'warga_kita', 'Margadana', 'Margadana', 'Kelurahan Margadana, Kecamatan Margadana, Kota Tegal', 'Komunitas warga tingkat Kelurahan Margadana, Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('06029e79-783f-4962-85d6-b591c797172e', 'Komunitas Warga Kelurahan: Kaligangsa, Kecamatan: Margadana', 'Komunitas Warga Kelurahan: Kaligangsa, Kecamatan: Margadana', 'warga_kita', 'warga_kita', 'Margadana', 'Kaligangsa', 'Kelurahan Kaligangsa, Kecamatan Margadana, Kota Tegal', 'Komunitas warga tingkat Kelurahan Kaligangsa, Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('c5c76fb2-f138-4274-874f-c1454a3d2039', 'Komunitas Warga Kelurahan: Cabawan, Kecamatan: Margadana', 'Komunitas Warga Kelurahan: Cabawan, Kecamatan: Margadana', 'warga_kita', 'warga_kita', 'Margadana', 'Cabawan', 'Kelurahan Cabawan, Kecamatan Margadana, Kota Tegal', 'Komunitas warga tingkat Kelurahan Cabawan, Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('4dcfc6f8-d1a3-46ae-87b5-45f5c71dcc6b', 'Komunitas Warga Kelurahan: Krandon, Kecamatan: Margadana', 'Komunitas Warga Kelurahan: Krandon, Kecamatan: Margadana', 'warga_kita', 'warga_kita', 'Margadana', 'Krandon', 'Kelurahan Krandon, Kecamatan Margadana, Kota Tegal', 'Komunitas warga tingkat Kelurahan Krandon, Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('78583f55-f467-4741-83a3-47f1d2189186', 'Komunitas Warga Kelurahan: Pesurungan Lor, Kecamatan: Margadana', 'Komunitas Warga Kelurahan: Pesurungan Lor, Kecamatan: Margadana', 'warga_kita', 'warga_kita', 'Margadana', 'Pesurungan Lor', 'Kelurahan Pesurungan Lor, Kecamatan Margadana, Kota Tegal', 'Komunitas warga tingkat Kelurahan Pesurungan Lor, Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('12686d54-9eee-4025-8d47-8dc12952d0c4', 'Komunitas Warga Kelurahan: Kalinyamat Kulon, Kecamatan: Margadana', 'Komunitas Warga Kelurahan: Kalinyamat Kulon, Kecamatan: Margadana', 'warga_kita', 'warga_kita', 'Margadana', 'Kalinyamat Kulon', 'Kelurahan Kalinyamat Kulon, Kecamatan Margadana, Kota Tegal', 'Komunitas warga tingkat Kelurahan Kalinyamat Kulon, Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('1130e6b0-2d99-4198-80d8-7fbd7da4fd3c', 'Komunitas Warga Kelurahan: Sumurpanggang, Kecamatan: Margadana', 'Komunitas Warga Kelurahan: Sumurpanggang, Kecamatan: Margadana', 'warga_kita', 'warga_kita', 'Margadana', 'Sumurpanggang', 'Kelurahan Sumurpanggang, Kecamatan Margadana, Kota Tegal', 'Komunitas warga tingkat Kelurahan Sumurpanggang, Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('32bcf2a1-ae21-4974-885e-335db5810674', 'Komunitas PAUD Kota Tegal', 'Komunitas PAUD Kota Tegal', 'satuan_paud', 'satuan_paud', 'Kota Tegal', 'Semua Kelurahan', 'Kota Tegal, Jawa Tengah', 'Forum komunikasi dan paguyuban pendidik PAUD se-Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('995b7c34-85f3-4385-877c-d2e16ab6fd18', 'Komunitas PAUD Kecamatan: Tegal Barat', 'Komunitas PAUD Kecamatan: Tegal Barat', 'satuan_paud', 'satuan_paud', 'Tegal Barat', 'Semua Kelurahan', 'Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi pendidik PAUD se-Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('dba9613b-c341-466e-85b6-f9f168eba0a4', 'Komunitas PAUD Kelurahan: Tegalsari, Kecamatan: Tegal Barat', 'Komunitas PAUD Kelurahan: Tegalsari, Kecamatan: Tegal Barat', 'satuan_paud', 'satuan_paud', 'Tegal Barat', 'Tegalsari', 'Kelurahan Tegalsari, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Tegalsari, Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('724dd99f-dd2c-40d3-83b6-29e110ddff9c', 'Komunitas PAUD Kelurahan: Muarareja, Kecamatan: Tegal Barat', 'Komunitas PAUD Kelurahan: Muarareja, Kecamatan: Tegal Barat', 'satuan_paud', 'satuan_paud', 'Tegal Barat', 'Muarareja', 'Kelurahan Muarareja, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Muarareja, Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('ac9e3a84-901a-4de5-807a-922537ca9c2f', 'Komunitas PAUD Kelurahan: Kraton, Kecamatan: Tegal Barat', 'Komunitas PAUD Kelurahan: Kraton, Kecamatan: Tegal Barat', 'satuan_paud', 'satuan_paud', 'Tegal Barat', 'Kraton', 'Kelurahan Kraton, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Kraton, Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('d5f3a891-19b1-4940-8094-590511e5fc23', 'Komunitas PAUD Kelurahan: Pekauman, Kecamatan: Tegal Barat', 'Komunitas PAUD Kelurahan: Pekauman, Kecamatan: Tegal Barat', 'satuan_paud', 'satuan_paud', 'Tegal Barat', 'Pekauman', 'Kelurahan Pekauman, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Pekauman, Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('b5047019-b89a-471a-80fc-87351ea4e72b', 'Komunitas PAUD Kelurahan: Pesurungan Kidul, Kecamatan: Tegal Barat', 'Komunitas PAUD Kelurahan: Pesurungan Kidul, Kecamatan: Tegal Barat', 'satuan_paud', 'satuan_paud', 'Tegal Barat', 'Pesurungan Kidul', 'Kelurahan Pesurungan Kidul, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Pesurungan Kidul, Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('867deec0-0529-4e30-805f-e98543cc513f', 'Komunitas PAUD Kelurahan: Debong Lor, Kecamatan: Tegal Barat', 'Komunitas PAUD Kelurahan: Debong Lor, Kecamatan: Tegal Barat', 'satuan_paud', 'satuan_paud', 'Tegal Barat', 'Debong Lor', 'Kelurahan Debong Lor, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Debong Lor, Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('743a7da2-f5cf-45a4-8792-ba81854c4082', 'Komunitas PAUD Kelurahan: Kemandungan, Kecamatan: Tegal Barat', 'Komunitas PAUD Kelurahan: Kemandungan, Kecamatan: Tegal Barat', 'satuan_paud', 'satuan_paud', 'Tegal Barat', 'Kemandungan', 'Kelurahan Kemandungan, Kecamatan Tegal Barat, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Kemandungan, Kecamatan Tegal Barat, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('41cd1db7-c4fd-4415-88ef-a809617ce8bb', 'Komunitas PAUD Kecamatan: Tegal Timur', 'Komunitas PAUD Kecamatan: Tegal Timur', 'satuan_paud', 'satuan_paud', 'Tegal Timur', 'Semua Kelurahan', 'Kecamatan Tegal Timur, Kota Tegal', 'Komunitas koordinasi pendidik PAUD se-Kecamatan Tegal Timur, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('0fdc16f1-1d7c-447c-85a1-24b5d1fe4267', 'Komunitas PAUD Kelurahan: Kejambon, Kecamatan: Tegal Timur', 'Komunitas PAUD Kelurahan: Kejambon, Kecamatan: Tegal Timur', 'satuan_paud', 'satuan_paud', 'Tegal Timur', 'Kejambon', 'Kelurahan Kejambon, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Kejambon, Kecamatan Tegal Timur, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('7a09f546-9d0f-4059-83b6-f6951b321401', 'Komunitas PAUD Kelurahan: Slerok, Kecamatan: Tegal Timur', 'Komunitas PAUD Kelurahan: Slerok, Kecamatan: Tegal Timur', 'satuan_paud', 'satuan_paud', 'Tegal Timur', 'Slerok', 'Kelurahan Slerok, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Slerok, Kecamatan Tegal Timur, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('cd912019-76fb-4af2-8ecd-703517f44f63', 'Komunitas PAUD Kelurahan: Panggung, Kecamatan: Tegal Timur', 'Komunitas PAUD Kelurahan: Panggung, Kecamatan: Tegal Timur', 'satuan_paud', 'satuan_paud', 'Tegal Timur', 'Panggung', 'Kelurahan Panggung, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Panggung, Kecamatan Tegal Timur, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('663a16cb-3f00-407e-8603-fdc1e456a5a8', 'Komunitas PAUD Kelurahan: Mangkukusuman, Kecamatan: Tegal Timur', 'Komunitas PAUD Kelurahan: Mangkukusuman, Kecamatan: Tegal Timur', 'satuan_paud', 'satuan_paud', 'Tegal Timur', 'Mangkukusuman', 'Kelurahan Mangkukusuman, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Mangkukusuman, Kecamatan Tegal Timur, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('20a521fa-da69-4a42-8333-5d152136b279', 'Komunitas PAUD Kelurahan: Mintaragen, Kecamatan: Tegal Timur', 'Komunitas PAUD Kelurahan: Mintaragen, Kecamatan: Tegal Timur', 'satuan_paud', 'satuan_paud', 'Tegal Timur', 'Mintaragen', 'Kelurahan Mintaragen, Kecamatan Tegal Timur, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Mintaragen, Kecamatan Tegal Timur, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('3947bc40-b7d7-40c4-8077-6a09a5e54533', 'Komunitas PAUD Kecamatan: Tegal Selatan', 'Komunitas PAUD Kecamatan: Tegal Selatan', 'satuan_paud', 'satuan_paud', 'Tegal Selatan', 'Semua Kelurahan', 'Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi pendidik PAUD se-Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('9a660939-7d2e-4a22-85fc-a4fd43d80b98', 'Komunitas PAUD Kelurahan: Randugunting, Kecamatan: Tegal Selatan', 'Komunitas PAUD Kelurahan: Randugunting, Kecamatan: Tegal Selatan', 'satuan_paud', 'satuan_paud', 'Tegal Selatan', 'Randugunting', 'Kelurahan Randugunting, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Randugunting, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('228c1f66-5a26-4e71-8812-8a05b53db919', 'Komunitas PAUD Kelurahan: Debong Kulon, Kecamatan: Tegal Selatan', 'Komunitas PAUD Kelurahan: Debong Kulon, Kecamatan: Tegal Selatan', 'satuan_paud', 'satuan_paud', 'Tegal Selatan', 'Debong Kulon', 'Kelurahan Debong Kulon, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Debong Kulon, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('83abb064-ea04-4725-8efd-fcb12f5242e8', 'Komunitas PAUD Kelurahan: Debong Tengah, Kecamatan: Tegal Selatan', 'Komunitas PAUD Kelurahan: Debong Tengah, Kecamatan: Tegal Selatan', 'satuan_paud', 'satuan_paud', 'Tegal Selatan', 'Debong Tengah', 'Kelurahan Debong Tengah, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Debong Tengah, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('d0f1354a-8cfe-4072-852e-0a65bbe19005', 'Komunitas PAUD Kelurahan: Debong Kidul, Kecamatan: Tegal Selatan', 'Komunitas PAUD Kelurahan: Debong Kidul, Kecamatan: Tegal Selatan', 'satuan_paud', 'satuan_paud', 'Tegal Selatan', 'Debong Kidul', 'Kelurahan Debong Kidul, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Debong Kidul, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('c4ae1338-a581-48fe-8b1c-aa495cfbfabb', 'Komunitas PAUD Kelurahan: Bandung, Kecamatan: Tegal Selatan', 'Komunitas PAUD Kelurahan: Bandung, Kecamatan: Tegal Selatan', 'satuan_paud', 'satuan_paud', 'Tegal Selatan', 'Bandung', 'Kelurahan Bandung, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Bandung, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('1d96e3a3-65bc-49c0-82ee-a27972cd55b3', 'Komunitas PAUD Kelurahan: Tunon, Kecamatan: Tegal Selatan', 'Komunitas PAUD Kelurahan: Tunon, Kecamatan: Tegal Selatan', 'satuan_paud', 'satuan_paud', 'Tegal Selatan', 'Tunon', 'Kelurahan Tunon, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Tunon, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('1aacaeeb-2a44-4a82-8a1b-54c1ebed9174', 'Komunitas PAUD Kelurahan: Keturen, Kecamatan: Tegal Selatan', 'Komunitas PAUD Kelurahan: Keturen, Kecamatan: Tegal Selatan', 'satuan_paud', 'satuan_paud', 'Tegal Selatan', 'Keturen', 'Kelurahan Keturen, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Keturen, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('44349b88-f09f-45b6-87a7-92a5015b5daf', 'Komunitas PAUD Kelurahan: Kalinyamat Wetan, Kecamatan: Tegal Selatan', 'Komunitas PAUD Kelurahan: Kalinyamat Wetan, Kecamatan: Tegal Selatan', 'satuan_paud', 'satuan_paud', 'Tegal Selatan', 'Kalinyamat Wetan', 'Kelurahan Kalinyamat Wetan, Kecamatan Tegal Selatan, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Kalinyamat Wetan, Kecamatan Tegal Selatan, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('879a9dc4-7d4a-4eb9-8f1c-9829eb939f9b', 'Komunitas PAUD Kecamatan: Margadana', 'Komunitas PAUD Kecamatan: Margadana', 'satuan_paud', 'satuan_paud', 'Margadana', 'Semua Kelurahan', 'Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi pendidik PAUD se-Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('20c1221b-86c3-46ea-8d84-2759c37130cb', 'Komunitas PAUD Kelurahan: Margadana, Kecamatan: Margadana', 'Komunitas PAUD Kelurahan: Margadana, Kecamatan: Margadana', 'satuan_paud', 'satuan_paud', 'Margadana', 'Margadana', 'Kelurahan Margadana, Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Margadana, Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('41596a1b-fe02-4e0a-8910-6685f21b3d81', 'Komunitas PAUD Kelurahan: Kaligangsa, Kecamatan: Margadana', 'Komunitas PAUD Kelurahan: Kaligangsa, Kecamatan: Margadana', 'satuan_paud', 'satuan_paud', 'Margadana', 'Kaligangsa', 'Kelurahan Kaligangsa, Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Kaligangsa, Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('5db043f0-0ed3-45ac-8b4a-b509899fb9cb', 'Komunitas PAUD Kelurahan: Cabawan, Kecamatan: Margadana', 'Komunitas PAUD Kelurahan: Cabawan, Kecamatan: Margadana', 'satuan_paud', 'satuan_paud', 'Margadana', 'Cabawan', 'Kelurahan Cabawan, Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Cabawan, Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('91a56dba-5435-4666-8a07-4e1997ab3cd9', 'Komunitas PAUD Kelurahan: Krandon, Kecamatan: Margadana', 'Komunitas PAUD Kelurahan: Krandon, Kecamatan: Margadana', 'satuan_paud', 'satuan_paud', 'Margadana', 'Krandon', 'Kelurahan Krandon, Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Krandon, Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('fac8a777-3e4d-4ec9-89c6-c07532782115', 'Komunitas PAUD Kelurahan: Pesurungan Lor, Kecamatan: Margadana', 'Komunitas PAUD Kelurahan: Pesurungan Lor, Kecamatan: Margadana', 'satuan_paud', 'satuan_paud', 'Margadana', 'Pesurungan Lor', 'Kelurahan Pesurungan Lor, Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Pesurungan Lor, Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('82514836-819c-4d2d-8dfc-75b5159cece5', 'Komunitas PAUD Kelurahan: Kalinyamat Kulon, Kecamatan: Margadana', 'Komunitas PAUD Kelurahan: Kalinyamat Kulon, Kecamatan: Margadana', 'satuan_paud', 'satuan_paud', 'Margadana', 'Kalinyamat Kulon', 'Kelurahan Kalinyamat Kulon, Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Kalinyamat Kulon, Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

INSERT INTO public.komunitas (id, nama, nama_komunitas, jenis, jenis_komunitas, kecamatan, kelurahan, lokasi, deskripsi, updated_at)
VALUES ('bbe72ff2-3fdf-4a50-87d9-2dc16eee3066', 'Komunitas PAUD Kelurahan: Sumurpanggang, Kecamatan: Margadana', 'Komunitas PAUD Kelurahan: Sumurpanggang, Kecamatan: Margadana', 'satuan_paud', 'satuan_paud', 'Margadana', 'Sumurpanggang', 'Kelurahan Sumurpanggang, Kecamatan Margadana, Kota Tegal', 'Komunitas koordinasi pendidik PAUD tingkat Kelurahan Sumurpanggang, Kecamatan Margadana, Kota Tegal.', now())
ON CONFLICT (id) DO UPDATE SET
  nama = EXCLUDED.nama,
  nama_komunitas = EXCLUDED.nama_komunitas,
  jenis = EXCLUDED.jenis,
  jenis_komunitas = EXCLUDED.jenis_komunitas,
  kecamatan = EXCLUDED.kecamatan,
  kelurahan = EXCLUDED.kelurahan,
  lokasi = EXCLUDED.lokasi,
  deskripsi = EXCLUDED.deskripsi,
  updated_at = now();

