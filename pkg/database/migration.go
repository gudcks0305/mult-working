package database

import (
	"mult-working/internal/models"

	"gorm.io/gorm"
)

// AutoMigrate는 데이터베이스 스키마를 자동으로 마이그레이션합니다
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Message{},
	)
}
