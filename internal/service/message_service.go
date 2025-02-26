package service

import (
	"mult-working/internal/dto"
	"mult-working/internal/errors"
	"mult-working/internal/models"
	"time"

	"gorm.io/gorm"
)

// MessageService는 메시지 관련 기능을 제공합니다
type MessageService struct {
	db *gorm.DB
}

// NewMessageService는 새로운 MessageService 인스턴스를 생성합니다
func NewMessageService(db *gorm.DB) *MessageService {
	return &MessageService{
		db: db,
	}
}

// CreateMessage는 새 메시지를 생성합니다
func (s *MessageService) CreateMessage(req dto.CreateMessageRequest, userID uint) (*dto.MessageResponse, error) {
	// 채팅방 존재 여부 확인
	var room models.Room
	if err := s.db.First(&room, req.RoomID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrRoomNotFound
		}
		return nil, errors.ErrDatabaseError
	}

	// 사용자가 채팅방에 참여 중인지 확인
	var count int64
	if err := s.db.Model(&models.RoomUser{}).Where("room_id = ? AND user_id = ?", req.RoomID, userID).Count(&count).Error; err != nil {
		return nil, errors.ErrDatabaseError
	}

	if count == 0 {
		return nil, errors.ErrNotJoined
	}

	// 메시지 생성
	message := models.Message{
		Content: req.Content,
		UserID:  userID,
		RoomID:  req.RoomID,
	}

	if err := s.db.Create(&message).Error; err != nil {
		return nil, errors.ErrDatabaseError
	}

	// 사용자 정보 조회
	var user models.User
	if err := s.db.Select("username").First(&user, userID).Error; err != nil {
		return nil, errors.ErrDatabaseError
	}

	return &dto.MessageResponse{
		ID:        message.ID,
		Content:   message.Content,
		UserID:    message.UserID,
		Username:  user.Username,
		RoomID:    message.RoomID,
		CreatedAt: message.CreatedAt,
	}, nil
}

// GetRoomMessages는 특정 채팅방의 메시지 목록을 반환합니다
func (s *MessageService) GetRoomMessages(roomID, userID uint) ([]dto.MessageResponse, error) {
	// 채팅방 존재 여부 확인
	var room models.Room
	if err := s.db.First(&room, roomID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrRoomNotFound
		}
		return nil, errors.ErrDatabaseError
	}

	// 사용자가 채팅방에 참여 중인지 확인
	var count int64
	if err := s.db.Model(&models.RoomUser{}).Where("room_id = ? AND user_id = ?", roomID, userID).Count(&count).Error; err != nil {
		return nil, errors.ErrDatabaseError
	}

	if count == 0 {
		return nil, errors.ErrNotJoined
	}

	// 메시지 조회
	var messages []struct {
		ID        uint      `json:"id"`
		Content   string    `json:"content"`
		UserID    uint      `json:"userId"`
		Username  string    `json:"username"`
		RoomID    uint      `json:"roomId"`
		CreatedAt time.Time `json:"createdAt"`
	}

	if err := s.db.Table("messages").
		Select("messages.id, messages.content, messages.user_id, users.username, messages.room_id, messages.created_at").
		Joins("left join users on messages.user_id = users.id").
		Where("messages.room_id = ?", roomID).
		Order("messages.created_at desc").
		Limit(100).
		Find(&messages).Error; err != nil {
		return nil, errors.ErrDatabaseError
	}

	var response []dto.MessageResponse
	for _, m := range messages {
		response = append(response, dto.MessageResponse{
			ID:        m.ID,
			Content:   m.Content,
			UserID:    m.UserID,
			Username:  m.Username,
			RoomID:    m.RoomID,
			CreatedAt: m.CreatedAt,
		})
	}

	return response, nil
}

// GetDB는 서비스의 DB 인스턴스를 반환합니다
func (s *MessageService) GetDB() *gorm.DB {
	return s.db
}
