"use client";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "lg",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  if (!open) return null;
  const width = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 animate-fade" onClick={onClose} />
      <div
        className={cn(
          "relative bg-white dark:bg-darkcard rounded-xl shadow-xl w-full animate-scale max-h-[90vh] overflow-y-auto",
          width
        )}
      >
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-lg font-bold text-heading dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 p-6 pt-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
