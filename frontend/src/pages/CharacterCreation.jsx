import { useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function CharacterCreation() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleCreateCharacter = async () => {
    const character = await api.createCharacter(name);
    localStorage.setItem("character", JSON.stringify(character));
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h2>Create Your Character</h2>
        <input 
          type="text" 
          placeholder="Character Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
        />
        <button onClick={handleCreateCharacter}>Create Character</button>
      </div>
    </div>
  );
}