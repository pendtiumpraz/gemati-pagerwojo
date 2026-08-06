import { eq } from "drizzle-orm";
import { db } from "@/db";
import { appSettings, type AppSettings } from "@/db/schema";

export type SettingsPatch = Partial<{
  nama_aplikasi: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  session_timeout: number;
  batas_login: number;
  mode_maintenance: boolean;
  notif_email: boolean;
  notif_push: boolean;
  backup_otomatis: boolean;
  last_backup: Date | null;
}>;

/** Ambil pengaturan (row id=1). Buat default bila belum ada. */
export async function getSettings(): Promise<AppSettings> {
  const rows = await db.select().from(appSettings).where(eq(appSettings.id, 1)).limit(1);
  if (rows[0]) return rows[0];
  const inserted = await db.insert(appSettings).values({ id: 1 }).returning();
  return inserted[0];
}

export async function updateSettings(patch: SettingsPatch): Promise<AppSettings> {
  await getSettings(); // pastikan row ada
  const rows = await db
    .update(appSettings)
    .set({ ...patch, updated_at: new Date() })
    .where(eq(appSettings.id, 1))
    .returning();
  return rows[0];
}
