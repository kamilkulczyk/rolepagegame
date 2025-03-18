import { useState, useEffect } from "react";
import { api } from "../api";
import { useLocation, useNavigate } from "react-router-dom";
import CharacterDetailsForm from "../components/CharacterDetailsForm";
import RpgDataForm from "../components/RpgDataForm";
import "../styles/CharacterCreation.css";

export default function CharacterCreation() {
  const location = useLocation();
  const navigate = useNavigate();

  const existingCharacter = location.state?.character || null;
  const existingRpgData = location.state?.rpgData || null;
  console.log("log: ", existingCharacter)

  const [characterDetails, setCharacterDetails] = useState(existingCharacter || {});
  const [rpgData, setRpgData] = useState(existingRpgData || {});
  const [loading, setLoading] = useState(false);

  // Generic update function that works dynamically
  const updateCharacterDetails = (updatedDetails) => {
    setCharacterDetails((prev) => ({ ...prev, ...updatedDetails }));
  };

  const updateRpgData = (updatedData) => {
    setRpgData((prev) => ({ ...prev, ...updatedData }));
  };

  useEffect(() => {
    if (existingCharacter && !existingRpgData) {
      const fetchRpgData = async () => {
        try {
          console.log("TEST!!!!!!", existingCharacter.id)
          const rpgDataResponse = await api.getRpgDataByCharacterID(existingCharacter.id);
          setRpgData(rpgDataResponse);
        } catch (error) {
          console.warn("Failed to fetch RPG data, setting to empty:", error);
          setRpgData({});
        }
      };

      fetchRpgData();
    }
  }, [existingCharacter, existingRpgData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (existingCharacter) {
        await api.updateCharacter(existingCharacter.id, characterDetails, rpgData)
        alert("Character updated successfully!");
      } else {
        await api.createCharacter(characterDetails, rpgData);
      }
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
              characterDetails={characterDetails} 
              onDetailsChange={updateCharacterDetails} 
            />
          </div>
          {console.log("rpg: ", rpgData)}
          <div className="character-form-section">
            <RpgDataForm 
              rpgData={rpgData} 
              onDetailsChange={updateRpgData} 
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Creating..." : (!existingCharacter ? "Create Character" : "Update Character")} 
        </button>
      </form>
    </div>
  );
}
