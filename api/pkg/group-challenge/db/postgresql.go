package db

import (
	"context"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/models"
	"log"

	"github.com/go-pg/pg/v10"
	"github.com/go-pg/pg/v10/orm"
)

// Connect to PostgreSQL DB
func Connect(dbConfig config.DBConfig) (con *pg.DB) {
	log.Printf("[INFO] connecting to postgreSQL DB %s/%s\n", dbConfig.Host, dbConfig.Database)

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
		log.Panicln("cannot connect to postgres {}", err)
	}

	var version string
	_, err := con.QueryOneContext(ctx, pg.Scan(&version), "SELECT version()")
	if err != nil {
		panic(err)
	}
	log.Println("[INFO]", version)

	if dbConfig.LogQueries {
		con.AddQueryHook(dbLogger{})
	}

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
		(*models.Image)(nil),
		(*models.PartiesSubmissionsRelation)(nil),
		(*models.Vote)(nil),
		(*models.PartySubmission)(nil),
		(*models.Party)(nil),
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
