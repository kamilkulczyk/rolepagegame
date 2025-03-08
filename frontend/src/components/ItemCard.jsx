import "../styles/ItemCard.css"

const ItemCard = ({
    item
}) => {

    return (
        <div className="item-card">
            <h3>{item.name}</h3>
        </div>
    )
};

export default ItemCard;