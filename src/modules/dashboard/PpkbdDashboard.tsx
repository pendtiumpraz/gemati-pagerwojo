"use client";
import Link from "next/link";
import { Baby, Users, Egg, CircleCheck, Hourglass, AlertTriangle, Loader2, Trophy, ArrowRight } from "lucide-react";
import { PageHeader, StatCard, Card, Badge } from "@/components/ui/primitives";
import { DonutChart, BarChartMini, AreaChartMini, ChartCard, CHART } from "@/components/charts/Charts";
import { LABEL_VALIDASI } from "@/components/ui/primitives";
import { useList } from "@/lib/useApi";

export type PpkbdData = {
  role: "ppkbd";
  desa_nama: string;
  stats: {
    balita: number; kader: number; pendampingan: number;
    sudah_valid: number; belum_valid: number; risiko: number;
  };
  mingguan: { name: string; value: number }[];
  bulanan: { name: string; value: number }[];
  statusGizi: { name: string; value: number; color: string }[];
  statusValidasi: { name: string; value: number; color: string }[];
  rankingKader: { nama: string; pendampingan: number }[];
  menungguValidasi: { balita_nama: string; detail: string; status: string }[];
};

/** Body chart+list yang dipakai bersama PpkbdDashboard & StatistikDesa */
export function PpkbdStatsBody({ data }: { data: PpkbdData }) {
  const s = data.stats;
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Jumlah Balita" value={s.balita} icon={Baby} color="#2e7d32" />
        <StatCard label="Jumlah Kader" value={s.kader} icon={Users} color="#2563eb" />
        <StatCard label="Pendampingan" value={s.pendampingan} icon={Egg} color="#f59e0b" />
        <StatCard label="Sudah Valid" value={s.sudah_valid} icon={CircleCheck} color="#2e7d32" />
        <StatCard label="Belum Valid" value={s.belum_valid} icon={Hourglass} color="#f59e0b" />
        <StatCard label="Risiko Stunting" value={s.risiko} icon={AlertTriangle} color="#dc2626" />
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
        <ChartCard title="Status Gizi Balita" subtitle="Berdasarkan pengukuran terbaru">
          <DonutChart data={data.statusGizi} showLegend />
        </ChartCard>
        <ChartCard title="Status Validasi" subtitle="Distribusi pendampingan">
          <DonutChart data={data.statusValidasi} showLegend />
        </ChartCard>
        <ChartCard title="Ranking Kader" subtitle="Berdasarkan jumlah pendampingan">
          <div className="space-y-2">
            {data.rankingKader.length === 0 && (
              <p className="text-sm text-slate-400 py-6 text-center">Belum ada kader</p>
            )}
            {data.rankingKader.map((k, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center justify-center shrink-0">
                  {i === 0 ? <Trophy className="w-4 h-4" /> : i + 1}
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-heading dark:text-slate-200 truncate">{k.nama}</div>
                  <div className="text-xs text-slate-500">{k.pendampingan} pendampingan</div>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-heading dark:text-white">Data Menunggu Validasi</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Klik untuk memvalidasi</p>
          </div>
          <Link href="/validasi" className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:underline">
            Lihat semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="space-y-2">
          {data.menungguValidasi.length === 0 && (
            <p className="text-sm text-slate-400 py-6 text-center">Tidak ada data menunggu validasi</p>
          )}
          {data.menungguValidasi.map((m, i) => (
            <Link
              key={i}
              href="/validasi"
              className="flex items-center gap-3 rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-3 hover:bg-slate-50 dark:hover:bg-darkcard/60"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                <Egg className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-heading dark:text-slate-200 truncate">{m.balita_nama}</div>
                <div className="text-xs text-slate-500">{m.detail}</div>
              </div>
              <Badge tone={m.status}>{LABEL_VALIDASI[m.status] || m.status}</Badge>
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}

export function PpkbdDashboard() {
  const { data, loading } = useList<PpkbdData>("/api/dashboard");

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Dashboard Desa" subtitle="Desa — Validasi & pemantauan data balita" />
      <PpkbdStatsBody data={data} />
    </div>
  );
}
