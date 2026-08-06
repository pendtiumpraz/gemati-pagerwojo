import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { restorePendampingan } from "@/modules/pendampingan/service";
import { logAudit } from "@/modules/auth/service";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const session = await requireAuth(["kader", "admin"]);
    const { id } = await params;
    await restorePendampingan(Number(id));
    await logAudit({
      user: session,
      aksi: "Restore",
      modul: "Pendampingan",
      detail: `Memulihkan pendampingan #${id}`,
    });
    return ok(null, "Data berhasil dipulihkan");
  });
}
