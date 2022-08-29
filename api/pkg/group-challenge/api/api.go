package api

import (
	"fmt"
	"group-challenge/pkg/group-challenge/auth"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/liveparty"
	"group-challenge/pkg/group-challenge/models"
	"group-challenge/pkg/group-challenge/ws"
	"path"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
	"github.com/jellydator/ttlcache/v3"

	ginprometheus "github.com/zsais/go-gin-prometheus"
)

var (
	con                     *pg.DB
	sessionStore            *auth.PGSessionStore
	livePartyHub            *liveparty.LivePartyHub
	imgCache                *ttlcache.Cache[string, models.Image]
	wsHub                   *ws.Hub
	maxImageFileSize        int64  = 4 << 20
	imagesInMemoryCacheSize uint64 = 35
	imgProxyConfig          config.ImgProxyConfig
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
			party.POST("/:id/assignModerator", assignModeratorHandler)

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
				live.POST("/reaction", livePartyReactionHandler)
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
			image.GET("/thumbnail/:imageId", serveThumbnailImageHandler)
			image.GET("/full/:imageId", serveFullImageHandler)
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
	wsHub = ws.NewHub()
	go wsHub.Run()
	go wsHub.LogClients(60 * time.Second)

	return func(c *gin.Context) {
		ws.ServeWs(wsHub, c.Writer, c.Request)
	}
}

/*
RunServer starts the server
*/
func RunServer(serverConfig config.ServerConfig, challengesConfig config.ChallengesConfig, _imgProxyConfig config.ImgProxyConfig, _con *pg.DB) {
	con = _con
	livePartyHub = liveparty.CreateLivePartyHub(challengesConfig.LiveParty, con)
	imgProxyConfig = _imgProxyConfig

	// in-memory image cache
	loader := ttlcache.LoaderFunc[string, models.Image](
		func(c *ttlcache.Cache[string, models.Image], key string) *ttlcache.Item[string, models.Image] {
			idAsUUID, _ := uuid.FromString(key)
			image := models.Image{
				ID: idAsUUID,
			}
			image.Select(con)
			return c.Set(key, image, 8*time.Hour)
		},
	)

	imgCache = ttlcache.New(
		ttlcache.WithTTL[string, models.Image](8*time.Hour),
		ttlcache.WithLoader[string, models.Image](loader),
		ttlcache.WithCapacity[string, models.Image](imagesInMemoryCacheSize),
	)

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

	// metrics
	prometheusMiddleware := ginprometheus.NewPrometheus("gin")
	prometheusMiddleware.ReqCntURLLabelMappingFn = func(c *gin.Context) string {
		url := c.Request.URL.Path
		for _, p := range c.Params {
			url = strings.Replace(url, p.Value, p.Key, 1)
		}
		return url
	}
	prometheusMiddleware.Use(router)

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
