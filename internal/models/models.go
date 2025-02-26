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
