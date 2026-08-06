import { and, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { combine } from "@/lib/query";

export type AuditFilter = {
  aksi?: string;
  role?: string;
  search?: string;
  page: number;
  pageSize: number;
};

function searchCond(search?: string): SQL | undefined {
  if (!search) return undefined;
  const term = `%${search}%`;
  return or(
    ilike(auditLogs.user_nama, term),
    ilike(auditLogs.detail, term),
    ilike(auditLogs.modul, term),
    ilike(auditLogs.aksi, term)
  );
}

export async function listAudit(opts: AuditFilter) {
  const where = combine(
    opts.aksi ? eq(auditLogs.aksi, opts.aksi) : undefined,
    opts.role ? eq(auditLogs.user_role, opts.role) : undefined,
    searchCond(opts.search)
  );

  const offset = (opts.page - 1) * opts.pageSize;

  const dataQ = db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.created_at))
    .limit(opts.pageSize)
    .offset(offset);
  if (where) dataQ.where(where);

  const countQ = db.select({ c: sql<number>`count(*)::int` }).from(auditLogs);
  if (where) countQ.where(where);

  const countBy = (aksi: string) =>
    db
      .select({ c: sql<number>`count(*)::int` })
      .from(auditLogs)
      .where(eq(auditLogs.aksi, aksi));

  const [data, filtered, totalRows, loginRows, tambahRows, validasiRows] =
    await Promise.all([
      dataQ,
      countQ,
      db.select({ c: sql<number>`count(*)::int` }).from(auditLogs),
      countBy("Login"),
      countBy("Tambah Data"),
      countBy("Validasi"),
    ]);

  return {
    data,
    total: filtered[0]?.c ?? 0,
    page: opts.page,
    pageSize: opts.pageSize,
    counts: {
      total: totalRows[0]?.c ?? 0,
      login: loginRows[0]?.c ?? 0,
      tambah_data: tambahRows[0]?.c ?? 0,
      validasi: validasiRows[0]?.c ?? 0,
    },
  };
}
