"use client";

import { useState } from "react";
import {
  GraduationCap,
  ShieldCheck,
  Clock,
  Plus,
  X,
  Search,
} from "lucide-react";
import { CardDataAts } from "./card-data-ats";
import { FormDataAts } from "./form-data-ats";
import type { KomunitasWithMembership, DataAtsItem } from "@/types/database";

interface DataAtsClientViewProps {
  komunitas: KomunitasWithMembership;
  initialAts: DataAtsItem[];
  canValidate: boolean;
  canEditDdtk: boolean;
}

export function DataAtsClientView({
  komunitas,
  initialAts,
  canValidate,
  canEditDdtk,
}: DataAtsClientViewProps) {
  const [atsList, setAtsList] = useState<DataAtsItem[]>(initialAts);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const totalAts = atsList.length;
  const totalApproved = atsList.filter(
    (c) => c.status_approval === "approved"
  ).length;
  const totalPending = totalAts - totalApproved;

  const filteredAts = atsList.filter(
    (c) =>
      c.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nama_orangtua.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.alasan_tidak_sekolah.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* 1. STATISTIC METRIC CARDS */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-border bg-card p-3 text-center">
          <span className="text-[10px] uppercase font-mono text-muted-foreground block">
            TOTAL ATS
          </span>
          <span className="text-base font-bold font-mono text-foreground">
            {totalAts}
          </span>
        </div>

        <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-center">
          <span className="text-[10px] uppercase font-mono text-emerald-400 block">
            TERVERIFIKASI
          </span>
          <span className="text-base font-bold font-mono text-emerald-400">
            {totalApproved}
          </span>
        </div>

        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-center">
          <span className="text-[10px] uppercase font-mono text-amber-400 block">
            MENUNGGU
          </span>
          <span className="text-base font-bold font-mono text-amber-400">
            {totalPending}
          </span>
        </div>
      </div>

      {/* 2. SEARCH & ADD BUTTON */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama anak ATS, orang tua, atau alasan..."
            className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex h-10 items-center gap-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-white px-3.5 text-xs font-mono font-bold uppercase tracking-wider shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5px]" />
          <span>TAMBAH ATS</span>
        </button>
      </div>

      {/* 3. LIST DATA ATS */}
      <div className="space-y-3 pb-16">
        {filteredAts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <GraduationCap className="h-6 w-6 stroke-[1.5px] text-amber-500" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                BELUM ADA DATA ANAK TIDAK SEKOLAH (ATS)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Daftarkan data Anak Tidak Sekolah di wilayah Anda untuk pemantauan, verifikasi alasan, dan fasilitasi kembali bersekolah.
              </p>
            </div>
          </div>
        ) : (
          filteredAts.map((child) => (
            <CardDataAts
              key={child.id}
              ats={child}
              canValidate={canValidate}
              canEditDdtk={canEditDdtk}
            />
          ))
        )}
      </div>

      {/* 4. MODAL POPUP PENDATAAN ATS */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="relative w-full max-w-lg max-h-[calc(100dvh-2rem)] flex flex-col rounded-xl border border-border bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-4 border-b border-border shrink-0 bg-card">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-500">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                    PENDATAAN ATS (ANAK TIDAK SEKOLAH)
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {komunitas.nama}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-5 overflow-y-auto flex-1">
              <FormDataAts
                komunitasId={komunitas.id}
                komunitasNama={komunitas.nama}
                onSuccess={() => {
                  setIsAddModalOpen(false);
                  window.location.reload();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
