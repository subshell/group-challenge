package api

import (
	"github.com/gin-gonic/gin"
)

type ConfigResponse struct {
	FileSize int64 `json:"fileSize"`
}

func configHandler(c *gin.Context) {

	configResponse := ConfigResponse{
		FileSize: maxImageFileSize,
	}
	c.JSON(200, configResponse)
}
