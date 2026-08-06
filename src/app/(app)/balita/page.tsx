import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { BalitaList } from "@/modules/balita/BalitaList";

export default async function BalitaPage() {
  const session = (await getSession())!;

  const subtitle =
    session.role === "admin"
      ? "Data seluruh balita di Kecamatan Pagerwojo"
      : session.role === "ppkbd"
      ? "Data balita di wilayah desa Anda"
      : "Data balita dampingan Anda";

  return (
    <Suspense fallback={<div className="p-8 text-slate-400">Memuat...</div>}>
      <BalitaList canAdd={session.role === "kader"} title="Data Balita" subtitle={subtitle} />
    </Suspense>
  );
}
