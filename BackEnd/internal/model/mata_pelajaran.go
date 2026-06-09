package model

type MataPelajaran struct {
	ID   uint   `gorm:"primaryKey" json:"id"`
	Name string `json:"name"`
}

func (MataPelajaran) TableName() string {
	return "mata_pelajaran"
}
