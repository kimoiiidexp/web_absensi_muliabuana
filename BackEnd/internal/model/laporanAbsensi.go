package model

import "time"

type LaporanResponse struct {
	ID         uint      `json:"id"`
	SessionID  uint      `json:"session_id"`
	SiswaID    uint      `json:"siswa_id"`
	Nama       string    `json:"nama"`
	WaktuAbsen time.Time `json:"waktu_absen"`
	Status     string    `json:"status"`
}

func (LaporanResponse) TableName() string {
	return "laporan_response"
}
