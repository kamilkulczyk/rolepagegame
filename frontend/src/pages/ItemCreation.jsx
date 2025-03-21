import { useState, useEffect } from "react";
import { api } from "../api";
import { useLocation, useNavigate } from "react-router-dom";
import ObjectDetailsForm from "../components/ObjectDetailsForm";
import RpgDataForm from "../components/RpgDataForm";
import "../styles/CharacterCreation.css";

export default function ItemCreation() {
  const location = useLocation();
  const navigate = useNavigate();

  const existingItem = location.state?.character || null;
  const existingRpgData = location.state?.rpgData || null;

  const [characterDetails, setItemDetails] = useState(existingItem || {});
  const [rpgData, setRpgData] = useState(existingRpgData || {});
  const [loading, setLoading] = useState(false);

  // Generic update function that works dynamically
  const updateItemDetails = (updatedDetails) => {
    setItemDetails((prev) => ({ ...prev, ...updatedDetails }));
  };

  const updateRpgData = (updatedData) => {
    setRpgData((prev) => ({ ...prev, ...updatedData }));
  };

  useEffect(() => {
    if (existingItem && !existingRpgData) {
      const fetchRpgData = async () => {
        try {
          const rpgDataResponse = await api.getRpgDataByItemID(existingItem.id);
          setRpgData(rpgDataResponse);
        } catch (error) {
          console.warn("Failed to fetch RPG data, setting to empty:", error);
          setRpgData({});
        }
      };

      fetchRpgData();
    }
  }, [existingItem, existingRpgData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (existingItem) {
        await api.updateItem(existingItem.id, characterDetails, rpgData)
        alert("Item updated successfully!");
      } else {
        await api.createItem(characterDetails, rpgData);
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
      <h2>RPG Item Creation</h2>
      <form onSubmit={handleSubmit} className="character-creation-content">
        
        <div className="character-forms">
          <div className="character-form-section">
            <ObjectDetailsForm
              type="item"
              characterDetails={characterDetails} 
              onDetailsChange={updateItemDetails} 
            />
          </div>
          {console.log("rpg: ", rpgData)}
          <div className="character-form-section">
            <RpgDataForm
              type="Item"
              fields={[
                { label: "Type", key: "type", inputType: "text" },
                { label: "Lore", key: "lore", inputType: "textarea" },
              ]}
              initialData={rpgData}
              onDetailsChange={updateRpgData}
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Creating..." : (!existingItem ? "Create Item" : "Update Item")} 
        </button>
      </form>
    </div>
  );
}
