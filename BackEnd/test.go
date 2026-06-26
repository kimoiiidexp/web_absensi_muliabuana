package main

import (
	"database/sql"
	"fmt"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	db, err := sql.Open(
		"mysql",
		"root:akbarfarel802@tcp(localhost:3306)/absensimb_db",
	)
	if err != nil {
		panic(err)
	}

	err = db.Ping()
	fmt.Printf("PING ERROR: %v\n", err)
}
