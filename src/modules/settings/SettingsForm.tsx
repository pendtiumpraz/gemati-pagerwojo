"use client";
import { useEffect, useState } from "react";
import {
  Settings,
  ShieldCheck,
  Bell,
  Database,
  Save,
  Download,
  Upload,
} from "lucide-react";
import {
  PageHeader,
  Card,
  Field,
  Input,
  Button,
} from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/useApi";
import { formatTanggal } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Settings = {
  nama_aplikasi: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  session_timeout: number;
  batas_login: number;
  mode_maintenance: boolean;
  notif_email: boolean;
  notif_push: boolean;
  backup_otomatis: boolean;
  last_backup: string | null;
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-slate-300 dark:bg-slate-600"
        )}
        aria-pressed={checked}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1"
          )}
        />
      </button>
    </div>
  );
}

function CardTitle({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <h2 className="font-semibold text-heading dark:text-white">{title}</h2>
    </div>
  );
}

export function SettingsForm() {
  const { toast } = useToast();
  const [form, setForm] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<Settings>("/api/settings").then((r) => {
      if (r.ok && r.data) setForm(r.data);
    });
  }, []);

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    const res = await apiFetch("/api/settings", {
      method: "PUT",
      body: JSON.stringify({
        nama_aplikasi: form.nama_aplikasi,
        kecamatan: form.kecamatan,
        kabupaten: form.kabupaten,
        provinsi: form.provinsi,
        session_timeout: Number(form.session_timeout),
        batas_login: Number(form.batas_login),
        mode_maintenance: form.mode_maintenance,
        notif_email: form.notif_email,
        notif_push: form.notif_push,
        backup_otomatis: form.backup_otomatis,
      }),
    });
    setSaving(false);
    if (res.ok) toast(res.message || "Pengaturan berhasil disimpan");
    else toast(res.message || "Gagal menyimpan", "error");
  }

  if (!form) {
    return (
      <div className="space-y-5">
        <PageHeader title="Pengaturan Aplikasi" subtitle="Kelola konfigurasi sistem GEMATI" />
        <Card className="p-8 text-center text-slate-400">Memuat pengaturan...</Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Pengaturan Aplikasi" subtitle="Kelola konfigurasi sistem GEMATI" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Umum */}
        <Card className="p-5">
          <CardTitle icon={Settings} title="Pengaturan Umum" />
          <div className="space-y-4">
            <Field label="Nama Aplikasi">
              <Input value={form.nama_aplikasi} onChange={(e) => set("nama_aplikasi", e.target.value)} />
            </Field>
            <Field label="Kecamatan">
              <Input value={form.kecamatan} onChange={(e) => set("kecamatan", e.target.value)} />
            </Field>
            <Field label="Kabupaten">
              <Input value={form.kabupaten} onChange={(e) => set("kabupaten", e.target.value)} />
            </Field>
            <Field label="Provinsi">
              <Input value={form.provinsi} onChange={(e) => set("provinsi", e.target.value)} />
            </Field>
          </div>
        </Card>

        {/* Keamanan */}
        <Card className="p-5">
          <CardTitle icon={ShieldCheck} title="Keamanan" />
          <div className="space-y-4">
            <Field label="Session Timeout (menit)">
              <Input
                type="number"
                value={form.session_timeout}
                onChange={(e) => set("session_timeout", Number(e.target.value))}
              />
            </Field>
            <Field label="Batas Percobaan Login">
              <Input
                type="number"
                value={form.batas_login}
                onChange={(e) => set("batas_login", Number(e.target.value))}
              />
            </Field>
            <Toggle
              label="Mode Maintenance"
              checked={form.mode_maintenance}
              onChange={(v) => set("mode_maintenance", v)}
            />
          </div>
        </Card>

        {/* Notifikasi */}
        <Card className="p-5">
          <CardTitle icon={Bell} title="Notifikasi" />
          <div className="space-y-1">
            <Toggle label="Notifikasi Email" checked={form.notif_email} onChange={(v) => set("notif_email", v)} />
            <Toggle label="Notifikasi Push" checked={form.notif_push} onChange={(v) => set("notif_push", v)} />
          </div>
        </Card>

        {/* Database & Backup */}
        <Card className="p-5">
          <CardTitle icon={Database} title="Database & Backup" />
          <div className="space-y-4">
            <Toggle
              label="Backup Otomatis"
              checked={form.backup_otomatis}
              onChange={(v) => set("backup_otomatis", v)}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => toast("Backup sedang diproses...")}>
                <Download className="w-4 h-4" /> Backup Sekarang
              </Button>
              <Button variant="outline" onClick={() => toast("Silakan pilih file backup untuk restore")}>
                <Upload className="w-4 h-4" /> Restore
              </Button>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-3 text-sm text-slate-500">
              <div className="font-medium text-slate-600 dark:text-slate-300 mb-1">Info Backup</div>
              Backup terakhir:{" "}
              {form.last_backup ? formatTanggal(form.last_backup) : "Belum pernah backup"}
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="success" onClick={save} disabled={saving}>
          <Save className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan Pengaturan"}
        </Button>
      </div>
    </div>
  );
}
