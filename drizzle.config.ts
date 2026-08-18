import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env" });

// Konfigurasi Postgres / Neon (default). Untuk MySQL pakai drizzle.mysql.config.ts.
export default defineConfig({
  schema: "./src/db/schema.pg.ts",
  out: "./drizzle/pg",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
