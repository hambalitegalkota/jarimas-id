import { NextResponse, type NextRequest } from "next/server";
import {
  assignAdminBidangAction,
  revokeAdminBidangAction,
  getAdminBidangListAction,
} from "@/app/actions/admin-bidang";

/**
 * REST API Endpoint untuk Manajemen Admin Bidang SPM
 * Menghilangkan sepenuhnya ketergantungan pada Next.js Flight/RSC stream saat eksekusi aksi,
 * sehingga 100% kebal terhadap Minified React error #441.
 */
export async function GET() {
  try {
    const res = await getAdminBidangListAction();
    return NextResponse.json(res);
  } catch (err: any) {
    console.error("GET /api/admin-bidang error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || "Gagal memuat daftar admin bidang.",
        data: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, targetUserId, selectedBidang, bidangId } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, message: "Parameter action wajib diisi." },
        { status: 400 }
      );
    }

    if (action === "assign") {
      if (!targetUserId) {
        return NextResponse.json(
          { success: false, message: "Parameter targetUserId wajib diisi." },
          { status: 400 }
        );
      }
      const res = await assignAdminBidangAction(
        targetUserId,
        Array.isArray(selectedBidang) ? selectedBidang : []
      );
      return NextResponse.json(res);
    }

    if (action === "revoke") {
      if (!targetUserId) {
        return NextResponse.json(
          { success: false, message: "Parameter targetUserId wajib diisi." },
          { status: 400 }
        );
      }
      const res = await revokeAdminBidangAction(targetUserId, bidangId);
      return NextResponse.json(res);
    }

    return NextResponse.json(
      { success: false, message: `Aksi '${action}' tidak dikenali.` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("POST /api/admin-bidang error:", err);
    return NextResponse.json(
      {
        success: false,
        message: err?.message || "Terjadi kesalahan internal pada server.",
      },
      { status: 500 }
    );
  }
}
