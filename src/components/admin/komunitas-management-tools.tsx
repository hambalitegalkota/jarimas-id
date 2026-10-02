"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  Database,
  Sparkles,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Users,
  School,
  MapPin,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import {
  getKomunitasAuditSummaryAction,
  getKomunitasAdminListAction,
  createKomunitasAdminAction,
  updateKomunitasAdminAction,
  deleteKomunitasAdminAction,
  type KomunitasAuditSummary,
} from "@/app/actions/komunitas";
import type { KomunitasWithMembership } from "@/types/database";
import { KOTA_TEGAL_DATA } from "@/lib/constants/tegal-data";

export function KomunitasManagementTools() {
  // State Audit Summary
  const [auditSummary, setAuditSummary] = useState<KomunitasAuditSummary | null>(null);
  const [loadingAudit, setLoadingAudit] = useState(true);

  // State List & Filter
  const [items, setItems] = useState<KomunitasWithMembership[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingList, setLoadingList] = useState(true);

  const [filterJenis, setFilterJenis] = useState<string>("semua");
  const [filterKecamatan, setFilterKecamatan] = useState<string>("semua");
  const [filterKelurahan, setFilterKelurahan] = useState<string>("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [appliedSearch, setAppliedSearch] = useState<string>("");

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



  // Load audit summary
  const fetchAuditSummary = async () => {
    setLoadingAudit(true);
    try {
      const res = await getKomunitasAuditSummaryAction();
      if (res.success && res.data) {
        setAuditSummary(res.data);
      }
    } catch (err) {
      console.error("Gagal mengambil ringkasan audit:", err);
    } finally {
      setLoadingAudit(false);
    }
  };

  // Load komunitas list
  const fetchList = async (targetPage = page) => {
    setLoadingList(true);
    try {
      const res = await getKomunitasAdminListAction({
        jenis: filterJenis,
        kecamatan: filterKecamatan,
        kelurahan: filterKelurahan,
        searchQuery: appliedSearch,
        page: targetPage,
        limit: 15,
      });

      if (res.success) {
        setItems(res.data);
        setTotalCount(res.totalCount);
        setPage(res.page);
        setTotalPages(res.totalPages);
      } else {
        setFeedback({ type: "error", message: res.message || "Gagal memuat daftar komunitas." });
      }
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || "Terjadi kesalahan jaringan." });
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchAuditSummary();
  }, []);

  useEffect(() => {
    fetchList(1);
  }, [filterJenis, filterKecamatan, filterKelurahan, appliedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery);
  };

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
        fetchAuditSummary();
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
    <div className="space-y-6">
      {/* Feedback Toast / Alert */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-bold border-2 transition-all shadow-sm ${
            feedback.type === "success"
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200"
              : "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          )}
          <span className="flex-1 leading-relaxed">{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs uppercase tracking-wider underline hover:opacity-80 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* 1. SECTION AUDIT: Kesesuaian Jumlah Komunitas dengan Kondisi Sesungguhnya */}
      <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Audit &amp; Kesesuaian Komunitas Kota Tegal
                </h3>
                <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 text-xs font-bold">
                  DATA LAPANGAN
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengecekan kesesuaian jumlah komunitas terdaftar di database dengan kondisi riil Kota Tegal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                fetchAuditSummary();
                fetchList(page);
              }}
              disabled={loadingAudit || loadingList}
              className="inline-flex min-h-[42px] items-center gap-2 px-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer active:scale-98"
              title="Perbarui Data Audit"
            >
              <RefreshCw className={`h-4 w-4 ${loadingAudit ? "animate-spin text-emerald-600" : ""}`} />
              <span>Segarkan</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex min-h-[42px] items-center gap-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-98"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Komunitas</span>
            </button>
          </div>
        </div>

        {/* Audit Cards Grid */}
        {loadingAudit && !auditSummary ? (
          <div className="flex items-center justify-center py-10 text-slate-500 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="text-sm font-medium">Memeriksa kesesuaian data komunitas...</span>
          </div>
        ) : auditSummary ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Posyandu */}
              <div
                onClick={() => setFilterJenis(filterJenis === "posyandu" ? "semua" : "posyandu")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${
                  filterJenis === "posyandu"
                    ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40"
                    : "border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <Sparkles className="h-4 w-4" />
                    <span>1. Posyandu</span>
                  </div>
                  {auditSummary.posyandu.total >= auditSummary.posyandu.standardTarget ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                      <Check className="h-3 w-3" /> Sesuai Target
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                      {auditSummary.posyandu.total} / {auditSummary.posyandu.standardTarget}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                    {auditSummary.posyandu.total}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Posyandu terdaftar (Target: {auditSummary.posyandu.standardTarget})
                  </span>
                </div>
              </div>

              {/* Card 2: Satuan PAUD & Kesetaraan */}
              <div
                onClick={() => setFilterJenis(filterJenis === "satuan_paud" ? "semua" : "satuan_paud")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${
                  filterJenis === "satuan_paud"
                    ? "border-amber-600 bg-amber-50/60 dark:bg-amber-950/40"
                    : "border-amber-100 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                    <School className="h-4 w-4" />
                    <span>2. Satuan PAUD &amp; PKBM</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                    <Check className="h-3 w-3" /> Tersedia
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                    {auditSummary.paud.total}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Satuan Lembaga (TK, KB, RA, PKBM)
                  </span>
                </div>
              </div>

              {/* Card 3: Komunitas Warga Kita */}
              <div
                onClick={() => setFilterJenis(filterJenis === "warga_kita" ? "semua" : "warga_kita")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${
                  filterJenis === "warga_kita"
                    ? "border-teal-600 bg-teal-50/60 dark:bg-teal-950/40"
                    : "border-teal-100 dark:border-teal-900/40 bg-teal-50/20 dark:bg-teal-950/10 hover:border-teal-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 font-bold text-sm">
                    <Users className="h-4 w-4" />
                    <span>3. Warga Kita (Domisili)</span>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                    4 Kec / 27 Kel
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                    {auditSummary.warga.total}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Entitas Tingkat Kec, Kel, RW &amp; RT
                  </span>
                </div>
              </div>
            </div>

            {/* Kecamatan Mini Breakdown Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="font-bold text-slate-500 flex items-center gap-1 mr-1">
                <MapPin className="h-3.5 w-3.5" /> Sebaran per Kecamatan:
              </span>
              {auditSummary.kecamatanBreakdown.map((kec) => (
                <button
                  key={kec.nama}
                  type="button"
                  onClick={() => {
                    setFilterKecamatan(filterKecamatan === kec.nama ? "semua" : kec.nama);
                    setFilterKelurahan("semua");
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    filterKecamatan === kec.nama
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  <span>{kec.nama}</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                    filterKecamatan === kec.nama ? "bg-emerald-700 text-white" : "bg-slate-200 dark:bg-slate-700"
                  }`}>
                    {kec.total}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* 2. SECTION DAFTAR & MANAJEMEN KOMUNITAS */}
      <div className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 space-y-5 shadow-xs">
        {/* Controls: Search, Category, District */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Daftar Komunitas Terdaftar
              </h3>
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                {totalCount} TOTAL
              </span>
            </div>

            {/* Quick Reset Filter */}
            {(filterJenis !== "semua" ||
              filterKecamatan !== "semua" ||
              filterKelurahan !== "semua" ||
              appliedSearch !== "") && (
              <button
                type="button"
                onClick={() => {
                  setFilterJenis("semua");
                  setFilterKecamatan("semua");
                  setFilterKelurahan("semua");
                  setSearchQuery("");
                  setAppliedSearch("");
                }}
                className="text-xs font-bold text-rose-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reset Semua Filter</span>
              </button>
            )}
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama komunitas, kelurahan, jalan..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Cari
            </button>
          </form>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            {/* Filter Jenis */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Kategori
              </label>
              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="semua">Semua Kategori</option>
                <option value="posyandu">Posyandu</option>
                <option value="satuan_paud">Satuan PAUD &amp; PKBM</option>
                <option value="warga_kita">Warga Kita</option>
              </select>
            </div>

            {/* Filter Kecamatan */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Kecamatan
              </label>
              <select
                value={filterKecamatan}
                onChange={(e) => {
                  setFilterKecamatan(e.target.value);
                  setFilterKelurahan("semua");
                }}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="semua">Semua Kecamatan</option>
                <option value="Tegal Timur">Tegal Timur</option>
                <option value="Tegal Barat">Tegal Barat</option>
                <option value="Tegal Selatan">Tegal Selatan</option>
                <option value="Margadana">Margadana</option>
              </select>
            </div>

            {/* Filter Kelurahan */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Kelurahan
              </label>
              <select
                value={filterKelurahan}
                disabled={filterKecamatan === "semua"}
                onChange={(e) => setFilterKelurahan(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-800 dark:text-slate-200 focus:border-emerald-500 focus:outline-none disabled:opacity-50 cursor-pointer"
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
        </div>

        {/* Komunitas Table */}
        {loadingList ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500 gap-3 border-t border-slate-100 dark:border-slate-800">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="text-sm font-medium">Memuat data komunitas...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-4 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-3">
            <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-700" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Tidak ada komunitas ditemukan
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Tidak ada komunitas yang cocok dengan filter atau kata kunci pencarian. Coba ubah kata kunci atau tambah komunitas baru.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Komunitas Baru</span>
            </button>
          </div>
        ) : (
          <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Nama Komunitas</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4">Wilayah &amp; Lokasi</th>
                    <th className="py-3.5 px-4 text-center">Anggota Terdaftar</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Nama & Deskripsi */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {item.nama}
                        </div>
                        {item.deskripsi && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {item.deskripsi}
                          </div>
                        )}
                      </td>

                      {/* Kategori */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.jenis === "posyandu" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-[11px] font-bold">
                            <Sparkles className="h-3 w-3" /> Posyandu
                          </span>
                        )}
                        {item.jenis === "satuan_paud" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 text-[11px] font-bold">
                            <School className="h-3 w-3" /> Satuan PAUD
                          </span>
                        )}
                        {item.jenis === "warga_kita" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-1 text-[11px] font-bold">
                            <Users className="h-3 w-3" /> Warga Kita
                          </span>
                        )}
                        {item.jenis !== "posyandu" &&
                          item.jenis !== "satuan_paud" &&
                          item.jenis !== "warga_kita" && (
                            <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 text-[11px] font-bold">
                              {item.jenis || "Komunitas"}
                            </span>
                          )}
                      </td>

                      {/* Wilayah & Lokasi */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>
                            {[item.kelurahan, item.kecamatan].filter(Boolean).join(", ") ||
                              item.lokasi ||
                              "Kota Tegal"}
                          </span>
                        </div>
                        {(item.rw || item.rt) && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5 pl-4">
                            {[item.rw ? `RW ${item.rw}` : "", item.rt ? `RT ${item.rt}` : ""]
                              .filter(Boolean)
                              .join(" / ")}
                          </div>
                        )}
                      </td>

                      {/* Anggota Aktif */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono font-bold text-slate-700 dark:text-slate-300">
                        {item.jumlah_anggota || 0}
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <Link
                            href={`/komunitas/${item.id}`}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                            title="Buka Komunitas"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setEditItem(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors cursor-pointer"
                            title="Ubah Data Komunitas"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
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
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <span className="text-slate-500 font-medium">
                Menampilkan halaman <strong>{page}</strong> dari <strong>{totalPages}</strong> ({totalCount} total)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchList(page - 1)}
                  disabled={page <= 1 || loadingList}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                >
                  Sebelumnya
                </button>
                <button
                  type="button"
                  onClick={() => fetchList(page + 1)}
                  disabled={page >= totalPages || loadingList}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MODAL TAMBAH KOMUNITAS BARU */}
      {showAddModal && (
        <KomunitasFormModal
          mode="create"
          onClose={() => setShowAddModal(false)}
          onSuccess={(msg) => {
            setShowAddModal(false);
            setFeedback({ type: "success", message: msg });
            fetchList(1);
            fetchAuditSummary();
          }}
        />
      )}

      {/* 4. MODAL EDIT KOMUNITAS */}
      {editItem && (
        <KomunitasFormModal
          mode="edit"
          initialData={editItem}
          onClose={() => setEditItem(null)}
          onSuccess={(msg) => {
            setEditItem(null);
            setFeedback({ type: "success", message: msg });
            fetchList(page);
            fetchAuditSummary();
          }}
        />
      )}

      {/* 5. MODAL KONFIRMASI HAPUS */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-rose-200 dark:border-rose-900/50 p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                <Trash2 className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Hapus Komunitas?
              </h4>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Apakah Anda yakin ingin menghapus komunitas <strong>"{deleteTarget.nama}"</strong>? Seluruh data keanggotaan terkait komunitas ini akan ikut terhapus secara permanen.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isPendingAction}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isPendingAction}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 font-bold text-xs text-white cursor-pointer"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              {mode === "create" ? <Plus className="h-5 w-5" /> : <Edit2 className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                {mode === "create" ? "Tambah Komunitas Baru" : "Ubah Data Komunitas"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Isi data rincian komunitas di wilayah Kota Tegal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Nama Komunitas */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Komunitas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Posyandu Melati 1, KB Sakila Kerti, Warga RW 05"
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Kategori Komunitas */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Kategori <span className="text-rose-500">*</span>
            </label>
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
            >
              <option value="posyandu">Posyandu</option>
              <option value="satuan_paud">Satuan PAUD / PKBM</option>
              <option value="warga_kita">Warga Kita</option>
            </select>
          </div>

          {/* Kecamatan & Kelurahan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kecamatan <span className="text-rose-500">*</span>
              </label>
              <select
                value={kecamatan}
                onChange={(e) => setKecamatan(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
              >
                {Object.keys(KOTA_TEGAL_DATA).map((kec) => (
                  <option key={kec} value={kec}>
                    {kec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kelurahan <span className="text-rose-500">*</span>
              </label>
              <select
                value={kelurahan}
                onChange={(e) => setKelurahan(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
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
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                RW (Opsional)
              </label>
              <input
                type="text"
                value={rw}
                onChange={(e) => setRw(e.target.value)}
                placeholder="Contoh: 01"
                className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                RT (Opsional)
              </label>
              <input
                type="text"
                value={rt}
                onChange={(e) => setRt(e.target.value)}
                placeholder="Contoh: 02"
                className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Alamat / Lokasi Spesifik */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Alamat / Lokasi Detail
            </label>
            <input
              type="text"
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="Contoh: Jl. Werkudoro No. 12, Balai RW 03"
              className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi Singkat (Opsional)
            </label>
            <textarea
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Keterangan mengenai komunitas atau layanan kegiatan..."
              className="w-full px-3.5 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white cursor-pointer shadow-xs disabled:opacity-50"
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
