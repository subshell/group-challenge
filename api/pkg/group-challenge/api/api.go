package api

import (
	"fmt"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/ws"

	"github.com/gin-gonic/gin"
)

func configureAPIRouter(router *gin.Engine) {
	v1 := router.Group("/api/v1")
	{
		auth := v1.Group("/party/")
		{
			auth.GET("/", func(c *gin.Context) {
				c.JSON(200, gin.H{
					"message": "pong",
				})
			})
		}
	}
}

/*
RunServer Run the server
*/
func RunServer(serverConfig config.ServerConfig) {
	// static files (frontend)
	router := gin.Default()
	router.Static("/static", serverConfig.StaticFilesDir)

	// api
	configureAPIRouter(router)

	// ws
	hub := ws.NewHub()
	go hub.Run()
	go hub.LogClients()

	router.GET("/ws", func(c *gin.Context) {
		ws.ServeWs(hub, c.Writer, c.Request)
	})

	router.Run(fmt.Sprintf(":%d", serverConfig.Port))
}
