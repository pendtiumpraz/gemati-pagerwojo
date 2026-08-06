import { NextRequest } from "next/server";
import { z } from "zod";
import { login, logAudit } from "@/modules/auth/service";
import { setSessionCookie } from "@/lib/session";
import { ok, bad, handle } from "@/lib/api";
import { rateLimit, rateLimitReset } from "@/lib/rateLimit";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  return handle(async () => {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return bad("Username dan password wajib diisi");

    // Rate limit per IP+username (batas 5 percobaan / 15 menit — sesuai app_settings)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rlKey = `login:${ip}:${parsed.data.username}`;
    const rl = rateLimit(rlKey, 5, 15 * 60 * 1000);
    if (!rl.ok) {
      return bad(
        `Terlalu banyak percobaan login. Coba lagi dalam ${Math.ceil(rl.retryAfter / 60)} menit.`,
        429
      );
    }

    try {
      const user = await login(parsed.data.username, parsed.data.password);
      rateLimitReset(rlKey);
      await setSessionCookie(user);
      await logAudit({
        user,
        aksi: "Login",
        modul: "Auth",
        detail: `Login berhasil sebagai ${user.role.toUpperCase()}`,
        ip: req.headers.get("x-forwarded-for") ?? "-",
        browser: req.headers.get("user-agent")?.slice(0, 140) ?? "-",
      });
      return ok(user, "Login berhasil! Selamat datang.");
    } catch (e) {
      return bad((e as Error).message, 401);
    }
  });
}
