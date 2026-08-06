"use client";
import { X } from "lucide-react";

/**
 * Right-side drawer modal — sesuai loop Rule 5.
 * Lebar 400px (full-width mobile <768px), slide-in dari kanan 300ms ease,
 * backdrop rgba(0,0,0,0.5), close via X + klik backdrop, overflow-y auto.
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 400,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100]">
      {/* backdrop */}
      <div
        className="absolute inset-0 animate-fade"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />
      {/* panel kanan */}
      <div
        className="absolute top-0 right-0 h-full bg-white dark:bg-darkcard shadow-2xl animate-drawer flex flex-col w-full md:w-[var(--drawer-w)]"
        style={{ ["--drawer-w" as any]: `${width}px` }}
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-heading dark:text-white">{title}</h2>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 -mr-1"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Tab switcher Aktif | Sampah (loop Rule 3/4) */
export function TabsAktifSampah({
  value,
  onChange,
  countAktif,
  countSampah,
}: {
  value: "aktif" | "sampah";
  onChange: (v: "aktif" | "sampah") => void;
  countAktif?: number;
  countSampah?: number;
}) {
  const tabs = [
    { key: "aktif" as const, label: "Aktif", count: countAktif },
    { key: "sampah" as const, label: "Sampah", count: countSampah },
  ];
  return (
    <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
            value === t.key
              ? "bg-white dark:bg-darkcard text-primary shadow-sm"
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          }`}
        >
          {t.label}
          {t.count != null && (
            <span className="ml-1.5 text-xs opacity-70">({t.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}
