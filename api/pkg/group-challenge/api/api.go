package api

import (
	"fmt"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/ws"

	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
)

func configureAPIRouter(router *gin.Engine) {
	hub := ws.NewHub()
	go hub.Run()
	go hub.LogClients()

	v1 := router.Group("/_api/v1")
	{
		party := v1.Group("/party/")
		{
			party.GET("/", func(c *gin.Context) {
				c.JSON(200, gin.H{
					"message": "pong",
				})
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
	router.Use(static.Serve("/", static.LocalFile(serverConfig.StaticFilesDir, true)))

	// api and ws
	configureAPIRouter(router)

	router.Run(fmt.Sprintf(":%d", serverConfig.Port))
}
