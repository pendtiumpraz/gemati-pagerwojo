import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { restorePengukuran } from "@/modules/pengukuran/service";
import { logAudit } from "@/modules/auth/service";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const session = await requireAuth(["kader", "admin"]);
    const { id } = await params;
    await restorePengukuran(Number(id));
    await logAudit({
      user: session,
      aksi: "Restore",
      modul: "Pengukuran",
      detail: `Memulihkan pengukuran #${id}`,
    });
    return ok(null, "Data berhasil dipulihkan");
  });
}
