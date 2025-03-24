import { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import { AuthContext } from "../context/AuthContext";
import "../styles/Profile.css";
import CharacterCard from "../components/CharacterCard";
import ItemCard from "../components/ItemCard";
import ItemStorage from "../components/ItemStorage";

export default function Profile() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [profileUser, setProfileUser] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let profileData;
        if (id) {
          profileData = await api.getUserByID(id);
        } else {
          if (!user) {
            navigate("/");
            return;
          }
          profileData = user;
        }

        setProfileUser(profileData);

        const fetchedCharacters = await api.getUserCharacters(profileData.id);
        setCharacters(fetchedCharacters || []);

        const fetchedItems = await api.getUserItems(profileData.id);
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
  }, [id, user, navigate]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <p className="error">{error}</p>;
  if (!profileUser) return <p className="error">User not found</p>;

  const isOwnProfile = !id || user?.id === profileUser.id;

  return (
    <div className="profile-container">
      <p className="welcome-message">Welcome to {profileUser.username}'s profile!</p>

      <div className="section">
        <div className="section-header">
        <h3>{isOwnProfile ? "Your Characters" : `${profileUser.username}'s Characters`}</h3>
          {isOwnProfile && (
            <button className="create-button" onClick={() => navigate("/create-character")}>+ Create Character</button>
          )}
        </div>
        <div className="characters-grid">
          {characters.length > 0 ? (
            characters.map((character) => (
              <CharacterCard key={character.id} character={character} isUserCharacter={isOwnProfile} />
            ))
          ) : (
            <p className="no-data">No characters available</p>
          )}
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>{isOwnProfile ? "Your Items" : `${profileUser.username}'s Items`}</h3>
          {isOwnProfile && (
            <button className="create-button" onClick={() => navigate("/create-item")}>+ Create Item</button>
          )}
        </div>
        <ItemStorage items={items}/>
      </div>
    </div>
  );
}
