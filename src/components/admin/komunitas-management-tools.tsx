"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Users,
  School,
  MapPin,
  Loader2,
  RefreshCw,
  X,
  ExternalLink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  UserPlus,
  Sparkles,
} from "lucide-react";
import {
  getKomunitasAdminListAction,
  createKomunitasAdminAction,
  updateKomunitasAdminAction,
  deleteKomunitasAdminAction,
} from "@/app/actions/komunitas";
import { ManageGrupMembersModal } from "@/components/kabar/manage-grup-members-modal";
import type { KomunitasWithMembership } from "@/types/database";
import { KOTA_TEGAL_DATA } from "@/lib/constants/tegal-data";

export function KomunitasManagementTools() {
  // State List, Filter & Sort
  const [items, setItems] = useState<KomunitasWithMembership[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [filterJenis, setFilterJenis] = useState<string>("semua");
  const [filterKecamatan, setFilterKecamatan] = useState<string>("semua");
  const [filterKelurahan, setFilterKelurahan] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [appliedSearch, setAppliedSearch] = useState<string>("");

  // Kriteria dan Arah Pengurutan (Ascending / Descending)
  const [sortBy, setSortBy] = useState<"nama" | "jenis" | "kecamatan" | "kelurahan" | "created_at" | "jumlah_anggota">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Transitions & Feedback
  const [isPendingAction, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState<KomunitasWithMembership | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KomunitasWithMembership | null>(null);
  const [memberManageTarget, setMemberManageTarget] = useState<KomunitasWithMembership | null>(null);

  // Load komunitas list dengan parameter filter dan pengurutan
  const fetchList = async (
    targetPage = page,
    currentSortBy = sortBy,
    currentSortOrder = sortOrder
  ) => {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await getKomunitasAdminListAction({
        jenis: filterJenis,
        kecamatan: filterKecamatan,
        kelurahan: filterKelurahan,
        searchQuery: appliedSearch,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
        page: targetPage,
        limit: 15,
      });

      if (res && res.success) {
        setItems(res.data || []);
        setTotalCount(res.totalCount || 0);
        setPage(res.page || 1);
        setTotalPages(res.totalPages || 1);
        setListError(null);
      } else {
        setListError(res?.message || "Gagal memuat daftar komunitas.");
      }
    } catch (err: any) {
      console.error("Gagal memuat daftar komunitas:", err);
      setListError("Terjadi kendala saat memuat daftar komunitas. Silakan klik tombol Coba Lagi di bawah.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchList(1, sortBy, sortOrder);
  }, [filterJenis, filterKecamatan, filterKelurahan, appliedSearch, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery.trim());
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setAppliedSearch("");
  };

  // Toggle pengurutan per kolom (Ascending <-> Descending)
  const handleSortToggle = (column: "nama" | "jenis" | "kecamatan" | "kelurahan" | "created_at" | "jumlah_anggota") => {
    if (sortBy === column) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      if (column === "nama" || column === "jenis" || column === "kecamatan" || column === "kelurahan") {
        setSortOrder("asc");
      } else {
        setSortOrder("desc");
      }
    }
  };

  const handleResetFilters = () => {
    setFilterJenis("semua");
    setFilterKecamatan("semua");
    setFilterKelurahan("semua");
    setSearchQuery("");
    setAppliedSearch("");
    setSortBy("created_at");
    setSortOrder("desc");
  };

  const isFilteredOrSorted =
    filterJenis !== "semua" ||
    filterKecamatan !== "semua" ||
    filterKelurahan !== "semua" ||
    appliedSearch !== "" ||
    sortBy !== "created_at" ||
    sortOrder !== "desc";

  // Handle Delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    const targetNama = deleteTarget.nama;

    startTransition(async () => {
      setFeedback(null);
      const res = await deleteKomunitasAdminAction(targetId);
      setDeleteTarget(null);
      if (res.success) {
        setFeedback({ type: "success", message: `Komunitas "${targetNama}" berhasil dihapus.` });
        fetchList(1);
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    });
  };

  // Kelurahan list options based on selected kecamatan for filter & modal
  const kelurahanOptions = useMemo(() => {
    if (filterKecamatan === "semua" || !KOTA_TEGAL_DATA[filterKecamatan]) {
      return [];
    }
    return Object.keys(KOTA_TEGAL_DATA[filterKecamatan].kelurahan);
  }, [filterKecamatan]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Feedback Toast / Alert */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-lg p-4 text-xs font-semibold border transition-all shadow-xs ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
              : "border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span className="flex-1 leading-relaxed">{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-[10px] uppercase font-bold tracking-wider underline hover:opacity-80 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Header: Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold border border-primary/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-foreground">
                Kelola Seluruh Komunitas
              </h3>
              <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                {totalCount} TERDAFTAR
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tambah komunitas baru, cari, ubah rincian, dan hapus komunitas terdaftar di Kota Tegal secara langsung.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => fetchList(page)}
            disabled={loadingList}
            className="inline-flex min-h-[42px] h-10 items-center gap-2 px-3.5 rounded-lg border border-border bg-background text-foreground hover:bg-muted text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-98"
            title="Segarkan Daftar Komunitas"
          >
            <RefreshCw className={`h-4 w-4 ${loadingList ? "animate-spin text-primary" : ""}`} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex min-h-[42px] h-10 items-center gap-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Komunitas</span>
          </button>
        </div>
      </div>

      {/* Controls: Search & Filters */}
      <div className="space-y-3">
        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama komunitas, kelurahan, lokasi..."
              className="w-full min-h-[42px] h-10 pl-10 pr-9 rounded-lg border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                title="Hapus pencarian"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="min-h-[42px] h-10 px-5 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition-colors cursor-pointer active:scale-98"
          >
            Cari
          </button>
        </form>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* 1. Filter Kategori */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              Kategori
            </label>
            <select
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              className="w-full min-h-[40px] h-10 px-3 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="semua">Semua Kategori</option>
              <option value="posyandu">Posyandu</option>
              <option value="satuan_paud">Satuan PAUD &amp; PKBM</option>
              <option value="warga_kita">Warga Kita</option>
              <option value="kegiatan">Grup Kegiatan</option>
            </select>
          </div>

          {/* 2. Filter Kecamatan */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              Kecamatan
            </label>
            <select
              value={filterKecamatan}
              onChange={(e) => {
                setFilterKecamatan(e.target.value);
                setFilterKelurahan("semua");
              }}
              className="w-full min-h-[40px] h-10 px-3 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="semua">Semua Kecamatan</option>
              <option value="Tegal Timur">Tegal Timur</option>
              <option value="Tegal Barat">Tegal Barat</option>
              <option value="Tegal Selatan">Tegal Selatan</option>
              <option value="Margadana">Margadana</option>
            </select>
          </div>

          {/* 3. Filter Kelurahan */}
          <div>
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
              Kelurahan
            </label>
            <select
              value={filterKelurahan}
              disabled={filterKecamatan === "semua"}
              onChange={(e) => setFilterKelurahan(e.target.value)}
              className="w-full min-h-[40px] h-10 px-3 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 cursor-pointer"
            >
              <option value="semua">Semua Kelurahan</option>
              {kelurahanOptions.map((kel) => (
                <option key={kel} value={kel}>
                  {kel}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1.5 shadow-2xs">
              {sortOrder === "asc" ? (
                <ArrowUp className="h-3 w-3 text-primary" />
              ) : (
                <ArrowDown className="h-3 w-3 text-primary" />
              )}
              <span>
                Urutan:{" "}
                {sortBy === "nama" && "Nama (A-Z)"}
                {sortBy === "created_at" && (sortOrder === "asc" ? "Terlama" : "Terbaru")}
                {sortBy === "jenis" && "Kategori"}
                {sortBy === "kecamatan" && "Kecamatan"}
                {sortBy === "kelurahan" && "Kelurahan"}
                {sortBy === "jumlah_anggota" && (sortOrder === "asc" ? "Anggota (Sedikit)" : "Anggota (Terbanyak)")}
                {" • "}
                <strong className="uppercase">{sortOrder === "asc" ? "Naik" : "Turun"}</strong>
              </span>
            </span>
          </div>

          {isFilteredOrSorted && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline inline-flex items-center gap-1 cursor-pointer min-h-[32px]"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset Semua Filter &amp; Urutan</span>
            </button>
          )}
        </div>
      </div>

      {/* Komunitas Table */}
      {loadingList ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3 border-t border-border">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-xs sm:text-sm font-medium">Memuat data komunitas...</span>
        </div>
      ) : listError ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-lg border border-rose-200 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-600 dark:text-rose-400" />
          <div className="space-y-1">
            <h4 className="font-bold text-foreground text-sm">Gagal Memuat Komunitas</h4>
            <p className="text-xs text-muted-foreground max-w-sm">{listError}</p>
          </div>
          <button
            type="button"
            onClick={() => fetchList(page, sortBy, sortOrder)}
            className="inline-flex min-h-[38px] h-9 items-center gap-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Coba Muat Ulang</span>
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-lg border border-dashed border-border bg-card space-y-3">
          <Building2 className="h-10 w-10 text-muted-foreground" />
          <div className="space-y-1">
            <h4 className="font-bold text-foreground text-sm">
              Tidak ada komunitas ditemukan
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              Tidak ada komunitas yang cocok dengan filter atau kata kunci pencarian. Coba ubah kata kunci atau tambah komunitas baru.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex min-h-[42px] h-10 items-center gap-2 px-4 rounded-lg bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition-colors cursor-pointer active:scale-98"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Komunitas Baru</span>
          </button>
        </div>
      ) : (
        <div className="overflow-hidden border border-border rounded-lg bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground font-bold border-b border-border select-none">
                <tr>
                  {/* Nama Komunitas */}
                  <th
                    onClick={() => handleSortToggle("nama")}
                    className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors group"
                    title="Klik untuk urutkan berdasarkan Nama Komunitas"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={sortBy === "nama" ? "text-primary font-bold" : ""}>
                        Nama Komunitas
                      </span>
                      {sortBy === "nama" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-primary" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>

                  {/* Kategori */}
                  <th
                    onClick={() => handleSortToggle("jenis")}
                    className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors group"
                    title="Klik untuk urutkan berdasarkan Kategori"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={sortBy === "jenis" ? "text-primary font-bold" : ""}>
                        Kategori
                      </span>
                      {sortBy === "jenis" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-primary" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>

                  {/* Wilayah & Lokasi */}
                  <th
                    onClick={() => handleSortToggle("kecamatan")}
                    className="py-3 px-4 cursor-pointer hover:bg-muted/60 transition-colors group"
                    title="Klik untuk urutkan berdasarkan Wilayah"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={sortBy === "kecamatan" || sortBy === "kelurahan" ? "text-primary font-bold" : ""}>
                        Wilayah &amp; Lokasi
                      </span>
                      {sortBy === "kecamatan" || sortBy === "kelurahan" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-primary" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>

                  {/* Anggota Terdaftar */}
                  <th
                    onClick={() => handleSortToggle("jumlah_anggota")}
                    className="py-3 px-4 text-center cursor-pointer hover:bg-muted/60 transition-colors group"
                    title="Klik untuk urutkan berdasarkan Jumlah Anggota"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={sortBy === "jumlah_anggota" ? "text-primary font-bold" : ""}>
                        Anggota
                      </span>
                      {sortBy === "jumlah_anggota" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5 text-primary" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-primary" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>

                  {/* Aksi */}
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Nama & Deskripsi */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-foreground text-xs sm:text-sm">
                        {item.nama}
                      </div>
                      {item.deskripsi && (
                        <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {item.deskripsi}
                        </div>
                      )}
                    </td>

                    {/* Kategori */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {item.jenis === "posyandu" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 text-[10px] font-bold">
                          <Sparkles className="h-3 w-3" /> Posyandu
                        </span>
                      )}
                      {item.jenis === "satuan_paud" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold">
                          <School className="h-3 w-3" /> Satuan PAUD
                        </span>
                      )}
                      {item.jenis === "warga_kita" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-bold">
                          <Users className="h-3 w-3" /> Warga Kita
                        </span>
                      )}
                      {item.jenis === "kegiatan" && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-secondary/15 text-amber-950 dark:text-amber-200 border border-secondary/30 px-2 py-0.5 text-[10px] font-bold">
                          <Sparkles className="h-3 w-3 text-secondary" /> Kegiatan
                        </span>
                      )}
                      {item.jenis !== "posyandu" &&
                        item.jenis !== "satuan_paud" &&
                        item.jenis !== "warga_kita" &&
                        item.jenis !== "kegiatan" && (
                          <span className="inline-flex items-center rounded-md bg-muted text-foreground px-2 py-0.5 text-[10px] font-bold">
                            {item.jenis || "Komunitas"}
                          </span>
                        )}
                    </td>

                    {/* Wilayah & Lokasi */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>
                          {[item.kelurahan, item.kecamatan].filter(Boolean).join(", ") ||
                            item.lokasi ||
                            "Kota Tegal"}
                        </span>
                      </div>
                      {(item.rw || item.rt) && (
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5 pl-4">
                          {[item.rw ? `RW ${item.rw}` : "", item.rt ? `RT ${item.rt}` : ""]
                            .filter(Boolean)
                            .join(" / ")}
                        </div>
                      )}
                    </td>

                    {/* Anggota Aktif */}
                    <td className="py-3 px-4 text-center whitespace-nowrap font-mono font-bold text-foreground">
                      {item.jumlah_anggota || 0}
                    </td>

                    {/* Aksi */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setMemberManageTarget(item)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer min-h-[34px] min-w-[34px] inline-flex items-center justify-center"
                          title="Kelola Anggota Komunitas"
                        >
                          <UserPlus className="h-4 w-4" />
                        </button>

                        <Link
                          href={`/komunitas/${item.id}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors min-h-[34px] min-w-[34px] inline-flex items-center justify-center"
                          title="Buka Halaman Komunitas"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setEditItem(item)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-amber-600 hover:bg-amber-500/10 transition-colors cursor-pointer min-h-[34px] min-w-[34px] inline-flex items-center justify-center"
                          title="Ubah Data Komunitas"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer min-h-[34px] min-w-[34px] inline-flex items-center justify-center"
                          title="Hapus Komunitas"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination footer */}
          <div className="p-3.5 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-muted-foreground font-medium">
              Menampilkan halaman <strong>{page}</strong> dari <strong>{totalPages}</strong> ({totalCount} total)
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fetchList(page - 1)}
                disabled={page <= 1 || loadingList}
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg border border-border bg-background font-bold text-foreground disabled:opacity-40 cursor-pointer hover:bg-muted"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                onClick={() => fetchList(page + 1)}
                disabled={page >= totalPages || loadingList}
                className="min-h-[36px] px-3.5 py-1.5 rounded-lg border border-border bg-background font-bold text-foreground disabled:opacity-40 cursor-pointer hover:bg-muted"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH KOMUNITAS BARU */}
      {showAddModal && (
        <KomunitasFormModal
          mode="create"
          onClose={() => setShowAddModal(false)}
          onSuccess={(msg) => {
            setShowAddModal(false);
            setFeedback({ type: "success", message: msg });
            fetchList(1);
          }}
        />
      )}

      {/* MODAL EDIT KOMUNITAS */}
      {editItem && (
        <KomunitasFormModal
          mode="edit"
          initialData={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={(msg) => {
            setEditItem(null);
            setFeedback({ type: "success", message: msg });
            fetchList(page);
          }}
        />
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs">
          <div className="bg-card rounded-lg border border-border p-5 sm:p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20">
                <Trash2 className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-base text-foreground">
                Hapus Komunitas?
              </h4>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin menghapus komunitas <strong>"{deleteTarget.nama}"</strong>? Seluruh data keanggotaan terkait komunitas ini akan ikut terhapus secara permanen.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isPendingAction}
                className="min-h-[42px] h-10 px-4 rounded-lg border border-border bg-background font-bold text-xs text-foreground hover:bg-muted cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPendingAction}
                className="min-h-[42px] h-10 inline-flex items-center gap-1.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white cursor-pointer active:scale-98"
              >
                {isPendingAction ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Ya, Hapus Permanen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah & Kelola Anggota Komunitas */}
      {memberManageTarget && (
        <ManageGrupMembersModal
          isOpen={!!memberManageTarget}
          onClose={() => setMemberManageTarget(null)}
          room={{
            id: memberManageTarget.id,
            nama: memberManageTarget.nama,
            jenis: memberManageTarget.jenis,
            deskripsi: memberManageTarget.deskripsi,
            jumlah_anggota: memberManageTarget.jumlah_anggota || 0,
            is_kegiatan: memberManageTarget.jenis === "kegiatan",
          }}
          allUsers={[]}
          canManage={true}
          currentUserId={null}
          initialTab="undang"
          onMembersUpdated={() => {
            fetchList(page);
          }}
        />
      )}
    </div>
  );
}

/**
 * Sub-komponen Modal Form Tambah / Edit Komunitas
 */
interface KomunitasFormModalProps {
  mode: "create" | "edit";
  initialData?: KomunitasWithMembership;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

function KomunitasFormModal({
  mode,
  initialData,
  onClose,
  onSuccess,
}: KomunitasFormModalProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [nama, setNama] = useState(initialData?.nama || "");
  const [jenis, setJenis] = useState<string>(initialData?.jenis || "posyandu");
  const [kecamatan, setKecamatan] = useState(initialData?.kecamatan || "Tegal Timur");
  const [kelurahan, setKelurahan] = useState(initialData?.kelurahan || "Kejambon");
  const [rw, setRw] = useState(initialData?.rw || "");
  const [rt, setRt] = useState(initialData?.rt || "");
  const [lokasi, setLokasi] = useState(initialData?.lokasi || "");
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || "");
  const [kontak, setKontak] = useState(initialData?.kontak || "");
  const [jadwal, setJadwal] = useState(initialData?.jadwal || "");

  const availableKelurahan = useMemo(() => {
    if (!KOTA_TEGAL_DATA[kecamatan]) return [];
    return Object.keys(KOTA_TEGAL_DATA[kecamatan].kelurahan);
  }, [kecamatan]);

  // Update kelurahan otomatis saat kecamatan berubah jika kelurahan sebelumnya tidak ada di kecamatan baru
  useEffect(() => {
    if (availableKelurahan.length > 0 && !availableKelurahan.includes(kelurahan)) {
      setKelurahan(availableKelurahan[0]);
    }
  }, [kecamatan, availableKelurahan, kelurahan]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!nama.trim()) {
      setError("Nama komunitas wajib diisi.");
      return;
    }

    const formData = new FormData();
    formData.append("nama", nama.trim());
    formData.append("jenis", jenis);
    formData.append("kecamatan", kecamatan);
    formData.append("kelurahan", kelurahan);
    if (rw.trim()) formData.append("rw", rw.trim());
    if (rt.trim()) formData.append("rt", rt.trim());
    formData.append(
      "lokasi",
      lokasi.trim() || `${kelurahan}, Kecamatan ${kecamatan}, Kota Tegal`
    );
    if (deskripsi.trim()) formData.append("deskripsi", deskripsi.trim());
    if (kontak.trim()) formData.append("kontak", kontak.trim());
    if (jadwal.trim()) formData.append("jadwal", jadwal.trim());

    startTransition(async () => {
      if (mode === "create") {
        const res = await createKomunitasAdminAction(formData);
        if (res.success) {
          onSuccess(res.message);
        } else {
          setError(res.message);
        }
      } else if (mode === "edit" && initialData) {
        const res = await updateKomunitasAdminAction(initialData.id, formData);
        if (res.success) {
          onSuccess(res.message);
        } else {
          setError(res.message);
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs overflow-y-auto">
      <div className="bg-card rounded-lg border border-border p-5 sm:p-6 max-w-lg w-full space-y-4 shadow-xl my-8">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              {mode === "create" ? <Plus className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">
                {mode === "create" ? "Tambah Komunitas Baru" : "Ubah Data Komunitas"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Isi data rincian komunitas di wilayah Kota Tegal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Nama Komunitas */}
          <div>
            <label className="block font-bold text-foreground mb-1">
              Nama Komunitas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Posyandu Melati 1, KB Sakila Kerti, Warga RW 05"
              className="w-full min-h-[42px] h-10 px-3.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Kategori Komunitas */}
          <div>
            <label className="block font-bold text-foreground mb-1">
              Kategori <span className="text-rose-500">*</span>
            </label>
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
              className="w-full min-h-[42px] h-10 px-3.5 rounded-lg border border-border bg-background font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="posyandu">Posyandu</option>
              <option value="satuan_paud">Satuan PAUD / PKBM</option>
              <option value="warga_kita">Warga Kita</option>
              <option value="kegiatan">Grup Kegiatan / Penanganan ATS</option>
            </select>
          </div>

          {/* Kecamatan & Kelurahan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-foreground mb-1">
                Kecamatan <span className="text-rose-500">*</span>
              </label>
              <select
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                className="w-full min-h-[42px] h-10 px-3.5 rounded-lg border border-border bg-background font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {Object.keys(KOTA_TEGAL_DATA).map((kec) => (
                  <option key={kec} value={kec}>
                    {kec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">
                Kelurahan <span className="text-rose-500">*</span>
              </label>
              <select
                value={kelurahan}
                onChange={(e) => setKelurahan(e.target.value)}
                className="w-full min-h-[42px] h-10 px-3.5 rounded-lg border border-border bg-background font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                {availableKelurahan.map((kel) => (
                  <option key={kel} value={kel}>
                    {kel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* RW & RT (Opsional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-foreground mb-1">
                RW (Opsional)
              </label>
              <input
                type="text"
                value={rw}
                onChange={(e) => setRw(e.target.value)}
                placeholder="Contoh: 01"
                className="w-full min-h-[42px] h-10 px-3.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">
                RT (Opsional)
              </label>
              <input
                type="text"
                value={rt}
                onChange={(e) => setRt(e.target.value)}
                placeholder="Contoh: 02"
                className="w-full min-h-[42px] h-10 px-3.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
          </div>

          {/* Alamat / Lokasi Spesifik */}
          <div>
            <label className="block font-bold text-foreground mb-1">
              Alamat / Lokasi Detail
            </label>
            <input
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Contoh: Jl. Werkudoro No. 12, Balai RW 03"
              className="w-full min-h-[42px] h-10 px-3.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block font-bold text-foreground mb-1">
              Deskripsi Singkat (Opsional)
            </label>
            <textarea
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Keterangan mengenai komunitas atau layanan kegiatan..."
              className="w-full p-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Kontak & Jadwal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-foreground mb-1">
                Kontak / No. HP (Opsional)
              </label>
              <input
                type="text"
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                placeholder="Contoh: 08123456789"
                className="w-full min-h-[42px] h-10 px-3.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-foreground mb-1">
                Jadwal Kegiatan (Opsional)
              </label>
              <input
                type="text"
                value={jadwal}
                onChange={(e) => setJadwal(e.target.value)}
                placeholder="Contoh: Setiap Sabtu tgl 10"
                className="w-full min-h-[42px] h-10 px-3.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="min-h-[42px] h-10 px-4 rounded-lg border border-border bg-background font-bold text-xs text-foreground hover:bg-muted cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="min-h-[42px] h-10 inline-flex items-center gap-2 px-5 rounded-lg bg-primary hover:bg-primary-hover font-bold text-xs text-primary-foreground cursor-pointer shadow-xs disabled:opacity-50 active:scale-98"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{mode === "create" ? "Simpan Komunitas" : "Perbarui Komunitas"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
