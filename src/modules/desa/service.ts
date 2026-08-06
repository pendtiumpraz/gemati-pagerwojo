import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { desa, balita, pendampingan, pengukuran, users } from "@/db/schema";

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
