package api

import (
	"bytes"
	"errors"
	"fmt"
	"group-challenge/pkg/group-challenge/models"
	"io"
	"io/fs"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/gofrs/uuid"
)

// see: https://docs.imgproxy.net/generating_the_url
func serveThumbnailImageHandler(c *gin.Context) {
	if imgProxyConfig.Enabled {
		imgProxy(c, fmt.Sprintf("width:%d/height:%d/quality:%d", 150, 150, imgProxyConfig.ThumbnailQuality))
	} else {
		serveFallbackImageHandler(c)
	}
}

// see https://docs.imgproxy.net/generating_the_url
func serveFullImageHandler(c *gin.Context) {
	if imgProxyConfig.Enabled {
		imgProxy(c, fmt.Sprintf("width:%d/height:%d/quality:%d", imgProxyConfig.MaxFullWidth, imgProxyConfig.MaxFullHeight, imgProxyConfig.FullSizeQuality))
	} else {
		serveFallbackImageHandler(c)
	}
}

func serveFallbackImageHandler(c *gin.Context) {
	image, err := getImageFromCache(c)
	if err != nil {
		log.Println("[ERROR] unable to get image from cache:", err)
		return
	}

	c.Header("Content-Type", image.MimeType)
	c.Header("Content-Length", strconv.Itoa(len(image.ImageData)))
	c.Header("Cache-Control", "max-age=31536000")
	if _, err := c.Writer.Write(image.ImageData); err != nil {
		log.Println("[ERROR] unable to write image.")
	}
}

func getLocalImageFilePath(imageUUID uuid.UUID) string {
	return path.Join(imgProxyConfig.SharedLocalCacheDir, imageUUID.String())
}

func saveImageToFileSystem(image *models.Image) (string, error) {
	savedImagePath := getLocalImageFilePath(image.ID)
	if _, err := os.Stat(savedImagePath); errors.Is(err, os.ErrNotExist) {
		os.MkdirAll(imgProxyConfig.SharedLocalCacheDir, 0777)
		err = os.WriteFile(savedImagePath, image.ImageData, fs.FileMode(0777))
		if err != nil {
			log.Println("[ERROR] unable to write image to file system:", err)
			return "", err
		}
		log.Println("[INFO] saved image to file system:", savedImagePath)
	}

	return savedImagePath, nil
}

func imgProxy(c *gin.Context, processingOptions string) {
	image, err := getImageFromCache(c)

	if err != nil {
		log.Println("[ERROR] unable to get image from cache:", err)
		return
	}

	// imgProxy only returns a simple image
	mimeType, err := GetFileContentType(bytes.NewReader(image.ImageData))
	if err == nil && mimeType == "image/gif" {
		serveFallbackImageHandler(c)
		return
	}

	saveImageToFileSystem(image)

	imgProxyUrl, err := url.Parse(imgProxyConfig.URL)
	if err != nil {
		log.Println("[ERROR] unable to parse img proxy url:", err)
		c.Status(http.StatusInternalServerError)
		return
	}
	proxy := httputil.NewSingleHostReverseProxy(imgProxyUrl)
	proxy.Director = func(req *http.Request) {
		req.Header = c.Request.Header
		req.Host = imgProxyUrl.Host
		req.URL.Scheme = imgProxyUrl.Scheme
		req.URL.Host = imgProxyUrl.Host
		req.URL.Path = fmt.Sprintf("/%s/plain/local:///%s", processingOptions, image.ID)
	}
	proxy.ServeHTTP(c.Writer, c.Request)
}

func getImageFromCache(c *gin.Context) (*models.Image, error) {
	imageUUID, err := parseFormId(c, "imageId")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return nil, err
	}
	imageItem := imgCache.Get(imageUUID.String())
	_image := imageItem.Value()

	if _image.ID == uuid.Nil {
		c.Status(http.StatusInternalServerError)
		return nil, err
	}

	return &_image, nil
}

func GetFileContentType(reader io.Reader) (string, error) {
	// Only the first 512 bytes are used to sniff the content type.
	buffer := make([]byte, 512)

	_, err := reader.Read(buffer)
	if err != nil {
		return "", err
	}

	// Use the net/http package's handy DectectContentType function. Always returns a valid
	// content-type by returning "application/octet-stream" if no others seemed to match.
	contentType := http.DetectContentType(buffer)

	return contentType, nil
}
