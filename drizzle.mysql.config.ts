import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env" });

// Konfigurasi MySQL. Set MYSQL_URL ATAU MYSQL_HOST/PORT/USER/PASSWORD/DATABASE di .env.
const url = process.env.MYSQL_URL;

export default defineConfig({
  schema: "./src/db/schema.mysql.ts",
  out: "./drizzle/mysql",
  dialect: "mysql",
  dbCredentials: url
    ? { url }
    : {
        host: process.env.MYSQL_HOST || "127.0.0.1",
        port: Number(process.env.MYSQL_PORT || 3306),
        user: process.env.MYSQL_USER || "root",
        password: process.env.MYSQL_PASSWORD || "",
        database: process.env.MYSQL_DATABASE || "gemati",
      },
  verbose: true,
  strict: true,
});
