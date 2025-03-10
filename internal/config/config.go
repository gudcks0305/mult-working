package config

import (
	"fmt"
	"os"
	"time"

	"github.com/spf13/viper"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	Kafka    KafkaConfig
	Auth     AuthConfig
}

type ServerConfig struct {
	Port string
	Mode string
}

type DatabaseConfig struct {
	Driver      string
	Host        string
	Port        string
	Username    string
	Password    string
	DBName      string
	SSLMode     string
	AutoMigrate bool `mapstructure:"auto_migrate"`
}

type KafkaConfig struct {
	Brokers []string
	Topic   string
}

type AuthConfig struct {
	SymmetricKey  string        `mapstructure:"symmetric_key"`
	TokenDuration time.Duration `mapstructure:"token_duration"`
}

var ServerInstanceID = fmt.Sprintf("server-%s-%d", "MULTIPROCESS", time.Now().UnixNano())

func LoadConfig() (*Config, error) {
	env := os.Getenv("ENV")
	if env != "" {
		config, err := LoadConfigByEnv(env)
		if err != nil {
			return nil, err
		}
		return config, nil
	}
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./config")

	if err := viper.ReadInConfig(); err != nil {
		return nil, err
	}

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, err
	}

	return &config, nil
}

func LoadConfigByEnv(env string) (*Config, error) {
	viper.SetConfigName("config" + "-" + env)
	viper.SetConfigType("yaml")
	viper.AddConfigPath("./config")

	if err := viper.ReadInConfig(); err != nil {
		return nil, err
	}

	var config Config
	if err := viper.Unmarshal(&config); err != nil {
		return nil, err
	}

	return &config, nil
}
