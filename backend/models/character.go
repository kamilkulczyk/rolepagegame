package models

type Character struct {
  ID      		      int    	 `json:"id"`
  Name	   		      string   `json:"name"`
  Description       string   `json:"description"`
  ProfileImage      string   `json:"profile_image"`
  BackgroundImage   string   `json:"background_image"`
  Images           []string  `json:"additional_images"`
}