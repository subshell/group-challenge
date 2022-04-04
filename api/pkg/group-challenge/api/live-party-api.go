package api

import (
	"encoding/json"
	"group-challenge/pkg/group-challenge/liveparty"
	"group-challenge/pkg/group-challenge/models"
	"group-challenge/pkg/group-challenge/ws"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gofrs/uuid"
)

type voteRequest struct {
	Rating int `json:"rating"`
}

type reactionRequest struct {
	Reaction string `json:"reaction"`
}

func triggerLivePartyWebSocketEvent(partyID uuid.UUID, partyStatus *liveparty.PartyStatus) {
	wsEvent := &ws.GCWebSocketEvent{
		Key:       []string{"parties", partyID.String(), "live", "status"},
		Operation: "update",
		Data:      partyStatus,
	}

	if msg, err := json.Marshal(wsEvent); err == nil {
		wsHub.Broadcast <- msg
	}
}

func broadcastPartyStatus(partyID uuid.UUID, partyStatus *liveparty.PartyStatus) {
	triggerLivePartyWebSocketEvent(partyID, partyStatus)
}

func livePartyStatusHandler(c *gin.Context) {
	party, err := parseParty(c)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}

	liveParty, ok := livePartyHub.GetLiveParty(party.ID)
	if !ok {
		c.JSON(200, liveparty.CreateNonLivePartyStatus())
		return
	}

	c.JSON(200, liveParty.Status)
}

func livePartyNextHandler(c *gin.Context) {
	party, err := parseParty(c)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}

	liveParty, ok := livePartyHub.GetLiveParty(party.ID)
	if !ok {
		c.Status(http.StatusNotFound)
		return
	}

	// TODO restrict .Next calls
	liveParty.Next()
	party = liveParty.Party
	broadcastPartyStatus(party.ID, liveParty.Status)

	party.Update(con)
	party.Select(con)

	broadcastParty("update", party)

	c.JSON(200, liveParty.Status)
}

func livePartyPreviousHandler(c *gin.Context) {
	party, err := parseParty(c)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}

	liveParty, ok := livePartyHub.GetLiveParty(party.ID)
	if !ok {
		c.Status(http.StatusNotFound)
		return
	}

	liveParty.Previous()
	broadcastPartyStatus(party.ID, liveParty.Status)
	c.JSON(200, liveParty.Status)
}

func livePartyStartHandler(c *gin.Context) {
	_session, _ := c.Get("session")
	session := _session.(*models.Session)

	party, err := parseParty(c)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}
	if err = party.Select(con); err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}
	if party.UserID != session.User {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}

	// reset live party
	livePartyHub.RemoveLiveParty(party.ID)
	party.Done = false
	for _, submission := range party.Submissions {
		submission.DeleteVotes(con)
	}
	party.Update(con)

	liveParty, err := livePartyHub.CreateLiveParty(party)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}

	party.Select(con)
	broadcastPartyStatus(party.ID, liveParty.Status)
	broadcastParty("update", party)
	c.JSON(200, liveParty.Status)
}

func livePartyVoteHandler(c *gin.Context) {
	_session, _ := c.Get("session")
	session := _session.(*models.Session)

	party, err := parseParty(c)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}

	liveParty, ok := livePartyHub.GetLiveParty(party.ID)
	if !ok {
		c.Status(http.StatusNotFound)
		return
	}

	body := voteRequest{}
	if c.BindJSON(&body) != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	// ensure user has joined
	liveParty.AddParticipant(&session.User)
	liveParty.Vote(session.User, body.Rating)

	broadcastPartyStatus(party.ID, liveParty.Status)
	c.JSON(200, liveParty.Status)
}

// TODO
func livePartyReactionHandler(c *gin.Context) {
	party, err := parseParty(c)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}

	liveParty, ok := livePartyHub.GetLiveParty(party.ID)
	if !ok {
		c.Status(http.StatusNotFound)
		return
	}

	body := reactionRequest{}
	if err := c.BindJSON(&body); err != nil {
		log.Println("[ERROR]", "invalid body", err)
		c.Status(http.StatusBadRequest)
		return
	}

	wsEvent := &ws.GCWebSocketEvent{
		Key:       []string{"parties", party.ID.String(), "live", "reaction"},
		Operation: "live",
		Data:      body,
	}

	if msg, err := json.Marshal(wsEvent); err == nil {
		wsHub.Broadcast <- msg
	}

	c.JSON(200, liveParty.Status)
}

func livePartyJoinHandler(c *gin.Context) {
	_session, _ := c.Get("session")
	session := _session.(*models.Session)

	party, err := parseParty(c)
	if err != nil {
		log.Println("[ERROR]", err)
		c.Status(http.StatusBadRequest)
		return
	}

	liveParty, ok := livePartyHub.GetLiveParty(party.ID)
	if !ok {
		c.Status(http.StatusNotFound)
		return
	}

	liveParty.AddParticipant(&session.User)

	broadcastPartyStatus(party.ID, liveParty.Status)
	c.JSON(200, liveParty.Status)
}
