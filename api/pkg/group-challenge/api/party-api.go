package api

import (
	"encoding/json"
	"errors"
	"fmt"
	"group-challenge/pkg/group-challenge/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gofrs/uuid"
	"github.com/xis/baraka/v2"
)

type partyRequestBody struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	StartDate   time.Time `json:"startDate"`
	EndDate     time.Time `json:"endDate"`
}

type partySubmissionRequestBody struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	ImageURL    string `json:"imageUrl"`
}

func partiesHandler(c *gin.Context) {
	parties := &[]*models.Party{}
	err := models.GetAllParties(parties, con)

	if err != nil {
		fmt.Println(err)
		c.Status(500)
		return
	}

	c.JSON(200, parties)
}

func requestBodyToParty(c *gin.Context) *models.Party {
	_session, _ := c.Get("session")
	session := _session.(*models.Session)

	// TODO validation
	body := partyRequestBody{}
	c.BindJSON(&body)

	imageUUID, _ := uuid.NewV4()

	return &models.Party{
		Name:        body.Name,
		Slug:        body.Name, // TODO escape name
		UserID:      session.User,
		Description: body.Description,
		Category:    body.Category,
		StartDate:   body.StartDate,
		EndDate:     body.EndDate,
		ImageID:     imageUUID, // TODO
	}
}

func addPartyHandler(c *gin.Context) {
	party := requestBodyToParty(c)

	err := party.Insert(con)
	if err != nil {
		fmt.Println(err)
		c.Status(500)
		return
	}

	c.JSON(200, party)
}

func deletePartyHandler(c *gin.Context) {
	_session, _ := c.Get("session")
	session := _session.(*models.Session)
	partyID, err := parseFormId(c, "id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	party := &models.Party{
		ID: partyID,
	}
	party.Select(con)

	if party.UserID != session.User {
		c.Status(403)
		return
	}

	err = party.Delete(con)
	if err != nil {
		fmt.Println(err)
		c.Status(500)
		return
	}

	c.Status(200)
}

func addPartySubmissionHandler(c *gin.Context) {
	_session, _ := c.Get("session")
	session := _session.(*models.Session)

	party, err := parseParty(c)
	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}

	var meta = &partySubmissionRequestBody{}
	uploadedImage, err := readFormData(c, "image", meta)
	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}
	mimeType, err := GetFileContentType(&uploadedImage.Content)
	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}

	fmt.Println(mimeType)

	image := &models.Image{
		ImageData:     uploadedImage.Content,
		Extension:     uploadedImage.Extension,
		FileSizeBytes: int64(uploadedImage.Size),
		UserID:        session.User,
		MimeType:      mimeType,
		// ImageURL: , TODO: support external image urls
	}
	if err = image.Insert(con); err != nil {
		fmt.Println(err)
		c.Status(http.StatusInternalServerError)
		return
	}

	partySubmission := &models.PartySubmission{
		Name:           meta.Name,
		Description:    meta.Description,
		SubmissionDate: time.Now(),
		UserID:         session.User,
		ImageID:        image.ID,
	}
	if err = party.AddSubmission(partySubmission, con); err != nil {
		fmt.Println(err)
		c.Status(http.StatusInternalServerError)
		return
	}

	c.JSON(200, partySubmission)
}

func partyByIDHandler(c *gin.Context) {
	// TODO validation
	partyID, ok := c.Params.Get("id")
	if !ok {
		c.Status(http.StatusBadRequest)
		return
	}

	party := &models.Party{
		ID: uuid.FromStringOrNil(partyID),
	}

	if err := party.Select(con); err != nil {
		c.Status(http.StatusNotFound)
		return
	}

	c.JSON(200, party)
}

func editPartyByIDHandler(c *gin.Context) {
	partyID, ok := c.Params.Get("id")
	if !ok {
		c.Status(http.StatusBadRequest)
		return
	}

	party := requestBodyToParty(c)
	party.ID, _ = uuid.FromString(partyID)

	err := party.Update(con)
	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusInternalServerError)
		return
	}

	c.JSON(200, party)
}

// helper functions

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

func parseParty(c *gin.Context) (*models.Party, error) {
	var party = &models.Party{}
	uuid, err := parseFormId(c, "id")
	party.ID = uuid
	return party, err
}

func readFormData(c *gin.Context, key string, meta interface{}) (*baraka.Part, error) {
	// parse formdata
	request, err := formParser.Parse(c.Request)
	if err != nil {
		return nil, err
	}

	metaForm, err := request.GetForm("meta")
	if err != nil {
		return nil, err
	}
	if err := json.Unmarshal(metaForm[0].Content, meta); err != nil {
		return nil, err
	}

	images, err := request.GetForm(key)
	if err != nil || len(images) != 1 {
		return nil, err
	}
	image := images[0]

	return image, nil
}
