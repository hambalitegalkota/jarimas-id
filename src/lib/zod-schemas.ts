import { z } from "zod";

/**
 * Skema Validasi Registrasi Pengguna
 */
export const RegisterSchema = z.object({
  namaLengkap: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password maksimal 100 karakter"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type RegisterFormValues = RegisterInput;

/**
 * Skema Validasi Login Pengguna
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type LoginFormValues = LoginInput;

/**
 * Skema Validasi Data Anak / Profil Anak
 */
export const DataAnakSchema = z.object({
  namaLengkap: z
    .string()
    .trim()
    .min(2, "Nama lengkap anak minimal 2 karakter")
    .max(100, "Nama lengkap anak maksimal 100 karakter"),
  usia: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  tanggalLahir: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  jenisKelamin: z.enum(["L", "P", "Laki-laki", "Perempuan"], {
    message: "Pilih jenis kelamin yang valid (L/P)",
  }),
  namaOrangtua: z
    .string()
    .trim()
    .min(2, "Nama orang tua / wali minimal 2 karakter")
    .max(100, "Nama orang tua / wali maksimal 100 karakter"),
  nomorHp: z
    .string()
    .trim()
    .min(10, "Nomor HP minimal 10 digit")
    .max(16, "Nomor HP maksimal 16 digit")
    .regex(/^(\+62|62|0)[0-9]{8,14}$/, "Format nomor HP tidak valid (contoh: 081234567890)"),
  tinggalBersama: z
    .string()
    .trim()
    .min(1, "Status tinggal bersama wajib diisi"),
  jarakRumahKm: z.coerce
    .number()
    .min(0, "Jarak rumah minimal 0 km")
    .max(500, "Jarak rumah maksimal 500 km"),
  isSekolah: z.boolean({
    message: "Status sekolah wajib dipilih",
  }),
  namaSekolah: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  alasanSekolah: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type DataAnakInput = z.infer<typeof DataAnakSchema>;
export type DataAnakFormValues = DataAnakInput;

/**
 * Skema Validasi Anak Tidak Sekolah (ATS)
 */
export const DataAtsSchema = z.object({
  namaLengkap: z
    .string()
    .trim()
    .min(2, "Nama lengkap anak minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  usia: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  tanggalLahir: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  jenisKelamin: z.enum(["L", "P", "Laki-laki", "Perempuan"], {
    message: "Pilih jenis kelamin anak (Laki-laki / Perempuan)",
  }),
  namaOrangtua: z
    .string()
    .trim()
    .min(2, "Nama orang tua / wali minimal 2 karakter")
    .max(100, "Nama orang tua maksimal 100 karakter"),
  nomorHp: z
    .string()
    .trim()
    .min(10, "Nomor HP minimal 10 digit")
    .max(16, "Nomor HP maksimal 16 digit")
    .regex(/^(\+62|62|0)[0-9]{8,14}$/, "Format nomor HP tidak valid (contoh: 081234567890)"),
  tinggalBersama: z
    .string()
    .trim()
    .min(1, "Status tinggal bersama wajib diisi"),
  alamat: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  rt: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  rw: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  kelurahan: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  kecamatan: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  sekolahSebelumnya: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  kelasTerakhir: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  keinginanSekolah: z.enum(["Masih Ada", "Tidak Ada"], {
    message: "Keinginan untuk melanjutkan sekolah wajib dipilih",
  }),
  alasanTidakSekolah: z
    .string()
    .trim()
    .min(1, "Alasan tidak sekolah wajib dipilih"),
  keterangan: z
    .string()
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type DataAtsInput = z.infer<typeof DataAtsSchema>;
export type DataAtsFormValues = DataAtsInput;

/**
 * Skema Validasi Deteksi Dini Tumbuh Kembang (DDTK / DDKS) / Antropometri
 */
export const DdksSchema = z.object({
  beratBadan: z.coerce
    .number()
    .positive("Berat badan harus lebih dari 0 kg")
    .max(150, "Berat badan maksimal 150 kg"),
  tinggiBadan: z.coerce
    .number()
    .positive("Tinggi badan harus lebih dari 0 cm")
    .max(250, "Tinggi badan maksimal 250 cm"),
  panjangBadan: z.coerce
    .number()
    .positive("Panjang badan harus lebih dari 0 cm")
    .max(250, "Panjang badan maksimal 250 cm")
    .optional()
    .nullable(),
  lingkarKepala: z.coerce
    .number()
    .positive("Lingkar kepala harus lebih dari 0 cm")
    .max(100, "Lingkar kepala maksimal 100 cm"),
});

export const DdtkSchema = DdksSchema;
export type DdksInput = z.infer<typeof DdksSchema>;
export type DdksFormValues = DdksInput;
export type DdtkInput = DdksInput;
export type DdtkFormValues = DdksFormValues;

/**
 * Skema Validasi Kabar Warga
 */
export const KabarSchema = z.object({
  konten: z
    .string()
    .trim()
    .min(3, "Konten kabar minimal 3 karakter")
    .max(2000, "Konten kabar maksimal 2000 karakter"),
  visibilitas: z.enum(["publik", "teman", "komunitas"], {
    message: "Pilih visibilitas postingan yang valid",
  }),
  komunitas_id: z.string().uuid("ID Komunitas tidak valid").optional().nullable(),
  komentar_dinonaktifkan: z.boolean().optional(),
});

export type KabarInput = z.infer<typeof KabarSchema>;

/**
 * Skema Validasi Komentar Kabar
 */
export const KomentarSchema = z.object({
  kabarId: z.string().min(1, "ID Kabar wajib diisi"),
  konten: z
    .string()
    .trim()
    .min(1, "Komentar tidak boleh kosong")
    .max(500, "Komentar maksimal 500 karakter"),
  visibilitas: z.enum(["publik", "pembuat_kabar"]).default("publik"),
  parentId: z.string().uuid("ID Parent Komentar tidak valid").optional().nullable(),
});

export type KomentarInput = z.infer<typeof KomentarSchema>;

/**
 * Skema Validasi Pemesanan Jarimas Market
 */
export const PesananSchema = z.object({
  produkId: z.string().min(1, "ID Produk wajib diisi"),
  jumlah: z.coerce.number().int().positive("Jumlah pesanan minimal 1 unit"),
  namaPenerima: z
    .string()
    .trim()
    .min(2, "Nama penerima minimal 2 karakter")
    .max(100, "Nama penerima maksimal 100 karakter"),
  nomorHp: z
    .string()
    .trim()
    .min(10, "Nomor HP minimal 10 digit")
    .max(16, "Nomor HP maksimal 16 digit")
    .regex(/^(\+62|62|0)[0-9]{8,14}$/, "Format nomor HP tidak valid (contoh: 081234567890)"),
  alamatLengkap: z
    .string()
    .trim()
    .min(5, "Alamat lengkap pengiriman minimal 5 karakter")
    .max(300, "Alamat lengkap pengiriman maksimal 300 karakter"),
  kecamatan: z.string().trim().min(2, "Kecamatan wajib dipilih"),
  kelurahan: z.string().trim().min(2, "Kelurahan wajib dipilih"),
  catatan: z.string().trim().max(300, "Catatan maksimal 300 karakter").optional().nullable(),
  metodePembayaran: z.enum(["qris", "transfer_bca", "transfer_mandiri", "transfer_bri"], {
    message: "Metode pembayaran tidak valid",
  }),
});

export type PesananInput = z.infer<typeof PesananSchema>;

/**
 * Skema Validasi Produk Jarimas Market
 */
export const MarketProdukSchema = z.object({
  id: z.string().optional().nullable(),
  nama: z
    .string()
    .trim()
    .min(3, "Nama produk minimal 3 karakter")
    .max(150, "Nama produk maksimal 150 karakter"),
  deskripsi: z
    .string()
    .trim()
    .min(5, "Deskripsi produk minimal 5 karakter")
    .max(2000, "Deskripsi produk maksimal 2000 karakter"),
  kategori: z.enum([
    "Kesehatan & Gizi",
    "Alat Posyandu",
    "Edukasi PAUD",
    "Merchandise & Seragam",
    "Buku & Modul",
  ]),
  harga: z.coerce.number().int().positive("Harga produk harus lebih dari 0"),
  stok: z.coerce.number().int().min(0, "Stok tidak boleh bernilai negatif"),
  gambarUrl: z.string().url("URL gambar tidak valid").or(z.literal("")),
  isActive: z.boolean().default(true),
  beratGram: z.coerce.number().int().positive().optional().nullable(),
});

export type MarketProdukInput = z.infer<typeof MarketProdukSchema>;
