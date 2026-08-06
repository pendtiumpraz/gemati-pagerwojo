# 02 — DATA MODEL

Mengikuti standar loop: **snake_case, no FK constraint (relasi di service layer), soft delete `deleted_at`, timestamps**. Relasi divalidasi di aplikasi.

## Ringkasan Entity
1. `users` — semua akun (admin, ppkbd, kader)
2. `desa` — 10 desa master
3. `posyandu` — posyandu per desa (mis. Melati I, Kenanga I, Mawar I)
4. `balita` — data balita
5. `pendampingan` — catatan konsumsi telur harian (Hari ke-N)
6. `pengukuran` — antropometri (BB/TB → z-score → status gizi)
7. `audit_logs` — log aktivitas
8. `app_settings` — pengaturan aplikasi (single row)
9. `notifications` — notifikasi (opsional)

---

## 1. users
| Kolom | Tipe | Catatan |
|-------|------|---------|
| id | string/bigint | mis. `u-admin`, atau bigint |
| username | string unik | `admin`, `ppkbd.mulyosari`, `kader.mulyosari01` |
| password | string (hash bcrypt) | demo: `admin123` |
| nama | string | "Sutrisno, S.KM" |
| role | enum | `admin` \| `ppkbd` \| `kader` |
| desa_id | string null | null untuk admin; `d01`.. untuk ppkbd/kader |
| phone | string | `081234567890` |
| email | string | `admin@pagerwojo.go.id` |
| active | bool | true/false (Nonaktifkan) |
| last_login | timestamp | |
| created_at, updated_at, deleted_at | timestamp | |

**Role di UI**: admin→"Admin", ppkbd→"PPKBD", kader→"KPK".

### Seed users (8)
| username | role | desa | nama | phone |
|----------|------|------|------|-------|
| admin | admin | – (Kecamatan) | Sutrisno, S.KM | 081234567890 |
| ppkbd.mulyosari | ppkbd | Mulyosari (d01) | Siti Aminah | 081234567891 |
| ppkbd.kedungcangkring | ppkbd | Kedungcangkring | Joko Prasetyo | 081234567892 |
| ppkbd.pagerwojo | ppkbd | Pagerwojo | Endang Wahyuni | 081234567893 |
| kader.mulyosari01 | kader | Mulyosari (d01) | Maryam Safitri | 081234567894 |
| kader.mulyosari02 | kader | Mulyosari | Ahmad Fauzi | 081234567895 |
| kader.kedungcangkring01 | kader | Kedungcangkring | Nur Hidayah | 081234567896 |
| kader.pagerwojo01 | kader | Pagerwojo | Wahyu Setiawan | 081234567897 |

Email pola: `{username}@pagerwojo.go.id`.

---

## 2. desa (master, read-only di UI)
| Kolom | Tipe |
|-------|------|
| id | string `d01`..`d10` |
| nama | string ("Mulyosari" / label "Desa Mulyosari") |
| kecamatan | string ("Pagerwojo") |
| + agregat (dihitung, bukan kolom): jumlah balita, pendampingan, valid, %, risiko stunting, rata-rata BB, rata-rata TB |

### Seed 10 desa (semua Kec. Pagerwojo)
`Mulyosari (d01)`, `Kedungcangkring`, `Samar`, `Segawe`, `Pagerwojo`, `Penjor`, `Gambiran`, `Gondanggunung`, `Kradinan`, `Sidomulyo`.

Statistik saat ini: Mulyosari 5 balita / 45 pendampingan / 39 valid / 3 risiko; Kedungcangkring 2/15/13/1; Pagerwojo 3/30/26/2; sisanya 0.

---

## 3. posyandu
| Kolom | Tipe |
|-------|------|
| id | string |
| nama | "Melati I", "Melati II", "Kenanga I", "Mawar I", … |
| desa_id | ref desa |

---

## 4. balita
| Kolom | Tipe | Catatan |
|-------|------|---------|
| id | string | `b-d01-1` (b-{desa}-{n}) |
| nik | string(16) | "3501010101220001" |
| nama | string | "Ahmad Rizki Pratama" |
| jenis_kelamin | enum | `L` / `P` (UI: Laki-laki/Perempuan) |
| tempat_lahir | string | "Tulungagung" |
| tanggal_lahir | date | "2023-06-15" → umur dihitung otomatis ("3 th 1 bln") |
| nama_ayah | string | "Suparman" |
| nama_ibu | string* | "Siti Khadijah" (wajib) |
| no_hp | string | "081234500001" |
| alamat | string | "Dusun Sido Mukti, RT 02/RW 02" |
| rt, rw | string | "02","02" |
| dusun | string | "Sido Mukti" |
| desa_id | ref | d01 |
| posyandu_id | ref | Melati I |
| kader_id | ref users | "Maryam Safitri" (kader pendamping) |
| foto | string null | upload opsional |
| status | enum | `aktif` \| `nonaktif` |
| validasi_status | enum | `menunggu` \| `disetujui` \| `ditolak` |
| created_at, updated_at, deleted_at | |

### Seed balita (10) — kolom: nama, JK, umur, desa, posyandu, ibu, validasi
1. Ahmad Rizki Pratama · L · 3th1bln · Mulyosari · Melati I · Siti Khadijah · Disetujui
2. Aisyah Putri Nuraini · P · 2th6bln · Mulyosari · Melati I · Sri Lestari · Disetujui
3. Muhammad Fadli · L · 2th10bln · Mulyosari · Melati II · Nur Aini · Menunggu
4. Zahra Kamilah · P · 2th9bln · Mulyosari · Melati II · Wahyu · Disetujui
5. Bayu Saputra · L · 3th4bln · Kedungcangkring · Kenanga I · Endang · Disetujui
6. Dewi Anggraini · P · 2th5bln · Kedungcangkring · Kenanga I · Sumirah · Menunggu
7. Rangga Wijaya · L · 3th3bln · Pagerwojo · Mawar I · Sri Wahyuni · Disetujui
8–10. (Pagerwojo & lainnya) + "Cinta Lestari" (balita dampingan kader.mulyosari01)
NIK pola: `3501` + kode desa/urut + tahun + urut (16 digit).

---

## 5. pendampingan (konsumsi telur harian)
| Kolom | Tipe | Catatan |
|-------|------|---------|
| id | string | |
| balita_id | ref | |
| tanggal | date | "2026-08-05" |
| hari_ke | int | 1,3,5,…21 (hari program) |
| jam | time | "09:01" |
| makan_telur | bool | Ya / Tidak |
| jumlah_butir | int null | 1, 2, atau custom (radio: 1 Butir/2 Butir/Lainnya). Jika Tidak → null |
| kader_id / nama_pendamping | ref/string | "Maryam Safitri" |
| keterangan | text | "Balita makan telur dengan lahap" / "Balita belum nafsu makan" |
| foto_dokumentasi | string null | upload |
| lokasi_lat, lokasi_lng | float null | "Deteksi Lokasi GPS otomatis" |
| validasi_status | enum | `menunggu`\|`disetujui`\|`ditolak` |
| created_at, updated_at, deleted_at | |

Contoh: b-d01-1 punya 15 record (Hari 1..21 ganjil). Tidak makan → keterangan "Balita belum nafsu makan".

---

## 6. pengukuran (antropometri)
| Kolom | Tipe | Catatan |
|-------|------|---------|
| id | string | |
| balita_id | ref | |
| tanggal | date | |
| berat_badan | float | kg (wajib) |
| tinggi_badan | float | cm (wajib) |
| lingkar_kepala | float null | cm |
| lingkar_lengan_atas | float null | cm (LILA) |
| z_score | float | dihitung (WHO), mis. -3.81 |
| status_gizi | enum | `normal` \| `kurang` \| `sangat_kurang` |
| risiko_stunting | enum/bool | `tinggi` \| `normal` |
| validasi_status | enum | menunggu/disetujui/ditolak |
| created_at, updated_at, deleted_at | |

Tombol form: **"Hitung Status Gizi & Risiko Stunting"** → hitung z-score & status dari BB/TB/umur/JK (standar WHO z-score BB/U, TB/U, BB/TB).

---

## 7. audit_logs
| Kolom | Tipe |
|-------|------|
| id | string |
| waktu | timestamp |
| user_id / user_nama / user_role | |
| aksi | enum: `Login`, `Tambah Data`, `Validasi Data`, `Edit`, `Hapus`, `Reset Password`… |
| modul | `Auth`, `Validasi`, `Pendampingan`, `Balita`, `Pengguna`… |
| detail | text ("Login berhasil sebagai ADMIN") |
| ip_address | string |
| browser | string ("Chrome 128 / Windows") |

---

## 8. app_settings (single row)
Umum: nama_aplikasi ("GEMATI - Pendampingan Makan Telur Cegah Stunting"), kecamatan (Pagerwojo), kabupaten (Tulungagung), provinsi (Jawa Timur).
Keamanan: session_timeout (30 menit), batas_percobaan_login (5), mode_maintenance (bool).
Notifikasi: notif_email (bool), notif_push (bool).
Backup: backup_otomatis (bool), last_backup, next_backup.

---

## Enum ringkas
- `role`: admin | ppkbd | kader
- `jenis_kelamin`: L | P
- `status` (balita/user): aktif | nonaktif
- `validasi_status`: menunggu | disetujui | ditolak (aksi: Setujui / Tolak / Kembalikan)
- `status_gizi`: normal | kurang | sangat_kurang
- `risiko_stunting`: normal | tinggi

## Angka global (dashboard admin)
Desa 10 · Kader 4 · PPKBD 3 · Balita 10 · Pendampingan 90 · Validasi (valid) 78 · Belum valid 12 · Risiko stunting 6 · Pengukuran 13. Pendampingan tervalidasi 87% · Balita aktif 100% · Konsumsi telur 83%.
