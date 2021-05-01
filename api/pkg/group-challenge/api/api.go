package api

import (
	"fmt"
	"group-challenge/pkg/group-challenge/auth"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/liveparty"
	"group-challenge/pkg/group-challenge/ws"
	"path"
	"time"

	"github.com/ReneKroon/ttlcache/v2"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
	"github.com/xis/baraka/v2"
)

var (
	con                      *pg.DB
	sessionStore             *auth.PGSessionStore
	formParser               *baraka.Parser
	livePartyHub             *liveparty.LivePartyHub
	imgCache                 *ttlcache.Cache
	maxImageFileSize         = 5 << 20
	imagesInMemomryCacheSize = 35
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
			party.DELETE("/:id", deletePartyHandler)
			party.POST("/:id/reopen", reopenPartyHandler)

			submissions := party.Group("/:id/submissions")
			{
				submissions.POST("", addPartySubmissionHandler)
				submissions.DELETE("/:submissionId", deletePartySubmissionHandler)
			}

			live := party.Group("/:id/live")
			{
				live.GET("/status", livePartyStatusHandler)
				live.POST("/start", livePartyStartHandler)
				live.POST("/next", livePartyNextHandler)
				live.POST("/previous", livePartyPreviousHandler)
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
		user := v1.Group("/users")
		{
			user.GET("", usersHandler)
			user.GET("/:id", userByIdHandler)
		}

		v1.GET("ws", createWsHandler())
	}
}

func createWsHandler() gin.HandlerFunc {
	hub := ws.NewHub()
	go hub.Run()
	go hub.LogClients()

	return func(c *gin.Context) {
		ws.ServeWs(hub, c.Writer, c.Request)
	}
}

/*
RunServer starts the server
*/
func RunServer(serverConfig config.ServerConfig, challengesConfig config.ChallengesConfig, _con *pg.DB) {
	con = _con
	livePartyHub = liveparty.CreateLivePartyHub(challengesConfig.LiveParty, con)

	// in-memory image cache
	imgCache = ttlcache.NewCache()
	imgCache.SetTTL(time.Duration(8 * time.Hour))
	imgCache.SetLoaderFunction(imageLoader)
	imgCache.SetCacheSizeLimit(imagesInMemomryCacheSize)

	// formdata
	options := baraka.ParserOptions{
		MaxFileSize:       maxImageFileSize + 1,
		MaxFileCount:      0,
		MaxParseCount:     20,
		MaxAvailableSlice: 2,
	}
	formParser = baraka.NewParser(options)

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
	var epoch = time.Unix(0, 0).Format(time.RFC1123)
	var noCacheHeaders = map[string]string{
		"Expires":         epoch,
		"Cache-Control":   "no-cache, private, max-age=0",
		"Pragma":          "no-cache",
		"X-Accel-Expires": "0",
	}
	router.NoRoute(func(c *gin.Context) {
		for k, v := range noCacheHeaders {
			c.Header(k, v)
		}
		c.File(path.Join(serverConfig.StaticFilesDir, "index.html"))
	})

	// api and ws
	configureAPIRouter(router, con)

	router.Run(fmt.Sprintf(":%d", serverConfig.Port))
}
