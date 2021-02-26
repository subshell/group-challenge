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
	if appConfig.Mode == "db" {
		db.Connect(appConfig.DB)
	}
	api.RunServer(appConfig.Server)
}
