package repository

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/model"

	"gorm.io/gorm"
)

type CatatanSiswaRepo interface {
	Save(data *model.CatatanSiswa) error
	GetByGuruAndKelas(guruID, kelasID uint) ([]CatatanSiswaDetail, error)
}

type CatatanSiswaDetail struct {
	SiswaID   uint
	SiswaName string
	Email     string
	Phone     string
	Catatan   string
}

type catatanSiswaRepo struct {
	db *gorm.DB
}

func NewCatatanSiswaRepo(db *gorm.DB) CatatanSiswaRepo {
	return &catatanSiswaRepo{db}
}

func (r *catatanSiswaRepo) Save(data *model.CatatanSiswa) error {
	// Check if already exists
	var existing model.CatatanSiswa
	result := r.db.Where("guru_id = ? AND siswa_id = ? AND kelas_id = ?", data.GuruID, data.SiswaID, data.KelasID).First(&existing)
	
	if result.Error == nil {
		// Update existing
		existing.Catatan = data.Catatan
		return r.db.Save(&existing).Error
	}
	
	// Create new
	return r.db.Create(data).Error
}

func (r *catatanSiswaRepo) GetByGuruAndKelas(guruID, kelasID uint) ([]CatatanSiswaDetail, error) {
	var result []CatatanSiswaDetail
	err := r.db.Table("catatan_siswa cs").
		Select("u.id as siswa_id, u.name as siswa_name, u.email, u.phone, cs.catatan").
		Joins("JOIN users u ON u.id = cs.siswa_id").
		Where("cs.guru_id = ? AND cs.kelas_id = ?", guruID, kelasID).
		Scan(&result).Error
	return result, err
}