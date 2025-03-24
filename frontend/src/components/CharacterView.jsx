import ObjectDetails from "./ObjectDetails";
import RpgData from "./RpgData";
import "../styles/CharacterView.css"
import EquipmentSheet from "./EquipmentSheet";

const slots = [ //todo: make a class that will store it or fetch it.
  { id: 2, name: "Head", x: "45%", y: "2%" },
  { id: 6, name: "Chest", x: "45%", y: "24%" },
  { id: 3, name: "Left Hand", x: "4%", y: "24%" },
  { id: 4, name: "Right Hand", x: "86%", y: "24%" },
  { id: 5, name: "Feet", x: "44%", y: "88%" },
];

export default function CharacterView({ character, rpgData, owner, items }) {
  return (
    <div className="character-view">
      <div className="left-panel">
        <ObjectDetails object={character} owner={owner} />
        <EquipmentSheet slots={slots} items={items} />
      </div>
      <RpgData rpgData={rpgData} type="Character" />
    </div>
  );
}