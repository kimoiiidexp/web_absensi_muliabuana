package service

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/model"
	"WebAbsensiMuliaBuana/BackEnd/internal/repository"
	"WebAbsensiMuliaBuana/BackEnd/internal/utils"
	"errors"
	"fmt"
	"time"
)

type AbsensiGuruService struct {
	repo repository.AbsensiGuruRepo
}

func NewAbsensiGuruService(r repository.AbsensiGuruRepo) *AbsensiGuruService {
	return &AbsensiGuruService{r}
}

func (s *AbsensiGuruService) Absen(guruID uint, lat, lon float64, fotoPath string) error {

	const schoolLat = -6.34294
	const schoolLon = 106.69268
	const radius = 200

	d := utils.CalculateDistance(lat, lon, schoolLat, schoolLon)

	fmt.Println("INPUT LAT:", lat)
	fmt.Println("INPUT LON:", lon)
	fmt.Println("TARGET LAT:", schoolLat)
	fmt.Println("TARGET LON:", schoolLon)
	fmt.Println("DISTANCE:", d)

	if d > radius {
		return errors.New("anda di luar area sekolah")
	}
	sudahAbsen, err := s.repo.CekHariIni(guruID)

	if err != nil {
		return err
	}

	if sudahAbsen {
		return errors.New("anda sudah melakukan absensi hari ini")
	}

	return s.repo.Create(&model.AbsensiGuru{
		GuruID:     guruID,
		Tanggal:    time.Now(),
		WaktuAbsen: time.Now(),
		FotoPath:   fotoPath,
		Latitude:   lat,
		Longitude:  lon,
	})

}

func (s *AbsensiGuruService) CekHariIni(guruID uint) (bool, error) {
	return s.repo.CekHariIni(guruID)
}
