"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; type: ToastType; msg: string };

const ToastCtx = createContext<{
  toast: (msg: string, type?: ToastType) => void;
}>({ toast: () => {} });

export function useToast() {
  return useContext(ToastCtx);
}

let idc = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const toast = useCallback((msg: string, type: ToastType = "success") => {
    const id = ++idc;
    setItems((s) => [...s, { id, type, msg }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 3500);
  }, []);

  const remove = (id: number) => setItems((s) => s.filter((t) => t.id !== id));

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {items.map((t) => (
          <div
            key={t.id}
            className={`animate-toast flex items-start gap-2.5 rounded-lg px-4 py-3 shadow-md text-sm border ${
              t.type === "success"
                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-900 dark:text-green-200"
                : t.type === "error"
                ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-900 dark:text-red-200"
                : "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-900 dark:text-blue-200"
            }`}
          >
            {t.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" />
            ) : t.type === "error" ? (
              <XCircle className="w-5 h-5 shrink-0 text-red-600" />
            ) : (
              <Info className="w-5 h-5 shrink-0 text-blue-600" />
            )}
            <span className="flex-1">{t.msg}</span>
            <button onClick={() => remove(t.id)} className="opacity-60 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
