import "server-only";
import fs from "fs";
import path from "path";

const ENV_PATH = path.join(process.cwd(), ".env");

/** Upsert beberapa key ke file .env (hanya untuk self-host / non-Vercel). */
export function upsertEnv(vars: Record<string, string | undefined>): { ok: boolean; message: string } {
  try {
    let content = "";
    try {
      content = fs.readFileSync(ENV_PATH, "utf8");
    } catch {
      content = "";
    }
    const lines = content.split(/\r?\n/);

    for (const [key, value] of Object.entries(vars)) {
      if (value === undefined) continue;
      const line = `${key}=${value}`;
      const idx = lines.findIndex((l) => l.startsWith(`${key}=`));
      if (idx >= 0) lines[idx] = line;
      else lines.push(line);
    }

    fs.writeFileSync(ENV_PATH, lines.join("\n"), "utf8");
    return { ok: true, message: "Konfigurasi tersimpan ke .env" };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Gagal menulis .env" };
  }
}

export function canWriteEnv(): boolean {
  try {
    fs.accessSync(process.cwd(), fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}
