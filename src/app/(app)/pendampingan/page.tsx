import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { PendampinganList } from "@/modules/pendampingan/PendampinganList";

export default async function PendampinganPage() {
  const session = await getSession();
  return (
    <Suspense fallback={null}>
      <PendampinganList role={session?.role ?? "kader"} namaPendamping={session?.nama ?? ""} />
    </Suspense>
  );
}
