import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth, ok, created, bad, handle } from "@/lib/api";
import { parseListParams } from "@/lib/query";
import { listDesaRingkas, listDesaAgregat, listDesaCrud, createDesa } from "@/modules/desa/service";
import { logAudit } from "@/modules/auth/service";

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAuth();
    const url = new URL(req.url);
    if (url.searchParams.get("agregat") === "1") {
      return ok(await listDesaAgregat());
    }
    if (url.searchParams.get("crud") === "1") {
      const p = parseListParams(url);
      return ok(await listDesaCrud({ ...p, page: p.page!, pageSize: p.pageSize! }));
    }
    return ok(await listDesaRingkas());
  });
}

const schema = z.object({
  nama: z.string().min(1),
  kecamatan: z.string().nullable().optional(),
  kabupaten: z.string().nullable().optional(),
  lat: z.number().nullable().optional(),
  lng: z.number().nullable().optional(),
});

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth(["admin"]);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return bad("Data tidak valid");
    try {
      const d = await createDesa(parsed.data);
      await logAudit({ user: session, aksi: "Tambah Data", modul: "Desa", detail: `Menambah desa ${d.nama}` });
      return created(d);
    } catch (e) {
      return bad((e as Error).message);
    }
  });
}
