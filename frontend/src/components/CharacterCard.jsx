import { Link } from "react-router-dom";
import "../styles/CharacterCard.css";

const defaultImage =
  "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ=";

const CharacterCard = ({ character, isCompact = false, isUserCharacter = false, items = null }) => {
  return (
    <div className={`character-card ${isCompact ? "compact" : ""}`}>
      {isCompact ? (
        <Link to={`/characters/${character.id}`} state={{ character, items }}>
          <img src={character.profile_image || defaultImage} alt={character.name} />
        </Link>
      ) : (
        <img src={character.profile_image || defaultImage} alt={character.name} />
      )}

      {!isCompact && (
        <h3 className="character-name">
          <Link to={`/characters/${character.id}`} className="character-link" state={{ character, items }}>
            {character.name}
          </Link>
        </h3>
      )}
      {isUserCharacter && (
        <Link to={`/edit-character/${character.id}`} state={{ character: character }}>
          <button className="edit-button">Edit</button>
        </Link>
      )}
    </div>
  );
};

export default CharacterCard;
