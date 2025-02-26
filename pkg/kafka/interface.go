package kafka

import "mult-working/internal/config"

type KafkaInterface interface {
	Produce(topic string, value []byte) error
	Consume() ([]byte, error)
	Close() error
	GetProducer() Producer
	GetConsumer() Consumer
}

// Producer는 Kafka 메시지 생산자 인터페이스입니다
type Producer interface {
	// Produce는 지정된 토픽에 메시지를 발행합니다
	Produce(topic string, value []byte) error
	// Close는 프로듀서를 닫습니다
	Close()
}

// MessageHandler는 Kafka 메시지를 처리하는 콜백 함수 타입입니다
type MessageHandler func([]byte) error

// Consumer는 Kafka 메시지 소비자 인터페이스입니다
type Consumer interface {
	// AddHandler는 메시지 처리 핸들러를 추가합니다
	AddHandler(handler MessageHandler)
	// Start는 백그라운드에서 메시지 소비를 시작합니다
	Start()
	// Stop은 메시지 소비를 중지합니다
	Stop()
	// Consume은 메시지를 동기적으로 소비합니다
	Consume() ([]byte, error)
	// Close는 컨슈머를 닫습니다
	Close()
}

type Client struct {
	Producer
	Consumer
}

func NewClient(cfg *config.Config) KafkaInterface {
	producers, err := NewProducer(cfg.Kafka.Brokers)
	if err != nil {
		panic(err)
	}

	consumers, err := NewConsumer(cfg.Kafka.Topic, "chat-group", cfg.Kafka.Brokers)
	if err != nil {
		panic(err)
	}

	client := Client{
		Producer: producers,
		Consumer: consumers,
	}

	return client
}

func (c Client) Close() error {
	c.Producer.Close()
	c.Consumer.Close()
	return nil
}

func (c Client) GetProducer() Producer {
	return c.Producer
}

func (c Client) GetConsumer() Consumer {
	return c.Consumer
}
