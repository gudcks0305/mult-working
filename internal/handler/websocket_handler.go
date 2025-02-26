package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"mult-working/internal/config"
	"mult-working/internal/dto"
	"mult-working/internal/service"
	"mult-working/pkg/kafka"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

// Kafka 메시지 구조체
type KafkaMessage struct {
	Type    string          `json:"type"`
	RoomID  uint            `json:"roomId"`
	Payload json.RawMessage `json:"payload"`
}

// WebSocketHandler는 웹소켓 관련 핸들러입니다
type WebSocketHandler struct {
	messageService *service.MessageService
	authService    *service.AuthService
	clients        map[uint]map[*websocket.Conn]bool
	rooms          map[uint]map[*websocket.Conn]bool
	mutex          sync.Mutex
	upgrader       websocket.Upgrader
	kafkaProducer  kafka.Producer
	kafkaConsumer  kafka.Consumer
}

// NewWebSocketHandler는 새로운 WebSocketHandler 인스턴스를 생성합니다
func NewWebSocketHandler(messageService *service.MessageService, authService *service.AuthService, kafkaProducer kafka.Producer, kafkaConsumer kafka.Consumer) *WebSocketHandler {
	// 서버 인스턴스 ID 생성 (UUID 또는 호스트명+프로세스ID 등으로 생성)

	handler := &WebSocketHandler{
		messageService: messageService,
		authService:    authService,
		clients:        make(map[uint]map[*websocket.Conn]bool),
		rooms:          make(map[uint]map[*websocket.Conn]bool),
		kafkaProducer:  kafkaProducer,
		kafkaConsumer:  kafkaConsumer,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				// 개발 환경에서는 모든 오리진 허용
				return true
			},
		},
	}

	// Kafka 컨슈머 설정 및 메시지 리스넝을 시작
	handler.setupKafkaConsumer()

	return handler
}

func (h *WebSocketHandler) setupKafkaConsumer() {

	// Kafka 컨슈머 생성
	consumer := h.kafkaConsumer
	// 메시지 핸들러 등록
	consumer.AddHandler(func(msg []byte) error {
		// 메시지 파싱
		var kafkaMsg KafkaMessage
		if err := json.Unmarshal(msg, &kafkaMsg); err != nil {
			log.Printf("Error parsing Kafka message: %v", err)
			return err
		}

		// 발신 서버 ID가 현재 서버와 같으면 스킵 (이미 로컬에서 처리됨)
		var metadata struct {
			Payload json.RawMessage `json:"payload"`
		}
		var Message struct {
			ServerID string `json:"serverId"`
		}
		if err := json.Unmarshal(kafkaMsg.Payload, &metadata); err == nil {
			fmt.Println("metadata", string(kafkaMsg.Payload))
			if metadata.Payload != nil {
				if err := json.Unmarshal(metadata.Payload, &Message); err == nil {
					fmt.Println("Message", Message.ServerID)
					if Message.ServerID == config.ServerInstanceID {
						return nil
					}
				}
			}
		}

		// 클라이언트에게 메시지 전달
		h.localBroadcastToRoom(kafkaMsg.RoomID, kafkaMsg.Payload)
		return nil
	})

	// 컨슈머 시작
	consumer.Start()
}

// HandleWebSocket은 웹소켓 연결을 처리합니다
func (h *WebSocketHandler) HandleWebSocket(c *gin.Context) {
	// 쿼리 파라미터에서 토큰 가져오기
	token := c.Query("token")
	log.Printf("WebSocket connection attempt with token: %v", token != "")

	if token != "" {
		// 토큰이 쿼리 파라미터로 전달된 경우, 헤더에 설정
		c.Request.Header.Set("Authorization", "Bearer "+token)

		// 인증 처리를 위해 AuthService 호출
		userID, err := h.authService.VerifyToken(token)
		if err != nil {
			log.Printf("Token verification failed: %v", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		// 유효한 토큰인 경우 userID 설정
		c.Set("userID", userID)
		log.Printf("Token verified for user ID: %v", userID)
	} else {
		log.Printf("No token provided in WebSocket connection")
	}

	// 기존 코드와 동일하게 userID 가져오기
	userID, exists := c.Get("userID")
	if !exists {
		log.Printf("No userID in context, unauthorized")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	userIDUint := userID.(uint)
	log.Printf("Upgrading WebSocket connection for user ID: %v", userIDUint)

	// 웹소켓 연결 업그레이드
	conn, err := h.upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	log.Printf("WebSocket connection upgraded successfully for user ID: %v", userIDUint)

	// 클라이언트 등록
	h.mutex.Lock()
	if _, ok := h.clients[userIDUint]; !ok {
		h.clients[userIDUint] = make(map[*websocket.Conn]bool)
	}
	h.clients[userIDUint][conn] = true
	h.mutex.Unlock()

	// 클라이언트 연결 종료 시 정리
	defer func() {
		h.mutex.Lock()
		delete(h.clients[userIDUint], conn)
		// 모든 방에서 클라이언트 제거
		for roomID, clients := range h.rooms {
			if _, ok := clients[conn]; ok {
				delete(h.rooms[roomID], conn)
			}
		}
		h.mutex.Unlock()
	}()

	// 메시지 처리
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Websocket error: %v", err)
			}
			break
		}

		// 메시지 파싱
		var msg struct {
			Type    string          `json:"type"`
			Payload json.RawMessage `json:"payload"`
		}
		fmt.Println(string(message))
		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("Failed to parse message: %v", err)
			continue
		}

		// 메시지 타입에 따른 처리
		switch msg.Type {
		case "join_room":
			var payload struct {
				RoomID uint `json:"roomId"`
			}
			if err := json.Unmarshal(msg.Payload, &payload); err != nil {
				log.Printf("Failed to parse join_room payload: %v", err)
				continue
			}
			h.handleJoinRoom(conn, payload.RoomID, userIDUint)

		case "leave_room":
			var payload struct {
				RoomID uint `json:"roomId"`
			}
			if err := json.Unmarshal(msg.Payload, &payload); err != nil {
				log.Printf("Failed to parse leave_room payload: %v", err)
				continue
			}
			h.handleLeaveRoom(conn, payload.RoomID)

		case "send_message":
			var payload struct {
				Content string `json:"content"`
				RoomID  uint   `json:"roomId"`
			}
			if err := json.Unmarshal(msg.Payload, &payload); err != nil {
				log.Printf("Failed to parse send_message payload: %v", err)
				continue
			}
			h.handleSendMessage(conn, payload.Content, payload.RoomID, userIDUint)
		}
	}
}

// handleJoinRoom은 채팅방 참여 요청을 처리합니다
func (h *WebSocketHandler) handleJoinRoom(conn *websocket.Conn, roomID, userID uint) {
	// 채팅방에 참여
	h.mutex.Lock()
	if _, ok := h.rooms[roomID]; !ok {
		h.rooms[roomID] = make(map[*websocket.Conn]bool)
	}
	h.rooms[roomID][conn] = true
	h.mutex.Unlock()

	// 참여 메시지 브로드캐스트
	var user struct {
		Username string
	}

	// DB 필드 접근 문제 해결
	if err := h.messageService.GetDB().Table("users").Select("username").Where("id = ?", userID).First(&user).Error; err != nil {
		log.Printf("Failed to get username: %v", err)
		return
	}

	joinMsg := map[string]interface{}{
		"type": "user_joined",
		"payload": map[string]interface{}{
			"userId":   userID,
			"username": user.Username,
			"roomId":   roomID,
			"time":     time.Now(),
		},
	}

	h.broadcastToRoom(roomID, joinMsg)
}

// handleLeaveRoom은 채팅방 퇴장 요청을 처리합니다
func (h *WebSocketHandler) handleLeaveRoom(conn *websocket.Conn, roomID uint) {
	h.mutex.Lock()
	if _, ok := h.rooms[roomID]; ok {
		delete(h.rooms[roomID], conn)
	}
	h.mutex.Unlock()
}

// handleSendMessage는 메시지 전송 요청을 처리합니다
func (h *WebSocketHandler) handleSendMessage(conn *websocket.Conn, content string, roomID, userID uint) {
	// 메시지 저장
	req := dto.CreateMessageRequest{
		Content: content,
		RoomID:  roomID,
	}

	message, err := h.messageService.CreateMessage(req, userID)
	if err != nil {
		log.Printf("Failed to create message: %v", err)
		return
	}

	// 메시지 브로드캐스트
	msgData := map[string]interface{}{
		"type":    "new_message",
		"payload": message,
	}

	h.broadcastToRoom(roomID, msgData)
}

// broadcastToRoom은 특정 채팅방의 모든 클라이언트에게 메시지를 전송합니다
func (h *WebSocketHandler) broadcastToRoom(roomID uint, message interface{}) {
	// 메시지를 JSON으로 직렬화
	data, err := json.Marshal(message)
	if err != nil {
		log.Printf("Failed to marshal message: %v", err)
		return
	}

	// 메시지에 서버 ID 메타데이터 추가
	var msgMap map[string]interface{}
	if err := json.Unmarshal(data, &msgMap); err == nil {
		if payload, ok := msgMap["payload"].(map[string]interface{}); ok {
			payload["serverId"] = config.ServerInstanceID
			msgMap["payload"] = payload
		}

		// 업데이트된 메시지 다시 직렬화
		if updatedData, err := json.Marshal(msgMap); err == nil {
			data = updatedData
		}
	}

	// Kafka 메시지 구조체 생성
	kafkaMsg := KafkaMessage{
		Type:    "message",
		RoomID:  roomID,
		Payload: data,
	}

	// Kafka에 메시지 발행
	kafkaData, err := json.Marshal(kafkaMsg)
	if err != nil {
		log.Printf("Failed to marshal Kafka message: %v", err)
		return
	}

	if err := h.kafkaProducer.Produce("myapp-topic", kafkaData); err != nil {
		log.Printf("Failed to produce Kafka message: %v", err)
		return
	}

	// 로컬 클라이언트에게도 바로 메시지 전송
	h.localBroadcastToRoom(roomID, data)
}

// localBroadcastToRoom은 현재 서버의 로컬 클라이언트에게만 메시지를 전송합니다
func (h *WebSocketHandler) localBroadcastToRoom(roomID uint, message json.RawMessage) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	if clients, ok := h.rooms[roomID]; ok {
		log.Printf("Broadcasting to room %d (%d clients)", roomID, len(clients))
		for client := range clients {
			if err := client.WriteMessage(websocket.TextMessage, message); err != nil {
				log.Printf("Failed to send message: %v", err)
				client.Close()
				delete(clients, client)
			}
		}
	} else {
		log.Printf("No clients in room %d", roomID)
	}
}
