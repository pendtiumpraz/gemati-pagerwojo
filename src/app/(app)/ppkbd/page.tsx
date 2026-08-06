import { UserManager } from "@/modules/users/UserManager";

export default function PpkbdPage() {
  return (
    <UserManager
      role="ppkbd"
      title="Data PPKBD"
      subtitle="Manajemen Petugas KB Desa"
      addLabel="Tambah PPKBD"
      countLabel="Jumlah Kader"
    />
  );
}
