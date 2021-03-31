package liveparty

import (
	"errors"
	"group-challenge/pkg/group-challenge/models"

	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

type LivePartyHub struct {
	con         *pg.DB
	liveParties map[uuid.UUID]*LiveParty
}

func CreateLivePartyHub(con *pg.DB) *LivePartyHub {
	return &LivePartyHub{
		con:         con,
		liveParties: make(map[uuid.UUID]*LiveParty),
	}
}

func (livePartyHub *LivePartyHub) CreateLiveParty(party *models.Party) (*LiveParty, error) {
	if _, ok := livePartyHub.liveParties[party.ID]; ok {
		return nil, errors.New("party exists")
	}

	liveParty, err := createLiveParty(party, livePartyHub.con)
	livePartyHub.liveParties[party.ID] = liveParty

	return liveParty, err
}

func (livePartyHub *LivePartyHub) RemoveLiveParty(partyID uuid.UUID) {
	delete(livePartyHub.liveParties, partyID)
}

func (livePartyHub *LivePartyHub) GetLiveParty(partyID uuid.UUID) (*LiveParty, bool) {
	liveParty, ok := livePartyHub.liveParties[partyID]
	return liveParty, ok
}
