# Deployment — GEMATI Pagerwojo (Fase 06)

Repo: https://github.com/pendtiumpraz/gemati-pagerwojo (branch `main`)
Target: **Vercel** · Database: **Neon Postgres** (sudah dimigrasi + di-seed)

> Database sudah siap (9 tabel + data awal di Neon). Deploy **tidak perlu** menjalankan migrasi lagi — app langsung konek ke Neon yang sama lewat env var.

## Env var yang WAJIB di-set di Vercel
Ambil nilainya dari `.env` lokal (JANGAN dari sini — file ini tidak memuat rahasia):

| Key | Sumber | Catatan |
|-----|--------|---------|
| `DATABASE_URL` | dari `.env` | connection string Neon (pooler) |
| `DATABASE_URL_UNPOOLED` | dari `.env` | opsional (untuk migrasi manual) |
| `SESSION_SECRET` | dari `.env` | auth secret (48-byte acak) |

## Cara A — Dashboard (paling cepat, tanpa CLI)
1. Buka **https://vercel.com/new** → login (GitHub `pendtiumpraz`).
2. **Import** repo `pendtiumpraz/gemati-pagerwojo`.
3. Framework auto-terdeteksi **Next.js** (Build: `next build`, tidak perlu diubah).
4. Buka **Environment Variables** → tambah `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `SESSION_SECRET` (copy nilai dari `.env` lokal). Scope: Production (+ Preview bila mau).
5. **Deploy**. Tunggu build selesai → dapat URL `https://gemati-pagerwojo.vercel.app`.

## Cara B — Vercel CLI (saya bisa bantu jalankan setelah kamu login)
```bash
npm i -g vercel            # sekali saja
! vercel login             # login interaktif (kamu yang lakukan)
vercel link                # hubungkan folder ke project Vercel
# set env (kamu paste nilai dari .env saat diminta):
vercel env add DATABASE_URL production
vercel env add DATABASE_URL_UNPOOLED production
vercel env add SESSION_SECRET production
vercel --prod              # deploy production
```

## Pasca-deploy (checklist Fase 06)
- [ ] Buka URL production → test login `admin/admin123`
- [ ] Cek dashboard/chart/peta load (Neon terkoneksi)
- [ ] (Opsional) custom domain + SSL (Vercel otomatis SSL)
- [ ] Neon: aktifkan auto-backup / point-in-time restore
- [ ] Ganti password akun demo bila untuk produksi nyata

## Catatan keamanan
- `.env` TIDAK di-commit (rahasia hanya di Vercel env & `.env` lokal).
- Demo accounts (`admin/admin123`, dll) sebaiknya diubah/nonaktifkan untuk produksi publik.
