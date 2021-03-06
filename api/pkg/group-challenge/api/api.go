package api

import (
	"fmt"
	"group-challenge/pkg/group-challenge/auth"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/models"
	"group-challenge/pkg/group-challenge/ws"
	"net/http"
	"path"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

var (
	con          *pg.DB
	sessionStore *auth.PGSessionStore
)

// API Handler
////////

func partiesHandler(c *gin.Context) {
	c.JSON(200, []uuid.UUID{})
}

func partyByIDHandler(c *gin.Context) {
	c.JSON(200, models.Party{})
}

type userSession struct {
	ID       string `json:"id"`
	Username string `json:"username"`
	Token    string `json:"token"`
}

func signinHandler(c *gin.Context) {
	token := c.Request.Header.Get("Authorization")
	user, err := auth.GetUserFromToken(con, token)

	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
		return
	}

	session := sessionStore.CreateSessionForUser(user)

	c.JSON(http.StatusOK, &userSession{
		ID:       user.ID.String(),
		Username: user.Username,
		Token:    session.ID.String(),
	})
}

func signoutHandler(c *gin.Context) {
	sessionStore.DeleteSession(c)
	c.Status(http.StatusOK)
}

type userSignIn struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type userSignUp struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
}

func registerHandler(c *gin.Context) {
	body := userSignUp{}
	c.BindJSON(&body)

	if body.Username == "" || body.Password == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"error": "invalid user data",
		})
		return
	}

	user := auth.CreateUser(body.Username, body.Password, body.Email)
	user.Insert(con)
	c.JSON(200, user)

}

func createWsHandler() gin.HandlerFunc {
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
		party := v1.Group("/parties")
		{
			party.GET("", partiesHandler)
			party.GET("/:id", partyByIDHandler)
		}
		auth := v1.Group("/auth")
		{
			auth.POST("/signin", signinHandler)
			auth.POST("/signout", signoutHandler)
			auth.POST("/register", registerHandler)
		}

		v1.GET("ws", createWsHandler())
	}
}

/*
RunServer Run the server
*/
func RunServer(serverConfig config.ServerConfig, _con *pg.DB) {
	con = _con

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
