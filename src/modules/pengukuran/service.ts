import { and, desc, eq, isNull, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { pengukuran, balita, desa } from "@/db/schema";
import { combine, softDeleteCond, searchCond } from "@/lib/query";
import { hitungUmur, umurBulan } from "@/lib/utils";
import { hitungStatusGizi } from "@/lib/gizi";

export type PengukuranInput = {
  balita_id: number;
  tanggal: string;
  berat_badan: number;
  tinggi_badan: number;
  lingkar_kepala?: number | null;
  lingkar_lengan_atas?: number | null;
};

export type ListPengukuranOpts = {
  role: "admin" | "ppkbd" | "kader";
  desa_id?: number | null;
  kader_id?: number | null;
  balita_id?: number | null;
  search?: string;
  trashed?: boolean;
  page: number;
  pageSize: number;
};

/** Scoping: admin=semua, ppkbd=desanya (via balita.desa_id), kader=miliknya (kader_id). */
function scopeConds(opts: ListPengukuranOpts): Array<SQL | undefined> {
  const conds: Array<SQL | undefined> = [
    softDeleteCond(pengukuran.deleted_at, opts.trashed),
  ];
  if (opts.role === "kader" && opts.kader_id) {
    conds.push(eq(pengukuran.kader_id, opts.kader_id));
  } else if (opts.role === "ppkbd" && opts.desa_id) {
    conds.push(
      sql`${pengukuran.balita_id} IN (SELECT id FROM balita WHERE desa_id = ${opts.desa_id} AND deleted_at IS NULL)`
    );
  }
  if (opts.balita_id) conds.push(eq(pengukuran.balita_id, opts.balita_id));
  if (opts.search) conds.push(searchCond(opts.search, [pengukuran.status_gizi]));
  return conds;
}

export async function listPengukuran(opts: ListPengukuranOpts) {
  const where = combine(...scopeConds(opts)) as SQL;
  const offset = (opts.page - 1) * opts.pageSize;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(pengukuran)
      .where(where)
      .orderBy(desc(pengukuran.tanggal), desc(pengukuran.id))
      .limit(opts.pageSize)
      .offset(offset),
    db.select({ c: sql<number>`count(*)::int` }).from(pengukuran).where(where),
  ]);

  const balitaRows = await db.select().from(balita);
  const desaRows = await db.select({ id: desa.id, nama: desa.nama }).from(desa);
  const desaMap = new Map(desaRows.map((d) => [d.id, d.nama]));
  const balitaMap = new Map(balitaRows.map((b) => [b.id, b]));

  const data = rows.map((r) => {
    const b = balitaMap.get(r.balita_id);
    return {
      ...r,
      balita_nama: b?.nama ?? null,
      balita_umur: b ? hitungUmur(b.tanggal_lahir) : null,
      balita_desa: b ? desaMap.get(b.desa_id) ?? null : null,
    };
  });

  return { data, total: countRows[0]?.c ?? 0, page: opts.page, pageSize: opts.pageSize };
}

export async function getPengukuran(id: number) {
  const rows = await db.select().from(pengukuran).where(eq(pengukuran.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createPengukuran(input: PengukuranInput, kaderId: number | null) {
  const balitaRows = await db
    .select()
    .from(balita)
    .where(and(eq(balita.id, input.balita_id), isNull(balita.deleted_at)))
    .limit(1);
  const b = balitaRows[0];
  if (!b) throw new Error("Balita tidak ditemukan");

  const bulan = umurBulan(b.tanggal_lahir, new Date(input.tanggal));
  const gizi = hitungStatusGizi(
    input.tinggi_badan,
    bulan,
    b.jenis_kelamin as "L" | "P"
  );

  const rows = await db
    .insert(pengukuran)
    .values({
      balita_id: input.balita_id,
      tanggal: input.tanggal,
      berat_badan: input.berat_badan,
      tinggi_badan: input.tinggi_badan,
      lingkar_kepala: input.lingkar_kepala ?? null,
      lingkar_lengan_atas: input.lingkar_lengan_atas ?? null,
      z_score: gizi.z_score,
      status_gizi: gizi.status_gizi,
      risiko_stunting: gizi.risiko_stunting,
      kader_id: kaderId,
      validasi_status: "menunggu",
    })
    .returning();
  return rows[0];
}

export async function updatePengukuran(id: number, input: Partial<PengukuranInput>) {
  const current = await getPengukuran(id);
  if (!current) throw new Error("Pengukuran tidak ditemukan");

  const patch: Record<string, unknown> = { updated_at: new Date() };
  if (input.balita_id !== undefined) patch.balita_id = input.balita_id;
  if (input.tanggal !== undefined) patch.tanggal = input.tanggal;
  if (input.berat_badan !== undefined) patch.berat_badan = input.berat_badan;
  if (input.tinggi_badan !== undefined) patch.tinggi_badan = input.tinggi_badan;
  if (input.lingkar_kepala !== undefined) patch.lingkar_kepala = input.lingkar_kepala;
  if (input.lingkar_lengan_atas !== undefined)
    patch.lingkar_lengan_atas = input.lingkar_lengan_atas;

  // hitung ulang gizi bila tinggi/tanggal/balita berubah
  const balitaId = (input.balita_id ?? current.balita_id) as number;
  const tinggi = (input.tinggi_badan ?? current.tinggi_badan) as number;
  const tanggal = (input.tanggal ?? current.tanggal) as string;
  if (
    input.tinggi_badan !== undefined ||
    input.tanggal !== undefined ||
    input.balita_id !== undefined
  ) {
    const bRows = await db.select().from(balita).where(eq(balita.id, balitaId)).limit(1);
    const b = bRows[0];
    if (b) {
      const bulan = umurBulan(b.tanggal_lahir, new Date(tanggal));
      const gizi = hitungStatusGizi(tinggi, bulan, b.jenis_kelamin as "L" | "P");
      patch.z_score = gizi.z_score;
      patch.status_gizi = gizi.status_gizi;
      patch.risiko_stunting = gizi.risiko_stunting;
    }
  }

  const rows = await db.update(pengukuran).set(patch).where(eq(pengukuran.id, id)).returning();
  return rows[0];
}

export async function softDeletePengukuran(id: number) {
  await db.update(pengukuran).set({ deleted_at: new Date() }).where(eq(pengukuran.id, id));
}

export async function restorePengukuran(id: number) {
  await db.update(pengukuran).set({ deleted_at: null }).where(eq(pengukuran.id, id));
}

export async function getTrashedPengukuran(page = 1, pageSize = 50) {
  return listPengukuran({ role: "admin", trashed: true, page, pageSize });
}
