package db

import (
	"context"
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

	ctx := context.Background()

	// check connection
	if err := con.Ping(ctx); err != nil {
		panic("cannot connect to postgres")
	}

	var version string
	_, err := con.QueryOneContext(ctx, pg.Scan(&version), "SELECT version()")
	if err != nil {
		panic(err)
	}
	fmt.Println(version)

	con.AddQueryHook(dbLogger{})

	return
}

// InitDB initializes the db
func InitDB(con *pg.DB) error {
	return createSchema(con)
}

// createSchema creates database schema all modeles if they don't exist
func createSchema(db *pg.DB) error {
	models := []interface{}{
		(*models.User)(nil),
		(*models.Session)(nil),
		(*models.Room)(nil),
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
