"use client";
import { useEffect, useState } from "react";
import { Camera, Save } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/useApi";
import { hitungUmur } from "@/lib/utils";

type DesaOpt = { id: number; nama: string };
type PosyanduOpt = { id: number; nama: string; desa_id: number };

type FormState = {
  nik: string;
  nama: string;
  jenis_kelamin: "L" | "P";
  tempat_lahir: string;
  tanggal_lahir: string;
  nama_ayah: string;
  nama_ibu: string;
  no_hp: string;
  alamat: string;
  rt: string;
  rw: string;
  dusun: string;
  desa_id: string;
  posyandu_id: string;
  status: "aktif" | "nonaktif";
};

const EMPTY: FormState = {
  nik: "",
  nama: "",
  jenis_kelamin: "L",
  tempat_lahir: "",
  tanggal_lahir: "",
  nama_ayah: "",
  nama_ibu: "",
  no_hp: "",
  alamat: "",
  rt: "",
  rw: "",
  dusun: "",
  desa_id: "",
  posyandu_id: "",
  status: "aktif",
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-primary font-semibold text-xs uppercase tracking-wide">{children}</h3>
  );
}

export function BalitaForm({
  id,
  onSaved,
  onCancel,
}: {
  id?: number;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const editing = typeof id === "number";

  const [form, setForm] = useState<FormState>(EMPTY);
  const [desaOpts, setDesaOpts] = useState<DesaOpt[]>([]);
  const [posyanduOpts, setPosyanduOpts] = useState<PosyanduOpt[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(editing);

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  // opsi desa
  useEffect(() => {
    apiFetch<DesaOpt[]>("/api/desa").then((r) => r.data && setDesaOpts(r.data));
  }, []);

  // opsi posyandu (ikuti desa terpilih)
  useEffect(() => {
    const url = form.desa_id ? `/api/balita/posyandu?desa_id=${form.desa_id}` : "/api/balita/posyandu";
    apiFetch<PosyanduOpt[]>(url).then((r) => setPosyanduOpts(r.data || []));
  }, [form.desa_id]);

  // prefill mode edit
  useEffect(() => {
    if (!editing) return;
    setLoading(true);
    apiFetch<any>(`/api/balita/${id}`).then((r) => {
      if (r.ok && r.data) {
        const b = r.data;
        setForm({
          nik: b.nik ?? "",
          nama: b.nama ?? "",
          jenis_kelamin: b.jenis_kelamin ?? "L",
          tempat_lahir: b.tempat_lahir ?? "",
          tanggal_lahir: b.tanggal_lahir ?? "",
          nama_ayah: b.nama_ayah ?? "",
          nama_ibu: b.nama_ibu ?? "",
          no_hp: b.no_hp ?? "",
          alamat: b.alamat ?? "",
          rt: b.rt ?? "",
          rw: b.rw ?? "",
          dusun: b.dusun ?? "",
          desa_id: b.desa_id ? String(b.desa_id) : "",
          posyandu_id: b.posyandu_id ? String(b.posyandu_id) : "",
          status: b.status ?? "aktif",
        });
      } else {
        toast(r.message || "Gagal memuat data", "error");
      }
      setLoading(false);
    });
  }, [editing, id, toast]);

  const umur = form.tanggal_lahir ? hitungUmur(form.tanggal_lahir) : "—";

  async function save() {
    if (!form.nik || !form.nama || !form.tanggal_lahir || !form.nama_ibu || !form.desa_id) {
      toast("Lengkapi field wajib (NIK, Nama, Tanggal Lahir, Nama Ibu, Desa)", "error");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      desa_id: Number(form.desa_id),
      posyandu_id: form.posyandu_id ? Number(form.posyandu_id) : null,
      tempat_lahir: form.tempat_lahir || null,
      nama_ayah: form.nama_ayah || null,
      no_hp: form.no_hp || null,
      alamat: form.alamat || null,
      rt: form.rt || null,
      rw: form.rw || null,
      dusun: form.dusun || null,
    };
    const res = editing
      ? await apiFetch(`/api/balita/${id}`, { method: "PUT", body: JSON.stringify(payload) })
      : await apiFetch(`/api/balita`, { method: "POST", body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) {
      toast(editing ? "Data berhasil diperbarui" : "Data balita berhasil ditambahkan");
      onSaved();
    } else {
      toast(res.message || "Gagal menyimpan data", "error");
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-slate-400">Memuat data...</div>;
  }

  return (
    <div className="space-y-5">
      {/* DATA IDENTITAS BALITA */}
      <div className="space-y-3">
        <SectionTitle>Data Identitas Balita</SectionTitle>
        <Field label="NIK Balita" required>
          <Input value={form.nik} onChange={(e) => set("nik", e.target.value)} placeholder="16 digit NIK" maxLength={16} />
        </Field>
        <Field label="Nama Balita" required>
          <Input value={form.nama} onChange={(e) => set("nama", e.target.value)} placeholder="Nama lengkap" />
        </Field>
        <Field label="Jenis Kelamin" required>
          <div className="flex items-center gap-6 mt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm dark:text-slate-200">
              <input
                type="radio"
                name="jenis_kelamin"
                className="accent-primary"
                checked={form.jenis_kelamin === "L"}
                onChange={() => set("jenis_kelamin", "L")}
              />
              Laki-laki
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm dark:text-slate-200">
              <input
                type="radio"
                name="jenis_kelamin"
                className="accent-primary"
                checked={form.jenis_kelamin === "P"}
                onChange={() => set("jenis_kelamin", "P")}
              />
              Perempuan
            </label>
          </div>
        </Field>
        <Field label="Tempat Lahir">
          <Input value={form.tempat_lahir} onChange={(e) => set("tempat_lahir", e.target.value)} />
        </Field>
        <Field label="Tanggal Lahir" required>
          <Input type="date" value={form.tanggal_lahir} onChange={(e) => set("tanggal_lahir", e.target.value)} />
        </Field>
        <Field label="Umur (otomatis)">
          <Input value={umur} readOnly className="bg-slate-50 dark:bg-slate-800/60" />
        </Field>
      </div>

      {/* DATA ORANG TUA */}
      <div className="space-y-3">
        <SectionTitle>Data Orang Tua</SectionTitle>
        <Field label="Nama Ayah">
          <Input value={form.nama_ayah} onChange={(e) => set("nama_ayah", e.target.value)} />
        </Field>
        <Field label="Nama Ibu" required>
          <Input value={form.nama_ibu} onChange={(e) => set("nama_ibu", e.target.value)} />
        </Field>
        <Field label="Nomor HP">
          <Input value={form.no_hp} onChange={(e) => set("no_hp", e.target.value)} placeholder="08xxx" />
        </Field>
      </div>

      {/* ALAMAT */}
      <div className="space-y-3">
        <SectionTitle>Alamat</SectionTitle>
        <Field label="Alamat">
          <Textarea value={form.alamat} onChange={(e) => set("alamat", e.target.value)} />
        </Field>
        <div className="grid grid-cols-3 gap-3">
          <Field label="RT">
            <Input value={form.rt} onChange={(e) => set("rt", e.target.value)} />
          </Field>
          <Field label="RW">
            <Input value={form.rw} onChange={(e) => set("rw", e.target.value)} />
          </Field>
          <Field label="Dusun">
            <Input value={form.dusun} onChange={(e) => set("dusun", e.target.value)} />
          </Field>
        </div>
        <Field label="Desa" required>
          <Select value={form.desa_id} onChange={(e) => set("desa_id", e.target.value)}>
            <option value="">Pilih Desa</option>
            {desaOpts.map((d) => (
              <option key={d.id} value={d.id}>
                Desa {d.nama}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Posyandu">
          <Select value={form.posyandu_id} onChange={(e) => set("posyandu_id", e.target.value)}>
            <option value="">Pilih Posyandu</option>
            {posyanduOpts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Status Balita">
          <Select value={form.status} onChange={(e) => set("status", e.target.value as "aktif" | "nonaktif")}>
            <option value="aktif">Aktif</option>
            <option value="nonaktif">Nonaktif</option>
          </Select>
        </Field>
      </div>

      {/* FOTO BALITA */}
      <div className="space-y-3">
        <SectionTitle>Foto Balita</SectionTitle>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
            <Camera className="w-6 h-6" />
          </div>
          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-darkcard cursor-pointer">
            <Camera className="w-4 h-4" /> Pilih Foto
            <input type="file" accept="image/*" className="hidden" />
          </label>
        </div>
      </div>

      {/* FOOTER (mandiri di dalam form) */}
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button onClick={save} disabled={saving}>
          <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
