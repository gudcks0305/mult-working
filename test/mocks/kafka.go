package mocks

import (
	"context"
	"mult-working/pkg/kafka"
)

type KafkaClient struct {
	Messages map[string][]string
}

// 인터페이스 구현 확인
var _ kafka.KafkaInterface = (*KafkaClient)(nil)

func NewKafkaClient() *KafkaClient {
	return &KafkaClient{
		Messages: make(map[string][]string),
	}
}

func (m *KafkaClient) Publish(ctx context.Context, key, value string) error {
	if m.Messages == nil {
		m.Messages = make(map[string][]string)
	}
	m.Messages[key] = append(m.Messages[key], value)
	return nil
}

func (m *KafkaClient) Subscribe(ctx context.Context) (string, error) {
	return "", nil
}

func (m *KafkaClient) Close() error {
	return nil
}
