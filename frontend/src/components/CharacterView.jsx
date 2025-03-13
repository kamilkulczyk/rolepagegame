// import "../styles/CharacterCard.css";

const defaultImage = "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="

const CharacterView = ({ 
  character, 
  isCompact = false

}) => {
  return (
    <div className={`character-card ${isCompact ? "compact" : ""}`}>
        {isCompact ? (
            <div>
                {character && (
                    <img src={character.profile_image || defaultImage} alt={character.name} />
                )}
            </div>
        ) : (
        <div>
            {character && (
                <img src={character.profile_image || defaultImage} alt={character.name} />
            )}
        </div>
        )}

        {!isCompact && (
        <h3 className="character-name">
            {character.name}
        </h3>
        )}
        {character.description}
    </div>
  );
};

export default CharacterView;