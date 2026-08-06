import bcrypt from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users, desa, auditLogs } from "@/db/schema";
import type { SessionUser } from "@/lib/session";

export async function login(
  username: string,
  password: string
): Promise<SessionUser> {
  const rows = await db
    .select()
    .from(users)
    .where(and(eq(users.username, username), isNull(users.deleted_at)))
    .limit(1);
  const user = rows[0];
  if (!user) throw new Error("Username atau password salah");
  if (!user.active) throw new Error("Akun Anda dinonaktifkan");

  const match = bcrypt.compareSync(password, user.password);
  if (!match) throw new Error("Username atau password salah");

  // update last_login
  await db
    .update(users)
    .set({ last_login: new Date() })
    .where(eq(users.id, user.id));

  let desa_nama: string | null = null;
  if (user.desa_id) {
    const d = await db.select().from(desa).where(eq(desa.id, user.desa_id)).limit(1);
    desa_nama = d[0]?.nama ?? null;
  }

  return {
    id: user.id,
    username: user.username,
    nama: user.nama,
    role: user.role as SessionUser["role"],
    desa_id: user.desa_id,
    desa_nama,
  };
}

export async function logAudit(opts: {
  user: SessionUser | null;
  aksi: string;
  modul: string;
  detail?: string;
  ip?: string;
  browser?: string;
}) {
  await db.insert(auditLogs).values({
    user_id: opts.user?.id ?? null,
    user_nama: opts.user?.nama ?? null,
    user_role: opts.user?.role ?? null,
    aksi: opts.aksi,
    modul: opts.modul,
    detail: opts.detail ?? null,
    ip_address: opts.ip ?? null,
    browser: opts.browser ?? null,
  });
}
