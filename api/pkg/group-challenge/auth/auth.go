package auth

import (
	"encoding/base64"
	"errors"
	"group-challenge/pkg/group-challenge/models"
	"log"
	"strings"

	"github.com/go-pg/pg/v10"
	"golang.org/x/crypto/bcrypt"
)

// CreateUser creates a user with and hashes the password
func CreateUser(username, password, email string) *models.User {
	userModel := &models.User{
		Username: username,
		Password: createPasswordHash(password),
		Email:    email,
	}

	return userModel
}

// GetUserFromToken validates the Authorization header token and returns the
// user if the token is valid and the user is authorized.
// see c.Request.Header.Get("Authorization")
// Header example: Authorization: Basic d2lraTpwZWRpYQ==
func GetUserFromToken(con *pg.DB, token string) (*models.User, error) {
	username, password, err := parseToken(token)

	if err != nil {
		log.Println("Token parse error", err)
		return nil, err
	}

	if !checkUserPassword(con, username, password) {
		log.Println("invalid signin attempt")
		return nil, errors.New("invalid credentials")
	}

	user := &models.User{
		Username: username,
	}
	user.SelectByUsername(con)

	return user, nil
}

// checkUserPassword checks if the user is logged in
func checkUserPassword(con *pg.DB, username, password string) bool {
	userModel := &models.User{
		Username: username,
	}

	if err := userModel.SelectByUsername(con); err != nil {
		return false
	}

	hashedPassword := userModel.Password
	return doPasswordsMatch(hashedPassword, password)
}

// CreatePasswordHash creates a hashed password using bcrypt and salt
func createPasswordHash(password string) string {
	passwordBytes := []byte(password)
	hashedPasswordBytes, _ := bcrypt.GenerateFromPassword(passwordBytes, bcrypt.MinCost)
	base64EncodedPasswordHash := string(hashedPasswordBytes)

	return base64EncodedPasswordHash
}

func doPasswordsMatch(hashedPassword, currPassword string) bool {
	err := bcrypt.CompareHashAndPassword(
		[]byte(hashedPassword), []byte(currPassword))
	return err == nil
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

	usernamePasswordArr := strings.SplitN(string(usernamePassword), ":", 2)
	if len(usernamePasswordArr) != 2 {
		return "", "", errors.New("token is invalid")
	}

	username := usernamePasswordArr[0]
	password := usernamePasswordArr[1]

	return username, password, nil
}
