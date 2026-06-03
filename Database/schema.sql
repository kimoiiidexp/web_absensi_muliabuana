
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','guru','siswa') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE jurusan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);


CREATE TABLE kelas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    jurusan_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (jurusan_id) REFERENCES jurusan(id)
        ON DELETE SET NULL
);


CREATE TABLE mata_pelajaran (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);


CREATE TABLE guru_mapel_kelas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    guru_id BIGINT NOT NULL,
    kelas_id BIGINT NOT NULL,
    mapel_id BIGINT NOT NULL,

    FOREIGN KEY (guru_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE,
    FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE
);

CREATE TABLE siswa_kelas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    siswa_id BIGINT NOT NULL,
    kelas_id BIGINT NOT NULL,

    FOREIGN KEY (siswa_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE,

    UNIQUE(siswa_id) -- 1 siswa hanya 1 kelas
);

CREATE TABLE absensi_session (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    guru_id BIGINT NOT NULL,
    kelas_id BIGINT NOT NULL,
    mapel_id BIGINT NOT NULL,
    qr_token VARCHAR(255) NOT NULL,
    expired_at DATETIME NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    radius_meter INT DEFAULT 50,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (guru_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE,
    FOREIGN KEY (mapel_id) REFERENCES mata_pelajaran(id) ON DELETE CASCADE,

    INDEX (qr_token)
);


CREATE TABLE absensi_siswa (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT NOT NULL,
    siswa_id BIGINT NOT NULL,
    waktu_absen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('hadir','terlambat','izin','alpa') DEFAULT 'hadir',

    FOREIGN KEY (session_id) REFERENCES absensi_session(id) ON DELETE CASCADE,
    FOREIGN KEY (siswa_id) REFERENCES users(id) ON DELETE CASCADE,

    UNIQUE(session_id, siswa_id) -- cegah double absen
);


CREATE TABLE absensi_guru (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    guru_id BIGINT NOT NULL,
    tanggal DATE NOT NULL,
    waktu_absen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    foto_path VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),

    FOREIGN KEY (guru_id) REFERENCES users(id) ON DELETE CASCADE,

    UNIQUE(guru_id, tanggal)
);