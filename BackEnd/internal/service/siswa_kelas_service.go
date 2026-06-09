package service

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/model"
	"WebAbsensiMuliaBuana/BackEnd/internal/repository"
)

type SiswaKelasService struct {
	repo repository.SiswaKelasRepo
}

func NewSiswaKelasService(r repository.SiswaKelasRepo) *SiswaKelasService {
	return &SiswaKelasService{r}
}

func (s *SiswaKelasService) Assign(siswaID, kelasID uint) error {
	return s.repo.Assign(&model.SiswaKelas{
		SiswaID: siswaID,
		KelasID: kelasID,
	})
}

func (s *SiswaKelasService) GetByKelas(kelasID uint) ([]repository.SiswaWithUser, error) {
	return s.repo.GetByKelasWithUser(kelasID)
}

func (s *SiswaKelasService) GetKelasInfoBySiswa(siswaID uint) (*repository.SiswaKelasInfo, error) {
	return s.repo.GetKelasInfoBySiswa(siswaID)
}

func (s *SiswaKelasService) GetAllAssignments() ([]repository.SiswaKelasDetail, error) {
	return s.repo.FindAllWithDetails()
}