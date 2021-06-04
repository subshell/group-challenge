package liveparty

import (
	"fmt"
	"time"
)

func (liveParty *LiveParty) Reveal() {
	liveParty.Status.Current = nil
	liveParty.Status.State = LivePartyStateReveal

	// save results to db
	for _, submission := range liveParty.Party.Submissions {
		for _, vote := range submission.Votes {
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
	if liveParty.Status.State == LivePartyStateSubmissions && liveParty.Status.Current != nil && liveParty.Status.Current.Index != liveParty.Status.Sequence[0] {
		liveParty.prevSubmission()
		return
	}

	if liveParty.Status.State == LivePartyStateReveal && liveParty.Status.Current.Index != liveParty.Status.Sequence[0] {
		liveParty.prevReveal()
		return
	}
}

func (liveParty *LiveParty) getPrevIndex() (int, bool) {
	if len(liveParty.Party.Submissions) == 0 {
		return -1, false
	}

	if liveParty.Status.Current != nil {
		currentSequenceIndex := indexOf(liveParty.Status.Current.Index, liveParty.Status.Sequence)

		if currentSequenceIndex == 0 {
			return -1, false
		}

		return liveParty.Status.Sequence[currentSequenceIndex-1], true
	}

	return liveParty.Status.Sequence[0], true
}

func (liveParty *LiveParty) prevSubmission() {
	prevSubmissionIndex, ok := liveParty.getPrevIndex()
	if !ok {
		return
	}

	var previousSubmission = liveParty.Party.Submissions[prevSubmissionIndex]
	var previousRatings = []int{}
	for _, vote := range previousSubmission.Votes {
		previousRatings = append(previousRatings, vote.Rating)
	}

	liveParty.Status.Current = &SubmissionStatus{
		Index:     prevSubmissionIndex,
		StartTime: time.Now(),
		Votes:     previousRatings,
	}
}

func (liveParty *LiveParty) prevReveal() {
	prevSubmissionIndex, ok := liveParty.getPrevIndex()
	if !ok {
		return
	}

	liveParty.Status.Current = &SubmissionStatus{
		Index:     prevSubmissionIndex,
		StartTime: time.Now(),
		Votes:     []int{},
	}
}

func (liveParty *LiveParty) Next() {
	if liveParty.Status.State == LivePartyStateStart {
		liveParty.Status.State = LivePartyStateSubmissions
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

func (liveParty *LiveParty) getNextIndex() (int, bool) {
	if len(liveParty.Party.Submissions) == 0 {
		return -1, false
	}

	if liveParty.Status.Current != nil {
		currentSequenceIndex := indexOf(liveParty.Status.Current.Index, liveParty.Status.Sequence)
		fmt.Println(currentSequenceIndex)
		if len(liveParty.Party.Submissions) == currentSequenceIndex+1 {
			return -1, false
		}

		return liveParty.Status.Sequence[currentSequenceIndex+1], true
	}

	return liveParty.Status.Sequence[0], true
}

func (liveParty *LiveParty) nextSubmission() {
	nextSubmissionIndex, ok := liveParty.getNextIndex()
	if !ok {
		liveParty.Reveal()
		return
	}

	liveParty.Status.Current = &SubmissionStatus{
		Index:     nextSubmissionIndex,
		StartTime: time.Now(),
		Votes:     []int{},
	}
}

func (liveParty *LiveParty) nextReveal() {
	nextSubmissionIndex, ok := liveParty.getNextIndex()
	if !ok {
		liveParty.Stop()
		return
	}

	liveParty.Status.Current = &SubmissionStatus{
		Index:     nextSubmissionIndex,
		StartTime: time.Now(),
		Votes:     []int{},
	}
}
