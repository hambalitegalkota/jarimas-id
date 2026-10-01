"use client";

import { useState, useTransition } from "react";
import {
  X,
  Activity,
  Scale,
  Ruler,
  Clock,
  User,
  Plus,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { addDdksRecord } from "@/app/actions/data-anak";
import type { DataAnakItem, DdksRecord } from "@/types/database";

interface DdksDrawerProps {
  anak: DataAnakItem;
  isOpen: boolean;
  canEditDdks: boolean;
  onClose: () => void;
  onRecordAdded?: (newRecord: DdksRecord) => void;
}

export function DdksDrawer({
  anak,
  isOpen,
  canEditDdks,
  onClose,
  onRecordAdded,
}: DdksDrawerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [beratBadan, setBeratBadan] = useState("");
  const [tinggiBadan, setTinggiBadan] = useState("");
  const [panjangBadan, setPanjangBadan] = useState("");
  const [lingkarKepala, setLingkarKepala] = useState("");
  const [catatan, setCatatan] = useState("");

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const latest = anak.latest_ddks;
  const history = anak.ddks_history || [];

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const formData = new FormData();
    formData.append("dataAnakId", anak.id);
    formData.append("beratBadan", beratBadan);
    formData.append("tinggiBadan", tinggiBadan);
    if (panjangBadan) formData.append("panjangBadan", panjangBadan);
    formData.append("lingkarKepala", lingkarKepala);
    if (catatan) formData.append("catatan", catatan);

    startTransition(async () => {
      const res = await addDdksRecord(formData);
      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
        });
        if (res.record) {
          onRecordAdded?.(res.record);
        }
        setShowAddForm(false);
        setBeratBadan("");
        setTinggiBadan("");
        setPanjangBadan("");
        setLingkarKepala("");
        setCatatan("");
      } else {
        setFeedback({
          type: "error",
          message: res.message,
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[85dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b-2 border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">
                Rekam Medis &amp; DDTK
              </h3>
              <p className="text-sm font-medium text-slate-600 line-clamp-1">{anak.nama_lengkap}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 pb-12 overflow-y-auto flex-1 space-y-5 overscroll-contain bg-slate-50/50">
          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`flex items-start gap-3 rounded-xl p-4 text-sm font-bold animate-in fade-in ${
                feedback.type === "success"
                  ? "border-2 border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-2 border-rose-300 bg-rose-50 text-rose-900"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* 1. KONDISI TERKINI */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white p-5 space-y-3.5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Hasil Pengukuran Terkini
              </span>
              {latest?.created_at && (
                <span className="text-xs font-bold text-slate-500" suppressHydrationWarning>
                  {new Date(latest.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>

            {latest ? (
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-xs font-bold uppercase text-slate-500 block">
                    Berat Badan
                  </span>
                  <span className="text-base sm:text-lg font-black font-mono text-slate-900">
                    {latest.berat_badan} kg
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-xs font-bold uppercase text-slate-500 block">
                    Tinggi Badan
                  </span>
                  <span className="text-base sm:text-lg font-black font-mono text-slate-900">
                    {latest.tinggi_badan} cm
                  </span>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-xs font-bold uppercase text-slate-500 block">
                    Lingkar Kepala
                  </span>
                  <span className="text-base sm:text-lg font-black font-mono text-slate-900">
                    {latest.lingkar_kepala} cm
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3.5 text-center text-sm font-semibold text-amber-900 flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>Data Belum Di Isi Oleh Posyandu</span>
              </div>
            )}

            {latest?.catatan && (
              <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900">Catatan Kader: </span>
                <span>&ldquo;{latest.catatan}&rdquo;</span>
              </div>
            )}
          </div>

          {/* 2. FORM TAMBAH PENGUKURAN (KHUSUS KADER / NAKES) */}
          {canEditDdks ? (
            <div className="space-y-3">
              {!showAddForm ? (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex w-full min-h-[48px] h-12 items-center justify-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white px-4 text-base font-bold transition-all shadow-md cursor-pointer"
                >
                  <Plus className="h-5 w-5" />
                  <span>Catat Pengukuran DDTK Baru</span>
                </button>
              ) : (
                <form
                  onSubmit={handleAddSubmit}
                  className="rounded-2xl border-2 border-blue-200 bg-white p-5 space-y-4 shadow-sm animate-in fade-in"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-base font-bold text-slate-900">
                      Input Pengukuran Posyandu Baru
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="text-sm font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-900">
                        Berat Badan (KG) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        value={beratBadan}
                        onChange={(e) => setBeratBadan(e.target.value)}
                        placeholder="Contoh: 12.5"
                        className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-3.5 text-base font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-900">
                        Tinggi Badan (CM) *
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        required
                        value={tinggiBadan}
                        onChange={(e) => setTinggiBadan(e.target.value)}
                        placeholder="Contoh: 90.0"
                        className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-3.5 text-base font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-900">
                        Panjang Badan (CM)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={panjangBadan}
                        onChange={(e) => setPanjangBadan(e.target.value)}
                        placeholder="Contoh: 90.0"
                        className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-3.5 text-base font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-900">
                        Lingkar Kepala (CM) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        required
                        value={lingkarKepala}
                        onChange={(e) => setLingkarKepala(e.target.value)}
                        placeholder="Contoh: 47.5"
                        className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-3.5 text-base font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-900">
                      Catatan Tumbuh Kembang / Vitamin
                    </label>
                    <input
                      type="text"
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      placeholder="Contoh: Vitamin A merah telah diberikan, gizi normal."
                      className="w-full min-h-[48px] h-12 rounded-xl border-2 border-slate-300 bg-white px-3.5 text-base text-slate-900 focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex w-full min-h-[50px] h-13 items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 text-base font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Simpan Catatan Pengukuran</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* READ-ONLY NOTICE FOR RT/WARGA */
            <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 border-2 border-amber-200">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0" />
              <span>
                Mode Pratinjau (*Read-Only*). Penginputan dan pembaruan hasil DDTK dilakukan oleh Kader Posyandu &amp; Nakes.
              </span>
            </div>
          )}

          {/* 3. RIWAYAT PENGUKURAN (RECORD HISTORY) */}
          <div className="space-y-3">
            <span className="text-sm font-bold text-slate-900 block uppercase tracking-wider">
              Riwayat Penimbangan &amp; Antropometri ({history.length})
            </span>

            {history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4 bg-white rounded-2xl border-2 border-slate-200">
                Belum ada riwayat tercatat.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {history.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-2xl border-2 border-slate-200 bg-white p-4 text-sm space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900">
                        BB: {rec.berat_badan}kg • TB: {rec.tinggi_badan}cm • LK: {rec.lingkar_kepala}cm
                      </span>
                      <span className="text-xs font-semibold text-slate-500" suppressHydrationWarning>
                        {new Date(rec.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {rec.catatan && (
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {rec.catatan}
                      </p>
                    )}
                    {rec.profiles?.nama_lengkap && (
                      <span className="text-xs text-slate-500 font-medium block">
                        Dicatat oleh: <b>{rec.profiles.nama_lengkap}</b>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
