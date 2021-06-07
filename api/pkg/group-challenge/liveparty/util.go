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
	liveParty.Status.Sequence = []int{}
	votesBySubmission := map[uuid.UUID]int{}
	for _, vote := range liveParty.Status.Votes {
		if _, ok := votesBySubmission[vote.SubmissionID]; !ok {
			votesBySubmission[vote.SubmissionID] = 0
		}

		votesBySubmission[vote.SubmissionID] += vote.Rating
	}

	for len(votesBySubmission) != 0 {
		leastVotesID := uuid.Nil
		leastVotesCount := 99999
		for key, value := range votesBySubmission {
			if leastVotesID == uuid.Nil || leastVotesCount > value {
				leastVotesID = key
				leastVotesCount = value
			}
		}

		// find submission index
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
