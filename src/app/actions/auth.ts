"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { RegisterSchema, LoginSchema } from "@/lib/zod-schemas";
import type { AuthActionState } from "@/types/database";

const NETWORK_ERROR_MESSAGE =
  "Gagal terhubung ke server Supabase. Pastikan file .env.local sudah diisi dengan benar dan server Next.js telah di-restart.";

/**
 * Server Action: Registrasi Pengguna Baru
 */
export async function registerUser(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    const rawData = {
      namaLengkap: formData.get("namaLengkap"),
      email: formData.get("email"),
      password: formData.get("password"),
    };

    // Validasi data dengan Zod
    const validationResult = RegisterSchema.safeParse(rawData);
    if (!validationResult.success) {
      const formattedErrors: Record<string, string[]> = {};
      for (const issue of validationResult.error.issues) {
        const field = issue.path[0] as string;
        if (!formattedErrors[field]) {
          formattedErrors[field] = [];
        }
        formattedErrors[field].push(issue.message);
      }
      return {
        success: false,
        message: "Mohon periksa kembali formulir pendaftaran Anda.",
        errors: formattedErrors,
      };
    }

    const { namaLengkap, email, password } = validationResult.data;

    let supabase;
    try {
      supabase = await createClient();
    } catch (clientErr: any) {
      return {
        success: false,
        message: NETWORK_ERROR_MESSAGE,
      };
    }

    // Panggil Supabase Auth SignUp di dalam try-catch
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nama_lengkap: namaLengkap,
        },
      },
    });

    if (authError) {
      let errorMessage = "Terjadi kesalahan saat mendaftar. Silakan coba lagi.";
      const errorMsg = authError.message || "";

      if (
        errorMsg.includes("fetch failed") ||
        errorMsg.includes("ENOTFOUND") ||
        errorMsg.includes("ECONNREFUSED") ||
        errorMsg.includes("Failed to fetch") ||
        errorMsg.includes("TypeError") ||
        errorMsg.includes("network")
      ) {
        errorMessage = NETWORK_ERROR_MESSAGE;
      } else if (
        errorMsg.includes("User already registered") ||
        authError.status === 422 ||
        (authError as any).code === "user_already_exists"
      ) {
        errorMessage =
          "Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.";
      } else if (errorMsg.includes("Password")) {
        errorMessage = "Format kata sandi tidak memenuhi kriteria keamanan.";
      } else {
        errorMessage = errorMsg;
      }

      return {
        success: false,
        message: errorMessage,
      };
    }

    // Jika user berhasil dibuat dan Supabase session aktif
    if (authData.user) {
      try {
        await supabase.from("profiles").upsert(
          {
            id: authData.user.id,
            nama_lengkap: namaLengkap,
            email: email,
            is_super_admin: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );
      } catch (profileErr) {
        console.warn("Gagal menyinkronkan profil pengguna:", profileErr);
      }
    }

    return {
      success: true,
      message:
        "Pendaftaran berhasil! Silakan periksa email Anda untuk melakukan konfirmasi akun.",
    };
  } catch (err: any) {
    console.error("Error pada registerUser:", err);
    const errMessage = err?.message || "";

    if (
      errMessage.includes("Supabase Environment Variables tidak ditemukan") ||
      errMessage.includes("fetch failed") ||
      errMessage.includes("ENOTFOUND") ||
      errMessage.includes("ECONNREFUSED") ||
      errMessage.includes("Failed to fetch") ||
      errMessage.includes("TypeError")
    ) {
      return {
        success: false,
        message: NETWORK_ERROR_MESSAGE,
      };
    }

    return {
      success: false,
      message:
        errMessage || "Terjadi kesalahan pada sistem saat registrasi.",
    };
  }
}

/**
 * Server Action: Login Pengguna
 */
export async function loginUser(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  let shouldRedirect = false;

  try {
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    // Validasi data dengan Zod
    const validationResult = LoginSchema.safeParse(rawData);
    if (!validationResult.success) {
      const formattedErrors: Record<string, string[]> = {};
      for (const issue of validationResult.error.issues) {
        const field = issue.path[0] as string;
        if (!formattedErrors[field]) {
          formattedErrors[field] = [];
        }
        formattedErrors[field].push(issue.message);
      }
      return {
        success: false,
        message: "Email atau kata sandi tidak boleh kosong.",
        errors: formattedErrors,
      };
    }

    const { email, password } = validationResult.data;

    let supabase;
    try {
      supabase = await createClient();
    } catch (clientErr: any) {
      return {
        success: false,
        message: NETWORK_ERROR_MESSAGE,
      };
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      let errorMessage = "Email atau kata sandi yang Anda masukkan salah.";
      const errorMsg = signInError.message || "";

      if (
        errorMsg.includes("fetch failed") ||
        errorMsg.includes("ENOTFOUND") ||
        errorMsg.includes("ECONNREFUSED") ||
        errorMsg.includes("Failed to fetch") ||
        errorMsg.includes("TypeError")
      ) {
        errorMessage = NETWORK_ERROR_MESSAGE;
      } else if (errorMsg.includes("Email not confirmed")) {
        errorMessage =
          "Email Anda belum dikonfirmasi. Silakan periksa kotak masuk email Anda.";
      } else if (errorMsg.includes("Invalid login credentials")) {
        errorMessage = "Email atau kata sandi tidak cocok.";
      } else {
        errorMessage = errorMsg;
      }

      return {
        success: false,
        message: errorMessage,
      };
    }

    shouldRedirect = true;
  } catch (err: any) {
    if (
      err?.message === "NEXT_REDIRECT" ||
      err?.digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw err;
    }

    console.error("Error pada loginUser:", err);
    const errMessage = err?.message || "";

    if (
      errMessage.includes("Supabase Environment Variables tidak ditemukan") ||
      errMessage.includes("fetch failed") ||
      errMessage.includes("ENOTFOUND") ||
      errMessage.includes("ECONNREFUSED") ||
      errMessage.includes("Failed to fetch") ||
      errMessage.includes("TypeError")
    ) {
      return {
        success: false,
        message: NETWORK_ERROR_MESSAGE,
      };
    }

    return {
      success: false,
      message: errMessage || "Terjadi kesalahan saat masuk.",
    };
  }

  if (shouldRedirect) {
    revalidatePath("/", "layout");
    redirect("/profil");
  }

  return { success: false, message: "" };
}

/**
 * Server Action: Logout Pengguna
 */
export async function logoutUser(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.warn("Logout error:", err);
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
