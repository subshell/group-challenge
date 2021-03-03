package api

import (
	"fmt"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/models"
	"group-challenge/pkg/group-challenge/ws"
	"path"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

// API Handler
////////

func createTestHandler(con *pg.DB) func(*gin.Context) {
	user := &models.User{
		Username: "tom",
	}

	return func(c *gin.Context) {
		err := user.Insert(con)

		if err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(200, user)
	}
}

func createPartiesHandler(con *pg.DB) func(*gin.Context) {
	return func(c *gin.Context) {
		c.JSON(200, []uuid.UUID{})
	}
}

func createPartyByIDHandler(con *pg.DB) func(*gin.Context) {
	return func(c *gin.Context) {
		c.JSON(200, models.Party{})
	}
}

func createWsHandler() func(*gin.Context) {
	hub := ws.NewHub()
	go hub.Run()
	go hub.LogClients()

	return func(c *gin.Context) {
		ws.ServeWs(hub, c.Writer, c.Request)
	}
}

// API Configuration
////////

func configureAPIRouter(router *gin.Engine, con *pg.DB) {
	v1 := router.Group("/_api/v1")
	{
		v1.GET("test", createTestHandler(con))

		party := v1.Group("/parties")
		{
			party.GET("", createPartiesHandler(con))
			party.GET(":id", createPartyByIDHandler(con))
		}

		v1.GET("ws", createWsHandler())
	}
}

/*
RunServer Run the server
*/
func RunServer(serverConfig config.ServerConfig, con *pg.DB) {
	// static files (frontend)
	router := gin.Default()
	router.Use(cors.Default())

	// static files
	router.Use(static.Serve("/", static.LocalFile(serverConfig.StaticFilesDir, true)))
	router.NoRoute(func(c *gin.Context) {
		c.File(path.Join(serverConfig.StaticFilesDir, "index.html"))
	})

	// api and ws
	configureAPIRouter(router, con)

	router.Run(fmt.Sprintf(":%d", serverConfig.Port))
}
