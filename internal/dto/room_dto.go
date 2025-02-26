package dto

import "time"

// CreateRoomRequest는 채팅방 생성 요청 DTO입니다
type CreateRoomRequest struct {
	Name        string `json:"name" binding:"required,min=3,max=100"`
	Description string `json:"description" binding:"max=500"`
}

// RoomResponse는 채팅방 응답 DTO입니다
type RoomResponse struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedBy   uint      `json:"createdBy"`
	CreatedAt   time.Time `json:"createdAt"`
	UserCount   int       `json:"userCount"`
}

// JoinRoomRequest는 채팅방 참여 요청 DTO입니다
type JoinRoomRequest struct {
	RoomID uint `json:"roomId" binding:"required"`
}
