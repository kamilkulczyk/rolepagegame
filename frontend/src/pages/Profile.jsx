import { useContext, useEffect, useState } from "react";
import { api } from "../api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";
import CharacterCard from "../components/CharacterCard";
import ItemCard from "../components/ItemCard";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [characters, setCharacters] = useState([]);
  const [items, setItems] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (!user) {
        navigate("/");
        return;
      }

      try {
        const fetchedCharacters = await api.getUserCharacters();
        setCharacters(fetchedCharacters || []);

        const fetchedItems = await api.getUserItems();
        setItems(fetchedItems || []);

      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "Failed to fetch data.");

        if (error.status === 404) {
          navigate("/create-character");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleCreateCharacter = () => {
    navigate("/create-character");
  };

  const handleCreateItem = () => {
    navigate("/create-item");
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <p className="welcome-message">Welcome, {user?.username}!</p>

      <div className="section">
        <div className="section-header">
          <h3>Your Characters</h3>
          <button className="create-button" onClick={handleCreateCharacter}>+ Create Character</button>
        </div>
        <div className="characters-grid">
          {characters.length > 0 ? (
            characters.map((character) => (
              <CharacterCard key={character.id} character={character} isUserCharacter={true} />
            ))
          ) : (
            <p className="no-data">No characters available</p>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Your Items</h3>
          <button className="create-button" onClick={handleCreateItem}>+ Create Item</button>
        </div>
        <div className="items-grid">
          {items.length > 0 ? (
            items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))
          ) : (
            <p className="no-data">No items available</p>
          )}
        </div>
      </div>
    </div>
  );
}
