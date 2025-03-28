import { useEffect, useState } from "react";
import "../styles/ObjectDetailsForm.css";

const defaultImage = "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ=";

export default function ObjectDetailsForm({ type = "character", objectDetails, onDetailsChange }) {
  const [formDetails, setFormDetails] = useState({
    name: "",
    profile_image: "",
    description: "",
  });

  useEffect(() => {
    if (objectDetails) {
      setFormDetails({
        name: objectDetails?.name || "",  
        profile_image: objectDetails?.profile_image || "",  
        description: objectDetails?.description || "",  
      });
    }
  }, [objectDetails]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedDetails = { ...formDetails, [name]: value };
    setFormDetails(updatedDetails);
    onDetailsChange(updatedDetails);
  };

  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
  
  return (
    <div className="details-container">
      <div className="details-left">
        <label>{capitalizedType} Name:</label>
        <input
          type="text"
          maxLength="25"
          name="name"
          placeholder={`${capitalizedType} Name`}
          value={formDetails.name}
          onChange={handleChange}
          required
        />
  
        <label>{capitalizedType} Picture:</label>
        <input
          type="text"
          name="profile_image"
          placeholder={`${capitalizedType} Image URL`}
          value={formDetails.profile_image}
          onChange={handleChange}
        />
  
        <div className="profile-image-preview">
          <img src={formDetails.profile_image || defaultImage} alt={`${capitalizedType} Profile`} />
        </div>
  
        <label>{capitalizedType} Description:</label>
        <textarea
          name="description"
          placeholder={`${capitalizedType} Description (Max 200 characters)`}
          maxLength="200"
          value={formDetails.description}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
