import { UserManager } from "@/modules/users/UserManager";

export default function UsersPage() {
  return (
    <UserManager
      title="Manajemen Pengguna"
      subtitle="Kelola seluruh akun pengguna sistem dan hak akses"
      addLabel="Tambah Pengguna"
      showRole
    />
  );
}
