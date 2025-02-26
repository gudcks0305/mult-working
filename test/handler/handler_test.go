package handler_test

import (
	"mult-working/internal/handler"
	"mult-working/test/mocks"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestHandler(t *testing.T) {
	// 테스트용 인메모리 데이터베이스 생성
	db, err := mocks.NewTestDatabase()
	assert.NoError(t, err)

	// 테스트용 Kafka 모의 객체 생성
	mockKafka := mocks.NewKafkaClient()

	// 핸들러 생성
	h := handler.NewHandler(db, mockKafka)

	// 테스트 로직...
	assert.NotNil(t, h)
}
