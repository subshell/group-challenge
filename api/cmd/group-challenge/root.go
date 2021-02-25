package main

import (
	"group-challenge/pkg/group-challenge/api"
	"group-challenge/pkg/group-challenge/config"
	"group-challenge/pkg/group-challenge/db"
	"log"
	"os"

	"github.com/spf13/viper"
)

var appConfig config.ApplicationConfig

func init() {
	viper.AutomaticEnv()
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath(".")
	viper.AddConfigPath("./config")

	viper.SetDefault("serverConfig.apiPort", 8081)
	viper.SetDefault("serverConfig.staticFilesPort", 8080)
	viper.SetDefault("serverConfig.staticFilesDir", "./static")

	viper.SetDefault("dbConfig.User", "")
	viper.SetDefault("dbConfig.Password", "")
	viper.SetDefault("dbConfig.Database", "postgres")

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
	db.Connect(appConfig.DB)
	api.RunServer(appConfig.Server)
}
