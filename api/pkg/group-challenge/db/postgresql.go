package db

import (
	"fmt"
	"group-challenge/pkg/group-challenge/config"
	"log"
	"os"

	"github.com/go-pg/pg/v10"
)

// Connect to PostgreSQL DB
func Connect(dbConfig config.DBConfig) {
	db := pg.Connect(&pg.Options{
		User:     dbConfig.User,
		Password: dbConfig.Password,
		Database: dbConfig.Database,
		Addr:     dbConfig.Addr,
	})
	defer db.Close()

	var n int
	_, err := db.QueryOne(pg.Scan(&n), "SELECT 1")

	if err != nil {
		log.Panic(err)
		os.Exit(1)
	}

	fmt.Println(n)
}
