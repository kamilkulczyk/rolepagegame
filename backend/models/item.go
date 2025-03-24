package models

import "encoding/json"

type ItemDetails struct {
  ID      		    int    	 `json:"id"`
  Name	   		    string   `json:"name"`
  Description       string   `json:"description"`
  UserID 			int      `json:"user_id"`
  CharacterID 		int      `json:"character_id"`
  EquipmentSlotID 	int      `json:"equipment_slot_id"`
  ProfileImage      string   `json:"profile_image"`
}

type ItemRpgData struct {
	ID          	int                 `json:"id"`
	ItemID 			int                 `json:"item_id"`
	Type        	string              `json:"type"`
	Lore        	string              `json:"lore"`
	Stats       	json.RawMessage		`json:"stats"`
}