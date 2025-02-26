package models

import (
	"time"

	"gorm.io/gorm"
)

type Message struct {
	gorm.Model
	Content   string    `json:"content"`
	UserID    uint      `json:"user_id"`
	Timestamp time.Time `json:"timestamp"`
}

type User struct {
	gorm.Model
	Username string    `json:"username"`
	Messages []Message `json:"messages"`
}
