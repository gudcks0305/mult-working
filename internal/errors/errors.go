package errors

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
)

// 애플리케이션 에러 정의
var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserNotFound       = errors.New("user not found")
	ErrUserExists         = errors.New("user already exists")
	ErrInvalidToken       = errors.New("invalid token")
	ErrTokenExpired       = errors.New("token expired")
	ErrPermissionDenied   = errors.New("permission denied")
	ErrInvalidRequest     = errors.New("invalid request")
	ErrDatabaseError      = errors.New("database error")
	ErrRoomNotFound       = errors.New("room not found")
	ErrAlreadyJoined      = errors.New("already joined the room")
	ErrNotJoined          = errors.New("not joined the room")
	ErrCannotLeave        = errors.New("creator cannot leave the room")
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
	case errors.Is(err, ErrInvalidRequest):
		return AppError{
			Err:        err,
			StatusCode: http.StatusBadRequest,
			Message:    err.Error(),
		}
	case errors.Is(err, ErrDatabaseError):
		return AppError{
			Err:        err,
			StatusCode: http.StatusInternalServerError,
			Message:    "Database operation failed",
		}
	default:
		// 바인딩 에러 처리
		var validationErrors validator.ValidationErrors
		if errors.As(err, &validationErrors) {
			var messages []string
			for _, e := range validationErrors {
				messages = append(messages, fmt.Sprintf("Field '%s' %s", e.Field(), getValidationErrorMsg(e)))
			}
			return AppError{
				Err:        err,
				StatusCode: http.StatusBadRequest,
				Message:    strings.Join(messages, "; "),
			}
		}

		// 기타 바인딩 에러
		if strings.Contains(err.Error(), "binding") {
			return AppError{
				Err:        err,
				StatusCode: http.StatusBadRequest,
				Message:    "Invalid request format",
			}
		}

		fmt.Println("[ERROR]", err)
		return AppError{
			Err:        err,
			StatusCode: http.StatusInternalServerError,
			Message:    "internal server error",
		}
	}
}

// 유효성 검사 에러 메시지 생성
func getValidationErrorMsg(e validator.FieldError) string {
	switch e.Tag() {
	case "required":
		return "is required"
	case "min":
		return fmt.Sprintf("must be at least %s characters", e.Param())
	case "max":
		return fmt.Sprintf("must be at most %s characters", e.Param())
	case "email":
		return "must be a valid email address"
	default:
		return fmt.Sprintf("failed on '%s' validation", e.Tag())
	}
}
