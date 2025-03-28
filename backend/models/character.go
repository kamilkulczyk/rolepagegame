package models

import "encoding/json"

type CharacterDetails struct {
  ID      		    int    	 `json:"id"`
  Name	   		    string   `json:"name"`
  Description       string   `json:"description"`
  UserID 			int      `json:"user_id"`
  ProfileImage      string   `json:"profile_image"`
}

type RpgData struct {
	ID          	int                 `json:"id"`
	CharacterID 	int                 `json:"character_id"`
	CharacterClass  string              `json:"character_class"`
	Race        	string              `json:"race"`
	Lore        	string              `json:"lore"`
	Stats       	json.RawMessage		`json:"stats"`
}