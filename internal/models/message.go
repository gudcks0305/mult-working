package models

import (
	"time"

	"gorm.io/gorm"
)

// Message는 채팅 메시지 모델입니다
type Message struct {
	ID        uint           `gorm:"primarykey" json:"id"`
	Content   string         `gorm:"size:1000;not null" json:"content"`
	UserID    uint           `gorm:"not null" json:"userId"`
	User      User           `gorm:"foreignKey:UserID" json:"-"`
	RoomID    uint           `gorm:"not null" json:"roomId"`
	Room      Room           `gorm:"foreignKey:RoomID" json:"-"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"-"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}
