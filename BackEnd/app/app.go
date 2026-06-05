package app

import (
	"WebAbsensiMuliaBuana/BackEnd/config"
	"WebAbsensiMuliaBuana/BackEnd/internal/handler"
	"WebAbsensiMuliaBuana/BackEnd/internal/repository"
	"WebAbsensiMuliaBuana/BackEnd/internal/routes"
	"WebAbsensiMuliaBuana/BackEnd/internal/service"
	"fmt"
	"log"
	"net/url"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func Run() {
	if err := godotenv.Load(); err != nil {
		log.Println(".env tidak ditemukan, lanjut memakai environment hosting")
	}

	fmt.Println("DB_HOST:", os.Getenv("DB_HOST"))

	fiberApp := fiber.New()

	allowOrigins := os.Getenv("CORS_ALLOW_ORIGINS")
	if strings.TrimSpace(allowOrigins) == "" {
		allowOrigins = "http://localhost:3000"
	}
	allowOrigins = normalizeOrigins(allowOrigins)

	fiberApp.Use(cors.New(cors.Config{
		AllowOrigins: allowOrigins,
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,PUT,DELETE,PATCH",
	}))

	fiberApp.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"service": "web_absensi_muliabuana API",
			"status":  "ok",
			"health":  "/health",
		})
	})

	fiberApp.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	db := config.ConnectDB()

	userRepo := repository.NewUserRepository(db)
	authService := service.NewAuthService(userRepo)
	authHandler := handler.NewAuthHandler(authService)

	jurusanRepo := repository.NewJurusanRepo(db)
	jurusanService := service.NewJurusanService(jurusanRepo)
	jurusanHandler := handler.NewJurusanHandler(jurusanService)

	kelasRepo := repository.NewKelasRepo(db)
	kelasService := service.NewKelasService(kelasRepo)
	kelasHandler := handler.NewKelasHandler(kelasService)

	mapelRepo := repository.NewMapelRepo(db)
	mapelService := service.NewMapelService(mapelRepo)
	mapelHandler := handler.NewMapelHandler(mapelService)

	siswaKelasRepo := repository.NewSiswaKelasRepo(db)
	siswaKelasService := service.NewSiswaKelasService(siswaKelasRepo)
	siswaKelasHandler := handler.NewSiswaKelasHandler(siswaKelasService)

	guruMapelKelasRepo := repository.NewGuruMapelKelasRepo(db)
	guruMapelKelasService := service.NewGuruMapelKelasService(guruMapelKelasRepo)
	guruMapelKelasHandler := handler.NewGuruMapelKelasHandler(guruMapelKelasService)

	absensiGuruRepo := repository.NewAbsensiGuruRepo(db)
	absensiGuruService := service.NewAbsensiGuruService(absensiGuruRepo)
	absensiGuruHandler := handler.NewAbsensiGuruHandler(absensiGuruService)

	invRepo := repository.NewInvitationRepo(db)
	invService := service.NewInvitationService(invRepo, userRepo)
	invHandler := handler.NewInvitationHandler(invService)

	absensiRepo := repository.NewAbsensiRepo(db)
	absensiService := service.NewAbsensiService(absensiRepo)
	absensiHandler := handler.NewAbsensiHandler(absensiService)

	catatanRepo := repository.NewCatatanSiswaRepo(db)
	catatanService := service.NewCatatanSiswaService(catatanRepo)
	catatanHandler := handler.NewCatatanSiswaHandler(catatanService)

	routes.SetupRoutes(
		fiberApp,
		authHandler,
		jurusanHandler,
		kelasHandler,
		siswaKelasHandler,
		guruMapelKelasHandler,
		mapelHandler,
		absensiGuruHandler,
		invHandler,
		absensiHandler,
		catatanHandler,
	)

	port := os.Getenv("PORT")
	if strings.TrimSpace(port) == "" {
		port = "8080"
	}

	log.Fatal(fiberApp.Listen(":" + port))
}

func normalizeOrigins(origins string) string {
	parts := strings.Split(origins, ",")
	normalized := make([]string, 0, len(parts))

	for _, origin := range parts {
		origin = strings.TrimSpace(origin)
		if origin == "" {
			continue
		}
		if origin == "*" {
			normalized = append(normalized, origin)
			continue
		}
		if !strings.Contains(origin, "://") {
			origin = "https://" + origin
		}
		parsedOrigin, err := url.Parse(origin)
		if err != nil || parsedOrigin.Scheme == "" || parsedOrigin.Host == "" {
			log.Printf("CORS origin dilewati karena format tidak valid: %s", origin)
			continue
		}

		normalized = append(normalized, parsedOrigin.Scheme+"://"+parsedOrigin.Host)
	}

	if len(normalized) == 0 {
		return "http://localhost:3000"
	}

	return strings.Join(normalized, ",")
}
