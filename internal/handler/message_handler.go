package handler

import (
	"mult-working/internal/dto"
	"mult-working/internal/errors"
	"mult-working/internal/service"
	"net/http"
	"strconv"

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
	userID, _ := c.Get("userID")
	roomID, err := strconv.ParseUint(c.Param("roomId"), 10, 32)
	if err != nil {
		appErr := errors.MapError(errors.ErrInvalidRequest)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	messages, err := h.messageService.GetRoomMessages(uint(roomID), userID.(uint))
	if err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusOK, messages)
}
