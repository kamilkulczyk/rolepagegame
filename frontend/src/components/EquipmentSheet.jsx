import React from "react";
import "../styles/EquipmentSheet.css";
const background = "https://png.pngtree.com/png-clipart/20240817/original/pngtree-the-outline-of-a-person-solid-color-black-standing-straight-facing-png-image_15790670.png"

const EquipmentSheet = ({ slots, items }) => {
  return (
    <div className="equipment-sheet" style={{ backgroundImage: `url(${background})` }}>
      {slots.map((slot) => {
        const item = items?.find((item) => item.equipment_slot_id === slot.id);

        return (
          <div key={slot.id} className="slot" style={{ left: slot.x, top: slot.y }}>
            {item ? <img src={item.profile_image} alt={item.name} className="item-icon" /> : null}
          </div>
        );
      })}
    </div>
  );
};

export default EquipmentSheet;
