import CharacterDetails from "./CharacterDetails";
import RpgData from "./RpgData";
import "../styles/CharacterView.css"

export default function CharacterView({ character, rpgData }) {
  return (
    <div className="character-view">
      <CharacterDetails character={character} />
      <RpgData rpgData={rpgData} />
    </div>
  );
}