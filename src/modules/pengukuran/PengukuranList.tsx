"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Ruler, Plus, RotateCcw } from "lucide-react";
import { PageHeader, Card, Badge, Button, SearchBar, LABEL_VALIDASI } from "@/components/ui/primitives";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Drawer, TabsAktifSampah } from "@/components/ui/Drawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import { apiFetch, useList } from "@/lib/useApi";
import { formatTanggal } from "@/lib/utils";
import { LABEL_GIZI } from "@/lib/gizi";
import { PengukuranForm } from "./PengukuranForm";

export type PengukuranRow = {
  id: number;
  balita_id: number;
  tanggal: string;
  berat_badan: number;
  tinggi_badan: number;
  lingkar_kepala: number | null;
  lingkar_lengan_atas: number | null;
  z_score: number | null;
  status_gizi: string | null;
  risiko_stunting: string | null;
  validasi_status: string;
  balita_nama: string | null;
  balita_umur: string | null;
  balita_desa: string | null;
};

const GIZI_TONE: Record<string, string> = {
  normal: "aktif",
  kurang: "menunggu",
  sangat_kurang: "ditolak",
};

export function PengukuranList({
  role = "kader",
}: {
  role?: "admin" | "ppkbd" | "kader";
}) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const canEdit = role === "kader" || role === "admin";

  const [tab, setTab] = useState<"aktif" | "sampah">("aktif");
  const [search, setSearch] = useState("");
  const url =
    tab === "aktif" ? "/api/pengukuran?pageSize=200" : "/api/pengukuran/trashed?pageSize=200";
  const { data, loading, reload } = useList<{ data: PengukuranRow[] }>(url);
  const { data: trashData, reload: reloadTrash } = useList<{ data: PengukuranRow[] }>(
    "/api/pengukuran/trashed?pageSize=200"
  );

  function reloadAll() {
    reload();
    reloadTrash();
  }

  // drawer form
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [confirmDel, setConfirmDel] = useState<PengukuranRow | null>(null);

  function openAdd() {
    setEditingId(undefined);
    setDrawerOpen(true);
  }
  function openEdit(r: PengukuranRow) {
    setEditingId(r.id);
    setDrawerOpen(true);
  }

  // deep-link ?add=1 → auto-buka drawer tambah
  useEffect(() => {
    if (canEdit && searchParams.get("add") === "1") {
      setEditingId(undefined);
      setDrawerOpen(true);
    }
  }, [searchParams, canEdit]);

  async function doDelete(id: number) {
    const res = await apiFetch(`/api/pengukuran/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Data dipindahkan ke sampah");
      reloadAll();
    } else toast(res.message || "Gagal", "error");
    setConfirmDel(null);
  }
  async function doRestore(id: number) {
    const res = await apiFetch(`/api/pengukuran/${id}/restore`, { method: "PATCH" });
    if (res.ok) {
      toast("Data berhasil dipulihkan");
      reloadAll();
    } else toast(res.message || "Gagal", "error");
  }

  const rows = (data?.data || []).filter((r) => {
    const q = search.toLowerCase();
    return !q || (r.balita_nama || "").toLowerCase().includes(q);
  });

  const baseColumns: Column<PengukuranRow>[] = [
    { header: "Tanggal", cell: (r) => <span className="whitespace-nowrap">{formatTanggal(r.tanggal)}</span> },
    {
      header: "Balita",
      cell: (r) => (
        <div>
          <div className="font-medium text-heading dark:text-slate-200">{r.balita_nama || "-"}</div>
          <div className="text-xs text-slate-400">
            {[r.balita_umur, r.balita_desa].filter(Boolean).join(" · ")}
          </div>
        </div>
      ),
    },
    { header: "BB (kg)", cell: (r) => r.berat_badan },
    { header: "TB (cm)", cell: (r) => r.tinggi_badan },
    { header: "Lingkar Kepala", cell: (r) => (r.lingkar_kepala != null ? `${r.lingkar_kepala} cm` : "-") },
    { header: "LILA", cell: (r) => (r.lingkar_lengan_atas != null ? `${r.lingkar_lengan_atas} cm` : "-") },
    { header: "Z-Score", cell: (r) => <span className="font-medium">{r.z_score != null ? r.z_score : "-"}</span> },
    {
      header: "Status Gizi",
      cell: (r) =>
        r.status_gizi ? (
          <Badge tone={GIZI_TONE[r.status_gizi] || "default"}>{LABEL_GIZI[r.status_gizi]}</Badge>
        ) : (
          "-"
        ),
    },
    {
      header: "Validasi",
      cell: (r) => <Badge tone={r.validasi_status}>{LABEL_VALIDASI[r.validasi_status]}</Badge>,
    },
  ];

  const aktifColumns: Column<PengukuranRow>[] = [
    ...baseColumns,
    ...(canEdit
      ? [
          {
            header: "Aksi",
            cell: (r: PengukuranRow) => (
              <div className="flex items-center gap-2 text-xs">
                <button onClick={() => openEdit(r)} className="text-primary hover:underline font-medium">
                  Edit
                </button>
                <button onClick={() => setConfirmDel(r)} className="text-red-500 hover:underline">
                  Hapus
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const sampahColumns: Column<PengukuranRow>[] = [
    baseColumns[0],
    baseColumns[1],
    baseColumns[2],
    baseColumns[3],
    baseColumns[7],
    {
      header: "Aksi",
      cell: (r) => (
        <button
          onClick={() => doRestore(r.id)}
          className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Pulihkan
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pengukuran Balita"
        subtitle="Antropometri & status gizi balita dampingan"
        actions={
          canEdit ? (
            <Button onClick={openAdd}>
              <Plus className="w-4 h-4" /> Pengukuran Baru
            </Button>
          ) : undefined
        }
      />

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary">
              <Ruler className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase">Data Pengukuran</span>
            </div>
            <TabsAktifSampah value={tab} onChange={setTab} countSampah={trashData?.data?.length} />
          </div>
          <SearchBar value={search} onChange={setSearch} placeholder="Cari balita..." />
        </div>
        <DataTable
          columns={tab === "aktif" ? aktifColumns : sampahColumns}
          rows={rows}
          loading={loading}
          empty={tab === "aktif" ? "Belum ada data pengukuran" : "Sampah kosong"}
        />
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "Edit Pengukuran" : "Pengukuran Baru"}
        subtitle="Catat antropometri & hitung status gizi balita"
      >
        {drawerOpen && (
          <PengukuranForm
            id={editingId}
            onSaved={() => {
              setDrawerOpen(false);
              reloadAll();
            }}
            onCancel={() => setDrawerOpen(false)}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => confirmDel && doDelete(confirmDel.id)}
        title="Hapus Pengukuran"
        message={`Yakin memindahkan data pengukuran "${confirmDel?.balita_nama ?? ""}" ke sampah? Data dapat dipulihkan dari tab Sampah.`}
        danger
        confirmLabel="Hapus"
      />
    </div>
  );
}
