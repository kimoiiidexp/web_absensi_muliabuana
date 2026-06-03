-- Table untuk menyimpan catatan guru terhadap siswa
CREATE TABLE IF NOT EXISTS catatan_siswa (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    guru_id BIGINT NOT NULL,
    siswa_id BIGINT NOT NULL,
    kelas_id BIGINT NOT NULL,
    catatan TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (guru_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (siswa_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (kelas_id) REFERENCES kelas(id) ON DELETE CASCADE,
    
    UNIQUE(guru_id, siswa_id, kelas_id) -- Satu guru hanya bisa punya satu catatan per siswa per kelas
);

-- Index untuk performa pencarian
CREATE INDEX idx_catatan_siswa_id ON catatan_siswa(siswa_id);
CREATE INDEX idx_catatan_guru_id ON catatan_siswa(guru_id);
CREATE INDEX idx_catatan_kelas_id ON catatan_siswa(kelas_id);