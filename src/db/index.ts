/**
 * Factory koneksi DB multi-engine. Driver dipilih dari config (neon | postgres | mysql).
 * `db` diketik sebagai Postgres (Neon) untuk DX; pada MySQL di-cast — API query builder sama,
 * kecuali `.returning()` yang di-abstraksi lewat `@/db/repo`.
 */
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as pgSchema from "./schema.pg";
import * as mySchema from "./schema.mysql";
import { getDbConfig, type DbEngine } from "@/lib/db-config";

const cfg = getDbConfig();
export const engine: DbEngine = cfg.engine;

// Singleton (hindari banyak pool saat hot-reload dev)
const g = globalThis as unknown as { __gematiDb?: unknown };

function build(): unknown {
  if (engine === "neon") {
    if (!cfg.pgUrl) throw new Error("DATABASE_URL (Neon) tidak ditemukan di environment");
    const { neon } = require("@neondatabase/serverless");
    const { drizzle } = require("drizzle-orm/neon-http");
    return drizzle(neon(cfg.pgUrl), { schema: pgSchema });
  }
  if (engine === "postgres") {
    if (!cfg.pgUrl && !cfg.pg)
      throw new Error("Koneksi Postgres tidak ditemukan (DATABASE_URL atau PGHOST/PGUSER/...)");
    const { Pool } = require("pg");
    const { drizzle } = require("drizzle-orm/node-postgres");
    const poolCfg = cfg.pg
      ? {
          host: cfg.pg.host,
          port: cfg.pg.port,
          user: cfg.pg.user,
          password: cfg.pg.password,
          database: cfg.pg.database,
          ssl: cfg.pg.ssl ? { rejectUnauthorized: false } : undefined,
        }
      : {
          connectionString: cfg.pgUrl,
          ssl: cfg.pgSsl ? { rejectUnauthorized: false } : undefined,
        };
    const pool = new Pool(poolCfg);
    return drizzle(pool, { schema: pgSchema });
  }
  // mysql
  const m = cfg.mysql!;
  const mysql = require("mysql2/promise");
  const { drizzle } = require("drizzle-orm/mysql2");
  const pool = mysql.createPool({
    host: m.host,
    port: m.port,
    user: m.user,
    password: m.password,
    database: m.database,
    ssl: m.ssl ? { rejectUnauthorized: false } : undefined,
    connectionLimit: 10,
  });
  return drizzle(pool, { schema: mySchema, mode: "default" });
}

const _db = (g.__gematiDb ??= build());

// Diketik sebagai Neon/Postgres drizzle; MySQL di-cast (repo helper menangani perbedaan).
export const db = _db as NeonHttpDatabase<typeof pgSchema>;

// Skema aktif (untuk drizzle-kit / util). Diketik pg.
export const schema = (engine === "mysql" ? mySchema : pgSchema) as unknown as typeof pgSchema;
