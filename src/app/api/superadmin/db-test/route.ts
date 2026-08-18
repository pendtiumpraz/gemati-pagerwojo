import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth, ok, bad, handle } from "@/lib/api";
import { testConnection } from "@/lib/db-test";

const schema = z.object({
  engine: z.enum(["neon", "postgres", "mysql"]),
  url: z.string().optional(),
  ssl: z.boolean().optional(),
  host: z.string().optional(),
  port: z.coerce.number().optional(),
  user: z.string().optional(),
  password: z.string().optional(),
  database: z.string().optional(),
});

// POST /api/superadmin/db-test — uji koneksi tanpa menyimpan
export async function POST(req: NextRequest) {
  return handle(async () => {
    await requireAuth(["admin"]);
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return bad("Data tidak valid");
    const result = await testConnection(parsed.data);
    return ok(result, result.message);
  });
}
