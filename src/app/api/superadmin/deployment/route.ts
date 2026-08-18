import { NextRequest } from "next/server";
import { z } from "zod";
import { requireAuth, ok, bad, handle } from "@/lib/api";
import {
  getDeployTarget,
  getDbEngine,
  isVercel,
  writePersistedConfig,
  type DbEngine,
} from "@/lib/db-config";
import { upsertEnv, canWriteEnv } from "@/lib/env-writer";
import { logAudit } from "@/modules/auth/service";

export async function GET() {
  return handle(async () => {
    await requireAuth(["admin"]);
    return ok({
      isVercel: isVercel(),
      deploy: getDeployTarget(),
      engine: getDbEngine(),
      canWrite: canWriteEnv() && !isVercel(),
      hasConnection: {
        pg: !!(process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.PGHOST),
        mysql: !!(process.env.MYSQL_URL || process.env.MYSQL_HOST),
      },
    });
  });
}

const schema = z.object({
  deploy: z.enum(["vercel", "node"]),
  engine: z.enum(["neon", "postgres", "mysql"]),
  connection: z
    .object({
      pgUrl: z.string().optional(),
      mysql: z
        .object({
          host: z.string(),
          port: z.coerce.number().optional(),
          user: z.string(),
          password: z.string().optional(),
          database: z.string(),
        })
        .optional(),
    })
    .optional(),
});

export async function PUT(req: NextRequest) {
  return handle(async () => {
    const session = await requireAuth(["admin"]);
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return bad("Data tidak valid");
    const { deploy, engine, connection } = parsed.data;

    // Constraint: Vercel wajib Neon
    if (deploy === "vercel" && engine !== "neon") {
      return bad("Deploy Vercel wajib memakai database Neon (Postgres serverless).");
    }
    if (deploy === "node" && engine === "neon") {
      // diperbolehkan (Neon juga bisa dari server biasa), tapi beri catatan
    }

    // Simpan pilihan (non-secret) ke config file
    writePersistedConfig({ deploy, engine });

    // Simpan koneksi ke .env (hanya self-host yang bisa tulis)
    let envNote = "";
    if (!isVercel() && canWriteEnv() && connection) {
      const vars: Record<string, string | undefined> = {
        DB_ENGINE: engine,
        DEPLOY_TARGET: deploy,
      };
      if ((engine === "neon" || engine === "postgres") && connection.pgUrl) {
        vars.DATABASE_URL = connection.pgUrl;
      }
      if (engine === "mysql" && connection.mysql) {
        vars.MYSQL_HOST = connection.mysql.host;
        vars.MYSQL_PORT = String(connection.mysql.port ?? 3306);
        vars.MYSQL_USER = connection.mysql.user;
        vars.MYSQL_PASSWORD = connection.mysql.password ?? "";
        vars.MYSQL_DATABASE = connection.mysql.database;
      }
      const r = upsertEnv(vars);
      envNote = r.ok ? " Koneksi disimpan ke .env." : ` (Gagal tulis .env: ${r.message})`;
    } else if (isVercel()) {
      envNote = " Di Vercel, atur DATABASE_URL lewat dashboard Vercel (Environment Variables).";
    }

    await logAudit({
      user: session,
      aksi: "Edit",
      modul: "Deployment",
      detail: `Set deploy=${deploy}, engine=${engine}`,
    });

    return ok(
      { deploy, engine },
      `Konfigurasi tersimpan. Perlu migrate + restart aplikasi agar aktif.${envNote}`
    );
  });
}
