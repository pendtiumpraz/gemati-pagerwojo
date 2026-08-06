import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth, ok, bad, handle } from "@/lib/api";
import { setValidasi, type ValidasiTipe } from "@/modules/validasi/service";
import { logAudit } from "@/modules/auth/service";

type Ctx = { params: Promise<{ tipe: string; id: string }> };

const TIPE = ["balita", "pendampingan", "pengukuran"] as const;
const schema = z.object({ status: z.enum(["disetujui", "ditolak", "menunggu"]) });

const AKSI: Record<string, string> = {
  disetujui: "Menyetujui",
  ditolak: "Menolak",
  menunggu: "Mengembalikan",
};

export async function PATCH(req: NextRequest, { params }: Ctx) {
  return handle(async () => {
    const session = await requireAuth(["ppkbd", "admin"]);
    const { tipe, id } = await params;
    if (!TIPE.includes(tipe as any)) return bad("Tipe tidak valid");

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return bad("Status tidak valid");

    try {
      await setValidasi(tipe as ValidasiTipe, Number(id), parsed.data.status);
      await logAudit({
        user: session,
        aksi: "Validasi Data",
        modul: "Validasi",
        detail: `${AKSI[parsed.data.status]} data ${tipe} #${id}`,
      });
      return ok(null, "Status validasi diperbarui");
    } catch (e) {
      return bad((e as Error).message);
    }
  });
}
