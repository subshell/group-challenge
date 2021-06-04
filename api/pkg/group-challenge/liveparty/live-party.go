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
	LivePartyStateOpen        = "open"
	LivePartyStateStart       = "start"
	LivePartyStateSubmissions = "submissions"
	LivePartyStateReveal      = "reveal"
	LivePartyStateDone        = "done"
)

type SubmissionStatus struct {
	Index     int       `json:"index"`
	StartTime time.Time `json:"startTime"`
	Votes     []int     `json:"votes"`
}

type PartyStatus struct {
	Current          *SubmissionStatus `json:"current"`
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
			State:            LivePartyStateStart,
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
		SubmissionTimeMs: 0,
		Participants:     0,
		State:            LivePartyStateOpen,
	}
}

// rating 1 - 5
func (liveParty *LiveParty) Vote(userID uuid.UUID, rating int) {
	if liveParty.Status.Current == nil || rating < 1 || rating > 5 {
		return
	}

	var vote, ok = liveParty.findUserVote(userID)
	if !ok {
		vote = &models.Vote{
			Rating: rating,
			UserID: userID,
		}
		liveParty.Party.Submissions[liveParty.Status.Current.Index].Votes = append(liveParty.Party.Submissions[liveParty.Status.Current.Index].Votes, vote)
	} else {
		vote.Rating = rating
	}

	liveParty.Status.Current.Votes = []int{}
	for _, vote = range liveParty.Party.Submissions[liveParty.Status.Current.Index].Votes {
		liveParty.Status.Current.Votes = append(liveParty.Status.Current.Votes, int(vote.Rating))
	}
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

func (liveParty *LiveParty) findUserVote(userID uuid.UUID) (*models.Vote, bool) {
	votes := liveParty.Party.Submissions[liveParty.Status.Current.Index].Votes
	for _, vote := range votes {
		if vote.UserID == userID {
			return vote, true
		}
	}
	return nil, false
}
