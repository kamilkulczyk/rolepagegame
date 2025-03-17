import React from "react";
import "../styles/CharacterEquipmentForm.css";

export default function CharacterEquipmentForm({ character, updateCharacter  }) {
  const handleEquipmentChange = (slot, value) => {
    updateCharacter("equipment", { ...character.equipment, [slot]: value });
  };

  return (
    <div className="character-equipment">
      <label>Helmet:</label>
      <input
        type="text"
        value={character.equipment?.helmet || ""}
        onChange={(e) => handleEquipmentChange("helmet", e.target.value)}
      />

      <label>Weapon:</label>
      <input
        type="text"
        value={character.equipment?.weapon || ""}
        onChange={(e) => handleEquipmentChange("weapon", e.target.value)}
      />

      <label>Armor:</label>
      <input
        type="text"
        value={character.equipment?.armor || ""}
        onChange={(e) => handleEquipmentChange("armor", e.target.value)}
      />
    </div>
  );
}