package handler

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/service"
	"fmt"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type AbsensiGuruHandler struct {
	service *service.AbsensiGuruService
}

func NewAbsensiGuruHandler(s *service.AbsensiGuruService) *AbsensiGuruHandler {
	return &AbsensiGuruHandler{s}
}

func (h *AbsensiGuruHandler) Absen(c *fiber.Ctx) error {

	guruID := c.Locals("user_id").(uint)

	latStr := c.FormValue("latitude")
	lonStr := c.FormValue("longitude")

	lat, _ := strconv.ParseFloat(latStr, 64)
	lon, _ := strconv.ParseFloat(lonStr, 64)

	fmt.Println("RAW LAT:", latStr)
	fmt.Println("RAW LON:", lonStr)
	fmt.Println("PARSED LAT:", lat)
	fmt.Println("PARSED LON:", lon)

	file, err := c.FormFile("foto")
	if err != nil {
		return c.Status(400).JSON("foto wajib")
	}

	path := "./uploads/" + file.Filename

	if err := c.SaveFile(file, path); err != nil {
		return c.Status(500).JSON(err.Error())
	}

	err = h.service.Absen(guruID, lat, lon, path)
	if err != nil {
		return c.Status(403).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "absen guru berhasil",
	})
}

func (h *AbsensiGuruHandler) CekAbsen(c *fiber.Ctx) error {

	guruID := c.Locals("user_id").(uint)

	sudah, err := h.service.CekHariIni(guruID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": "server error",
		})
	}

	return c.JSON(fiber.Map{
		"sudah_absen": sudah,
	})
}
