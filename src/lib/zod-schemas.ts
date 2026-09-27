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
  tanggalLahir: z
    .string()
    .min(1, "Tanggal lahir anak wajib diisi"),
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
 * Skema Validasi Deteksi Dini Tumbuh Kembang (DDKS) / Antropometri
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

export type DdksInput = z.infer<typeof DdksSchema>;
export type DdksFormValues = DdksInput;
