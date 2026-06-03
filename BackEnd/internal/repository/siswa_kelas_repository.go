package repository

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/model"

	"gorm.io/gorm"
)

type SiswaKelasRepo interface {
	Assign(data *model.SiswaKelas) error
	GetByKelas(kelasID uint) ([]model.SiswaKelas, error)
	GetByKelasWithUser(kelasID uint) ([]SiswaWithUser, error)
}

type SiswaWithUser struct {
	SiswaID   uint
	KelasID   uint
	Name      string
	Email     string
	Phone     string
	CreatedAt string
}

type siswaKelasRepo struct {
	db *gorm.DB
}

func NewSiswaKelasRepo(db *gorm.DB) SiswaKelasRepo {
	return &siswaKelasRepo{db}
}

func (r *siswaKelasRepo) Assign(data *model.SiswaKelas) error {
	return r.db.Create(data).Error
}

func (r *siswaKelasRepo) GetByKelas(kelasID uint) ([]model.SiswaKelas, error) {
	var result []model.SiswaKelas
	err := r.db.Where("kelas_id = ?", kelasID).Find(&result).Error
	return result, err
}

func (r *siswaKelasRepo) GetByKelasWithUser(kelasID uint) ([]SiswaWithUser, error) {
	var result []SiswaWithUser
	err := r.db.Table("siswa_kelas sk").
		Select("sk.siswa_id, sk.kelas_id, u.name, u.email, u.phone, DATE(u.created_at) as created_at").
		Joins("JOIN users u ON u.id = sk.siswa_id").
		Where("sk.kelas_id = ?", kelasID).
		Order("u.name ASC").
		Scan(&result).Error
	return result, err
}