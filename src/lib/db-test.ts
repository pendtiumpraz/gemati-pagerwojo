import "server-only";
import type { DbEngine } from "./db-config";

export type TestConnInput = {
  engine: DbEngine;
  // Postgres/Neon
  url?: string;
  ssl?: boolean;
  // MySQL
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
};

export type TestConnResult = {
  ok: boolean;
  message: string;
  version?: string;
  ms?: number;
};

/** Uji koneksi ke database dengan config yang diberikan (koneksi sekali pakai, tidak dipersist). */
export async function testConnection(input: TestConnInput): Promise<TestConnResult> {
  const start = Date.now();
  // require runtime yang tak dianalisis webpack (driver DB dimuat sesuai engine)
  const load = (m: string): any => (eval("require") as NodeRequire)(m);
  try {
    if (input.engine === "neon") {
      if (!input.url) return { ok: false, message: "URL koneksi Neon kosong" };
      const { neon } = load("@neondatabase/serverless");
      const sql = neon(input.url);
      const rows = await sql`select version() as v`;
      return { ok: true, message: "Koneksi Neon berhasil", version: rows?.[0]?.v, ms: Date.now() - start };
    }

    if (input.engine === "postgres") {
      if (!input.url) return { ok: false, message: "URL/host Postgres kosong" };
      const { Client } = load("pg");
      const client = new Client({
        connectionString: input.url,
        ssl: input.ssl ? { rejectUnauthorized: false } : undefined,
        connectionTimeoutMillis: 8000,
      });
      await client.connect();
      const r = await client.query("select version() as v");
      await client.end();
      return { ok: true, message: "Koneksi Postgres berhasil", version: r.rows?.[0]?.v, ms: Date.now() - start };
    }

    // mysql
    const mysql = load("mysql2/promise");
    const conn = await mysql.createConnection({
      host: input.host || "127.0.0.1",
      port: input.port || 3306,
      user: input.user || "root",
      password: input.password || "",
      database: input.database,
      ssl: input.ssl ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 8000,
    });
    const [rows]: any = await conn.query("select version() as v");
    await conn.end();
    return { ok: true, message: "Koneksi MySQL berhasil", version: rows?.[0]?.v, ms: Date.now() - start };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Koneksi gagal", ms: Date.now() - start };
  }
}
