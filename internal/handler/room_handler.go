package handler

import (
	"mult-working/internal/dto"
	"mult-working/internal/errors"
	"mult-working/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// RoomHandler는 채팅방 관련 핸들러입니다
type RoomHandler struct {
	roomService *service.RoomService
}

// NewRoomHandler는 새로운 RoomHandler 인스턴스를 생성합니다
func NewRoomHandler(roomService *service.RoomService) *RoomHandler {
	return &RoomHandler{
		roomService: roomService,
	}
}

// CreateRoom은 새 채팅방을 생성합니다
func (h *RoomHandler) CreateRoom(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req dto.CreateRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	room, err := h.roomService.CreateRoom(req, userID.(uint))
	if err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusCreated, room)
}

// GetRooms는 모든 채팅방 목록을 반환합니다
func (h *RoomHandler) GetRooms(c *gin.Context) {
	rooms, err := h.roomService.GetRooms()
	if err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusOK, rooms)
}

// GetRoom은 특정 채팅방 정보를 반환합니다
func (h *RoomHandler) GetRoom(c *gin.Context) {
	roomID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		appErr := errors.MapError(errors.ErrInvalidRequest)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	room, err := h.roomService.GetRoom(uint(roomID))
	if err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusOK, room)
}

// JoinRoom은 사용자를 채팅방에 참여시킵니다
func (h *RoomHandler) JoinRoom(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req dto.JoinRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	if err := h.roomService.JoinRoom(req.RoomID, userID.(uint)); err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully joined the room"})
}

// LeaveRoom은 사용자를 채팅방에서 나가게 합니다
func (h *RoomHandler) LeaveRoom(c *gin.Context) {
	userID, _ := c.Get("userID")
	roomID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		appErr := errors.MapError(errors.ErrInvalidRequest)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	if err := h.roomService.LeaveRoom(uint(roomID), userID.(uint)); err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Successfully left the room"})
}

// GetUserRooms는 사용자가 참여 중인 채팅방 목록을 반환합니다
func (h *RoomHandler) GetUserRooms(c *gin.Context) {
	userID, _ := c.Get("userID")

	rooms, err := h.roomService.GetUserRooms(userID.(uint))
	if err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusOK, rooms)
}
