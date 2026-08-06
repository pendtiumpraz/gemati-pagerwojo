import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { restoreUser } from "@/modules/users/service";
import { logAudit } from "@/modules/auth/service";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const session = await requireAuth(["admin"]);
    const { id } = await params;
    await restoreUser(Number(id));
    await logAudit({ user: session, aksi: "Restore", modul: "Pengguna", detail: `Memulihkan pengguna #${id}` });
    return ok(null, "Data berhasil dipulihkan");
  });
}
