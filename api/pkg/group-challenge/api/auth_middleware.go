package api

import (
	"encoding/base64"
	"errors"
	"fmt"
	"group-challenge/pkg/group-challenge/auth"
	"group-challenge/pkg/group-challenge/models"
	"log"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
)

// AuthMiddleware creates an auth middleware
func AuthMiddleware(con *pg.DB) gin.HandlerFunc {
	return func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/_api/v1/auth") {
			c.Next()
			return
		}

		validateToken(con, c)
		c.Next()
	}
}

// TODO: improve validation
// Header example: Authorization: Basic d2lraTpwZWRpYQ==
func validateToken(con *pg.DB, c *gin.Context) {
	token := c.Request.Header.Get("Authorization")
	username, password, err := parseToken(token)

	if err != nil || !auth.CheckUserPassword(con, username, password) {
		log.Println(err)
		c.AbortWithStatus(401)
		return
	}

	user := &models.User{
		Username: username,
	}
	user.SelectByUsername(con)

	c.Set("user", user)
}

func parseToken(token string) (string, string, error) {
	if token == "" {
		return "", "", errors.New("token is invalid")
	}
	tokenArr := strings.Split(token, " ")

	if len(tokenArr) != 2 {
		return "", "", errors.New("token is invalid")
	}

	tokenType := tokenArr[0]

	if tokenType != "Bearer" {
		return "", "", errors.New("token type must be 'Bearer'")
	}

	usernamePassword, err := base64.StdEncoding.DecodeString(tokenArr[1])

	if err != nil {
		return "", "", errors.New("token is not base64 encoded")
	}

	usernamePasswordArr := strings.Split(string(usernamePassword), ":")
	if len(usernamePasswordArr) != 2 {
		return "", "", errors.New("token is invalid")
	}

	username := usernamePasswordArr[0]
	password := usernamePasswordArr[1]

	fmt.Println(username, password)

	return username, password, nil
}
