import ItemCard from "./ItemCard";
import "../styles/Profile.css";

const ItemStorage = ({ items }) => {
  return (
    <div className="items-grid">
        {items.length > 0 ? (
        items.map((item) => <ItemCard key={item.id} item={item} />)
        ) : (
        <p className="no-data">No items available</p>
        )}
    </div>
  );
};

export default ItemStorage;
