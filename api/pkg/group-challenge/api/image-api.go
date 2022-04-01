package api

import (
	"bytes"
	"errors"
	"fmt"
	"group-challenge/pkg/group-challenge/models"
	"io/fs"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"path"
	"strconv"
	"time"

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
		log.Println("unable to get image from cache:", err)
		return
	}

	c.Header("Content-Type", image.MimeType)
	c.Header("Content-Length", strconv.Itoa(len(image.ImageData)))
	c.Header("Cache-Control", "max-age=31536000")
	if _, err := c.Writer.Write(image.ImageData); err != nil {
		log.Println("unable to write image.")
	}
}

func getLocalImageFilePath(imageUUID uuid.UUID) string {
	return path.Join(imgProxyConfig.SharedLocalCacheDir, imageUUID.String())
}

func saveImageToFileSystem(image *models.Image) (string, error) {
	savedImagePath := getLocalImageFilePath(image.ID)
	if _, err := os.Stat(savedImagePath); errors.Is(err, os.ErrNotExist) {
		os.MkdirAll(imgProxyConfig.SharedLocalCacheDir, 0777)
		err = ioutil.WriteFile(savedImagePath, image.ImageData, fs.FileMode(0777))
		if err != nil {
			log.Println("unable to write image to file system:", err)
			return "", err
		}
		log.Println("saved image to file system:", savedImagePath)
	}

	return savedImagePath, nil
}

func imgProxy(c *gin.Context, processingOptions string) {
	image, err := getImageFromCache(c)

	if err != nil {
		log.Println("unable to get image from cache:", err)
		return
	}

	saveImageToFileSystem(image)

	imgProxyUrl, err := url.Parse(imgProxyConfig.URL)
	if err != nil {
		log.Println("unable to parse img proxy url:", err)
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
		log.Println("image url:", req.URL)
	}
	proxy.ServeHTTP(c.Writer, c.Request)
}

func getImageFromCache(c *gin.Context) (*models.Image, error) {
	imageUUID, err := parseFormId(c, "imageId")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return nil, err
	}
	_image, err := imgCache.Get(imageUUID.String())
	if err != nil {
		c.Status(http.StatusInternalServerError)
		return nil, err
	}
	return _image.(*models.Image), nil
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
