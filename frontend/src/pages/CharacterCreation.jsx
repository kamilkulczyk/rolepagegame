import { useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import CharacterDetailsForm from "../components/CharacterDetailsForm";
import RpgDataForm from "../components/RpgDataForm";
import "../styles/CharacterCreation.css";

export default function CharacterCreation() {
  const [characterDetails, setCharacterDetails] = useState({});
  const [rpgData, setRpgData] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateCharacterDetails = (field, value) => {
    setCharacterDetails((prev) => ({ ...prev, [field]: value }));
  };

  const updateRpgData = (field, value) => {
    setRpgData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.createCharacter(characterDetails, rpgData);
      navigate("/");
    } catch (error) {
      console.error("Creating character failed:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="character-creation-container">
      <h2>RPG Character Creation</h2>
      <form onSubmit={handleSubmit} className="character-creation-content">
        
        <div className="character-forms">
          <div className="character-form-section">
            <CharacterDetailsForm 
              character={characterDetails} 
              updateCharacter={updateCharacterDetails} 
            />
          </div>
          
          <div className="character-form-section">
            <RpgDataForm 
              character={rpgData} 
              updateCharacter={updateRpgData} 
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Creating..." : "Create Character"}
        </button>
      </form>
    </div>
  );
}
