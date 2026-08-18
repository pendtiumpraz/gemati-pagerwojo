import bcrypt from "bcryptjs";
import { and, eq, isNull, desc } from "drizzle-orm";
import { db } from "@/db";
import { users, desa, balita, pendampingan } from "@/db/schema";
import { combine, searchCond, softDeleteCond, paginate } from "@/lib/query";
import { insertReturning, updateByIdReturning } from "@/db/repo";
import { sql } from "drizzle-orm";

export type UserInput = {
  nama: string;
  username: string;
  role: "admin" | "ppkbd" | "kader";
  desa_id?: number | null;
  phone?: string | null;
  email?: string | null;
  password?: string;
};

export async function listUsers(opts: {
  role?: string;
  search?: string;
  trashed?: boolean;
  page: number;
  pageSize: number;
}) {
  const where = combine(
    softDeleteCond(users.deleted_at, opts.trashed),
    opts.role ? eq(users.role, opts.role) : undefined,
    searchCond(opts.search, [users.nama, users.username, users.email])
  );
  const res = await paginate({
    table: users,
    where,
    orderBy: desc(users.created_at),
    page: opts.page,
    pageSize: opts.pageSize,
  });

  // enrich desa nama + counts
  const desaRows = await db.select().from(desa);
  const desaMap = new Map(desaRows.map((d) => [d.id, d.nama]));

  const data = await Promise.all(
    (res.data as (typeof users.$inferSelect)[]).map(async (u) => {
      let balita_count = 0;
      let pendampingan_count = 0;
      if (u.role === "kader") {
        const bc = await db
          .select({ c: sql<number>`count(*)::int` })
          .from(balita)
          .where(and(eq(balita.kader_id, u.id), isNull(balita.deleted_at)));
        balita_count = bc[0]?.c ?? 0;
        const pc = await db
          .select({ c: sql<number>`count(*)::int` })
          .from(pendampingan)
          .where(and(eq(pendampingan.kader_id, u.id), isNull(pendampingan.deleted_at)));
        pendampingan_count = pc[0]?.c ?? 0;
      }
      const { password, ...safe } = u;
      return { ...safe, desa_nama: u.desa_id ? desaMap.get(u.desa_id) : null, balita_count, pendampingan_count };
    })
  );
  return { ...res, data };
}

export async function getUser(id: number) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!rows[0]) return null;
  const { password, ...safe } = rows[0];
  return safe;
}

export async function createUser(input: UserInput) {
  // cek username unik (yang belum dihapus)
  const exist = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.username, input.username), isNull(users.deleted_at)))
    .limit(1);
  if (exist[0]) throw new Error("Username sudah digunakan");

  const pass = input.password || (input.role === "admin" ? "admin123" : "kader123");
  const rows = await insertReturning(users, {
    nama: input.nama,
    username: input.username,
    role: input.role,
    desa_id: input.role === "admin" ? null : input.desa_id ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
    password: bcrypt.hashSync(pass, 10),
    active: true,
  });
  const { password, ...safe } = rows[0];
  return safe;
}

export async function updateUser(id: number, input: Partial<UserInput>) {
  const patch: any = { updated_at: new Date() };
  if (input.nama !== undefined) patch.nama = input.nama;
  if (input.username !== undefined) patch.username = input.username;
  if (input.role !== undefined) patch.role = input.role;
  if (input.desa_id !== undefined) patch.desa_id = input.desa_id;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.email !== undefined) patch.email = input.email;
  if (input.password) patch.password = bcrypt.hashSync(input.password, 10);

  const rows = await updateByIdReturning(users, id, patch);
  if (!rows[0]) throw new Error("Pengguna tidak ditemukan");
  const { password, ...safe } = rows[0];
  return safe;
}

export async function softDeleteUser(id: number) {
  await db.update(users).set({ deleted_at: new Date() }).where(eq(users.id, id));
}

export async function restoreUser(id: number) {
  await db.update(users).set({ deleted_at: null }).where(eq(users.id, id));
}

export async function toggleActive(id: number) {
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!rows[0]) throw new Error("Pengguna tidak ditemukan");
  const next = !rows[0].active;
  await db.update(users).set({ active: next }).where(eq(users.id, id));
  return next;
}

export async function resetPassword(id: number, newPass = "password123") {
  await db
    .update(users)
    .set({ password: bcrypt.hashSync(newPass, 10) })
    .where(eq(users.id, id));
  return newPass;
}
