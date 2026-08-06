import { NextRequest } from "next/server";
import { requireAuth, ok, handle } from "@/lib/api";
import { resetPassword } from "@/modules/users/service";
import { logAudit } from "@/modules/auth/service";

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const session = await requireAuth(["admin"]);
    const { id } = await params;
    const pass = await resetPassword(Number(id));
    await logAudit({ user: session, aksi: "Reset Password", modul: "Pengguna", detail: `Reset password pengguna #${id}` });
    return ok({ password: pass }, `Password direset ke: ${pass}`);
  });
}
