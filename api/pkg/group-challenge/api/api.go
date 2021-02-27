package api

import (
	"fmt"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/ws"
	"time"

	"github.com/gin-contrib/cors"
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
	ImageURL string `json:"imageURL"`
}

func configureAPIRouter(router *gin.Engine) {
	testParty := Party{
		ID:          "12345",
		Name:        "test",
		Description: "desc",
		Category:    "photo",
		StartDate:   time.Now().Format(time.RFC3339),
		EndDate:     time.Now().Format(time.RFC3339),
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
func RunServer(serverConfig config.ServerConfig) {
	// static files (frontend)
	router := gin.Default()
	router.Use(cors.Default())
	router.Use(static.Serve("/", static.LocalFile(serverConfig.StaticFilesDir, true)))

	// api and ws
	configureAPIRouter(router)

	router.Run(fmt.Sprintf(":%d", serverConfig.Port))
}
