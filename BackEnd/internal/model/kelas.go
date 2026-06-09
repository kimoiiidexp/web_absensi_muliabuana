package model

type Kelas struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	Name      string `json:"name"`
	JurusanID uint   `json:"jurusan_id"`
}

func (Kelas) TableName() string {
	return "kelas"
}
