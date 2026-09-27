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
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-border bg-card p-3 text-center shadow-2xs">
          <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
            Total Anak
          </span>
          <span className="text-base font-bold text-foreground">
            {totalChildren}
          </span>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-3 text-center shadow-2xs dark:border-emerald-900/50 dark:bg-emerald-950/40">
          <span className="text-[10px] uppercase font-semibold text-emerald-800 dark:text-emerald-300 block">
            Terverifikasi
          </span>
          <span className="text-base font-bold text-primary">
            {totalApproved}
          </span>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-3 text-center shadow-2xs dark:border-amber-900/50 dark:bg-amber-950/40">
          <span className="text-[10px] uppercase font-semibold text-amber-800 dark:text-amber-300 block">
            Menunggu
          </span>
          <span className="text-base font-bold text-amber-600">
            {totalPending}
          </span>
        </div>
      </div>

      {/* 2. SEARCH & ADD BUTTON */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama anak atau orang tua..."
            className="w-full min-h-[44px] rounded-2xl border border-input bg-card pl-10 pr-4 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex min-h-[44px] items-center gap-1.5 rounded-2xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-md shadow-accent/20 transition-all active:scale-95 hover:brightness-110 shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[2.5px]" />
          <span>Tambah Anak</span>
        </button>
      </div>

      {/* 3. LIST DATA ANAK */}
      <div className="space-y-3 pb-12">
        {filteredChildren.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Baby className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                Belum Ada Data Anak
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Daftarkan data anak balita / PAUD 0–7 tahun pertama untuk pemantauan tumbuh kembang dan DDKS.
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsAddModalOpen(false)}
          />

          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-border bg-card p-6 shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Baby className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Pendaftaran Data Anak Baru
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {komunitas.nama}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

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
      )}
    </div>
  );
}
