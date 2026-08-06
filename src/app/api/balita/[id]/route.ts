import { NextRequest } from "next/server";
import { requireAuth, ok, bad, notFound, forbidden, handle } from "@/lib/api";
import { getBalita, updateBalita, softDeleteBalita } from "@/modules/balita/service";
import { logAudit } from "@/modules/auth/service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await requireAuth();
    const { id } = await params;
    const b = await getBalita(Number(id));
    if (!b) return notFound("Balita tidak ditemukan");
    // scoping baca
    if (session.role === "ppkbd" && b.desa_id !== session.desa_id) return forbidden();
    if (session.role === "kader" && b.kader_id !== session.id) return forbidden();
    return ok(b);
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await requireAuth(["admin", "ppkbd", "kader"]);
    const { id } = await params;
    const b = await getBalita(Number(id));
    if (!b) return notFound("Balita tidak ditemukan");
    if (session.role === "ppkbd" && b.desa_id !== session.desa_id) return forbidden();
    if (session.role === "kader" && b.kader_id !== session.id) return forbidden();

    const body = await req.json().catch(() => ({}));
    try {
      const updated = await updateBalita(Number(id), body);
      await logAudit({ user: session, aksi: "Edit", modul: "Balita", detail: `Mengubah balita ${updated.nama}` });
      return ok(updated, "Data berhasil diperbarui");
    } catch (e) {
      return bad((e as Error).message);
    }
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await requireAuth(["admin", "ppkbd", "kader"]);
    const { id } = await params;
    const b = await getBalita(Number(id));
    if (!b) return notFound("Balita tidak ditemukan");
    if (session.role === "ppkbd" && b.desa_id !== session.desa_id) return forbidden();
    if (session.role === "kader" && b.kader_id !== session.id) return forbidden();

    await softDeleteBalita(Number(id));
    await logAudit({ user: session, aksi: "Hapus", modul: "Balita", detail: `Menghapus balita #${id}` });
    return ok(null, "Data berhasil dihapus");
  });
}
