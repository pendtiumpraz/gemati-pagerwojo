import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth, ok, created, bad, handle } from "@/lib/api";
import { parseListParams } from "@/lib/query";
import { listUsers, createUser } from "@/modules/users/service";
import { logAudit } from "@/modules/auth/service";

export async function GET(req: NextRequest) {
  return handle(async () => {
    await requireAuth(["admin"]);
    const url = new URL(req.url);
    const p = parseListParams(url);
    const role = url.searchParams.get("role") || undefined;
    const res = await listUsers({ ...p, role, page: p.page!, pageSize: p.pageSize! });
    return ok(res);
  });
}

const schema = z.object({
  nama: z.string().min(1),
  username: z.string().min(1),
  role: z.enum(["admin", "ppkbd", "kader"]),
  desa_id: z.number().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  password: z.string().optional(),
});

export async function POST(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth(["admin"]);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return bad("Data tidak valid");
    try {
      const user = await createUser(parsed.data);
      await logAudit({ user: session, aksi: "Tambah Data", modul: "Pengguna", detail: `Menambah pengguna ${user.nama}` });
      return created(user);
    } catch (e) {
      return bad((e as Error).message);
    }
  });
}
