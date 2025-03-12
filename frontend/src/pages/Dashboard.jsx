import { useEffect, useState } from "react";
import { api } from "../api";
import CharacterCard from "../components/CharacterCard";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const [characters, setCharacters] = useState([]);
  const [isCompact, setIsCompact] = useState(() => {
    return localStorage.getItem("isCompact") === "true";
  });

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const res = await api.getCharacters();
        console.log(res)
        console.log(characters)
        setCharacters(res || []);
      } catch (error) {
        console.error("Fetching characters failed:", error);
        alert(error.message || "An error occurred while fetching characters");
      }
    };
  
    fetchCharacters();
  }, []); 
  

  const toggleCompactView = () => {
    const newCompactState = !isCompact;
    setIsCompact(newCompactState);
    localStorage.setItem("isCompact", newCompactState);
  };

  return (
    <div className="dashboard-container">
    <h2>Dashboard</h2>

    <label className="compact-toggle">
      <input type="checkbox" checked={isCompact} onChange={toggleCompactView} />
      Compact View
    </label>

    <div className={`characters-grid ${isCompact ? "compact-grid" : ""}`}>
      {characters.length > 0 ? (
        characters.map((character) => (
          <CharacterCard key={character.id} character={character} isCompact={isCompact} />
        ))
      ) : (
        <p className="no-characters">No characters available</p>
      )}
    </div>
  </div>

  );
}