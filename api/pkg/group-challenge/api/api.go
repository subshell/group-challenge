package api

import (
	"fmt"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/models"
	"group-challenge/pkg/group-challenge/ws"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
)

func configureAPIRouter(router *gin.Engine) {
	testParty := models.Party{
		ID:          "123",
		Name:        "test",
		Description: "desc",
		Category:    "photo",
		StartDate:   time.Now().Format(time.RFC3339),
		EndDate:     time.Now().Format(time.RFC3339),
		Items: []*models.PartyItem{
			{
				ID:       "123",
				Name:     "item name",
				ImageURL: "https://dummyimage.com/1920x1200",
			},
		},
	}

	hub := ws.NewHub()
	go hub.Run()
	go hub.LogClients()

	v1 := router.Group("/_api/v1")
	{
		party := v1.Group("/parties")
		{
			party.GET("", func(c *gin.Context) {
				c.JSON(200, []string{
					testParty.ID,
				})
			})
			party.GET("/:id", func(c *gin.Context) {
				c.JSON(200, testParty)
			})
		}

		v1.GET("/ws", func(c *gin.Context) {
			ws.ServeWs(hub, c.Writer, c.Request)
		})
	}
}

/*
RunServer Run the server
*/
func RunServer(serverConfig config.ServerConfig, conn *pg.DB) {
	// static files (frontend)
	router := gin.Default()
	router.Use(cors.Default())
	router.Use(static.Serve("/", static.LocalFile(serverConfig.StaticFilesDir, true)))

	// api and ws
	configureAPIRouter(router)

	router.Run(fmt.Sprintf(":%d", serverConfig.Port))
}
