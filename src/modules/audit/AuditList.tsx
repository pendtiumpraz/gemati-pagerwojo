"use client";
import { useMemo, useState } from "react";
import {
  ScrollText,
  LogIn,
  PlusCircle,
  CheckCircle,
  Download,
  Printer,
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
  Button,
  Select,
} from "@/components/ui/primitives";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { useList } from "@/lib/useApi";

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

function downloadCSV(rows: AuditRow[]) {
  const header = ["Waktu", "User", "Role", "Aksi", "Modul", "Detail", "IP Address", "Browser"];
  const lines = rows.map((r) =>
    [
      formatWaktu(r.created_at),
      r.user_nama ?? "-",
      r.user_role ?? "-",
      r.aksi,
      r.modul,
      r.detail ?? "-",
      r.ip_address ?? "-",
      r.browser ?? "-",
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const content = "﻿" + [header.join(","), ...lines].join("\n");
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "audit-log.csv";
  a.click();
  URL.revokeObjectURL(url);
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

  const columns: Column<AuditRow>[] = [
    { header: "Waktu", cell: (r) => <span className="text-slate-500 whitespace-nowrap">{formatWaktu(r.created_at)}</span> },
    {
      header: "User",
      cell: (r) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-heading dark:text-slate-200">{r.user_nama ?? "-"}</span>
          {r.user_role && <Badge tone={ROLE_TONE[r.user_role] || "default"}>{ROLE_LABEL[r.user_role] || r.user_role}</Badge>}
        </div>
      ),
    },
    {
      header: "Aksi",
      cell: (r) => (
        <div className="flex items-center gap-2">
          {aksiIcon(r.aksi)}
          <span>{r.aksi}</span>
        </div>
      ),
    },
    { header: "Modul", cell: (r) => <Badge tone="default">{r.modul}</Badge> },
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
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> PDF
            </Button>
            <Button variant="outline" onClick={() => downloadCSV(rows)}>
              <Download className="w-4 h-4" /> Excel
            </Button>
            <Button variant="outline" onClick={() => downloadCSV(rows)}>
              <Download className="w-4 h-4" /> CSV
            </Button>
          </>
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
