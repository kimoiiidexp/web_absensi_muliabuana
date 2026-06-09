package handler

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/service"

	"github.com/gofiber/fiber/v2"
)

type MapelHandler struct {
	service *service.MapelService
}

func NewMapelHandler(s *service.MapelService) *MapelHandler {
	return &MapelHandler{s}
}

func (h *MapelHandler) Create(c *fiber.Ctx) error {
	var body struct {
		Name string `json:"name"`
	}

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(err.Error())
	}

	err := h.service.Create(body.Name)
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}

	return c.JSON("mapel created")
}

func (h *MapelHandler) GetAll(c *fiber.Ctx) error {
	data, err := h.service.GetAll()
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}

	return c.JSON(data)
}
