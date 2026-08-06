# 04 — PAGES SPEC (layout & CRUD per halaman)

Semua halaman: layout **Sidebar kiri + Topbar (breadcrumb, tema, notif, profil) + konten**. Judul halaman (h1) + subjudul, sering diikuti baris **stat cards** lalu search/filter lalu tabel/konten.

## LOGIN (`/login`)
Split screen: kiri hijau (branding + tagline "Sistem Informasi Pendampingan Makan Telur Cegah Stunting" + badge instansi), kanan form (Username, Password + toggle mata, Remember Me, Lupa Password?, tombol Login hijau) + **Akun Demo** (3 baris klik → auto-isi): Admin Kecamatan/`admin`, PPKBD Desa/`ppkbd.mulyosari`, Kader (KPK)/`kader.mulyosari01`.

---
## ADMIN

### Dashboard (`/dashboard`)
Stat cards (7): Desa 10, Kader 4, PPKBD 3, Balita 10, Pendampingan 90, Validasi 78, Risiko 6. 3 donut (Pendampingan Tervalidasi 87%, Balita Aktif 100%, Konsumsi Telur 83%). Bar "Pendampingan per Desa", "Balita per Desa". Line "Pertumbuhan Balita". Donut "Status Gizi", "Balita Risiko Stunting". Bar "Persentase Konsumsi Telur" (bulanan). **Peta Sebaran Pendampingan** (Leaflet). Tombol "Rekapitulasi" kanan atas.

### Rekapitulasi (`/rekapitulasi`)
Filter: Desa / Bulan / Tahun / Status Validasi. Export **PDF/Excel/CSV**. Stat cards + **Tabel Rekapitulasi per Desa**: Desa, Balita, Pendampingan, Valid, Belum Valid, Persentase, Risiko Stunting, Normal, Rata-rata BB, Rata-rata TB, Dokumentasi. Search desa. (read-only)

### Data Desa (`/desa`)
Stat cards + search + tabel (read-only): Desa, Balita, Pendampingan, Valid, Persentase, Risiko Stunting, Rata-rata BB, Rata-rata TB. 10 baris.

### Data Balita (`/balita`)
Search (nama/NIK/ibu). Tabel: Nama Balita(+NIK), JK (badge), Umur, Desa, Posyandu, Nama Ibu, Status, Validasi (badge), Aksi (👁 lihat). Klik → **halaman detail** `/balita/:id`.

### Balita Detail (`/balita/:id`)
Header hijau: nama + badge (JK, Aktif, Disetujui) + 3 metrik (Pendampingan, Konsumsi %, Pengukuran). Grid info: Tanggal Lahir, Tempat Lahir, Desa, Posyandu, Nama Ayah, Nama Ibu, No HP, Kader Pendamping, Alamat. **Tabs**: Pendampingan (list Hari/butir/kader/keterangan/validasi), Pengukuran (BB/TB/tanggal), Grafik Pertumbuhan.

### Data Kader (`/kader`)
Stat: Total, Aktif, Nonaktif, Desa Terlayani. Search. Tabel: Nama(+@username), Desa, No HP, Email, Balita Dampingan, Pendampingan, Status, Aksi (**Edit / Nonaktifkan / Reset Password**). Tombol **Tambah Kader**.
- **Modal Tambah/Edit** (center): Nama Lengkap*, Username*, Desa*(select), No HP, Email, Password Awal (default `kader123`, hanya di tambah). Batal/Simpan.
- Nonaktifkan = toggle instan (badge → Nonaktif merah, tombol → Aktifkan). Reset Password = toast "Password direset ke: password123".

### Data PPKBD (`/ppkbd`)
Sama seperti Kader, kolom "Jumlah Kader" ganti "Balita Dampingan". Tombol **Tambah PPKBD**. Modal sama.

### Manajemen Pengguna (`/users`)
Stat: Total 8, Admin 1, PPKBD 3, Kader 4. Search. Tabel: Nama(+@username), Role (badge warna), Desa, No HP, Email, Status, Aksi (Edit / Nonaktifkan / Reset). Tombol **+ Tambah**.
- **Modal Tambah/Edit**: Nama Lengkap*, Username*, **Role/Hak Akses*** (Admin/PPKBD/Kader KPK), Desa*(select), No HP, Email, Password Awal.

### Audit Log (`/audit`)
Stat: Total Log, Login, Tambah Data, Validasi. Filter Aksi / Role. Search. Export PDF/Excel/CSV. Tabel: Waktu, User(+role badge), Aksi(+ikon), Modul(badge), Detail, IP Address, Browser.

### Laporan (`/laporan`)
Filter: Jenis Laporan (Per Desa…) / Desa / Tahun. Export PDF/Excel/CSV. Tabs: **Data Balita / Pendampingan / Pengukuran** → tabel sesuai.

### Pengaturan (`/pengaturan`)
4 card: **Umum** (Nama Aplikasi, Kecamatan, Kabupaten, Provinsi), **Keamanan** (Session Timeout, Batas Percobaan Login, Mode Maintenance toggle), **Notifikasi** (Email, Push toggle), **Database & Backup** (Backup Otomatis toggle, Backup Sekarang, Restore, Info Backup). Tombol **Simpan Pengaturan**.

---
## PPKBD

### Dashboard Desa (`/dashboard`)
Stat (scope desa): Jumlah Balita 5, Kader 2, Pendampingan 45, Sudah Valid 39, Belum Valid 6, Risiko 3. Charts: Pendampingan Mingguan (bar), Bulanan (line), Status Gizi (donut), Status Validasi (donut), **Ranking Kader**. List **Data Menunggu Validasi** (klik → validasi).

### Validasi (`/validasi`)
Tabs: **Menunggu (n) / Disetujui (n) / Ditolak (n)** + Total. Kartu per item: nama balita + **badge tipe** (Pendampingan/Pengukuran/Balita) + detail (mis. "Makan 1 butir · Kader · tanggal" atau "BB/TB/Z") + tombol **Setujui (hijau) / Tolak (merah) / Kembalikan (abu)**.

### Data Pendampingan (`/pendampingan-data`)
Tabel read-only desa: Tanggal, Balita, Hari, Makan Telur (Ya n butir/Tidak), Jam, Pendamping, Keterangan, Validasi.

### Statistik Desa (`/statistik`)
Seperti dashboard desa + export PDF/Excel/CSV.

### Profil (`/profil`)
Kartu profil (avatar inisial, nama, role, Username, Email, HP, Desa, Status). Tabs **Ubah Password** (Password Lama, Baru min 6, Konfirmasi, Simpan) / **Aktivitas Terbaru**.

---
## KADER (KPK)

### Dashboard (`/dashboard`)
"Selamat Datang, {Nama}!". Stat: Balita Dampingan 3, Pendampingan (kalender) 2, Pendampingan 6, Menunggu 4, Disetujui 26, Ditolak 0. **Quick actions** (kartu +): Tambah Balita, Pendampingan Baru, Pengukuran, Riwayat. Charts (Mingguan/Bulanan/Status Validasi). **Aktivitas Terbaru**.

### Data Balita (`/balita`)
List balita dampingannya + tombol **Tambah Balita** → **halaman** `/balita` form:
- **Data Identitas**: NIK*(16), Nama*, JK (radio), Tempat Lahir, Tanggal Lahir*, Umur (otomatis).
- **Data Orang Tua**: Nama Ayah, Nama Ibu*, Nomor HP.
- **Alamat**: Alamat, RT, RW, Dusun, Desa*(select), Posyandu(select), Status Balita.
- **Foto Balita**: upload (opsional). Batal / **Simpan Data**.

### Pendampingan (`/pendampingan`)
Tabel + tombol **Pendampingan Baru** → **halaman** form:
- Pilih Balita*(select dampingan), Tanggal*, Jam Pendampingan.
- "Apakah balita makan telur hari ini?" Ya/Tidak. Jumlah Telur: 1 Butir/2 Butir/Lainnya.
- Nama Pendamping (prefill), Keterangan.
- **Dokumentasi & Lokasi**: Upload foto, **Deteksi Lokasi GPS**. Batal / **Simpan Pendampingan**.

### Pengukuran (`/pengukuran`)
Tabel + tombol baru → **halaman** form: Pilih Balita*, Tanggal Pengukuran*, Berat Badan (kg)*, Tinggi Badan (cm)*, Lingkar Kepala (cm), Lingkar Lengan Atas (cm), tombol **Hitung Status Gizi & Risiko Stunting**. Batal / **Simpan Pengukuran**.

### Riwayat (`/riwayat`)
Tabs: **Pendampingan (n) / Pengukuran (n) / Validasi (n)** — list histori + badge status.

### Profil (`/profil`)
Sama dengan PPKBD.
