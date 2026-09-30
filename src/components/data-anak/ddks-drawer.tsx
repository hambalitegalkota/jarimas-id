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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col rounded-xl border border-border bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-3 border-b border-border shrink-0 bg-card">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-950/40 border border-emerald-800 text-emerald-400">
              <Activity className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Rekam Medis &amp; DDTK
              </h3>
              <p className="text-xs text-muted-foreground">{anak.nama_lengkap}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`flex items-start gap-2.5 rounded-md p-3 text-xs font-semibold animate-in fade-in ${
                feedback.type === "success"
                  ? "border border-emerald-800 bg-emerald-950/40 text-emerald-300"
                  : "border border-destructive/20 bg-destructive/10 text-destructive"
              }`}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

        {/* 1. KONDISI TERKINI */}
        <div className="rounded-md border border-border bg-background p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              Hasil Pengukuran Terkini
            </span>
            {latest?.created_at && (
              <span className="text-[10px] font-mono text-muted-foreground">
                {new Date(latest.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </div>

          {latest ? (
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-card p-2.5 border border-border">
                <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                  Berat Badan
                </span>
                <span className="text-sm font-black font-mono text-foreground">
                  {latest.berat_badan} kg
                </span>
              </div>
              <div className="rounded-md bg-card p-2.5 border border-border">
                <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                  Tinggi Badan
                </span>
                <span className="text-sm font-black font-mono text-foreground">
                  {latest.tinggi_badan} cm
                </span>
              </div>
              <div className="rounded-md bg-card p-2.5 border border-border">
                <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                  Lingkar Kepala
                </span>
                <span className="text-sm font-black font-mono text-foreground">
                  {latest.lingkar_kepala} cm
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              Belum ada data pengukuran DDTK tersimpan.
            </p>
          )}

          {latest?.catatan && (
            <p className="text-xs text-muted-foreground italic bg-card p-2.5 rounded-md border border-border">
              Catatan: &ldquo;{latest.catatan}&rdquo;
            </p>
          )}
        </div>

        {/* 2. FORM TAMBAH PENGUKURAN (KHUSUS KADER / NAKES) */}
        {canEditDdks ? (
          <div className="space-y-3">
            {!showAddForm ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex w-full h-10 items-center justify-center gap-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white px-4 text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Catat Pengukuran DDTK Baru</span>
              </button>
            ) : (
              <form
                onSubmit={handleAddSubmit}
                className="rounded-md border border-border bg-background p-4 space-y-3 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Input Pengukuran Posyandu Baru
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">
                      Berat Badan (KG) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      value={beratBadan}
                      onChange={(e) => setBeratBadan(e.target.value)}
                      placeholder="12.5"
                      className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs font-mono font-bold text-foreground focus:border-zinc-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">
                      Tinggi Badan (CM) *
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      required
                      value={tinggiBadan}
                      onChange={(e) => setTinggiBadan(e.target.value)}
                      placeholder="90.0"
                      className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs font-mono font-bold text-foreground focus:border-zinc-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">
                      Panjang Badan (CM)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={panjangBadan}
                      onChange={(e) => setPanjangBadan(e.target.value)}
                      placeholder="90.0"
                      className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs font-mono font-bold text-foreground focus:border-zinc-500 focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase text-muted-foreground">
                      Lingkar Kepala (CM) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      value={lingkarKepala}
                      onChange={(e) => setLingkarKepala(e.target.value)}
                      placeholder="47.5"
                      className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs font-mono font-bold text-foreground focus:border-zinc-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-muted-foreground">
                    Catatan Tumbuh Kembang / Vitamin
                  </label>
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Vitamin A merah telah diberikan, gizi normal."
                    className="w-full h-9 rounded-md border border-border bg-card px-3 text-xs text-foreground focus:border-zinc-500 focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full h-9 items-center justify-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-4 text-xs font-bold transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Simpan Catatan Pengukuran</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        ) : (
          /* READ-ONLY NOTICE FOR RT/WARGA */
          <div className="flex items-center gap-2 rounded-md bg-muted/40 p-3 text-xs text-muted-foreground border border-border">
            <ShieldAlert className="h-4 w-4 text-zinc-400 shrink-0" />
            <span>
              Mode Pratinjau (*Read-Only*). Penginputan dan pembaruan hasil DDTK dilakukan oleh Kader Posyandu &amp; Nakes.
            </span>
          </div>
        )}

        {/* 3. RIWAYAT PENGUKURAN (RECORD HISTORY) */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-foreground block">
            Riwayat Penimbangan &amp; Antropometri ({history.length})
          </span>

          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3 font-mono">
              Belum ada riwayat tercatat.
            </p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {history.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-md border border-border bg-card p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground">
                      BB: {rec.berat_badan}kg • TB: {rec.tinggi_badan}cm • LK: {rec.lingkar_kepala}cm
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(rec.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {rec.catatan && (
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      {rec.catatan}
                    </p>
                  )}
                  {rec.profiles?.nama_lengkap && (
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      Dicatat oleh: {rec.profiles.nama_lengkap}
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
