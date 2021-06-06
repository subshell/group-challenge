package liveparty

import (
	"time"
)

func (liveParty *LiveParty) Reveal() {
	liveParty.Status.Current = nil
	liveParty.Status.State = LivePartyStatePreReveal

	// save votes to db model
	for _, submission := range liveParty.Party.Submissions {
		for _, vote := range liveParty.Status.Votes {
			submission.AddVote(vote, liveParty.Con)
		}
	}
	liveParty.Party.Update(liveParty.Con)
}

func (liveParty *LiveParty) Stop() {
	liveParty.Status.State = LivePartyStateDone
	liveParty.Party.Done = true
}

func (liveParty *LiveParty) Previous() {
	if liveParty.Status.Current == nil {
		return
	}

	if liveParty.Status.State == LivePartyStateSubmissions {
		liveParty.prevSubmission()
		return
	}

	if liveParty.Status.State == LivePartyStateReveal {
		liveParty.prevReveal()
		return
	}
}

func (liveParty *LiveParty) prevSubmission() {
	if liveParty.Status.Current.Position <= 0 {
		return
	}

	prevPosition := liveParty.Status.Current.Position - 1
	liveParty.Status.Current = &SubmissionStatus{
		Index:     liveParty.Status.Sequence[prevPosition],
		Position:  prevPosition,
		StartTime: time.Now(),
	}
}

func (liveParty *LiveParty) prevReveal() {
	if liveParty.Status.Current.Position <= 0 {
		return
	}

	prevPosition := liveParty.Status.Current.Position - 1
	liveParty.Status.Current = &SubmissionStatus{
		Index:     liveParty.Status.Sequence[prevPosition],
		Position:  prevPosition,
		StartTime: time.Now(),
	}
}

func (liveParty *LiveParty) Next() {
	if liveParty.Status.State == LivePartyStateWaitingLobby {
		liveParty.Status.State = LivePartyStateSubmissions
	}

	if liveParty.Status.State == LivePartyStatePreReveal {
		liveParty.Status.State = LivePartyStateReveal
	}

	if liveParty.Status.State == LivePartyStateSubmissions {
		liveParty.nextSubmission()
		return
	}

	if liveParty.Status.State == LivePartyStateReveal {
		liveParty.nextReveal()
		return
	}
}

func (liveParty *LiveParty) nextSubmission() {
	nextPosition := 0
	if liveParty.Status.Current != nil {
		nextPosition = liveParty.Status.Current.Position + 1
	}

	if nextPosition == len(liveParty.Party.Submissions) {
		liveParty.Reveal()
		return
	}

	liveParty.Status.Current = &SubmissionStatus{
		Index:     liveParty.Status.Sequence[nextPosition],
		Position:  nextPosition,
		StartTime: time.Now(),
	}
}

func (liveParty *LiveParty) nextReveal() {
	nextPosition := 0
	if liveParty.Status.Current != nil {
		nextPosition = liveParty.Status.Current.Position + 1
	}

	if nextPosition == len(liveParty.Party.Submissions) {
		liveParty.Stop()
		return
	}

	liveParty.Status.Current = &SubmissionStatus{
		Index:     liveParty.Status.Sequence[nextPosition],
		Position:  nextPosition,
		StartTime: time.Now(),
	}
}
