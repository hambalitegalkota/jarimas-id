"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import type {
  GetRegisteredUsersResult,
  RegisteredUserItem,
  UserKomunitasAffiliation,
  PesanPribadi,
  Profile,
} from "@/types/database";

/**
 * Mengambil daftar pengguna yang telah registrasi di Jarimas-ID.
 * Fitur ini HANYA dapat diakses oleh pengguna yang sudah terautentikasi (login).
 */
export async function getRegisteredUsers(params?: {
  searchQuery?: string;
  tab?: "semua" | "teman" | "permintaan";
}): Promise<GetRegisteredUsersResult> {
  try {
    const supabase = await createClient();

    // 1. Verifikasi status autentikasi pengguna saat ini
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        isAuthenticated: false,
        currentUserId: null,
        users: [],
        totalCount: 0,
        totalFriendsCount: 0,
        totalPendingRequestsCount: 0,
      };
    }

    const currentUserId = user.id;

    // 2. Ambil semua profil pengguna yang terdaftar
    const { data: profiles, error: profileErr } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, email, nomor_hp, avatar_url, is_super_admin, created_at")
      .order("created_at", { ascending: false });

    if (profileErr || !profiles) {
      console.warn("Gagal mengambil profiles:", profileErr);
      return {
        isAuthenticated: true,
        currentUserId,
        users: [],
        totalCount: 0,
        totalFriendsCount: 0,
        totalPendingRequestsCount: 0,
      };
    }

    // 3. Ambil data keanggotaan komunitas seluruh pengguna untuk badge identitas
    let communityMap: Record<string, UserKomunitasAffiliation[]> = {};
    try {
      const { data: memberships } = await supabase
        .from("anggota_komunitas")
        .select(`
          user_id,
          peran,
          status,
          komunitas (
            id,
            nama,
            jenis,
            kecamatan,
            kelurahan,
            rw,
            rt
          )
        `)
        .eq("status", "approved");

      if (memberships) {
        memberships.forEach((m: any) => {
          if (!m.user_id || !m.komunitas) return;
          if (!communityMap[m.user_id]) {
            communityMap[m.user_id] = [];
          }
          communityMap[m.user_id].push({
            id: m.komunitas.id,
            nama: m.komunitas.nama || "Komunitas Warga",
            jenis: m.komunitas.jenis || "warga_kita",
            peran: m.peran || "Anggota",
            kecamatan: m.komunitas.kecamatan,
            kelurahan: m.komunitas.kelurahan,
            rw: m.komunitas.rw,
            rt: m.komunitas.rt,
          });
        });
      }
    } catch (commErr) {
      console.warn("Gagal memetakan komunitas user:", commErr);
    }

    // 4. Ambil relasi pertemanan yang melibatkan user saat ini
    let friendshipsMap: Record<
      string,
      {
        id: string;
        status: string;
        requested_by: string;
      }
    > = {};

    let totalFriendsCount = 0;
    let totalPendingRequestsCount = 0;

    try {
      const { data: friendships } = await supabase
        .from("pertemanan")
        .select("id, user_id, friend_id, status, requested_by")
        .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`);

      if (friendships) {
        friendships.forEach((f: any) => {
          const otherId = f.user_id === currentUserId ? f.friend_id : f.user_id;
          friendshipsMap[otherId] = {
            id: f.id,
            status: f.status,
            requested_by: f.requested_by,
          };

          if (f.status === "accepted") {
            totalFriendsCount++;
          } else if (f.status === "pending" && f.requested_by !== currentUserId) {
            totalPendingRequestsCount++;
          }
        });
      }
    } catch {
      // Graceful fallback jika tabel pertemanan belum dibuat
    }

    // 5. Ambil jumlah pesan belum terbaca untuk user saat ini
    let unreadMap: Record<string, number> = {};
    try {
      const { data: unreadList } = await supabase
        .from("pesan_pribadi")
        .select("sender_id")
        .eq("receiver_id", currentUserId)
        .eq("is_read", false);

      if (unreadList) {
        unreadList.forEach((m: any) => {
          unreadMap[m.sender_id] = (unreadMap[m.sender_id] || 0) + 1;
        });
      }
    } catch {
      // Graceful fallback jika tabel pesan_pribadi belum dibuat
    }

    // 6. Susun dan mapping daftar pengguna terdaftar lengkap
    let mappedUsers: RegisteredUserItem[] = profiles.map((p) => {
      let friendship_status: RegisteredUserItem["friendship_status"] = "none";
      let friendship_id: string | null = null;

      if (p.id === currentUserId) {
        friendship_status = "self";
      } else if (friendshipsMap[p.id]) {
        const f = friendshipsMap[p.id];
        friendship_id = f.id;
        if (f.status === "accepted") {
          friendship_status = "accepted";
        } else if (f.status === "pending") {
          friendship_status =
            f.requested_by === currentUserId ? "pending_sent" : "pending_received";
        }
      }

      return {
        id: p.id,
        nama_lengkap: p.nama_lengkap || "Warga Jarimas",
        email: p.email,
        nomor_hp: p.nomor_hp,
        avatar_url: p.avatar_url,
        is_super_admin: p.is_super_admin === true,
        created_at: p.created_at || new Date().toISOString(),
        komunitas_list: communityMap[p.id] || [],
        friendship_status,
        friendship_id,
        unread_messages_count: unreadMap[p.id] || 0,
      };
    });

    // 7. Filter berdasarkan pencarian jika ada
    if (params?.searchQuery) {
      const q = params.searchQuery.toLowerCase().trim();
      mappedUsers = mappedUsers.filter((u) => {
        const matchName = u.nama_lengkap.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchCommunity = u.komunitas_list?.some(
          (c) =>
            c.nama.toLowerCase().includes(q) ||
            c.peran.toLowerCase().includes(q) ||
            c.kecamatan?.toLowerCase().includes(q) ||
            c.kelurahan?.toLowerCase().includes(q)
        );
        return matchName || matchEmail || matchCommunity;
      });
    }

    // 8. Filter berdasarkan tab
    if (params?.tab === "teman") {
      mappedUsers = mappedUsers.filter((u) => u.friendship_status === "accepted");
    } else if (params?.tab === "permintaan") {
      mappedUsers = mappedUsers.filter((u) => u.friendship_status === "pending_received");
    }

    return {
      isAuthenticated: true,
      currentUserId,
      users: mappedUsers,
      totalCount: profiles.length,
      totalFriendsCount,
      totalPendingRequestsCount,
    };
  } catch (err) {
    console.error("Error pada getRegisteredUsers:", err);
    return {
      isAuthenticated: false,
      currentUserId: null,
      users: [],
      totalCount: 0,
      totalFriendsCount: 0,
      totalPendingRequestsCount: 0,
    };
  }
}

/**
 * Server Action: Mengirim permintaan pertemanan ke pengguna lain
 */
export async function sendFriendRequest(targetUserId: string): Promise<{
  success: boolean;
  message: string;
  friendshipId?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Silakan masuk terlebih dahulu untuk menambah teman.",
      };
    }

    if (user.id === targetUserId) {
      return {
        success: false,
        message: "Anda tidak dapat menambahkan diri sendiri sebagai teman.",
      };
    }

    // Cek apakah sudah ada pertemanan yang tersimpan
    const { data: existing } = await supabase
      .from("pertemanan")
      .select("id, status, requested_by")
      .or(
        `and(user_id.eq.${user.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${user.id})`
      )
      .maybeSingle();

    if (existing) {
      if (existing.status === "accepted") {
        return {
          success: true,
          message: "Anda dan pengguna ini sudah berteman.",
          friendshipId: existing.id,
        };
      }
      if (existing.status === "pending") {
        if (existing.requested_by === user.id) {
          return {
            success: true,
            message: "Permintaan pertemanan sudah terkirim sebelumnya.",
            friendshipId: existing.id,
          };
        } else {
          // Lawan bicara telah mengirim request, otomatis accept
          const { error: updateErr } = await supabase
            .from("pertemanan")
            .update({ status: "accepted", updated_at: new Date().toISOString() })
            .eq("id", existing.id);

          if (updateErr) {
            return {
              success: false,
              message: "Gagal menerima permintaan pertemanan: " + updateErr.message,
            };
          }

          revalidatePath("/");
          return {
            success: true,
            message: "Permintaan pertemanan diterima! Anda sekarang berteman.",
            friendshipId: existing.id,
          };
        }
      }
    }

    // Insert permintaan baru
    const { data: inserted, error: insertErr } = await supabase
      .from("pertemanan")
      .insert({
        user_id: user.id,
        friend_id: targetUserId,
        status: "pending",
        requested_by: user.id,
      })
      .select("id")
      .single();

    if (insertErr) {
      return {
        success: false,
        message: "Gagal mengirim permintaan pertemanan: " + insertErr.message,
      };
    }

    revalidatePath("/");
    return {
      success: true,
      message: "Permintaan pertemanan berhasil dikirim!",
      friendshipId: inserted?.id,
    };
  } catch (err: any) {
    console.error("Error sendFriendRequest:", err);
    return {
      success: false,
      message: err?.message || "Terjadi kesalahan sistem saat menambah teman.",
    };
  }
}

/**
 * Server Action: Menjawab permintaan pertemanan (Terima, Tolak, atau Batal)
 */
export async function respondFriendRequest(
  friendshipId: string,
  action: "accept" | "reject" | "cancel"
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Sesi login telah berakhir.",
      };
    }

    if (action === "accept") {
      const { error } = await supabase
        .from("pertemanan")
        .update({
          status: "accepted",
          updated_at: new Date().toISOString(),
        })
        .eq("id", friendshipId);

      if (error) {
        return { success: false, message: "Gagal menerima pertemanan: " + error.message };
      }

      revalidatePath("/");
      return { success: true, message: "Permintaan pertemanan berhasil diterima!" };
    }

    // Jika reject atau cancel, hapus baris pertemanan
    const { error } = await supabase.from("pertemanan").delete().eq("id", friendshipId);

    if (error) {
      return { success: false, message: "Gagal membatalkan pertemanan: " + error.message };
    }

    revalidatePath("/");
    return {
      success: true,
      message:
        action === "cancel"
          ? "Permintaan pertemanan dibatalkan."
          : "Permintaan pertemanan ditolak.",
    };
  } catch (err: any) {
    console.error("Error respondFriendRequest:", err);
    return {
      success: false,
      message: err?.message || "Terjadi kesalahan saat memproses permintaan pertemanan.",
    };
  }
}

/**
 * Server Action: Mengambil riwayat percakapan pribadi dengan pengguna target
 */
export async function getPrivateConversation(targetUserId: string): Promise<{
  success: boolean;
  message?: string;
  messages: PesanPribadi[];
  targetUser?: Profile | null;
  currentUserId?: string | null;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Silakan masuk terlebih dahulu untuk membaca percakapan.",
        messages: [],
      };
    }

    const currentUserId = user.id;

    // 1. Ambil data profil target
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id, nama_lengkap, email, nomor_hp, avatar_url, is_super_admin")
      .eq("id", targetUserId)
      .maybeSingle();

    // 2. Ambil riwayat pesan antara kedua pengguna
    const { data: rawMessages, error: msgErr } = await supabase
      .from("pesan_pribadi")
      .select(`
        id,
        sender_id,
        receiver_id,
        pesan,
        is_read,
        created_at,
        updated_at
      `)
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (msgErr) {
      console.warn("Gagal mengambil riwayat pesan:", msgErr);
      return {
        success: true,
        messages: [],
        targetUser: targetProfile,
        currentUserId,
      };
    }

    // 3. Tandai pesan dari target ke user saat ini sebagai sudah dibaca (is_read = true)
    try {
      await supabase
        .from("pesan_pribadi")
        .update({ is_read: true })
        .eq("sender_id", targetUserId)
        .eq("receiver_id", currentUserId)
        .eq("is_read", false);
    } catch {
      // Non-blocking update
    }

    return {
      success: true,
      messages: (rawMessages || []) as PesanPribadi[],
      targetUser: targetProfile,
      currentUserId,
    };
  } catch (err: any) {
    console.error("Error getPrivateConversation:", err);
    return {
      success: false,
      message: err?.message || "Gagal memuat percakapan.",
      messages: [],
    };
  }
}

/**
 * Server Action: Mengirim pesan pribadi ke pengguna lain
 */
export async function sendPrivateMessage(params: {
  receiverId: string;
  pesan: string;
}): Promise<{
  success: boolean;
  message: string;
  data?: PesanPribadi;
}> {
  try {
    const { receiverId, pesan } = params;
    const cleanPesan = (pesan || "").trim();

    if (!cleanPesan) {
      return {
        success: false,
        message: "Pesan tidak boleh kosong.",
      };
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "Silakan masuk terlebih dahulu untuk mengirim pesan.",
      };
    }

    if (user.id === receiverId) {
      return {
        success: false,
        message: "Anda tidak dapat mengirim pesan ke diri sendiri.",
      };
    }

    const { data: inserted, error: insertErr } = await supabase
      .from("pesan_pribadi")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        pesan: cleanPesan,
        is_read: false,
      })
      .select("id, sender_id, receiver_id, pesan, is_read, created_at")
      .single();

    if (insertErr) {
      return {
        success: false,
        message: "Gagal mengirim pesan: " + insertErr.message,
      };
    }

    return {
      success: true,
      message: "Pesan berhasil dikirim.",
      data: inserted as PesanPribadi,
    };
  } catch (err: any) {
    console.error("Error sendPrivateMessage:", err);
    return {
      success: false,
      message: err?.message || "Terjadi kesalahan saat mengirim pesan.",
    };
  }
}
