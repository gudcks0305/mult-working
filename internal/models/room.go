package models

import (
	"time"

	"gorm.io/gorm"
)

// Room은 채팅방 모델입니다
type Room struct {
	ID          uint           `gorm:"primarykey" json:"id"`
	Name        string         `gorm:"size:100;not null" json:"name"`
	Description string         `gorm:"size:500" json:"description"`
	CreatedBy   uint           `gorm:"not null" json:"createdBy"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"-"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Messages    []Message      `gorm:"foreignKey:RoomID" json:"-"`
	Users       []*User        `gorm:"many2many:room_users;" json:"-"`
}

// RoomUser는 채팅방과 사용자의 다대다 관계를 나타내는 모델입니다
type RoomUser struct {
	RoomID    uint      `gorm:"primaryKey" json:"roomId"`
	UserID    uint      `gorm:"primaryKey" json:"userId"`
	JoinedAt  time.Time `json:"joinedAt"`
	IsAdmin   bool      `gorm:"default:false" json:"isAdmin"`
	CreatedAt time.Time `json:"-"`
	UpdatedAt time.Time `json:"-"`
}
