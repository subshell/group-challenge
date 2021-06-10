package liveparty

import (
	"math/rand"
	"time"

	"github.com/gofrs/uuid"
)

func makeRange(min, max int) []int {
	a := make([]int, max-min)
	for i := range a {
		a[i] = min + i
	}
	return a
}

func shuffle(arr []int) []int {
	rand.Seed(time.Now().Unix())

	rand.Shuffle(len(arr), func(i, j int) {
		arr[i], arr[j] = arr[j], arr[i]
	})

	return arr
}

func generateRandomSequence(length int) []int {
	return shuffle(makeRange(0, length))
}

func sortSequenceByVotes(liveParty *LiveParty) {
	// reset sequence
	liveParty.Status.Sequence = []int{}

	// setup empty submissions map
	votesBySubmission := map[uuid.UUID]int{}
	for _, submission := range liveParty.Party.Submissions {
		votesBySubmission[submission.ID] = 0
	}

	// count votes per submission
	for _, vote := range liveParty.Status.Votes {
		votesBySubmission[vote.SubmissionID] += vote.Rating
	}

	// create sequence from votes per submissions in correct order
	for len(votesBySubmission) != 0 {
		leastVotesID := uuid.Nil
		leastVotesCount := 99999

		for key, value := range votesBySubmission {
			if leastVotesID == uuid.Nil || leastVotesCount > value {
				leastVotesID = key
				leastVotesCount = value
			}
		}

		var submissionIndex int
		for i, submission := range liveParty.Party.Submissions {
			if submission.ID == leastVotesID {
				submissionIndex = i
				break
			}
		}
		liveParty.Status.Sequence = append(liveParty.Status.Sequence, submissionIndex)
		delete(votesBySubmission, leastVotesID)
	}
}
