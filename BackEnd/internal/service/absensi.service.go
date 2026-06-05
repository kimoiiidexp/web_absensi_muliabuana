package service

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/model"
	"WebAbsensiMuliaBuana/BackEnd/internal/repository"
	"WebAbsensiMuliaBuana/BackEnd/internal/utils"
	"errors"
	"time"

	"github.com/google/uuid"
)

type AbsensiService struct {
	repo repository.AbsensiRepo
}

func NewAbsensiService(r repository.AbsensiRepo) *AbsensiService {
	return &AbsensiService{r}
}

// =========================
// GURU BUAT QR
// =========================
func (s *AbsensiService) CreateSession(guruID, kelasID, mapelID uint, lat, lon float64) (*model.AbsensiSession, error) {
	isAssigned, err := s.repo.IsGuruAssigned(guruID, kelasID, mapelID)
	if err != nil {
		return nil, err
	}

	if !isAssigned {
		return nil, errors.New("kelas atau mapel bukan milik guru ini")
	}

	token := uuid.NewString()

	session := &model.AbsensiSession{
		GuruID:      guruID,
		KelasID:     kelasID,
		MapelID:     mapelID,
		QRToken:     token,
		ExpiredAt:   time.Now().Add(1 * time.Minute),
		Latitude:    lat,
		Longitude:   lon,
		RadiusMeter: 100,
	}

	err = s.repo.CreateSession(session)
	return session, err
}

func (s *AbsensiService) GetSessionsByGuru(guruID uint) ([]repository.SessionDetail, error) {
	return s.repo.GetSessionsByGuru(guruID)
}

// =========================
// MURID ABSEN
// =========================
func (s *AbsensiService) AbsenSiswa(token string, siswaID uint, lat, lon float64) error {

	session, err := s.repo.FindSessionByToken(token)
	if err != nil {
		return errors.New("QR tidak valid")
	}

	// 🔥 VALIDASI EXPIRED
	if time.Now().After(session.ExpiredAt) {
		return errors.New("QR expired")
	}

	// 🔥 VALIDASI SISWA ADA DI KELAS
	isValid, err := s.repo.IsSiswaInKelas(session.KelasID, siswaID)
	if err != nil {
		return err
	}

	if !isValid {
		return errors.New("anda bukan bagian dari kelas ini")
	}

	// 🔥 CEK SUDAH ABSEN
	exists, err := s.repo.CheckAlreadyAbsen(session.ID, siswaID)
	if err != nil {
		return err
	}

	if exists {
		return errors.New("sudah absen")
	}

	// 🔥 VALIDASI GEO
	d := utils.CalculateDistance(lat, lon, session.Latitude, session.Longitude)

	if d > float64(session.RadiusMeter) {
		return errors.New("anda di luar area")
	}

	if session.IsClosed {
		return errors.New("session sudah ditutup")
	}

	// ✅ SIMPAN ABSENSI
	return s.repo.CreateAbsensi(&model.AbsensiSiswa{
		SessionID:  session.ID,
		SiswaID:    siswaID,
		WaktuAbsen: time.Now(),
		Status:     "hadir",
	})
}

// =========================
// AUTO GENERATE ALPA
// =========================
func (s *AbsensiService) GenerateAlpa(sessionID uint, userID uint) error {

	if err := s.validateGuruOwner(sessionID, userID); err != nil {
		return err
	}

	session, err := s.repo.GetSessionByID(sessionID)
	if err != nil {
		return err
	}

	// 🔥 CEK SUDAH DITUTUP
	if session.IsClosed {
		return errors.New("session sudah ditutup")
	}

	// 🔥 CEK BELUM EXPIRED
	if time.Now().Before(session.ExpiredAt) {
		return errors.New("absensi masih berlangsung")
	}

	students, err := s.repo.GetSiswaByKelas(session.KelasID)
	if err != nil {
		return err
	}

	absens, err := s.repo.GetAbsensiBySession(sessionID)
	if err != nil {
		return err
	}

	absenMap := make(map[uint]bool)
	for _, a := range absens {
		absenMap[a.SiswaID] = true
	}

	for _, student := range students {

		if !absenMap[student.SiswaID] {

			exists, err := s.repo.CheckAlreadyAbsen(sessionID, student.SiswaID)
			if err != nil {
				return err
			}

			if !exists {
				err := s.repo.CreateAbsensi(&model.AbsensiSiswa{
					SessionID:  sessionID,
					SiswaID:    student.SiswaID,
					WaktuAbsen: session.ExpiredAt,
					Status:     "alpa",
				})

				if err != nil {
					return err
				}
			}
		}
	}

	// 🔥 LOCK SESSION
	session.IsClosed = true
	return s.repo.UpdateSession(session)
}

// =========================
// LAPORAN
// =========================
func (s *AbsensiService) GetLaporan(sessionID uint, userID uint) ([]model.LaporanResponse, error) {

	if err := s.validateGuruOwner(sessionID, userID); err != nil {
		return nil, err
	}

	return s.repo.GetLaporanDetail(sessionID)
}

func (s *AbsensiService) GetRiwayatSiswa(siswaID uint) ([]repository.RiwayatSiswa, error) {
	return s.repo.GetRiwayatBySiswa(siswaID)
}

// =========================
// UPDATE STATUS (GURU ONLY)
// =========================
func (s *AbsensiService) UpdateStatus(userID uint, absensiID uint, status string) error {

	// 🔥 ambil absensi dulu
	absensi, err := s.repo.GetAbsensiByID(absensiID)
	if err != nil {
		return errors.New("data absensi tidak ditemukan")
	}

	// 🔥 ambil session
	session, err := s.repo.GetSessionByID(absensi.SessionID)
	if err != nil {
		return err
	}

	// 🔒 VALIDASI OWNER
	if session.GuruID != userID {
		return errors.New("akses ditolak (bukan session anda)")
	}

	// 🔒 LOCK CHECK
	if session.IsClosed {
		return errors.New("session sudah ditutup")
	}

	// ✅ VALIDASI STATUS
	validStatus := map[string]bool{
		"hadir": true,
		"alpa":  true,
		"izin":  true,
		"sakit": true,
	}

	if !validStatus[status] {
		return errors.New("status tidak valid")
	}

	if status == "hadir" {
		return errors.New("tidak bisa ubah ke hadir")
	}

	return s.repo.UpdateStatus(absensiID, status)
}

func (s *AbsensiService) GetSummary(sessionID uint, userID uint) (map[string]int, error) {

	if err := s.validateGuruOwner(sessionID, userID); err != nil {
		return nil, err
	}

	session, err := s.repo.GetSessionByID(sessionID)
	if err != nil {
		return nil, err
	}

	// 🔥 AUTO GENERATE (INI YANG KAMU BELUM ADA)
	if time.Now().After(session.ExpiredAt) && !session.IsClosed {
		err := s.GenerateAlpa(sessionID, userID)
		if err != nil {
			return nil, err
		}

		// reload session (karena sudah di-update)
		session, _ = s.repo.GetSessionByID(sessionID)
	}

	// total siswa
	students, err := s.repo.GetSiswaByKelas(session.KelasID)
	if err != nil {
		return nil, err
	}

	// absensi (SETELAH generate)
	absens, err := s.repo.GetAbsensiBySession(sessionID)
	if err != nil {
		return nil, err
	}

	result := map[string]int{
		"total_siswa": len(students),
		"hadir":       0,
		"alpa":        0,
		"izin":        0,
		"sakit":       0,
	}

	for _, a := range absens {
		result[a.Status]++
	}

	return result, nil
}

func (s *AbsensiService) validateGuruOwner(sessionID uint, userID uint) error {
	session, err := s.repo.GetSessionByID(sessionID)
	if err != nil {
		return err
	}

	if session.GuruID != userID {
		return errors.New("akses ditolak (bukan session anda)")
	}

	return nil
}
