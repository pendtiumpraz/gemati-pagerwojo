import { BalitaDetail } from "@/modules/balita/BalitaDetail";

export default async function BalitaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BalitaDetail id={Number(id)} />;
}
