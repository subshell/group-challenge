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

type PartiesStatisticsRelation struct {
	tableName   struct{}  `pg:"parties_statistics"`
	ID          uuid.UUID `pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	PartyID     uuid.UUID `pg:"party_id,type:uuid"`
	StatisticID uuid.UUID `pg:"statistic_id,type:uuid"`
}

type PartyStatisticsParticipantsRelation struct {
	tableName   struct{}  `pg:"statistics_participants"`
	ID          uuid.UUID `pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	StatisticID uuid.UUID `pg:"statistic_id,type:uuid"`
	UserID      uuid.UUID `pg:"user_id,type:uuid"`
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

	Statistics  []*PartyStatistics `json:"statistics" pg:",many2many:parties_statistics"`
	Submissions []*PartySubmission `json:"submissions" pg:",many2many:parties_submissions"`
}

type PartyStatistics struct {
	tableName    struct{}  `json:"-" pg:"party_statistics,alias:pstat"`
	ID           uuid.UUID `json:"id" pg:"id,pk,type:uuid,default:gen_random_uuid()"`
	SubmissionID uuid.UUID `json:"submissionId" pg:"submission_id,type:uuid"`
	Rating       float64   `json:"rating" pg:"rating"`

	Participants []*User `json:"participants" pg:"participants,many2many:statistics_participants"`
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
}

func (party *Party) TestWrite(con *pg.DB) {
	id, _ := uuid.NewV4()
	submission := &PartySubmission{
		Name:           "test",
		UserID:         id,
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

// Insert inserts a new party into the databse
func (party *Party) Insert(con *pg.DB) (err error) {
	_, err = con.Model(party).Insert()
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

	// statistics
	statistics := []*PartyStatistics{}
	err = con.Model(&statistics).Column("pstat.*").Join("INNER JOIN parties_statistics psr on psr.statistic_id = pstat.id").Where("psr.party_id = ?", party.ID).Select()
	if err != nil {
		return err
	}
	party.Statistics = statistics

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
