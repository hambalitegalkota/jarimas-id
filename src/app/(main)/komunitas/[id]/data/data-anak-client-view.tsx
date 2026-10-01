"use client";

import { useState } from "react";
import {
  Baby,
  ShieldCheck,
  Clock,
  Plus,
  X,
  Search,
} from "lucide-react";
import { CardDataAnak } from "@/components/data-anak/card-data-anak";
import { FormDataAnak } from "@/components/data-anak/form-data-anak";
import type { KomunitasWithMembership, DataAnakItem } from "@/types/database";

interface DataAnakClientViewProps {
  komunitas: KomunitasWithMembership;
  initialChildren: DataAnakItem[];
  canValidate: boolean;
  canEditDdks: boolean;
}

export function DataAnakClientView({
  komunitas,
  initialChildren,
  canValidate,
  canEditDdks,
}: DataAnakClientViewProps) {
  const [childrenList, setChildrenList] = useState<DataAnakItem[]>(initialChildren);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const totalChildren = childrenList.length;
  const totalApproved = childrenList.filter(
    (c) => c.status_approval === "approved"
  ).length;
  const totalPending = totalChildren - totalApproved;

  const filteredChildren = childrenList.filter(
    (c) =>
      c.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nama_orangtua.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* 1. STATISTIC METRIC CARDS */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md border border-border bg-card p-3 text-center">
          <span className="text-[10px] uppercase font-mono text-muted-foreground block">
            TOTAL ANAK
          </span>
          <span className="text-base font-bold font-mono text-foreground">
            {totalChildren}
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
            placeholder="Cari nama anak atau orang tua..."
            className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-4 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-hidden focus:ring-1 focus:ring-ring"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex h-10 items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 text-xs font-mono font-bold uppercase tracking-wider shadow-md transition-all shrink-0 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5 stroke-[2.5px]" />
          <span>TAMBAH ANAK</span>
        </button>
      </div>

      {/* 3. LIST DATA ANAK */}
      <div className="space-y-3 pb-16">
        {filteredChildren.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <Baby className="h-6 w-6 stroke-[1.5px]" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                BELUM ADA DATA ANAK
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Daftarkan data balita / PAUD 0–7 tahun pertama untuk pemantauan tumbuh kembang dan DDTK.
              </p>
            </div>
          </div>
        ) : (
          filteredChildren.map((child) => (
            <CardDataAnak
              key={child.id}
              anak={child}
              canValidate={canValidate}
              canEditDdks={canEditDdks}
            />
          ))
        )}
      </div>

      {/* 4. MODAL PENDAFTARAN ANAK */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="relative w-full max-w-lg max-h-[min(90dvh,calc(100dvh-2.5rem))] flex flex-col rounded-xl border border-border bg-card shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-auto">
            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-4 border-b border-border shrink-0 bg-card">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted text-emerald-600 dark:text-emerald-400">
                  <Baby className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-foreground font-mono">
                    PENDAFTARAN DATA ANAK
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
            <div className="p-4 sm:p-5 pb-10 sm:pb-12 overflow-y-auto flex-1 overscroll-contain">
              <FormDataAnak
                komunitasId={komunitas.id}
                komunitasNama={komunitas.nama}
                jenisKomunitas={komunitas.jenis}
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
