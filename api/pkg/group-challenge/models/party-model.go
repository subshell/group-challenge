package models

import (
	"time"

	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

type PartiesSubmissionsRelation struct {
	tableName    struct{}  `pg:"parties_submissions"`
	ID           uuid.UUID `pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	PartyID      uuid.UUID `pg:"party_id,type:uuid"`
	SubmissionID uuid.UUID `pg:"submission_id,type:uuid"`
}

type SubmissionsVotesRelation struct {
	tableName    struct{}  `pg:"submissions_votes"`
	ID           uuid.UUID `pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	SubmissionID uuid.UUID `pg:"submission_id,type:uuid"`
	VoteId       uuid.UUID `pg:"vote_id,type:uuid"`
}

type Party struct {
	tableName   struct{}  `json:"-" pg:"parties;alias:p"`
	ID          uuid.UUID `json:"id" pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name        string    `json:"name" pg:"name,notnull"`
	Description string    `json:"description" pg:"descrption,notnull"`
	Category    string    `json:"category" pg:"category,notnull"`
	Slug        string    `json:"slug" pg:"slug,unique"`
	StartDate   time.Time `json:"startDate" pg:"start_date"`
	EndDate     time.Time `json:"endDate" pg:"end_date"`
	UserID      uuid.UUID `json:"userId" pg:"user_id,type:uuid"`

	Submissions []*PartySubmission `json:"submissions" pg:",many2many:parties_submissions"`
}

type Vote struct {
	tableName struct{}  `json:"-" pg:"submissions_votes,alias:svote"`
	ID        uuid.UUID `json:"id" pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	Rating    float64   `json:"rating" pg:"rating"`
	UserID    uuid.UUID `json:"user" pg:"user_id,type:uuid"`
}

type PartySubmission struct {
	tableName      struct{}  `json:"-" pg:"party_submissions,alias:psubm"`
	ID             uuid.UUID `json:"id" pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name           string    `json:"name" pg:"name"`
	Description    string    `json:"description" pg:"description"`
	SubmissionDate time.Time `json:"submissionDate" pg:"submission_date"`
	ImageURL       string    `json:"imageURL" pg:"image_url"`
	ImageData      []byte    `json:"-" pg:"image_data,type:bytea"`
	UserID         uuid.UUID `json:"userId" pg:"user_id,type:uuid"`

	Votes []*Vote `json:"votes" pg:",many2many:submissions_votes"`
}

// Insert inserts a new party into the databse
func (party *Party) Insert(con *pg.DB) (err error) {
	_, err = con.Model(party).Insert()
	return
}

func (party *Party) AddSubmission(submission *PartySubmission, con *pg.DB) (err error) {
	_, err = con.Model(submission).Insert()
	if err != nil {
		return
	}

	submissionRelation := &PartiesSubmissionsRelation{
		PartyID:      party.ID,
		SubmissionID: submission.ID,
	}

	_, err = con.Model(submissionRelation).Insert()
	return
}

func (partySubmission *PartySubmission) AddVote(vote *Vote, submission, con *pg.DB) (err error) {
	_, err = con.Model(vote).Insert()
	if err != nil {
		return
	}

	submissionsVotesRelation := &SubmissionsVotesRelation{
		SubmissionID: partySubmission.ID,
		VoteId:       vote.ID,
	}

	_, err = con.Model(submissionsVotesRelation).Insert()
	return
}

// Select selects the party by its id
func (party *Party) Select(con *pg.DB) (err error) {
	// party
	err = con.Model(party).Where("id = ?0", party.ID).Select()
	if err != nil {
		return err
	}

	// submissions
	submissions := []*PartySubmission{}
	err = con.Model(&submissions).Column("psubm.*").Join("INNER JOIN parties_submissions psr on psr.submission_id = psubm.id").Where("psr.party_id = ?", party.ID).Select()
	if err != nil {
		return err
	}
	party.Submissions = submissions

	// votes for each submission
	for _, submission := range submissions {
		votes := []*Vote{}
		err = con.Model(&votes).Column("svote.*").Join("INNER JOIN submissions_votes svr on svr.vote_id = svote.id").Where("svr.submission_id = ?", submission.ID).Select()
		if err != nil {
			return err
		}
		submission.Votes = votes
	}

	return
}

// Update updates the party
func (party *Party) Update(con *pg.DB) error {
	_, err := con.Model(party).Where("id = ?0", party.ID).Update()
	return err
}

// GetAllParties returns all parties
func GetAllParties(parties *[]*Party, con *pg.DB) error {
	err := con.Model(parties).Column("id").Limit(200).Select()

	if err != nil {
		return err
	}

	for _, party := range *parties {
		if err = party.Select(con); err != nil {
			return err
		}
	}

	return nil
}
