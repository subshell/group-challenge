package api

import (
	"bytes"
	"fmt"
	"group-challenge/pkg/group-challenge/models"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gofrs/uuid"
)

func serveImageHandler(c *gin.Context) {
	imageUUID, err := parseFormId(c, "imageId")
	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}

	image, err := imgCache.load(imageUUID.String())
	if err != nil {
		c.Status(500)
		return
	}

	c.Header("Content-Type", image.MimeType)
	c.Header("Content-Length", strconv.Itoa(len(image.ImageData)))
	c.Header("Cache-Control", "max-age=31536000")
	if _, err := c.Writer.Write(image.ImageData); err != nil {
		log.Println("unable to write image.")
	}
}

func GetFileContentType(content *[]byte) (string, error) {
	// Only the first 512 bytes are used to sniff the content type.
	buffer := make([]byte, 512)

	_, err := bytes.NewReader(*content).Read(buffer)
	if err != nil {
		return "", err
	}

	// Use the net/http package's handy DectectContentType function. Always returns a valid
	// content-type by returning "application/octet-stream" if no others seemed to match.
	contentType := http.DetectContentType(buffer)

	return contentType, nil
}

func imageLoader(id string) (*models.Image, error) {
	idAsUUID, _ := uuid.FromString(id)
	image := &models.Image{
		ID: idAsUUID,
	}

	if err := image.Select(con); err != nil {
		return nil, err
	}

	return image, nil
}
