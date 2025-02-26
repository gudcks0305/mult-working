package dto

import "time"

// Message 관련 요청 DTO
type CreateMessageRequest struct {
	Content string `json:"content" binding:"required"`
}

// Message 관련 응답 DTO
type MessageResponse struct {
	ID        uint      `json:"id"`
	Content   string    `json:"content"`
	UserID    uint      `json:"user_id"`
	Username  string    `json:"username"`
	CreatedAt time.Time `json:"created_at"`
}
