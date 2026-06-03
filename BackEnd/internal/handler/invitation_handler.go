package handler

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/service"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
)

type InvitationHandler struct {
	service *service.InvitationService
}

func NewInvitationHandler(s *service.InvitationService) *InvitationHandler {
	return &InvitationHandler{s}
}

// ADMIN INVITE
func (h *InvitationHandler) Invite(c *fiber.Ctx) error {
	type req struct {
		Email string `json:"email"`
	}

	var body req
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(err.Error())
	}

	inv, err := h.service.Invite(body.Email)
	if err != nil {
		return c.Status(500).JSON(err.Error())
	}

	frontendURL := strings.TrimRight(os.Getenv("FRONTEND_URL"), "/")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}

	link := frontendURL + "/register-guru?token=" + inv.Token

	return c.JSON(fiber.Map{
		"message": "invite berhasil",
		"link":    link,
	})
}

// VALIDATE
func (h *InvitationHandler) Validate(c *fiber.Ctx) error {
	token := c.Query("token")

	inv, err := h.service.Validate(token)
	if err != nil {
		return c.Status(400).JSON(err.Error())
	}

	return c.JSON(inv)
}

// REGISTER
func (h *InvitationHandler) Register(c *fiber.Ctx) error {
	type req struct {
		Token    string `json:"token"`
		Name     string `json:"name"`
		Password string `json:"password"`
	}

	var body req
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(err.Error())
	}

	err := h.service.Register(body.Token, body.Name, body.Password)
	if err != nil {
		return c.Status(400).JSON(err.Error())
	}

	return c.JSON("register guru berhasil")
}
