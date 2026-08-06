import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { PengukuranList } from "@/modules/pengukuran/PengukuranList";

export default async function PengukuranPage() {
  const session = await getSession();
  return (
    <Suspense fallback={null}>
      <PengukuranList role={session?.role ?? "kader"} />
    </Suspense>
  );
}
