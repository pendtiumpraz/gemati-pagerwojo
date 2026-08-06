"use client";
import Link from "next/link";
import { Baby, Egg, Ruler, History, Plus, CircleCheck, XCircle, Hourglass, Loader2 } from "lucide-react";
import { PageHeader, StatCard, Card } from "@/components/ui/primitives";
import { LABEL_VALIDASI } from "@/components/ui/primitives";
import { DonutChart, BarChartMini, AreaChartMini, ChartCard, CHART } from "@/components/charts/Charts";
import { useList } from "@/lib/useApi";

type KaderData = {
  role: "kader";
  nama: string;
  stats: { balita: number; pendampingan: number; menunggu: number; disetujui: number; ditolak: number };
  mingguan: { name: string; value: number }[];
  bulanan: { name: string; value: number }[];
  statusValidasi: { name: string; value: number; color: string }[];
  aktivitas: { balita_nama: string; detail: string; status: string }[];
};

const STATUS_TEXT: Record<string, string> = {
  menunggu: "text-amber-600 dark:text-amber-400",
  disetujui: "text-green-600 dark:text-green-400",
  ditolak: "text-red-600 dark:text-red-400",
};

const quickActions = [
  { label: "Tambah Balita", href: "/balita/baru", icon: Baby, color: "#2e7d32" },
  { label: "Pendampingan Baru", href: "/pendampingan/baru", icon: Egg, color: "#f59e0b" },
  { label: "Pengukuran", href: "/pengukuran/baru", icon: Ruler, color: "#2563eb" },
  { label: "Riwayat", href: "/riwayat", icon: History, color: "#7c3aed" },
];

export function KaderDashboard() {
  const { data, loading } = useList<KaderData>("/api/dashboard");

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const s = data.stats;
  const firstName = data.nama.split(" ")[0].replace(",", "");

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Selamat Datang, ${firstName}!`}
        subtitle="Kader Pendamping Keluarga — Pantau pendampingan balita dampingan Anda."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Balita Dampingan" value={s.balita} icon={Baby} color="#2e7d32" />
        <StatCard label="Pendampingan" value={s.pendampingan} icon={Egg} color="#f59e0b" />
        <StatCard label="Menunggu" value={s.menunggu} icon={Hourglass} color="#2563eb" />
        <StatCard label="Disetujui" value={s.disetujui} icon={CircleCheck} color="#2e7d32" />
        <StatCard label="Ditolak" value={s.ditolak} icon={XCircle} color="#dc2626" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-darkcard p-4 shadow-sm hover:border-primary/40 transition"
            style={{ borderLeft: `3px solid ${a.color}` }}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.color}1a` }}>
              <a.icon className="w-5 h-5" style={{ color: a.color }} />
            </div>
            <span className="font-medium text-heading dark:text-slate-200 flex-1">{a.label}</span>
            <Plus className="w-4 h-4 text-slate-400 group-hover:text-primary" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Pendampingan Mingguan" subtitle="7 hari terakhir">
          <BarChartMini data={data.mingguan} color={CHART.green} />
        </ChartCard>
        <ChartCard title="Pendampingan Bulanan" subtitle="6 bulan terakhir">
          <AreaChartMini data={data.bulanan} color={CHART.blue} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard title="Status Validasi" subtitle="Distribusi pendampingan">
          <DonutChart data={data.statusValidasi} showLegend />
        </ChartCard>
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3">
            <h3 className="font-semibold text-heading dark:text-white">Aktivitas Terbaru</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pengukuran & pendampingan terbaru</p>
          </div>
          <div className="space-y-2">
            {data.aktivitas.length === 0 && (
              <p className="text-sm text-slate-400 py-6 text-center">Belum ada aktivitas</p>
            )}
            {data.aktivitas.map((a, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <Egg className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-heading dark:text-slate-200 truncate">{a.balita_nama}</div>
                  <div className="text-xs text-slate-500">{a.detail}</div>
                </div>
                <span className={`text-xs font-medium ${STATUS_TEXT[a.status] || "text-slate-500"}`}>
                  {LABEL_VALIDASI[a.status] || a.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
