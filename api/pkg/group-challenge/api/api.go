package api

import (
	"fmt"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/ws"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

// Party party dto
type Party struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Description string      `json:"description"`
	Category    string      `json:"category"`
	StartDate   string      `json:"startDate"`
	EndDate     string      `json:"endDate"`
	Items       []PartyItem `json:"items"`
}

// PartyItem party item dto
type PartyItem struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	ImageURL string `json:"imageUrl"`
}

func configureAPIRouter(router *gin.Engine) {
	testParty := Party{
		ID:          "12345",
		Name:        "test",
		Description: "desc",
		Category:    "photo",
		StartDate:   "date",
		EndDate:     "date",
		Items: []PartyItem{
			{
				ID:       "item-id",
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
		party := v1.Group("/parties/")
		{
			party.GET("/", func(c *gin.Context) {
				c.JSON(200, []Party{
					testParty,
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

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST,HEAD,PATCH,OPTIONS,GET,PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

/*
RunServer Run the server
*/
func RunServer(serverConfig config.ServerConfig) {
	// static files (frontend)
	router := gin.Default()
	router.Use(corsMiddleware())

	router.Use(static.Serve("/", static.LocalFile(serverConfig.StaticFilesDir, true)))

	// api and ws
	configureAPIRouter(router)

	router.Run(fmt.Sprintf(":%d", serverConfig.Port))
}
