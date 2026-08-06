"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Egg, Plus, RotateCcw } from "lucide-react";
import { PageHeader, Card, Badge, Button, SearchBar, Select, LABEL_VALIDASI } from "@/components/ui/primitives";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Drawer, TabsAktifSampah } from "@/components/ui/Drawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import { apiFetch, useList } from "@/lib/useApi";
import { formatTanggal } from "@/lib/utils";
import { PendampinganForm } from "./PendampinganForm";

export type PendampinganRow = {
  id: number;
  balita_id: number;
  tanggal: string;
  hari_ke: number | null;
  jam: string | null;
  makan_telur: boolean;
  jumlah_butir: number | null;
  nama_pendamping: string | null;
  keterangan: string | null;
  validasi_status: string;
  balita_nama: string | null;
  balita_umur: string | null;
  balita_desa: string | null;
};

export function PendampinganList({
  role = "kader",
  namaPendamping = "",
}: {
  role?: "admin" | "ppkbd" | "kader";
  namaPendamping?: string;
}) {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const canEdit = role === "kader" || role === "admin";

  const [tab, setTab] = useState<"aktif" | "sampah">("aktif");
  const [search, setSearch] = useState("");
  const [filterValidasi, setFilterValidasi] = useState<"all" | "menunggu" | "disetujui" | "ditolak">("all");
  const url =
    tab === "aktif"
      ? "/api/pendampingan?pageSize=200"
      : "/api/pendampingan/trashed?pageSize=200";
  const { data, loading, reload } = useList<{ data: PendampinganRow[] }>(url);
  const { data: trashData, reload: reloadTrash } = useList<{ data: PendampinganRow[] }>(
    "/api/pendampingan/trashed?pageSize=200"
  );

  function reloadAll() {
    reload();
    reloadTrash();
  }

  // drawer form
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [confirmDel, setConfirmDel] = useState<PendampinganRow | null>(null);

  function openAdd() {
    setEditingId(undefined);
    setDrawerOpen(true);
  }
  function openEdit(r: PendampinganRow) {
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
    const res = await apiFetch(`/api/pendampingan/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Data dipindahkan ke sampah");
      reloadAll();
    } else toast(res.message || "Gagal", "error");
    setConfirmDel(null);
  }
  async function doRestore(id: number) {
    const res = await apiFetch(`/api/pendampingan/${id}/restore`, { method: "PATCH" });
    if (res.ok) {
      toast("Data berhasil dipulihkan");
      reloadAll();
    } else toast(res.message || "Gagal", "error");
  }

  const rows = (data?.data || []).filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (r.balita_nama || "").toLowerCase().includes(q) ||
      (r.nama_pendamping || "").toLowerCase().includes(q) ||
      (r.keterangan || "").toLowerCase().includes(q);
    const matchValidasi = tab === "sampah" || filterValidasi === "all" || r.validasi_status === filterValidasi;
    return matchSearch && matchValidasi;
  });

  const baseColumns: Column<PendampinganRow>[] = [
    { header: "Tanggal", sortValue: (r) => r.tanggal, cell: (r) => <span className="whitespace-nowrap">{formatTanggal(r.tanggal)}</span> },
    {
      header: "Balita",
      sortValue: (r) => r.balita_nama || "",
      cell: (r) => (
        <div>
          <div className="font-medium text-heading dark:text-slate-200">{r.balita_nama || "-"}</div>
          <div className="text-xs text-slate-400">
            {[r.balita_umur, r.balita_desa].filter(Boolean).join(" · ")}
          </div>
        </div>
      ),
    },
    { header: "Hari", sortValue: (r) => r.hari_ke ?? 0, cell: (r) => <span className="font-medium">Hari {r.hari_ke ?? "-"}</span> },
    {
      header: "Makan Telur",
      cell: (r) =>
        r.makan_telur ? (
          <span className="text-green-700 dark:text-green-400 font-medium">
            Ya ({r.jumlah_butir ?? "-"} butir)
          </span>
        ) : (
          <span className="text-slate-500">Tidak</span>
        ),
    },
    { header: "Jam", cell: (r) => r.jam || "-" },
    { header: "Pendamping", cell: (r) => r.nama_pendamping || "-" },
    {
      header: "Keterangan",
      cell: (r) => <span className="text-slate-500 line-clamp-2 max-w-[220px] inline-block">{r.keterangan || "-"}</span>,
    },
    {
      header: "Validasi",
      sortValue: (r) => r.validasi_status,
      cell: (r) => <Badge tone={r.validasi_status}>{LABEL_VALIDASI[r.validasi_status]}</Badge>,
    },
  ];

  const aktifColumns: Column<PendampinganRow>[] = [
    ...baseColumns,
    ...(canEdit
      ? [
          {
            header: "Aksi",
            cell: (r: PendampinganRow) => (
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

  const sampahColumns: Column<PendampinganRow>[] = [
    ...baseColumns.slice(0, 4),
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
        title="Pendampingan Makan Telur"
        subtitle="Catatan konsumsi telur harian balita dampingan"
        actions={
          canEdit ? (
            <Button onClick={openAdd}>
              <Plus className="w-4 h-4" /> Pendampingan Baru
            </Button>
          ) : undefined
        }
      />

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-primary">
              <Egg className="w-5 h-5" />
              <span className="font-semibold text-sm uppercase">Data Pendampingan</span>
            </div>
            <TabsAktifSampah value={tab} onChange={setTab} countSampah={trashData?.data?.length} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {tab === "aktif" && (
              <Select
                value={filterValidasi}
                onChange={(e) => setFilterValidasi(e.target.value as any)}
                className="w-auto py-2 text-sm"
              >
                <option value="all">Semua Validasi</option>
                <option value="menunggu">Menunggu</option>
                <option value="disetujui">Disetujui</option>
                <option value="ditolak">Ditolak</option>
              </Select>
            )}
            <SearchBar value={search} onChange={setSearch} placeholder="Cari balita, pendamping, keterangan..." />
          </div>
        </div>
        <DataTable
          columns={tab === "aktif" ? aktifColumns : sampahColumns}
          rows={rows}
          loading={loading}
          empty={tab === "aktif" ? "Belum ada data pendampingan" : "Sampah kosong"}
        />
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "Edit Pendampingan" : "Pendampingan Baru"}
        subtitle="Catat konsumsi telur harian balita dampingan"
      >
        {drawerOpen && (
          <PendampinganForm
            id={editingId}
            namaPendamping={namaPendamping}
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
        title="Hapus Pendampingan"
        message={`Yakin memindahkan data pendampingan "${confirmDel?.balita_nama ?? ""}" ke sampah? Data dapat dipulihkan dari tab Sampah.`}
        danger
        confirmLabel="Hapus"
      />
    </div>
  );
}
