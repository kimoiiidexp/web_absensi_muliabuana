package service

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/model"
	"WebAbsensiMuliaBuana/BackEnd/internal/repository"
)

type GuruMapelKelasService struct {
	repo repository.GuruMapelKelasRepo
}

func NewGuruMapelKelasService(r repository.GuruMapelKelasRepo) *GuruMapelKelasService {
	return &GuruMapelKelasService{r}
}

func (s *GuruMapelKelasService) Assign(guruID, kelasID, mapelID uint) error {
	return s.repo.Assign(&model.GuruMapelKelas{
		GuruID:  guruID,
		KelasID: kelasID,
		MapelID: mapelID,
	})
}

func (s *GuruMapelKelasService) GetByGuru(guruID uint) ([]model.GuruMapelKelas, error) {
	return s.repo.FindByGuru(guruID)
}

func (s *GuruMapelKelasService) GetByGuruWithDetails(guruID uint) ([]repository.GuruMapelKelasDetail, error) {
	return s.repo.FindByGuruWithDetails(guruID)
}

func (s *GuruMapelKelasService) GetAllAssignments() ([]repository.GuruMapelKelasAssignment, error) {
	return s.repo.FindAllWithDetails()
}
