"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/utils/supabase/server";
import {
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from "@/lib/zod-schemas";
import { sendJarimasWelcomeGreeting } from "@/app/actions/pertemanan";
import { isSuperAdmin as checkIsSuperAdmin, toValidUUID } from "@/lib/utils";
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
      } else if (
        errorMsg.toLowerCase().includes("rate limit") ||
        authError.status === 429
      ) {
        errorMessage =
          "Batas pengiriman email verifikasi Supabase telah tercapai (maksimal 3-4 email per jam pada layanan bawaan). Silakan tunggu beberapa saat, atau nonaktifkan 'Confirm email' di Dashboard Supabase agar pendaftaran langsung aktif.";
      } else {
        errorMessage = errorMsg;
      }

      return {
        success: false,
        message: errorMessage,
      };
    }

    // Jika user berhasil dibuat, sinkronkan profil pengguna menggunakan adminClient
    if (authData.user) {
      try {
        const isSuper = checkIsSuperAdmin({ email, nama_lengkap: namaLengkap, id: authData.user.id });
        const adminClient = createAdminClient() || supabase;
        await adminClient.from("profiles").upsert(
          {
            id: authData.user.id,
            nama_lengkap: namaLengkap,
            email: email,
            is_super_admin: isSuper,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

        // Setiap pengguna yang mendaftar dan belum bergabung ke komunitas manapun ditetapkan statusnya sebagai Pengunjung di Komunitas Warga Kota Tegal
        const kotaTegalId = toValidUUID("kom-warga-kota-tegal");
        await adminClient.from("anggota_komunitas").upsert(
          {
            user_id: authData.user.id,
            komunitas_id: kotaTegalId,
            peran: "Pengunjung",
            status: "approved",
            peran_diajukan: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,komunitas_id" }
        );
      } catch (profileErr) {
        console.warn("Gagal menyinkronkan profil pengguna:", profileErr);
      }
    }

    const isAutoConfirmed = Boolean(authData.session || authData.user?.email_confirmed_at);
    return {
      success: true,
      message: isAutoConfirmed
        ? "Pendaftaran berhasil! Akun Anda telah aktif dan siap digunakan. Silakan masuk."
        : "Pendaftaran berhasil! Akun Anda telah dibuat. Silakan masuk ke halaman login.",
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

    let authUserId: string | null = null;
    let authUserEmail = email;
    let authUserName = "";
    const isGmailUser = email.endsWith("@gmail.com");

    const adminClient = createAdminClient() || supabase;

    // Coba login dengan password jika password diisi
    if (password && password.trim().length > 0) {
      const { data: authData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (!signInError && authData?.user) {
        authUserId = authData.user.id;
        authUserEmail = authData.user.email || email;
        authUserName = authData.user.user_metadata?.nama_lengkap || "";
      } else {
        // Jika password salah / invalid, tetapi pengguna adalah akun Gmail atau sudah ada di profiles,
        // alihkan secara otomatis ke Direct Passwordless Login agar user tidak tertahan password lama
        const { data: profCheck } = await adminClient
          .from("profiles")
          .select("id, nama_lengkap, email")
          .ilike("email", email)
          .maybeSingle();

        if (!isGmailUser && !profCheck) {
          let errorMessage = "Email atau kata sandi yang Anda masukkan salah.";
          const errorMsg = signInError?.message || "";

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
          }

          return {
            success: false,
            message: errorMessage,
          };
        }
      }
    }

    // Jika belum login (karena password tidak diisi atau password lama tidak cocok tapi email terdaftar/Gmail)
    if (!authUserId) {
      // 1. Cek apakah pengguna sudah memiliki data di public.profiles
      const { data: existingProfile } = await adminClient
        .from("profiles")
        .select("id, nama_lengkap, email, is_super_admin, is_admin_pusat")
        .ilike("email", email)
        .maybeSingle();

      // Jika bukan Gmail dan belum pernah terdaftar di profiles, minta masukkan password
      if (!isGmailUser && !existingProfile) {
        return {
          success: false,
          message:
            "Email belum terdaftar. Silakan daftar terlebih dahulu atau masukkan kata sandi yang benar.",
        };
      }

      // 2. Cek apakah akun auth sudah ada di auth.users
      const { data: userList } = await adminClient.auth.admin.listUsers();
      let targetAuthUser = userList?.users?.find(
        (u) => u.email?.toLowerCase() === email.toLowerCase()
      );

      const displayName =
        existingProfile?.nama_lengkap ||
        email.split("@")[0].replace(/[._-]/g, " ");

      // 3. Jika belum ada di auth.users, buatkan secara otomatis
      if (!targetAuthUser) {
        try {
          const createPayload: any = {
            email: email.toLowerCase(),
            email_confirm: true,
            user_metadata: {
              nama_lengkap: displayName,
            },
          };

          // Gunakan ID yang sama jika sudah ada profil sebelumnya
          if (existingProfile?.id) {
            createPayload.id = existingProfile.id;
          }

          const { data: createdRes, error: createAuthErr } =
            await adminClient.auth.admin.createUser(createPayload);

          if (createAuthErr || !createdRes?.user) {
            // Coba tanpa custom ID jika terjadi bentrok ID
            const { data: fallbackRes, error: fallbackErr } =
              await adminClient.auth.admin.createUser({
                email: email.toLowerCase(),
                email_confirm: true,
                user_metadata: {
                  nama_lengkap: displayName,
                },
              });

            if (fallbackErr || !fallbackRes?.user) {
              console.error("Gagal auto-create auth user:", fallbackErr);
              return {
                success: false,
                message: "Gagal memproses akun email. Silakan coba kembali.",
              };
            }
            targetAuthUser = fallbackRes.user;
          } else {
            targetAuthUser = createdRes.user;
          }

          // Sinkronkan ke public.profiles
          const isSuper = checkIsSuperAdmin({
            email,
            nama_lengkap: displayName,
            id: targetAuthUser.id,
          });

          await adminClient.from("profiles").upsert(
            {
              id: targetAuthUser.id,
              nama_lengkap: displayName,
              email: email.toLowerCase(),
              is_super_admin: isSuper,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        } catch (createErr: any) {
          console.error("Kesalahan saat auto-register email:", createErr);
          return {
            success: false,
            message: "Terjadi kesalahan saat menyiapkan akun email.",
          };
        }
      }

      // 4. Generate Magic Link Token dari Admin Client
      const { data: linkData, error: linkErr } =
        await adminClient.auth.admin.generateLink({
          type: "magiclink",
          email: email.toLowerCase(),
        });

      if (linkErr || !linkData?.properties?.hashed_token) {
        console.error("Gagal generate magic link token:", linkErr);
        return {
          success: false,
          message: "Gagal membuat sesi login instan. Silakan coba lagi.",
        };
      }

      // 5. Verifikasi OTP langsung di server Next.js untuk membuat sesi cookie di browser
      const { data: verifyData, error: verifyErr } =
        await supabase.auth.verifyOtp({
          token_hash: linkData.properties.hashed_token,
          type: "magiclink",
        });

      if (verifyErr || !verifyData?.user) {
        console.error("Gagal verifikasi OTP login instan:", verifyErr);
        return {
          success: false,
          message: "Gagal mengaktifkan sesi login. Silakan coba lagi.",
        };
      }

      authUserId = verifyData.user.id;
      authUserEmail = verifyData.user.email || email;
      authUserName = displayName;
    }

    // Kirim salam pembuka dari akun Jarimas setiap kali pengguna berhasil login
    if (authUserId) {
      try {
        const { data: prof } = await adminClient
          .from("profiles")
          .select("nama_lengkap")
          .eq("id", authUserId)
          .maybeSingle();

        const greetingName = prof?.nama_lengkap || authUserName || "";
        await sendJarimasWelcomeGreeting(authUserId, greetingName);
      } catch (greetErr) {
        console.warn("Gagal mengirim salam pembuka Jarimas saat login:", greetErr);
      }
    }

    // Pengecekan Komunitas & Smart Redirection:
    // Pengguna yang sudah bergabung ke komunitas langsung diarahkan ke komunitasnya tanpa verifikasi apapun!
    let redirectDestination = "/";

    if (authUserId) {
      const isSuper = checkIsSuperAdmin({
        email: authUserEmail,
        nama_lengkap: authUserName,
        id: authUserId,
      });

      if (!isSuper) {
        const { data: memberships } = await adminClient
          .from("anggota_komunitas")
          .select("komunitas_id, status, peran")
          .eq("user_id", authUserId)
          .eq("status", "approved");

        // Cari komunitas spesifik (bukan sekadar pengunjung umum Kota Tegal)
        const specificCommunity = memberships?.find(
          (m: any) =>
            m.komunitas_id !== toValidUUID("kom-warga-kota-tegal") &&
            m.peran?.toLowerCase() !== "pengunjung"
        );

        if (specificCommunity?.komunitas_id) {
          // Langsung buka komunitasnya tanpa verifikasi tambahan!
          redirectDestination = `/komunitas/${specificCommunity.komunitas_id}`;
        } else if (memberships && memberships.length > 0) {
          // Jika ada komunitas terdaftar lainnya
          redirectDestination = `/komunitas/${memberships[0].komunitas_id}`;
        } else {
          // Bagi pengguna yang baru registrasi dan belum bergabung ke komunitasnya,
          // arahkan untuk memilih dan bergabung ke komunitas
          redirectDestination = "/komunitas";
        }
      }
    }

    revalidatePath("/", "layout");
    redirect(redirectDestination);

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

  return { success: false, message: "" };
}

/**
 * Server Action: Login / Registrasi Instan Menggunakan Google One Tap Credential (JWT)
 */
export async function loginWithGoogleOneTap(
  credential: string
): Promise<AuthActionState> {
  try {
    if (!credential) {
      return { success: false, message: "Kredensial Google tidak ditemukan." };
    }

    const parts = credential.split(".");
    if (parts.length !== 3) {
      return { success: false, message: "Format token Google tidak valid." };
    }

    let payload: any;
    try {
      payload = JSON.parse(
        Buffer.from(parts[1], "base64url").toString("utf8")
      );
    } catch {
      return { success: false, message: "Gagal memproses token autentikasi Google." };
    }

    const googleEmail = (payload.email as string)?.trim().toLowerCase();
    const isEmailVerified = Boolean(payload.email_verified);
    const googleName =
      (payload.name as string)?.trim() ||
      googleEmail.split("@")[0].replace(/[._-]/g, " ");
    const googlePicture = (payload.picture as string)?.trim() || null;

    if (!googleEmail || !isEmailVerified) {
      return {
        success: false,
        message: "Email Google tidak terverifikasi atau tidak valid.",
      };
    }

    let supabase;
    try {
      supabase = await createClient();
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }

    const adminClient = createAdminClient() || supabase;

    // 1. Cek apakah pengguna sudah ada di auth.users
    const { data: userList } = await adminClient.auth.admin.listUsers();
    let authUser = userList?.users?.find(
      (u) => u.email?.toLowerCase() === googleEmail
    );

    // 2. Cek apakah ada profil lama
    const { data: existingProfile } = await adminClient
      .from("profiles")
      .select("id, nama_lengkap, email, avatar_url, is_super_admin")
      .ilike("email", googleEmail)
      .maybeSingle();

    if (!authUser) {
      const createPayload: any = {
        email: googleEmail,
        email_confirm: true,
        user_metadata: {
          nama_lengkap: googleName,
          avatar_url: googlePicture,
        },
      };

      if (existingProfile?.id) {
        createPayload.id = existingProfile.id;
      }

      const { data: createdRes, error: createErr } =
        await adminClient.auth.admin.createUser(createPayload);

      if (createErr || !createdRes?.user) {
        const { data: fallbackRes, error: fbErr } =
          await adminClient.auth.admin.createUser({
            email: googleEmail,
            email_confirm: true,
            user_metadata: {
              nama_lengkap: googleName,
              avatar_url: googlePicture,
            },
          });

        if (fbErr || !fallbackRes?.user) {
          return {
            success: false,
            message: "Gagal membuat akun dengan Google: " + (fbErr?.message || ""),
          };
        }
        authUser = fallbackRes.user;
      } else {
        authUser = createdRes.user;
      }
    }

    // 3. Sinkronkan profil pengguna di public.profiles
    const isSuper = checkIsSuperAdmin({
      email: googleEmail,
      nama_lengkap: googleName,
      id: authUser.id,
    });

    await adminClient.from("profiles").upsert(
      {
        id: authUser.id,
        nama_lengkap: existingProfile?.nama_lengkap || googleName,
        email: googleEmail,
        avatar_url: existingProfile?.avatar_url || googlePicture,
        is_super_admin: isSuper,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    // 4. Generate Magic Link Token & Verifikasi di Server Next.js
    const { data: linkData, error: linkErr } =
      await adminClient.auth.admin.generateLink({
        type: "magiclink",
        email: googleEmail,
      });

    if (linkErr || !linkData?.properties?.hashed_token) {
      return {
        success: false,
        message: "Gagal membuat sesi login instan Google.",
      };
    }

    const { error: verifyErr } = await supabase.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    });

    if (verifyErr) {
      return {
        success: false,
        message: "Gagal memverifikasi sesi login Google.",
      };
    }

    // Kirim salam pembuka Jarimas
    try {
      await sendJarimasWelcomeGreeting(authUser.id, googleName);
    } catch {}

    revalidatePath("/", "layout");
    return {
      success: true,
      message: "Berhasil masuk dengan akun Google!",
    };
  } catch (err: any) {
    console.error("Error pada loginWithGoogleOneTap:", err);
    return {
      success: false,
      message: err?.message || "Terjadi kesalahan saat masuk dengan Google.",
    };
  }
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

/**
 * Server Action: Permintaan Lupa Kata Sandi (Kirim Tautan ke Email)
 */
export async function forgotPasswordUser(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    const rawData = {
      email: formData.get("email"),
    };

    const validationResult = ForgotPasswordSchema.safeParse(rawData);
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
        message: "Format email tidak valid.",
        errors: formattedErrors,
      };
    }

    const { email } = validationResult.data;

    let supabase;
    try {
      supabase = await createClient();
    } catch {
      return {
        success: false,
        message: NETWORK_ERROR_MESSAGE,
      };
    }

    const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://jarimas.id").replace(/\/$/, "");
    const redirectTo = `${siteUrl}/auth/callback?next=/reset-password`;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    if (resetError) {
      console.warn("Gagal mengirim email reset password:", resetError.message);
      return {
        success: false,
        message:
          resetError.message.includes("rate limit")
            ? "Terlalu banyak permintaan reset kata sandi. Mohon tunggu beberapa saat sebelum mencoba lagi."
            : resetError.message || "Gagal mengirim tautan atur ulang kata sandi.",
      };
    }

    return {
      success: true,
      message:
        "Tautan untuk mengatur ulang kata sandi telah dikirim ke email Anda. Silakan periksa Kotak Masuk (atau folder Spam) email Anda.",
    };
  } catch (err: any) {
    console.error("Error pada forgotPasswordUser:", err);
    return {
      success: false,
      message: err?.message || "Terjadi kesalahan saat memproses permintaan lupa kata sandi.",
    };
  }
}

/**
 * Server Action: Reset Kata Sandi Baru
 */
export async function resetPasswordUser(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    const rawData = {
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    };

    const validationResult = ResetPasswordSchema.safeParse(rawData);
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
        message: "Periksa kembali kata sandi baru yang dimasukkan.",
        errors: formattedErrors,
      };
    }

    const { password } = validationResult.data;

    let supabase;
    try {
      supabase = await createClient();
    } catch {
      return {
        success: false,
        message: NETWORK_ERROR_MESSAGE,
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      console.warn("Gagal memperbarui kata sandi:", updateError.message);
      return {
        success: false,
        message:
          updateError.message.includes("same_password")
            ? "Kata sandi baru tidak boleh sama dengan kata sandi sebelumnya."
            : updateError.message || "Gagal memperbarui kata sandi.",
      };
    }

    return {
      success: true,
      message: "Kata sandi Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.",
    };
  } catch (err: any) {
    console.error("Error pada resetPasswordUser:", err);
    return {
      success: false,
      message: err?.message || "Terjadi kesalahan saat mengatur ulang kata sandi.",
    };
  }
}

