CREATE TABLE `app_settings` (
	`id` int NOT NULL DEFAULT 1,
	`nama_aplikasi` varchar(200) NOT NULL DEFAULT 'GEMATI - Pendampingan Makan Telur Cegah Stunting',
	`kecamatan` varchar(120) NOT NULL DEFAULT 'Pagerwojo',
	`kabupaten` varchar(120) NOT NULL DEFAULT 'Tulungagung',
	`provinsi` varchar(120) NOT NULL DEFAULT 'Jawa Timur',
	`session_timeout` int NOT NULL DEFAULT 30,
	`batas_login` int NOT NULL DEFAULT 5,
	`mode_maintenance` boolean NOT NULL DEFAULT false,
	`notif_email` boolean NOT NULL DEFAULT true,
	`notif_push` boolean NOT NULL DEFAULT true,
	`backup_otomatis` boolean NOT NULL DEFAULT true,
	`last_backup` timestamp,
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `app_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`user_nama` varchar(150),
	`user_role` varchar(20),
	`aksi` varchar(50) NOT NULL,
	`modul` varchar(50) NOT NULL,
	`detail` text,
	`ip_address` varchar(50),
	`browser` varchar(150),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `balita` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`nik` varchar(255) NOT NULL,
	`nik_hash` varchar(64),
	`nama` varchar(150) NOT NULL,
	`jenis_kelamin` varchar(1) NOT NULL,
	`tempat_lahir` varchar(120),
	`tanggal_lahir` varchar(10) NOT NULL,
	`nama_ayah` varchar(150),
	`nama_ibu` varchar(150) NOT NULL,
	`no_hp` varchar(255),
	`alamat` text,
	`rt` varchar(10),
	`rw` varchar(10),
	`dusun` varchar(120),
	`desa_id` int NOT NULL,
	`posyandu_id` int,
	`kader_id` int,
	`foto` text,
	`status` varchar(20) NOT NULL DEFAULT 'aktif',
	`validasi_status` varchar(20) NOT NULL DEFAULT 'menunggu',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `balita_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `desa` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`nama` varchar(120) NOT NULL,
	`kecamatan` varchar(120) NOT NULL DEFAULT 'Pagerwojo',
	`kabupaten` varchar(120) NOT NULL DEFAULT 'Tulungagung',
	`lat` double,
	`lng` double,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `desa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`judul` varchar(200) NOT NULL,
	`pesan` text,
	`dibaca` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pendampingan` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`balita_id` int NOT NULL,
	`tanggal` varchar(10) NOT NULL,
	`hari_ke` int,
	`jam` varchar(8),
	`makan_telur` boolean NOT NULL DEFAULT true,
	`jumlah_butir` int,
	`kader_id` int,
	`nama_pendamping` varchar(150),
	`keterangan` text,
	`foto_dokumentasi` text,
	`lokasi_lat` double,
	`lokasi_lng` double,
	`validasi_status` varchar(20) NOT NULL DEFAULT 'menunggu',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `pendampingan_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pengukuran` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`balita_id` int NOT NULL,
	`tanggal` varchar(10) NOT NULL,
	`berat_badan` double NOT NULL,
	`tinggi_badan` double NOT NULL,
	`lingkar_kepala` double,
	`lingkar_lengan_atas` double,
	`z_score` double,
	`status_gizi` varchar(20),
	`risiko_stunting` varchar(20),
	`kader_id` int,
	`validasi_status` varchar(20) NOT NULL DEFAULT 'menunggu',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `pengukuran_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `posyandu` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`nama` varchar(120) NOT NULL,
	`desa_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `posyandu_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`username` varchar(100) NOT NULL,
	`password` varchar(255) NOT NULL,
	`nama` varchar(150) NOT NULL,
	`role` varchar(20) NOT NULL,
	`desa_id` int,
	`phone` varchar(30),
	`email` varchar(150),
	`active` boolean NOT NULL DEFAULT true,
	`last_login` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	`deleted_at` timestamp,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_audit_user_id` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_audit_aksi` ON `audit_logs` (`aksi`);--> statement-breakpoint
CREATE INDEX `idx_balita_nik_hash` ON `balita` (`nik_hash`);--> statement-breakpoint
CREATE INDEX `idx_balita_desa_id` ON `balita` (`desa_id`);--> statement-breakpoint
CREATE INDEX `idx_balita_kader_id` ON `balita` (`kader_id`);--> statement-breakpoint
CREATE INDEX `idx_balita_validasi` ON `balita` (`validasi_status`);--> statement-breakpoint
CREATE INDEX `idx_balita_deleted_at` ON `balita` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_desa_deleted_at` ON `desa` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_notif_user_id` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_pendampingan_balita_id` ON `pendampingan` (`balita_id`);--> statement-breakpoint
CREATE INDEX `idx_pendampingan_kader_id` ON `pendampingan` (`kader_id`);--> statement-breakpoint
CREATE INDEX `idx_pendampingan_validasi` ON `pendampingan` (`validasi_status`);--> statement-breakpoint
CREATE INDEX `idx_pendampingan_tanggal` ON `pendampingan` (`tanggal`);--> statement-breakpoint
CREATE INDEX `idx_pendampingan_deleted_at` ON `pendampingan` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_pengukuran_balita_id` ON `pengukuran` (`balita_id`);--> statement-breakpoint
CREATE INDEX `idx_pengukuran_validasi` ON `pengukuran` (`validasi_status`);--> statement-breakpoint
CREATE INDEX `idx_pengukuran_deleted_at` ON `pengukuran` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_posyandu_desa_id` ON `posyandu` (`desa_id`);--> statement-breakpoint
CREATE INDEX `idx_posyandu_deleted_at` ON `posyandu` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `idx_users_username` ON `users` (`username`);--> statement-breakpoint
CREATE INDEX `idx_users_role` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `idx_users_desa_id` ON `users` (`desa_id`);--> statement-breakpoint
CREATE INDEX `idx_users_deleted_at` ON `users` (`deleted_at`);