package service

import (
	"mult-working/internal/dto"
	"mult-working/internal/errors"
	"mult-working/internal/models"
	"time"

	"gorm.io/gorm"
)

// RoomService는 채팅방 관련 기능을 제공합니다
type RoomService struct {
	db *gorm.DB
}

// NewRoomService는 새로운 RoomService 인스턴스를 생성합니다
func NewRoomService(db *gorm.DB) *RoomService {
	return &RoomService{
		db: db,
	}
}

// CreateRoom은 새 채팅방을 생성합니다
func (s *RoomService) CreateRoom(req dto.CreateRoomRequest, userID uint) (*dto.RoomResponse, error) {
	room := models.Room{
		Name:        req.Name,
		Description: req.Description,
		CreatedBy:   userID,
	}

	// 트랜잭션 시작
	tx := s.db.Begin()

	// 채팅방 생성
	if err := tx.Create(&room).Error; err != nil {
		tx.Rollback()
		return nil, errors.ErrDatabaseError
	}

	// 생성자를 채팅방 관리자로 추가
	roomUser := models.RoomUser{
		RoomID:   room.ID,
		UserID:   userID,
		JoinedAt: time.Now(),
		IsAdmin:  true,
	}

	if err := tx.Create(&roomUser).Error; err != nil {
		tx.Rollback()
		return nil, errors.ErrDatabaseError
	}

	// 트랜잭션 커밋
	if err := tx.Commit().Error; err != nil {
		return nil, errors.ErrDatabaseError
	}

	return &dto.RoomResponse{
		ID:          room.ID,
		Name:        room.Name,
		Description: room.Description,
		CreatedBy:   room.CreatedBy,
		CreatedAt:   room.CreatedAt,
		UserCount:   1,
	}, nil
}

// GetRooms는 모든 채팅방 목록을 반환합니다
func (s *RoomService) GetRooms() ([]dto.RoomResponse, error) {
	var rooms []models.Room
	if err := s.db.Find(&rooms).Error; err != nil {
		return nil, errors.ErrDatabaseError
	}

	var response []dto.RoomResponse
	for _, room := range rooms {
		// 각 채팅방의 사용자 수 조회
		var userCount int64
		s.db.Model(&models.RoomUser{}).Where("room_id = ?", room.ID).Count(&userCount)

		response = append(response, dto.RoomResponse{
			ID:          room.ID,
			Name:        room.Name,
			Description: room.Description,
			CreatedBy:   room.CreatedBy,
			CreatedAt:   room.CreatedAt,
			UserCount:   int(userCount),
		})
	}

	return response, nil
}

// GetRoom은 특정 채팅방 정보를 반환합니다
func (s *RoomService) GetRoom(roomID uint) (*dto.RoomResponse, error) {
	var room models.Room
	if err := s.db.First(&room, roomID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, errors.ErrRoomNotFound
		}
		return nil, errors.ErrDatabaseError
	}

	// 채팅방 사용자 수 조회
	var userCount int64
	s.db.Model(&models.RoomUser{}).Where("room_id = ?", room.ID).Count(&userCount)

	return &dto.RoomResponse{
		ID:          room.ID,
		Name:        room.Name,
		Description: room.Description,
		CreatedBy:   room.CreatedBy,
		CreatedAt:   room.CreatedAt,
		UserCount:   int(userCount),
	}, nil
}

// JoinRoom은 사용자를 채팅방에 참여시킵니다
func (s *RoomService) JoinRoom(roomID, userID uint) error {
	// 채팅방 존재 여부 확인
	var room models.Room
	if err := s.db.First(&room, roomID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.ErrRoomNotFound
		}
		return errors.ErrDatabaseError
	}

	// 이미 참여 중인지 확인
	var count int64
	if err := s.db.Model(&models.RoomUser{}).Where("room_id = ? AND user_id = ?", roomID, userID).Count(&count).Error; err != nil {
		return errors.ErrDatabaseError
	}

	if count > 0 {
		return errors.ErrAlreadyJoined
	}

	// 채팅방에 참여
	roomUser := models.RoomUser{
		RoomID:   roomID,
		UserID:   userID,
		JoinedAt: time.Now(),
		IsAdmin:  false,
	}

	if err := s.db.Create(&roomUser).Error; err != nil {
		return errors.ErrDatabaseError
	}

	return nil
}

// LeaveRoom은 사용자를 채팅방에서 나가게 합니다
func (s *RoomService) LeaveRoom(roomID, userID uint) error {
	// 채팅방 존재 여부 확인
	var room models.Room
	if err := s.db.First(&room, roomID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.ErrRoomNotFound
		}
		return errors.ErrDatabaseError
	}

	// 참여 중인지 확인
	var roomUser models.RoomUser
	if err := s.db.Where("room_id = ? AND user_id = ?", roomID, userID).First(&roomUser).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return errors.ErrNotJoined
		}
		return errors.ErrDatabaseError
	}

	// 채팅방 생성자는 나갈 수 없음
	if room.CreatedBy == userID {
		return errors.ErrCannotLeave
	}

	// 채팅방에서 나가기
	if err := s.db.Delete(&roomUser).Error; err != nil {
		return errors.ErrDatabaseError
	}

	return nil
}

// GetUserRooms는 사용자가 참여 중인 채팅방 목록을 반환합니다
func (s *RoomService) GetUserRooms(userID uint) ([]dto.RoomResponse, error) {
	var roomUsers []models.RoomUser
	if err := s.db.Where("user_id = ?", userID).Find(&roomUsers).Error; err != nil {
		return nil, errors.ErrDatabaseError
	}

	var roomIDs []uint
	for _, ru := range roomUsers {
		roomIDs = append(roomIDs, ru.RoomID)
	}

	if len(roomIDs) == 0 {
		return []dto.RoomResponse{}, nil
	}

	var rooms []models.Room
	if err := s.db.Where("id IN ?", roomIDs).Find(&rooms).Error; err != nil {
		return nil, errors.ErrDatabaseError
	}

	var response []dto.RoomResponse
	for _, room := range rooms {
		// 각 채팅방의 사용자 수 조회
		var userCount int64
		s.db.Model(&models.RoomUser{}).Where("room_id = ?", room.ID).Count(&userCount)

		response = append(response, dto.RoomResponse{
			ID:          room.ID,
			Name:        room.Name,
			Description: room.Description,
			CreatedBy:   room.CreatedBy,
			CreatedAt:   room.CreatedAt,
			UserCount:   int(userCount),
		})
	}

	return response, nil
}
