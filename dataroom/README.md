# DATAROOM — GEMATI Pagerwojo (Clone Reference)

Sumber: **https://gemati-pagerwojo.rork.app** (aplikasi Rork — Vite + React + Tailwind, data client-side/mock).
Tujuan: membangun ulang **100% identik** dengan **Next.js + database asli** (`.env`), mengikuti standar `../loop/`.

## Tentang Aplikasi
**GEMATI** = *Gerakan Makan Telur* — Sistem Informasi **Pendampingan Makan Telur Cegah Stunting** di Kecamatan Pagerwojo, Kabupaten Tulungagung, Jawa Timur. Memantau program konsumsi telur harian pada balita untuk pencegahan stunting.

Program inti: setiap balita didampingi konsumsi telur selama ~21 hari (dicatat per **Hari ke-1, 3, 5, … 21**), plus **pengukuran antropometri** (BB/TB → z-score → status gizi & risiko stunting), dengan alur **validasi berjenjang**.

## Hierarki Peran
```
Admin Kecamatan  (lihat & kelola semua desa)
      └── PPKBD (per desa)      → validasi data kader di desanya
            └── Kader / KPK (per desa) → input balita, pendampingan, pengukuran
                  └── Balita (subjek data)
```

## Isi Dataroom
| File | Isi |
|------|-----|
| `01-DESIGN-TOKENS.md` | Warna (light+dark), font, logo, icon lucide, komponen (modal, sidebar, toast, badge) |
| `02-DATA-MODEL.md` | Entity, field, relasi, enum, seed data asli |
| `03-ROLES-PERMISSIONS.md` | 3 role, menu, route, hak akses per role |
| `04-PAGES-SPEC.md` | Spesifikasi tiap halaman + CRUD + form |
| `05-SCREENSHOTS.md` | Manifest screenshot |
| `screenshots/admin` `…/ppkbd` `…/kader` | Screenshot per role |
| `screenshots/_raw_all` | Semua screenshot mentah (arsip) |

## Akun Demo (dari halaman login)
| Role | Username | Password | Nama |
|------|----------|----------|------|
| Admin Kecamatan | `admin` | `admin123` | Sutrisno, S.KM |
| PPKBD Desa | `ppkbd.mulyosari` | (demo) | Siti Aminah |
| Kader (KPK) | `kader.mulyosari01` | (demo) | Maryam Safitri |

Reset password default → `password123`. Password awal kader/ppkbd baru → `kader123`.
