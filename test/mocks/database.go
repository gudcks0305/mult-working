package mocks

import (
	"mult-working/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// NewTestDatabase는 테스트용 인메모리 SQLite 데이터베이스를 생성합니다
func NewTestDatabase() (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// 테스트용 스키마 마이그레이션
	err = db.AutoMigrate(&models.User{}, &models.Message{})
	if err != nil {
		return nil, err
	}

	return db, nil
}
