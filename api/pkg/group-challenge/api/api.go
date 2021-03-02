package api

import (
	"fmt"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/models"
	"group-challenge/pkg/group-challenge/ws"
	"math/rand"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

func configureAPIRouter(router *gin.Engine, con *pg.DB) {
	testParty := models.Party{
		ID:          uuid.UUID{},
		Name:        "test",
		Description: "desc",
		Category:    "photo",
		StartDate:   time.Now().Format(time.RFC3339),
		EndDate:     time.Now().Format(time.RFC3339),
		Items: []*models.PartyItem{
			{
				ID:       uuid.UUID{},
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

		v1.GET("test", func(c *gin.Context) {
			user := &models.User{
				Username: fmt.Sprintf("%v", rand.Int()),
			}

			err := user.Insert(con)

			if err != nil {
				c.JSON(400, gin.H{
					"error": err.Error(),
				})
				return
			}

			c.JSON(200, user)
		})

		party := v1.Group("/parties")
		{
			party.GET("", func(c *gin.Context) {
				c.JSON(200, []uuid.UUID{
					testParty.ID,
				})
			})
			party.GET(":id", func(c *gin.Context) {
				c.JSON(200, testParty)
			})
		}

		v1.GET("ws", func(c *gin.Context) {
			ws.ServeWs(hub, c.Writer, c.Request)
		})
	}
}

/*
RunServer Run the server
*/
func RunServer(serverConfig config.ServerConfig, con *pg.DB) {
	// static files (frontend)
	router := gin.Default()
	router.Use(cors.Default())
	router.Use(static.Serve("/", static.LocalFile(serverConfig.StaticFilesDir, true)))

	// api and ws
	configureAPIRouter(router, con)

	router.Run(fmt.Sprintf(":%d", serverConfig.Port))
}
