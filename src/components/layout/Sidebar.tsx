"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { MENU, ROLE_LABEL, type Role } from "@/lib/menu";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function Sidebar({
  role,
  nama,
  desaNama,
  onNavigate,
}: {
  role: Role;
  nama: string;
  desaNama?: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const menu = MENU[role];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast("Anda telah keluar dari sistem", "success");
    router.push("/login");
    router.refresh();
  }

  const firstName = nama.split(" ")[0].replace(",", "");

  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 bg-white dark:bg-darkbg border-r border-sidebar-border dark:border-slate-800 flex flex-col">
      <div className="p-4">
        <Logo />
      </div>

      <div className="mx-3 mb-2 rounded-lg bg-primary-light dark:bg-darkcard px-3 py-2">
        <div className="text-[10px] font-semibold text-primary/70 dark:text-slate-400 uppercase tracking-wide">
          Login sebagai
        </div>
        <div className="text-sm font-semibold text-heading dark:text-slate-200">
          {ROLE_LABEL[role]}
        </div>
        {desaNama && (
          <div className="text-xs text-slate-500">Desa {desaNama}</div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {menu.map((m) => {
          const active =
            pathname === m.href || pathname.startsWith(m.href + "/");
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-white"
                  : "text-sidebar-text dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkcard"
              )}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span className="truncate">{m.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={logout}
        className="m-3 flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-red-50 dark:hover:bg-red-950/30 transition"
      >
        <LogOut className="w-[18px] h-[18px]" />
        Keluar ({firstName})
      </button>
    </aside>
  );
}
