import { redirect } from "next/navigation";

export default async function BalitaEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/balita?edit=${id}`);
}
