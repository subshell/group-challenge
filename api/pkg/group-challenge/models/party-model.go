package models

import (
	"fmt"
	"time"

	"github.com/go-pg/pg/v10"
	"github.com/gofrs/uuid"
)

type PartiesSubmissionsRelation struct {
	tableName    struct{}  `pg:"parties_submissions_relation"`
	ID           uuid.UUID `pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	PartyID      uuid.UUID `pg:"party_id,type:uuid"`
	SubmissionID uuid.UUID `pg:"submission_id,type:uuid"`
}

type PartiesStatisticsRelation struct {
	tableName   struct{}  `pg:"parties_statistics_relation"`
	ID          uuid.UUID `pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	PartyID     uuid.UUID `pg:"party_id,type:uuid"`
	StatisticID uuid.UUID `pg:"statistic_id,type:uuid"`
}

type PartyStatisticsParticipantsRelation struct {
	tableName   struct{}  `pg:"party_statistics_participants_relation"`
	ID          uuid.UUID `pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	StatisticID uuid.UUID `pg:"statistic_id,type:uuid"`
	UserID      uuid.UUID `pg:"user_id,type:uuid"`
}

type Party struct {
	tableName   struct{}  `json:"-" pg:"party"`
	ID          uuid.UUID `json:"id" pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name        string    `json:"name" pg:"name,notnull"`
	Description string    `json:"description" pg:"descrption,notnull"`
	Category    string    `json:"category" pg:"category,notnull"`
	Slug        string    `json:"slug" pg:"slug,unique"`
	StartDate   time.Time `json:"startDate" pg:"start_date"`
	EndDate     time.Time `json:"endDate" pg:"end_date"`

	Admin       *User              `json:"admin" pg:"admin,notnull,fk:admin_id"`
	Statistics  []*PartyStatistics `json:"statistics" pg:",many2many:parties_statistics_relation"`
	Submissions []*PartySubmission `json:"submissions" pg:",many2many:parties_submissions_relation"`
}

type PartyStatistics struct {
	tableName    struct{}  `json:"-" pg:"party_statistics"`
	ID           uuid.UUID `json:"id" pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	SubmissionID uuid.UUID `json:"submissionId" pg:"submission_id,type:uuid"`
	Rating       float64   `json:"rating" pg:"rating"`

	Participants []*User `json:"participants" pg:"participants,many2many:party_statistics_participants_relation"`
}

type PartySubmission struct {
	tableName      struct{}  `json:"-" pg:"party_submission"`
	ID             uuid.UUID `json:"id" pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	Name           string    `json:"name" pg:"name"`
	Description    string    `json:"description" pg:"description"`
	SubmissionDate time.Time `json:"submissionDate" pg:"submission_date"`
	ImageURL       string    `json:"imageURL" pg:"image_url"`
	ImageData      []byte    `json:"-" pg:"image_data,type:bytea"`

	User *User `json:"user" pg:"user,fk:user_id"`
}

func (party *Party) TestWrite(con *pg.DB) {
	submission := &PartySubmission{
		Name:           "test",
		User:           &User{ID: uuid.UUID{}},
		Description:    "test desc",
		SubmissionDate: time.Now(),
	}
	con.Model(submission).Insert()
	party.Insert(con)

	submissionRelation := &PartiesSubmissionsRelation{
		PartyID:      party.ID,
		SubmissionID: submission.ID,
	}

	con.Model(submissionRelation).Insert()
}

func (party *Party) TestRead(con *pg.DB) {
	// submissions
	/*
		SELECT ps.*
		FROM "party_submission" AS ps
		INNER JOIN parties_submissions_relation psr on psr.submission_id = ps.id
		WHERE (psr.party_id = 'd27315ac-6849-4ec5-9a34-3ea02e893b9b')
	*/
	submissions := []*PartySubmission{}
	err := con.Model(&submissions).Column("party_submission.*").Join("INNER JOIN parties_submissions_relation psr on psr.submission_id = party_submission.id").Where("psr.party_id = ?", party.ID).Select()
	if err != nil {
		fmt.Println(err)
	} else {
		for _, submission := range submissions {
			fmt.Printf("Submission -> id: %d, name:%s \n", submission.ID, submission.Name)
		}
	}

	party.Submissions = submissions
}

// Insert inserts a new party into the databse
func (party *Party) Insert(con *pg.DB) (err error) {
	_, err = con.Model(party).Insert()
	return
}

// Select selects the party by its id
func (party *Party) Select(con *pg.DB) (err error) {
	err = con.Model(party).Where("id = ?0", party.ID).Select()
	return
}

// Update updates the party
func (party *Party) Update(con *pg.DB) error {
	_, err := con.Model(party).Update()
	return err
}

// GetAllParties returns all parties
func GetAllParties(parties *[]Party, con *pg.DB) error {
	// TODO paging
	err := con.Model(parties).Limit(200).Select()
	return err
}

// party submission
//////////

// Insert inserts a new party into the databse
func (partySubmission *PartySubmission) Insert(con *pg.DB) (err error) {
	_, err = con.Model(partySubmission).Insert()
	return
}

// Select selects the party by its id
func (partySubmission *PartySubmission) Select(con *pg.DB) (err error) {
	err = con.Model(partySubmission).Select()
	return
}

// Update updates the party
func (partySubmission *PartySubmission) Update(con *pg.DB) error {
	_, err := con.Model(partySubmission).Update()
	return err
}
