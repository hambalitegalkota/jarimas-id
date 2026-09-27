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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-border bg-card p-6 shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Rekam Medis &amp; DDKS
              </h3>
              <p className="text-xs text-muted-foreground">{anak.nama_lengkap}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`flex items-start gap-2.5 rounded-2xl p-4 text-xs font-semibold shadow-sm animate-in fade-in ${
              feedback.type === "success"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200"
                : "border border-destructive/20 bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 1. KONDISI TERKINI */}
        <div className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              Hasil Pengukuran Terkini
            </span>
            {latest?.created_at && (
              <span className="text-[10px] text-muted-foreground">
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
              <div className="rounded-xl bg-card p-2.5 border border-border/60">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Berat Badan
                </span>
                <span className="text-sm font-bold text-primary">
                  {latest.berat_badan} kg
                </span>
              </div>
              <div className="rounded-xl bg-card p-2.5 border border-border/60">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Tinggi Badan
                </span>
                <span className="text-sm font-bold text-accent">
                  {latest.tinggi_badan} cm
                </span>
              </div>
              <div className="rounded-xl bg-card p-2.5 border border-border/60">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Lingkar Kepala
                </span>
                <span className="text-sm font-bold text-amber-600">
                  {latest.lingkar_kepala} cm
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              Belum ada data pengukuran DDKS tersimpan.
            </p>
          )}

          {latest?.catatan && (
            <p className="text-xs text-muted-foreground italic bg-card/60 p-2.5 rounded-xl border border-border/40">
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
                className="flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-primary/20 transition-all active:scale-95 hover:brightness-105"
              >
                <Plus className="h-4 w-4" />
                <span>+ Catat Pengukuran DDKS Baru</span>
              </button>
            ) : (
              <form
                onSubmit={handleAddSubmit}
                className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">
                    Input Pengukuran Posyandu Baru
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Batal
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">
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
                      className="w-full min-h-[40px] rounded-xl border border-input bg-card px-3 text-xs font-bold text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">
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
                      className="w-full min-h-[40px] rounded-xl border border-input bg-card px-3 text-xs font-bold text-foreground"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">
                      Panjang Badan (CM)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={panjangBadan}
                      onChange={(e) => setPanjangBadan(e.target.value)}
                      placeholder="90.0"
                      className="w-full min-h-[40px] rounded-xl border border-input bg-card px-3 text-xs font-bold text-foreground"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-muted-foreground">
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
                      className="w-full min-h-[40px] rounded-xl border border-input bg-card px-3 text-xs font-bold text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-muted-foreground">
                    Catatan Tumbuh Kembang / Vitamin
                  </label>
                  <input
                    type="text"
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    placeholder="Contoh: Vitamin A merah telah diberikan, gizi normal."
                    className="w-full min-h-[40px] rounded-xl border border-input bg-card px-3 text-xs text-foreground"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="flex w-full min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-sm shadow-accent/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
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
          <div className="flex items-center gap-2 rounded-2xl bg-muted/60 p-3 text-xs text-muted-foreground border border-border/50">
            <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
            <span>
              Mode Pratinjau (*Read-Only*). Penginputan dan pembaruan hasil DDKS dilakukan oleh Kader Posyandu &amp; Nakes.
            </span>
          </div>
        )}

        {/* 3. RIWAYAT PENGUKURAN (RECORD HISTORY) */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold text-foreground block">
            Riwayat Penimbangan &amp; Antropometri ({history.length})
          </span>

          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-3">
              Belum ada riwayat tercatat.
            </p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {history.map((rec) => (
                <div
                  key={rec.id}
                  className="rounded-xl border border-border/80 bg-card p-3 text-xs space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      BB: {rec.berat_badan} kg • TB: {rec.tinggi_badan} cm • LK: {rec.lingkar_kepala} cm
                    </span>
                    <span className="text-[10px] text-muted-foreground">
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
                    <span className="text-[10px] text-primary font-medium block">
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
  );
}
