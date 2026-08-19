import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env" });

// Konfigurasi Postgres / Neon (default). Untuk MySQL pakai drizzle.mysql.config.ts.
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || process.env.POSTGRES_URL;

export default defineConfig({
  schema: "./src/db/schema.pg.ts",
  out: "./drizzle/pg",
  dialect: "postgresql",
  // Pakai URL bila ada; kalau tidak, pakai field terpisah (aman utk password spesial).
  dbCredentials: url
    ? { url }
    : {
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || "",
        password: process.env.PGPASSWORD || "",
        database: process.env.PGDATABASE || "",
        ssl: process.env.PGSSL === "true",
      },
  verbose: true,
  strict: true,
});
