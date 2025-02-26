package kafka

import (
	"github.com/confluentinc/confluent-kafka-go/kafka"
)

// Producer는 Kafka 메시지 프로듀서를 래핑합니다
type ProducerImpl struct {
	producer *kafka.Producer
}

// NewProducer는 새 Kafka 프로듀서를 생성합니다
func NewProducer(bootstrapServers []string) (*ProducerImpl, error) {
	p, err := kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers": bootstrapServers[0],
	})

	if err != nil {
		return nil, err
	}

	// 백그라운드에서 전송 결과 처리
	go func() {
		for e := range p.Events() {
			switch ev := e.(type) {
			case *kafka.Message:
				if ev.TopicPartition.Error != nil {
					// 메시지 전송 실패
				}
			}
		}
	}()

	return &ProducerImpl{producer: p}, nil
}

// Produce는 지정된 토픽에 메시지를 발행합니다
func (p *ProducerImpl) Produce(topic string, value []byte) error {
	return p.producer.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
		Value:          value,
	}, nil)
}

// Close는 프로듀서를 닫습니다
func (p *ProducerImpl) Close() {
	p.producer.Close()
}
