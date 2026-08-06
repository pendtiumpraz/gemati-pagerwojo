# 03 — ROLES & PERMISSIONS

3 role, **menu & route berbeda**, scoping data berbeda. Sidebar & halaman dirender sesuai `role` + `desa_id` user.

## Ringkasan Scope
| Role | Scope data | Fungsi utama |
|------|-----------|--------------|
| **admin** | Semua desa (kecamatan) | Master data, kelola pengguna, rekap, audit, laporan, pengaturan |
| **ppkbd** | Hanya desanya (`desa_id`) | **Validasi** data kader, pantau statistik desa |
| **kader** | Hanya balita dampingannya di desanya | **Input** balita, pendampingan, pengukuran |

Label sidebar "LOGIN SEBAGAI": admin→"Admin Kecamatan", ppkbd→"Petugas KB Desa" + nama desa, kader→"Kader Pendamping Keluarga" + nama desa.

---

## Menu per Role (route → ikon)

### Admin (`/dashboard`)
| Menu | Route | Ikon |
|------|-------|------|
| Dashboard | `/dashboard` | LayoutDashboard |
| Rekapitulasi | `/rekapitulasi` | ClipboardList |
| Data Desa | `/desa` | Building2 |
| Data Balita | `/balita` | Baby |
| Data Kader | `/kader` | Users |
| Data PPKBD | `/ppkbd` | ShieldCheck |
| Manajemen Pengguna | `/users` | User |
| Audit Log | `/audit` | ScrollText |
| Laporan | `/laporan` | FileText |
| Pengaturan | `/pengaturan` | Settings |
| Keluar | (logout) | LogOut |

### PPKBD (`/dashboard`)
| Menu | Route |
|------|-------|
| Dashboard (Dashboard Desa) | `/dashboard` |
| Validasi | `/validasi` |
| Data Balita | `/balita` |
| Data Pendampingan | `/pendampingan-data` |
| Statistik Desa | `/statistik` |
| Laporan | `/laporan` |
| Profil | `/profil` |

### Kader / KPK (`/dashboard`)
| Menu | Route |
|------|-------|
| Dashboard | `/dashboard` |
| Data Balita | `/balita` |
| Pendampingan | `/pendampingan` |
| Pengukuran | `/pengukuran` |
| Riwayat | `/riwayat` |
| Profil | `/profil` |

> Catatan: route `/balita`, `/dashboard`, `/laporan` dipakai lintas role tetapi **konten/permission berbeda** (admin lihat semua & kelola user; ppkbd hanya desanya + aksi validasi; kader hanya balita dampingannya + tombol tambah/edit).

---

## Matriks Aksi (CRUD) per Entity × Role
| Entity | admin | ppkbd | kader |
|--------|-------|-------|-------|
| users (kader/ppkbd) | CRUD + reset pw + aktif/nonaktif | – | – |
| desa | read | read (desanya) | read (desanya) |
| balita | read semua | read desanya | **create/edit** dampingannya |
| pendampingan | read semua | read desanya + **validasi** | **create/edit** |
| pengukuran | read semua | read desanya + **validasi** | **create/edit** |
| validasi (setujui/tolak/kembalikan) | (lihat) | **ya** | – |
| audit_logs | read | – | – |
| rekapitulasi/laporan | ya (kecamatan) | ya (desa) | – |
| pengaturan | **ya** | – | – |
| profil / ubah password | ya | ya | ya |

## Alur Validasi Berjenjang
1. **Kader** input pendampingan/pengukuran/balita → status `menunggu`.
2. **PPKBD** buka `/validasi` → **Setujui** (`disetujui`) / **Tolak** (`ditolak`) / **Kembalikan** (balik ke kader untuk revisi).
3. Data `disetujui` masuk rekap & statistik "valid".
Tab validasi: Menunggu / Disetujui / Ditolak. Tipe data yang divalidasi: Balita, Pendampingan, Pengukuran (ada badge tipe).

## Auth
- Login via username + password. Session di `sessionStorage.gemati_user` (clone: pakai JWT/session cookie httpOnly).
- Reset password (oleh admin) → set ke `password123`.
- Password awal user baru → `kader123`.
- Session timeout & batas percobaan login dari `app_settings`.
