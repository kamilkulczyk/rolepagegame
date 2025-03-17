package models

type CharacterDetails struct {
  ID      		      int    	 `json:"id"`
  Name	   		      string   `json:"name"`
  Description       string   `json:"description"`
  ProfileImage      string   `json:"profile_image"`
}

type RpgData struct {
	ID          int                    `json:"id"`
	CharacterID int                    `json:"character_id"`
	Class       string                 `json:"class"`
	Race        string                 `json:"race"`
  Lore        string                 `json:"lore"`
	Stats       map[string]interface{} `json:"stats"`
}