"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Baby,
  ClipboardList,
  UserCog,
  Users as UsersIcon,
  AlertTriangle,
} from "lucide-react";
import {
  PageHeader,
  StatCard,
  SearchBar,
  Card,
  Badge,
} from "@/components/ui/primitives";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { apiFetch, useList } from "@/lib/useApi";

type DesaAgg = {
  id: number;
  nama: string;
  kecamatan: string;
  balita: number;
  kader: number;
  pendampingan: number;
  valid: number;
  belum_valid: number;
  persentase: number;
  risiko_stunting: number;
  rata_bb: number;
  rata_tb: number;
};

export function DesaList() {
  const [search, setSearch] = useState("");
  const [ppkbdCount, setPpkbdCount] = useState(0);
  const { data, loading } = useList<DesaAgg[]>("/api/desa?agregat=1");

  useEffect(() => {
    apiFetch<{ data: { role: string }[] }>("/api/users?role=ppkbd&pageSize=200").then(
      (r) => setPpkbdCount(r.data?.data?.length ?? 0)
    );
  }, []);

  const all = useMemo(() => data ?? [], [data]);

  const rows = all.filter((d) => {
    const q = search.toLowerCase().trim();
    return !q || `desa ${d.nama}`.toLowerCase().includes(q) || d.nama.toLowerCase().includes(q);
  });

  const totals = useMemo(() => {
    return {
      desa: all.length,
      balita: all.reduce((a, d) => a + d.balita, 0),
      pendampingan: all.reduce((a, d) => a + d.pendampingan, 0),
      kader: all.reduce((a, d) => a + d.kader, 0),
      risiko: all.reduce((a, d) => a + d.risiko_stunting, 0),
    };
  }, [all]);

  const columns: Column<DesaAgg>[] = [
    {
      header: "Desa",
      cell: (d) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium text-heading dark:text-slate-200">Desa {d.nama}</div>
            <div className="text-xs text-slate-400">Kec. Pagerwojo</div>
          </div>
        </div>
      ),
    },
    { header: "Balita", cell: (d) => d.balita },
    { header: "Pendampingan", cell: (d) => d.pendampingan },
    { header: "Valid", cell: (d) => d.valid },
    {
      header: "Persentase",
      cell: (d) => <Badge tone="disetujui">{d.persentase}%</Badge>,
    },
    {
      header: "Risiko Stunting",
      cell: (d) => (
        <span className="font-medium text-red-600 dark:text-red-400">{d.risiko_stunting}</span>
      ),
    },
    { header: "Rata-rata BB", cell: (d) => `${d.rata_bb} kg` },
    { header: "Rata-rata TB", cell: (d) => `${d.rata_tb} cm` },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Data Desa"
        subtitle="Master data 10 desa di Kecamatan Pagerwojo"
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Desa" value={totals.desa} icon={Building2} color="#2e7d32" />
        <StatCard label="Total Balita" value={totals.balita} icon={Baby} color="#2563eb" />
        <StatCard label="Total Pendampingan" value={totals.pendampingan} icon={ClipboardList} color="#0891b2" />
        <StatCard label="Total Kader" value={totals.kader} icon={UsersIcon} color="#d97706" />
        <StatCard label="Total PPKBD" value={ppkbdCount} icon={UserCog} color="#7c3aed" />
        <StatCard label="Risiko Stunting" value={totals.risiko} icon={AlertTriangle} color="#dc2626" />
      </div>

      <Card className="p-4">
        <div className="mb-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Cari desa..." />
        </div>
        <DataTable columns={columns} rows={rows} loading={loading} empty="Belum ada data desa" />
      </Card>
    </div>
  );
}
