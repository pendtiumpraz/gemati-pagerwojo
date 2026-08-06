"use client";
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building2,
  AtSign,
  CircleCheck,
  KeyRound,
  Activity,
} from "lucide-react";
import {
  PageHeader,
  Card,
  Badge,
  Field,
  Input,
  Button,
} from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { apiFetch } from "@/lib/useApi";
import { inisial } from "@/lib/utils";

type Profil = {
  id: number;
  nama: string;
  username: string;
  role: string;
  desa_id: number | null;
  desa_nama: string | null;
  phone: string | null;
  email: string | null;
  active: boolean;
};

const ROLE_LABEL: Record<string, string> = { admin: "Admin", ppkbd: "PPKBD", kader: "Kader (KPK)" };
const ROLE_TONE: Record<string, string> = { admin: "admin", ppkbd: "ppkbd", kader: "kader" };

export function ProfilPage() {
  const { toast } = useToast();
  const [profil, setProfil] = useState<Profil | null>(null);
  const [tab, setTab] = useState<"password" | "aktivitas">("password");
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiFetch<Profil>("/api/profil").then((r) => r.ok && r.data && setProfil(r.data));
  }, []);

  async function simpan() {
    if (baru.length < 6) return toast("Password baru minimal 6 karakter", "error");
    if (baru !== konfirmasi) return toast("Konfirmasi password tidak cocok", "error");
    setSaving(true);
    const res = await apiFetch("/api/profil", {
      method: "PUT",
      body: JSON.stringify({ password_lama: lama, password_baru: baru }),
    });
    setSaving(false);
    if (res.ok) {
      toast(res.message || "Password berhasil diperbarui");
      setLama("");
      setBaru("");
      setKonfirmasi("");
    } else {
      toast(res.message || "Gagal memperbarui password", "error");
    }
  }

  const infoRows = [
    { icon: AtSign, label: "Username", value: profil?.username },
    { icon: Mail, label: "Email", value: profil?.email || "-" },
    { icon: Phone, label: "No. HP", value: profil?.phone || "-" },
    { icon: Building2, label: "Desa", value: profil?.desa_nama || (profil?.role === "admin" ? "Kecamatan" : "-") },
    { icon: CircleCheck, label: "Status", value: profil?.active ? "Aktif" : "Nonaktif" },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Profil Pengguna" subtitle="Kelola informasi akun dan keamanan Anda" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Kartu kiri */}
        <Card className="p-6 h-fit">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary text-white text-2xl font-bold flex items-center justify-center">
              {profil ? inisial(profil.nama) : "?"}
            </div>
            <div className="mt-3 font-bold text-lg text-heading dark:text-white">{profil?.nama ?? "-"}</div>
            <div className="mt-1.5">
              {profil && <Badge tone={ROLE_TONE[profil.role] || "default"}>{ROLE_LABEL[profil.role] || profil.role}</Badge>}
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {infoRows.map((r) => (
              <div key={r.label} className="flex items-center gap-3 text-sm">
                <r.icon className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-500 w-20">{r.label}</span>
                <span className="font-medium text-heading dark:text-slate-200 truncate">{r.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Kanan */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex gap-2 mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <button
              onClick={() => setTab("password")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition inline-flex items-center gap-2 ${
                tab === "password"
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <KeyRound className="w-4 h-4" /> Ubah Password
            </button>
            <button
              onClick={() => setTab("aktivitas")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition inline-flex items-center gap-2 ${
                tab === "aktivitas"
                  ? "bg-primary text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Activity className="w-4 h-4" /> Aktivitas Terbaru
            </button>
          </div>

          {tab === "password" ? (
            <div className="max-w-md space-y-4">
              <Field label="Password Lama" required>
                <Input type="password" value={lama} onChange={(e) => setLama(e.target.value)} placeholder="••••••" />
              </Field>
              <Field label="Password Baru" required>
                <Input type="password" value={baru} onChange={(e) => setBaru(e.target.value)} placeholder="Minimal 6 karakter" />
              </Field>
              <Field label="Konfirmasi Password Baru" required>
                <Input
                  type="password"
                  value={konfirmasi}
                  onChange={(e) => setKonfirmasi(e.target.value)}
                  placeholder="Ulangi password baru"
                />
              </Field>
              <Button variant="success" onClick={simpan} disabled={saving}>
                <KeyRound className="w-4 h-4" /> {saving ? "Menyimpan..." : "Simpan Password"}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <User className="w-10 h-10 mb-2 opacity-50" />
              Belum ada aktivitas terbaru
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
