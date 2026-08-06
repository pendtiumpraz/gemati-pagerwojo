import { listDesaAgregat } from "@/modules/desa/service";

export type RekapRow = {
  id: number;
  nama: string;
  balita: number;
  pendampingan: number;
  valid: number;
  belum_valid: number;
  persentase: number;
  risiko_stunting: number;
  normal: number;
  rata_bb: number;
  rata_tb: number;
};

export type RekapTotals = {
  desa: number;
  balita: number;
  pendampingan: number;
  valid: number;
  belum_valid: number;
  risiko_stunting: number;
  persentase: number;
};

export type RekapFilter = {
  desa_id?: number;
  bulan?: number;
  tahun?: number;
  status?: string;
};

/**
 * Rekapitulasi per desa berbasis agregat desa.
 * (bulan/tahun/status diterima untuk kompatibilitas filter UI —
 *  agregat dihitung dari seluruh data pada service desa)
 */
export async function getRekap(filter: RekapFilter = {}) {
  const agg = await listDesaAgregat();

  let source = agg;
  if (filter.desa_id) source = source.filter((d) => d.id === filter.desa_id);

  const rows: RekapRow[] = source.map((d) => ({
    id: d.id,
    nama: d.nama,
    balita: d.balita,
    pendampingan: d.pendampingan,
    valid: d.valid,
    belum_valid: d.belum_valid,
    persentase: d.persentase,
    risiko_stunting: d.risiko_stunting,
    normal: Math.max(0, d.balita - d.risiko_stunting),
    rata_bb: d.rata_bb,
    rata_tb: d.rata_tb,
  }));

  const totalPend = rows.reduce((a, r) => a + r.pendampingan, 0);
  const totalValid = rows.reduce((a, r) => a + r.valid, 0);

  const totals: RekapTotals = {
    desa: rows.length,
    balita: rows.reduce((a, r) => a + r.balita, 0),
    pendampingan: totalPend,
    valid: totalValid,
    belum_valid: rows.reduce((a, r) => a + r.belum_valid, 0),
    risiko_stunting: rows.reduce((a, r) => a + r.risiko_stunting, 0),
    persentase: totalPend > 0 ? Math.round((totalValid / totalPend) * 100) : 0,
  };

  return { rows, totals };
}
