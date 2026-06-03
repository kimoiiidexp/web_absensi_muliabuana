package repository

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/model"
	"time"

	"gorm.io/gorm"
)

type AbsensiGuruRepo interface {
	Create(data *model.AbsensiGuru) error
	CekHariIni(guruID uint) (bool, error)
}

type absensiGuruRepo struct {
	db *gorm.DB
}

func NewAbsensiGuruRepo(db *gorm.DB) AbsensiGuruRepo {
	return &absensiGuruRepo{db}
}

func (r *absensiGuruRepo) Create(data *model.AbsensiGuru) error {
	return r.db.Create(data).Error
}

func (r *absensiGuruRepo) CekHariIni(guruID uint) (bool, error) {

	var total int64

	start := time.Now().Truncate(24 * time.Hour)
	end := start.Add(24 * time.Hour)

	err := r.db.
		Model(&model.AbsensiGuru{}).
		Where(
			"guru_id = ? AND tanggal >= ? AND tanggal < ?",
			guruID,
			start,
			end,
		).
		Count(&total).Error

	return total > 0, err
}
