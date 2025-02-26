package database

import (
	"fmt"
	"mult-working/internal/config"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// NewDatabase는 설정에 따라 데이터베이스 연결을 생성합니다
func NewDatabase(cfg *config.Config) (*gorm.DB, error) {
	if cfg.Database.Driver == "postgres" {
		dsn := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
			cfg.Database.Host, cfg.Database.Port, cfg.Database.Username,
			cfg.Database.Password, cfg.Database.DBName, cfg.Database.SSLMode)
		return gorm.Open(postgres.Open(dsn), &gorm.Config{})
	}

	// SQLite 사용
	return gorm.Open(sqlite.Open("app.db"), &gorm.Config{})
}

// NewTestDatabase는 테스트용 인메모리 SQLite 데이터베이스를 생성합니다
func NewTestDatabase() (*gorm.DB, error) {
	return gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
}

// NewSQLiteDatabase는 지정된 파일 경로에 SQLite 데이터베이스를 생성합니다
func NewSQLiteDatabase(dbPath string) (*gorm.DB, error) {
	if dbPath == "" {
		dbPath = "test.db"
	}
	return gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
}
