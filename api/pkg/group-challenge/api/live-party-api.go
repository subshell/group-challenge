package api

import (
	"fmt"
	"group-challenge/pkg/group-challenge/liveparty"
	"group-challenge/pkg/group-challenge/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type voteRequest struct {
	Rating int `json:"rating"`
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

	c.JSON(200, liveParty.Status)
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

	if party.Done {
		livePartyHub.RemoveLiveParty(party.ID)
		party.Done = false
		for _, submission := range party.Submissions {
			submission.DeleteVotes(con)
		}
		party.Update(con)
	}

	liveParty, err := livePartyHub.CreateLiveParty(party)
	if err != nil {
		fmt.Println(err)
		c.Status(http.StatusBadRequest)
		return
	}

	c.JSON(200, liveParty.Status)
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

	liveParty.Vote(session.User, body.Rating)

	c.JSON(200, liveParty.Status)
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

	c.JSON(200, liveParty.Status)
}
