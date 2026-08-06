import { NextRequest } from "next/server";
import { requireAuth, ok, bad, notFound, handle } from "@/lib/api";
import {
  getPengukuran,
  updatePengukuran,
  softDeletePengukuran,
} from "@/modules/pengukuran/service";
import { logAudit } from "@/modules/auth/service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    await requireAuth();
    const { id } = await params;
    const row = await getPengukuran(Number(id));
    if (!row) return notFound("Pengukuran tidak ditemukan");
    return ok(row);
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await requireAuth(["kader", "admin"]);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    try {
      const row = await updatePengukuran(Number(id), body);
      await logAudit({
        user: session,
        aksi: "Edit",
        modul: "Pengukuran",
        detail: `Mengubah pengukuran #${id}`,
      });
      return ok(row, "Data berhasil diperbarui");
    } catch (e) {
      return bad((e as Error).message);
    }
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await requireAuth(["kader", "admin"]);
    const { id } = await params;
    await softDeletePengukuran(Number(id));
    await logAudit({
      user: session,
      aksi: "Hapus",
      modul: "Pengukuran",
      detail: `Menghapus pengukuran #${id}`,
    });
    return ok(null, "Data berhasil dihapus");
  });
}
