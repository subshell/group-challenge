package models

import (
	"time"

	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

// User user model
type User struct {
	tableName struct{}  `json:"-" pg:"gc_user"`
	ID        uuid.UUID `json:"id" pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	Username  string    `json:"username" pg:"username,unique"`
	Password  string    `json:"-" pg:"password"`
	Email     string    `json:"email" pg:"email"`
}

// Session session model
type Session struct {
	tableName    struct{}  `json:"-" pg:"sessions"`
	ID           uuid.UUID `json:"id" pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	User         uuid.UUID `json:"user" pg:"user,unique,type:uuid"`
	CreationDate time.Time `json:"-" pg:"creation_date,default:now()"`
}

// user
//////////

// Insert inserts a new user into the databse
func (user *User) Insert(con *pg.DB) (err error) {
	_, err = con.Model(user).Insert()
	return
}

// Select selects the user by its user id
func (user *User) Select(con *pg.DB) (err error) {
	err = con.Model(user).Select()
	return
}

// SelectByUsername selects the user by its user id
func (user *User) SelectByUsername(con *pg.DB) (err error) {
	err = con.Model(user).Where("username = ?0", user.Username).Select()
	return
}

// Update updates the user
func (user *User) Update(con *pg.DB) error {
	_, err := con.Model(user).Update()
	return err
}

// session
//////////

// Insert inserts a new session into the databse
func (session *Session) Insert(con *pg.DB) (err error) {
	_, err = con.Model(session).Insert()
	return
}

// Select selects the user by its session id
func (session *Session) Select(con *pg.DB) (err error) {
	err = con.Model(session).Select()
	return
}

// Update updates the session
func (session *Session) Update(con *pg.DB) error {
	_, err := con.Model(session).Update()
	return err
}

// Delete deletes the session
func (session *Session) Delete(con *pg.DB) error {
	_, err := con.Model(session).Delete()
	return err
}

// Exists checks if the session exists by looking up the user
func (session *Session) Exists(con *pg.DB) bool {
	exisits, err := con.Model(session).Where("session.user = ?0", session.User).Exists()
	return exisits && err == nil
}
