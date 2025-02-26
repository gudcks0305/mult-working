package handler

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // 개발 환경용, 프로덕션에서는 적절히 수정 필요
	},
}

func (h *Handler) handleWebSocket(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("웹소켓 연결 실패: %v", err)
		return
	}
	defer conn.Close()

	// 웹소켓 메시지 처리
	for {
		messageType, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("메시지 읽기 실패: %v", err)
			break
		}

		// Kafka로 메시지 전송
		if err := h.kafka.Publish(c, "websocket", string(message)); err != nil {
			log.Printf("Kafka 메시지 전송 실패: %v", err)
			continue
		}

		// 클라이언트에게 응답
		if err := conn.WriteMessage(messageType, message); err != nil {
			log.Printf("메시지 쓰기 실패: %v", err)
			break
		}
	}
}
