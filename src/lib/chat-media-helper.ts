/**
 * Helper utilitas untuk media percakapan (screenshot / tangkapan layar),
 * kompresi sisi-klien super efisien (zero server CPU & database cost),
 * serta serialisasi/deserialisasi tag balasan dan mention.
 */

export interface ReplyQuote {
  id: string;
  senderName: string;
  textSnippet: string;
}

export interface ParsedChatMessage {
  text: string;
  imageUrl: string | null;
  replyTo: ReplyQuote | null;
}

export interface CompressedImageResult {
  dataUrl: string;
  width: number;
  height: number;
  sizeBytes: number;
  originalSizeBytes: number;
  format: "webp" | "jpeg";
}

/**
 * Format ukuran file ke representasi yang ramah pengguna
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Kompresi gambar / tangkapan layar (screenshot) di sisi klien (browser)
 * menggunakan HTML5 Canvas.
 *
 * Efisiensi Ketat:
 * - Mengubah dimensi maksimum ke 960px (tetap sangat jelas & tajam untuk teks tabel / obrolan)
 * - Format WebP kualitas 0.7 (fallback JPEG jika WebP tidak didukung browser lawas)
 * - Target ukuran di bawah 70 KB (pengurangan ukuran >90% dari gambar asli)
 * - Zero server CPU usage, zero DB storage ballooning
 */
export async function compressScreenshot(
  file: File | Blob,
  maxDimension: number = 960,
  initialQuality: number = 0.7,
  maxTargetBytes: number = 75000 // ~75 KB target cap
): Promise<CompressedImageResult> {
  if (typeof window === "undefined") {
    throw new Error("Kompresi gambar hanya dapat dijalankan di sisi klien (browser).");
  }

  // Validasi awal ukuran mentah maksimal (8 MB)
  const originalSizeBytes = file.size;
  if (originalSizeBytes > 8 * 1024 * 1024) {
    throw new Error("Ukuran berkas asli terlalu besar (maksimal 8 MB sebelum dikompresi).");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Gagal membaca berkas gambar."));

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Gagal memuat gambar untuk dikompresi."));

      img.onload = () => {
        try {
          let origWidth = img.naturalWidth || img.width;
          let origHeight = img.naturalHeight || img.height;

          if (!origWidth || !origHeight) {
            return reject(new Error("Dimensi gambar tidak valid."));
          }

          // Hitung rasio resolusi baru
          let targetWidth = origWidth;
          let targetHeight = origHeight;

          if (origWidth > maxDimension || origHeight > maxDimension) {
            if (origWidth >= origHeight) {
              targetWidth = maxDimension;
              targetHeight = Math.round((origHeight / origWidth) * maxDimension);
            } else {
              targetHeight = maxDimension;
              targetWidth = Math.round((origWidth / origHeight) * maxDimension);
            }
          }

          // Buat elemen canvas untuk render & kompresi
          const canvas = document.createElement("canvas");
          canvas.width = targetWidth;
          canvas.height = targetHeight;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            return reject(new Error("Browser tidak mendukung kanvas grafis 2D."));
          }

          // Image smoothing untuk ketajaman screenshot teks
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          // Coba ekspor ke WebP terlebih dahulu
          let format: "webp" | "jpeg" = "webp";
          let dataUrl = canvas.toDataURL("image/webp", initialQuality);

          // Jika browser lawas tidak mendukung WebP, toDataURL biasanya fallback ke PNG atau string kosong
          if (!dataUrl.startsWith("data:image/webp")) {
            format = "jpeg";
            dataUrl = canvas.toDataURL("image/jpeg", initialQuality);
          }

          let sizeBytes = Math.round((dataUrl.length * 3) / 4);

          // Jika ukuran masih di atas batas ketat (~75KB), lakukan kompresi tahap kedua lebih agresif
          if (sizeBytes > maxTargetBytes && targetWidth > 640) {
            const secondScale = 0.75;
            const secondWidth = Math.round(targetWidth * secondScale);
            const secondHeight = Math.round(targetHeight * secondScale);

            const canvas2 = document.createElement("canvas");
            canvas2.width = secondWidth;
            canvas2.height = secondHeight;
            const ctx2 = canvas2.getContext("2d");
            if (ctx2) {
              ctx2.imageSmoothingEnabled = true;
              ctx2.imageSmoothingQuality = "medium";
              ctx2.drawImage(img, 0, 0, secondWidth, secondHeight);

              const secondDataUrl = canvas2.toDataURL(
                format === "webp" ? "image/webp" : "image/jpeg",
                0.6
              );
              dataUrl = secondDataUrl;
              targetWidth = secondWidth;
              targetHeight = secondHeight;
              sizeBytes = Math.round((dataUrl.length * 3) / 4);
            }
          }

          resolve({
            dataUrl,
            width: targetWidth,
            height: targetHeight,
            sizeBytes,
            originalSizeBytes,
            format,
          });
        } catch (err: any) {
          reject(err);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format tag penyimpanan pesan grup dengan metadata balasan & gambar terkompresi
 */
export function serializeChatMessage(params: {
  text: string;
  imageUrl?: string | null;
  replyTo?: ReplyQuote | null;
}): string {
  const parts: string[] = [];

  // 1. Tag Balasan (Quote)
  if (params.replyTo) {
    const safeSender = encodeURIComponent(params.replyTo.senderName || "Warga");
    const safeSnippet = encodeURIComponent(
      (params.replyTo.textSnippet || "").replace(/\r?\n/g, " ").slice(0, 100)
    );
    parts.push(`[BALAS:${params.replyTo.id}:::${safeSender}:::${safeSnippet}]`);
  }

  // 2. Tag Gambar / Tangkapan Layar
  if (params.imageUrl) {
    parts.push(`[GAMBAR:${params.imageUrl}]`);
  }

  // 3. Teks Pesan Pengguna
  const cleanText = (params.text || "").trim();
  if (cleanText) {
    parts.push(cleanText);
  } else if (params.imageUrl) {
    // Jika hanya mengirim gambar tanpa teks, sertakan fallback ramah
    parts.push("📷 Tangkapan Layar");
  }

  return parts.join("\n");
}

/**
 * Parsing pesan grup dari database untuk mengekstrak kutipan balasan, gambar tangkapan layar, dan teks
 */
export function parseChatMessage(rawText: string | null | undefined): ParsedChatMessage {
  if (!rawText) {
    return {
      text: "",
      imageUrl: null,
      replyTo: null,
    };
  }

  let working = rawText;
  let replyTo: ReplyQuote | null = null;
  let imageUrl: string | null = null;

  // 1. Cek Tag Balasan: [BALAS:id:::sender:::snippet]
  const replyMatch = working.match(/\[BALAS:([^:]+):::([^:]+):::([^\]]*)\]/);
  if (replyMatch) {
    try {
      replyTo = {
        id: replyMatch[1],
        senderName: decodeURIComponent(replyMatch[2]),
        textSnippet: decodeURIComponent(replyMatch[3]),
      };
    } catch {
      replyTo = {
        id: replyMatch[1],
        senderName: replyMatch[2],
        textSnippet: replyMatch[3],
      };
    }
    working = working.replace(replyMatch[0], "").trim();
  }

  // 2. Cek Tag Gambar: [GAMBAR:data:image/...]
  const imageMatch = working.match(/\[GAMBAR:(data:image\/[^\]]+)\]/);
  if (imageMatch) {
    imageUrl = imageMatch[1];
    working = working.replace(imageMatch[0], "").trim();
  }

  return {
    text: working,
    imageUrl,
    replyTo,
  };
}

