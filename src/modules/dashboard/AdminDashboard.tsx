"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Building2,
  Users,
  ShieldCheck,
  Baby,
  Egg,
  CircleCheck,
  AlertTriangle,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { PageHeader, StatCard, Button } from "@/components/ui/primitives";
import { DonutChart, BarChartMini, ChartCard, CHART } from "@/components/charts/Charts";
import { useList } from "@/lib/useApi";
import type { DesaPeta } from "@/components/charts/PetaSebaran";

const PetaSebaran = dynamic(() => import("@/components/charts/PetaSebaran"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] flex items-center justify-center text-slate-400">
      <Loader2 className="w-6 h-6 animate-spin" />
    </div>
  ),
});

type AdminData = {
  role: "admin";
  stats: {
    desa: number; kader: number; ppkbd: number; balita: number;
    pendampingan: number; valid: number; belum_valid: number; risiko: number;
  };
  persentase: { tervalidasi: number; balita_aktif: number; konsumsi: number };
  pendampinganPerDesa: { name: string; value: number }[];
  balitaPerDesa: { name: string; value: number }[];
  statusGizi: { name: string; value: number; color: string }[];
  risikoStunting: { name: string; value: number; color: string }[];
  konsumsiBulanan: { name: string; value: number }[];
  peta: DesaPeta[];
};

function donutPct(value: number, color: string) {
  return [
    { name: "Nilai", value, color },
    { name: "Sisa", value: Math.max(0, 100 - value), color: CHART.gray },
  ];
}

export function AdminDashboard() {
  const { data, loading } = useList<AdminData>("/api/dashboard");

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const s = data.stats;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dashboard Kecamatan Pagerwojo"
        subtitle="Pemantauan menyeluruh Program Pendampingan Makan Telur Cegah Stunting"
        actions={
          <Link href="/rekapitulasi">
            <Button>
              <TrendingUp className="w-4 h-4" /> Rekapitulasi
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <StatCard label="Jumlah Desa" value={s.desa} icon={Building2} color="#2e7d32" />
        <StatCard label="Kader" value={s.kader} icon={Users} color="#2563eb" />
        <StatCard label="PPKBD" value={s.ppkbd} icon={ShieldCheck} color="#7c3aed" />
        <StatCard label="Balita" value={s.balita} icon={Baby} color="#f59e0b" />
        <StatCard label="Pendampingan" value={s.pendampingan} icon={Egg} color="#0d9488" />
        <StatCard label="Validasi" value={s.valid} icon={CircleCheck} color="#2e7d32" />
        <StatCard label="Risiko Stunting" value={s.risiko} icon={AlertTriangle} color="#dc2626" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <ChartCard title="Persentase Pendampingan Tervalidasi">
          <DonutChart data={donutPct(data.persentase.tervalidasi, CHART.green)} centerLabel={`${data.persentase.tervalidasi}%`} />
        </ChartCard>
        <ChartCard title="Persentase Balita Aktif">
          <DonutChart data={donutPct(data.persentase.balita_aktif, CHART.amber)} centerLabel={`${data.persentase.balita_aktif}%`} />
        </ChartCard>
        <ChartCard title="Persentase Konsumsi Telur">
          <DonutChart data={donutPct(data.persentase.konsumsi, CHART.blue)} centerLabel={`${data.persentase.konsumsi}%`} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Pendampingan per Desa" subtitle="Jumlah pendampingan seluruh desa">
          <BarChartMini data={data.pendampinganPerDesa} color={CHART.amber} />
        </ChartCard>
        <ChartCard title="Balita per Desa" subtitle="Jumlah balita seluruh desa">
          <BarChartMini data={data.balitaPerDesa} color={CHART.green} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <ChartCard title="Status Gizi" subtitle="Distribusi status gizi balita">
          <DonutChart data={data.statusGizi} showLegend />
        </ChartCard>
        <ChartCard title="Balita Risiko Stunting" subtitle="Distribusi risiko stunting">
          <DonutChart data={data.risikoStunting} showLegend />
        </ChartCard>
      </div>

      <ChartCard title="Persentase Konsumsi Telur" subtitle="Tren bulanan konsumsi telur">
        <BarChartMini data={data.konsumsiBulanan} color={CHART.amber} />
      </ChartCard>

      <ChartCard title="Peta Sebaran Pendampingan" subtitle="Sebaran desa & balita di Kecamatan Pagerwojo">
        <PetaSebaran desa={data.peta} />
      </ChartCard>
    </div>
  );
}
