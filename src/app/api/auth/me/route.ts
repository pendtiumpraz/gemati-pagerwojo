import { getSession } from "@/lib/session";
import { ok, unauthorized, handle } from "@/lib/api";

export async function GET() {
  return handle(async () => {
    const session = await getSession();
    if (!session) return unauthorized();
    return ok(session);
  });
}
