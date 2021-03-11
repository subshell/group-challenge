package api

import (
	"group-challenge/pkg/group-challenge/models"
	"time"

	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

// endpoint response types
/////////

// SessionUserResponse api user
type SessionUserResponse struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	Email    string    `json:"email"`
	Token    string    `json:"token"`
}

// PartyResponse api party
type PartyResponse struct {
	ID          uuid.UUID                `json:"id"`
	Name        string                   `json:"name"`
	Description string                   `json:"description"`
	Category    string                   `json:"category"`
	EndDate     time.Time                `json:"endDate"`
	StartDate   time.Time                `json:"startDate"`
	Admin       *InlineUser              `json:"admin"`
	Slug        string                   `json:"slug"`
	Statistics  []*InlinePartyStatistics `json:"statistics"`
	Submissions []*InlinePartySubmission `json:"submissions"`
}

// endpoint inline response types
/////////

// InlinePartyStatistics api party statistics
type InlinePartyStatistics struct {
	SubmissionID uuid.UUID     `json:"submissionId"`
	Participants []*InlineUser `json:"participants"`
	Rating       float64       `json:"rating"`
}

// InlineUser api short user
type InlineUser struct {
	ID       uuid.UUID `json:"id"`
	Username string    `json:"username"`
	Email    string    `json:"email" pg:"email"`
}

// InlinePartySubmission api party submission
type InlinePartySubmission struct {
	ID             uuid.UUID   `json:"id"`
	User           *InlineUser `json:"user"`
	Name           string      `json:"name"`
	Description    string      `json:"description"`
	SubmissionDate time.Time   `json:"submissionDate"`
	ImageURL       string      `json:"imageURL"`
}

// db model to api model functions
/////////

// LoadPartyResponse creates the api party response from the db model
func LoadPartyResponse(partyID uuid.UUID, con *pg.DB) (*PartyResponse, error) {
	party := &models.Party{
		ID: partyID,
	}
	if err := party.Select(con); err != nil {
		return nil, err
	}

	admin, err := loadInlineUser(party.AdminID, con)
	if err != nil {
		return nil, err
	}

	submissions, err := loadInlinePartySubmissions(partyID, con)
	if err != nil {
		return nil, err
	}

	statistics, err := loadInlinePartyStatistics(partyID, con)
	if err != nil {
		return nil, err
	}

	partyResponse := &PartyResponse{
		ID:          partyID,
		Name:        party.Name,
		Description: party.Description,
		Admin:       admin,
		Slug:        party.Slug,
		Category:    party.Category,
		StartDate:   party.StartDate,
		EndDate:     party.EndDate,
		Submissions: submissions,
		Statistics:  statistics,
	}

	return partyResponse, nil
}

func loadInlineUser(userID uuid.UUID, con *pg.DB) (*InlineUser, error) {
	user := &models.User{}
	if err := user.Select(con); err != nil {
		return nil, err
	}

	inlineUser := &InlineUser{
		ID:       userID,
		Username: user.Username,
		Email:    user.Email,
	}

	return inlineUser, nil
}

// TODO
func loadInlinePartySubmissions(partyID uuid.UUID, con *pg.DB) ([]*InlinePartySubmission, error) {
	inlinePartySubmission := &InlinePartySubmission{
		ID:             uuid.UUID{},
		User:           &InlineUser{},
		Name:           "",
		SubmissionDate: time.Now(),
		Description:    "",
		ImageURL:       "",
	}
	return []*InlinePartySubmission{
		inlinePartySubmission,
	}, nil
}

// TODO
func loadInlinePartyStatistics(partyID uuid.UUID, con *pg.DB) ([]*InlinePartyStatistics, error) {
	inlinePartyStatistic := &InlinePartyStatistics{
		SubmissionID: uuid.UUID{},
		Participants: []*InlineUser{},
		Rating:       0.4,
	}
	return []*InlinePartyStatistics{
		inlinePartyStatistic,
	}, nil
}
