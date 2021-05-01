package api

import (
	"bytes"
	"fmt"
	"group-challenge/pkg/group-challenge/models"
	"log"
	"net/http"
	"runtime"
	"strconv"
	"time"

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

	_image, err := imgCache.Get(imageUUID.String())
	if err != nil {
		c.Status(500)
		return
	}

	image := _image.(*models.Image)
	c.Header("Content-Type", image.MimeType)
	c.Header("Content-Length", strconv.Itoa(len(image.ImageData)))
	c.Header("Cache-Control", "max-age=31536000")
	if _, err := c.Writer.Write(image.ImageData); err != nil {
		log.Println("unable to write image.")
	}

	PrintMemUsage()
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

func imageLoader(id string) (interface{}, time.Duration, error) {
	ttl := time.Hour * 8
	idAsUUID, _ := uuid.FromString(id)
	image := models.Image{
		ID: idAsUUID,
	}
	err := image.Select(con)
	return &image, ttl, err
}

// PrintMemUsage outputs the current, total and OS memory being used. As well as the number
// of garage collection cycles completed.
func PrintMemUsage() {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)
	// For info on each, see: https://golang.org/pkg/runtime/#MemStats
	fmt.Printf("Alloc = %v MiB", bToMb(m.Alloc))
	fmt.Printf("\tTotalAlloc = %v MiB", bToMb(m.TotalAlloc))
	fmt.Printf("\tSys = %v MiB", bToMb(m.Sys))
	fmt.Printf("\tNumGC = %v\n", m.NumGC)
}

func bToMb(b uint64) uint64 {
	return b / 1024 / 1024
}
