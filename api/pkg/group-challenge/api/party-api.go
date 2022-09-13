package api

import (
	"bytes"
	"encoding/json"
	"group-challenge/pkg/group-challenge/liveparty"
	"group-challenge/pkg/group-challenge/models"
	"group-challenge/pkg/group-challenge/ws"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

type assignModeratorRequestBody struct {
	UserId uuid.UUID `json:"userId"`
}

type partyRequestBody struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	StartDate   time.Time `json:"startDate"`
	EndDate     time.Time `json:"endDate"`
}

type paginationResponseBody struct {
	PageSize int             `json:"pageSize"`
	Page     int             `json:"page"`
	Data     []*models.Party `json:"data"`
}

type partySubmissionMetaBody struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

func triggerPartyWebSocketEvent(operation string, party *models.Party) {
	wsEvent := &ws.GCWebSocketEvent{
		Key:       []string{"parties", party.ID.String()},
		Operation: operation,
		Data:      party,
	}

	if msg, err := json.Marshal(wsEvent); err == nil {
		wsHub.Broadcast <- msg
	}
}

func broadcastParty(operation string, party *models.Party) {
	triggerPartyWebSocketEvent(operation, party)
}

func partiesHandler(c *gin.Context) {
	pageSize := 5

	pageString := c.Request.URL.Query().Get("page")
	if pageString == "" {
		pageString = "0"
	}
	page, err := strconv.Atoi(pageString)
	if err != nil {
		log.Println("[ERROR]", "page param is not an integer", pageString)
		c.Status(http.StatusBadRequest)
		return
	}

	parties := []*models.Party{}
	err = models.GetAllParties(&parties, page, pageSize, con)

	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(500)
		return
	}

	response := paginationResponseBody{}
	response.Data = parties
	response.Page = page
	response.PageSize = pageSize

	c.JSON(200, response)
}

func addPartyHandler(c *gin.Context) {
	party, err := requestBodyToParty(c, con, true)

	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}

	err = party.Insert(con)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(500)
		return
	}

	party.Select(con)
	broadcastParty("add", party)
	c.JSON(200, party)
}

func reopenPartyHandler(c *gin.Context) {
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

	if !party.Done {
		c.Status(400)
		return
	}

	party.Done = false
	livePartyHub.RemoveLiveParty(partyID)

	err = party.Update(con)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(500)
		return
	}

	party.Select(con)
	broadcastParty("update", party)
	c.JSON(200, party)
}

func assignModeratorHandler(c *gin.Context) {
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

	body := assignModeratorRequestBody{}
	c.BindJSON(&body)

	if body.UserId == uuid.Nil {
		c.Status(400)
		return
	}

	party.UserID = body.UserId

	err = party.Update(con)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(500)
		return
	}

	party.Select(con)
	broadcastParty("update", party)
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

	livePartyHub.RemoveLiveParty(partyID)
	err = party.Delete(con)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(500)
		return
	}

	broadcastParty("delete", party)
	c.JSON(200, party)
}

func deletePartySubmissionHandler(c *gin.Context) {
	_session, _ := c.Get("session")
	session := _session.(*models.Session)
	partyID, err := parseFormId(c, "id")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}
	submissionID, err := parseFormId(c, "submissionId")
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	party := &models.Party{
		ID: partyID,
	}
	party.Select(con)

	for _, submissionInParty := range party.Submissions {
		if submissionID == submissionInParty.ID && submissionInParty.UserID == session.User {
			err = party.DeleteSubmission(submissionInParty, con)
			if err != nil {
				log.Println("[ERROR]", err)
				c.Status(500)
				return
			}

			party.Select(con)
			broadcastParty("update", party)
			c.JSON(200, party)
			return
		}
	}

	c.Status(403)
}

func addPartySubmissionHandler(c *gin.Context) {
	_session, _ := c.Get("session")
	session := _session.(*models.Session)

	party, err := parseParty(c)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}

	// verify if a new submission is still allowed
	existingLiveParty, livePartyExists := livePartyHub.GetLiveParty(party.ID)
	if party.Done || (livePartyExists && existingLiveParty.Status.State != liveparty.LivePartyStateDone) {
		c.Status(400)
		return
	}

	imageHeader, imageFile, meta, err := readSubmissionFormData(c)

	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}

	if imageHeader.Size > maxImageFileSize {
		c.Status(http.StatusRequestEntityTooLarge)
		return
	}

	// read image file to buffer
	defer imageFile.Close()
	imageBuffer := bytes.NewBuffer(nil)
	if _, err := io.Copy(imageBuffer, imageFile); err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}

	// TODO check mime types
	mimeType, err := GetFileContentType(bytes.NewReader(imageBuffer.Bytes()))
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}

	image := &models.Image{
		ImageData:     imageBuffer.Bytes(),
		Extension:     filepath.Ext(imageHeader.Filename),
		FileSizeBytes: imageHeader.Size,
		UserID:        session.User,
		MimeType:      mimeType,
		// ImageURL: , TODO: support external image urls
	}
	if err = image.Insert(con); err != nil {
		log.Println("[ERROR]", err)
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
		log.Println("[ERROR]", err)
		c.Status(http.StatusInternalServerError)
		return
	}

	party.Select(con)
	broadcastParty("update", party)
	c.JSON(200, party)
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
	party, err := requestBodyToParty(c, con, false)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	err = party.Update(con)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusInternalServerError)
		return
	}

	party.Select(con)
	broadcastParty("update", party)
	c.JSON(200, party)
}

// helper functions

func parseParty(c *gin.Context) (*models.Party, error) {
	var party = &models.Party{}
	uuid, err := parseFormId(c, "id")
	party.ID = uuid
	return party, err
}

// TODO: better validation
func requestBodyToParty(c *gin.Context, con *pg.DB, isNew bool) (*models.Party, error) {
	_session, _ := c.Get("session")
	session := _session.(*models.Session)

	party := &models.Party{}
	if !isNew {
		partyID, err := parseFormId(c, "id")
		if err != nil {
			return nil, err
		}

		party.ID = partyID
		party.Select(con)
	}

	body := partyRequestBody{}
	c.BindJSON(&body)

	imageUUID, _ := uuid.NewV4()

	party.Name = body.Name
	party.Slug = body.Name // TODO escape name
	party.Description = body.Description
	party.Category = body.Category
	party.StartDate = body.StartDate
	party.EndDate = body.EndDate
	party.ImageID = imageUUID // TODO

	// not editable, only applies to new parties
	if party.UserID == uuid.Nil {
		party.UserID = session.User
	}

	return party, nil
}

func readSubmissionFormData(c *gin.Context) (*multipart.FileHeader, multipart.File, *partySubmissionMetaBody, error) {
	var err error
	var fileHeader *multipart.FileHeader
	var file multipart.File
	var meta = &partySubmissionMetaBody{}

	if err = c.Request.ParseForm(); err != nil {
		return nil, nil, nil, err
	}

	// image
	if file, fileHeader, err = c.Request.FormFile("image"); err != nil {
		return nil, nil, nil, err
	}

	// meta
	if err := json.Unmarshal([]byte(c.Request.FormValue("meta")), meta); err != nil {
		return nil, nil, nil, err
	}

	return fileHeader, file, meta, nil
}
