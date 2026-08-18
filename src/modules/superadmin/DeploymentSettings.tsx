"use client";
import { useEffect, useState } from "react";
import {
  Server,
  Cloud,
  HardDrive,
  Database,
  CheckCircle2,
  XCircle,
  Loader2,
  Save,
  Plug,
  AlertTriangle,
} from "lucide-react";
import { PageHeader, Card, Button, Field, Input } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/useApi";

type Engine = "neon" | "postgres" | "mysql";
type Deploy = "vercel" | "node";

const ENGINES: { key: Engine; label: string; desc: string }[] = [
  { key: "neon", label: "PostgreSQL — Neon", desc: "Serverless. Wajib untuk Vercel." },
  { key: "postgres", label: "PostgreSQL — biasa", desc: "Server Postgres sendiri (VPS/Docker)." },
  { key: "mysql", label: "MySQL / MariaDB", desc: "Server MySQL sendiri (VPS/Docker)." },
];

export function DeploymentSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isVercel, setIsVercel] = useState(false);
  const [canWrite, setCanWrite] = useState(false);
  const [deploy, setDeploy] = useState<Deploy>("node");
  const [engine, setEngine] = useState<Engine>("neon");
  const [current, setCurrent] = useState<{ deploy: Deploy; engine: Engine } | null>(null);

  // koneksi
  const [pgUrl, setPgUrl] = useState("");
  const [my, setMy] = useState({ host: "", port: "3306", user: "", password: "", database: "" });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; version?: string; ms?: number } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch("/api/superadmin/deployment").then((r) => {
      if (r.ok && r.data) {
        const d = r.data as any;
        setIsVercel(d.isVercel);
        setCanWrite(d.canWrite);
        setDeploy(d.deploy);
        setEngine(d.engine);
        setCurrent({ deploy: d.deploy, engine: d.engine });
      }
      setLoading(false);
    });
  }, []);

  // Constraint: Vercel wajib Neon
  function selectDeploy(d: Deploy) {
    setDeploy(d);
    if (d === "vercel") setEngine("neon");
    setTestResult(null);
  }
  function selectEngine(e: Engine) {
    if (deploy === "vercel" && e !== "neon") return; // dikunci
    setEngine(e);
    setTestResult(null);
  }

  function buildConn() {
    if (engine === "mysql") {
      return { engine, host: my.host, port: Number(my.port) || 3306, user: my.user, password: my.password, database: my.database, ssl: false };
    }
    return { engine, url: pgUrl, ssl: engine === "neon" || /sslmode=require/.test(pgUrl) };
  }

  async function doTest() {
    setTesting(true);
    setTestResult(null);
    const r = await apiFetch("/api/superadmin/db-test", { method: "POST", body: JSON.stringify(buildConn()) });
    setTestResult((r.data as any) || { ok: false, message: r.message || "Gagal" });
    setTesting(false);
  }

  async function doSave() {
    setSaving(true);
    const connection =
      engine === "mysql"
        ? { mysql: { host: my.host, port: Number(my.port) || 3306, user: my.user, password: my.password, database: my.database } }
        : { pgUrl };
    const r = await apiFetch("/api/superadmin/deployment", {
      method: "PUT",
      body: JSON.stringify({ deploy, engine, connection }),
    });
    setSaving(false);
    if (r.ok) toast(r.message || "Tersimpan", "success");
    else toast(r.message || "Gagal menyimpan", "error");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Memuat konfigurasi...
      </div>
    );
  }

  const engineLabel = ENGINES.find((e) => e.key === engine)?.label;

  return (
    <div className="space-y-5 max-w-4xl">
      <PageHeader
        title="Deployment & Database"
        subtitle="Atur target deploy & engine database tanpa ketergantungan. Superadmin."
      />

      {/* Status aktif */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Server className="w-4 h-4 text-primary" />
            <span className="text-slate-500">Aktif sekarang:</span>
            <b className="text-heading dark:text-slate-200">
              {current?.deploy === "vercel" ? "Vercel" : "Non-Vercel"} · {ENGINES.find((e) => e.key === current?.engine)?.label}
            </b>
          </div>
          {isVercel && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Terdeteksi berjalan di Vercel</span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" /> Perubahan aktif setelah <b>migrate</b> + <b>restart</b> aplikasi.
        </p>
      </Card>

      {/* Deploy mode */}
      <Card className="p-5">
        <h3 className="font-semibold text-heading dark:text-slate-200 mb-3">1. Mode Deployment</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <ModeCard active={deploy === "vercel"} onClick={() => selectDeploy("vercel")} icon={Cloud} title="Vercel" desc="Serverless. Database wajib Neon (Postgres)." />
          <ModeCard active={deploy === "node"} onClick={() => selectDeploy("node")} icon={HardDrive} title="Non-Vercel (VPS/Docker)" desc="Server Node sendiri. Bisa Postgres biasa / MySQL." />
        </div>
      </Card>

      {/* Engine */}
      <Card className="p-5">
        <h3 className="font-semibold text-heading dark:text-slate-200 mb-3">2. Engine Database</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {ENGINES.map((e) => {
            const disabled = deploy === "vercel" && e.key !== "neon";
            return (
              <button
                key={e.key}
                onClick={() => selectEngine(e.key)}
                disabled={disabled}
                className={`text-left p-3 rounded-xl border transition ${
                  engine === e.key
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-2 font-medium text-sm text-heading dark:text-slate-200">
                  <Database className="w-4 h-4 text-primary" /> {e.label}
                </div>
                <div className="text-xs text-slate-400 mt-1">{e.desc}</div>
              </button>
            );
          })}
        </div>
        {deploy === "vercel" && (
          <p className="text-xs text-amber-600 mt-2">Vercel dikunci ke Neon. Pilih Non-Vercel untuk Postgres biasa / MySQL.</p>
        )}
      </Card>

      {/* Koneksi */}
      <Card className="p-5">
        <h3 className="font-semibold text-heading dark:text-slate-200 mb-3">3. Koneksi Database</h3>
        {engine !== "mysql" ? (
          <Field label={engine === "neon" ? "Neon Connection URL" : "Postgres Connection URL"}>
            <Input
              value={pgUrl}
              onChange={(e) => setPgUrl(e.target.value)}
              placeholder="postgresql://user:pass@host:5432/db?sslmode=require"
            />
          </Field>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Host"><Input value={my.host} onChange={(e) => setMy({ ...my, host: e.target.value })} placeholder="127.0.0.1" /></Field>
            <Field label="Port"><Input value={my.port} onChange={(e) => setMy({ ...my, port: e.target.value })} placeholder="3306" /></Field>
            <Field label="User"><Input value={my.user} onChange={(e) => setMy({ ...my, user: e.target.value })} placeholder="root" /></Field>
            <Field label="Password"><Input type="password" value={my.password} onChange={(e) => setMy({ ...my, password: e.target.value })} /></Field>
            <Field label="Database" className="sm:col-span-2"><Input value={my.database} onChange={(e) => setMy({ ...my, database: e.target.value })} placeholder="gemati" /></Field>
          </div>
        )}

        <div className="flex items-center gap-3 mt-4">
          <Button variant="outline" onClick={doTest} disabled={testing}>
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plug className="w-4 h-4" />} Test Koneksi
          </Button>
          {testResult && (
            <span className={`flex items-center gap-1.5 text-sm ${testResult.ok ? "text-green-600" : "text-red-600"}`}>
              {testResult.ok ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {testResult.ok
                ? `Berhasil${testResult.ms ? ` (${testResult.ms}ms)` : ""}${testResult.version ? ` — ${String(testResult.version).slice(0, 40)}` : ""}`
                : testResult.message}
            </span>
          )}
        </div>
        {!canWrite && !isVercel && (
          <p className="text-xs text-amber-600 mt-2">Peringatan: tidak bisa menulis .env otomatis. Simpan koneksi manual ke .env.</p>
        )}
        {isVercel && (
          <p className="text-xs text-slate-400 mt-2">Di Vercel, koneksi diatur lewat Environment Variables dashboard Vercel, bukan file .env.</p>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={doSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Simpan Konfigurasi ({deploy === "vercel" ? "Vercel" : "Non-Vercel"} · {engineLabel})
        </Button>
      </div>
    </div>
  );
}

function ModeCard({ active, onClick, icon: Icon, title, desc }: { active: boolean; onClick: () => void; icon: any; title: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 rounded-xl border transition ${
        active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
      }`}
    >
      <div className="flex items-center gap-2 font-medium text-heading dark:text-slate-200">
        <Icon className="w-5 h-5 text-primary" /> {title}
      </div>
      <div className="text-xs text-slate-400 mt-1">{desc}</div>
    </button>
  );
}
