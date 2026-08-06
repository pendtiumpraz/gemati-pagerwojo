/**
 * Seed data GEMATI Pagerwojo — identik dengan aplikasi referensi.
 * Jalankan: npm run db:seed
 */
import { config } from "dotenv";
config({ path: ".env" });

import bcrypt from "bcryptjs";
import { db } from "./index";
import {
  users,
  desa,
  posyandu,
  balita,
  pendampingan,
  pengukuran,
  appSettings,
  auditLogs,
} from "./schema";
import { sql } from "drizzle-orm";
import { hitungStatusGizi } from "../lib/gizi";
import { umurBulan } from "../lib/utils";

const hash = (p: string) => bcrypt.hashSync(p, 10);

async function main() {
  console.log("🌱 Seeding GEMATI Pagerwojo...");

  // Bersihkan (urutan bebas karena tanpa FK)
  await db.execute(
    sql`TRUNCATE TABLE users, desa, posyandu, balita, pendampingan, pengukuran, audit_logs, app_settings, notifications RESTART IDENTITY CASCADE`
  );

  // ---------- DESA (10) ----------
  const desaNama = [
    "Mulyosari",
    "Kedungcangkring",
    "Samar",
    "Segawe",
    "Pagerwojo",
    "Penjor",
    "Gambiran",
    "Gondanggunung",
    "Kradinan",
    "Sidomulyo",
  ];
  // koordinat sekitar Kec. Pagerwojo, Tulungagung
  const desaKoord: Array<[number, number]> = [
    [-8.1291, 111.7712],
    [-8.1401, 111.7602],
    [-8.1512, 111.7501],
    [-8.1623, 111.7405],
    [-8.1189, 111.7810],
    [-8.1078, 111.7905],
    [-8.1701, 111.7305],
    [-8.1810, 111.7208],
    [-8.1350, 111.7650],
    [-8.1450, 111.7550],
  ];
  const desaRows = await db
    .insert(desa)
    .values(
      desaNama.map((nama, i) => ({
        nama,
        kecamatan: "Pagerwojo",
        kabupaten: "Tulungagung",
        lat: desaKoord[i][0],
        lng: desaKoord[i][1],
      }))
    )
    .returning({ id: desa.id, nama: desa.nama });
  const desaId = (nama: string) => desaRows.find((d) => d.nama === nama)!.id;
  console.log(`  ✓ ${desaRows.length} desa`);

  // ---------- POSYANDU ----------
  const posyanduDef: Array<[string, string]> = [
    ["Melati I", "Mulyosari"],
    ["Melati II", "Mulyosari"],
    ["Kenanga I", "Kedungcangkring"],
    ["Mawar I", "Pagerwojo"],
    ["Anggrek I", "Samar"],
    ["Dahlia I", "Segawe"],
  ];
  const posyanduRows = await db
    .insert(posyandu)
    .values(posyanduDef.map(([nama, d]) => ({ nama, desa_id: desaId(d) })))
    .returning({ id: posyandu.id, nama: posyandu.nama });
  const posyanduId = (nama: string) => posyanduRows.find((p) => p.nama === nama)?.id ?? null;
  console.log(`  ✓ ${posyanduRows.length} posyandu`);

  // ---------- USERS (8) ----------
  const usersDef = [
    { username: "admin", nama: "Sutrisno, S.KM", role: "admin", desa: null, phone: "081234567890" },
    { username: "ppkbd.mulyosari", nama: "Siti Aminah", role: "ppkbd", desa: "Mulyosari", phone: "081234567891" },
    { username: "ppkbd.kedungcangkring", nama: "Joko Prasetyo", role: "ppkbd", desa: "Kedungcangkring", phone: "081234567892" },
    { username: "ppkbd.pagerwojo", nama: "Endang Wahyuni", role: "ppkbd", desa: "Pagerwojo", phone: "081234567893" },
    { username: "kader.mulyosari01", nama: "Maryam Safitri", role: "kader", desa: "Mulyosari", phone: "081234567894" },
    { username: "kader.mulyosari02", nama: "Ahmad Fauzi", role: "kader", desa: "Mulyosari", phone: "081234567895" },
    { username: "kader.kedungcangkring01", nama: "Nur Hidayah", role: "kader", desa: "Kedungcangkring", phone: "081234567896" },
    { username: "kader.pagerwojo01", nama: "Wahyu Setiawan", role: "kader", desa: "Pagerwojo", phone: "081234567897" },
  ];
  const userRows = await db
    .insert(users)
    .values(
      usersDef.map((u) => ({
        username: u.username,
        password: hash(u.role === "admin" ? "admin123" : "kader123"),
        nama: u.nama,
        role: u.role,
        desa_id: u.desa ? desaId(u.desa) : null,
        phone: u.phone,
        email: `${u.username}@pagerwojo.go.id`,
        active: true,
      }))
    )
    .returning({ id: users.id, username: users.username, nama: users.nama });
  const userId = (username: string) => userRows.find((u) => u.username === username)!.id;
  const userNama = (username: string) => userRows.find((u) => u.username === username)!.nama;
  console.log(`  ✓ ${userRows.length} users (admin: admin/admin123, lain: /kader123)`);

  // ---------- BALITA ----------
  type BDef = {
    nik: string; nama: string; jk: "L" | "P"; lahir: string; tempat: string;
    ayah: string; ibu: string; hp: string; desa: string; posyandu: string;
    kader: string; dusun: string; rt: string; rw: string; validasi: string;
  };
  const balitaDef: BDef[] = [
    { nik: "3501010101220001", nama: "Ahmad Rizki Pratama", jk: "L", lahir: "2023-06-15", tempat: "Tulungagung", ayah: "Suparman", ibu: "Siti Khadijah", hp: "081234500001", desa: "Mulyosari", posyandu: "Melati I", kader: "kader.mulyosari01", dusun: "Sido Mukti", rt: "02", rw: "02", validasi: "disetujui" },
    { nik: "3501010102220002", nama: "Aisyah Putri Nuraini", jk: "P", lahir: "2024-01-20", tempat: "Tulungagung", ayah: "Rahmat", ibu: "Sri Lestari", hp: "081234500002", desa: "Mulyosari", posyandu: "Melati I", kader: "kader.mulyosari01", dusun: "Sido Mukti", rt: "01", rw: "02", validasi: "disetujui" },
    { nik: "3501010103230003", nama: "Muhammad Fadli", jk: "L", lahir: "2023-09-10", tempat: "Tulungagung", ayah: "Hendra", ibu: "Nur Aini", hp: "081234500003", desa: "Mulyosari", posyandu: "Melati II", kader: "kader.mulyosari02", dusun: "Krajan", rt: "03", rw: "01", validasi: "menunggu" },
    { nik: "3501010104230004", nama: "Zahra Kamilah", jk: "P", lahir: "2023-10-05", tempat: "Tulungagung", ayah: "Bambang", ibu: "Wahyu", hp: "081234500004", desa: "Mulyosari", posyandu: "Melati II", kader: "kader.mulyosari02", dusun: "Krajan", rt: "02", rw: "01", validasi: "disetujui" },
    { nik: "3501010105240005", nama: "Cinta Lestari", jk: "P", lahir: "2024-03-12", tempat: "Tulungagung", ayah: "Agus", ibu: "Yuliana", hp: "081234500005", desa: "Mulyosari", posyandu: "Melati I", kader: "kader.mulyosari01", dusun: "Sido Mukti", rt: "01", rw: "03", validasi: "disetujui" },
    { nik: "3501010201230006", nama: "Bayu Saputra", jk: "L", lahir: "2023-04-18", tempat: "Tulungagung", ayah: "Slamet", ibu: "Endang", hp: "081234500006", desa: "Kedungcangkring", posyandu: "Kenanga I", kader: "kader.kedungcangkring01", dusun: "Ngrejo", rt: "01", rw: "01", validasi: "disetujui" },
    { nik: "3501010202240007", nama: "Dewi Anggraini", jk: "P", lahir: "2024-02-25", tempat: "Tulungagung", ayah: "Joko", ibu: "Sumirah", hp: "081234500007", desa: "Kedungcangkring", posyandu: "Kenanga I", kader: "kader.kedungcangkring01", dusun: "Ngrejo", rt: "02", rw: "01", validasi: "menunggu" },
    { nik: "3501010501230008", nama: "Rangga Wijaya", jk: "L", lahir: "2023-05-08", tempat: "Tulungagung", ayah: "Purnomo", ibu: "Sri Wahyuni", hp: "081234500008", desa: "Pagerwojo", posyandu: "Mawar I", kader: "kader.pagerwojo01", dusun: "Tanggung", rt: "01", rw: "02", validasi: "disetujui" },
    { nik: "3501010502230009", nama: "Salsabila Putri", jk: "P", lahir: "2023-07-14", tempat: "Tulungagung", ayah: "Wagiman", ibu: "Kartini", hp: "081234500009", desa: "Pagerwojo", posyandu: "Mawar I", kader: "kader.pagerwojo01", dusun: "Tanggung", rt: "02", rw: "02", validasi: "disetujui" },
    { nik: "3501010503240010", nama: "Farel Ramadhan", jk: "L", lahir: "2024-04-01", tempat: "Tulungagung", ayah: "Sutrisno", ibu: "Lestari", hp: "081234500010", desa: "Pagerwojo", posyandu: "Mawar I", kader: "kader.pagerwojo01", dusun: "Tanggung", rt: "03", rw: "01", validasi: "disetujui" },
  ];
  const balitaRows = await db
    .insert(balita)
    .values(
      balitaDef.map((b) => ({
        nik: b.nik, nama: b.nama, jenis_kelamin: b.jk, tempat_lahir: b.tempat,
        tanggal_lahir: b.lahir, nama_ayah: b.ayah, nama_ibu: b.ibu, no_hp: b.hp,
        alamat: `Dusun ${b.dusun}, RT ${b.rt}/RW ${b.rw}`, rt: b.rt, rw: b.rw, dusun: b.dusun,
        desa_id: desaId(b.desa), posyandu_id: posyanduId(b.posyandu), kader_id: userId(b.kader),
        status: "aktif", validasi_status: b.validasi,
      }))
    )
    .returning({ id: balita.id, nama: balita.nama });
  const balitaId = (nama: string) => balitaRows.find((b) => b.nama === nama)!.id;
  console.log(`  ✓ ${balitaRows.length} balita`);

  // ---------- PENDAMPINGAN (program 21 hari, hari ganjil) ----------
  const refDate = new Date("2026-08-05");
  const pendRows: any[] = [];
  // balita yang aktif ikut program (4 balita Mulyosari + Kedungcangkring + Pagerwojo)
  const programBalita = balitaDef.filter((b) =>
    ["Mulyosari", "Kedungcangkring", "Pagerwojo"].includes(b.desa)
  );
  for (const b of programBalita) {
    const bid = balitaId(b.nama);
    const kid = userId(b.kader);
    const kNama = userNama(b.kader);
    // 15 catatan: Hari 1,3,5,...,29 (mundur dari refDate per 2 hari)
    for (let i = 0; i < 15; i++) {
      const hari = 1 + i * 2;
      const tgl = new Date(refDate);
      tgl.setDate(tgl.getDate() - i * 2);
      const makan = i % 4 !== 2; // sesekali tidak makan
      const butir = makan ? (i % 2 === 0 ? 2 : 1) : null;
      const vStatus = i < 2 ? "menunggu" : "disetujui";
      pendRows.push({
        balita_id: bid, tanggal: tgl.toISOString().slice(0, 10), hari_ke: hari,
        jam: `09:0${(i % 5) + 1}`, makan_telur: makan, jumlah_butir: butir,
        kader_id: kid, nama_pendamping: kNama,
        keterangan: makan ? "Balita makan telur dengan lahap" : "Balita belum nafsu makan",
        validasi_status: vStatus,
      });
    }
  }
  await db.insert(pendampingan).values(pendRows);
  console.log(`  ✓ ${pendRows.length} pendampingan`);

  // ---------- PENGUKURAN ----------
  const pengRows: any[] = [];
  for (const b of programBalita) {
    const bid = balitaId(b.nama);
    const kid = userId(b.kader);
    // 3 pengukuran per balita program
    const tinggiBase = 70 + Math.random() * 8;
    for (let i = 0; i < 3; i++) {
      const tgl = new Date(refDate);
      tgl.setMonth(tgl.getMonth() - i);
      const umurBln = umurBulan(b.lahir, tgl);
      // sebagian balita stunting (Ahmad Rizki z rendah)
      const tinggi =
        b.nama === "Ahmad Rizki Pratama"
          ? 71.7 - i * 1.5
          : Math.round((tinggiBase - i * 1.2) * 10) / 10;
      const berat = Math.round((8 + Math.random() * 2) * 10) / 10;
      const gizi = hitungStatusGizi(tinggi, umurBln, b.jk);
      pengRows.push({
        balita_id: bid, tanggal: tgl.toISOString().slice(0, 10),
        berat_badan: berat, tinggi_badan: tinggi,
        lingkar_kepala: Math.round((44 + Math.random() * 2) * 10) / 10,
        lingkar_lengan_atas: Math.round((12 + Math.random()) * 10) / 10,
        z_score: gizi.z_score, status_gizi: gizi.status_gizi, risiko_stunting: gizi.risiko_stunting,
        kader_id: kid, validasi_status: i === 0 ? "menunggu" : "disetujui",
      });
    }
  }
  await db.insert(pengukuran).values(pengRows);
  console.log(`  ✓ ${pengRows.length} pengukuran`);

  // ---------- APP SETTINGS ----------
  await db.insert(appSettings).values({ id: 1, last_backup: refDate });
  console.log("  ✓ app_settings");

  // ---------- AUDIT LOGS ----------
  await db.insert(auditLogs).values([
    { user_id: userId("admin"), user_nama: "Sutrisno, S.KM", user_role: "admin", aksi: "Login", modul: "Auth", detail: "Login berhasil sebagai ADMIN", ip_address: "103.12.45.67", browser: "Chrome 128 / Windows" },
    { user_id: userId("ppkbd.mulyosari"), user_nama: "Siti Aminah", user_role: "ppkbd", aksi: "Validasi Data", modul: "Validasi", detail: "Menyetujui data balita Ahmad Rizki Pratama", ip_address: "114.5.22.11", browser: "Chrome 128 / Android" },
    { user_id: userId("kader.mulyosari01"), user_nama: "Maryam Safitri", user_role: "kader", aksi: "Tambah Data", modul: "Pendampingan", detail: "Input pendampingan baru untuk Aisyah Putri Nuraini", ip_address: "114.5.22.10", browser: "Chrome 128 / Android" },
  ]);
  console.log("  ✓ audit_logs");

  console.log("✅ Seed selesai!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("❌ Seed gagal:", e);
    process.exit(1);
  });
