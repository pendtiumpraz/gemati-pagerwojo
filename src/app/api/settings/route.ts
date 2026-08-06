import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth, ok, bad, handle } from "@/lib/api";
import { getSettings, updateSettings } from "@/modules/settings/service";
import { logAudit } from "@/modules/auth/service";

export async function GET() {
  return handle(async () => {
    await requireAuth(["admin"]);
    return ok(await getSettings());
  });
}

const schema = z.object({
  nama_aplikasi: z.string().min(1).optional(),
  kecamatan: z.string().min(1).optional(),
  kabupaten: z.string().min(1).optional(),
  provinsi: z.string().min(1).optional(),
  session_timeout: z.number().int().min(1).optional(),
  batas_login: z.number().int().min(1).optional(),
  mode_maintenance: z.boolean().optional(),
  notif_email: z.boolean().optional(),
  notif_push: z.boolean().optional(),
  backup_otomatis: z.boolean().optional(),
});

export async function PUT(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth(["admin"]);
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return bad("Data tidak valid");
    const updated = await updateSettings(parsed.data);
    await logAudit({
      user: session,
      aksi: "Edit Data",
      modul: "Pengaturan",
      detail: "Memperbarui pengaturan aplikasi",
    });
    return ok(updated, "Pengaturan berhasil disimpan");
  });
}
