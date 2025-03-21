import ObjectDetails from "./ObjectDetails";
import RpgData from "./RpgData";
import "../styles/CharacterView.css"

export default function ItemView({ item, rpgData }) {
  return (
    <div className="character-view">
      <ObjectDetails object={item} />
      <RpgData rpgData={rpgData} type="Item" />
    </div>
  );
}