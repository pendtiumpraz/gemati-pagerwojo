import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { restoreDesa } from "@/modules/desa/service";
import { logAudit } from "@/modules/auth/service";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const session = await requireAuth(["admin"]);
    const { id } = await params;
    await restoreDesa(Number(id));
    await logAudit({ user: session, aksi: "Restore", modul: "Desa", detail: `Memulihkan desa #${id}` });
    return ok(null, "Data berhasil dipulihkan");
  });
}
