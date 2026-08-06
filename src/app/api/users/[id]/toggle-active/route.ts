import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { toggleActive } from "@/modules/users/service";
import { logAudit } from "@/modules/auth/service";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const session = await requireAuth(["admin"]);
    const { id } = await params;
    const active = await toggleActive(Number(id));
    await logAudit({ user: session, aksi: active ? "Aktifkan" : "Nonaktifkan", modul: "Pengguna", detail: `${active ? "Mengaktifkan" : "Menonaktifkan"} pengguna #${id}` });
    return ok({ active }, active ? "Akun diaktifkan" : "Akun dinonaktifkan");
  });
}
