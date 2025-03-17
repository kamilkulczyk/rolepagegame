import { useState } from "react";
import "../styles/RpgDataForm.css";

export default function RPGDataForm({ onDetailsChange }) {
  const [race, setRace] = useState("");
  const [characterClass, setCharacterClass] = useState("");
  const [lore, setLore] = useState("");
  const [stats, setStats] = useState([]); // Array of { name, value }

  const handleAddStat = () => {
    setStats([...stats, { name: "", value: "" }]);
  };

  const handleRemoveStat = (index) => {
    setStats(stats.filter((_, i) => i !== index));
  };

  const handleStatChange = (index, field, value) => {
    const newStats = [...stats];
    newStats[index][field] = value;
    setStats(newStats);
  };

  const handleChange = () => {
    onDetailsChange({
      race,
      characterClass,
      lore,
      stats,
    });
  };

  return (
    <div className="rpg-data-form">
      <div className="rpg-data-left">
        <h3>Character RPG Details</h3>
        <input
          type="text"
          placeholder="Race"
          value={race}
          onChange={(e) => {
            setRace(e.target.value);
            handleChange();
          }}
          required
        />

        <input
          type="text"
          placeholder="Class"
          value={characterClass}
          onChange={(e) => {
            setCharacterClass(e.target.value);
            handleChange();
          }}
          required
        />

        <textarea
          placeholder="Character Lore"
          value={lore}
          onChange={(e) => {
            setLore(e.target.value);
            handleChange();
          }}
        />
      </div>

      <div className="rpg-data-right">
        <h4>Statistics</h4>
        <table className="stats-table">
          <thead>
            <tr>
              <th>Stat Name</th>
              <th>Value</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={stat.name}
                    onChange={(e) => handleStatChange(index, "name", e.target.value)}
                    placeholder="Stat Name"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={stat.value}
                    onChange={(e) => handleStatChange(index, "value", e.target.value)}
                    placeholder="Value"
                  />
                </td>
                <td>
                  <button type="button" onClick={() => handleRemoveStat(index)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button type="button" className="add-stat-btn" onClick={handleAddStat}>+ Add Stat</button>
      </div>
    </div>
  );
}
