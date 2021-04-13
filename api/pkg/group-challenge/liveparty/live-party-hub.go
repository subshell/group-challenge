package liveparty

import (
	"errors"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/models"

	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

type LivePartyHub struct {
	con             *pg.DB
	livePartyConfig config.LivePartyConfig
	liveParties     map[uuid.UUID]*LiveParty
}

func CreateLivePartyHub(_livePartyConfig config.LivePartyConfig, con *pg.DB) *LivePartyHub {
	return &LivePartyHub{
		con:             con,
		livePartyConfig: _livePartyConfig,
		liveParties:     make(map[uuid.UUID]*LiveParty),
	}
}

func (livePartyHub *LivePartyHub) CreateLiveParty(party *models.Party) (*LiveParty, error) {
	if _, ok := livePartyHub.liveParties[party.ID]; ok {
		return nil, errors.New("party exists")
	}

	liveParty, err := createLiveParty(party, livePartyHub.con, livePartyHub.livePartyConfig)
	livePartyHub.liveParties[party.ID] = liveParty

	return liveParty, err
}

func (livePartyHub *LivePartyHub) RemoveLiveParty(partyID uuid.UUID) {
	delete(livePartyHub.liveParties, partyID)
}

func (livePartyHub *LivePartyHub) GetLiveParty(partyID uuid.UUID) (*LiveParty, bool) {
	liveParty, ok := livePartyHub.liveParties[partyID]

	if !ok {
		party := &models.Party{
			ID: partyID,
		}
		party.Select(livePartyHub.con)
		if !party.Done {
			return nil, false
		}

		liveParty, err := createDoneLiveParty(party, livePartyHub.con, livePartyHub.livePartyConfig)
		if err != nil {
			return nil, false
		}
		livePartyHub.liveParties[partyID] = liveParty
	}

	return liveParty, ok
}
