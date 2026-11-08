"use client";

export interface ExportPdfOptions {
  filename?: string;
  title?: string;
  orientation?: "portrait" | "landscape";
  marginMm?: number;
  quality?: number;
}

/**
 * Mengonversi elemen HTML menjadi berkas PDF A4 utuh dan langsung mengunduhnya ke perangkat pengguna.
 * Menjamin dokumen tidak terpotong, resolusi tajam (retina scale: 2), tanpa latar website yang bocor,
 * dan terbagi secara rapi per halaman A4.
 *
 * Menggunakan dynamic import untuk html2canvas dan jspdf agar:
 * 1. Tidak membebani bundle awal halaman (code-splitting / on-demand load).
 * 2. Mencegah eksekusi DOM di sisi Server-Side Rendering (SSR).
 */
export async function exportElementToPdf(
  element: HTMLElement,
  options?: ExportPdfOptions
): Promise<{ success: boolean; filename: string; error?: string }> {
  try {
    if (typeof window === "undefined" || typeof document === "undefined") {
      throw new Error("Ekspor PDF hanya dapat dilakukan di peramban (browser).");
    }

    // Dynamic import client-only libraries
    const html2canvasModule = await import("html2canvas");
    const html2canvas = html2canvasModule.default || html2canvasModule;
    const { jsPDF } = await import("jspdf");

    const orientation = options?.orientation || "portrait";
    const isLandscape = orientation === "landscape";
    const pdfWidthMm = isLandscape ? 297 : 210;
    const pdfHeightMm = isLandscape ? 210 : 297;
    const marginMm = options?.marginMm !== undefined ? options?.marginMm : 8;

    // Bersihkan nama file agar aman untuk seluruh sistem operasi
    const rawFilename = options?.filename || options?.title || "Dokumen_Jarimas";
    const cleanFilename =
      rawFilename
        .trim()
        .replace(/[\\/:*?"<>|]/g, "_")
        .replace(/\s+/g, "_")
        .replace(/\.pdf$/i, "") + ".pdf";

    // Simpan posisi scroll sebelum capture
    const originalScrollTop = element.scrollTop;
    element.scrollTop = 0;

    // Tangkap elemen ke dalam canvas beresolusi tinggi (scale 2 untuk ketajaman teks optimal)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: Math.max(element.scrollWidth, 1024),
    });

    // Kembalikan posisi scroll awal
    element.scrollTop = originalScrollTop;

    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const contentWidthMm = pdfWidthMm - marginMm * 2;
    const contentHeightMm = pdfHeightMm - marginMm * 2;

    // Hitung konversi pixel canvas ke millimeter PDF
    const pxPerMm = canvas.width / contentWidthMm;
    const pageHeightPx = Math.floor(contentHeightMm * pxPerMm);

    // Kualitas gambar JPEG (0.92 seimbang tajam dan ukuran file wajar)
    const quality = options?.quality || 0.92;

    if (canvas.height <= pageHeightPx) {
      // 1 Halaman A4 Utuh
      const imgData = canvas.toDataURL("image/jpeg", quality);
      const imgHeightMm = (canvas.height * contentWidthMm) / canvas.width;
      pdf.addImage(imgData, "JPEG", marginMm, marginMm, contentWidthMm, imgHeightMm);
    } else {
      // Dokumen Multi Halaman: Potong canvas per halaman A4 secara presisi
      let renderedHeightPx = 0;
      let pageNumber = 0;

      while (renderedHeightPx < canvas.height) {
        if (pageNumber > 0) {
          pdf.addPage();
        }

        const remainingPx = canvas.height - renderedHeightPx;
        const currentSliceHeightPx = Math.min(remainingPx, pageHeightPx);

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = currentSliceHeightPx;
        const ctx = sliceCanvas.getContext("2d");

        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            renderedHeightPx,
            canvas.width,
            currentSliceHeightPx,
            0,
            0,
            canvas.width,
            currentSliceHeightPx
          );

          const sliceData = sliceCanvas.toDataURL("image/jpeg", quality);
          const sliceHeightMm = (currentSliceHeightPx * contentWidthMm) / canvas.width;
          pdf.addImage(sliceData, "JPEG", marginMm, marginMm, contentWidthMm, sliceHeightMm);
        }

        renderedHeightPx += currentSliceHeightPx;
        pageNumber++;
      }
    }

    pdf.save(cleanFilename);
    return { success: true, filename: cleanFilename };
  } catch (err: any) {
    console.error("Error generating PDF:", err);
    return {
      success: false,
      filename: "",
      error: err?.message || "Gagal membuat dokumen PDF.",
    };
  }
}

