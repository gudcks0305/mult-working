package dto

import "time"

// CreateMessageRequest는 메시지 생성 요청 DTO입니다
type CreateMessageRequest struct {
	Content string `json:"content" binding:"required,max=1000"`
	RoomID  uint   `json:"roomId" binding:"required"`
}

// MessageResponse는 메시지 응답 DTO입니다
type MessageResponse struct {
	ID        uint      `json:"id"`
	Content   string    `json:"content"`
	UserID    uint      `json:"userId"`
	Username  string    `json:"username"`
	RoomID    uint      `json:"roomId"`
	CreatedAt time.Time `json:"createdAt"`
}
