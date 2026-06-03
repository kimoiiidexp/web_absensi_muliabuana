package handler

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/service"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type AbsensiHandler struct {
	service *service.AbsensiService
}

func NewAbsensiHandler(s *service.AbsensiService) *AbsensiHandler {
	return &AbsensiHandler{s}
}

// =========================
// GURU BUAT QR
// =========================
func (h *AbsensiHandler) CreateSession(c *fiber.Ctx) error {

	type req struct {
		KelasID   uint    `json:"kelas_id"`
		MapelID   uint    `json:"mapel_id"`
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
	}

	var body req
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(err.Error())
	}

	guruID := c.Locals("user_id").(uint)

	session, err := h.service.CreateSession(guruID, body.KelasID, body.MapelID, body.Latitude, body.Longitude)
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}

	return c.JSON(session)
}

// =========================
// MURID ABSEN
// =========================
func (h *AbsensiHandler) Absen(c *fiber.Ctx) error {

	type req struct {
		Token     string  `json:"token"`
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
	}

	var body req
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(err.Error())
	}

	siswaID := c.Locals("user_id").(uint)

	err := h.service.AbsenSiswa(body.Token, siswaID, body.Latitude, body.Longitude)
	if err != nil {
		return c.Status(400).JSON(err.Error())
	}

	return c.JSON("absen berhasil")
}

func (h *AbsensiHandler) GenerateAlpa(c *fiber.Ctx) error {

	sessionID, _ := strconv.Atoi(c.Params("id"))

	userID := c.Locals("user_id").(uint) // 🔥 ambil dari JWT

	err := h.service.GenerateAlpa(uint(sessionID), userID)
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}

	return c.JSON("alpa generated")
}

func (h *AbsensiHandler) GetLaporan(c *fiber.Ctx) error {

	sessionID, _ := strconv.Atoi(c.Params("id"))

	userID := c.Locals("user_id").(uint)
	data, err := h.service.GetLaporan(uint(sessionID), userID)

	if err != nil {
		return c.Status(500).JSON(err.Error())
	}

	return c.JSON(data)
}

func (h *AbsensiHandler) UpdateStatus(c *fiber.Ctx) error {

	idParam := c.Params("id")

	var absensiID uint
	fmt.Sscanf(idParam, "%d", &absensiID)

	type req struct {
		Status string `json:"status"`
	}

	var body req
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(err.Error())
	}

	// 🔥 AMBIL ROLE DARI JWT
	userID := c.Locals("user_id").(uint)

	err := h.service.UpdateStatus(userID, absensiID, body.Status)

	if err != nil {
		return c.Status(400).JSON(err.Error())
	}

	return c.JSON("status berhasil diupdate")
}

func (h *AbsensiHandler) GetSummary(c *fiber.Ctx) error {

	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(400).JSON("invalid id")
	}

	userID := c.Locals("user_id").(uint)

	data, err := h.service.GetSummary(uint(id), userID)
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}

	return c.JSON(data)
}
