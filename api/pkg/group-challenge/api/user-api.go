package api

import (
	"group-challenge/pkg/group-challenge/auth"
	"group-challenge/pkg/group-challenge/ws"
	"net/http"

	"github.com/gin-gonic/gin"
)

type userSession struct {
	Username string `json:"username"`
	UserID   string `json:"userId"`
	Token    string `json:"token"`
}

func registerHandler(c *gin.Context) {
	body := userSignUpRequestBody{}
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
		UserID:   user.ID.String(),
		Username: user.Username,
		Token:    session.ID.String(),
	})
}

func signoutHandler(c *gin.Context) {
	sessionStore.DeleteSession(c)
	c.Status(http.StatusOK)
}

type userSignUpRequestBody struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
}
