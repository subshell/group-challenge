package api

import (
	"fmt"
	"group-challenge/pkg/group-challenge/auth"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/liveparty"
	"path"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
	"github.com/xis/baraka/v2"
)

var (
	con          *pg.DB
	sessionStore *auth.PGSessionStore
	formParser   *baraka.Parser
	livePartyHub *liveparty.LivePartyHub
)

func configureAPIRouter(router *gin.Engine, con *pg.DB) {
	v1 := router.Group("/_api/v1")
	{
		party := v1.Group("/parties")
		{
			party.GET("", partiesHandler)
			party.POST("", addPartyHandler)
			party.GET("/:id", partyByIDHandler)
			party.POST("/:id", editPartyByIDHandler)
			party.POST("/:id/submissions", addPartySubmissionHandler)

			live := party.Group("/:id/live")
			{
				live.GET("/status", livePartyStatusHandler)
				live.POST("/start", livePartyStartHandler)
				live.POST("/next", livePartyNextHandler)
				live.POST("/vote", livePartyVoteHandler)
				live.POST("/join", livePartyJoinHandler)
			}
		}
		auth := v1.Group("/auth")
		{
			auth.POST("/signin", signinHandler)
			auth.POST("/signout", signoutHandler)
			auth.POST("/register", registerHandler)
		}
		image := v1.Group("/images")
		{
			image.GET("/:imageId", serveImageHandler)
		}

		v1.GET("ws", createWsHandler())
	}
}

/*
RunServer starts the server
*/
func RunServer(serverConfig config.ServerConfig, _con *pg.DB) {
	con = _con
	livePartyHub = liveparty.CreateLivePartyHub(con)

	// formdata
	formParser = baraka.DefaultParser()

	// router setup
	router := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Authorization", auth.XAuthTokenHeader}
	router.Use(cors.New(config))

	// sessions
	sessionStore = auth.CreatePGSessionStore(con)
	router.Use(sessionStore.InjectSessionMiddleware())
	router.Use(sessionStore.RequireSessionMiddleware([]string{"/_api/v1/parties"}))

	// static files
	router.Use(static.Serve("/", static.LocalFile(serverConfig.StaticFilesDir, true)))
	router.NoRoute(func(c *gin.Context) {
		c.File(path.Join(serverConfig.StaticFilesDir, "index.html"))
	})

	// api and ws
	configureAPIRouter(router, con)

	router.Run(fmt.Sprintf(":%d", serverConfig.Port))
}
