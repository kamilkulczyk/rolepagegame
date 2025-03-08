import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const [character, setCharacter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCharacter = localStorage.getItem("character");
    if (storedCharacter) {
      setCharacter(JSON.parse(storedCharacter));
    } else {
      navigate("/create-character");
    }
  }, [navigate]);

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h2>Dashboard</h2>
        <p>Welcome, {user.username}!</p>

        {character ? (
          <div className="character-box">
            <h3>Your Character: {character.name}</h3>
            <h4>Items:</h4>
            <ul>
              {character.items.length > 0 ? (
                character.items.map((item) => (
                  <ItemCard key={item.id}
                  item={item}
                  />
                ))
              ) : (
                <p>No items yet.</p>
              )}
            </ul>
            <button onClick={() => navigate("/create-item")}>
              Create Item
            </button>
          </div>
        ) : (
          <p>Loading character...</p>
        )}
      </div>
    </div>
  );
}
