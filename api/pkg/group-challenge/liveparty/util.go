package liveparty

import (
	"math/rand"
	"time"
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
