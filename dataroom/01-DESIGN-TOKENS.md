# 01 — DESIGN TOKENS (100% identik)

Stack asli: **Vite + React + Tailwind CSS + lucide-react**. Font default Tailwind (`ui-sans-serif, system-ui`). Tema: **light + dark** via class `.dark` di `<html>` (disimpan di `localStorage.gemati_theme`).

> Untuk clone Next.js: pakai **Tailwind** dengan `darkMode: 'class'` + **lucide-react** agar icon & logo identik.

## 1. Palet Warna — LIGHT

| Peran | Hex | Dipakai untuk |
|------|-----|---------------|
| **Primary (Green 800)** | `#2e7d32` | Tombol utama, menu aktif, badge Aktif/Disetujui, header profil balita |
| Primary hover | `#1b5e20` (green 900) | hover tombol |
| **Accent / Egg (Amber)** | `#FBC02D` | Logo telur, chart konsumsi, stat kuning |
| Sidebar text (inactive) | `#244233` | teks menu non-aktif (hijau gelap) |
| Sidebar active bg | `#2e7d32` | latar menu aktif (teks putih) |
| Sidebar border | `#dce5dc` | garis kanan sidebar |
| Login-sebagai box bg | `#eaf3ea` (green 50-ish) | kotak "LOGIN SEBAGAI" di sidebar |
| Heading (h1) | `#15281f` | judul halaman (hijau sangat gelap) |
| Body / page bg | `#ffffff` / `#f8faf8` | latar |
| Danger / Logout | `#dc2626` | tombol Keluar, Tolak, badge Nonaktif/Ditolak |
| Warning | `#f59e0b` / `#ea9a00` | badge Menunggu Validasi, "Belum Valid" |
| Text secondary | `#64748b` | label, subjudul |

### Warna stat-card dashboard (garis bawah kartu)
Green `#2e7d32`, Blue `#2563eb`, Purple `#7c3aed`, Amber `#f59e0b`, Teal `#0d9488`, Red `#dc2626`. (Jumlah/Desa=green, Kader=blue, PPKBD=purple, Balita=amber, Pendampingan=teal/blue, Validasi=green, Risiko=red.)

### Badge status
- **Aktif / Disetujui** → bg hijau muda `#dcfce7`, teks `#166534`
- **Menunggu Validasi** → bg amber muda `#fef3c7`, teks `#92400e`
- **Nonaktif / Ditolak** → bg merah muda `#fee2e2`, teks `#991b1b`
- Role badge: Admin ungu, PPKBD biru, KPK/Kader amber

## 2. Palet Warna — DARK (class `.dark`)
| Token | Hex |
|-------|-----|
| Body bg | `#0b140f` (hijau-hitam) |
| Card / panel bg | `#0f1a14` ~ `#111c15` |
| Sidebar/topbar bg | mendekati `#000000`/`#0b140f` |
| Input bg | `#0b140f` |
| Heading text | `#e8eee8` |
| Menu aktif | `#2e7d32` (tetap) |
| Logo mark | berubah jadi hijau solid |

## 3. Logo & Brand
- Wordmark: **GEMATI** (bold) + subteks **Pagerwojo** / **Kecamatan Pagerwojo** (kecil, abu).
- Logo mark: kotak rounded (`rounded-xl`) hijau `#2e7d32`, isi ikon telur **lucide `Egg`** warna `#FBC02D`.
  ```jsx
  <div className="w-10 h-10 rounded-xl bg-[#2e7d32] flex items-center justify-center">
    <Egg className="w-6 h-6 text-[#FBC02D]" />
  </div>
  ```
- Login page kiri: badge instansi **KAB Tulungagung**, **BKKBN Kemendukbangga**, **KEC Pagerwojo**.

## 4. Ikon (lucide-react) — pemetaan menu
| Menu / elemen | Ikon lucide |
|---------------|-------------|
| Logo | `Egg` |
| Dashboard | `LayoutDashboard` |
| Rekapitulasi | `ClipboardList` |
| Data Desa | `Building2` |
| Data Balita | `Baby` |
| Data Kader / Pengguna | `Users` / `User` |
| Data PPKBD | `ShieldCheck` |
| Audit Log | `ScrollText` |
| Laporan | `FileText` |
| Pengaturan | `Settings` |
| Validasi | `CircleCheck` (check) |
| Pendampingan | `Egg`/circle |
| Pengukuran | `Ruler`/tag (`Tag`) |
| Statistik | `BarChart3` |
| Riwayat | `History` |
| Profil | `User` |
| Keluar | `LogOut` (merah) |
| Dark toggle | `Moon`/`Sun` |
| Notifikasi | `Bell` (badge angka merah) |
| Cari | `Search` |
| Lokasi | `MapPin` |, No. HP `Phone`, Tanggal `Calendar`

## 5. Komponen
### Sidebar
- Lebar ~240px, latar putih (light) / gelap (dark), border kanan `#dce5dc`.
- Atas: logo. Di bawahnya kotak **"LOGIN SEBAGAI"** (bg hijau muda) menampilkan peran + desa.
- Item menu: `flex gap-3 px-4 py-2.5 rounded-lg`, teks `#244233`; **aktif** = bg `#2e7d32` teks putih.
- Bawah: **Keluar (Nama)** warna merah `#dc2626`.

### Modal (CRUD) — **CENTER modal** (bukan right-drawer!)
Aplikasi asli memakai modal **di tengah** dengan backdrop gelap:
- Card putih `rounded-xl`, lebar ~640px (`max-w-2xl`), padding 24px.
- Header: judul (mis. "Tambah Kader") + tombol X kanan atas.
- Field 2 kolom grid.
- Footer kanan: **Batal** (outline) + **Simpan** (hijau `#2e7d32`).
- Dipakai untuk: Tambah/Edit Kader, PPKBD, Pengguna.

> Form **Balita / Pendampingan / Pengukuran** (role Kader) = **halaman penuh** (bukan modal), dengan section card ("DATA IDENTITAS BALITA", "DATA ORANG TUA", "DOKUMENTASI & LOKASI", dst) + tombol **Kembali** dan footer **Batal / Simpan**.

### Toast (notifikasi aksi)
Muncul kanan-atas, menumpuk. Sukses = bg hijau muda `#dcfce7`, ikon `CheckCircle` hijau, teks hijau gelap. Contoh: "Login berhasil! Selamat datang.", "Password direset ke: password123", "Akun diaktifkan".

### Tabel
Header abu (`text-slate-500` uppercase kecil), baris `hover:bg-slate-50`, sortable (ikon panah), pagination bawah. Cell nama sering 2 baris (Nama + subteks NIK/username).

### Chart (dashboard)
Donut (persentase), Bar (per desa / mingguan), Line/Area (bulanan), Leaflet map (Peta Sebaran). Warna chart ikut palet (hijau/amber/merah/biru). Library kemungkinan Recharts + Leaflet.

### Breadcrumb
`Beranda › <Halaman>` di topbar, ikon rumah `Home`.

### Topbar kanan
Toggle tema (`Moon`) · Lonceng notifikasi (badge merah "12") · Avatar bulat inisial + Nama + Role.
