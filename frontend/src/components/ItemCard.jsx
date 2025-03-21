import { Link } from "react-router-dom";
import "../styles/ItemCard.css";

const defaultImage =
  "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ=";

const ItemCard = ({ item, isCompact = false}) => {
  return (
    <div className={`item-card ${isCompact ? "compact" : ""}`}>
      {isCompact ? (
        <Link to={`/items/${item.id}`} state={{ item }}>
          <img src={item.profile_image || defaultImage} alt={item.name} />
        </Link>
      ) : (
        <img src={item.profile_image || defaultImage} alt={item.name} />
      )}

      {!isCompact && (
        <h3 className="item-name">
          <Link to={`/items/${item.id}`} className="item-link" state={{ item }}>
            {item.name}
          </Link>
        </h3>
      )}
    </div>
  );
};

export default ItemCard;
