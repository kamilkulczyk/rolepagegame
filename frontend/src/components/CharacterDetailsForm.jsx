import { useState } from "react";
import "../styles/CharacterDetailsForm.css";

const defaultImage = "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="

export default function CharacterDetailsForm({ onDetailsChange }) {
  const [details, setDetails] = useState({
    name: "",
    profile_image: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedDetails = { ...details, [name]: value };
    setDetails(updatedDetails);
    onDetailsChange(updatedDetails);
  };

  return (
    <div className="character-details-container">
      <div className="character-details-left">
        <label>Character Name:</label>
        <input
          type="text"
          maxLength="20"
          name="name"
          placeholder="Character Name"
          value={details.name}
          onChange={handleChange}
          required
        />
  
        <label>Profile Picture:</label>
        <input
          type="text"
          name="profile_image"
          placeholder="Profile Image URL"
          value={details.profile_image}
          onChange={handleChange}
        />
  
        <div className="profile-image-preview">
          <img src={details.profile_image || defaultImage} alt="Character Profile" />
        </div>
  
        <label>Short Description:</label>
        <textarea
          name="description"
          placeholder="Short Description (Max 200 characters)"
          maxLength="200"
          value={details.description}
          onChange={handleChange}
        />
      </div>
    </div>
  );
  
  
  
}
