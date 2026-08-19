import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { desa, posyandu, balita } from "@/db/schema";
import { blindIndex } from "@/lib/crypto";

export type ImportResult = {
  inserted: number;
  failed: number;
  errors: { row: number; message: string }[];
};

/** Jalankan import baris demi baris. Baris kosong dilewati. Error dikumpulkan (tidak menggagalkan semua). */
export async function runImport(
  rows: any[],
  handler: (row: any) => Promise<void>
): Promise<ImportResult> {
  const errors: { row: number; message: string }[] = [];
  let inserted = 0;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r || Object.values(r).every((v) => v === "" || v == null)) continue;
    try {
      await handler(r);
      inserted++;
    } catch (e: any) {
      // +2 = baris spreadsheet (header di baris 1, data mulai baris 2)
      errors.push({ row: i + 2, message: e?.message || "Gagal" });
    }
  }
  return { inserted, failed: errors.length, errors };
}

/** Preload lookup desa & posyandu (hindari query per baris). */
export async function createLookups() {
  const [desaRows, posyRows] = await Promise.all([
    db.select().from(desa).where(isNull(desa.deleted_at)),
    db.select().from(posyandu).where(isNull(posyandu.deleted_at)),
  ]);
  const norm = (s: string) => String(s || "").toLowerCase().replace(/^desa\s+/i, "").trim();
  const desaByName = new Map(desaRows.map((d) => [norm(d.nama), d.id]));
  const posyByName = new Map(
    posyRows.map((p) => [String(p.nama || "").toLowerCase().trim(), { id: p.id, desa_id: p.desa_id }])
  );
  return {
    desaId: (nama?: string): number | null =>
      nama ? desaByName.get(norm(nama)) ?? null : null,
    posyanduId: (nama?: string): number | null => {
      if (!nama) return null;
      const p = posyByName.get(String(nama).toLowerCase().trim());
      return p ? p.id : null;
    },
  };
}

/** Cari balita by NIK (via blind index, karena NIK terenkripsi). */
export async function findBalitaIdByNik(nik: string): Promise<number | null> {
  const hash = blindIndex(String(nik || "").trim());
  if (!hash) return null;
  const rows = await db
    .select({ id: balita.id })
    .from(balita)
    .where(and(eq(balita.nik_hash, hash), isNull(balita.deleted_at)))
    .limit(1);
  return rows[0]?.id ?? null;
}

export function req(row: any, key: string, label: string): string {
  const v = row[key];
  if (v === undefined || v === null || String(v).trim() === "")
    throw new Error(`${label} wajib diisi`);
  return String(v).trim();
}
