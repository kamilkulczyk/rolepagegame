import { useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/CreateCharacter.css"

export default function CharacterCreation() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleCreateCharacter = async (e) => {
    e.preventDefault();

    const formData = {
      name,
      description,
    };

    try {
      await api.createCharacter(formData);
      navigate("/");
    } catch (error) {
      console.error("Creating character failed:", error);
      if (error.status) {
        alert(`Server error: ${error.status} - ${JSON.stringify(error.data)}`);
      } else {
        alert(`Creating character error: ${error.message}`);
      }
    }
  };

  return (
    <div className="create-character-container">
        <h2>Create Your Character</h2>
        <form onSubmit={handleCreateCharacter}>
          <input 
            type="text" 
            placeholder="Character Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} required />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)} required />
          <button type="submit">Create Character</button>
        </form>
    </div>
  );
}