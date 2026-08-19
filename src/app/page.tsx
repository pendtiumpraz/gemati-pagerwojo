import Link from "next/link";
import {
  Egg,
  Ruler,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  HeartPulse,
  Users,
  Baby,
  MapPin,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Egg className="w-6 h-6 text-egg" />
            </div>
            <div className="leading-tight">
              <div className="font-bold text-heading">GEMATI</div>
              <div className="text-xs text-slate-500">Kecamatan Pagerwojo</div>
            </div>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-medium transition"
          >
            Masuk ke Sistem <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1b5e20] via-[#2e7d32] to-[#388e3c] text-white">
        <div className="max-w-6xl mx-auto px-5 py-20 lg:py-28">
          <span className="inline-flex items-center gap-2 text-xs bg-white/15 px-3 py-1 rounded-full">
            <MapPin className="w-3.5 h-3.5 text-egg" /> Kabupaten Tulungagung · Jawa Timur
          </span>
          <h1 className="mt-5 text-4xl lg:text-6xl font-bold leading-tight max-w-3xl">
            Pendampingan Makan Telur, <span className="text-egg">Cegah Stunting</span>
          </h1>
          <p className="mt-5 text-white/85 text-lg max-w-2xl leading-relaxed">
            GEMATI adalah sistem informasi pemantauan program pendampingan konsumsi telur
            untuk percepatan pencegahan stunting pada balita di Kecamatan Pagerwojo.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-egg text-heading font-semibold hover:brightness-95 transition"
            >
              Masuk ke Sistem <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#fitur"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 font-medium transition"
            >
              Pelajari Program
            </a>
          </div>

          {/* Instansi */}
          <div className="mt-12 flex flex-wrap gap-5">
            {[
              ["KAB", "Tulungagung"],
              ["BKKBN", "Kemendukbangga"],
              ["KEC", "Pagerwojo"],
            ].map(([a, b]) => (
              <div key={a} className="flex items-center gap-2.5">
                <div className="w-12 h-12 rounded-lg bg-white/15 flex items-center justify-center font-bold text-xs">
                  {a}
                </div>
                <span className="text-sm text-white/80">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistik program */}
      <section className="max-w-6xl mx-auto px-5 -mt-10 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Baby, label: "Balita Didampingi", val: "Terpantau" },
            { icon: Egg, label: "Konsumsi Telur", val: "Harian" },
            { icon: HeartPulse, label: "Status Gizi", val: "Terukur" },
            { icon: CheckCircle2, label: "Data Tervalidasi", val: "Berjenjang" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center"
              >
                <div className="w-11 h-11 rounded-lg bg-primary-light mx-auto flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="mt-2 font-bold text-heading">{s.val}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Fitur */}
      <section id="fitur" className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-heading">Apa yang Bisa Dilakukan</h2>
          <p className="mt-3 text-slate-500">
            Satu sistem terpadu untuk mencatat, memantau, dan memvalidasi program pendampingan
            gizi balita — dari kader di lapangan sampai rekap tingkat kecamatan.
          </p>
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: Egg,
              title: "Pendampingan Harian",
              desc: "Catat konsumsi telur balita setiap hari beserta dokumentasi & lokasi.",
            },
            {
              icon: Ruler,
              title: "Pengukuran & Gizi",
              desc: "Input berat & tinggi badan, hitung z-score dan risiko stunting otomatis.",
            },
            {
              icon: ShieldCheck,
              title: "Validasi Berjenjang",
              desc: "Data kader divalidasi PPKBD desa: setujui, tolak, atau kembalikan.",
            },
            {
              icon: BarChart3,
              title: "Dashboard & Laporan",
              desc: "Rekap, statistik, peta sebaran, dan ekspor laporan tingkat kecamatan.",
            },
          ].map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold text-heading">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Peran */}
      <section className="bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-heading">Untuk Siapa Sistem Ini?</h2>
            <p className="mt-3 text-slate-500">Tiga peran yang bekerja sama menjaga gizi balita.</p>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {[
              {
                icon: BarChart3,
                title: "Admin Kecamatan",
                desc: "Memantau seluruh desa, mengelola pengguna, dan menyusun rekap & laporan.",
              },
              {
                icon: ShieldCheck,
                title: "PPKBD Desa",
                desc: "Memvalidasi data kader dan memantau statistik gizi di desanya.",
              },
              {
                icon: Users,
                title: "Kader (KPK)",
                desc: "Mendata balita, mencatat pendampingan telur, dan input pengukuran.",
              },
            ].map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="mt-4 font-semibold text-heading">{r.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="rounded-2xl bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] text-white p-10 lg:p-14 text-center">
          <h2 className="text-3xl font-bold">Siap memantau program pendampingan?</h2>
          <p className="mt-3 text-white/80 max-w-xl mx-auto">
            Masuk menggunakan akun yang terdaftar untuk mulai mencatat dan memvalidasi data.
          </p>
          <Link
            href="/login"
            className="mt-7 inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-egg text-heading font-semibold hover:brightness-95 transition"
          >
            Masuk ke Sistem <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Egg className="w-4 h-4 text-egg" />
            </div>
            <span className="font-semibold text-heading">GEMATI Pagerwojo</span>
          </div>
          <span>© 2025 Pemerintah Kabupaten Tulungagung · Kecamatan Pagerwojo</span>
        </div>
      </footer>
    </div>
  );
}
