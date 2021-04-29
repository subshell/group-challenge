package api

import (
	"errors"

	"github.com/gin-gonic/gin"
	"github.com/gofrs/uuid"
)

func parseFormId(c *gin.Context, idKey string) (uuid.UUID, error) {
	id, ok := c.Params.Get(idKey)
	if !ok {
		return uuid.Nil, errors.New("no such id in parameters")
	}
	parsedUUID, err := uuid.FromString(id)
	if err != nil {
		return uuid.Nil, err
	}
	return parsedUUID, nil
}
