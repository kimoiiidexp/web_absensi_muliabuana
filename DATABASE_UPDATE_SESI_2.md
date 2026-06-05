# Database Update Sesi 2 - Flow Absensi QR Dinamis

Tanggal: 6 Juni 2026

File ini berisi query update database untuk dijalankan manual lewat TablePlus.

Catatan:

- Jangan ubah file backup `Database/schema.sql`.
- Jalankan query ini pada database yang dipakai aplikasi.
- Query dibuat untuk menyelaraskan database dengan fitur yang sudah dipakai backend/frontend saat ini.

## Query Utama

```sql
START TRANSACTION;

-- 1. Kolom phone dipakai oleh fitur profile dan beberapa query daftar siswa.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS phone VARCHAR(30) NULL AFTER role;

-- 2. Tabel catatan_siswa dipakai oleh fitur catatan guru untuk siswa.
CREATE TABLE IF NOT EXISTS catatan_siswa (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  guru_id BIGINT NOT NULL,
  siswa_id BIGINT NOT NULL,
  kelas_id BIGINT NOT NULL,
  catatan TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT fk_catatan_siswa_guru
    FOREIGN KEY (guru_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_catatan_siswa_siswa
    FOREIGN KEY (siswa_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_catatan_siswa_kelas
    FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE,

  UNIQUE KEY uniq_catatan_guru_siswa_kelas (guru_id, siswa_id, kelas_id),
  INDEX idx_catatan_guru_kelas (guru_id, kelas_id)
);

-- 3. Tabel teacher_invitations dipakai oleh fitur invite/register guru.
CREATE TABLE IF NOT EXISTS teacher_invitations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  token VARCHAR(255) NOT NULL,
  expired_at DATETIME NOT NULL,
  status ENUM('pending','used','expired') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uniq_teacher_invitation_token (token),
  INDEX idx_teacher_invitation_email (email)
);

-- 4. Samakan enum status dengan backend.
-- Backend saat ini mengenal: hadir, terlambat, izin, sakit, alpa.
ALTER TABLE absensi_siswa
  MODIFY COLUMN status ENUM('hadir','terlambat','izin','sakit','alpa') NOT NULL DEFAULT 'hadir';

-- 5. Radius default disamakan dengan service backend: 100 meter.
ALTER TABLE absensi_session
  MODIFY COLUMN radius_meter INT NOT NULL DEFAULT 100;

-- 6. Pastikan token QR tidak kosong dan pencarian token cepat.
ALTER TABLE absensi_session
  MODIFY COLUMN qr_token VARCHAR(255) NOT NULL;

COMMIT;
```

## Query Cek Setelah Eksekusi

```sql
SHOW COLUMNS FROM users LIKE 'phone';
SHOW TABLES LIKE 'catatan_siswa';
SHOW TABLES LIKE 'teacher_invitations';
SHOW COLUMNS FROM absensi_siswa LIKE 'status';
SHOW COLUMNS FROM absensi_session LIKE 'radius_meter';
```

## Dampak ke Flow Absensi QR

Setelah query dijalankan:

1. Guru bisa membuat session QR di tabel `absensi_session`.
2. Token QR tetap tersimpan di kolom `qr_token`.
3. Siswa scan QR dan hasil absennya masuk ke `absensi_siswa`.
4. Status absensi bisa menampung `sakit` jika backend mengirim status itu.
5. Radius default geofencing mengikuti backend, yaitu 100 meter.

## Catatan Jika Query Gagal

Jika TablePlus atau versi MySQL tidak mendukung `ADD COLUMN IF NOT EXISTS`, jalankan versi manual berikut hanya kalau kolom `phone` memang belum ada:

```sql
ALTER TABLE users
  ADD COLUMN phone VARCHAR(30) NULL AFTER role;
```

