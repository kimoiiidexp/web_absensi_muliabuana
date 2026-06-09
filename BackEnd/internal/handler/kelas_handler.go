package handler

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/service"

	"github.com/gofiber/fiber/v2"
)

type KelasHandler struct {
	service *service.KelasService
}

func NewKelasHandler(s *service.KelasService) *KelasHandler {
	return &KelasHandler{s}
}

func (h *KelasHandler) Create(c *fiber.Ctx) error {
	var body struct {
		Name      string `json:"name"`
		JurusanID uint   `json:"jurusan_id"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "invalid request"})
	}

	err := h.service.Create(body.Name, body.JurusanID)
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}

	return c.JSON("kelas created")
}

func (h *KelasHandler) GetAll(c *fiber.Ctx) error {
	data, _ := h.service.GetAll()
	return c.JSON(data)
}
