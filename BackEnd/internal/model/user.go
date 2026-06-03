package model

import "time"

type User struct {
	ID        uint      `gorm:"primaryKey"`
	Name      string
	Email     string    `gorm:"unique"`
	Password  string
	Role      string
	CreatedAt time.Time
	UpdatedAt time.Time	
	Phone string `json:"phone"`
}