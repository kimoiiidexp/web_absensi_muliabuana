package routes

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/handler"
	"WebAbsensiMuliaBuana/BackEnd/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(
	app *fiber.App,
	auth *handler.AuthHandler,
	jurusanHandler *handler.JurusanHandler,
	kelasHandler *handler.KelasHandler,
	siswaKelasHandler *handler.SiswaKelasHandler,
	guruMapelKelasHandler *handler.GuruMapelKelasHandler,
	mapelHandler *handler.MapelHandler,
	absensiGuruHandler *handler.AbsensiGuruHandler,
	invitationHandler *handler.InvitationHandler,
	absensiHandler *handler.AbsensiHandler,
	catatanHandler *handler.CatatanSiswaHandler,
	adminHandler *handler.AdminHandler,
) {

	// ========================
	// PUBLIC ROUTES
	// ========================
	app.Post("/register", auth.Register)
	app.Post("/login", auth.Login)
	app.Get("/invite/validate", invitationHandler.Validate)
	app.Post("/invite/register", invitationHandler.Register)

	// ========================
	// PROTECTED
	// ========================
	api := app.Group("/api", middleware.AuthMiddleware())
	api.Get("/profile", auth.GetProfile)
	api.Put("/profile/phone", auth.UpdatePhone)
	api.Patch("/profile/phone", auth.UpdatePhone)

	// ========================
	// ROLE: GURU
	// ========================
	guru := api.Group("/guru", middleware.RoleMiddleware("guru"))

	guru.Get("/mapel-kelas", guruMapelKelasHandler.GetMy)
	guru.Get("/students", siswaKelasHandler.GetByKelas)
	guru.Post("/absen", absensiGuruHandler.Absen)
	guru.Get("/cek-absen", absensiGuruHandler.CekAbsen)
	guru.Post("/create-session", absensiHandler.CreateSession)
	guru.Get("/sessions", absensiHandler.GetMySessions)
	guru.Post("/session/:id/generate-alpa", absensiHandler.GenerateAlpa)
	guru.Get("/session/:id/laporan", absensiHandler.GetLaporan)
	guru.Patch("/absensi/:id", absensiHandler.UpdateStatus)
	guru.Get("/session/:id/summary", absensiHandler.GetSummary)
	guru.Get("/rekap-absensi", absensiHandler.GetRekapGuru)
	guru.Post("/catatan", catatanHandler.SaveCatatan)
	guru.Get("/catatan", catatanHandler.GetCatatan)

	// ========================
	// ROLE: ADMIN
	// ========================
	admin := api.Group("/admin", middleware.RoleMiddleware("admin"))

	admin.Get("/dashboard", adminHandler.GetDashboard)
	admin.Get("/users", adminHandler.GetUsers)
	admin.Post("/users", adminHandler.CreateUser)
	admin.Post("/jurusan", jurusanHandler.Create)
	admin.Get("/jurusan", jurusanHandler.GetAll)
	admin.Post("/kelas", kelasHandler.Create)
	admin.Get("/kelas", kelasHandler.GetAll)
	admin.Post("/mapel", mapelHandler.Create)
	admin.Get("/mapel", mapelHandler.GetAll)
	admin.Post("/assign-siswa", siswaKelasHandler.Assign)
	admin.Post("/assign-guru", guruMapelKelasHandler.Assign)
	admin.Get("/assignments/siswa", adminHandler.GetSiswaKelasAssignments)
	admin.Get("/assignments/guru", adminHandler.GetGuruAssignments)
	admin.Post("/invite-guru", invitationHandler.Invite)
	admin.Get("/sessions", adminHandler.GetSessions)
	admin.Get("/rekap/:kelas_id", adminHandler.GetRekapByKelas)

	// ========================
	// ROLE: SISWA
	// ========================
	siswa := api.Group("/siswa", middleware.RoleMiddleware("siswa"))
	siswa.Post("/absen", absensiHandler.Absen)
	siswa.Get("/riwayat", absensiHandler.GetRiwayatSiswa)
	siswa.Get("/kelas", siswaKelasHandler.GetMyKelas)
}
