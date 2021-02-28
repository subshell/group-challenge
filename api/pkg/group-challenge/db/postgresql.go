package db

import (
	"fmt"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/data"
	"os"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
)

// Connect to PostgreSQL DB
func Connect(dbConfig config.DBConfig) *pg.DB {
	fmt.Fprintf(os.Stdout, "connecting to postgreSQL DB %s/%s\n", dbConfig.Host, dbConfig.Database)

	db := pg.Connect(&pg.Options{
		User:     dbConfig.User,
		Password: dbConfig.Password,
		Database: dbConfig.Database,
		Addr:     dbConfig.Host,
	})

	return db
}

// CreateSchema creates database schema for User and Story models.
func CreateSchema(db *pg.DB) error {
	models := []interface{}{
		(*data.User)(nil),
		(*data.Party)(nil),
		(*data.PartyItem)(nil),
	}

	for _, model := range models {
		err := db.Model(model).CreateTable(&orm.CreateTableOptions{
			IfNotExists: true,
		})
		if err != nil {
			return err
		}
	}
	return nil
}
