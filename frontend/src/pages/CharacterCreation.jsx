import { useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/CreateCharacter.css";

const defaultImage = "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="
const MAX_ADDITIONAL_IMAGES = 5;

export default function CharacterCreation() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [additionalImages, setAdditionalImages] = useState([]);
  const navigate = useNavigate();

  const handleAddAdditionalImage = () => {
    if (additionalImages.length < MAX_ADDITIONAL_IMAGES) {
      setAdditionalImages([...additionalImages, ""]);
    }
  };

  const handleRemoveAdditionalImage = (index) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(newImages);
  };

  const handleAdditionalImageChange = (index, value) => {
    const newImages = [...additionalImages];
    newImages[index] = value;
    setAdditionalImages(newImages);
  };

  const handleCreateCharacter = async (e) => {
    e.preventDefault();

    const formData = {
      name,
      description,
      profile_image: profileImage.trim() || null,
      background_image: backgroundImage.trim() || null,
      additional_images: additionalImages.filter((url) => url.trim() !== ""),
    };

    try {
      await api.createCharacter(formData);
      navigate("/");
    } catch (error) {
      console.error("Creating character failed:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const allAdditionalImagesFilled = additionalImages.every((url) => url.trim() !== "")

  return (
    <div className="create-character-container">
      <h2>Create Your Character</h2>
      <form onSubmit={handleCreateCharacter}>
        <input
          type="text"
          placeholder="Character Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className="image-section">
          <label>Profile Picture</label>
          <input
            type="text"
            placeholder="Profile Image URL"
            value={profileImage}
            onChange={(e) => setProfileImage(e.target.value)}
          />
          <div className="image-preview-box">
            <img
              src={profileImage || defaultImage}
              alt="Profile Preview"
              className="image-preview"
              onError={(e) => (e.target.src = defaultImage)}
            />
          </div>
        </div>

        <div className="image-section">
          <label>Background Image</label>
          <input
            type="text"
            placeholder="Background Image URL"
            value={backgroundImage}
            onChange={(e) => setBackgroundImage(e.target.value)}
          />
          <div className="image-preview-box">
            <img
              src={backgroundImage || defaultImage}
              alt="Background Preview"
              className="image-preview"
              onError={(e) => (e.target.src = defaultImage)}
            />
          </div>
        </div>

        <div className="image-section">
          <label>Additional Images</label>
          {additionalImages.map((url, index) => (
            <div key={index} className="image-input">
              <input
                type="text"
                placeholder="Additional Image URL"
                value={url}
                onChange={(e) => handleAdditionalImageChange(index, e.target.value)}
              />
              <div className="image-preview-box">
                <img
                  src={url || defaultImage}
                  alt="Additional Preview"
                  className="image-preview"
                  onError={(e) => (e.target.src = defaultImage)}
                />
              </div>
              <button type="button" className="remove-image-btn" onClick={() => handleRemoveAdditionalImage(index)}>
                ❌
              </button>
            </div>
          ))}
          {additionalImages.length < MAX_ADDITIONAL_IMAGES && allAdditionalImagesFilled && (
            <button type="button" onClick={handleAddAdditionalImage}>
              + Add Another Image
            </button>
          )}
        </div>

        <button type="submit">Create Character</button>
      </form>
    </div>
  );
}
