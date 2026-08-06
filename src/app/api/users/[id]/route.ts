import { NextRequest } from "next/server";
import { requireAuth, ok, bad, notFound, handle } from "@/lib/api";
import { getUser, updateUser, softDeleteUser } from "@/modules/users/service";
import { logAudit } from "@/modules/auth/service";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    await requireAuth(["admin"]);
    const { id } = await params;
    const user = await getUser(Number(id));
    if (!user) return notFound("Pengguna tidak ditemukan");
    return ok(user);
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await requireAuth(["admin"]);
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    try {
      const user = await updateUser(Number(id), body);
      await logAudit({ user: session, aksi: "Edit", modul: "Pengguna", detail: `Mengubah pengguna ${user.nama}` });
      return ok(user, "Data berhasil diperbarui");
    } catch (e) {
      return bad((e as Error).message);
    }
  });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await requireAuth(["admin"]);
    const { id } = await params;
    await softDeleteUser(Number(id));
    await logAudit({ user: session, aksi: "Hapus", modul: "Pengguna", detail: `Menghapus pengguna #${id}` });
    return ok(null, "Data berhasil dihapus");
  });
}
