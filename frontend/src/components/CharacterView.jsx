import ObjectDetails from "./ObjectDetails";
import RpgData from "./RpgData";
import "../styles/CharacterView.css"
import EquipmentSheet from "./EquipmentSheet";

const slots = [ //todo: make a class that will store it or fetch it.
  { id: "head", name: "Head", x: "45%", y: "2%" },
  { id: "chest", name: "Chest", x: "45%", y: "24%" },
  { id: "left_hand", name: "Left Hand", x: "4%", y: "24%" },
  { id: "right_hand", name: "Right Hand", x: "86%", y: "24%" },
  { id: "feet", name: "Feet", x: "44%", y: "88%" },
];

const items = [];//todo: fetch items.

export default function CharacterView({ character, rpgData, owner }) {
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