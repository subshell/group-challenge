package auth

import (
	"group-challenge/pkg/group-challenge/models"

	"github.com/go-pg/pg/v10"
	"golang.org/x/crypto/bcrypt"
)

// CheckUserPassword checks if the user is logged in
func CheckUserPassword(con *pg.DB, username, password string) bool {
	userModel := &models.User{
		Username: username,
	}

	if err := userModel.SelectByUsername(con); err != nil {
		return false
	}

	hashedPassword := userModel.Password
	return doPasswordsMatch(hashedPassword, password)
}

// CreateUser creates a user with and hashes the password
func CreateUser(username, password string) *models.User {
	userModel := &models.User{
		Username: username,
		Password: createPasswordHash(password),
	}

	return userModel
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
