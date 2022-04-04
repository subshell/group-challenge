package api

import (
	"group-challenge/pkg/group-challenge/auth"
	"group-challenge/pkg/group-challenge/models"
	"log"
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
)

type signInBody struct {
	EmailOrUsername string `json:"emailOrUsername"`
	Password        string `json:"password"`
}

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
	body := signInBody{}
	c.BindJSON(&body)

	user, err := auth.GetUserFromSignInBody(con, body.EmailOrUsername, body.Password)

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

func usersHandler(c *gin.Context) {
	users := []*models.User{}
	models.GetAllUsers(&users, con)
	c.JSON(200, users)
}

func userByIdHandler(c *gin.Context) {
	var user = &models.User{}
	uuid, err := parseFormId(c, "id")
	if err != nil {
		c.Status(400)
		return
	}

	user.ID = uuid
	err = user.Select(con)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(500)
		return
	}
	c.JSON(200, user)
}

// helper functions

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
