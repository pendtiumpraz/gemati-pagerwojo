# Architecture Decisions — GEMATI Pagerwojo

Modular Monolith. Semua keputusan mengikuti `loop/` (Sainskerta standards).

## Stack
| Layer | Pilihan | Alasan |
|-------|---------|--------|
| Framework | Next.js 15 (App Router) | full-stack, backend+frontend satu codebase (modular monolith) |
| Bahasa | TypeScript | type-safety |
| Styling | Tailwind CSS (`darkMode: class`) | cepat, konsisten, dark mode |
| Ikon | lucide-react | identik dengan app asli (yang juga pakai lucide) |
| ORM | Drizzle ORM | SQL-first, mudah **tanpa FK constraint** (relasi di service layer) |
| Database | Neon PostgreSQL | disediakan user via `.env` |
| Auth | bcryptjs + JWT (jose) di cookie httpOnly | tanpa dependency berat |
| Chart | Recharts | donut/bar/line dashboard |
| Peta | react-leaflet + Leaflet + OSM | Peta Sebaran |

## Struktur Modular Monolith
```
src/
├── app/
│   ├── (app)/            # halaman terproteksi (layout sidebar+topbar)
│   │   ├── dashboard, balita, kader, ppkbd, users, desa,
│   │   ├── pendampingan, pengukuran, validasi, riwayat,
│   │   ├── rekapitulasi, laporan, audit, statistik, pengaturan, profil
│   ├── login/            # publik
│   └── api/              # REST endpoints (Controller layer)
├── modules/              # MODULE per domain (Service + business logic)
│   ├── auth, users, desa, balita, pendampingan, pengukuran,
│   ├── validasi, dashboard, statistik, rekap, audit, settings, profil, riwayat
├── components/           # UI kit bersama (Sidebar, Topbar, ui/*)
├── db/                   # schema.ts (Drizzle), seed.ts, index.ts
├── lib/                  # api, query, session, menu, gizi, utils, useApi
└── middleware.ts         # role guard (edge)
```

## Kepatuhan Aturan Loop (mapping)
| Rule | Implementasi |
|------|--------------|
| 1 Modular Monolith | `src/modules/*` per domain, controller (API route) → service |
| 2 No Foreign Keys | Drizzle schema tanpa `.references()`; migrasi 0 FK (terverifikasi) |
| 3 Soft Delete & Restore | kolom `deleted_at` + index; endpoint `/trashed` & `/{id}/restore` |
| 7 No Hardcoded Data | frontend fetch dari API; seeder DB (`src/db/seed.ts`) |
| 8 DB dari User | Neon via `.env` |
| 9 Backend dulu | schema+API dulu, lalu frontend integrasi API asli |
| 12 Migration | Drizzle Kit (`drizzle/`), version controlled |
| 14 snake_case | semua tabel/kolom snake_case |
| 6 Sidebar 1-color icon | lucide inline per menu |

## Deviasi (didokumentasikan)
- **Rule 5 (right-drawer 400px)**: app asli pakai **modal center** → dipakai center demi identik. Deviasi tercatat.
- **Rule 4 (CRUD one page)**: app asli pakai **form halaman-penuh** untuk balita/pendampingan/pengukuran → diikuti demi identik. Users/Kader/PPKBD tetap 1-halaman + modal.
- Keputusan menunggu konfirmasi user (lihat `audit-report.md`).

## Konvensi API
- List: `GET /api/{res}?page&pageSize&search&trashed` → `{data:{data:[],total,page,pageSize}}`
- Detail/Create/Update/Delete: `GET|POST|PUT|DELETE /api/{res}[/{id}]`
- Restore: `PATCH /api/{res}/{id}/restore` · Trashed: `GET /api/{res}/trashed`
- Response helper: `@/lib/api` (`ok/created/bad/handle/requireAuth`)
- Scoping role: `requireAuth(roles?)` → session `{role, desa_id}`; ppkbd/kader difilter otomatis.
