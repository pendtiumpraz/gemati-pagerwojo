import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { restoreBalita } from "@/modules/balita/service";
import { logAudit } from "@/modules/auth/service";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await requireAuth(["admin", "ppkbd", "kader"]);
    const { id } = await params;
    await restoreBalita(Number(id));
    await logAudit({ user: session, aksi: "Edit", modul: "Balita", detail: `Memulihkan balita #${id}` });
    return ok(null, "Data berhasil dipulihkan");
  });
}
