package config

// ApplicationConfig app config
type ApplicationConfig struct {
	Server ServerConfig
	DB     DBConfig
}

// ServerConfig server config
type ServerConfig struct {
	Port           int
	StaticFilesDir string
}

// DBConfig database config
type DBConfig struct {
	User     string
	Password string
	Database string
	Host     string
	PoolSize int
}
