export type UserRole = "Super Admin" | "Admin Pusat" | "Pengurus" | "Kader" | "Anggota" | "Pengunjung";
export type MembershipStatus = "pending" | "approved" | "rejected";
export type VisibilitasKabar = "publik" | "teman" | "komunitas";
export type SortingKabar = "terbaru" | "terpopuler";
export type JenisKomunitas = "warga_kita" | "posyandu" | "satuan_paud" | "bidang_spm";

export const JARIMAS_BOT_ID = "00000000-0000-0000-0000-000000000001";
export const JARIMAS_BOT_NAME = "Jarimas";

export interface Profile {
  id: string;
  nama_lengkap: string;
  email: string;
  is_super_admin: boolean;
  is_admin_pusat?: boolean;
  role_level?: "root_super_admin" | "admin_pusat" | "user";
  avatar_url?: string | null;
  nomor_hp?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface KaderBidangItem {
  nama: string;
  wa: string;
}

export type BidangSpmType =
  | "Pendidikan"
  | "Kesehatan"
  | "Pekerjaan Umum"
  | "Perumahan Rakyat"
  | "Trantibum Linmas"
  | "Sosial";

export type JenisKegiatanLaporan =
  | "Pendataan"
  | "Verifikasi dan Validasi"
  | "Penyuluhan, Edukasi dan Motivasi"
  | "Penyaluran Aspirasi";

export interface LaporanKaderSpmItem {
  id: string;
  komunitas_id: string;
  user_id: string;
  posyandu_nama: string;
  kelurahan: string;
  kecamatan: string;
  kota: string;
  bidang: BidangSpmType | string;
  bulan: string;
  tahun: number;
  tanggal_laporan: string;
  nama_kader: string;
  nomor_hp_kader?: string | null;
  jenis_kegiatan: (JenisKegiatanLaporan | string)[];
  narasi_pendataan?: string | null;
  narasi_verifikasi_validasi?: string | null;
  narasi_penyuluhan_edukasi?: string | null;
  narasi_penyaluran_aspirasi?: string | null;
  status: "draft" | "terkirim" | "diverifikasi" | string;
  catatan_admin?: string | null;
  created_at: string;
  updated_at?: string;
  profiles?: {
    id: string;
    nama_lengkap: string;
    email?: string;
    avatar_url?: string | null;
  } | null;
}

export interface KontakKomunitasDetail {
  utama: string;
  kader_pendidikan: KaderBidangItem;
  kader_kesehatan: KaderBidangItem;
  kader_pekerjaan_umum: KaderBidangItem;
  kader_perumahan_rakyat: KaderBidangItem;
  kader_trantipbumlinmas: KaderBidangItem;
  kader_sosial: KaderBidangItem;
}

export interface Komunitas {
  id: string;
  nama: string;
  jenis: JenisKomunitas | string;
  jenis_institusi?: "TK" | "KB" | "RA" | "SPS" | "TPA" | "PKBM" | "SKB" | string;
  npsn?: string;
  kecamatan?: string;
  kelurahan?: string;
  rt?: string | null;
  rw?: string | null;
  lokasi: string;
  deskripsi?: string | null;
  logo_url?: string | null;
  kontak?: string | null;
  kontak_detail?: KontakKomunitasDetail | null;
  jadwal?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AnggotaKomunitas {
  id: string;
  user_id: string;
  komunitas_id: string;
  peran: string;
  status: MembershipStatus;
  approved_by?: string | null;
  created_at: string;
  updated_at?: string;
  komunitas?: Komunitas | null;
}

export interface AnggotaKomunitasDetail {
  id: string;
  user_id: string;
  komunitas_id: string;
  peran: string;
  peran_diajukan?: string | null;
  berdomisili?: boolean;
  kk_terdaftar?: boolean;
  status: MembershipStatus;
  created_at: string;
  profiles?: {
    id?: string;
    nama_lengkap?: string;
    email?: string;
    avatar_url?: string | null;
  } | null;
}

export interface HierarchyAdminTierInfo {
  level: "rt" | "rw" | "kelurahan" | "kecamatan" | "kota";
  levelLabel: string;
  title: string;
  komunitasId: string;
  komunitasNama: string;
  adminName: string | null;
  hasAdmin: boolean;
  canApply: boolean;
  userStatusAtTier?: {
    status: MembershipStatus;
    peran: string;
    peran_diajukan?: string | null;
  } | null;
}

export interface WargaHierarchyAdmins {
  kota?: HierarchyAdminTierInfo | null;
  kecamatan?: HierarchyAdminTierInfo | null;
  kelurahan?: HierarchyAdminTierInfo | null;
  rw?: HierarchyAdminTierInfo | null;
  rt?: HierarchyAdminTierInfo | null;
}

export interface KomunitasWithMembership extends Komunitas {
  jumlah_anggota: number;
  hasAdmin?: boolean;
  adminName?: string | null;
  adminRole?: string | null;
  currentUserMembership?: {
    id: string;
    status: MembershipStatus;
    peran: string;
    peran_diajukan?: string | null;
    berdomisili?: boolean;
    kk_terdaftar?: boolean;
  } | null;
  hierarchyAdmins?: WargaHierarchyAdmins | null;
  hierarchyAdminList?: HierarchyAdminTierInfo[];
}

export interface UserJoinedKomunitas {
  id: string;
  membershipId: string;
  nama: string;
  jenis: JenisKomunitas | string;
  kecamatan?: string | null;
  kelurahan?: string | null;
  rt?: string | null;
  rw?: string | null;
  lokasi?: string | null;
  deskripsi?: string | null;
  logo_url?: string | null;
  kontak?: string | null;
  jadwal?: string | null;
  status: MembershipStatus;
  peran: string;
  peran_diajukan?: string | null;
  berdomisili?: boolean;
  kk_terdaftar?: boolean;
  hasAdmin?: boolean;
  adminName?: string | null;
  adminRole?: string | null;
  joinedAt: string;
  jumlah_anggota: number;
}

export interface DdksRecord {
  id: string;
  data_anak_id: string;
  berat_badan: number;
  tinggi_badan: number;
  panjang_badan?: number | null;
  lingkar_kepala: number;
  catatan?: string | null;
  recorded_by?: string;
  created_at: string;
  profiles?: {
    nama_lengkap?: string;
  } | null;
}

// DDTK (Deteksi Dini Tumbuh Kembang) alias for DDKS
export type DdtkRecord = DdksRecord;

export const USIA_OPTIONS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "24>",
] as const;

export type UsiaOption = typeof USIA_OPTIONS[number];

// Opsi Jenjang Sekolah Sebelumnya / Asal untuk Data ATS
export const JENJANG_SEKOLAH_ASAL_OPTIONS = [
  "Belum Pernah Bersekolah",
  "SD / MI / Paket A Putus Sekolah / DO",
  "SD / MI / Paket A Lulus Tidak Melanjutkan",
  "SMP / MTs / Paket B Putus Sekolah / DO",
  "SMP / MTs / Paket B Lulus Tidak Melanjutkan",
  "SMA / SMK / MA / Paket C Putus Sekolah",
] as const;

export type JenjangSekolahAsalOption = typeof JENJANG_SEKOLAH_ASAL_OPTIONS[number];

// Opsi Usia khusus Data ATS (Rentang usia ATS 6 s/d 18 tahun + lanjutan PKBM/Dewasa)
export const USIA_ATS_OPTIONS = [
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "13",
  "14",
  "15",
  "16",
  "17",
  "18",
  "19",
  "20",
  "21",
  "22",
  "23",
  "24",
  "25",
  "25>",
] as const;

export type UsiaAtsOption = typeof USIA_ATS_OPTIONS[number];

export interface DataAnakItem {
  id: string;
  nama_lengkap: string;
  tanggal_lahir: string;
  usia?: string;
  jenis_kelamin: "L" | "P" | "Laki-laki" | "Perempuan" | string;
  nama_orangtua: string;
  nomor_hp: string;
  tinggal_bersama: string;
  jarak_rumah_km: number;
  is_sekolah: boolean;
  nama_sekolah?: string | null;
  alasan_sekolah?: string | null;

  // Alamat Sesuai KK (Kartu Keluarga)
  kk_kabupaten?: string | null;
  kk_kecamatan?: string | null;
  kk_kelurahan?: string | null;
  kk_rw?: string | null;
  kk_rt?: string | null;
  kk_jalan?: string | null;

  // Alamat Domisili (Tempat Tinggal)
  domisili_kabupaten?: string | null;
  domisili_kecamatan?: string | null;
  domisili_kelurahan?: string | null;
  domisili_rw?: string | null;
  domisili_rt?: string | null;
  domisili_jalan?: string | null;

  komunitas_id: string;
  komunitas_nama?: string;
  status_approval: "pending" | "approved" | "rejected";
  validated_by?: string | null;
  validated_at?: string | null;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  latest_ddks?: DdksRecord | null;
  ddks_history?: DdksRecord[];
  latest_ddtk?: DdtkRecord | null;
  ddtk_history?: DdtkRecord[];
}

export const ALASAN_TIDAK_SEKOLAH_LIST = [
  "Tidak mau sekolah lagi",
  "Tidak ada biaya",
  "Melanjutkan ke Pondok Pesantren atau lainnya",
  "Pindah Domisili",
  "Masalah Kesehatan / Disabilitas",
  "Bekerja",
  "Pengaruh lingkungan",
  "Menikah",
  "Korban perundungan",
  "Anak bermasalah dengan hukum",
  "Anak orang tua bermasalah dengan hukum",
  "Beranggapan sekolah tidak penting",
  "Cukup dengan pendidikan yang sekarang",
  "Data tidak ditemukan",
  "Bukan Warga RT",
  "Meninggal dunia",
  "Lainnya",
] as const;

export type AlasanTidakSekolah = typeof ALASAN_TIDAK_SEKOLAH_LIST[number] | string;

export interface DataAtsItem {
  id: string;
  nama_lengkap: string;
  tanggal_lahir: string;
  usia?: string;
  jenis_kelamin: "L" | "P" | "Laki-laki" | "Perempuan" | string;
  nama_orangtua: string;
  nomor_hp: string;
  tinggal_bersama: string;
  alamat?: string | null;
  rt?: string | null;
  rw?: string | null;
  kelurahan?: string | null;
  kecamatan?: string | null;
  sekolah_sebelumnya?: string | null;
  jenjang_asal?: string | null;
  kelas_terakhir?: string | null;
  keinginan_sekolah: "Masih Ada" | "Tidak Ada";
  alasan_tidak_sekolah: AlasanTidakSekolah;
  keterangan?: string | null;
  komunitas_id: string;
  komunitas_nama?: string;
  status_approval: "pending" | "approved" | "rejected";
  validated_by?: string | null;
  validated_at?: string | null;
  created_by?: string;
  created_at: string;
  updated_at?: string;
  latest_ddtk?: DdtkRecord | null;
  ddtk_history?: DdtkRecord[];
}

export interface PendingApprovalItem {
  id: string;
  user_id: string;
  komunitas_id: string;
  peran: string;
  peran_diajukan?: string | null;
  status: MembershipStatus;
  created_at: string;
  tierLevel?: "RT" | "RW" | "Kelurahan" | "Kecamatan" | "Kota" | "Posyandu" | "Satuan PAUD" | "Umum";
  targetApproverTitle?: string;
  berdomisili?: boolean;
  kk_terdaftar?: boolean;
  canApprove?: boolean;
  profiles?: {
    id?: string;
    nama_lengkap?: string;
    email?: string;
    nomor_hp?: string | null;
    avatar_url?: string | null;
  } | null;
  komunitas?: {
    id?: string;
    nama?: string;
    jenis?: string;
    lokasi?: string;
    kecamatan?: string | null;
    kelurahan?: string | null;
    rw?: string | null;
    rt?: string | null;
  } | null;
}

export interface ReaksiKabar {
  id: string;
  kabar_id: string;
  user_id: string;
  tipe_reaksi: string; // '❤️' | '👍' | '🙏' | '😊'
  created_at?: string;
}

export type VisibilitasKomentar = "publik" | "pembuat_kabar";

export interface KomentarKabar {
  id: string;
  kabar_id: string;
  user_id: string;
  konten: string;
  visibilitas?: VisibilitasKomentar | string;
  parent_id?: string | null;
  created_at: string;
  profiles?: {
    id?: string;
    nama_lengkap?: string;
    avatar_url?: string | null;
  } | null;
}

export interface KabarItem {
  id: string;
  user_id: string;
  konten: string;
  visibilitas: VisibilitasKabar;
  komentar_dinonaktifkan?: boolean;
  komunitas_id?: string | null;
  created_at: string;
  updated_at?: string;
  profiles?: {
    id?: string;
    nama_lengkap?: string;
    avatar_url?: string | null;
    is_super_admin?: boolean;
  } | null;
  komunitas?: {
    id?: string;
    nama?: string;
  } | null;
  jumlah_reaksi: number;
  jumlah_komentar: number;
  reaksi_counts: Record<string, number>;
  user_reaction?: string | null;
  komentar_list: KomentarKabar[];
}

export interface AuthActionState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface AdminActionState {
  success: boolean;
  message: string;
  data?: PendingApprovalItem[];
}

export type KategoriMarket =
  | "Kesehatan & Gizi"
  | "Alat Posyandu"
  | "Edukasi PAUD"
  | "Merchandise & Seragam"
  | "Buku & Modul";

export type StatusPesanan =
  | "pending"
  | "diproses"
  | "dikirim"
  | "selesai"
  | "dibatalkan";

export type MetodePembayaran =
  | "qris"
  | "transfer_bca"
  | "transfer_mandiri"
  | "transfer_bri";

export interface MarketProduk {
  id: string;
  nama: string;
  deskripsi: string;
  kategori: KategoriMarket | string;
  harga: number;
  stok: number;
  gambar_url: string;
  is_active: boolean;
  berat_gram?: number;
  created_at?: string;
  updated_at?: string;
}

export interface MarketPesanan {
  id: string;
  user_id: string;
  produk_id: string;
  jumlah: number;
  total_harga: number;
  status_pembayaran: StatusPesanan;
  metode_pembayaran: MetodePembayaran | string;
  nama_penerima: string;
  nomor_hp: string;
  alamat_lengkap: string;
  kecamatan: string;
  kelurahan: string;
  catatan?: string | null;
  nomor_resi?: string | null;
  bukti_bayar_url?: string | null;
  created_at: string;
  updated_at?: string;
  produk?: MarketProduk | null;
  profiles?: {
    id?: string;
    nama_lengkap?: string;
    email?: string;
    nomor_hp?: string | null;
  } | null;
}

// ==============================================================================
// Tipe Data Fitur Pertemanan & Percakapan Pribadi (Chat)
// ==============================================================================
export type StatusPertemanan = "pending" | "accepted" | "rejected" | "blocked";

export interface Pertemanan {
  id: string;
  user_id: string;
  friend_id: string;
  status: StatusPertemanan;
  requested_by: string;
  created_at: string;
  updated_at?: string;
  friend_profile?: Profile | null;
  user_profile?: Profile | null;
}

export interface PesanPribadi {
  id: string;
  sender_id: string;
  receiver_id: string;
  pesan: string;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
  sender_profile?: Profile | null;
  receiver_profile?: Profile | null;
}

export interface UserKomunitasAffiliation {
  id: string;
  nama: string;
  jenis: string;
  peran: string;
  kecamatan?: string;
  kelurahan?: string;
  rw?: string | null;
  rt?: string | null;
}

export interface RegisteredUserItem {
  id: string;
  nama_lengkap: string;
  email?: string | null;
  nomor_hp?: string | null;
  avatar_url?: string | null;
  is_super_admin: boolean;
  is_admin_pusat?: boolean;
  created_at: string;
  komunitas_list?: UserKomunitasAffiliation[];
  friendship_status?: "none" | "pending_sent" | "pending_received" | "accepted" | "self";
  friendship_id?: string | null;
  unread_messages_count?: number;
}

export interface GetRegisteredUsersResult {
  isAuthenticated: boolean;
  isSuperAdmin?: boolean;
  isAdminPusat?: boolean;
  currentUserId?: string | null;
  users: RegisteredUserItem[];
  totalCount: number;
  totalFriendsCount: number;
  totalPendingRequestsCount: number;
  userCommunitiesCount?: number;
}

export interface PesanGrup {
  id: string;
  komunitas_id: string;
  user_id: string;
  pesan: string;
  created_at: string;
  updated_at?: string;
  profiles?: Profile | null;
  user_role?: string | null;
}

export interface GrupChatRoom {
  id: string;
  nama: string;
  jenis: string;
  deskripsi?: string | null;
  logo_url?: string | null;
  kecamatan?: string;
  kelurahan?: string;
  rw?: string | null;
  rt?: string | null;
  jumlah_anggota: number;
  last_message?: {
    pesan: string;
    sender_name: string;
    created_at: string;
  } | null;
  is_member?: boolean;
}

export interface RecentConversationItem {
  partnerId: string;
  partnerName: string;
  partnerAvatar?: string | null;
  partnerRole?: string;
  partnerCommunity?: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isLastMessageMine: boolean;
  friendshipStatus?: "none" | "pending_sent" | "pending_received" | "accepted" | "self";
  friendshipId?: string | null;
}

export interface IncomingMessageNotificationItem {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string | null;
  senderRole?: string;
  senderCommunity?: string;
  pesan: string;
  createdAt: string;
  partnerUser?: RegisteredUserItem | null;
}

export interface RekapitulasiWargaKomunitasResult {
  totalRegisteredUsers: number;
  totalWargaPosyandu: number;
  totalWargaPaud: number;
  totalKomunitasPosyandu: number;
  totalKomunitasPaud: number;
  totalWargaWargaKita?: number;
}




