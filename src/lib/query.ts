import { and, asc, desc, ilike, isNull, isNotNull, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";

export type ListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  trashed?: boolean;
};

export function parseListParams(url: URL): ListParams {
  const p = url.searchParams;
  return {
    page: Math.max(1, parseInt(p.get("page") || "1")),
    pageSize: Math.min(200, Math.max(1, parseInt(p.get("pageSize") || "50"))),
    search: p.get("search")?.trim() || undefined,
    trashed: p.get("trashed") === "1" || p.get("trashed") === "true",
  };
}

/** Kondisi soft-delete: aktif (deleted_at IS NULL) atau trashed (IS NOT NULL) */
export function softDeleteCond(deletedCol: any, trashed?: boolean): SQL {
  return trashed ? isNotNull(deletedCol) : isNull(deletedCol);
}

/** Gabung beberapa kondisi (skip undefined) */
export function combine(...conds: Array<SQL | undefined>): SQL | undefined {
  const list = conds.filter(Boolean) as SQL[];
  if (list.length === 0) return undefined;
  if (list.length === 1) return list[0];
  return and(...list);
}

/** Search ILIKE di beberapa kolom */
export function searchCond(search: string | undefined, cols: any[]): SQL | undefined {
  if (!search) return undefined;
  const term = `%${search}%`;
  return or(...cols.map((c) => ilike(c, term)));
}

/** Ambil list + total dengan pagination */
export async function paginate<T>(opts: {
  table: any;
  where?: SQL;
  orderBy?: any;
  page: number;
  pageSize: number;
}): Promise<{ data: T[]; total: number; page: number; pageSize: number }> {
  const { table, where, orderBy, page, pageSize } = opts;
  const offset = (page - 1) * pageSize;

  const dataQ = db.select().from(table).limit(pageSize).offset(offset);
  if (where) dataQ.where(where);
  if (orderBy) dataQ.orderBy(orderBy);

  const countQ = db.select({ c: sql<number>`count(*)::int` }).from(table);
  if (where) countQ.where(where);

  const [data, countRows] = await Promise.all([dataQ, countQ]);
  return {
    data: data as T[],
    total: countRows[0]?.c ?? 0,
    page,
    pageSize,
  };
}

export { and, asc, desc, isNull, isNotNull, sql };
