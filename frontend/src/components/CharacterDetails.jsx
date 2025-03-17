const defaultImage =
  "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ=";

export default function CharacterDetails({ character, isCompact = false }) {
  if (!character) {
    return <p>No character details available</p>;
  }

  return (
    <div className={`character-card ${isCompact ? "compact" : ""}`}>
      <img
        src={character.profile_image || defaultImage}
        alt={character.name || "Unknown Character"}
        className="character-image"
      />

      {!isCompact && (
        <>
          <h3 className="character-name">{character.name || "Unnamed Character"}</h3>
          <p className="character-description">{character.description || "No description available."}</p>
        </>
      )}
    </div>
  );
}
