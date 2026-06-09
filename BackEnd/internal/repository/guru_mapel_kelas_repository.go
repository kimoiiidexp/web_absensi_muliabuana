package repository

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/model"

	"gorm.io/gorm"
)

type GuruMapelKelasAssignment struct {
	ID          uint   `json:"id"`
	GuruID      uint   `json:"guru_id"`
	GuruName    string `json:"guru_name"`
	KelasID     uint   `json:"kelas_id"`
	KelasName   string `json:"kelas_name"`
	JurusanName string `json:"jurusan_name"`
	MapelID     uint   `json:"mapel_id"`
	MapelName   string `json:"mapel_name"`
}

type GuruMapelKelasRepo interface {
	Assign(data *model.GuruMapelKelas) error
	FindByGuru(guruID uint) ([]model.GuruMapelKelas, error)
	FindByGuruWithDetails(guruID uint) ([]GuruMapelKelasDetail, error)
	FindAllWithDetails() ([]GuruMapelKelasAssignment, error)
}

type GuruMapelKelasDetail struct {
	ID          uint   `json:"id"`
	GuruID      uint   `json:"guru_id"`
	KelasID     uint   `json:"kelas_id"`
	MapelID     uint   `json:"mapel_id"`
	KelasName   string `json:"kelas_name"`
	JurusanID   uint   `json:"jurusan_id"`
	JurusanName string `json:"jurusan_name"`
	MapelName   string `json:"mapel_name"`
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

func (r *guruMapelKelasRepo) FindAllWithDetails() ([]GuruMapelKelasAssignment, error) {
	var result []GuruMapelKelasAssignment
	err := r.db.Table("guru_mapel_kelas gmk").
		Select("gmk.id, gmk.guru_id, u.name as guru_name, gmk.kelas_id, k.name as kelas_name, j.name as jurusan_name, gmk.mapel_id, mp.name as mapel_name").
		Joins("JOIN users u ON u.id = gmk.guru_id").
		Joins("JOIN kelas k ON k.id = gmk.kelas_id").
		Joins("LEFT JOIN jurusan j ON j.id = k.jurusan_id").
		Joins("JOIN mata_pelajaran mp ON mp.id = gmk.mapel_id").
		Order("u.name ASC, k.name ASC").
		Scan(&result).Error
	return result, err
}