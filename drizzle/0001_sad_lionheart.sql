DROP INDEX IF EXISTS "idx_balita_nik";--> statement-breakpoint
ALTER TABLE "balita" ALTER COLUMN "nik" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "balita" ALTER COLUMN "no_hp" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "balita" ADD COLUMN "nik_hash" varchar(64);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_balita_nik_hash" ON "balita" USING btree ("nik_hash");