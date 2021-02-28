package data

// User user dto
type User struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
}

// Party party dto
type Party struct {
	ID          int64        `json:"id"`
	Name        string       `json:"name"`
	Description string       `json:"description"`
	Category    string       `json:"category"`
	StartDate   string       `json:"startDate"`
	EndDate     string       `json:"endDate"`
	Items       []*PartyItem `json:"items"`
}

// PartyItem party item dto
type PartyItem struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	ImageURL string `json:"imageURL"`
}
