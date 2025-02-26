package main

import (
	"context"
	"github.com/gin-gonic/gin"
	"go.uber.org/fx"
	"gorm.io/gorm"
	"mult-working/internal/config"
	"mult-working/internal/handler"
	"mult-working/internal/middleware"
	"mult-working/internal/service"
	"mult-working/pkg/database"
	"mult-working/pkg/kafka"
)

func main() {
	app := fx.New(
		// 의존성 제공
		fx.Provide(
			config.LoadConfig,
			database.NewDatabase,
			kafka.NewClient,
			newGinEngine,
			newAuthService,
			handler.NewHandler,
		),
		// 애플리케이션 시작
		fx.Invoke(startServer),
	)

	app.Run()
}

func newGinEngine() *gin.Engine {
	r := gin.Default()
	// CORS 미들웨어 설정 추가
	r.Use(middleware.SetupCORS())
	return r
}

func newAuthService(cfg *config.Config, db *gorm.DB) *service.AuthService {
	return service.NewAuthService(db, []byte(cfg.Auth.SymmetricKey), cfg.Auth.TokenDuration)
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
					if err := database.DBAutoMigrate(p.DB); err != nil {
						return err
					}
				}

				// 라우트 설정
				p.Handler.SetupRoutes(p.Router)
				// 정적 파일 제공 (프로덕션 환경에서 클라이언트 앱 서빙)
				/*p.Router.Static("/assets", "./client/dist/assets")
				p.Router.StaticFile("/", "./client/dist/index.html")

				// 모든 경로를 SPA로 리다이렉트 (클라이언트 라우팅 지원)
				p.Router.NoRoute(func(c *gin.Context) {
					c.File("./client/dist/index.html")
				})*/

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
