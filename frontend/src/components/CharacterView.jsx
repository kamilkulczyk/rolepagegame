import ObjectDetails from "./ObjectDetails";
import RpgData from "./RpgData";
import "../styles/CharacterView.css"

export default function CharacterView({ character, rpgData, owner }) {
  return (
    <div className="character-view">
      <ObjectDetails object={character} owner={owner}/>
      <RpgData rpgData={rpgData} type="Character" />
    </div>
  );
}