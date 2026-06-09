package repository

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/model"

	"gorm.io/gorm"
)

type SiswaKelasDetail struct {
	SiswaID     uint   `json:"siswa_id"`
	KelasID     uint   `json:"kelas_id"`
	SiswaName   string `json:"siswa_name"`
	SiswaEmail  string `json:"siswa_email"`
	KelasName   string `json:"kelas_name"`
	JurusanName string `json:"jurusan_name"`
}

type SiswaKelasInfo struct {
	ID          uint     `json:"id"`
	Name        string   `json:"name"`
	Jurusan     string   `json:"jurusan"`
	SiswaCount  int      `json:"siswa_count"`
	MapelList   []string `json:"mapel_list"`
	GuruList    []string `json:"guru_list"`
}

type SiswaKelasRepo interface {
	Assign(data *model.SiswaKelas) error
	AssignOrUpdate(data *model.SiswaKelas) error
	GetByKelas(kelasID uint) ([]model.SiswaKelas, error)
	GetByKelasWithUser(kelasID uint) ([]SiswaWithUser, error)
	GetKelasInfoBySiswa(siswaID uint) (*SiswaKelasInfo, error)
	FindAllWithDetails() ([]SiswaKelasDetail, error)
}

type SiswaWithUser struct {
	SiswaID   uint   `json:"siswa_id"`
	KelasID   uint   `json:"kelas_id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
	CreatedAt string `json:"created_at"`
}

type siswaKelasRepo struct {
	db *gorm.DB
}

func NewSiswaKelasRepo(db *gorm.DB) SiswaKelasRepo {
	return &siswaKelasRepo{db}
}

func (r *siswaKelasRepo) Assign(data *model.SiswaKelas) error {
	return r.AssignOrUpdate(data)
}

func (r *siswaKelasRepo) AssignOrUpdate(data *model.SiswaKelas) error {
	var existing model.SiswaKelas
	err := r.db.Where("siswa_id = ?", data.SiswaID).First(&existing).Error
	if err != nil {
		return r.db.Create(data).Error
	}
	existing.KelasID = data.KelasID
	return r.db.Save(&existing).Error
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

func (r *siswaKelasRepo) GetKelasInfoBySiswa(siswaID uint) (*SiswaKelasInfo, error) {
	var sk model.SiswaKelas
	if err := r.db.Where("siswa_id = ?", siswaID).First(&sk).Error; err != nil {
		return nil, err
	}

	var kelasName, jurusanName string
	r.db.Table("kelas k").
		Select("k.name, j.name").
		Joins("LEFT JOIN jurusan j ON j.id = k.jurusan_id").
		Where("k.id = ?", sk.KelasID).
		Row().Scan(&kelasName, &jurusanName)

	var siswaCount int64
	r.db.Model(&model.SiswaKelas{}).Where("kelas_id = ?", sk.KelasID).Count(&siswaCount)

	var mapelList []string
	r.db.Table("guru_mapel_kelas gmk").
		Select("DISTINCT mp.name").
		Joins("JOIN mata_pelajaran mp ON mp.id = gmk.mapel_id").
		Where("gmk.kelas_id = ?", sk.KelasID).
		Pluck("mp.name", &mapelList)

	var guruList []string
	r.db.Table("guru_mapel_kelas gmk").
		Select("DISTINCT u.name").
		Joins("JOIN users u ON u.id = gmk.guru_id").
		Where("gmk.kelas_id = ?", sk.KelasID).
		Pluck("u.name", &guruList)

	return &SiswaKelasInfo{
		ID:         sk.KelasID,
		Name:       kelasName,
		Jurusan:    jurusanName,
		SiswaCount: int(siswaCount),
		MapelList:  mapelList,
		GuruList:   guruList,
	}, nil
}

func (r *siswaKelasRepo) FindAllWithDetails() ([]SiswaKelasDetail, error) {
	var result []SiswaKelasDetail
	err := r.db.Table("siswa_kelas sk").
		Select("sk.siswa_id, sk.kelas_id, u.name as siswa_name, u.email as siswa_email, k.name as kelas_name, j.name as jurusan_name").
		Joins("JOIN users u ON u.id = sk.siswa_id").
		Joins("JOIN kelas k ON k.id = sk.kelas_id").
		Joins("LEFT JOIN jurusan j ON j.id = k.jurusan_id").
		Order("u.name ASC").
		Scan(&result).Error
	return result, err
}