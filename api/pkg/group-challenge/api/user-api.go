package api

import (
	"group-challenge/pkg/group-challenge/auth"
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
)

type userSession struct {
	Username string `json:"username"`
	UserID   string `json:"userId"`
	Token    string `json:"token"`
}

type userSignUpRequestBody struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
}

func registerHandler(c *gin.Context) {
	body := userSignUpRequestBody{}
	c.BindJSON(&body)

	if !isUserValid(&body) {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
			"error": "invalid user data",
		})
		return
	}

	user := auth.CreateUser(body.Username, body.Password, body.Email)

	if err := user.SelectByUsername(con); err == nil {
		c.AbortWithStatusJSON(422, gin.H{
			"error": "user already exists up error",
		})
		return
	}

	err := user.Insert(con)

	if err != nil {
		c.AbortWithStatusJSON(400, gin.H{
			"error": "sign up error",
		})
		return
	}

	c.JSON(200, user)
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

var usernameRegex = regexp.MustCompile("^[a-zA-Z0-9]+$")

func isUserValid(user *userSignUpRequestBody) bool {
	if len(user.Password) < 2 || len(user.Username) < 2 {
		return false
	}

	if !usernameRegex.Match([]byte(user.Username)) {
		return false
	}

	return true
}
