import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import CharacterView from "../components/CharacterView";
import { api } from "../api";

const Character = () => {
  const { id } = useParams();
  const location = useLocation();
  const passedCharacter = location.state?.character || null;
  const passedItems = location.state?.items || null;

  const [character, setCharacter] = useState(passedCharacter);
  const [rpgData, setRpgData] = useState(null);
  const [owner, setOwner] = useState(null);
  const [items, setItems] = useState(passedItems)
  const [loading, setLoading] = useState(!passedCharacter);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCharacterData = async () => {
      setLoading(true);
      setError(null);

      try {
        const fetchedCharacter = character || await api.getCharacterByID(id);
        if (!fetchedCharacter) throw new Error("Character not found.");

        const rpgDataPromise = api.getRpgDataByCharacterID(id).catch(() => null);
        const itemsPromise = items ? Promise.resolve(items) : api.getUserItems(fetchedCharacter.user_id).catch(() => []);

        const [fetchedRpgData, fetchedItems] = await Promise.all([rpgDataPromise, itemsPromise]);

        let fetchedUser = null;
        if (fetchedCharacter?.user_id) {
            fetchedUser = await api.getUserByID(fetchedCharacter.user_id).catch(() => null);
        }

        if (isMounted) {
            setCharacter(fetchedCharacter);
            setRpgData(fetchedRpgData || {});
            setItems(fetchedItems?.filter(item => item.character_id === fetchedCharacter.id) || []);
            setOwner(fetchedUser);
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
        <CharacterView character={character} rpgData={rpgData} owner={owner} items={items}/>
      </div>
    </div>
  );
};

export default Character;
