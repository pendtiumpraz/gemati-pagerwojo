CREATE TABLE IF NOT EXISTS "app_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"nama_aplikasi" varchar(200) DEFAULT 'GEMATI - Pendampingan Makan Telur Cegah Stunting' NOT NULL,
	"kecamatan" varchar(120) DEFAULT 'Pagerwojo' NOT NULL,
	"kabupaten" varchar(120) DEFAULT 'Tulungagung' NOT NULL,
	"provinsi" varchar(120) DEFAULT 'Jawa Timur' NOT NULL,
	"session_timeout" integer DEFAULT 30 NOT NULL,
	"batas_login" integer DEFAULT 5 NOT NULL,
	"mode_maintenance" boolean DEFAULT false NOT NULL,
	"notif_email" boolean DEFAULT true NOT NULL,
	"notif_push" boolean DEFAULT true NOT NULL,
	"backup_otomatis" boolean DEFAULT true NOT NULL,
	"last_backup" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"user_nama" varchar(150),
	"user_role" varchar(20),
	"aksi" varchar(50) NOT NULL,
	"modul" varchar(50) NOT NULL,
	"detail" text,
	"ip_address" varchar(50),
	"browser" varchar(150),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "balita" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"nik" varchar(255) NOT NULL,
	"nik_hash" varchar(64),
	"nama" varchar(150) NOT NULL,
	"jenis_kelamin" varchar(1) NOT NULL,
	"tempat_lahir" varchar(120),
	"tanggal_lahir" varchar(10) NOT NULL,
	"nama_ayah" varchar(150),
	"nama_ibu" varchar(150) NOT NULL,
	"no_hp" varchar(255),
	"alamat" text,
	"rt" varchar(10),
	"rw" varchar(10),
	"dusun" varchar(120),
	"desa_id" integer NOT NULL,
	"posyandu_id" integer,
	"kader_id" integer,
	"foto" text,
	"status" varchar(20) DEFAULT 'aktif' NOT NULL,
	"validasi_status" varchar(20) DEFAULT 'menunggu' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "desa" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"nama" varchar(120) NOT NULL,
	"kecamatan" varchar(120) DEFAULT 'Pagerwojo' NOT NULL,
	"kabupaten" varchar(120) DEFAULT 'Tulungagung' NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifications" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"judul" varchar(200) NOT NULL,
	"pesan" text,
	"dibaca" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pendampingan" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"balita_id" integer NOT NULL,
	"tanggal" varchar(10) NOT NULL,
	"hari_ke" integer,
	"jam" varchar(8),
	"makan_telur" boolean DEFAULT true NOT NULL,
	"jumlah_butir" integer,
	"kader_id" integer,
	"nama_pendamping" varchar(150),
	"keterangan" text,
	"foto_dokumentasi" text,
	"lokasi_lat" double precision,
	"lokasi_lng" double precision,
	"validasi_status" varchar(20) DEFAULT 'menunggu' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pengukuran" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"balita_id" integer NOT NULL,
	"tanggal" varchar(10) NOT NULL,
	"berat_badan" double precision NOT NULL,
	"tinggi_badan" double precision NOT NULL,
	"lingkar_kepala" double precision,
	"lingkar_lengan_atas" double precision,
	"z_score" double precision,
	"status_gizi" varchar(20),
	"risiko_stunting" varchar(20),
	"kader_id" integer,
	"validasi_status" varchar(20) DEFAULT 'menunggu' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "posyandu" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"nama" varchar(120) NOT NULL,
	"desa_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"username" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"nama" varchar(150) NOT NULL,
	"role" varchar(20) NOT NULL,
	"desa_id" integer,
	"phone" varchar(30),
	"email" varchar(150),
	"active" boolean DEFAULT true NOT NULL,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_user_id" ON "audit_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_aksi" ON "audit_logs" USING btree ("aksi");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_balita_nik_hash" ON "balita" USING btree ("nik_hash");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_balita_desa_id" ON "balita" USING btree ("desa_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_balita_kader_id" ON "balita" USING btree ("kader_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_balita_validasi" ON "balita" USING btree ("validasi_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_balita_deleted_at" ON "balita" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_desa_deleted_at" ON "desa" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_notif_user_id" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pendampingan_balita_id" ON "pendampingan" USING btree ("balita_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pendampingan_kader_id" ON "pendampingan" USING btree ("kader_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pendampingan_validasi" ON "pendampingan" USING btree ("validasi_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pendampingan_tanggal" ON "pendampingan" USING btree ("tanggal");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pendampingan_deleted_at" ON "pendampingan" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pengukuran_balita_id" ON "pengukuran" USING btree ("balita_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pengukuran_validasi" ON "pengukuran" USING btree ("validasi_status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_pengukuran_deleted_at" ON "pengukuran" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_posyandu_desa_id" ON "posyandu" USING btree ("desa_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_posyandu_deleted_at" ON "posyandu" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_username" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_role" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_desa_id" ON "users" USING btree ("desa_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_users_deleted_at" ON "users" USING btree ("deleted_at");