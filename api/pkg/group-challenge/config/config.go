package config

// ApplicationConfig app config
type ApplicationConfig struct {
	Server     ServerConfig
	DB         DBConfig
	Challenges ChallengesConfig
}

// ServerConfig server config
type ServerConfig struct {
	Port           int
	StaticFilesDir string
	UploadDir      string
}

// DBConfig database config
type DBConfig struct {
	User       string
	Password   string
	Database   string
	Host       string
	PoolSize   int
	LogQueries bool
}

type ChallengesConfig struct {
	LiveParty LivePartyConfig
}

type LivePartyConfig struct {
	DefaultDimePerSubmissionSeconds int
}
