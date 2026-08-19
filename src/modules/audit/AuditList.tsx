"use client";
import { useMemo, useState } from "react";
import {
  ScrollText,
  LogIn,
  PlusCircle,
  CheckCircle,
  Pencil,
  Trash2,
  Activity,
} from "lucide-react";
import {
  PageHeader,
  StatCard,
  SearchBar,
  Card,
  Badge,
  Select,
} from "@/components/ui/primitives";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { DataToolbar } from "@/components/ui/DataToolbar";
import { useList } from "@/lib/useApi";

const EXPORT_COLUMNS = [
  { key: "waktu", header: "Waktu" },
  { key: "user", header: "User" },
  { key: "role", header: "Role" },
  { key: "aksi", header: "Aksi" },
  { key: "modul", header: "Modul" },
  { key: "detail", header: "Detail" },
  { key: "ip", header: "IP Address" },
  { key: "browser", header: "Browser" },
];

type AuditRow = {
  id: number;
  user_id: number | null;
  user_nama: string | null;
  user_role: string | null;
  aksi: string;
  modul: string;
  detail: string | null;
  ip_address: string | null;
  browser: string | null;
  created_at: string;
};

type AuditData = {
  data: AuditRow[];
  counts: { total: number; login: number; tambah_data: number; validasi: number };
};

const ROLE_LABEL: Record<string, string> = { admin: "Admin", ppkbd: "PPKBD", kader: "Kader" };
const ROLE_TONE: Record<string, string> = { admin: "admin", ppkbd: "ppkbd", kader: "kader" };

function aksiIcon(aksi: string) {
  const a = aksi.toLowerCase();
  if (a.includes("login")) return <LogIn className="w-4 h-4 text-blue-500" />;
  if (a.includes("tambah")) return <PlusCircle className="w-4 h-4 text-green-500" />;
  if (a.includes("validasi") || a.includes("setuju")) return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  if (a.includes("edit") || a.includes("ubah") || a.includes("update")) return <Pencil className="w-4 h-4 text-amber-500" />;
  if (a.includes("hapus") || a.includes("delete")) return <Trash2 className="w-4 h-4 text-red-500" />;
  return <Activity className="w-4 h-4 text-slate-400" />;
}

function formatWaktu(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) +
    " " +
    date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export function AuditList() {
  const [aksi, setAksi] = useState("");
  const [role, setRole] = useState("");
  const [search, setSearch] = useState("");

  const qs = useMemo(() => {
    const p = new URLSearchParams({ pageSize: "200" });
    if (aksi) p.set("aksi", aksi);
    if (role) p.set("role", role);
    if (search) p.set("search", search);
    return p.toString();
  }, [aksi, role, search]);

  const { data, loading } = useList<AuditData>(`/api/audit?${qs}`);
  const rows = data?.data ?? [];
  const counts = data?.counts;

  const exportRows = rows.map((r) => ({
    waktu: formatWaktu(r.created_at),
    user: r.user_nama ?? "-",
    role: ROLE_LABEL[r.user_role ?? ""] ?? r.user_role ?? "-",
    aksi: r.aksi,
    modul: r.modul,
    detail: r.detail ?? "-",
    ip: r.ip_address ?? "-",
    browser: r.browser ?? "-",
  }));

  const columns: Column<AuditRow>[] = [
    { header: "Waktu", sortValue: (r) => new Date(r.created_at).getTime(), cell: (r) => <span className="text-slate-500 whitespace-nowrap">{formatWaktu(r.created_at)}</span> },
    {
      header: "User",
      sortValue: (r) => r.user_nama ?? "",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-heading dark:text-slate-200">{r.user_nama ?? "-"}</span>
          {r.user_role && <Badge tone={ROLE_TONE[r.user_role] || "default"}>{ROLE_LABEL[r.user_role] || r.user_role}</Badge>}
        </div>
      ),
    },
    {
      header: "Aksi",
      sortValue: (r) => r.aksi,
      cell: (r) => (
        <div className="flex items-center gap-2">
          {aksiIcon(r.aksi)}
          <span>{r.aksi}</span>
        </div>
      ),
    },
    { header: "Modul", sortValue: (r) => r.modul, cell: (r) => <Badge tone="default">{r.modul}</Badge> },
    { header: "Detail", cell: (r) => <span className="text-slate-500">{r.detail ?? "-"}</span> },
    { header: "IP Address", cell: (r) => <span className="text-slate-500">{r.ip_address ?? "-"}</span> },
    { header: "Browser", cell: (r) => <span className="text-slate-500 text-xs">{r.browser ?? "-"}</span> },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Log"
        subtitle="Riwayat aktivitas seluruh pengguna sistem"
        actions={
          <DataToolbar
            rows={exportRows}
            columns={EXPORT_COLUMNS}
            filename="audit-log"
            title="Audit Log"
          />
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Log" value={counts?.total ?? 0} icon={ScrollText} color="#2e7d32" />
        <StatCard label="Login" value={counts?.login ?? 0} icon={LogIn} color="#2563eb" />
        <StatCard label="Tambah Data" value={counts?.tambah_data ?? 0} icon={PlusCircle} color="#16a34a" />
        <StatCard label="Validasi" value={counts?.validasi ?? 0} icon={CheckCircle} color="#7c3aed" />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3 mb-4">
          <div>
            <label className="text-xs font-medium text-slate-500">Aksi</label>
            <Select value={aksi} onChange={(e) => setAksi(e.target.value)} className="mt-1 w-44">
              <option value="">Semua Aksi</option>
              <option value="Login">Login</option>
              <option value="Tambah Data">Tambah Data</option>
              <option value="Edit Data">Edit Data</option>
              <option value="Hapus Data">Hapus Data</option>
              <option value="Validasi">Validasi</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Role</label>
            <Select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 w-44">
              <option value="">Semua Role</option>
              <option value="admin">Admin</option>
              <option value="ppkbd">PPKBD</option>
              <option value="kader">Kader</option>
            </Select>
          </div>
          <div className="flex-1 min-w-[200px] flex justify-end">
            <SearchBar value={search} onChange={setSearch} placeholder="Cari user atau detail..." />
          </div>
        </div>
        <DataTable columns={columns} rows={rows} loading={loading} empty="Belum ada log aktivitas" />
      </Card>
    </div>
  );
}
