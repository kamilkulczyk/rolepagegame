import { useContext, useEffect, useState } from "react";
import { api } from "../api";
import { AuthContext } from "../context/AuthContext";
import { ServerRouter, useNavigate } from "react-router-dom";
import ItemCard from "../components/ItemCard";
import "../styles/Dashboard.css";
import CharacterView from "../components/CharacterView";
import CharacterCard from "../components/CharacterCard";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [characters, setCharacters] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCharacter = async () => {
      setLoading(true);
      setError(null);

      if (!user) {
        navigate("/");
        return;
      }

      try {
        const fetchedCharacters = await api.getUserCharacters();
        if (!fetchedCharacters) {
          navigate("/create-character");
        }
        setCharacters(fetchedCharacters);
        console.log("fetched: ",fetchedCharacters)
      } catch (error) {
        console.error("Error fetching character:", error);
        setError(error.message || "Failed to fetch character.");

        if (error.status === 404) {
            navigate("/create-character");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchCharacter();
  }, [user, navigate])

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
      return null;
  }

  return (
    <div className="dashboard-container">
      <p>Welcome, {user?.username}!</p>
        <div className={`characters-grid }`}>
          {console.log(characters.length)}
          {characters.length > 0 ? (
            characters.map((character) => (
              <CharacterCard key={character.id} character={character} isUserCharacter={true}/>
            ))
          ) : (
            <p className="no-characters">No characters available</p>
          )}
        </div>
    </div>
  );
}