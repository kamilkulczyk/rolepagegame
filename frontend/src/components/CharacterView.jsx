import ObjectDetails from "./ObjectDetails";
import RpgData from "./RpgData";
import "../styles/CharacterView.css"

export default function CharacterView({ character, rpgData }) {
  return (
    <div className="character-view">
      <ObjectDetails object={character} />
      <RpgData rpgData={rpgData} type="Character" />
    </div>
  );
}