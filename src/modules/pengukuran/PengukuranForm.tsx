"use client";
import { useEffect, useMemo, useState } from "react";
import { Ruler, Save, Calendar, Calculator, Loader2 } from "lucide-react";
import { Field, Input, Select, Button, Badge } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { apiFetch, useList } from "@/lib/useApi";
import { formatDateISO, umurBulan } from "@/lib/utils";
import { hitungStatusGizi, LABEL_GIZI, LABEL_RISIKO, type HasilGizi } from "@/lib/gizi";

type BalitaOpt = {
  id: number;
  nama: string;
  umur?: string | null;
  tanggal_lahir?: string;
  jenis_kelamin?: string;
};

type PengukuranDetail = {
  balita_id: number;
  tanggal: string;
  berat_badan: number;
  tinggi_badan: number;
  lingkar_kepala: number | null;
  lingkar_lengan_atas: number | null;
  z_score: number | null;
  status_gizi: string | null;
  risiko_stunting: string | null;
};

const GIZI_TONE: Record<string, string> = {
  normal: "aktif",
  kurang: "menunggu",
  sangat_kurang: "ditolak",
};

/**
 * Isi Drawer form Pengukuran (single-column 400px).
 * Tambah bila tanpa id, edit + prefill bila ada id. Footer aksi mandiri.
 */
export function PengukuranForm({
  id,
  onSaved,
  onCancel,
}: {
  id?: number;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const { data: balitaData } = useList<{ data: BalitaOpt[] }>("/api/balita?pageSize=200");
  const balitaOpts = balitaData?.data || [];

  const [form, setForm] = useState({
    balita_id: "",
    tanggal: formatDateISO(),
    berat_badan: "",
    tinggi_badan: "",
    lingkar_kepala: "",
    lingkar_lengan_atas: "",
  });
  const [hasil, setHasil] = useState<HasilGizi | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(!!id);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoadingDetail(true);
    apiFetch<PengukuranDetail>(`/api/pengukuran/${id}`).then((res) => {
      if (!alive) return;
      if (res.ok && res.data) {
        const r = res.data;
        setForm({
          balita_id: String(r.balita_id),
          tanggal: String(r.tanggal).slice(0, 10),
          berat_badan: r.berat_badan != null ? String(r.berat_badan) : "",
          tinggi_badan: r.tinggi_badan != null ? String(r.tinggi_badan) : "",
          lingkar_kepala: r.lingkar_kepala != null ? String(r.lingkar_kepala) : "",
          lingkar_lengan_atas: r.lingkar_lengan_atas != null ? String(r.lingkar_lengan_atas) : "",
        });
        if (r.z_score != null && r.status_gizi && r.risiko_stunting) {
          setHasil({
            z_score: r.z_score,
            status_gizi: r.status_gizi as HasilGizi["status_gizi"],
            risiko_stunting: r.risiko_stunting as HasilGizi["risiko_stunting"],
          });
        }
      } else {
        toast(res.message || "Gagal memuat data", "error");
      }
      setLoadingDetail(false);
    });
    return () => {
      alive = false;
    };
  }, [id, toast]);

  const selectedBalita = useMemo(
    () => balitaOpts.find((b) => String(b.id) === form.balita_id),
    [balitaOpts, form.balita_id]
  );

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: val }));
    setHasil(null);
  }

  function hitung() {
    if (!selectedBalita?.tanggal_lahir || !selectedBalita?.jenis_kelamin) {
      return toast("Data tanggal lahir / jenis kelamin balita tidak tersedia", "error");
    }
    const tb = Number(form.tinggi_badan);
    if (!tb) return toast("Isi tinggi badan terlebih dahulu", "error");
    const bulan = umurBulan(selectedBalita.tanggal_lahir, new Date(form.tanggal));
    setHasil(hitungStatusGizi(tb, bulan, selectedBalita.jenis_kelamin as "L" | "P"));
  }

  async function save() {
    if (!form.balita_id) return toast("Pilih balita terlebih dahulu", "error");
    if (!form.berat_badan || !form.tinggi_badan)
      return toast("Berat & tinggi badan wajib diisi", "error");

    const payload = {
      balita_id: Number(form.balita_id),
      tanggal: form.tanggal,
      berat_badan: Number(form.berat_badan),
      tinggi_badan: Number(form.tinggi_badan),
      lingkar_kepala: form.lingkar_kepala ? Number(form.lingkar_kepala) : null,
      lingkar_lengan_atas: form.lingkar_lengan_atas ? Number(form.lingkar_lengan_atas) : null,
    };

    setSaving(true);
    const res = id
      ? await apiFetch(`/api/pengukuran/${id}`, { method: "PUT", body: JSON.stringify(payload) })
      : await apiFetch("/api/pengukuran", { method: "POST", body: JSON.stringify(payload) });
    setSaving(false);
    if (res.ok) {
      toast(id ? "Data berhasil diperbarui" : "Pengukuran berhasil disimpan");
      onSaved();
    } else {
      toast(res.message || "Gagal menyimpan", "error");
    }
  }

  if (loadingDetail) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-primary">
        <Ruler className="w-4 h-4" />
        <span className="font-semibold text-xs uppercase">Data Pengukuran</span>
      </div>

      <Field label="Pilih Balita" required>
        <Select value={form.balita_id} onChange={(e) => set("balita_id", e.target.value)}>
          <option value="">-- Pilih balita dampingan --</option>
          {balitaOpts.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nama}
              {b.umur ? ` (${b.umur})` : ""}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Tanggal Pengukuran" required>
        <div className="relative">
          <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            type="date"
            className="pl-9"
            value={form.tanggal}
            onChange={(e) => set("tanggal", e.target.value)}
          />
        </div>
      </Field>

      <Field label="Berat Badan (kg)" required>
        <Input
          type="number"
          step="0.1"
          placeholder="contoh: 8.5"
          value={form.berat_badan}
          onChange={(e) => set("berat_badan", e.target.value)}
        />
      </Field>

      <Field label="Tinggi Badan (cm)" required>
        <Input
          type="number"
          step="0.1"
          placeholder="contoh: 72.0"
          value={form.tinggi_badan}
          onChange={(e) => set("tinggi_badan", e.target.value)}
        />
      </Field>

      <Field label="Lingkar Kepala (cm)">
        <Input
          type="number"
          step="0.1"
          placeholder="contoh: 44.0"
          value={form.lingkar_kepala}
          onChange={(e) => set("lingkar_kepala", e.target.value)}
        />
      </Field>

      <Field label="Lingkar Lengan Atas (cm)">
        <Input
          type="number"
          step="0.1"
          placeholder="contoh: 12.0"
          value={form.lingkar_lengan_atas}
          onChange={(e) => set("lingkar_lengan_atas", e.target.value)}
        />
      </Field>

      <div>
        <Button type="button" variant="outline" onClick={hitung}>
          <Calculator className="w-4 h-4" /> Hitung Status Gizi &amp; Risiko Stunting
        </Button>
      </div>

      {hasil && (
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-darkcard/60 p-4 space-y-3">
          <div>
            <div className="text-[11px] uppercase text-slate-500 font-medium">Z-Score (TB/U)</div>
            <div className="text-2xl font-bold text-heading dark:text-white">{hasil.z_score}</div>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-[11px] uppercase text-slate-500 font-medium mb-1">Status Gizi</div>
              <Badge tone={GIZI_TONE[hasil.status_gizi] || "default"}>
                {LABEL_GIZI[hasil.status_gizi]}
              </Badge>
            </div>
            <div>
              <div className="text-[11px] uppercase text-slate-500 font-medium mb-1">Risiko Stunting</div>
              <Badge tone={hasil.risiko_stunting === "tinggi" ? "ditolak" : "aktif"}>
                {LABEL_RISIKO[hasil.risiko_stunting]}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Footer aksi (mandiri) */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button variant="outline" type="button" onClick={onCancel}>
          Batal
        </Button>
        <Button onClick={save} disabled={saving}>
          <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>
    </div>
  );
}
