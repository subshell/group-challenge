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

func GetUserFromSignInBody(con *pg.DB, emailOrUsername string, password string) (*models.User, error) {
	if len(emailOrUsername) == 0 || len(password) == 0 {
		log.Println("Invalid sign in")
		return nil, errors.New("invalid sign in")
	}

	user := &models.User{}
	var err error

	isEmail := isEmail(emailOrUsername)
	if isEmail {
		user.Email = strings.ToLower(emailOrUsername)
		err = user.SelectByUEmail(con)
	} else {
		user.Username = emailOrUsername
		err = user.SelectByUsername(con)
	}

	if err != nil {
		log.Println("User not found")
		return nil, errors.New("user not found")
	}

	if !checkUserPassword(con, user, password) {
		log.Println("invalid signin attempt")
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

// checkUserPassword checks if the user is logged in
func checkUserPassword(con *pg.DB, user *models.User, encodedPassword string) bool {
	if err := user.SelectByUsername(con); err != nil {
		return false
	}

	hashedPassword := user.Password
	passwordToCheck, err := base64.StdEncoding.DecodeString(encodedPassword)

	if err != nil {
		return false
	}

	return doPasswordsMatch(hashedPassword, string(passwordToCheck))
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

// checks if the string contains an @ symbol
func isEmail(text string) bool {
	return strings.Contains(text, "@")
}
