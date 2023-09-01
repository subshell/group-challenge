package api

import (
	"github.com/gin-gonic/gin"
)

type ConfigResponse struct {
	MaxUploadSize int64 `json:"maxUploadSize"`
}

func configHandler(c *gin.Context) {
	configResponse := ConfigResponse{
		MaxUploadSize: maxImageFileSize,
	}
	c.JSON(200, configResponse)
}
