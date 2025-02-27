package middleware

import (
	"github.com/gin-gonic/gin"
	"mult-working/internal/errors"
	"mult-working/internal/service"
)

// AuthMiddleware는 인증이 필요한 라우트를 보호하는 미들웨어입니다
func JWTAuthMiddleware(authService *service.AuthService) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			appErr := errors.MapError(errors.ErrInvalidToken)
			c.AbortWithStatusJSON(appErr.StatusCode, gin.H{"error": appErr.Message})
			return
		}

		// Bearer 접두사 제거
		if len(token) > 7 && token[:7] == "Bearer " {
			token = token[7:]
		} else {
			appErr := errors.MapError(errors.ErrInvalidToken)
			c.AbortWithStatusJSON(appErr.StatusCode, gin.H{"error": appErr.Message})
			return
		}
		// 토큰 검증
		userID, err := authService.VerifyToken(token)
		if err != nil {
			appErr := errors.MapError(err)
			c.AbortWithStatusJSON(appErr.StatusCode, gin.H{"error": appErr.Message})
			return
		}

		// 사용자 ID를 컨텍스트에 저장
		c.Set("userID", userID)
		c.Next()
	}
}
