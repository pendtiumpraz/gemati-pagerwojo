import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { listDesaRingkas, listDesaAgregat } from "@/modules/desa/service";

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAuth();
    const url = new URL(req.url);
    if (url.searchParams.get("agregat") === "1") {
      return ok(await listDesaAgregat());
    }
    return ok(await listDesaRingkas());
  });
}
