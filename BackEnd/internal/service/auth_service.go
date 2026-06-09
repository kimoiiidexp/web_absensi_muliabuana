package service

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/model"
	"WebAbsensiMuliaBuana/BackEnd/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	repo repository.UserRepository
}

func NewAuthService(r repository.UserRepository) *AuthService {
	return &AuthService{r}
}

func (s *AuthService) Register(name, email, password, role string) error {
	hash, _ := bcrypt.GenerateFromPassword([]byte(password), 10)

	user := model.User{
		Name:     name,
		Email:    email,
		Password: string(hash),
		Role:     role,
	}

	return s.repo.Create(&user)
}

func (s *AuthService) Login(email, password string) (*model.User, error) {
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		return nil, err
	}

	err = bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(password),
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *AuthService) UpdatePhone(
	userID uint,
	phone string,
) error {

	return s.repo.UpdatePhone(userID, phone)
}

func (s *AuthService) GetProfile(userID uint) (*model.User, error) {
	return s.repo.FindByID(userID)
}

func (s *AuthService) GetUsersByRole(role string) ([]model.User, error) {
	if role == "" {
		var all []model.User
		for _, r := range []string{"admin", "guru", "siswa"} {
			users, err := s.repo.FindByRole(r)
			if err != nil {
				return nil, err
			}
			all = append(all, users...)
		}
		return all, nil
	}
	return s.repo.FindByRole(role)
}
