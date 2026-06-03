package handler

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/service"
	"fmt"

	"github.com/gofiber/fiber/v2"
)

type CatatanSiswaHandler struct {
	service *service.CatatanSiswaService
}

func NewCatatanSiswaHandler(s *service.CatatanSiswaService) *CatatanSiswaHandler {
	return &CatatanSiswaHandler{s}
}

// SaveCatatan - Save or update catatan for a student
func (h *CatatanSiswaHandler) SaveCatatan(c *fiber.Ctx) error {
	guruID := c.Locals("user_id").(uint)
	
	var body struct {
		SiswaID uint   `json:"siswa_id"`
		KelasID uint   `json:"kelas_id"`
		Catatan string `json:"catatan"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}

	err := h.service.Save(guruID, body.SiswaID, body.KelasID, body.Catatan)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(fiber.Map{"message": "Catatan berhasil disimpan"})
}

// GetCatatan - Get all catatan for a specific class
func (h *CatatanSiswaHandler) GetCatatan(c *fiber.Ctx) error {
	guruID := c.Locals("user_id").(uint)
	kelasID := c.Query("kelas_id")
	
	if kelasID == "" {
		return c.Status(400).JSON(fiber.Map{"error": "kelas_id is required"})
	}

	var kid uint
	_, err := fmt.Sscanf(kelasID, "%d", &kid)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid kelas_id"})
	}

	data, err := h.service.GetByGuruAndKelas(guruID, kid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}

	return c.JSON(data)
}