package models

import (
	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

type Image struct {
	tableName     struct{}  `pg:"images"`
	ID            uuid.UUID `pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	ImageURL      string    `pg:"image_url"`
	ImageData     []byte    `pg:"image_data,type:bytea"`
	UserID        uuid.UUID `pg:"user_id,type:uuid"`
	Extension     string    `pg:"extension"`
	MimeType      string    `pg:"mime_type"`
	FileSizeBytes int64     `pg:"file_size_bytes"`
}

func (image *Image) Insert(con *pg.DB) (err error) {
	_, err = con.Model(image).Insert()
	return
}

func (image *Image) Select(con *pg.DB) error {
	return con.Model(image).Where("id = ?0", image.ID).Select()
}
