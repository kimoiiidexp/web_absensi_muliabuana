package repository

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/model"

	"gorm.io/gorm"
)

type AbsensiRepo interface {
	CreateSession(data *model.AbsensiSession) error
	FindSessionByToken(token string) (*model.AbsensiSession, error)
	CreateAbsensi(data *model.AbsensiSiswa) error
	CheckAlreadyAbsen(sessionID, siswaID uint) (bool, error)
	GetSessionByID(id uint) (*model.AbsensiSession, error)
	GetSiswaByKelas(kelasID uint) ([]model.SiswaKelas, error)
	GetAbsensiBySession(sessionID uint) ([]model.AbsensiSiswa, error)
	UpdateStatus(absensiID uint, status string) error
	GetSummary(sessionID uint) (map[string]int64, error)
	IsSiswaInKelas(kelasID, siswaID uint) (bool, error)
	UpdateSession(data *model.AbsensiSession) error
	GetAbsensiByID(id uint) (*model.AbsensiSiswa, error)
	GetLaporanDetail(sessionID uint) ([]model.LaporanResponse, error)
}

type absensiRepo struct {
	db *gorm.DB
}

func NewAbsensiRepo(db *gorm.DB) AbsensiRepo {
	return &absensiRepo{db}
}

func (r *absensiRepo) CreateSession(data *model.AbsensiSession) error {
	return r.db.Create(data).Error
}

func (r *absensiRepo) FindSessionByToken(token string) (*model.AbsensiSession, error) {
	var s model.AbsensiSession
	err := r.db.Where("qr_token = ?", token).First(&s).Error
	return &s, err
}

func (r *absensiRepo) CreateAbsensi(data *model.AbsensiSiswa) error {
	return r.db.Create(data).Error
}

func (r *absensiRepo) CheckAlreadyAbsen(sessionID, siswaID uint) (bool, error) {
	var count int64

	err := r.db.Model(&model.AbsensiSiswa{}).
		Where("session_id = ? AND siswa_id = ?", sessionID, siswaID).
		Count(&count).Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *absensiRepo) GetSessionByID(id uint) (*model.AbsensiSession, error) {
	var session model.AbsensiSession

	if err := r.db.First(&session, id).Error; err != nil {
		return nil, err
	}

	return &session, nil
}

func (r *absensiRepo) GetSiswaByKelas(kelasID uint) ([]model.SiswaKelas, error) {
	var data []model.SiswaKelas
	err := r.db.Where("kelas_id = ?", kelasID).Find(&data).Error
	return data, err
}

func (r *absensiRepo) GetAbsensiBySession(sessionID uint) ([]model.AbsensiSiswa, error) {
	var data []model.AbsensiSiswa

	err := r.db.
		Where("session_id = ?", sessionID).
		Order("waktu_absen ASC").
		Find(&data).Error

	return data, err
}

func (r *absensiRepo) UpdateStatus(absensiID uint, status string) error {
	return r.db.Model(&model.AbsensiSiswa{}).
		Where("id = ?", absensiID).
		Update("status", status).Error
}

func (r *absensiRepo) GetSummary(sessionID uint) (map[string]int64, error) {
	type Result struct {
		Status string
		Total  int64
	}

	var results []Result

	err := r.db.
		Model(&model.AbsensiSiswa{}).
		Select("status, COUNT(*) as total").
		Where("session_id = ?", sessionID).
		Group("status").
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	summary := map[string]int64{
		"hadir": 0,
		"alpa":  0,
		"izin":  0,
		"sakit": 0,
	}

	for _, r := range results {
		summary[r.Status] = r.Total
	}

	return summary, nil
}

func (r *absensiRepo) IsSiswaInKelas(kelasID, siswaID uint) (bool, error) {
	var count int64

	err := r.db.Model(&model.SiswaKelas{}).
		Where("kelas_id = ? AND siswa_id = ?", kelasID, siswaID).
		Count(&count).Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

func (r *absensiRepo) UpdateSession(data *model.AbsensiSession) error {
	return r.db.Save(data).Error
}

func (r *absensiRepo) GetAbsensiByID(id uint) (*model.AbsensiSiswa, error) {
	var data model.AbsensiSiswa

	err := r.db.First(&data, id).Error
	if err != nil {
		return nil, err
	}

	return &data, nil
}

func (r *absensiRepo) GetLaporanDetail(sessionID uint) ([]model.LaporanResponse, error) {

	var results []model.LaporanResponse

	err := r.db.Table("absensi_siswa").
		Select(`
			absensi_siswa.id,
			absensi_siswa.session_id,
			absensi_siswa.siswa_id,
			users.name as nama,
			absensi_siswa.waktu_absen,
			absensi_siswa.status
		`).
		Joins("JOIN users ON users.id = absensi_siswa.siswa_id").
		Where("absensi_siswa.session_id = ?", sessionID).
		Order("absensi_siswa.waktu_absen ASC").
		Scan(&results).Error

	return results, err
}
