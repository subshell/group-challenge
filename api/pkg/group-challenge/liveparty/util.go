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
	avgVotesBySubmission := map[uuid.UUID]float64{}
	numVotesBySubmission := map[uuid.UUID]int{}
	for _, submission := range liveParty.Party.Submissions {
		numVotesBySubmission[submission.ID] = 0
		avgVotesBySubmission[submission.ID] = 0
	}

	// count votes per submission
	for _, vote := range liveParty.Status.Votes {
		numVotesBySubmission[vote.SubmissionID] += 1
		avgVotesBySubmission[vote.SubmissionID] += float64(vote.Rating)
	}

	// calculate the avg score per submission
	for submissionID := range avgVotesBySubmission {
		avgVotesBySubmission[submissionID] /= float64(numVotesBySubmission[submissionID])
	}

	// create sequence from avg votes per submissions in correct order
	for len(avgVotesBySubmission) != 0 {
		leastVotesID := uuid.Nil
		leastAvgVotesCount := 99999.0

		for key, value := range avgVotesBySubmission {
			if leastVotesID == uuid.Nil || leastAvgVotesCount > value {
				leastVotesID = key
				leastAvgVotesCount = value
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
		delete(avgVotesBySubmission, leastVotesID)
	}
}
