package kafka

import (
	"fmt"
	"log"
	"time"

	"github.com/confluentinc/confluent-kafka-go/kafka"
)

// MessageHandler는 Kafka 메시지를 처리하는 콜백 함수 타입입니다

// Consumer는 Kafka 메시지 컨슈머를 래핑합니다
type ConsumerImpl struct {
	consumer *kafka.Consumer
	handlers []MessageHandler
	topic    string
	running  bool
}

// NewConsumer는 새 Kafka 컨슈머를 생성합니다
func NewConsumer(topic, groupID string, bootstrapServers []string) (*ConsumerImpl, error) {
	c, err := kafka.NewConsumer(&kafka.ConfigMap{
		"bootstrap.servers":  bootstrapServers[0],
		"group.id":           groupID,
		"auto.offset.reset":  "latest",
		"enable.auto.commit": true,
	})

	if err != nil {
		return nil, err
	}

	err = c.SubscribeTopics([]string{topic}, nil)
	if err != nil {
		c.Close()
		return nil, err
	}

	return &ConsumerImpl{
		consumer: c,
		handlers: []MessageHandler{},
		topic:    topic,
		running:  false,
	}, nil
}

// AddHandler는 메시지 처리 핸들러를 추가합니다
func (c *ConsumerImpl) AddHandler(handler MessageHandler) {
	c.handlers = append(c.handlers, handler)
}

// Start는 백그라운드에서 메시지 소비를 시작합니다
func (c *ConsumerImpl) Start() {
	if c.running {
		return
	}

	c.running = true

	// 백그라운드에서 메시지 리스닝
	go func() {
		for c.running {
			// Kafka에서 메시지 수신
			msg, err := c.Consume()
			if err != nil {
				log.Printf("Error consuming message: %v", err)
				time.Sleep(1 * time.Second)
				continue
			}

			// 등록된 모든 핸들러에게 메시지 전달
			for _, handler := range c.handlers {
				if err := handler(msg); err != nil {
					log.Printf("Error handling message: %v", err)
				}
			}
		}
	}()

}

// Stop은 메시지 소비를 중지합니다
func (c *ConsumerImpl) Stop() {
	c.running = false
}

// Consume는 메시지를 소비합니다
func (c *ConsumerImpl) Consume() ([]byte, error) {
	msg, err := c.consumer.ReadMessage(-1)
	if err != nil {
		return nil, err
	}
	fmt.Println("Received message", string(msg.Value))

	return msg.Value, nil
}

// Close는 컨슈머를 닫습니다
func (c *ConsumerImpl) Close() {
	c.Stop()
	c.consumer.Close()
}
