package api

import (
	"fmt"
	"group-challenge/pkg/group-challenge/models"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gofrs/uuid"
)

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

type partyRequestBody struct {
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Category    string    `json:"category"`
	StartDate   time.Time `json:"startDate"`
	EndDate     time.Time `json:"endDate"`
}

func requestBodyToParty(c *gin.Context) *models.Party {
	_session, _ := c.Get("session")
	session := _session.(*models.Session)

	// TODO validation
	body := partyRequestBody{}
	c.BindJSON(&body)

	return &models.Party{
		Name:        body.Name,
		Slug:        body.Name, // TODO escape name
		UserID:      session.User,
		Description: body.Description,
		Category:    body.Category,
		StartDate:   body.StartDate,
		EndDate:     body.EndDate,
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

type partySubmissionRequestBody struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	ImageURL    string `json:"imageUrl"`
}

func getFileFromRequest(c *gin.Context, key string) string {
	file, header, err := c.Request.FormFile(key)
	if err != nil {
		log.Fatal(err)
	}

	filename := header.Filename
	fmt.Println(header.Filename)
	out, err := os.CreateTemp("", filename)
	fmt.Println(out.Name())
	if err != nil {
		log.Fatal(err)
	}
	defer out.Close()
	_, err = io.Copy(out, file)
	if err != nil {
		log.Fatal(err)
	}

	return out.Name()
}

func addPartySubmissionHandler(c *gin.Context) {
	_session, _ := c.Get("session")
	session := _session.(*models.Session)

	// TODO validation
	partyID, ok := c.Params.Get("id")
	if !ok {
		c.Status(http.StatusBadRequest)
		return
	}

	file := getFileFromRequest(c, "file")
	println(file)

	// TODO
	body := partySubmissionRequestBody{
		Name:        "test",
		Description: "test",
		ImageURL:    "http://fakeurl.de",
	}

	partyUUID, err := uuid.FromString(partyID)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	party := &models.Party{
		ID: partyUUID,
	}

	partySubmission := &models.PartySubmission{
		Name:           body.Name,
		Description:    body.Description,
		ImageURL:       body.ImageURL,
		SubmissionDate: time.Now(),
		UserID:         session.User,
		ImageData:      nil,
	}
	party.AddSubmission(partySubmission, con)

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

	party.Select(con)

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
