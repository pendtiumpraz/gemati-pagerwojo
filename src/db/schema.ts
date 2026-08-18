/**
 * Barrel schema — memilih dialek aktif (Postgres/Neon atau MySQL) saat runtime,
 * TAPI diketik sebagai versi Postgres agar service layer tetap type-safe & tidak berubah.
 *
 * Nama tabel & kolom identik di kedua dialek, jadi query builder Drizzle jalan sama.
 */
import * as pg from "./schema.pg";
import * as my from "./schema.mysql";
import { getDbEngine } from "@/lib/db-config";

const active = (getDbEngine() === "mysql" ? my : pg) as unknown as typeof pg;

export const users = active.users;
export const desa = active.desa;
export const posyandu = active.posyandu;
export const balita = active.balita;
export const pendampingan = active.pendampingan;
export const pengukuran = active.pengukuran;
export const auditLogs = active.auditLogs;
export const appSettings = active.appSettings;
export const notifications = active.notifications;

// Enum & konstanta (dialek-agnostik)
export {
  ROLES,
  JENIS_KELAMIN,
  STATUS_AKTIF,
  VALIDASI,
  STATUS_GIZI,
  RISIKO,
} from "./schema.pg";

// Tipe (dari versi Postgres sebagai kanonik)
export type {
  User,
  Desa,
  Posyandu,
  Balita,
  Pendampingan,
  Pengukuran,
  AuditLog,
  AppSettings,
  Notification,
} from "./schema.pg";
