-- Sample Data untuk Testing Halaman Edit Siswa
-- Jalankan setelah Anda punya user guru dan siswa

-- 1. Insert Jurusan (jika belum ada)
INSERT INTO jurusan (name) VALUES 
('Teknik Komputer dan Jaringan'),
('Rekayasa Perangkat Lunak'),
('Akuntansi')
ON DUPLICATE KEY UPDATE name=name;

-- 2. Insert Kelas
INSERT INTO kelas (name, jurusan_id) VALUES 
('TKJ 1', 1),
('TKJ 2', 1),
('RPL 1', 2),
('RPL 2', 2),
('AK 1', 3)
ON DUPLICATE KEY UPDATE name=name;

-- 3. Insert Mata Pelajaran
INSERT INTO mata_pelajaran (name) VALUES 
('Produktif TKJ'),
('Basis Data'),
('Pemrograman Web'),
('Akuntansi Dasar'),
('Matematika')
ON DUPLICATE KEY UPDATE name=name;

-- 4. Insert beberapa siswa (jika belum ada)
-- Pastikan sudah ada user dengan role 'siswa'
-- Atau insert manual:
INSERT INTO users (name, email, password, role, phone) VALUES 
('Ahmad Dani', 'ahmad.dani@student.smk.ac.id', '$2a$10$...', 'siswa', '081234567890'),
('Budi Santoso', 'budi.santoso@student.smk.ac.id', '$2a$10$...', 'siswa', '081234567891'),
('Citra Lestari', 'citra.lestari@student.smk.ac.id', '$2a$10$...', 'siswa', '081234567892'),
('Dewi Sartika', 'dewi.sartika@student.smk.ac.id', '$2a$10$...', 'siswa', '081234567893'),
('Eko Prasetyo', 'eko.prasetyo@student.smk.ac.id', '$2a$10$...', 'siswa', '081234567894')
ON DUPLICATE KEY UPDATE name=name;

-- 5. Assign siswa ke kelas (siswa_kelas)
-- Ganti ID siswa sesuai dengan ID user yang sebenarnya
INSERT INTO siswa_kelas (siswa_id, kelas_id) VALUES 
(3, 1), -- Ahmad Dani di TKJ 1
(4, 1), -- Budi Santoso di TKJ 1
(5, 2), -- Citra Lestari di TKJ 2
(6, 3), -- Dewi Sartika di RPL 1
(7, 4)  -- Eko Prasetyo di RPL 2
ON DUPLICATE KEY UPDATE siswa_id=siswa_id;

-- 6. Assign guru ke mapel dan kelas (guru_mapel_kelas)
-- Ganti ID guru sesuai dengan ID user guru yang sebenarnya
-- Contoh: Guru ID 2 (misalnya Bu Linda) mengajar Produktif TKJ di TKJ 1
INSERT INTO guru_mapel_kelas (guru_id, kelas_id, mapel_id) VALUES 
(2, 1, 1), -- Bu Linda mengajar Produktif TKJ di TKJ 1
(2, 2, 1), -- Bu Linda mengajar Produktif TKJ di TKJ 2
(2, 3, 2)  -- Bu Linda mengajar Basis Data di RPL 1
ON DUPLICATE KEY UPDATE guru_id=guru_id;

-- 7. Insert catatan_siswa (opsional, untuk testing)
INSERT INTO catatan_siswa (guru_id, siswa_id, kelas_id, catatan) VALUES 
(2, 3, 1, 'Siswa sangat aktif dan rajin'),
(2, 4, 1, 'Perlu bimbingan tambahan di bab jaringan')
ON DUPLICATE KEY UPDATE catatan=catatan;

-- Query untuk mengecek data
SELECT 
    u.name as 'Nama Guru',
    k.name as 'Kelas',
    mp.name as 'Mata Pelajaran',
    j.name as 'Jurusan'
FROM guru_mapel_kelas gmk
JOIN users u ON u.id = gmk.guru_id
JOIN kelas k ON k.id = gmk.kelas_id
JOIN mata_pelajaran mp ON mp.id = gmk.mapel_id
JOIN jurusan j ON j.id = k.jurusan_id
WHERE gmk.guru_id = 2;

-- Query untuk melihat siswa di kelas tertentu
SELECT 
    u.name as 'Nama Siswa',
    u.email as 'Email',
    u.phone as 'Telepon',
    cs.catatan as 'Catatan'
FROM siswa_kelas sk
JOIN users u ON u.id = sk.siswa_id
LEFT JOIN catatan_siswa cs ON cs.siswa_id = u.id AND cs.kelas_id = sk.kelas_id
WHERE sk.kelas_id = 1;