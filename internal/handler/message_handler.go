package handler

import (
	"mult-working/internal/dto"
	"mult-working/internal/errors"
	"mult-working/internal/service"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// MessageHandler는 메시지 관련 핸들러입니다
type MessageHandler struct {
	messageService *service.MessageService
}

// NewMessageHandler는 새로운 MessageHandler 인스턴스를 생성합니다
func NewMessageHandler(messageService *service.MessageService) *MessageHandler {
	return &MessageHandler{
		messageService: messageService,
	}
}

// CreateMessage는 새 메시지를 생성합니다
func (h *MessageHandler) CreateMessage(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req dto.CreateMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	message, err := h.messageService.CreateMessage(req, userID.(uint))
	if err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusCreated, message)
}

// GetRoomMessages는 특정 채팅방의 메시지 목록을 반환합니다
func (h *MessageHandler) GetRoomMessages(c *gin.Context) {
	roomId := c.Param("roomId")
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	offset := (page - 1) * limit

	// 사용자 이름 포함하는 구조체
	var messages []struct {
		ID        uint      `json:"id"`
		Content   string    `json:"content"`
		UserID    uint      `json:"userId"`
		Username  string    `json:"username"`
		RoomID    uint      `json:"roomId"`
		CreatedAt time.Time `json:"createdAt"`
	}

	err := h.messageService.GetMessagesByRoomId(roomId, limit, offset, &messages)
	if err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusOK, messages)
}
