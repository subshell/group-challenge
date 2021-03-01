package db

import (
	"fmt"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/models"
	"os"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
)

// Connect to PostgreSQL DB
func Connect(dbConfig config.DBConfig) (con *pg.DB) {
	fmt.Fprintf(os.Stdout, "connecting to postgreSQL DB %s/%s\n", dbConfig.Host, dbConfig.Database)

	con = pg.Connect(&pg.Options{
		User:       dbConfig.User,
		Password:   dbConfig.Password,
		Database:   dbConfig.Database,
		Addr:       dbConfig.Host,
		PoolSize:   dbConfig.PoolSize,
		MaxRetries: 5,
	})

	// check connection
	if err := con.Ping(con.Context()); err != nil {
		panic("cannot connect to postgres")
	}

	return
}

// CreateSchema creates database schema all modeles if they don't exist
func CreateSchema(db *pg.DB) error {
	models := []interface{}{
		(*models.User)(nil),
		(*models.Party)(nil),
		(*models.PartyItem)(nil),
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
