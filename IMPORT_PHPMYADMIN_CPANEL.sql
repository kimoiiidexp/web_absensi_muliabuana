-- ============================================================
-- IMPORT PHPMyAdmin / cPanel
-- Sistem Absensi Sekolah Mulia Buana
-- Gunakan file ini setelah memilih database di phpMyAdmin.
-- File ini sengaja tidak memakai CREATE DATABASE dan USE.
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `pengumuman`;
DROP TABLE IF EXISTS `invitations`;
DROP TABLE IF EXISTS `catatan_siswa`;
DROP TABLE IF EXISTS `absensi_session`;
DROP TABLE IF EXISTS `absensi_siswa`;
DROP TABLE IF EXISTS `absensi_guru`;
DROP TABLE IF EXISTS `siswa_kelas`;
DROP TABLE IF EXISTS `guru_mapel_kelas`;
DROP TABLE IF EXISTS `mapel`;
DROP TABLE IF EXISTS `kelas`;
DROP TABLE IF EXISTS `jurusan`;
DROP TABLE IF EXISTS `users`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 2. TABLE: users
-- Deskripsi: Menyimpan data pengguna (admin, guru, siswa)
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('admin', 'guru', 'siswa') NOT NULL DEFAULT 'siswa',
  `phone` VARCHAR(20) NULL,
  `nis_nip` VARCHAR(50) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. TABLE: jurusan
-- Deskripsi: Data jurusan/program keahlian
-- ============================================================
CREATE TABLE IF NOT EXISTS `jurusan` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(10) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_jurusan_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. TABLE: kelas
-- Deskripsi: Data kelas
-- ============================================================
CREATE TABLE IF NOT EXISTS `kelas` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `jurusan_id` BIGINT UNSIGNED NOT NULL,
  `tingkat` TINYINT UNSIGNED NOT NULL COMMENT '1, 2, 3',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`jurusan_id`) REFERENCES `jurusan`(`id`) ON DELETE CASCADE,
  INDEX `idx_kelas_jurusan` (`jurusan_id`),
  INDEX `idx_kelas_tingkat` (`tingkat`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. TABLE: mapel
-- Deskripsi: Data mata pelajaran
-- ============================================================
CREATE TABLE IF NOT EXISTS `mapel` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_mapel_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. TABLE: guru_mapel_kelas
-- Deskripsi: Mapping guru mengajar mapel di kelas tertentu
-- ============================================================
CREATE TABLE IF NOT EXISTS `guru_mapel_kelas` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guru_id` BIGINT UNSIGNED NOT NULL,
  `mapel_id` BIGINT UNSIGNED NOT NULL,
  `kelas_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`guru_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`mapel_id`) REFERENCES `mapel`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`kelas_id`) REFERENCES `kelas`(`id`) ON DELETE CASCADE,
  INDEX `idx_guru_mapel_kelas_guru` (`guru_id`),
  INDEX `idx_guru_mapel_kelas_mapel` (`mapel_id`),
  INDEX `idx_guru_mapel_kelas_kelas` (`kelas_id`),
  UNIQUE `uniq_guru_mapel_kelas` (`guru_id`, `mapel_id`, `kelas_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. TABLE: siswa_kelas
-- Deskripsi: Mapping siswa di kelas tertentu
-- ============================================================
CREATE TABLE IF NOT EXISTS `siswa_kelas` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `siswa_id` BIGINT UNSIGNED NOT NULL,
  `kelas_id` BIGINT UNSIGNED NOT NULL,
  `tahun_ajaran` VARCHAR(9) NOT NULL COMMENT '2025/2026',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`siswa_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`kelas_id`) REFERENCES `kelas`(`id`) ON DELETE CASCADE,
  INDEX `idx_siswa_kelas_siswa` (`siswa_id`),
  INDEX `idx_siswa_kelas_kelas` (`kelas_id`),
  INDEX `idx_siswa_kelas_tahun` (`tahun_ajaran`),
  UNIQUE `uniq_siswa_kelas` (`siswa_id`, `kelas_id`, `tahun_ajaran`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. TABLE: absensi_guru
-- Deskripsi: Record absensi harian guru
-- ============================================================
CREATE TABLE IF NOT EXISTS `absensi_guru` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guru_id` BIGINT UNSIGNED NOT NULL,
  `tanggal` DATE NOT NULL,
  `waktu_absen` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `foto_path` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`guru_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_absensi_guru_guru` (`guru_id`),
  INDEX `idx_absensi_guru_tanggal` (`tanggal`),
  UNIQUE `uniq_guru_tanggal` (`guru_id`, `tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. TABLE: absensi_siswa
-- Deskripsi: Record absensi harian siswa (via QR code)
-- ============================================================
CREATE TABLE IF NOT EXISTS `absensi_siswa` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `siswa_id` BIGINT UNSIGNED NOT NULL,
  `session_id` BIGINT UNSIGNED NOT NULL,
  `waktu_absen` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` ENUM('hadir', 'terlambat', 'izin', 'alpa') NOT NULL DEFAULT 'hadir',
  `keterangan_izin` TEXT NULL,
  `foto_path` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`siswa_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`session_id`) REFERENCES `absensi_session`(`id`) ON DELETE CASCADE,
  INDEX `idx_absensi_siswa_siswa` (`siswa_id`),
  INDEX `idx_absensi_siswa_session` (`session_id`),
  INDEX `idx_absensi_siswa_waktu` (`waktu_absen`),
  UNIQUE `uniq_siswa_session` (`siswa_id`, `session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. TABLE: absensi_session
-- Deskripsi: Session absensi yang dibuat guru untuk kelas
-- ============================================================
CREATE TABLE IF NOT EXISTS `absensi_session` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guru_id` BIGINT UNSIGNED NOT NULL,
  `kelas_id` BIGINT UNSIGNED NOT NULL,
  `mapel_id` BIGINT UNSIGNED NOT NULL,
  `tanggal` DATE NOT NULL,
  `jam_mulai` TIME NOT NULL,
  `jam_selesai` TIME NOT NULL,
  `qr_code` VARCHAR(255) NOT NULL,
  `status` ENUM('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`guru_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`kelas_id`) REFERENCES `kelas`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`mapel_id`) REFERENCES `mapel`(`id`) ON DELETE CASCADE,
  INDEX `idx_absensi_session_guru` (`guru_id`),
  INDEX `idx_absensi_session_kelas` (`kelas_id`),
  INDEX `idx_absensi_session_tanggal` (`tanggal`),
  INDEX `idx_absensi_session_status` (`status`),
  INDEX `idx_absensi_session_qr` (`qr_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. TABLE: catatan_siswa
-- Deskripsi: Catatan guru untuk siswa di kelas tertentu
-- ============================================================
CREATE TABLE IF NOT EXISTS `catatan_siswa` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `guru_id` BIGINT UNSIGNED NOT NULL,
  `siswa_id` BIGINT UNSIGNED NOT NULL,
  `kelas_id` BIGINT UNSIGNED NOT NULL,
  `catatan` TEXT NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`guru_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`siswa_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`kelas_id`) REFERENCES `kelas`(`id`) ON DELETE CASCADE,
  INDEX `idx_catatan_siswa_guru` (`guru_id`),
  INDEX `idx_catatan_siswa_siswa` (`siswa_id`),
  INDEX `idx_catatan_siswa_kelas` (`kelas_id`),
  UNIQUE `uniq_guru_siswa_kelas` (`guru_id`, `siswa_id`, `kelas_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. TABLE: invitations
-- Deskripsi: Token invite untuk guru baru
-- ============================================================
CREATE TABLE IF NOT EXISTS `invitations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL UNIQUE,
  `role` ENUM('admin', 'guru', 'siswa') NOT NULL DEFAULT 'guru',
  `used` BOOLEAN NOT NULL DEFAULT FALSE,
  `expires_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_invitations_token` (`token`),
  INDEX `idx_invitations_email` (`email`),
  INDEX `idx_invitations_used` (`used`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. TABLE: pengumuman
-- Deskripsi: Pengumuman untuk guru/siswa
-- ============================================================
CREATE TABLE IF NOT EXISTS `pengumuman` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `target_role` ENUM('all', 'guru', 'siswa') NOT NULL DEFAULT 'all',
  `created_by` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_pengumuman_target` (`target_role`),
  INDEX `idx_pengumuman_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. VIEWS
-- ============================================================

-- View: Daftar siswa per kelas
CREATE OR REPLACE VIEW `view_siswa_per_kelas` AS
SELECT 
  k.id AS kelas_id,
  k.name AS kelas_name,
  j.name AS jurusan_name,
  u.id AS siswa_id,
  u.name AS siswa_name,
  u.email AS siswa_email,
  u.phone AS siswa_phone,
  sk.tahun_ajaran
FROM siswa_kelas sk
JOIN kelas k ON sk.kelas_id = k.id
JOIN jurusan j ON k.jurusan_id = j.id
JOIN users u ON sk.siswa_id = u.id
WHERE u.role = 'siswa';

-- View: Daftar guru mengajar per kelas
CREATE OR REPLACE VIEW `view_guru_mengajar` AS
SELECT 
  g.id AS guru_id,
  g.name AS guru_name,
  g.email AS guru_email,
  m.id AS mapel_id,
  m.name AS mapel_name,
  k.id AS kelas_id,
  k.name AS kelas_name,
  j.name AS jurusan_name
FROM guru_mapel_kelas gmk
JOIN users g ON gmk.guru_id = g.id
JOIN mapel m ON gmk.mapel_id = m.id
JOIN kelas k ON gmk.kelas_id = k.id
JOIN jurusan j ON k.jurusan_id = j.id
WHERE g.role = 'guru';

-- View: Rekap absensi siswa per session
CREATE OR REPLACE VIEW `view_rekap_absensi_siswa` AS
SELECT 
  s.id AS session_id,
  s.tanggal,
  s.jam_mulai,
  s.jam_selesai,
  g.name AS guru_name,
  k.name AS kelas_name,
  m.name AS mapel_name,
  u.id AS siswa_id,
  u.name AS siswa_name,
  asiswa.status,
  asiswa.waktu_absen,
  asiswa.keterangan_izin
FROM absensi_session s
JOIN users g ON s.guru_id = g.id
JOIN kelas k ON s.kelas_id = k.id
JOIN mapel m ON s.mapel_id = m.id
LEFT JOIN absensi_siswa asiswa ON s.id = asiswa.session_id
LEFT JOIN users u ON asiswa.siswa_id = u.id;

-- ============================================================
-- 15. STORED PROCEDURES
-- ============================================================

-- Procedure: Cek apakah guru sudah absen hari ini
DELIMITER //
CREATE PROCEDURE `sp_cek_guru_sudah_absen`(
  IN p_guru_id BIGINT,
  OUT p_sudah_absen BOOLEAN
)
BEGIN
  DECLARE total INT DEFAULT 0;
  
  SELECT COUNT(*) INTO total
  FROM absensi_guru
  WHERE guru_id = p_guru_id
    AND DATE(waktu_absen) = CURDATE();
  
  SET p_sudah_absen = total > 0;
END //
DELIMITER ;

-- Procedure: Generate QR code untuk session baru
DELIMITER //
CREATE PROCEDURE `sp_buat_session_absen`(
  IN p_guru_id BIGINT,
  IN p_kelas_id BIGINT,
  IN p_mapel_id BIGINT,
  IN p_tanggal DATE,
  IN p_jam_mulai TIME,
  IN p_jam_selesai TIME,
  OUT p_session_id BIGINT,
  OUT p_qr_code VARCHAR(255)
)
BEGIN
  -- Generate unique QR code
  SET p_qr_code = CONCAT('ABSEN-', p_guru_id, '-', p_kelas_id, '-', UNIX_TIMESTAMP());
  
  -- Insert session
  INSERT INTO absensi_session (guru_id, kelas_id, mapel_id, tanggal, jam_mulai, jam_selesai, qr_code)
  VALUES (p_guru_id, p_kelas_id, p_mapel_id, p_tanggal, p_jam_mulai, p_jam_selesai, p_qr_code);
  
  SET p_session_id = LAST_INSERT_ID();
END //
DELIMITER ;

-- ============================================================
-- 16. TRIGGERS
-- ============================================================

-- Trigger: Auto update status session setelah jam selesai
DELIMITER //
CREATE TRIGGER `trg_auto_complete_session`
BEFORE UPDATE ON `absensi_session`
FOR EACH ROW
BEGIN
  IF NEW.jam_selesai < CURTIME() AND NEW.status = 'active' THEN
    SET NEW.status = 'completed';
  END IF;
END //
DELIMITER ;

-- Trigger: Log saat siswa absen
DELIMITER //
CREATE TRIGGER `trg_log_siswa_absen`
AFTER INSERT ON `absensi_siswa`
FOR EACH ROW
BEGIN
  -- Bisa ditambahkan logging ke table terpisah jika diperlukan
  -- INSERT INTO absensi_log (siswa_id, session_id, action, created_at)
  -- VALUES (NEW.siswa_id, NEW.session_id, 'ABSEN_MASUK', NOW());
END //
DELIMITER ;

-- ============================================================
-- 17. INDEXES UNTUK PERFORMANCE
-- ============================================================

-- Composite indexes untuk query yang sering digunakan
CREATE INDEX `idx_absensi_guru_guru_tanggal` ON `absensi_guru`(`guru_id`, `tanggal`);
CREATE INDEX `idx_absensi_siswa_siswa_waktu` ON `absensi_siswa`(`siswa_id`, `waktu_absen`);
CREATE INDEX `idx_guru_mapel_kelas_all` ON `guru_mapel_kelas`(`guru_id`, `mapel_id`, `kelas_id`);
CREATE INDEX `idx_siswa_kelas_all` ON `siswa_kelas`(`siswa_id`, `kelas_id`, `tahun_ajaran`);

-- ============================================================
-- 18. SAMPLE DATA (Untuk Testing)
-- ============================================================

-- Insert sample users
INSERT INTO `users` (`name`, `email`, `password`, `role`, `phone`, `nis_nip`) VALUES
('Admin Sekolah', 'admin@mulia-buana.sch.id', '$2a$10$...', 'admin', '081234567890', 'ADM001'),
('Budi Santoso, S.Kom', 'budi.santoso@mulia-buana.sch.id', '$2a$10$...', 'guru', '081234567891', 'GRU001'),
('Siti Aminah, S.Pd', 'siti.aminah@mulia-buana.sch.id', '$2a$10$...', 'guru', '081234567892', 'GRU002'),
('Ahmad Dani', 'ahmad.dani@student.mulia-buana.sch.id', '$2a$10$...', 'siswa', '081234567893', 'SIS001'),
('Dewi Lestari', 'dewi.lestari@student.mulia-buana.sch.id', '$2a$10$...', 'siswa', '081234567894', 'SIS002');

-- Insert sample jurusan
INSERT INTO `jurusan` (`name`, `code`, `description`) VALUES
('Teknik Komputer dan Jaringan', 'TKJ', 'Mempelajari instalasi jaringan, administrasi server, dan pemrograman web'),
('Rekayasa Perangkat Lunak', 'RPL', 'Mempelajari pengembangan aplikasi desktop, web, dan mobile'),
('Akuntansi', 'AK', 'Mempelajari akuntansi keuangan, perpajakan, dan audit');

-- Insert sample kelas
INSERT INTO `kelas` (`name`, `jurusan_id`, `tingkat`) VALUES
('TKJ 1', 1, 1),
('TKJ 2', 1, 2),
('TKJ 3', 1, 3),
('RPL 1', 2, 1),
('RPL 2', 2, 2),
('RPL 3', 2, 3),
('AK 1', 3, 1),
('AK 2', 3, 2),
('AK 3', 3, 3);

-- Insert sample mapel
INSERT INTO `mapel` (`name`, `code`, `description`) VALUES
('Produktif TKJ 1', 'TKJ-PROD-1', 'Mata pelajaran produktif untuk kelas 1 TKJ'),
('Produktif TKJ 2', 'TKJ-PROD-2', 'Mata pelajaran produktif untuk kelas 2 TKJ'),
('Produktif TKJ 3', 'TKJ-PROD-3', 'Mata pelajaran produktif untuk kelas 3 TKJ'),
('Basis Data', 'RPL-DB', 'Mata pelajaran basis data untuk RPL'),
('Pemrograman Web', 'RPL-WEB', 'Mata pelajaran pemrograman web untuk RPL'),
('Akuntansi Dasar', 'AK-ADS', 'Mata pelajaran akuntansi dasar'),
('Akuntansi Keuangan', 'AK-AK', 'Mata pelajaran akuntansi keuangan');

-- Insert sample guru_mapel_kelas
INSERT INTO `guru_mapel_kelas` (`guru_id`, `mapel_id`, `kelas_id`) VALUES
(2, 1, 1), -- Budi mengajar Produktif TKJ 1 di TKJ 1
(2, 2, 2), -- Budi mengajar Produktif TKJ 2 di TKJ 2
(3, 4, 4), -- Siti mengajar Basis Data di RPL 1
(3, 5, 5); -- Siti mengajar Pemrograman Web di RPL 2

-- Insert sample siswa_kelas
INSERT INTO `siswa_kelas` (`siswa_id`, `kelas_id`, `tahun_ajaran`) VALUES
(4, 1, '2025/2026'), -- Ahmad di TKJ 1
(5, 4, '2025/2026'); -- Dewi di RPL 1

-- ============================================================
-- END OF DATABASE SCHEMA
-- ============================================================
