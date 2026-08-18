# Deploy GEMATI Pagerwojo di DomaiNesia (cPanel Hosting + Database Neon)

Panduan deploy di **DomaiNesia Hosting/Cloud Hosting (cPanel)** dengan **database Neon (Postgres serverless, remote)**.
Kombinasi ini paling praktis di shared hosting: tak perlu install database, dan driver Neon memakai **HTTPS (port 443)** yang tidak diblokir shared hosting.

> Butuh: paket DomaiNesia yang mendukung **Node.js** (fitur cPanel "Setup Node.js App"). Jika paketmu tidak ada menu itu, hubungi CS DomaiNesia untuk aktifkan, atau pakai VPS.

---

## Langkah 0 — Siapkan Database Neon (gratis)
1. Daftar di https://neon.tech → New Project.
2. Salin **connection string** (yang `-pooler`), contoh:
   `postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require`
3. Simpan juga versi **unpooled** (tanpa `-pooler`) untuk migrasi.

---

## Langkah 1 — Build aplikasi
Shared hosting sering kehabisan memori saat `next build`. **Disarankan build di komputer lokal** lalu upload hasilnya.

Di komputer lokal:
```bash
npm install
npm run build        # menghasilkan folder .next
```
Yang WAJIB diupload ke server: seluruh project **termasuk folder `.next`** (hasil build), **kecuali** `node_modules` (diinstall ulang di server).

> Alternatif: build langsung di server (Langkah 4) jika paket hostingmu kuat.

---

## Langkah 2 — Upload project ke cPanel
Pilih salah satu:

**A. Via Git (kalau ada menu cPanel → Git Version Control):**
- Create Repository → Clone `https://github.com/pendtiumpraz/gemati-pagerwojo.git` ke folder mis. `/home/USER/gemati`.

**B. Via File Manager (zip):**
- Kompres project lokal (tanpa `node_modules`) → upload ke `/home/USER/gemati` → Extract.

---

## Langkah 3 — cPanel → Setup Node.js App
1. Buka **cPanel → Setup Node.js App → Create Application**.
2. Isi:
   | Field | Nilai |
   |-------|-------|
   | Node.js version | **20.x** (atau lebih baru) |
   | Application mode | **Production** |
   | Application root | `gemati` (folder tadi) |
   | Application URL | domain/subdomain kamu |
   | Application startup file | **`server.js`** |
3. **Create**.

---

## Langkah 4 — Environment Variables + Install
1. Masih di halaman Node.js App, tambahkan **Environment variables**:
   ```
   DB_ENGINE=neon
   DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   DATABASE_URL_UNPOOLED=postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   SESSION_SECRET=isi_string_acak_panjang
   PII_KEY=isi_kunci_enkripsi
   NODE_ENV=production
   ```
2. Klik **Run NPM Install** (atau lewat terminal, lihat di bawah).
3. Jika belum build di lokal, build di server via **Terminal cPanel**:
   ```bash
   # masuk virtualenv Node (perintah persisnya ada di panel Node.js App, contoh:)
   source /home/USER/nodevenv/gemati/20/bin/activate && cd /home/USER/gemati
   npm install
   npm run build
   ```

---

## Langkah 5 — Migrasi & Seed database (sekali saja)
Dari **Terminal cPanel** (virtualenv aktif) ATAU dari komputer lokal (arahkan ke Neon):
```bash
npm run db:migrate:pg     # buat tabel di Neon
npm run db:seed           # isi data awal (admin/admin123, dst.)
```
> Kalau dijalankan dari lokal, cukup pastikan `.env` lokal berisi `DATABASE_URL` Neon yang sama.

---

## Langkah 6 — Start / Restart
- Kembali ke **Setup Node.js App** → klik **Restart**.
- Buka domainmu → halaman login GEMATI muncul.
- Login `admin` / `admin123` (segera ganti password lewat menu Profil/Manajemen Pengguna).

Untuk restart via terminal (Passenger):
```bash
mkdir -p tmp && touch tmp/restart.txt
```

---

## Langkah 7 — Domain & SSL
- Kalau app di domain utama: sudah otomatis.
- Kalau di subdomain/addon domain: buat dulu di cPanel → Domains, arahkan Application URL ke situ.
- **SSL**: cPanel → **SSL/TLS Status** → jalankan **AutoSSL** (Let's Encrypt gratis) untuk domainmu.

---

## Troubleshooting DomaiNesia

| Masalah | Solusi |
|---------|--------|
| Menu "Setup Node.js App" tidak ada | Paket belum support Node — minta CS DomaiNesia aktifkan, atau upgrade/VPS |
| `next build` gagal / kehabisan memori | Build di **lokal**, upload folder `.next` |
| Halaman blank / 503 | Cek **stderr log** di panel Node.js App; pastikan `startup file = server.js` & sudah `npm run build` |
| Tidak bisa konek Neon | Pastikan `DB_ENGINE=neon` & `DATABASE_URL` benar; Neon pakai HTTPS(443) jadi jarang diblok. Cek via halaman Superadmin → Deployment & DB → **Test Koneksi** |
| Perubahan kode tak muncul | **Restart** app (tombol Restart atau `touch tmp/restart.txt`) |
| Aset/CSS tidak load | Pastikan folder `.next` terupload lengkap & `NODE_ENV=production` |
| Error `Cannot find module 'next'` | `npm install` belum jalan di server (jalankan di virtualenv) |

---

## Ringkasan alur
```
Neon (buat DB) → build lokal (.next) → upload ke cPanel → Setup Node.js App (server.js, Production)
→ set ENV (DB_ENGINE=neon + DATABASE_URL + SESSION_SECRET + PII_KEY) → npm install
→ db:migrate:pg + db:seed → Restart → AutoSSL
```

Alternatif database (kalau tak mau Neon): set `DB_ENGINE=mysql` + buat MySQL di cPanel (MySQL Databases), lalu `npm run db:migrate:mysql && npm run db:seed`. Lihat `README.md` bagian 3C & 4B.
