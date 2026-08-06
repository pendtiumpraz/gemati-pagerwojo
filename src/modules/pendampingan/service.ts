import { and, asc, desc, eq, isNull, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { pendampingan, balita, desa } from "@/db/schema";
import { combine, softDeleteCond, searchCond } from "@/lib/query";
import { hitungUmur } from "@/lib/utils";

export type PendampinganInput = {
  balita_id: number;
  tanggal: string;
  jam?: string | null;
  makan_telur: boolean;
  jumlah_butir?: number | null;
  nama_pendamping?: string | null;
  keterangan?: string | null;
  foto_dokumentasi?: string | null;
  lokasi_lat?: number | null;
  lokasi_lng?: number | null;
};

export type ListPendampinganOpts = {
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
function scopeConds(opts: ListPendampinganOpts): Array<SQL | undefined> {
  const conds: Array<SQL | undefined> = [
    softDeleteCond(pendampingan.deleted_at, opts.trashed),
  ];
  if (opts.role === "kader" && opts.kader_id) {
    conds.push(eq(pendampingan.kader_id, opts.kader_id));
  } else if (opts.role === "ppkbd" && opts.desa_id) {
    conds.push(
      sql`${pendampingan.balita_id} IN (SELECT id FROM balita WHERE desa_id = ${opts.desa_id} AND deleted_at IS NULL)`
    );
  }
  if (opts.balita_id) conds.push(eq(pendampingan.balita_id, opts.balita_id));
  if (opts.search)
    conds.push(searchCond(opts.search, [pendampingan.nama_pendamping, pendampingan.keterangan]));
  return conds;
}

export async function listPendampingan(opts: ListPendampinganOpts) {
  const where = combine(...scopeConds(opts)) as SQL;
  const offset = (opts.page - 1) * opts.pageSize;

  const [rows, countRows] = await Promise.all([
    db
      .select()
      .from(pendampingan)
      .where(where)
      .orderBy(desc(pendampingan.tanggal), desc(pendampingan.id))
      .limit(opts.pageSize)
      .offset(offset),
    db.select({ c: sql<number>`count(*)::int` }).from(pendampingan).where(where),
  ]);

  // enrich: balita_nama, balita_umur, balita_desa
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

export async function getPendampingan(id: number) {
  const rows = await db.select().from(pendampingan).where(eq(pendampingan.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createPendampingan(
  input: PendampinganInput,
  kaderId: number | null,
  kaderNama: string | null
) {
  // hari_ke otomatis: hari ke-1 pada pendampingan pertama balita ini,
  // selisih hari (+1) terhadap tanggal pendampingan pertama untuk berikutnya.
  const firstRows = await db
    .select({ tanggal: pendampingan.tanggal })
    .from(pendampingan)
    .where(and(eq(pendampingan.balita_id, input.balita_id), isNull(pendampingan.deleted_at)))
    .orderBy(asc(pendampingan.tanggal))
    .limit(1);

  let hari_ke = 1;
  if (firstRows[0]) {
    const first = new Date(firstRows[0].tanggal);
    const cur = new Date(input.tanggal);
    const diff = Math.round((cur.getTime() - first.getTime()) / 86400000);
    hari_ke = diff >= 0 ? diff + 1 : 1;
  }

  const rows = await db
    .insert(pendampingan)
    .values({
      balita_id: input.balita_id,
      tanggal: input.tanggal,
      hari_ke,
      jam: input.jam ?? null,
      makan_telur: input.makan_telur,
      jumlah_butir: input.makan_telur ? input.jumlah_butir ?? null : null,
      kader_id: kaderId,
      nama_pendamping: kaderNama,
      keterangan: input.keterangan ?? null,
      foto_dokumentasi: input.foto_dokumentasi ?? null,
      lokasi_lat: input.lokasi_lat ?? null,
      lokasi_lng: input.lokasi_lng ?? null,
      validasi_status: "menunggu",
    })
    .returning();
  return rows[0];
}

export async function updatePendampingan(id: number, input: Partial<PendampinganInput>) {
  const patch: Record<string, unknown> = { updated_at: new Date() };
  if (input.balita_id !== undefined) patch.balita_id = input.balita_id;
  if (input.tanggal !== undefined) patch.tanggal = input.tanggal;
  if (input.jam !== undefined) patch.jam = input.jam;
  if (input.makan_telur !== undefined) {
    patch.makan_telur = input.makan_telur;
    if (!input.makan_telur) patch.jumlah_butir = null;
  }
  if (input.jumlah_butir !== undefined && input.makan_telur !== false)
    patch.jumlah_butir = input.jumlah_butir;
  if (input.nama_pendamping !== undefined) patch.nama_pendamping = input.nama_pendamping;
  if (input.keterangan !== undefined) patch.keterangan = input.keterangan;
  if (input.foto_dokumentasi !== undefined) patch.foto_dokumentasi = input.foto_dokumentasi;
  if (input.lokasi_lat !== undefined) patch.lokasi_lat = input.lokasi_lat;
  if (input.lokasi_lng !== undefined) patch.lokasi_lng = input.lokasi_lng;

  const rows = await db
    .update(pendampingan)
    .set(patch)
    .where(eq(pendampingan.id, id))
    .returning();
  if (!rows[0]) throw new Error("Pendampingan tidak ditemukan");
  return rows[0];
}

export async function softDeletePendampingan(id: number) {
  await db.update(pendampingan).set({ deleted_at: new Date() }).where(eq(pendampingan.id, id));
}

export async function restorePendampingan(id: number) {
  await db.update(pendampingan).set({ deleted_at: null }).where(eq(pendampingan.id, id));
}

export async function getTrashedPendampingan(page = 1, pageSize = 50) {
  return listPendampingan({ role: "admin", trashed: true, page, pageSize });
}
