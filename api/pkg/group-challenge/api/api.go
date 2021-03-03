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

// API Handler
////////

func createTestHandler(con *pg.DB) gin.HandlerFunc {
	user := &models.User{
		Username: "tom",
	}

	return func(c *gin.Context) {
		err := user.Insert(con)

		if err != nil {
			c.JSON(400, gin.H{
				"error": err.Error(),
			})
			return
		}

		c.JSON(200, user)
	}
}

func createPartiesHandler(con *pg.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(200, []uuid.UUID{})
	}
}

func createPartyByIDHandler(con *pg.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(200, models.Party{})
	}
}

// TODO: Request Validation
type userLogin struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func createLoginHandler(con *pg.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		body := userLogin{}
		c.BindJSON(&body)

		if auth.CheckUserPassword(con, body.Username, body.Password) {
			userModel := &models.User{
				Username: body.Username,
			}
			userModel.SelectByUsername(con)
			c.JSON(http.StatusOK, userModel)
			return
		}
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
	}
}

func createRegisterHandler(con *pg.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		body := userLogin{}
		c.BindJSON(&body)
		user := auth.CreateUser(body.Username, body.Password)
		user.Insert(con)
		c.JSON(200, user)
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

// API Configuration
////////

func configureAPIRouter(router *gin.Engine, con *pg.DB) {
	v1 := router.Group("/_api/v1")
	{
		v1.GET("test", createTestHandler(con))

		party := v1.Group("/parties")
		{
			party.GET("/", createPartiesHandler(con))
			party.GET("/:id", createPartyByIDHandler(con))
		}
		auth := v1.Group("/auth")
		{
			auth.POST("/login", createLoginHandler(con))
			auth.POST("/register", createRegisterHandler(con))
		}

		v1.GET("ws", createWsHandler())
	}
}

/*
RunServer Run the server
*/
func RunServer(serverConfig config.ServerConfig, con *pg.DB) {
	// router setup
	router := gin.Default()
	router.Use(cors.Default())
	router.Use(AuthMiddleware(con))

	// static files
	router.Use(static.Serve("/", static.LocalFile(serverConfig.StaticFilesDir, true)))
	router.NoRoute(func(c *gin.Context) {
		c.File(path.Join(serverConfig.StaticFilesDir, "index.html"))
	})

	// api and ws
	configureAPIRouter(router, con)

	router.Run(fmt.Sprintf(":%d", serverConfig.Port))
}
