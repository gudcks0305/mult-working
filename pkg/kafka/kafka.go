package kafka

import (
	"context"
	"mult-working/internal/config"

	"github.com/segmentio/kafka-go"
)

// KafkaInterface는 Kafka 클라이언트의 인터페이스를 정의합니다
type KafkaInterface interface {
	Publish(ctx context.Context, key, value string) error
	Subscribe(ctx context.Context) (string, error)
	Close() error
}

type Client struct {
	writer *kafka.Writer
	reader *kafka.Reader
}

func NewClient(cfg *config.Config) KafkaInterface {
	kafkaConfig := cfg.Kafka

	// 직접 Writer 인스턴스 생성 (NewWriter 대신)
	writer := &kafka.Writer{
		Addr:     kafka.TCP(kafkaConfig.Brokers...),
		Topic:    kafkaConfig.Topic,
		Balancer: &kafka.LeastBytes{},
	}

	// Reader 생성
	reader := kafka.NewReader(kafka.ReaderConfig{
		Brokers: kafkaConfig.Brokers,
		Topic:   kafkaConfig.Topic,
		GroupID: "my-group",
	})

	return &Client{
		writer: writer,
		reader: reader,
	}
}

func (c *Client) Publish(ctx context.Context, key, value string) error {
	return c.writer.WriteMessages(ctx, kafka.Message{
		Key:   []byte(key),
		Value: []byte(value),
	})
}

func (c *Client) Subscribe(ctx context.Context) (string, error) {
	msg, err := c.reader.ReadMessage(ctx)
	if err != nil {
		return "", err
	}
	return string(msg.Value), nil
}

func (c *Client) Close() error {
	if err := c.writer.Close(); err != nil {
		return err
	}
	return c.reader.Close()
}
