import Link from "next/link";
import { Egg, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8faf8] dark:bg-darkbg p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6">
        <Egg className="w-9 h-9 text-egg" />
      </div>
      <div className="text-6xl font-bold text-primary">404</div>
      <h1 className="text-xl font-bold text-heading dark:text-white mt-2">
        Halaman Tidak Ditemukan
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-dark text-white font-medium transition"
      >
        <Home className="w-4 h-4" /> Kembali ke Dashboard
      </Link>
    </div>
  );
}
