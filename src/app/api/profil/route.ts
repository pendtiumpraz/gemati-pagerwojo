import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users, desa } from "@/db/schema";
import { requireAuth, ok, bad, notFound, handle } from "@/lib/api";
import { logAudit } from "@/modules/auth/service";

export async function GET() {
  return handle(async () => {
    const session = await requireAuth();
    const rows = await db
      .select()
      .from(users)
      .where(and(eq(users.id, session.id), isNull(users.deleted_at)))
      .limit(1);
    const u = rows[0];
    if (!u) return notFound("Pengguna tidak ditemukan");

    let desa_nama: string | null = null;
    if (u.desa_id) {
      const d = await db.select({ nama: desa.nama }).from(desa).where(eq(desa.id, u.desa_id)).limit(1);
      desa_nama = d[0]?.nama ?? null;
    }

    const { password, ...safe } = u;
    return ok({ ...safe, desa_nama });
  });
}

const schema = z.object({
  password_lama: z.string().min(1),
  password_baru: z.string().min(6),
});

export async function PUT(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth();
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return bad("Password baru minimal 6 karakter");

    const rows = await db.select().from(users).where(eq(users.id, session.id)).limit(1);
    const u = rows[0];
    if (!u) return notFound("Pengguna tidak ditemukan");

    const match = bcrypt.compareSync(parsed.data.password_lama, u.password);
    if (!match) return bad("Password lama salah");

    await db
      .update(users)
      .set({ password: bcrypt.hashSync(parsed.data.password_baru, 10), updated_at: new Date() })
      .where(eq(users.id, session.id));

    await logAudit({
      user: session,
      aksi: "Edit Data",
      modul: "Profil",
      detail: "Mengubah password akun",
    });

    return ok(null, "Password berhasil diperbarui");
  });
}
