package repository

import (
	"WebAbsensiMuliaBuana/BackEnd/internal/model"

	"gorm.io/gorm"
)

type UserRepository interface {
	FindByEmail(email string) (*model.User, error)
	FindByID(id uint) (*model.User, error)
	Create(user *model.User) error
	UpdatePhone(id uint, phone string) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db}
}

func (r *userRepository) FindByEmail(email string) (*model.User, error) {
	var user model.User
	err := r.db.Where("email = ?", email).First(&user).Error
	return &user, err
}

func (r *userRepository) Create(user *model.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) FindByID(id uint) (*model.User, error) {
	var user model.User
	err := r.db.First(&user, id).Error
	return &user, err
}

func (r *userRepository) UpdatePhone(id uint, phone string) error {
	return r.db.Model(&model.User{}).
		Where("id = ?", id).
		Update("phone", phone).Error
}
