package models

import (
	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

// User user dto
type User struct {
	tableName struct{}  `json:"-" pg:"gc_user"`
	ID        uuid.UUID `json:"id" pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	Username  string    `json:"username" pg:"username,unique"`
}

// Room dto
type Room struct {
	tableName   struct{}  `json:"-" pg:"room"`
	ID          uuid.UUID `json:"id" sql:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name        string    `json:"name" pg:"name,notnull"`
	Description string    `json:"description" pg:"descrption,notnull"`
	Parties     []*Party  `json:"parties" pg:"parties"`
}

// Party party dto
type Party struct {
	tableName   struct{}     `json:"-" pg:"party"`
	ID          uuid.UUID    `json:"id" sql:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name        string       `json:"name" pg:"name,notnull"`
	Description string       `json:"description" pg:"descrption,notnull"`
	Category    string       `json:"category" pg:"category,notnull"`
	StartDate   string       `json:"startDate" pg:"start_date"`
	EndDate     string       `json:"endDate" pg:"end_date"`
	Items       []*PartyItem `json:"items" pg:"items"`
}

// PartyItem party item dto
type PartyItem struct {
	tableName   struct{}  `json:"-" pg:"party_item"`
	ID          uuid.UUID `json:"id" sql:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name        string    `json:"name" pg:"name"`
	Description string    `json:"description" pg:"description"`
	ImageURL    string    `json:"imageURL" pg:"image_url"`
	ImageData   string    `json:"-" pg:"image_data"`
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

// Update updates the user
func (user *User) Update(con *pg.DB) error {
	_, err := con.Model(user).Where("id = ?0", user.ID).Update()
	return err
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
	_, err := con.Model(room).Where("id = ?0", room.ID).Update()
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
	err = con.Model(party).Select()
	return
}

// Update updates the party
func (party *Party) Update(con *pg.DB) error {
	_, err := con.Model(party).Where("id = ?0", party.ID).Update()
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
	_, err := con.Model(partyItem).Where("id = ?0", partyItem.ID).Update()
	return err
}
