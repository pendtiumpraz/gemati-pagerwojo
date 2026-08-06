import { UserManager } from "@/modules/users/UserManager";

export default function KaderPage() {
  return (
    <UserManager
      role="kader"
      title="Data Kader (KPK)"
      subtitle="Manajemen Kader Pendamping Keluarga"
      addLabel="Tambah Kader"
      countLabel="Balita Dampingan"
    />
  );
}
