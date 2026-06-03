package config

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func ConnectDB() *gorm.DB {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		env("DB_USER", "MYSQLUSER"),
		env("DB_PASS", "DB_PASSWORD", "MYSQLPASSWORD"),
		env("DB_HOST", "MYSQLHOST"),
		env("DB_PORT", "MYSQLPORT"),
		env("DB_NAME", "MYSQLDATABASE"),
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("DB ERROR:", err)
	}

	return db
}

func env(keys ...string) string {
	for _, key := range keys {
		if value := os.Getenv(key); value != "" {
			return value
		}
	}

	return ""
}
