import ObjectDetails from "./ObjectDetails";
import RpgData from "./RpgData";
import "../styles/CharacterView.css"
import EquipmentSheet from "./EquipmentSheet";

const slots = [ //todo: make a class that will store it or fetch it.
  { id: "head", name: "Head", x: "224px", y: "10px" },
  { id: "chest", name: "Chest", x: "224px", y: "120px" },
  { id: "left_hand", name: "Left Hand", x: "20px", y: "120px" },
  { id: "right_hand", name: "Right Hand", x: "430px", y: "120px" },
  { id: "feet", name: "Feet", x: "220px", y: "440px" },
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