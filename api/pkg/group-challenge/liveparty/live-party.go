package liveparty

import (
	"errors"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/models"
	"time"

	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

var (
	MaxStars                   = 6
	LivePartyStateOpen         = "open"
	LivePartyStateWaitingLobby = "waitinglobby"
	LivePartyStateSubmissions  = "submissions"
	LivePartyStatePreReveal    = "prereveal"
	LivePartyStateReveal       = "reveal"
	LivePartyStateDone         = "done"
)

type SubmissionStatus struct {
	// index respecting the random submission sequence
	Index int `json:"index"`
	// ordered index/position 0 to n
	Position  int       `json:"position"`
	StartTime time.Time `json:"startTime"`
}

type PartyStatus struct {
	Current          *SubmissionStatus `json:"current"`
	Votes            []*models.Vote    `json:"votes"`
	Sequence         []int             `json:"sequence"`
	PartyStartTime   time.Time         `json:"partyStartTime"`
	SubmissionTimeMs int               `json:"submissionTimeMs"`
	Participants     int               `json:"participants"`
	State            string            `json:"state"`
}

type LiveParty struct {
	Status              *PartyStatus
	ParticipantsUserIDs []uuid.UUID
	Party               *models.Party
	Con                 *pg.DB
}

func createLiveParty(party *models.Party, con *pg.DB, livePartyConfig config.LivePartyConfig) (*LiveParty, error) {
	if party.Done {
		return nil, errors.New("party is over")
	}

	liveParty := &LiveParty{
		Status: &PartyStatus{
			Current:          nil,
			Sequence:         generateRandomSequence(len(party.Submissions)),
			PartyStartTime:   time.Now(),
			SubmissionTimeMs: livePartyConfig.DefaultTimePerSubmissionSeconds * 1000,
			Participants:     1,
			State:            LivePartyStateWaitingLobby,
			Votes:            []*models.Vote{},
		},
		ParticipantsUserIDs: []uuid.UUID{party.UserID},
		Party:               party,
		Con:                 con,
	}

	return liveParty, nil
}

func createDoneLiveParty(party *models.Party, con *pg.DB, livePartyConfig config.LivePartyConfig) (*LiveParty, error) {
	liveParty := &LiveParty{
		Status:              CreateNonLivePartyStatus(),
		ParticipantsUserIDs: []uuid.UUID{party.UserID},
		Party:               party,
		Con:                 con,
	}

	return liveParty, nil
}

func CreateNonLivePartyStatus() *PartyStatus {
	return &PartyStatus{
		Current:          nil,
		PartyStartTime:   time.Now(),
		Sequence:         []int{},
		Votes:            []*models.Vote{},
		SubmissionTimeMs: 0,
		Participants:     0,
		State:            LivePartyStateOpen,
	}
}

// rating 1 - MaxStars
func (liveParty *LiveParty) Vote(userID uuid.UUID, rating int) {
	if liveParty.Status.Current == nil || rating < 1 || rating > MaxStars {
		return
	}

	submission := liveParty.Party.Submissions[liveParty.Status.Current.Index]

	for _, savedVote := range liveParty.Status.Votes {
		if savedVote.UserID == userID && savedVote.SubmissionID == submission.ID {
			savedVote.Rating = rating
			return
		}
	}

	liveParty.Status.Votes = append(liveParty.Status.Votes, &models.Vote{
		Rating:       rating,
		UserID:       userID,
		SubmissionID: submission.ID,
	})
}

func (liveParty *LiveParty) AddParticipant(userID *uuid.UUID) {
	for _, existingUserIDs := range liveParty.ParticipantsUserIDs {
		if existingUserIDs == *userID {
			return
		}
	}

	liveParty.ParticipantsUserIDs = append(liveParty.ParticipantsUserIDs, *userID)
	liveParty.Status.Participants = len(liveParty.ParticipantsUserIDs)
}
