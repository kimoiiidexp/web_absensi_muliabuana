package repository

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/model"

	"gorm.io/gorm"
)

type GuruMapelKelasRepo interface {
	Assign(data *model.GuruMapelKelas) error
	FindByGuru(guruID uint) ([]model.GuruMapelKelas, error)
	FindByGuruWithDetails(guruID uint) ([]GuruMapelKelasDetail, error)
}

type GuruMapelKelasDetail struct {
	ID           uint
	GuruID       uint
	KelasID      uint
	MapelID      uint
	KelasName    string
	JurusanID    uint
	JurusanName  string
	MapelName    string
}

type guruMapelKelasRepo struct {
	db *gorm.DB
}

func NewGuruMapelKelasRepo(db *gorm.DB) GuruMapelKelasRepo {
	return &guruMapelKelasRepo{db}
}

func (r *guruMapelKelasRepo) Assign(data *model.GuruMapelKelas) error {
	return r.db.Create(data).Error
}

func (r *guruMapelKelasRepo) FindByGuru(guruID uint) ([]model.GuruMapelKelas, error) {
	var result []model.GuruMapelKelas
	err := r.db.Where("guru_id = ?", guruID).Find(&result).Error
	return result, err
}

func (r *guruMapelKelasRepo) FindByGuruWithDetails(guruID uint) ([]GuruMapelKelasDetail, error) {
	var result []GuruMapelKelasDetail
	err := r.db.Table("guru_mapel_kelas gmk").
		Select("gmk.id, gmk.guru_id, gmk.kelas_id, gmk.mapel_id, k.name as kelas_name, k.jurusan_id, j.name as jurusan_name, mp.name as mapel_name").
		Joins("JOIN kelas k ON k.id = gmk.kelas_id").
		Joins("JOIN jurusan j ON j.id = k.jurusan_id").
		Joins("JOIN mata_pelajaran mp ON mp.id = gmk.mapel_id").
		Where("gmk.guru_id = ?", guruID).
		Scan(&result).Error
	return result, err
}