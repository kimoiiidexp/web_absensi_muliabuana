package handler

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/service"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

type SiswaKelasHandler struct {
	service *service.SiswaKelasService
}

func NewSiswaKelasHandler(s *service.SiswaKelasService) *SiswaKelasHandler {
	return &SiswaKelasHandler{s}
}

func (h *SiswaKelasHandler) Assign(c *fiber.Ctx) error {
	var body struct {
		SiswaID uint `json:"siswa_id"`
		KelasID uint `json:"kelas_id"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "invalid request"})
	}

	err := h.service.Assign(body.SiswaID, body.KelasID)
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}

	return c.JSON("siswa assigned")
}

// GetByKelas - Get all students in a specific class
func (h *SiswaKelasHandler) GetByKelas(c *fiber.Ctx) error {
	kelasID := c.Query("kelas_id")
	if kelasID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "kelas_id is required"})
	}

	// Convert to uint
	var kid uint
	_, err := fmt.Sscanf(kelasID, "%d", &kid)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid kelas_id"})
	}

	students, err := h.service.GetByKelas(kid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(students)
}

func (h *SiswaKelasHandler) GetMyKelas(c *fiber.Ctx) error {
	siswaID := c.Locals("user_id").(uint)
	info, err := h.service.GetKelasInfoBySiswa(siswaID)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"message": "belum terdaftar di kelas"})
	}
	return c.JSON([]interface{}{info})
}
