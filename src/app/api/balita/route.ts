import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth, ok, created, bad, handle } from "@/lib/api";
import { parseListParams } from "@/lib/query";
import { listBalita, createBalita } from "@/modules/balita/service";
import { logAudit } from "@/modules/auth/service";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth();
    const url = new URL(req.url);
    const p = parseListParams(url);
    const res = await listBalita({
      role: session.role,
      desa_id: session.desa_id,
      kader_id: session.id,
      search: p.search,
      trashed: false,
      page: p.page!,
      pageSize: p.pageSize!,
    });
    return ok(res);
  });
}

const schema = z.object({
  nik: z.string().min(1),
  nama: z.string().min(1),
  jenis_kelamin: z.enum(["L", "P"]),
  tempat_lahir: z.string().nullable().optional(),
  tanggal_lahir: z.string().min(1),
  nama_ayah: z.string().nullable().optional(),
  nama_ibu: z.string().min(1),
  no_hp: z.string().nullable().optional(),
  alamat: z.string().nullable().optional(),
  rt: z.string().nullable().optional(),
  rw: z.string().nullable().optional(),
  dusun: z.string().nullable().optional(),
  desa_id: z.number(),
  posyandu_id: z.number().nullable().optional(),
  foto: z.string().nullable().optional(),
  status: z.enum(["aktif", "nonaktif"]).optional(),
});

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth(["admin", "kader"]);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return bad("Data tidak valid");

    // kader menempel sebagai pendamping; admin boleh tanpa kader
    const kaderId = session.role === "kader" ? session.id : null;
    try {
      const b = await createBalita(parsed.data, kaderId);
      await logAudit({ user: session, aksi: "Tambah Data", modul: "Balita", detail: `Menambah balita ${b.nama}` });
      return created(b);
    } catch (e) {
      return bad((e as Error).message);
    }
  });
}
