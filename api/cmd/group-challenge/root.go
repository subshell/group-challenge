package main

import (
	"group-challenge/pkg/group-challenge/api"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/db"
	"log"
	"os"
	"strings"

	"github.com/spf13/viper"
)

var appConfig config.ApplicationConfig

func init() {
	// env
	viper.AutomaticEnv()
	viper.SetEnvPrefix("GC")
	viper.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))

	// config file
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")

	// config defaults
	viper.SetDefault("server.port", 8080)
	viper.SetDefault("server.staticFilesDir", "./static")
	viper.SetDefault("db.User", "")
	viper.SetDefault("db.Password", "")
	viper.SetDefault("db.Database", "postgres")
	viper.SetDefault("db.Host", "localhost:5432")
	viper.SetDefault("db.PoolSize", 50)
	viper.SetDefault("challenges.party.live.defaultTimePerSubmissionSeconds", 45)
	viper.SetDefault("imgProxy.enabled", false)
	viper.SetDefault("imgProxy.url", "http://localhost:8081")
	viper.SetDefault("imgProxy.SharedLocalCacheDir", "/tmp/group-challenge-cache")
	viper.SetDefault("imgProxy.thumbnailQuality", 75)
	viper.SetDefault("imgProxy.fullSizeQuality", 75)
	viper.SetDefault("imgProxy.maxFullWidth", 1280)
	viper.SetDefault("imgProxy.maxFullHeight", 1280)

	if err := viper.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); ok {
			log.Print("[WARNING] Config file not found; using defaults! ", err)
		} else {
			log.Panic(err, "Config file was found but another error was produced")
			os.Exit(1)
		}
	}

	if err := viper.Unmarshal(&appConfig); err != nil {
		log.Panic(err, "Failed to unmarshal the config")
		os.Exit(1)
	}
}

func main() {
	con := db.Connect(appConfig.DB)
	defer con.Close()
	db.InitDB(con)
	api.RunServer(appConfig.Server, appConfig.Challenges, appConfig.ImgProxy, con)
}
