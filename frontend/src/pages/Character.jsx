import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import CharacterView from "../components/CharacterView";
import { api } from "../api";

const Character = () => {
  const { id } = useParams();
  const location = useLocation();
  const passedCharacter = location.state?.character || null; // Get passed data

  const [character, setCharacter] = useState(passedCharacter);
  const [rpgData, setRpgData] = useState(null);
  const [loading, setLoading] = useState(!passedCharacter); // Load only if no data was passed
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchCharacterData = async () => {
      if (character) return;

      setLoading(true);
      setError(null);

      try {
        const [fetchedCharacter, fetchedRpgData] = await Promise.all([
          api.getCharacterByID(id),
          api.getRpgDataByCharacterID(id),
        ]);

        if (isMounted) {
          setCharacter(fetchedCharacter || {});
          setRpgData(fetchedRpgData || {});
        }
      } catch (error) {
        console.error("Error fetching character data:", error);
        if (isMounted) setError(error.message || "Failed to fetch data.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCharacterData();

    return () => {
      isMounted = false;
    };
  }, [id, character]);

  if (loading) return <p>Loading character...</p>;
  if (!character) return <p>Character not found</p>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <CharacterView character={character} rpgData={rpgData} />
      </div>
    </div>
  );
};

export default Character;
