package handler

import (
	"mult-working/pkg/kafka"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	db    *gorm.DB
	kafka kafka.KafkaInterface
}

func NewHandler(db *gorm.DB, kafka kafka.KafkaInterface) *Handler {
	return &Handler{
		db:    db,
		kafka: kafka,
	}
}

func (h *Handler) SetupRoutes(r *gin.Engine) {
	// API 라우트 설정
	api := r.Group("/api")
	{
		api.GET("/ws", h.handleWebSocket)
		// 다른 라우트들...
	}
}
