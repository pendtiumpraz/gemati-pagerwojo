"use client";
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Baby,
  ClipboardList,
  CheckCircle,
  AlertTriangle,
  Download,
  Printer,
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
import { apiFetch, useList } from "@/lib/useApi";
import type { RekapRow, RekapTotals } from "@/modules/rekap/service";

type DesaOpt = { id: number; nama: string };

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function toCSV(rows: RekapRow[]): string {
  const header = [
    "Desa", "Balita", "Pendampingan", "Valid", "Belum Valid",
    "Persentase", "Risiko Stunting", "Normal", "Rata-rata BB", "Rata-rata TB",
  ];
  const lines = rows.map((r) =>
    [
      `Desa ${r.nama}`, r.balita, r.pendampingan, r.valid, r.belum_valid,
      `${r.persentase}%`, r.risiko_stunting, r.normal, r.rata_bb, r.rata_tb,
    ].join(",")
  );
  return [header.join(","), ...lines].join("\n");
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob(["﻿" + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function RekapList() {
  const [desaOpts, setDesaOpts] = useState<DesaOpt[]>([]);
  const [desaId, setDesaId] = useState("");
  const [bulan, setBulan] = useState("");
  const [tahun, setTahun] = useState("2026");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch<DesaOpt[]>("/api/desa").then((r) => r.data && setDesaOpts(r.data));
  }, []);

  const qs = useMemo(() => {
    const p = new URLSearchParams();
    if (desaId) p.set("desa_id", desaId);
    if (bulan) p.set("bulan", bulan);
    if (tahun) p.set("tahun", tahun);
    if (status) p.set("status", status);
    return p.toString();
  }, [desaId, bulan, tahun, status]);

  const { data, loading } = useList<{ rows: RekapRow[]; totals: RekapTotals }>(
    `/api/rekap${qs ? `?${qs}` : ""}`
  );

  const allRows = data?.rows ?? [];
  const totals = data?.totals;
  const rows = allRows.filter((r) => {
    const q = search.toLowerCase().trim();
    return !q || `desa ${r.nama}`.toLowerCase().includes(q);
  });

  const columns: Column<RekapRow>[] = [
    {
      header: "Desa",
      cell: (r) => <span className="font-medium text-heading dark:text-slate-200">Desa {r.nama}</span>,
    },
    { header: "Balita", cell: (r) => r.balita },
    { header: "Pendampingan", cell: (r) => r.pendampingan },
    { header: "Valid", cell: (r) => r.valid },
    { header: "Belum Valid", cell: (r) => r.belum_valid },
    { header: "Persentase", cell: (r) => <Badge tone="disetujui">{r.persentase}%</Badge> },
    {
      header: "Risiko Stunting",
      cell: (r) => <span className="font-medium text-red-600 dark:text-red-400">{r.risiko_stunting}</span>,
    },
    { header: "Normal", cell: (r) => r.normal },
    { header: "Rata-rata BB", cell: (r) => `${r.rata_bb} kg` },
    { header: "Rata-rata TB", cell: (r) => `${r.rata_tb} cm` },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Rekapitulasi Kecamatan"
        subtitle="Rekap data pendampingan seluruh desa di Kecamatan Pagerwojo"
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4" /> PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadFile(toCSV(allRows), "rekapitulasi.csv", "text/csv;charset=utf-8")}
            >
              <Download className="w-4 h-4" /> Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadFile(toCSV(allRows), "rekapitulasi.csv", "text/csv;charset=utf-8")}
            >
              <Download className="w-4 h-4" /> CSV
            </Button>
          </>
        }
      />

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Desa</label>
            <Select value={desaId} onChange={(e) => setDesaId(e.target.value)} className="mt-1">
              <option value="">Semua Desa</option>
              {desaOpts.map((d) => (
                <option key={d.id} value={d.id}>Desa {d.nama}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Bulan</label>
            <Select value={bulan} onChange={(e) => setBulan(e.target.value)} className="mt-1">
              <option value="">Semua Bulan</option>
              {BULAN.map((b, i) => (
                <option key={b} value={i + 1}>{b}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Tahun</label>
            <Select value={tahun} onChange={(e) => setTahun(e.target.value)} className="mt-1">
              <option value="2026">2026</option>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Status Validasi</label>
            <Select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1">
              <option value="">Semua Status</option>
              <option value="disetujui">Disetujui</option>
              <option value="menunggu">Menunggu</option>
              <option value="ditolak">Ditolak</option>
            </Select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Balita" value={totals?.balita ?? 0} icon={Baby} color="#2563eb" />
        <StatCard label="Total Pendampingan" value={totals?.pendampingan ?? 0} icon={ClipboardList} color="#0891b2" />
        <StatCard label="Sudah Valid" value={totals?.valid ?? 0} icon={CheckCircle} color="#16a34a" />
        <StatCard label="Belum Valid" value={totals?.belum_valid ?? 0} icon={FileText} color="#d97706" />
        <StatCard label="Risiko Stunting" value={totals?.risiko_stunting ?? 0} icon={AlertTriangle} color="#dc2626" />
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-heading dark:text-white">Tabel Rekapitulasi per Desa</h2>
          <SearchBar value={search} onChange={setSearch} placeholder="Cari desa..." />
        </div>
        <DataTable columns={columns} rows={rows} loading={loading} empty="Belum ada data rekap" />
      </Card>
    </div>
  );
}
