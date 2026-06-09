package handler

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/service"
	"WebAbsensiMuliaBuana/BackEnd/pkg/jwt"

	"github.com/gofiber/fiber/v2"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(s *service.AuthService) *AuthHandler {
	return &AuthHandler{s}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	type req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
		Role     string `json:"role"`
	}

	var body req
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "invalid request"})
	}
	if body.Role == "" {
		body.Role = "siswa"
	}

	err := h.service.Register(body.Name, body.Email, body.Password, body.Role)
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}

	return c.JSON("register success")
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	type req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	var body req
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"message": "invalid request"})
	}

	user, err := h.service.Login(body.Email, body.Password)
	if err != nil {
		return c.Status(401).JSON("login failed")
	}

	token, _ := jwt.GenerateToken(user.ID, user.Role)

	return c.JSON(fiber.Map{
		"token": token,
		"user":  user,
	})
}

func (h *AuthHandler) UpdatePhone(c *fiber.Ctx) error {
	type req struct {
		Phone string `json:"phone"`
	}

	var body req

	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"message": "invalid request",
		})
	}

	userID := c.Locals("user_id")
	id, ok := userID.(uint)
	if !ok {
		return c.Status(401).JSON(fiber.Map{
			"message": "invalid user id",
		})
	}

	err := h.service.UpdatePhone(id, body.Phone)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"message": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "phone updated",
	})
}

func (h *AuthHandler) GetProfile(c *fiber.Ctx) error {

	userIDInterface := c.Locals("user_id")

	if userIDInterface == nil {
		return c.Status(401).JSON(fiber.Map{
			"message": "unauthorized",
		})
	}

	userID := userIDInterface.(uint)

	user, err := h.service.GetProfile(userID)

	if err != nil {
		return c.Status(500).JSON(err.Error())
	}

	return c.JSON(user)
}
