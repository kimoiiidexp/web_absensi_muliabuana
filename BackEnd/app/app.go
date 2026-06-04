package app

import (
	"WebAbsensiMuliaBuana/BackEnd/config"
	"WebAbsensiMuliaBuana/BackEnd/internal/handler"
	"WebAbsensiMuliaBuana/BackEnd/internal/repository"
	"WebAbsensiMuliaBuana/BackEnd/internal/routes"
	"WebAbsensiMuliaBuana/BackEnd/internal/service"
	"fmt"
	"log"
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

	fiberApp.Use(cors.New(cors.Config{
		AllowOrigins: allowOrigins,
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET,POST,PUT,DELETE,PATCH",
	}))

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
