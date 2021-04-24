package liveparty

import (
	"errors"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/models"
	"time"

	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

type SubmissionStatus struct {
	Index     int       `json:"index"`
	StartTime time.Time `json:"startTime"`
	Votes     []int     `json:"votes"`
}
type PartyStatus struct {
	Current          *SubmissionStatus `json:"current"`
	PartyStartTime   time.Time         `json:"partyStartTime"`
	SubmissionTimeMs int               `json:"submissionTimeMs"`
	Participants     int               `json:"participants"`
	IsLive           bool              `json:"isLive"`
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
			PartyStartTime:   time.Now(),
			SubmissionTimeMs: livePartyConfig.DefaultTimePerSubmissionSeconds * 1000,
			Participants:     1,
			IsLive:           true,
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
		SubmissionTimeMs: 0,
		Participants:     0,
		IsLive:           false,
	}
}

func (liveParty *LiveParty) Stop() {
	liveParty.Status.Current = nil
	liveParty.Status.IsLive = false
	liveParty.Party.Done = true

	// save results to db
	for _, submission := range liveParty.Party.Submissions {
		for _, vote := range submission.Votes {
			submission.AddVote(vote, liveParty.Con)
		}
	}
	liveParty.Party.Update(liveParty.Con)
}

func (liveParty *LiveParty) Previous() {
	var previousSubmissionIndex = liveParty.Status.Current.Index - 1

	if previousSubmissionIndex < 0 {
		return
	}

	var previousSubmission = liveParty.Party.Submissions[previousSubmissionIndex]
	var previousRatings = []int{}
	for _, vote := range previousSubmission.Votes {
		previousRatings = append(previousRatings, vote.Rating)
	}

	liveParty.Status.Current = &SubmissionStatus{
		Index:     previousSubmissionIndex,
		StartTime: time.Now(),
		Votes:     previousRatings,
	}
}

func (liveParty *LiveParty) Next() {
	var nextSubmissionIndex = 0

	if liveParty.Status.Current != nil {
		nextSubmissionIndex = liveParty.Status.Current.Index + 1
	}

	if len(liveParty.Party.Submissions) == nextSubmissionIndex {
		liveParty.Stop()
		return
	}

	liveParty.Status.Current = &SubmissionStatus{
		Index:     nextSubmissionIndex,
		StartTime: time.Now(),
		Votes:     []int{},
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
