package service

import (
	"mult-working/internal/dto"
	"mult-working/internal/errors"
	"mult-working/internal/models"
	"time"

	"github.com/o1egl/paseto"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// AuthService는 인증 관련 기능을 제공합니다
type AuthService struct {
	db            *gorm.DB
	symmetricKey  []byte
	tokenDuration time.Duration
	paseto        *paseto.V2
}

// NewAuthService는 새로운 AuthService 인스턴스를 생성합니다
func NewAuthService(db *gorm.DB, symmetricKey []byte, tokenDuration time.Duration) *AuthService {
	// 키 길이 확인 및 조정 (chacha20poly1305는 32바이트 키 필요)
	if len(symmetricKey) != 32 {
		// 키가 32바이트가 아닌 경우 조정
		newKey := make([]byte, 32)
		copy(newKey, symmetricKey)
		// 키가 짧으면 0으로 채우고, 길면 자름
		symmetricKey = newKey
	}

	return &AuthService{
		db:            db,
		symmetricKey:  symmetricKey,
		tokenDuration: tokenDuration,
		paseto:        paseto.NewV2(),
	}
}

// Register는 새 사용자를 등록합니다
func (s *AuthService) Register(req dto.RegisterRequest) error {
	// 사용자 존재 여부 확인
	var count int64
	if err := s.db.Model(&models.User{}).Where("username = ? OR email = ?", req.Username, req.Email).Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return errors.ErrUserExists
	}

	// 비밀번호 해싱
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// 사용자 생성
	user := models.User{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
	}

	return s.db.Create(&user).Error
}

// Login은 사용자를 인증하고 PASETO 토큰을 반환합니다
func (s *AuthService) Login(req dto.LoginRequest) (*dto.TokenResponse, error) {
	var user models.User
	if result := s.db.Where("username = ?", req.Username).First(&user); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return nil, errors.ErrUserNotFound
		}
		return nil, result.Error
	}

	if !user.CheckPassword(req.Password) {
		return nil, errors.ErrInvalidCredentials
	}

	// PASETO 토큰 생성
	now := time.Now()
	expiration := now.Add(s.tokenDuration)

	// v2.local 토큰 (대칭 암호화)
	token, err := s.GenerateToken(user.ID)
	if err != nil {
		return nil, err
	}

	return &dto.TokenResponse{
		Token:     token,
		ExpiresAt: expiration,
	}, nil
}

// GenerateToken은 사용자 ID로 JWT 토큰을 생성합니다
func (s *AuthService) GenerateToken(userID uint) (string, error) {
	now := time.Now()
	exp := now.Add(s.tokenDuration)

	// 토큰 페이로드
	payload := map[string]interface{}{
		"user_id":    userID,
		"issued_at":  now.Unix(),
		"expires_at": exp.Unix(),
	}

	// 토큰 생성
	token, err := s.paseto.Encrypt(s.symmetricKey, payload, nil)
	if err != nil {
		return "", err
	}

	return token, nil
}

// VerifyToken은 PASETO 토큰을 검증하고 사용자 ID를 반환합니다
func (s *AuthService) VerifyToken(token string) (uint, error) {
	var payload map[string]interface{}

	// 토큰 검증
	err := s.paseto.Decrypt(token, s.symmetricKey, &payload, nil)
	if err != nil {
		return 0, errors.ErrInvalidToken
	}

	// 만료 시간 확인
	expiresAt, ok := payload["expires_at"].(float64)
	if !ok {
		return 0, errors.ErrInvalidToken
	}

	if time.Now().Unix() > int64(expiresAt) {
		return 0, errors.ErrTokenExpired
	}

	// 사용자 ID 추출
	userID, ok := payload["user_id"].(float64)
	if !ok {
		return 0, errors.ErrInvalidToken
	}

	return uint(userID), nil
}
