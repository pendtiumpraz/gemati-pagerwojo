import { NextRequest } from "next/server";
import { requireAuth, ok, bad, notFound, handle } from "@/lib/api";
import { getDesa, updateDesa, softDeleteDesa } from "@/modules/desa/service";
import { logAudit } from "@/modules/auth/service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    await requireAuth(["admin"]);
    const { id } = await params;
    const d = await getDesa(Number(id));
    if (!d) return notFound("Desa tidak ditemukan");
    return ok(d);
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await requireAuth(["admin"]);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    try {
      const d = await updateDesa(Number(id), body);
      await logAudit({ user: session, aksi: "Edit", modul: "Desa", detail: `Mengubah desa ${d.nama}` });
      return ok(d, "Data berhasil diperbarui");
    } catch (e) {
      return bad((e as Error).message);
    }
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await requireAuth(["admin"]);
    const { id } = await params;
    await softDeleteDesa(Number(id));
    await logAudit({ user: session, aksi: "Hapus", modul: "Desa", detail: `Menghapus desa #${id}` });
    return ok(null, "Data berhasil dihapus");
  });
}
