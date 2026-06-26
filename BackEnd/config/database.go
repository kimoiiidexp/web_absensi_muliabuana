package config

import (
	"fmt"
	"log"
	"net/url"
	"os"
	"strings"
	"time"

	driver "github.com/go-sql-driver/mysql"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

func ConnectDB() *gorm.DB {
	dsn, err := buildDSN()
	if err != nil {
		log.Fatal("DB CONFIG ERROR: ", err)
	}

	var db *gorm.DB
	for attempt := 1; attempt <= 10; attempt++ {
		db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
		if err == nil {
			sqlDB, dbErr := db.DB()
			if dbErr == nil {
				dbErr = sqlDB.Ping()
			}
			if dbErr == nil {
				log.Println("Database connected")
				return db
			}
			err = dbErr
		}

		log.Printf("Database belum siap, percobaan %d/10: %v", attempt, err)
		time.Sleep(3 * time.Second)
	}

	log.Fatal("DB ERROR setelah retry: ", err)
	return nil
}

func buildDSN() (string, error) {
	if databaseURL := env("MYSQL_URL", "DATABASE_URL"); databaseURL != "" {
		return dsnFromURL(databaseURL)
	}

	user := env("DB_USER", "MYSQLUSER")
	password := env("DB_PASS", "DB_PASSWORD", "MYSQLPASSWORD")
	host := env("DB_HOST", "MYSQLHOST")
	port := env("DB_PORT", "MYSQLPORT")
	name := env("DB_NAME", "MYSQLDATABASE")

	missing := missingEnv([]envValue{
		{name: "DB_USER atau MYSQLUSER", value: user},
		{name: "DB_PASS atau MYSQLPASSWORD", value: password},
		{name: "DB_HOST atau MYSQLHOST", value: host},
		{name: "DB_PORT atau MYSQLPORT", value: port},
		{name: "DB_NAME atau MYSQLDATABASE", value: name},
	})
	if len(missing) == 5 {
		return "", fmt.Errorf("variable database belum diisi. Isi MYSQL_URL/DATABASE_URL, atau isi %s", strings.Join(missing[:5], ", "))
	}
	if len(missing) > 0 {
		return "", fmt.Errorf("variable database kurang: %s", strings.Join(missing, ", "))
	}

	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?parseTime=true",
		user,
		password,
		host,
		port,
		name,
	)

	fmt.Println("DSN =", dsn)

	return dsn, nil

}

func dsnFromURL(databaseURL string) (string, error) {
	parsedURL, err := url.Parse(databaseURL)
	if err != nil {
		return "", fmt.Errorf("format MYSQL_URL/DATABASE_URL tidak valid: %w", err)
	}

	password, _ := parsedURL.User.Password()
	dbName := strings.TrimPrefix(parsedURL.Path, "/")
	if parsedURL.User.Username() == "" || parsedURL.Host == "" || dbName == "" {
		return "", fmt.Errorf("MYSQL_URL/DATABASE_URL harus berisi user, host, port, dan nama database")
	}

	return (&driver.Config{
		User:      parsedURL.User.Username(),
		Passwd:    password,
		Net:       "tcp",
		Addr:      parsedURL.Host,
		DBName:    dbName,
		ParseTime: true,
		Loc:       time.Local,
		Params: map[string]string{
			"charset": "utf8mb4",
		},
	}).FormatDSN(), nil
}

type envValue struct {
	name  string
	value string
}

func missingEnv(values []envValue) []string {
	missing := make([]string, 0)
	for _, item := range values {
		if item.value == "" {
			missing = append(missing, item.name)
		}
	}

	return missing
}

func env(keys ...string) string {
	for _, key := range keys {
		if value := os.Getenv(key); value != "" {
			return value
		}
	}

	return ""
}
