package models

type Character struct {
  ID      		int    	`json:"id"`
//   UserID		int    	`json:"user_id"`
  Name	   		string 	`json:"name"`
  Description   string  `json:"description"`
}