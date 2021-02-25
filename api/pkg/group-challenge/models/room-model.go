package models

import (
	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

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

// Update updates the room
func (room *Room) Update(con *pg.DB) error {
	_, err := con.Model(room).Update()
	return err
}
