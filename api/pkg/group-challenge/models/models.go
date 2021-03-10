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

// Room model
type Room struct {
	tableName   struct{}    `json:"-" pg:"room"`
	ID          uuid.UUID   `json:"id" pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name        string      `json:"name" pg:"name,notnull"`
	URLName     string      `json:"urlName" pg:"url_name,unique"`
	Token       string      `json:"-" pg:"token,default:gen_random_uuid()"`
	Description string      `json:"description" pg:"descrption,notnull"`
	PartyIDs    []uuid.UUID `json:"parties" pg:"parties"`
}

// Party party model
type Party struct {
	tableName   struct{}    `json:"-" pg:"party"`
	ID          uuid.UUID   `json:"id" pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name        string      `json:"name" pg:"name,notnull"`
	AdminID     uuid.UUID   `json:"admin" pg:"admin,notnull,type:uuid"`
	URLName     string      `json:"urlName" pg:"url_name,unique"`
	Description string      `json:"description" pg:"descrption,notnull"`
	Category    string      `json:"category" pg:"category,notnull"`
	StartDate   time.Time   `json:"startDate" pg:"start_date"`
	EndDate     time.Time   `json:"endDate" pg:"end_date"`
	ItemIDs     []uuid.UUID `json:"items" pg:"items"`
}

// PartyItem party item model
type PartyItem struct {
	tableName   struct{}  `json:"-" pg:"party_item"`
	ID          uuid.UUID `json:"id" pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name        string    `json:"name" pg:"name"`
	Description string    `json:"description" pg:"description"`
	ImageURL    string    `json:"imageURL" pg:"image_url"`
	ImageData   []byte    `json:"-" pg:"image_data,type:bytea"`
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

// room
//////////

// Insert inserts a new party into the databse
func (room *Room) Insert(con *pg.DB) (err error) {
	_, err = con.Model(room).Insert()
	return
}

// Select selects the party by its id
func (room *Room) Select(con *pg.DB) (err error) {
	err = con.Model(room).Select()
	return
}

// Update updates the party
func (room *Room) Update(con *pg.DB) error {
	_, err := con.Model(room).Update()
	return err
}

// party
//////////

// Insert inserts a new party into the databse
func (party *Party) Insert(con *pg.DB) (err error) {
	_, err = con.Model(party).Insert()
	return
}

// Select selects the party by its id
func (party *Party) Select(con *pg.DB) (err error) {
	err = con.Model(party).Where("id = ?0", party.ID).Select()
	return
}

// Update updates the party
func (party *Party) Update(con *pg.DB) error {
	_, err := con.Model(party).Update()
	return err
}

// GetAllParties returns all parties
func GetAllParties(parties *[]Party, con *pg.DB) error {
	// TODO paging
	err := con.Model(parties).Limit(200).Select()
	return err
}

// party item
//////////

// Insert inserts a new party into the databse
func (partyItem *PartyItem) Insert(con *pg.DB) (err error) {
	_, err = con.Model(partyItem).Insert()
	return
}

// Select selects the party by its id
func (partyItem *PartyItem) Select(con *pg.DB) (err error) {
	err = con.Model(partyItem).Select()
	return
}

// Update updates the party
func (partyItem *PartyItem) Update(con *pg.DB) error {
	_, err := con.Model(partyItem).Update()
	return err
}
