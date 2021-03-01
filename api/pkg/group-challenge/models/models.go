package models

import "github.com/go-pg/pg/v10"

// User user dto
type User struct {
	TableName struct{} `json:"-" pg:"gc_user"`
	ID        int64    `json:"id" pg:"id,pk"`
	Username  string   `json:"username" pg:"username,unique"`
}

// Party party dto
type Party struct {
	TableName   struct{}     `json:"-" pg:"party"`
	ID          string       `json:"id" pg:"id,pk"`
	Name        string       `json:"name" pg:"name,notnull"`
	Description string       `json:"description" pg:"descrption,notnull"`
	Category    string       `json:"category" pg:"category,notnull"`
	StartDate   string       `json:"startDate" pg:"start_date"`
	EndDate     string       `json:"endDate" pg:"end_date"`
	Items       []*PartyItem `json:"items" pg:"items"`
}

// PartyItem party item dto
type PartyItem struct {
	TableName   struct{} `json:"-" pg:"party_item"`
	ID          string   `json:"id" pg:"id,pk"`
	Name        string   `json:"name" pg:"name"`
	Description string   `json:"description" pg:"description"`
	ImageURL    string   `json:"imageURL" pg:"image_url"`
	ImageData   string   `json:"-" pg:"image_data"`
}

// Insert inserts a new user into the databse
func (user *User) Insert(con *pg.DB) (err error) {
	_, err = pg.Model(user).Returning("id").Insert()
	return
}
