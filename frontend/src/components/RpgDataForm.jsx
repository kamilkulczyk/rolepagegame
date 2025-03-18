import { useState, useEffect } from "react";
import "../styles/RpgDataForm.css";

export default function RPGDataForm({ rpgData, onDetailsChange }) {
  const [details, setDetails] = useState({
    race: "",
    character_class: "",
    lore: "",
    stats: [], // Store as an array for proper order handling
  });

  useEffect(() => {
    if (rpgData) {
      setDetails({
        race: rpgData.race || "",
        character_class: rpgData.character_class || "",
        lore: rpgData.lore || "",
        stats: Object.entries(rpgData.stats || {}).map(([name, value]) => ({
          name,
          value,
        })), // Convert object to array for order preservation
      });
    }
  }, [rpgData]);

  const handleChange = (e) => {
    setDetails({ ...details, [e.target.name]: e.target.value });
    onDetailsChange({ ...details, [e.target.name]: e.target.value });
  };

  const handleStatValueChange = (index, value) => {
    const updatedStats = [...details.stats];
    updatedStats[index].value = value;
    updateDetails({ stats: updatedStats });
  };

  const handleStatNameChange = (index, newName) => {
    const updatedStats = [...details.stats];
    updatedStats[index].name = newName;
    setDetails({ ...details, stats: updatedStats });
  };

  const handleStatNameBlur = (index) => {
    const updatedStats = [...details.stats];
    const { name, value } = updatedStats[index];

    if (!name.trim() || updatedStats.some((s, i) => i !== index && s.name === name)) {
      updatedStats[index].name = `Stat${index + 1}`; // Fallback name
    }

    updateDetails({ stats: updatedStats });
  };

  const handleAddStat = () => {
    const newStatName = `Stat${details.stats.length + 1}`;
  
    const updatedStats = [...details.stats, { name: newStatName, value: "" }];
    updateDetails({ stats: updatedStats });
  };

  const handleRemoveStat = (index) => {
    const updatedStats = details.stats.filter((_, i) => i !== index);
    updateDetails({ stats: updatedStats });
  };

  const updateDetails = (newData) => {
    const updatedDetails = { ...details, ...newData };

    const statsObject = updatedDetails.stats.reduce((acc, { name, value }) => {
      if (name.trim()) acc[name] = value;
      return acc;
    }, {});

    setDetails(updatedDetails);
    onDetailsChange({ ...updatedDetails, stats: statsObject });
  };

  return (
    <div className="rpg-data-form">
      <div className="rpg-data-left">
        <h3>Character RPG Details</h3>
        <input
          type="text"
          name="race"
          placeholder="Race"
          value={details.race}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="character_class"
          placeholder="Class"
          value={details.character_class}
          onChange={handleChange}
          required
        />

        <textarea
          name="lore"
          placeholder="Character Lore"
          value={details.lore}
          onChange={handleChange}
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
            {details.stats.length > 0 ? (
              details.stats.map((stat, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={stat.name}
                      onChange={(e) => handleStatNameChange(index, e.target.value)}
                      onBlur={() => handleStatNameBlur(index)}
                      placeholder="Stat Name"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={stat.value}
                      onChange={(e) => handleStatValueChange(index, e.target.value)}
                      placeholder="Value"
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => handleRemoveStat(index)}>❌</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No stats added</td>
              </tr>
            )}
          </tbody>
        </table>

        <button type="button" className="add-stat-btn" onClick={handleAddStat}>
          + Add Stat
        </button>
      </div>
    </div>
  );
}
