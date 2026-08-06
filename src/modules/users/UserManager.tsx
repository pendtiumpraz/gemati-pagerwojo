"use client";
import { useEffect, useMemo, useState } from "react";
import { Plus, Users as UsersIcon, CheckCircle, XCircle, Building2, RotateCcw, Trash2 } from "lucide-react";
import { PageHeader, StatCard, SearchBar, Button, Field, Input, Select, Badge, Card } from "@/components/ui/primitives";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Drawer, TabsAktifSampah } from "@/components/ui/Drawer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/toast";
import { apiFetch, useList } from "@/lib/useApi";
import { inisial } from "@/lib/utils";

type Row = {
  id: number; nama: string; username: string; role: string;
  desa_id: number | null; desa_nama?: string | null; phone?: string;
  email?: string; active: boolean; balita_count?: number; pendampingan_count?: number;
};
type DesaOpt = { id: number; nama: string };

const ROLE_LABEL: Record<string, string> = { admin: "Admin", ppkbd: "PPKBD", kader: "KPK" };
const ROLE_TONE: Record<string, string> = { admin: "admin", ppkbd: "ppkbd", kader: "kpk" };

export function UserManager({
  role,
  title,
  subtitle,
  addLabel,
  countLabel = "Balita Dampingan",
  showRole = false,
}: {
  role?: "kader" | "ppkbd";
  title: string;
  subtitle: string;
  addLabel: string;
  countLabel?: string;
  showRole?: boolean;
}) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"aktif" | "sampah">("aktif");
  const roleQ = role ? `&role=${role}` : "";
  const url =
    tab === "aktif"
      ? `/api/users?pageSize=200${roleQ}`
      : `/api/users/trashed?pageSize=200${roleQ}`;
  const { data, loading, reload } = useList<{ data: Row[] }>(url);
  // hitung sampah count untuk badge tab
  const { data: trashData, reload: reloadTrash } = useList<{ data: Row[] }>(
    `/api/users/trashed?pageSize=200${roleQ}`
  );
  const [desaOpts, setDesaOpts] = useState<DesaOpt[]>([]);

  useEffect(() => {
    apiFetch<DesaOpt[]>("/api/desa").then((r) => r.data && setDesaOpts(r.data));
  }, []);

  function reloadAll() {
    reload();
    reloadTrash();
  }

  const rows = (data?.data || []).filter((r) => {
    const q = search.toLowerCase();
    return !q || r.nama.toLowerCase().includes(q) || r.username.toLowerCase().includes(q) || (r.email || "").toLowerCase().includes(q);
  });

  const stats = useMemo(() => {
    const all = data?.data || [];
    return {
      total: all.length,
      aktif: all.filter((r) => r.active).length,
      nonaktif: all.filter((r) => !r.active).length,
      desa: new Set(all.map((r) => r.desa_id).filter(Boolean)).size,
    };
  }, [data]);

  // drawer form
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Row | null>(null);

  function openAdd() {
    setEditing(null);
    setForm({ nama: "", username: "", role: role || "kader", desa_id: "", phone: "", email: "", password: "kader123" });
    setDrawerOpen(true);
  }
  function openEdit(r: Row) {
    setEditing(r);
    setForm({ nama: r.nama, username: r.username, role: r.role, desa_id: r.desa_id ?? "", phone: r.phone || "", email: r.email || "" });
    setDrawerOpen(true);
  }

  async function save() {
    setSaving(true);
    const payload = {
      ...form,
      role: form.role,
      desa_id: form.role === "admin" ? null : form.desa_id ? Number(form.desa_id) : null,
    };
    const res = editing
      ? await apiFetch(`/api/users/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) })
      : await apiFetch(`/api/users`, { method: "POST", body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) {
      toast(editing ? "Data berhasil diperbarui" : "Data berhasil ditambahkan");
      setDrawerOpen(false);
      reloadAll();
    } else toast(res.message || "Gagal menyimpan", "error");
  }

  async function doToggle(id: number) {
    const res = await apiFetch(`/api/users/${id}/toggle-active`, { method: "PATCH" });
    if (res.ok) { toast(res.message || "Status diubah"); reload(); }
    else toast(res.message || "Gagal", "error");
  }
  async function doReset(id: number) {
    const res = await apiFetch(`/api/users/${id}/reset-password`, { method: "PATCH" });
    if (res.ok) toast(res.message || "Password direset");
    else toast(res.message || "Gagal", "error");
  }
  async function doDelete(id: number) {
    const res = await apiFetch(`/api/users/${id}`, { method: "DELETE" });
    if (res.ok) { toast("Data dipindahkan ke sampah"); reloadAll(); }
    else toast(res.message || "Gagal", "error");
    setConfirmDel(null);
  }
  async function doRestore(id: number) {
    const res = await apiFetch(`/api/users/${id}/restore`, { method: "PATCH" });
    if (res.ok) { toast("Data berhasil dipulihkan"); reloadAll(); }
    else toast(res.message || "Gagal", "error");
  }

  const aktifColumns: Column<Row>[] = [
    {
      header: "Nama",
      cell: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center shrink-0">
            {inisial(r.nama)}
          </div>
          <div>
            <div className="font-medium text-heading dark:text-slate-200">{r.nama}</div>
            <div className="text-xs text-slate-400">@{r.username}</div>
          </div>
        </div>
      ),
    },
    ...(showRole ? [{ header: "Role", cell: (r: Row) => <Badge tone={ROLE_TONE[r.role]}>{ROLE_LABEL[r.role]}</Badge> }] : []),
    { header: "Desa", cell: (r) => r.desa_nama || (r.role === "admin" ? "Kecamatan" : "-") },
    { header: "No. HP", cell: (r) => r.phone || "-" },
    { header: "Email", cell: (r) => <span className="text-slate-500">{r.email || "-"}</span> },
    ...(!showRole
      ? [{ header: countLabel, cell: (r: Row) => <Badge tone="default">{r.balita_count ?? 0} {role === "ppkbd" ? "kader" : "balita"}</Badge> }]
      : []),
    { header: "Status", cell: (r) => <Badge tone={r.active ? "aktif" : "nonaktif"}>{r.active ? "Aktif" : "Nonaktif"}</Badge> },
    {
      header: "Aksi",
      cell: (r) => (
        <div className="flex items-center gap-2 text-xs">
          <button onClick={() => openEdit(r)} className="text-primary hover:underline font-medium">Edit</button>
          <button onClick={() => doToggle(r.id)} className="text-slate-500 hover:underline">{r.active ? "Nonaktifkan" : "Aktifkan"}</button>
          <button onClick={() => doReset(r.id)} className="text-slate-500 hover:underline">Reset Password</button>
          <button onClick={() => setConfirmDel(r)} className="text-red-500 hover:underline">Hapus</button>
        </div>
      ),
    },
  ];

  const sampahColumns: Column<Row>[] = [
    aktifColumns[0],
    ...(showRole ? [{ header: "Role", cell: (r: Row) => <Badge tone={ROLE_TONE[r.role]}>{ROLE_LABEL[r.role]}</Badge> }] : []),
    { header: "Desa", cell: (r) => r.desa_nama || (r.role === "admin" ? "Kecamatan" : "-") },
    { header: "Email", cell: (r) => <span className="text-slate-500">{r.email || "-"}</span> },
    {
      header: "Aksi",
      cell: (r) => (
        <button onClick={() => doRestore(r.id)} className="inline-flex items-center gap-1 text-primary hover:underline text-xs font-medium">
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
        actions={<Button onClick={openAdd}><Plus className="w-4 h-4" /> {addLabel}</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={showRole ? "Total Pengguna" : "Total"} value={stats.total} icon={UsersIcon} color="#2e7d32" />
        <StatCard label="Aktif" value={stats.aktif} icon={CheckCircle} color="#16a34a" />
        <StatCard label="Nonaktif" value={stats.nonaktif} icon={XCircle} color="#dc2626" />
        <StatCard label={role === "ppkbd" ? "Desa Tercover" : "Desa Terlayani"} value={stats.desa} icon={Building2} color="#2563eb" />
      </div>

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <TabsAktifSampah
            value={tab}
            onChange={setTab}
            countSampah={trashData?.data?.length}
          />
          <SearchBar value={search} onChange={setSearch} placeholder="Cari nama atau username..." />
        </div>
        <DataTable
          columns={tab === "aktif" ? aktifColumns : sampahColumns}
          rows={rows}
          loading={loading}
          empty={tab === "aktif" ? "Belum ada pengguna" : "Sampah kosong"}
        />
      </Card>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? `Edit ${addLabel.replace("Tambah ", "")}` : addLabel}
        footer={
          <>
            <Button variant="outline" onClick={() => setDrawerOpen(false)}>Batal</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Menyimpan..." : "Simpan"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Nama Lengkap" required>
            <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          </Field>
          <Field label="Username" required>
            <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </Field>
          {showRole && (
            <Field label="Role / Hak Akses" required>
              <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="ppkbd">PPKBD</option>
                <option value="kader">Kader (KPK)</option>
              </Select>
            </Field>
          )}
          {form.role !== "admin" && (
            <Field label="Desa" required>
              <Select value={form.desa_id} onChange={(e) => setForm({ ...form, desa_id: e.target.value })}>
                <option value="">Pilih desa</option>
                {desaOpts.map((d) => (
                  <option key={d.id} value={d.id}>Desa {d.nama}</option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="No. HP">
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          {!editing && (
            <Field label="Password Awal">
              <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Field>
          )}
        </div>
      </Drawer>

      <ConfirmDialog
        open={!!confirmDel}
        onClose={() => setConfirmDel(null)}
        onConfirm={() => confirmDel && doDelete(confirmDel.id)}
        title="Hapus Pengguna"
        message={`Yakin memindahkan "${confirmDel?.nama}" ke sampah? Data dapat dipulihkan dari tab Sampah.`}
        danger
        confirmLabel="Hapus"
      />
    </div>
  );
}
