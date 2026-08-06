import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth, ok, created, bad, handle } from "@/lib/api";
import { parseListParams } from "@/lib/query";
import { listPengukuran, createPengukuran } from "@/modules/pengukuran/service";
import { logAudit } from "@/modules/auth/service";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth();
    const url = new URL(req.url);
    const p = parseListParams(url);
    const balitaParam = url.searchParams.get("balita_id");
    const res = await listPengukuran({
      role: session.role,
      desa_id: session.desa_id,
      kader_id: session.id,
      balita_id: balitaParam ? Number(balitaParam) : undefined,
      search: p.search,
      trashed: p.trashed,
      page: p.page!,
      pageSize: p.pageSize!,
    });
    return ok(res);
  });
}

const schema = z.object({
  balita_id: z.number(),
  tanggal: z.string().min(1),
  berat_badan: z.number(),
  tinggi_badan: z.number(),
  lingkar_kepala: z.number().nullable().optional(),
  lingkar_lengan_atas: z.number().nullable().optional(),
});

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth(["kader", "admin"]);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return bad("Data tidak valid");
    try {
      const row = await createPengukuran(parsed.data, session.id);
      await logAudit({
        user: session,
        aksi: "Tambah Data",
        modul: "Pengukuran",
        detail: `Menambah pengukuran balita #${parsed.data.balita_id}`,
      });
      return created(row);
    } catch (e) {
      return bad((e as Error).message);
    }
  });
}
