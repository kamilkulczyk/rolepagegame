package models

type Message struct {
  ID          int    `json:"id"`
	SenderID    int    `json:"sender_id"`
	RecipientID int    `json:"recipient_id"`
	Message     string `json:"message"`
	CreatedAt   string `json:"created_at"`
}