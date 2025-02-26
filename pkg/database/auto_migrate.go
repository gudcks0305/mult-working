package database

import (
	"mult-working/internal/models"

	"gorm.io/gorm"
)

// AutoMigrate는 모든 모델에 대한 데이터베이스 마이그레이션을 실행합니다
func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.Message{},
		&models.Room{},
		&models.RoomUser{},
	)
}
