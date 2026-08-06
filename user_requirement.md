# User Requirement — GEMATI Pagerwojo

> File-as-interface: tempat user menyampaikan kebutuhan, feedback, dan approval.

## Requirement Project

| Item | Isi |
|------|-----|
| **Nama Project** | GEMATI Pagerwojo |
| **Deskripsi Singkat** | Clone 100% dari `gemati-pagerwojo.rork.app` — Sistem Informasi Pendampingan Makan Telur Cegah Stunting |
| **Target Pengguna** | Admin Kecamatan, PPKBD (per desa), Kader/KPK (per desa) di Kec. Pagerwojo, Tulungagung |
| **Deadline** | 2026-08-05 |

## Fitur Utama

1. **Autentikasi & 3 Role** — Priority HIGH. Login username/password, session, role-based access (admin/ppkbd/kader).
2. **Manajemen Pengguna/Kader/PPKBD** — Priority HIGH. CRUD user, aktif/nonaktif, reset password.
3. **Data Balita** — Priority HIGH. CRUD balita + detail (pendampingan, pengukuran, grafik).
4. **Pendampingan Makan Telur** — Priority HIGH. Input harian konsumsi telur (Hari ke-N).
5. **Pengukuran Antropometri** — Priority HIGH. Input BB/TB → z-score → status gizi & risiko stunting.
6. **Validasi Berjenjang** — Priority HIGH. PPKBD setujui/tolak/kembalikan data kader.
7. **Dashboard, Rekapitulasi, Statistik, Laporan, Audit Log, Pengaturan** — Priority MEDIUM. Chart + peta + export.

**Instruksi kunci user:** "aku mau color dan semuanya logo, icon plek ketiplek 100%" — kesesuaian visual dengan app asli diprioritaskan. "dan harus dipastikan seluruh CRUD berhasil."

## Arsitektur (keputusan user)

| Aspek | Keputusan |
|-------|-----------|
| Backend | Next.js 15 API Routes (App Router) |
| Frontend | Next.js 15 + React + TypeScript |
| CSS | Tailwind CSS + lucide-react |
| Database | **Neon PostgreSQL** (serverless) |
| ORM | Drizzle ORM (dipilih untuk kepatuhan no-FK) |
| Deployment | Vercel-ready (belum dieksekusi) |
| Domain & SSL | Belum ditentukan |
| Integrasi AI | Tidak ada |

### Database Access
| Item | Nilai |
|------|-------|
| Engine | PostgreSQL (Neon) |
| Host | `ep-floral-lake-avuli7r1-pooler...neon.tech` |
| Database | `neondb` |
| Username | `neondb_owner` |
| Password | *(disimpan di `.env`, tidak ditulis di sini — sesuai Security DB loop)* |

## Feedback Wireframe & Mockup
- Wireframe/mockup diganti dengan **52 screenshot app asli** (`dataroom/screenshots/`) sebagai referensi pixel-identik.
- **Status Approve: APPROVED** (instruksi user "buat aplikasi sama persis").

## Approval Form

| Gate | Status | Tanggal | Catatan |
|------|--------|---------|---------|
| Wireframe/Referensi | APPROVED | 2026-08-05 | via screenshot dataroom |
| Mockup/Design tokens | APPROVED | 2026-08-05 | palette & ikon diekstrak dari app asli |
| Audit | PENDING | - | `audit-report.md` menunggu review user |
| Deployment | PENDING | - | menunggu approval user |

## Riwayat Percakapan (ringkas)
- `[2026-08-05] User → AI`: pull repo loop; clone gemati-pagerwojo.rork.app (3 role, semua CRUD); DB di `.env`; screenshot semua ke dataroom; color/logo/icon 100% identik.
- `[2026-08-05] AI → User`: inspeksi 3 role, dataroom lengkap, build Next.js M1–M6, verifikasi CRUD ke Neon.
- `[2026-08-05] User → AI`: "pastikan sesuai dengan standar di loop" → audit kepatuhan + file workflow ini dibuat.
