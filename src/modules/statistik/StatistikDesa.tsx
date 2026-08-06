"use client";
import { FileText, FileSpreadsheet, FileDown, Loader2 } from "lucide-react";
import { PageHeader, Button } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useList } from "@/lib/useApi";
import { PpkbdStatsBody, type PpkbdData } from "@/modules/dashboard/PpkbdDashboard";

export function StatistikDesa() {
  const { toast } = useToast();
  const { data, loading } = useList<PpkbdData>("/api/dashboard");

  const namaDesa = data?.desa_nama || "";

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Statistik Desa ${namaDesa}`.trim()}
        subtitle="Analisis lengkap data balita & pendampingan di desa Anda"
        actions={
          <>
            <Button variant="outline" onClick={() => window.print()}>
              <FileText className="w-4 h-4" /> PDF
            </Button>
            <Button variant="outline" onClick={() => toast("Export Excel segera hadir", "info")}>
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </Button>
            <Button variant="outline" onClick={() => toast("Export CSV segera hadir", "info")}>
              <FileDown className="w-4 h-4" /> CSV
            </Button>
          </>
        }
      />

      {loading || !data ? (
        <div className="flex items-center justify-center py-24 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <PpkbdStatsBody data={data} />
      )}
    </div>
  );
}
