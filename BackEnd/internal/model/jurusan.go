package model

type Jurusan struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `json:"name"`
}

func (Jurusan) TableName() string {
	return "jurusan"
}
