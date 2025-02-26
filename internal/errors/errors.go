package errors

import (
	"errors"
	"net/http"
)

// 애플리케이션 에러 정의
var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserNotFound       = errors.New("user not found")
	ErrUserExists         = errors.New("user already exists")
	ErrInvalidToken       = errors.New("invalid token")
	ErrTokenExpired       = errors.New("token expired")
	ErrPermissionDenied   = errors.New("permission denied")
)

// AppError는 애플리케이션 에러를 표현합니다
type AppError struct {
	Err        error
	StatusCode int
	Message    string
}

func (e AppError) Error() string {
	return e.Message
}

// 에러 매핑 함수
func MapError(err error) AppError {
	switch {
	case errors.Is(err, ErrInvalidCredentials), errors.Is(err, ErrUserNotFound):
		return AppError{
			Err:        err,
			StatusCode: http.StatusUnauthorized,
			Message:    err.Error(),
		}
	case errors.Is(err, ErrUserExists):
		return AppError{
			Err:        err,
			StatusCode: http.StatusConflict,
			Message:    err.Error(),
		}
	case errors.Is(err, ErrInvalidToken), errors.Is(err, ErrTokenExpired):
		return AppError{
			Err:        err,
			StatusCode: http.StatusUnauthorized,
			Message:    err.Error(),
		}
	case errors.Is(err, ErrPermissionDenied):
		return AppError{
			Err:        err,
			StatusCode: http.StatusForbidden,
			Message:    err.Error(),
		}
	default:
		return AppError{
			Err:        err,
			StatusCode: http.StatusInternalServerError,
			Message:    "internal server error",
		}
	}
}
