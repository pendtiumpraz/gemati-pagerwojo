import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { listValidasi } from "@/modules/validasi/service";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth(["ppkbd", "admin"]);
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;
    const res = await listValidasi(session, { status });
    return ok(res);
  });
}
