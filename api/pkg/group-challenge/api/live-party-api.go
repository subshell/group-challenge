package api

import (
	"encoding/json"
	"fmt"
	"group-challenge/pkg/group-challenge/liveparty"
	"group-challenge/pkg/group-challenge/models"
	"group-challenge/pkg/group-challenge/ws"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gofrs/uuid"
)

type voteRequest struct {
	Rating int `json:"rating"`
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

func broadcastPartyStatus(partyID uuid.UUID, partyStatus *liveparty.PartyStatus, c *gin.Context) {
	triggerLivePartyWebSocketEvent(partyID, partyStatus)
	c.JSON(200, partyStatus)
}

func livePartyStatusHandler(c *gin.Context) {
	party, err := parseParty(c)
	if err != nil {
		fmt.Println(err)
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
		fmt.Println(err)
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
	broadcastPartyStatus(party.ID, liveParty.Status, c)
	party.Update(con)
	broadcastParty("update", party, c)
}

func livePartyPreviousHandler(c *gin.Context) {
	party, err := parseParty(c)
	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}

	liveParty, ok := livePartyHub.GetLiveParty(party.ID)
	if !ok {
		c.Status(http.StatusNotFound)
		return
	}

	liveParty.Previous()
	broadcastPartyStatus(party.ID, liveParty.Status, c)
}

func livePartyStartHandler(c *gin.Context) {
	_session, _ := c.Get("session")
	session := _session.(*models.Session)

	party, err := parseParty(c)
	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}
	if err = party.Select(con); err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}
	if party.UserID != session.User {
		fmt.Println(err)
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
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}

	broadcastPartyStatus(party.ID, liveParty.Status, c)
	broadcastParty("update", party, c)
}

func livePartyVoteHandler(c *gin.Context) {
	_session, _ := c.Get("session")
	session := _session.(*models.Session)

	party, err := parseParty(c)
	if err != nil {
		fmt.Println(err)
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

	broadcastPartyStatus(party.ID, liveParty.Status, c)
}

func livePartyJoinHandler(c *gin.Context) {
	_session, _ := c.Get("session")
	session := _session.(*models.Session)

	party, err := parseParty(c)
	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}

	liveParty, ok := livePartyHub.GetLiveParty(party.ID)
	if !ok {
		c.Status(http.StatusNotFound)
		return
	}

	liveParty.AddParticipant(&session.User)

	broadcastPartyStatus(party.ID, liveParty.Status, c)
}
