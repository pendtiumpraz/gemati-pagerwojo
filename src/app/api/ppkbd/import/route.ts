import { NextRequest } from "next/server";
import { requireAuth, ok, bad, handle } from "@/lib/api";
import { importUsers } from "@/modules/users/service";
import { logAudit } from "@/modules/auth/service";

// POST /api/ppkbd/import — import massal PPKBD (body: { rows: [...] })
export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth(["admin"]);
    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.rows)) return bad("Format tidak valid");
    const result = await importUsers(body.rows, "ppkbd");
    await logAudit({
      user: session,
      aksi: "Import Data",
      modul: "Pengguna",
      detail: `Import ${result.inserted} ppkbd (${result.failed} gagal)`,
    });
    return ok(result, `${result.inserted} baris diimport, ${result.failed} gagal`);
  });
}
