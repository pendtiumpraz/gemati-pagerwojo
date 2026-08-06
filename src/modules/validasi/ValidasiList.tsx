"use client";
import { useState } from "react";
import { CheckCircle, XCircle, RotateCcw, Egg, Baby, Ruler, Hourglass, Loader2 } from "lucide-react";
import { PageHeader, StatCard, Card, Badge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { apiFetch, useList } from "@/lib/useApi";

type Item = {
  tipe: "Balita" | "Pendampingan" | "Pengukuran";
  tipe_key: "balita" | "pendampingan" | "pengukuran";
  id: number;
  balita_nama: string;
  detail: string;
  tanggal: string;
  kader_nama: string;
  validasi_status: string;
};
type Resp = {
  items: Item[];
  counts: { menunggu: number; disetujui: number; ditolak: number; total: number };
};

const TABS = [
  { key: "menunggu", label: "Menunggu" },
  { key: "disetujui", label: "Disetujui" },
  { key: "ditolak", label: "Ditolak" },
] as const;

const TIPE_ICON = { Balita: Baby, Pendampingan: Egg, Pengukuran: Ruler };

export function ValidasiList() {
  const { toast } = useToast();
  const [tab, setTab] = useState<"menunggu" | "disetujui" | "ditolak">("menunggu");
  const [busy, setBusy] = useState<string | null>(null);
  const { data, loading, reload } = useList<Resp>(`/api/validasi?status=${tab}`);

  const counts = data?.counts || { menunggu: 0, disetujui: 0, ditolak: 0, total: 0 };
  const items = data?.items || [];

  async function act(item: Item, status: "disetujui" | "ditolak" | "menunggu") {
    const key = `${item.tipe_key}-${item.id}`;
    setBusy(key);
    const res = await apiFetch(`/api/validasi/${item.tipe_key}/${item.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setBusy(null);
    if (res.ok) {
      const msg = status === "disetujui" ? "Data disetujui" : status === "ditolak" ? "Data ditolak" : "Data dikembalikan ke kader";
      toast(msg);
      reload();
    } else {
      toast(res.message || "Gagal memproses", "error");
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Validasi Data" subtitle="Validasi data pendampingan, pengukuran & balita dari kader" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Menunggu" value={counts.menunggu} icon={Hourglass} color="#f59e0b" />
        <StatCard label="Disetujui" value={counts.disetujui} icon={CheckCircle} color="#2e7d32" />
        <StatCard label="Ditolak" value={counts.ditolak} icon={XCircle} color="#dc2626" />
        <StatCard label="Total" value={counts.total} icon={CheckCircle} color="#2563eb" />
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            {t.label} ({counts[t.key]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">Tidak ada data pada tab ini</Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = TIPE_ICON[item.tipe];
            const key = `${item.tipe_key}-${item.id}`;
            const loadingRow = busy === key;
            return (
              <Card key={key} className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-heading dark:text-slate-200">{item.balita_nama}</span>
                      <Badge tone="default">{item.tipe}</Badge>
                    </div>
                    <div className="text-sm text-slate-500 mt-0.5">{item.detail}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {item.tanggal} · Kader: {item.kader_nama}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.validasi_status !== "disetujui" && (
                      <button
                        disabled={loadingRow}
                        onClick={() => act(item, "disetujui")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-1.5 disabled:opacity-60"
                      >
                        <CheckCircle className="w-4 h-4" /> Setujui
                      </button>
                    )}
                    {item.validasi_status !== "ditolak" && (
                      <button
                        disabled={loadingRow}
                        onClick={() => act(item, "ditolak")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-1.5 disabled:opacity-60"
                      >
                        <XCircle className="w-4 h-4" /> Tolak
                      </button>
                    )}
                    {item.validasi_status !== "menunggu" && (
                      <button
                        disabled={loadingRow}
                        onClick={() => act(item, "menunggu")}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-darkcard text-sm font-medium px-3 py-1.5 disabled:opacity-60"
                      >
                        <RotateCcw className="w-4 h-4" /> Kembalikan
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
