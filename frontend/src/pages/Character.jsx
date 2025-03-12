import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import CharacterView from "../components/CharacterView";
import { api } from "../api";

const Character = () => {
    const { id } = useParams();
    const [character, setCharacter] = useState(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCharacter = async () => {
          setLoading(true);
          setError(null);
    
          try {
            const fetchedCharacter = await api.getCharacterByID(id);
            setCharacter(fetchedCharacter || []);
          } catch (error) {
            console.error("Error fetching character:", error);
            setError(error.message || "Failed to fetch character.");
    
          } finally {
            setLoading(false);
          }
        }
    
        fetchCharacter();
      }, [id])

      if (loading) return <p>Loading character...</p>;
      if (!character) return <p>Character not found</p>;

      return (
        <div className="dashboard-container">
        <div className="dashboard-content">

            {character ? (
                <CharacterView character = { character }/>
            ) : (
                <p>Loading character...</p>
            )}
        </div>
        </div>
      )
}

export default Character;