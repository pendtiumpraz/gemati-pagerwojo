import { and, eq, isNull, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { desa, balita, pendampingan, pengukuran, users } from "@/db/schema";
import { combine, searchCond, softDeleteCond, paginate } from "@/lib/query";
import { insertReturning, updateByIdReturning } from "@/db/repo";

export type DesaInput = {
  nama: string;
  kecamatan?: string | null;
  kabupaten?: string | null;
  lat?: number | null;
  lng?: number | null;
};

/** Daftar desa untuk modul CRUD (tab Aktif/Sampah) — beda dari listDesaAgregat (statistik) */
export async function listDesaCrud(opts: {
  search?: string;
  trashed?: boolean;
  page: number;
  pageSize: number;
}) {
  const where = combine(
    softDeleteCond(desa.deleted_at, opts.trashed),
    searchCond(opts.search, [desa.nama, desa.kecamatan])
  );
  const res = await paginate<typeof desa.$inferSelect>({
    table: desa,
    where,
    orderBy: desc(desa.created_at),
    page: opts.page,
    pageSize: opts.pageSize,
  });
  const data = res.data.map((d) => ({
    id: d.id,
    nama: d.nama,
    kecamatan: d.kecamatan,
    kabupaten: d.kabupaten,
    lat: d.lat,
    lng: d.lng,
  }));
  return { ...res, data };
}

export async function getDesa(id: number) {
  const rows = await db.select().from(desa).where(eq(desa.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createDesa(input: DesaInput) {
  const nama = input.nama?.trim();
  if (!nama) throw new Error("Nama desa wajib diisi");
  const rows = await insertReturning(desa, {
    nama,
    kecamatan: input.kecamatan?.trim() || "Pagerwojo",
    kabupaten: input.kabupaten?.trim() || "Tulungagung",
    lat: input.lat ?? null,
    lng: input.lng ?? null,
  });
  return rows[0];
}

export async function updateDesa(id: number, input: Partial<DesaInput>) {
  const patch: Record<string, unknown> = { updated_at: new Date() };
  if (input.nama !== undefined) {
    const nama = input.nama?.trim();
    if (!nama) throw new Error("Nama desa wajib diisi");
    patch.nama = nama;
  }
  if (input.kecamatan !== undefined) patch.kecamatan = input.kecamatan?.trim() || "Pagerwojo";
  if (input.kabupaten !== undefined) patch.kabupaten = input.kabupaten?.trim() || "Tulungagung";
  if (input.lat !== undefined) patch.lat = input.lat ?? null;
  if (input.lng !== undefined) patch.lng = input.lng ?? null;

  const rows = await updateByIdReturning(desa, id, patch);
  if (!rows[0]) throw new Error("Desa tidak ditemukan");
  return rows[0];
}

export async function softDeleteDesa(id: number) {
  await db.update(desa).set({ deleted_at: new Date() }).where(eq(desa.id, id));
}

export async function restoreDesa(id: number) {
  await db.update(desa).set({ deleted_at: null }).where(eq(desa.id, id));
}

/** Daftar desa ringkas untuk select */
export async function listDesaRingkas() {
  return db
    .select({ id: desa.id, nama: desa.nama })
    .from(desa)
    .where(isNull(desa.deleted_at))
    .orderBy(desa.id);
}

/** Daftar desa lengkap dengan agregat (untuk halaman Data Desa / Rekap) */
export async function listDesaAgregat() {
  const desaRows = await db.select().from(desa).where(isNull(desa.deleted_at)).orderBy(desa.id);

  return Promise.all(
    desaRows.map(async (d) => {
      const [bCount, pCount, pValid, riskCount, kaderCount, avg] = await Promise.all([
        db.select({ c: sql<number>`count(*)::int` }).from(balita).where(and(eq(balita.desa_id, d.id), isNull(balita.deleted_at))),
        db.select({ c: sql<number>`count(*)::int` }).from(pendampingan).where(and(isNull(pendampingan.deleted_at), inDesaPend(d.id))),
        db.select({ c: sql<number>`count(*)::int` }).from(pendampingan).where(and(isNull(pendampingan.deleted_at), eq(pendampingan.validasi_status, "disetujui"), inDesaPend(d.id))),
        db.select({ c: sql<number>`count(*)::int` }).from(pengukuran).where(and(isNull(pengukuran.deleted_at), eq(pengukuran.risiko_stunting, "tinggi"), inDesaPeng(d.id))),
        db.select({ c: sql<number>`count(*)::int` }).from(users).where(and(eq(users.desa_id, d.id), eq(users.role, "kader"), isNull(users.deleted_at))),
        db
          .select({
            bb: sql<number>`coalesce(avg(${pengukuran.berat_badan}),0)`,
            tb: sql<number>`coalesce(avg(${pengukuran.tinggi_badan}),0)`,
          })
          .from(pengukuran)
          .where(and(isNull(pengukuran.deleted_at), inDesaPeng(d.id))),
      ]);

      const balitaCount = bCount[0]?.c ?? 0;
      const pend = pCount[0]?.c ?? 0;
      const valid = pValid[0]?.c ?? 0;
      const persen = pend > 0 ? Math.round((valid / pend) * 100) : 0;

      return {
        id: d.id,
        nama: d.nama,
        kecamatan: d.kecamatan,
        lat: d.lat,
        lng: d.lng,
        balita: balitaCount,
        kader: kaderCount[0]?.c ?? 0,
        pendampingan: pend,
        valid,
        belum_valid: pend - valid,
        persentase: persen,
        risiko_stunting: riskCount[0]?.c ?? 0,
        rata_bb: Math.round((avg[0]?.bb ?? 0) * 10) / 10,
        rata_tb: Math.round((avg[0]?.tb ?? 0) * 10) / 10,
      };
    })
  );
}

// pendampingan/pengukuran tidak punya desa_id langsung → via balita
function inDesaPend(desaId: number) {
  return sql`${pendampingan.balita_id} IN (SELECT id FROM balita WHERE desa_id = ${desaId} AND deleted_at IS NULL)`;
}
function inDesaPeng(desaId: number) {
  return sql`${pengukuran.balita_id} IN (SELECT id FROM balita WHERE desa_id = ${desaId} AND deleted_at IS NULL)`;
}
