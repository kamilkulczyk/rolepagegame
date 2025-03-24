import { Link } from "react-router-dom";
const defaultImage =
  "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ=";

export default function ObjectDetails({ object, isCompact = false, type = "character", owner }) {
  if (!object) {
    return <p>No object details available</p>;
  }

  const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

  return (
    <div className={`character-card ${isCompact ? "compact" : ""}`}>
      <img
        src={object.profile_image || defaultImage}
        alt={object.name || `Unknown ${capitalizedType}`}
        className="character-image"
      />

      {!isCompact && (
        <>
          <h3 className="character-name">{object.name || `Unnamed ${capitalizedType}`}</h3>
          <p className="character-description">{object.description || "No description available."}</p>

          {owner && (
            <p className="character-owner">
              Owner: <Link to={`/profile/${owner.id}`}>{owner.username}</Link>
            </p>
          )}
        </>
      )}
    </div>
  );
}
