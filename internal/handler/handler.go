package handler

import (
	"mult-working/internal/middleware"
	"mult-working/internal/service"
	"mult-working/pkg/kafka"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	db          *gorm.DB
	kafka       kafka.KafkaInterface
	authService *service.AuthService
}

func NewHandler(db *gorm.DB, kafka kafka.KafkaInterface, authService *service.AuthService) *Handler {
	return &Handler{
		db:          db,
		kafka:       kafka,
		authService: authService,
	}
}

func (h *Handler) SetupRoutes(r *gin.Engine) {
	// API 라우트 설정
	api := r.Group("/api")
	{
		// 공개 라우트
		h.registerAuthRoutes(api)
		api.GET("/ws", h.handleWebSocket)

		// 보호된 라우트
		protected := api.Group("/protected")
		protected.Use(middleware.AuthMiddleware(h.authService))
		{
			protected.GET("/profile", h.GetProfile)
			protected.POST("/messages", h.CreateMessage)
		}
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
		c.JSON(500, gin.H{"error": "Failed to fetch user profile"})
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
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	message := map[string]interface{}{
		"user_id": userID,
		"content": req.Content,
	}

	if err := h.db.Table("messages").Create(message).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create message"})
		return
	}

	// Kafka에 메시지 발행
	if err := h.kafka.Publish(c.Request.Context(), "message", req.Content); err != nil {
		c.JSON(500, gin.H{"error": "Failed to publish message to Kafka"})
		return
	}

	c.JSON(201, gin.H{"message": "Message created successfully"})
}
