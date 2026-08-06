import { clearSessionCookie } from "@/lib/session";
import { ok, handle } from "@/lib/api";

export async function POST() {
  return handle(async () => {
    await clearSessionCookie();
    return ok(null, "Anda telah keluar dari sistem");
  });
}
