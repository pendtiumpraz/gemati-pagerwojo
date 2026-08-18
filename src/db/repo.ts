/**
 * Helper insert/update yang mengembalikan row — kompatibel Postgres & MySQL.
 * Postgres/Neon: pakai `.returning()`. MySQL: insert lalu re-select (MySQL tak dukung RETURNING).
 */
import { asc, eq, gte, type SQL } from "drizzle-orm";
import { db, engine } from "./index";

type AnyTable = any;

/** Insert lalu kembalikan row hasil. `reselect` dipakai bila PK bukan auto-increment (mis. app_settings). */
export async function insertReturning(
  table: AnyTable,
  values: any,
  reselect?: SQL
): Promise<any[]> {
  if (engine !== "mysql") {
    return (db as any).insert(table).values(values).returning();
  }
  const res: any = await (db as any).insert(table).values(values);
  if (reselect) {
    return (db as any).select().from(table).where(reselect);
  }
  const header = Array.isArray(res) ? res[0] : res;
  const insertId = Number(header?.insertId ?? 0);
  const n = Array.isArray(values) ? values.length : 1;
  if (!insertId) {
    // fallback: ambil N baris terakhir
    return (db as any).select().from(table).orderBy(asc(table.id)).limit(n);
  }
  return (db as any)
    .select()
    .from(table)
    .where(gte(table.id, insertId))
    .orderBy(asc(table.id))
    .limit(n);
}

/** Update lalu kembalikan row hasil (berdasarkan kondisi WHERE yang sama). */
export async function updateReturning(
  table: AnyTable,
  patch: any,
  whereCond: SQL
): Promise<any[]> {
  if (engine !== "mysql") {
    return (db as any).update(table).set(patch).where(whereCond).returning();
  }
  await (db as any).update(table).set(patch).where(whereCond);
  return (db as any).select().from(table).where(whereCond);
}

/** Update satu baris by id lalu kembalikan row. */
export async function updateByIdReturning(
  table: AnyTable,
  id: number,
  patch: any
): Promise<any[]> {
  return updateReturning(table, patch, eq(table.id, id));
}
