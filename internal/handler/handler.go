package handler

import (
	"mult-working/internal/errors"
	"mult-working/internal/middleware"
	"mult-working/internal/service"
	"mult-working/pkg/kafka"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	db               *gorm.DB
	kafka            kafka.KafkaInterface
	authService      *service.AuthService
	roomService      *service.RoomService
	messageService   *service.MessageService
	roomHandler      *RoomHandler
	messageHandler   *MessageHandler
	webSocketHandler *WebSocketHandler
}

func NewHandler(db *gorm.DB, kafka kafka.KafkaInterface, authService *service.AuthService) *Handler {
	roomService := service.NewRoomService(db)
	messageService := service.NewMessageService(db)

	roomHandler := NewRoomHandler(roomService)
	messageHandler := NewMessageHandler(messageService)
	webSocketHandler := NewWebSocketHandler(messageService, authService)

	return &Handler{
		db:               db,
		kafka:            kafka,
		authService:      authService,
		roomService:      roomService,
		messageService:   messageService,
		roomHandler:      roomHandler,
		messageHandler:   messageHandler,
		webSocketHandler: webSocketHandler,
	}
}

func (h *Handler) SetupRoutes(r *gin.Engine) {
	// API 라우트 설정
	api := r.Group("/api")
	{
		// 공개 라우트
		h.registerAuthRoutes(api)

		// 보호된 라우트
		protected := api.Group("/protected")
		protected.Use(middleware.JWTAuthMiddleware(h.authService))
		{
			protected.GET("/profile", h.GetProfile)

			// 채팅방 라우트
			rooms := protected.Group("/rooms")
			{
				rooms.GET("", h.roomHandler.GetRooms)
				rooms.POST("", h.roomHandler.CreateRoom)
				rooms.GET("/:id", h.roomHandler.GetRoom)
				rooms.POST("/join", h.roomHandler.JoinRoom)
				rooms.DELETE("/:id/leave", h.roomHandler.LeaveRoom)
				rooms.GET("/me", h.roomHandler.GetUserRooms)
			}

			// 메시지 라우트
			messages := protected.Group("/messages")
			{
				messages.POST("", h.messageHandler.CreateMessage)
				messages.GET("/room/:roomId", h.messageHandler.GetRoomMessages)
			}

			// 웹소켓 라우트
		}
		api.GET("/ws", h.webSocketHandler.HandleWebSocket)

	}
}

// GetProfile은 인증된 사용자의 프로필을 반환합니다
func (h *Handler) GetProfile(c *gin.Context) {
	userID, _ := c.Get("userID")

	var user struct {
		ID       uint   `json:"id"`
		Username string `json:"username"`
		Email    string `json:"email"`
	}

	if err := h.db.Table("users").Select("id, username, email").Where("id = ?", userID).First(&user).Error; err != nil {
		appErr := errors.MapError(errors.ErrUserNotFound)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(200, user)
}

// CreateMessage는 새 메시지를 생성합니다
func (h *Handler) CreateMessage(c *gin.Context) {
	userID, _ := c.Get("userID")

	var req struct {
		Content string `json:"content" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	message := map[string]interface{}{
		"user_id": userID,
		"content": req.Content,
	}

	if err := h.db.Table("messages").Create(message).Error; err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	// Kafka에 메시지 발행
	if err := h.kafka.Publish(c.Request.Context(), "message", req.Content); err != nil {
		appErr := errors.MapError(err)
		c.JSON(appErr.StatusCode, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(201, gin.H{"message": "Message created successfully"})
}
