import { useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function ItemCreation() {
  const [itemName, setItemName] = useState("");
  const navigate = useNavigate();

  const handleCreateItem = async () => {
    const character = JSON.parse(localStorage.getItem("character"));
    if (!character) {
      navigate("/create-character");
      return;
    }

    const newItem = await api.createItem(character.id, itemName);
    character.items.push(newItem);
    localStorage.setItem("character", JSON.stringify(character));
    
    navigate("/dashboard");
  };

  return (
    <div>
      <h2>Create an Item</h2>
      <input 
        type="text" 
        placeholder="Item Name" 
        value={itemName} 
        onChange={(e) => setItemName(e.target.value)} 
      />
      <button onClick={handleCreateItem}>Create Item</button>
    </div>
  );
}