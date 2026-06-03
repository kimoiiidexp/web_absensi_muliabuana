package service

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/model"
	"WebAbsensiMuliaBuana/BackEnd/internal/repository"
)

type CatatanSiswaService struct {
	repo repository.CatatanSiswaRepo
}

func NewCatatanSiswaService(r repository.CatatanSiswaRepo) *CatatanSiswaService {
	return &CatatanSiswaService{r}
}

func (s *CatatanSiswaService) Save(guruID, siswaID, kelasID uint, catatan string) error {
	return s.repo.Save(&model.CatatanSiswa{
		GuruID:  guruID,
		SiswaID: siswaID,
		KelasID: kelasID,
		Catatan: catatan,
	})
}

func (s *CatatanSiswaService) GetByGuruAndKelas(guruID, kelasID uint) ([]repository.CatatanSiswaDetail, error) {
	return s.repo.GetByGuruAndKelas(guruID, kelasID)
}