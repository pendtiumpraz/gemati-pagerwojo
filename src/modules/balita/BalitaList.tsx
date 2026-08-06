"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Baby, Eye, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { PageHeader, SearchBar, Button, Badge, Card, LABEL_VALIDASI } from "@/components/ui/primitives";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Drawer, TabsAktifSampah } from "@/components/ui/Drawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import { apiFetch, useList } from "@/lib/useApi";
import { BalitaForm } from "./BalitaForm";

type Row = {
  id: number;
  nama: string;
  nik: string;
  jenis_kelamin: "L" | "P";
  nama_ibu: string;
  status: string;
  validasi_status: string;
  umur: string;
  desa_nama?: string | null;
  posyandu_nama?: string | null;
};

function JkBadge({ jk }: { jk: "L" | "P" }) {
  const isL = jk === "L";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isL
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
          : "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300"
      }`}
    >
      {isL ? "Laki-laki" : "Perempuan"}
    </span>
  );
}

export function BalitaList({
  canAdd,
  title = "Data Balita",
  subtitle = "Data seluruh balita di Kecamatan Pagerwojo",
}: {
  canAdd: boolean;
  title?: string;
  subtitle?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"aktif" | "sampah">("aktif");

  const url =
    tab === "aktif" ? "/api/balita?pageSize=200" : "/api/balita/trashed?pageSize=200";
  const { data, loading, reload } = useList<{ data: Row[] }>(url);
  const { data: trashData, reload: reloadTrash } = useList<{ data: Row[] }>(
    "/api/balita/trashed?pageSize=200"
  );

  function reloadAll() {
    reload();
    reloadTrash();
  }

  // drawer form
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [confirmDel, setConfirmDel] = useState<Row | null>(null);

  function openAdd() {
    setEditingId(undefined);
    setDrawerOpen(true);
  }
  function openEdit(id: number) {
    setEditingId(id);
    setDrawerOpen(true);
  }

  // deep-link: ?add=1 buka drawer tambah, ?edit=<id> buka drawer edit
  useEffect(() => {
    if (!canAdd) return;
    if (searchParams.get("add") === "1") {
      openAdd();
      router.replace("/balita");
    } else {
      const edit = searchParams.get("edit");
      if (edit && !Number.isNaN(Number(edit))) {
        openEdit(Number(edit));
        router.replace("/balita");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, canAdd]);

  const rows = (data?.data || []).filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.nama.toLowerCase().includes(q) ||
      r.nik.toLowerCase().includes(q) ||
      (r.nama_ibu || "").toLowerCase().includes(q)
    );
  });

  async function doDelete(id: number) {
    const res = await apiFetch(`/api/balita/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast("Data dipindahkan ke sampah");
      reloadAll();
    } else toast(res.message || "Gagal menghapus", "error");
    setConfirmDel(null);
  }
  async function doRestore(id: number) {
    const res = await apiFetch(`/api/balita/${id}/restore`, { method: "PATCH" });
    if (res.ok) {
      toast("Data berhasil dipulihkan");
      reloadAll();
    } else toast(res.message || "Gagal memulihkan", "error");
  }

  const namaCol: Column<Row> = {
    header: "Nama Balita",
    cell: (r) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Baby className="w-5 h-5" />
        </div>
        <div>
          <div className="font-medium text-heading dark:text-slate-200">{r.nama}</div>
          <div className="text-xs text-slate-400">NIK: {r.nik}</div>
        </div>
      </div>
    ),
  };

  const aktifColumns: Column<Row>[] = [
    namaCol,
    { header: "JK", cell: (r) => <JkBadge jk={r.jenis_kelamin} /> },
    { header: "Umur", cell: (r) => r.umur },
    { header: "Desa", cell: (r) => r.desa_nama || "-" },
    { header: "Posyandu", cell: (r) => r.posyandu_nama || "-" },
    { header: "Nama Ibu", cell: (r) => r.nama_ibu || "-" },
    {
      header: "Status",
      cell: (r) => (
        <Badge tone={r.status === "aktif" ? "aktif" : "nonaktif"}>
          {r.status === "aktif" ? "Aktif" : "Nonaktif"}
        </Badge>
      ),
    },
    {
      header: "Validasi",
      cell: (r) => <Badge tone={r.validasi_status}>{LABEL_VALIDASI[r.validasi_status] || r.validasi_status}</Badge>,
    },
    {
      header: "Aksi",
      cell: (r) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push(`/balita/${r.id}`)}
            className="text-slate-400 hover:text-primary p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Lihat detail"
          >
            <Eye className="w-4 h-4" />
          </button>
          {canAdd && (
            <>
              <button
                onClick={() => openEdit(r.id)}
                className="text-slate-400 hover:text-primary p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Edit"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => setConfirmDel(r)}
                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  const sampahColumns: Column<Row>[] = [
    namaCol,
    { header: "JK", cell: (r) => <JkBadge jk={r.jenis_kelamin} /> },
    { header: "Umur", cell: (r) => r.umur },
    { header: "Desa", cell: (r) => r.desa_nama || "-" },
    { header: "Nama Ibu", cell: (r) => r.nama_ibu || "-" },
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
        title={title}
        subtitle={subtitle}
        actions={
          canAdd ? (
            <Button onClick={openAdd}>
              <Plus className="w-4 h-4" /> Tambah Balita
            </Button>
          ) : undefined
        }
      />

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabsAktifSampah value={tab} onChange={setTab} countSampah={trashData?.data?.length} />
          <SearchBar value={search} onChange={setSearch} placeholder="Cari nama, NIK, atau nama ibu..." />
        </div>
        <DataTable
          columns={tab === "aktif" ? aktifColumns : sampahColumns}
          rows={rows}
          loading={loading}
          empty={tab === "aktif" ? "Belum ada data balita" : "Sampah kosong"}
        />
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? "Edit Data Balita" : "Tambah Data Balita"}
        subtitle="Lengkapi data balita dampingan dengan benar"
      >
        {drawerOpen && (
          <BalitaForm
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
        title="Hapus Data Balita"
        message={`Yakin memindahkan "${confirmDel?.nama}" ke sampah? Data dapat dipulihkan dari tab Sampah.`}
        danger
        confirmLabel="Hapus"
      />
    </div>
  );
}
