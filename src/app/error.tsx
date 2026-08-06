"use client";
import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8faf8] dark:bg-darkbg p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 flex items-center justify-center mb-6">
        <AlertTriangle className="w-9 h-9 text-red-500" />
      </div>
      <h1 className="text-xl font-bold text-heading dark:text-white">
        Terjadi Kesalahan
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
        Maaf, terjadi kesalahan pada sistem. Silakan coba lagi.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition"
      >
        <RotateCcw className="w-4 h-4" /> Coba Lagi
      </button>
    </div>
  );
}
