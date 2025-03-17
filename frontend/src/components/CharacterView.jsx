import CharacterDetails from "./CharacterDetails";
import RpgData from "./RpgData";

export default function CharacterView({ character, rpgData }) {
  return (
    <div className="character-view">
      <CharacterDetails character={character} />
      <RpgData rpgData={rpgData} />
    </div>
  );
}