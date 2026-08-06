"use client";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import type { Role } from "@/lib/menu";

export function AppShell({
  role,
  nama,
  desaNama,
  children,
}: {
  role: Role;
  nama: string;
  desaNama?: string | null;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8faf8] dark:bg-darkbg">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar role={role} nama={nama} desaNama={desaNama} />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50 animate-fade"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 animate-fade">
            <Sidebar
              role={role}
              nama={nama}
              desaNama={desaNama}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar role={role} nama={nama} onMenu={() => setOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
