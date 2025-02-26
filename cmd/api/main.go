package main

import (
	"context"
	"mult-working/internal/config"
	"mult-working/internal/handler"
	"mult-working/pkg/database"
	"mult-working/pkg/kafka"

	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
	"gorm.io/gorm"
)

func main() {
	app := fx.New(
		// 의존성 제공
		fx.Provide(
			config.LoadConfig,
			database.NewDatabase,
			kafka.NewClient,
			newGinEngine,
			handler.NewHandler,
		),
		// 애플리케이션 시작
		fx.Invoke(startServer),
	)

	app.Run()
}

func newGinEngine() *gin.Engine {
	return gin.Default()
}

type HandlerParams struct {
	fx.In

	Lifecycle fx.Lifecycle
	Config    *config.Config
	DB        *gorm.DB
	Kafka     kafka.KafkaInterface
	Router    *gin.Engine
	Handler   *handler.Handler
}

func startServer(p HandlerParams) {
	p.Lifecycle.Append(
		fx.Hook{
			OnStart: func(ctx context.Context) error {
				// 설정에 따라 데이터베이스 마이그레이션 실행
				if p.Config.Database.AutoMigrate {
					if err := database.AutoMigrate(p.DB); err != nil {
						return err
					}
				}

				// 라우트 설정
				p.Handler.SetupRoutes(p.Router)

				// 서버 시작
				go p.Router.Run(":" + p.Config.Server.Port)
				return nil
			},
			OnStop: func(ctx context.Context) error {
				// Kafka 클라이언트 정리
				if err := p.Kafka.Close(); err != nil {
					return err
				}
				return nil
			},
		},
	)
}
