package liveparty

import (
	"errors"
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
	Status *PartyStatus
	Party  *models.Party
	Con    *pg.DB
}

func createLiveParty(party *models.Party, con *pg.DB) (*LiveParty, error) {
	if party.Done {
		return nil, errors.New("party is over")
	}

	liveParty := &LiveParty{
		Status: &PartyStatus{
			Current:          nil,
			PartyStartTime:   time.Now(),
			SubmissionTimeMs: 45000,
			Participants:     1,
			IsLive:           true,
		},
		Party: party,
		Con:   con,
	}

	return liveParty, nil
}

func CreateNonLivePartyStatus() *PartyStatus {
	return &PartyStatus{
		Current:          nil,
		PartyStartTime:   time.Now(),
		SubmissionTimeMs: 0,
		Participants:     -1,
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

// rating 1 - 10
func (liveParty *LiveParty) Vote(userID uuid.UUID, rating int) {
	if liveParty.Status.Current == nil {
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

func (liveParty *LiveParty) AddParticipant() {
	liveParty.Status.Participants += 1
}

func (liveParty *LiveParty) RemoveParticipant() {
	if liveParty.Status.Participants == 0 {
		return
	}

	liveParty.Status.Participants -= 1
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
