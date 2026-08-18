/**
 * Konfigurasi database & deployment — mendukung banyak engine tanpa ketergantungan.
 *
 * Engine  : "neon" (Postgres serverless) | "postgres" (Postgres biasa) | "mysql"
 * Deploy  : "vercel" | "node" (VPS/Docker/self-host)
 *
 * Aturan: Vercel WAJIB Neon (serverless). Non-Vercel bisa Postgres biasa atau MySQL.
 *
 * Prioritas sumber config: file `config/deployment.json` (ditulis Superadmin) > ENV > default.
 * Rahasia koneksi (password/URL) SELALU dari ENV — tidak disimpan di file config.
 */
import fs from "fs";
import path from "path";

export type DbEngine = "neon" | "postgres" | "mysql";
export type DeployTarget = "vercel" | "node";

const CONFIG_PATH = path.join(process.cwd(), "config", "deployment.json");

type PersistedConfig = { deploy?: DeployTarget; engine?: DbEngine };

function readPersisted(): PersistedConfig {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    return JSON.parse(raw) as PersistedConfig;
  } catch {
    return {};
  }
}

export function isVercel(): boolean {
  return !!process.env.VERCEL || process.env.DEPLOY_TARGET === "vercel";
}

export function getDeployTarget(): DeployTarget {
  const persisted = readPersisted();
  if (isVercel()) return "vercel";
  return persisted.deploy || (process.env.DEPLOY_TARGET as DeployTarget) || "node";
}

function inferEngineFromEnv(): DbEngine {
  const raw = (process.env.DB_ENGINE || "").toLowerCase();
  if (raw === "neon" || raw === "postgres" || raw === "mysql") return raw;
  if (process.env.MYSQL_URL || process.env.MYSQL_HOST) return "mysql";
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  if (/neon\.tech/.test(url)) return "neon";
  if (/^postgres/.test(url)) return "postgres";
  return "neon"; // default aman (kompatibel setup awal)
}

export function getDbEngine(): DbEngine {
  const persisted = readPersisted();
  let engine: DbEngine = persisted.engine || inferEngineFromEnv();
  // Constraint: Vercel hanya boleh Neon.
  if (getDeployTarget() === "vercel") engine = "neon";
  return engine;
}

export type DbConnection = {
  engine: DbEngine;
  deploy: DeployTarget;
  pgUrl?: string; // untuk neon & postgres
  pgSsl?: boolean;
  mysql?: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl?: boolean;
  };
};

export function getDbConfig(): DbConnection {
  const engine = getDbEngine();
  const deploy = getDeployTarget();

  if (engine === "mysql") {
    // Bisa via MYSQL_URL atau field terpisah
    const url = process.env.MYSQL_URL;
    if (url) {
      const u = new URL(url);
      return {
        engine,
        deploy,
        mysql: {
          host: u.hostname,
          port: Number(u.port || 3306),
          user: decodeURIComponent(u.username),
          password: decodeURIComponent(u.password),
          database: u.pathname.replace(/^\//, ""),
          ssl: u.searchParams.get("ssl") === "true",
        },
      };
    }
    return {
      engine,
      deploy,
      mysql: {
        host: process.env.MYSQL_HOST || "127.0.0.1",
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "gemati",
        ssl: process.env.MYSQL_SSL === "true",
      },
    };
  }

  // neon / postgres
  const pgUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    (process.env.PGHOST
      ? `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE}`
      : undefined);
  const pgSsl =
    engine === "neon" ||
    /sslmode=require/.test(pgUrl || "") ||
    process.env.PGSSL === "true";
  return { engine, deploy, pgUrl, pgSsl };
}

/** Tulis pilihan deploy/engine ke file config (dipakai Superadmin). Hanya non-secret. */
export function writePersistedConfig(cfg: PersistedConfig) {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const current = readPersisted();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ ...current, ...cfg }, null, 2), "utf8");
}

export function getPersistedConfig(): PersistedConfig {
  return readPersisted();
}
