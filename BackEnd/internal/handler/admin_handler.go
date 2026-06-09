package handler

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/service"

	"github.com/gofiber/fiber/v2"
)

type AdminHandler struct {
	authService        *service.AuthService
	siswaKelasService  *service.SiswaKelasService
	guruMapelService   *service.GuruMapelKelasService
	absensiService     *service.AbsensiService
}

func NewAdminHandler(
	auth *service.AuthService,
	siswaKelas *service.SiswaKelasService,
	guruMapel *service.GuruMapelKelasService,
	absensi *service.AbsensiService,
) *AdminHandler {
	return &AdminHandler{
		authService:       auth,
		siswaKelasService: siswaKelas,
		guruMapelService:  guruMapel,
		absensiService:    absensi,
	}
}

func (h *AdminHandler) GetUsers(c *fiber.Ctx) error {
	role := c.Query("role", "")
	users, err := h.authService.GetUsersByRole(role)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": err.Error()})
	}
	return c.JSON(users)
}

func (h *AdminHandler) CreateUser(c *fiber.Ctx) error {
	var body struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "invalid request"})
	}
	if body.Role != "siswa" && body.Role != "guru" {
		return c.Status(400).JSON(fiber.Map{"message": "role harus siswa atau guru"})
	}
	if err := h.authService.Register(body.Name, body.Email, body.Password, body.Role); err != nil {
		return c.Status(500).JSON(fiber.Map{"message": err.Error()})
	}
	return c.JSON(fiber.Map{"message": "user created"})
}

func (h *AdminHandler) GetSiswaKelasAssignments(c *fiber.Ctx) error {
	data, err := h.siswaKelasService.GetAllAssignments()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": err.Error()})
	}
	return c.JSON(data)
}

func (h *AdminHandler) GetGuruAssignments(c *fiber.Ctx) error {
	data, err := h.guruMapelService.GetAllAssignments()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": err.Error()})
	}
	return c.JSON(data)
}

func (h *AdminHandler) GetSessions(c *fiber.Ctx) error {
	data, err := h.absensiService.GetAllSessions()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": err.Error()})
	}
	return c.JSON(data)
}

func (h *AdminHandler) GetDashboard(c *fiber.Ctx) error {
	data, err := h.absensiService.GetDashboardStats()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": err.Error()})
	}
	return c.JSON(data)
}

func (h *AdminHandler) GetRekapByKelas(c *fiber.Ctx) error {
	kelasID, err := c.ParamsInt("kelas_id")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "invalid kelas_id"})
	}
	data, err := h.absensiService.GetRekapByKelas(uint(kelasID))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"message": err.Error()})
	}
	return c.JSON(data)
}
