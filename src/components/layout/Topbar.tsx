"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, ChevronRight, Moon, Sun, Bell, Menu } from "lucide-react";
import { useTheme } from "@/components/theme";
import { ROLE_BADGE, MENU, type Role } from "@/lib/menu";
import { inisial } from "@/lib/utils";

function pageTitle(pathname: string, role: Role): string {
  for (const m of MENU[role]) {
    if (pathname === m.href || pathname.startsWith(m.href + "/")) return m.label;
  }
  return "Beranda";
}

export function Topbar({
  role,
  nama,
  onMenu,
}: {
  role: Role;
  nama: string;
  onMenu?: () => void;
}) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [openNotif, setOpenNotif] = useState(false);
  const title = pageTitle(pathname, role);

  return (
    <header className="h-16 sticky top-0 z-30 bg-white/90 dark:bg-darkbg/90 backdrop-blur border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3 text-sm">
        <button className="lg:hidden text-slate-500" onClick={onMenu}>
          <Menu className="w-5 h-5" />
        </button>
        <Home className="w-4 h-4 text-slate-400" />
        <span className="text-slate-400">Beranda</span>
        {title !== "Beranda" && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-300" />
            <span className="font-medium text-heading dark:text-slate-200">
              {title}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-darkcard text-slate-500 dark:text-slate-300"
          aria-label="Toggle tema"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setOpenNotif((s) => !s)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-darkcard text-slate-500 dark:text-slate-300 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
              1
            </span>
          </button>
          {openNotif && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-darkcard shadow-lg border border-slate-100 dark:border-slate-700 p-3 animate-fade">
              <div className="font-semibold text-sm mb-2 dark:text-slate-200">
                Notifikasi
              </div>
              <div className="text-sm">
                <div className="font-medium text-heading dark:text-slate-200">
                  Rekapitulasi tersedia
                </div>
                <div className="text-slate-500 text-xs">
                  Data pendampingan tercatat · Hari ini
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-700">
          <div className="w-9 h-9 rounded-full bg-primary text-white text-sm font-semibold flex items-center justify-center">
            {inisial(nama)}
          </div>
          <div className="hidden sm:block leading-tight">
            <div className="text-sm font-medium text-heading dark:text-slate-200">
              {nama}
            </div>
            <div className="text-xs text-slate-500">{ROLE_BADGE[role]}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
