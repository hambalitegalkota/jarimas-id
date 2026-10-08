"use client";

import { useState, useRef, useTransition } from "react";
import {
  FileSpreadsheet,
  UploadCloud,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  Loader2,
  Check,
  Baby,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  parseExcelDataAnak,
  generateTemplateDataAnakWorkbook,
  type ParsedExcelChildRow,
  type ParseExcelResult,
} from "@/lib/excel-data-anak-helpers";
import { importBulkDataAnak } from "@/app/actions/data-anak";
import { cn } from "@/lib/utils";

interface ModalImportDataAnakProps {
  isOpen: boolean;
  komunitasId: string;
  komunitasNama: string;
  jenisKomunitas?: string;
  komunitas?: any;
  onClose: () => void;
  onSuccess: (importedCount: number) => void;
}

export function ModalImportDataAnak({
  isOpen,
  komunitasId,
  komunitasNama,
  jenisKomunitas = "satuan_paud",
  komunitas,
  onClose,
  onSuccess,
}: ModalImportDataAnakProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseExcelResult | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "valid" | "invalid">("all");
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
    details?: string[];
  } | null>(null);

  if (!isOpen) return null;

  // Handle Download Excel Template
  const handleDownloadTemplate = () => {
    try {
      setIsDownloadingTemplate(true);
      const buffer = generateTemplateDataAnakWorkbook(komunitasNama, jenisKomunitas);
      const blob = new Blob([buffer as any], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = komunitasNama.toLowerCase().replace(/[^a-z0-9]/g, "_");
      a.download = `Template_Import_Data_Anak_${safeName}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Gagal mendownload template:", err);
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  // Handle File Read & Parse
  const processFile = async (file: File) => {
    if (!file) return;
    setFeedback(null);
    setSelectedFile(file);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = parseExcelDataAnak(arrayBuffer, komunitas, file.name);
      setParseResult(result);
      if (result.totalRows === 0) {
        setFeedback({
          type: "error",
          message: "Tidak ditemukan baris data di sheet pertama file Excel ini.",
        });
      }
    } catch (err: any) {
      console.error("Error membaca file Excel:", err);
      setFeedback({
        type: "error",
        message: "Format file tidak valid atau rusak. Pastikan file berformat .xlsx, .xls, atau .csv.",
      });
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Reset File
  const handleReset = () => {
    setSelectedFile(null);
    setParseResult(null);
    setFeedback(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle Import Bulk Submission
  const handleImportSubmit = () => {
    if (!parseResult || parseResult.validRows.length === 0) return;

    startTransition(async () => {
      setFeedback(null);
      const res = await importBulkDataAnak(
        komunitasId,
        parseResult.validRows,
        komunitasNama,
        jenisKomunitas
      );

      if (res.success) {
        setFeedback({
          type: "success",
          message: res.message,
          details: res.errors,
        });
        setTimeout(() => {
          onSuccess(res.importedCount);
        }, 1200);
      } else {
        setFeedback({
          type: "error",
          message: res.message || "Gagal mengimpor data anak.",
          details: res.errors,
        });
      }
    });
  };

  const displayedRows =
    filterTab === "valid"
      ? parseResult?.validRows || []
      : filterTab === "invalid"
      ? parseResult?.invalidRows || []
      : parseResult?.allRows || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl max-h-[92dvh] sm:max-h-[90dvh] flex flex-col rounded-t-3xl sm:rounded-3xl border-2 border-slate-200 bg-white shadow-2xl z-10 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 overflow-hidden my-0 sm:my-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b-2 border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 shadow-xs">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  Uji Coba Import Excel
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase line-clamp-1">
                  {komunitasNama}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight mt-0.5">
                Import Massal Data Anak dari Excel (.xlsx)
              </h3>
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

        {/* Scrollable Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          {/* STEP 1: DOWNLOAD TEMPLATE & INSTRUCTIONS */}
          <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-700 shrink-0" />
                <h4 className="text-sm sm:text-base font-bold text-blue-950">
                  Langkah 1: Gunakan Template Excel Terstandarisasi
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                Unduh template Excel resmi JARIMAS-ID yang sudah berisi format kolom identitas anak, tanggal lahir, nama orang tua, alamat KK/Domisili, dan contoh pengisian.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-[0.98] text-white px-4 py-2.5 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer shrink-0"
            >
              {isDownloadingTemplate ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span>Unduh Template Excel</span>
            </button>
          </div>

          {/* STEP 2: UPLOAD DROPZONE */}
          {!parseResult ? (
            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Langkah 2: Pilih atau Tarik File Excel (.xlsx / .xls / .csv)
              </h4>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer",
                  dragActive
                    ? "border-emerald-600 bg-emerald-50/60 scale-[0.99]"
                    : "border-slate-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/20"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 mb-4 shadow-xs">
                  <UploadCloud className="h-8 w-8" />
                </div>

                <h5 className="text-base sm:text-lg font-bold text-slate-900">
                  Klik untuk unggah atau seret file ke sini
                </h5>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
                  Mendukung file Excel <strong>.xlsx</strong>, <strong>.xls</strong>, atau file <strong>.csv</strong> (Maksimal 500 baris per file).
                </p>

                <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200">
                  <FileCheck className="h-4 w-4 text-emerald-600" />
                  <span>Sistem memvalidasi kolom secara cerdas</span>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 3: PREVIEW & VALIDATION SUMMARY */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <FileSpreadsheet className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                      {parseResult.fileName}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Terbaca total <strong>{parseResult.totalRows} baris data anak</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Ganti File</span>
                  </button>
                </div>
              </div>

              {/* STATS BADGES */}
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setFilterTab("all")}
                  className={cn(
                    "p-3 rounded-2xl border-2 text-center transition-all cursor-pointer",
                    filterTab === "all"
                      ? "border-blue-600 bg-blue-50/80 shadow-xs"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  )}
                >
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 block">
                    Semua Data
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-slate-900">
                    {parseResult.totalRows}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterTab("valid")}
                  className={cn(
                    "p-3 rounded-2xl border-2 text-center transition-all cursor-pointer",
                    filterTab === "valid"
                      ? "border-emerald-600 bg-emerald-50/80 shadow-xs"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  )}
                >
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                    Valid ({Math.round((parseResult.validRows.length / (parseResult.totalRows || 1)) * 100)}%)
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-emerald-700">
                    {parseResult.validRows.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterTab("invalid")}
                  className={cn(
                    "p-3 rounded-2xl border-2 text-center transition-all cursor-pointer",
                    filterTab === "invalid"
                      ? "border-amber-600 bg-amber-50/80 shadow-xs"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  )}
                >
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800 block">
                    Perlu Koreksi
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-amber-700">
                    {parseResult.invalidRows.length}
                  </span>
                </button>
              </div>

              {/* TABLE PREVIEW */}
              <div className="rounded-2xl border-2 border-slate-200 bg-white overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>
                    Pratinjau Data: Menampilkan {displayedRows.length} baris
                  </span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    *Hanya baris bertanda hijau (valid) yang akan disimpan ke database
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200 sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Nama Lengkap Anak</th>
                        <th className="py-2.5 px-3">JK</th>
                        <th className="py-2.5 px-3">Tgl Lahir / Usia</th>
                        <th className="py-2.5 px-3">Orang Tua / Wali</th>
                        <th className="py-2.5 px-3">No HP</th>
                        <th className="py-2.5 px-3">Alamat Domisili</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            Tidak ada data untuk filter ini.
                          </td>
                        </tr>
                      ) : (
                        displayedRows.map((row) => (
                          <tr
                            key={row.index}
                            className={cn(
                              "transition-colors",
                              row.isValid ? "hover:bg-emerald-50/40" : "bg-amber-50/30 hover:bg-amber-50/60"
                            )}
                          >
                            <td className="py-2 px-3 font-mono font-semibold text-slate-500">
                              {row.index}
                            </td>
                            <td className="py-2 px-3">
                              {row.isValid ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-300">
                                  <Check className="h-3 w-3" />
                                  <span>Valid</span>
                                </span>
                              ) : (
                                <span
                                  title={row.errors.join(", ")}
                                  className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300 cursor-help"
                                >
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Error</span>
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-900">
                              {row.namaLengkap || "-"}
                            </td>
                            <td className="py-2 px-3 font-mono font-bold">
                              {row.jenisKelamin === "L" ? (
                                <span className="text-blue-700">L</span>
                              ) : (
                                <span className="text-pink-700">P</span>
                              )}
                            </td>
                            <td className="py-2 px-3 font-mono">
                              {row.tanggalLahir} ({row.usia} Thn)
                            </td>
                            <td className="py-2 px-3 font-medium">
                              {row.namaOrangtua || "-"}
                            </td>
                            <td className="py-2 px-3 font-mono">
                              {row.nomorHp || "-"}
                            </td>
                            <td className="py-2 px-3 text-slate-600 truncate max-w-xs">
                              {row.domisiliKelurahan ? `Kel. ${row.domisiliKelurahan}, RT ${row.domisiliRt}/RW ${row.domisiliRw}` : "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FEEDBACK BANNER */}
          {feedback && (
            <div
              className={cn(
                "rounded-2xl border-2 p-4 flex items-start gap-3 shadow-xs animate-in fade-in",
                feedback.type === "success"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-950"
                  : "border-red-300 bg-red-50 text-red-950"
              )}
            >
              {feedback.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="text-sm font-bold">{feedback.message}</h4>
                {feedback.details && feedback.details.length > 0 && (
                  <ul className="text-xs text-slate-700 list-disc list-inside space-y-0.5">
                    {feedback.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t-2 border-slate-100 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="w-full sm:w-auto inline-flex min-h-[46px] items-center justify-center rounded-2xl border-2 border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {parseResult && parseResult.validRows.length > 0 && (
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={isPending}
              className="w-full sm:w-auto inline-flex min-h-[46px] items-center justify-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white px-6 text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Sedang Mengimpor {parseResult.validRows.length} Data...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Impor {parseResult.validRows.length} Data Anak Valid</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
