package handler

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/service"

	"github.com/gofiber/fiber/v2"
)

type GuruMapelKelasHandler struct {
	service *service.GuruMapelKelasService
}

func NewGuruMapelKelasHandler(s *service.GuruMapelKelasService) *GuruMapelKelasHandler {
	return &GuruMapelKelasHandler{s}
}

// ADMIN assign
func (h *GuruMapelKelasHandler) Assign(c *fiber.Ctx) error {
	var body struct {
		GuruID  uint
		KelasID uint
		MapelID uint
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(err.Error())
	}

	err := h.service.Assign(body.GuruID, body.KelasID, body.MapelID)
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}

	return c.JSON("mapping created")
}

// GURU lihat mapping dia
func (h *GuruMapelKelasHandler) GetMy(c *fiber.Ctx) error {
	guruID := c.Locals("user_id").(uint)

	data, err := h.service.GetByGuruWithDetails(guruID)
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}

	return c.JSON(data)
}
