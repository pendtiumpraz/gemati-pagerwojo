import { and, eq, inArray, isNull, sql, desc } from "drizzle-orm";
import { db } from "@/db";
import { balita, pendampingan, pengukuran, users } from "@/db/schema";
import { listDesaAgregat } from "@/modules/desa/service";
import { formatDateISO } from "@/lib/utils";
import type { SessionUser } from "@/lib/session";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function lastMonths(n: number) {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({
      key: `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}`,
      label: BULAN[t.getMonth()],
    });
  }
  return out;
}

function lastDays(n: number) {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const t = new Date(now);
    t.setDate(now.getDate() - i);
    out.push({ key: formatDateISO(t), label: HARI[t.getDay()] });
  }
  return out;
}

type PendRow = {
  balita_id: number;
  tanggal: string | null;
  makan: boolean;
  jumlah: number | null;
  kader_id: number | null;
  validasi: string;
};

function daily(rows: PendRow[], days: { key: string; label: string }[]) {
  return days.map((d) => ({ name: d.label, value: rows.filter((r) => r.tanggal === d.key).length }));
}
function monthly(rows: PendRow[], months: { key: string; label: string }[]) {
  return months.map((m) => ({
    name: m.label,
    value: rows.filter((r) => (r.tanggal || "").slice(0, 7) === m.key).length,
  }));
}
function konsumsiBulanan(rows: PendRow[], months: { key: string; label: string }[]) {
  return months.map((m) => {
    const inM = rows.filter((r) => (r.tanggal || "").slice(0, 7) === m.key);
    const makan = inM.filter((r) => r.makan).length;
    return { name: m.label, value: inM.length ? Math.round((makan / inM.length) * 100) : 0 };
  });
}

async function countRows(table: any, where: any) {
  const r = await db.select({ c: sql<number>`count(*)::int` }).from(table).where(where);
  return r[0]?.c ?? 0;
}

/* ============================== ADMIN ============================== */
async function adminStats() {
  const [agregat, balitaRows, pendRows, pengRows, kaderCount, ppkbdCount] = await Promise.all([
    listDesaAgregat(),
    db
      .select({ status: balita.status })
      .from(balita)
      .where(isNull(balita.deleted_at)),
    db
      .select({
        balita_id: pendampingan.balita_id,
        tanggal: pendampingan.tanggal,
        makan: pendampingan.makan_telur,
        jumlah: pendampingan.jumlah_butir,
        kader_id: pendampingan.kader_id,
        validasi: pendampingan.validasi_status,
      })
      .from(pendampingan)
      .where(isNull(pendampingan.deleted_at)),
    db
      .select({ gizi: pengukuran.status_gizi, risiko: pengukuran.risiko_stunting })
      .from(pengukuran)
      .where(isNull(pengukuran.deleted_at)),
    countRows(users, and(eq(users.role, "kader"), isNull(users.deleted_at))),
    countRows(users, and(eq(users.role, "ppkbd"), isNull(users.deleted_at))),
  ]);

  const totalBalita = balitaRows.length;
  const balitaAktif = balitaRows.filter((b) => b.status === "aktif").length;
  const totalPend = pendRows.length;
  const valid = pendRows.filter((p) => p.validasi === "disetujui").length;
  const makan = pendRows.filter((p) => p.makan).length;
  const risiko = pengRows.filter((p) => p.risiko === "tinggi").length;

  const months = lastMonths(6);

  const statusGizi = [
    { name: "Normal", value: pengRows.filter((p) => p.gizi === "normal").length, color: "#2e7d32" },
    { name: "Kurang", value: pengRows.filter((p) => p.gizi === "kurang").length, color: "#FBC02D" },
    { name: "Sangat Kurang", value: pengRows.filter((p) => p.gizi === "sangat_kurang").length, color: "#dc2626" },
  ].filter((s) => s.value > 0);

  return {
    role: "admin" as const,
    stats: {
      desa: agregat.length,
      kader: kaderCount,
      ppkbd: ppkbdCount,
      balita: totalBalita,
      pendampingan: totalPend,
      valid,
      belum_valid: totalPend - valid,
      risiko,
    },
    persentase: {
      tervalidasi: totalPend ? Math.round((valid / totalPend) * 100) : 0,
      balita_aktif: totalBalita ? Math.round((balitaAktif / totalBalita) * 100) : 0,
      konsumsi: totalPend ? Math.round((makan / totalPend) * 100) : 0,
    },
    pendampinganPerDesa: agregat.map((d) => ({ name: d.nama, value: d.pendampingan })),
    balitaPerDesa: agregat.map((d) => ({ name: d.nama, value: d.balita })),
    statusGizi,
    risikoStunting: [
      { name: "Risiko Tinggi", value: risiko, color: "#dc2626" },
      { name: "Normal", value: Math.max(0, pengRows.length - risiko), color: "#2e7d32" },
    ].filter((s) => s.value > 0),
    konsumsiBulanan: konsumsiBulanan(pendRows as PendRow[], months),
    peta: withCoords(agregat),
  };
}

// Sebar marker di sekitar Pagerwojo bila lat/lng belum diisi
function withCoords(agregat: any[]) {
  const baseLat = -8.13;
  const baseLng = 111.77;
  return agregat.map((d, i) => {
    const angle = (i / Math.max(1, agregat.length)) * Math.PI * 2;
    return {
      nama: d.nama,
      balita: d.balita,
      lat: typeof d.lat === "number" ? d.lat : baseLat + Math.sin(angle) * 0.03,
      lng: typeof d.lng === "number" ? d.lng : baseLng + Math.cos(angle) * 0.04,
    };
  });
}

/* ============================== PPKBD ============================== */
async function ppkbdStats(session: SessionUser) {
  const desaId = session.desa_id;
  if (!desaId) return emptyPpkbd();

  const balitaRows = await db
    .select({ id: balita.id, nama: balita.nama, status: balita.status, validasi: balita.validasi_status })
    .from(balita)
    .where(and(eq(balita.desa_id, desaId), isNull(balita.deleted_at)));

  const balitaIds = balitaRows.map((b) => b.id);
  const nameOf = new Map(balitaRows.map((b) => [b.id, b.nama]));

  const [kaderRows, pendRows, pengRows] = await Promise.all([
    db
      .select({ id: users.id, nama: users.nama })
      .from(users)
      .where(and(eq(users.desa_id, desaId), eq(users.role, "kader"), isNull(users.deleted_at))),
    balitaIds.length
      ? db
          .select({
            balita_id: pendampingan.balita_id,
            tanggal: pendampingan.tanggal,
            makan: pendampingan.makan_telur,
            jumlah: pendampingan.jumlah_butir,
            kader_id: pendampingan.kader_id,
            validasi: pendampingan.validasi_status,
          })
          .from(pendampingan)
          .where(and(inArray(pendampingan.balita_id, balitaIds), isNull(pendampingan.deleted_at)))
      : Promise.resolve([] as PendRow[]),
    balitaIds.length
      ? db
          .select({ gizi: pengukuran.status_gizi, risiko: pengukuran.risiko_stunting })
          .from(pengukuran)
          .where(and(inArray(pengukuran.balita_id, balitaIds), isNull(pengukuran.deleted_at)))
      : Promise.resolve([] as { gizi: string | null; risiko: string | null }[]),
  ]);

  const totalPend = pendRows.length;
  const sudahValid = pendRows.filter((p) => p.validasi === "disetujui").length;
  const menunggu = pendRows.filter((p) => p.validasi === "menunggu").length;
  const risiko = pengRows.filter((p) => p.risiko === "tinggi").length;

  const rankingKader = kaderRows
    .map((k) => ({ nama: k.nama, pendampingan: pendRows.filter((p) => p.kader_id === k.id).length }))
    .sort((a, b) => b.pendampingan - a.pendampingan);

  const menungguList = pendRows
    .filter((p) => p.validasi === "menunggu")
    .slice(0, 8)
    .map((p) => ({
      balita_nama: nameOf.get(p.balita_id) || "-",
      detail: `${p.tanggal || "-"} · ${p.makan ? `${p.jumlah ?? 1} butir` : "Tidak makan"}`,
      status: p.validasi,
    }));

  return {
    role: "ppkbd" as const,
    desa_nama: session.desa_nama || "",
    stats: {
      balita: balitaRows.length,
      kader: kaderRows.length,
      pendampingan: totalPend,
      sudah_valid: sudahValid,
      belum_valid: totalPend - sudahValid,
      risiko,
    },
    mingguan: daily(pendRows as PendRow[], lastDays(7)),
    bulanan: monthly(pendRows as PendRow[], lastMonths(6)),
    statusGizi: [
      { name: "Normal", value: pengRows.filter((p) => p.gizi === "normal").length, color: "#2e7d32" },
      { name: "Kurang", value: pengRows.filter((p) => p.gizi === "kurang").length, color: "#FBC02D" },
      { name: "Sangat Kurang", value: pengRows.filter((p) => p.gizi === "sangat_kurang").length, color: "#dc2626" },
    ].filter((s) => s.value > 0),
    statusValidasi: [
      { name: "Disetujui", value: sudahValid, color: "#2e7d32" },
      { name: "Menunggu Validasi", value: menunggu, color: "#FBC02D" },
      { name: "Ditolak", value: pendRows.filter((p) => p.validasi === "ditolak").length, color: "#dc2626" },
    ].filter((s) => s.value > 0),
    rankingKader,
    menungguValidasi: menungguList,
  };
}

function emptyPpkbd() {
  return {
    role: "ppkbd" as const,
    desa_nama: "",
    stats: { balita: 0, kader: 0, pendampingan: 0, sudah_valid: 0, belum_valid: 0, risiko: 0 },
    mingguan: daily([], lastDays(7)),
    bulanan: monthly([], lastMonths(6)),
    statusGizi: [],
    statusValidasi: [],
    rankingKader: [],
    menungguValidasi: [],
  };
}

/* ============================== KADER ============================== */
async function kaderStats(session: SessionUser) {
  const kaderId = session.id;

  const balitaRows = await db
    .select({ id: balita.id, nama: balita.nama })
    .from(balita)
    .where(and(eq(balita.kader_id, kaderId), isNull(balita.deleted_at)));
  const nameOf = new Map(balitaRows.map((b) => [b.id, b.nama]));

  const pendRows = await db
    .select({
      balita_id: pendampingan.balita_id,
      tanggal: pendampingan.tanggal,
      makan: pendampingan.makan_telur,
      jumlah: pendampingan.jumlah_butir,
      kader_id: pendampingan.kader_id,
      validasi: pendampingan.validasi_status,
    })
    .from(pendampingan)
    .where(and(eq(pendampingan.kader_id, kaderId), isNull(pendampingan.deleted_at)))
    .orderBy(desc(pendampingan.tanggal), desc(pendampingan.id));

  const menunggu = pendRows.filter((p) => p.validasi === "menunggu").length;
  const disetujui = pendRows.filter((p) => p.validasi === "disetujui").length;
  const ditolak = pendRows.filter((p) => p.validasi === "ditolak").length;

  const aktivitas = pendRows.slice(0, 6).map((p) => ({
    balita_nama: nameOf.get(p.balita_id) || "-",
    detail: `${p.tanggal || "-"} · ${p.makan ? `${p.jumlah ?? 1} butir` : "Tidak makan"}`,
    status: p.validasi,
  }));

  return {
    role: "kader" as const,
    nama: session.nama,
    stats: {
      balita: balitaRows.length,
      pendampingan: pendRows.length,
      menunggu,
      disetujui,
      ditolak,
    },
    mingguan: daily(pendRows as PendRow[], lastDays(7)),
    bulanan: monthly(pendRows as PendRow[], lastMonths(6)),
    statusValidasi: [
      { name: "Disetujui", value: disetujui, color: "#2e7d32" },
      { name: "Menunggu Validasi", value: menunggu, color: "#FBC02D" },
      { name: "Ditolak", value: ditolak, color: "#dc2626" },
    ].filter((s) => s.value > 0),
    aktivitas,
  };
}

export type DashboardStats =
  | Awaited<ReturnType<typeof adminStats>>
  | Awaited<ReturnType<typeof ppkbdStats>>
  | Awaited<ReturnType<typeof kaderStats>>;

export async function getDashboardStats(session: SessionUser): Promise<DashboardStats> {
  if (session.role === "admin") return adminStats();
  if (session.role === "ppkbd") return ppkbdStats(session);
  return kaderStats(session);
}
