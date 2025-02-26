package service

import (
	"mult-working/internal/dto"
	"mult-working/internal/errors"
	"mult-working/internal/models"
	"time"

	"github.com/o1egl/paseto"
	"golang.org/x/crypto/ed25519"
	"gorm.io/gorm"
)

type AuthService struct {
	db            *gorm.DB
	symmetricKey  []byte
	publicKey     ed25519.PublicKey
	privateKey    ed25519.PrivateKey
	tokenDuration time.Duration
}

func NewAuthService(db *gorm.DB, symmetricKey []byte, tokenDuration time.Duration) *AuthService {
	publicKey, privateKey, _ := ed25519.GenerateKey(nil)
	return &AuthService{
		db:            db,
		symmetricKey:  symmetricKey,
		publicKey:     publicKey,
		privateKey:    privateKey,
		tokenDuration: tokenDuration,
	}
}

// Register는 새 사용자를 등록합니다
func (s *AuthService) Register(req dto.RegisterRequest) error {
	var existingUser models.User
	if result := s.db.Where("username = ? OR email = ?", req.Username, req.Email).First(&existingUser); result.Error == nil {
		return errors.ErrUserExists
	}

	user := models.User{
		Username: req.Username,
		Email:    req.Email,
	}

	if err := user.SetPassword(req.Password); err != nil {
		return err
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
	pasetoV2 := paseto.NewV2()
	token, err := pasetoV2.Encrypt(s.symmetricKey, map[string]interface{}{
		"user_id":  user.ID,
		"username": user.Username,
		"exp":      expiration.Unix(),
	}, nil)

	if err != nil {
		return nil, err
	}

	return &dto.TokenResponse{
		Token:     token,
		ExpiresAt: expiration,
	}, nil
}

// VerifyToken은 PASETO 토큰을 검증하고 사용자 ID를 반환합니다
func (s *AuthService) VerifyToken(token string) (uint, error) {
	var payload map[string]interface{}
	pasetoV2 := paseto.NewV2()

	err := pasetoV2.Decrypt(token, s.symmetricKey, &payload, nil)
	if err != nil {
		return 0, errors.ErrInvalidToken
	}

	// 만료 시간 확인
	exp, ok := payload["exp"].(float64)
	if !ok {
		return 0, errors.ErrInvalidToken
	}

	if time.Now().Unix() > int64(exp) {
		return 0, errors.ErrTokenExpired
	}

	// 사용자 ID 추출
	userID, ok := payload["user_id"].(float64)
	if !ok {
		return 0, errors.ErrInvalidToken
	}

	return uint(userID), nil
}
