import { redirect } from "next/navigation";

export default function PengukuranBaruPage() {
  redirect("/pengukuran?add=1");
}
