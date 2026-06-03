package model

import "time"

type CatatanSiswa struct {
	ID        uint      `gorm:"primaryKey"`
	GuruID    uint      `json:"guru_id"`
	SiswaID   uint      `json:"siswa_id"`
	KelasID   uint      `json:"kelas_id"`
	Catatan   string    `json:"catatan"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (CatatanSiswa) TableName() string {
	return "catatan_siswa"
}