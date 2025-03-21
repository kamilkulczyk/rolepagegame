import { useState, useEffect } from "react";
import "../styles/RpgDataForm.css";

export default function RpgDataForm({ type, fields, initialData, onDetailsChange }) {
  const [formData, setFormData] = useState(() => {
    const defaultValues = {};
    fields.forEach(({ key }) => (defaultValues[key] = ""));
    return { ...defaultValues, stats: [] };
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...fields.reduce((acc, { key }) => ({ ...acc, [key]: initialData[key] || "" }), {}),
        stats: Object.entries(initialData.stats || {}).map(([name, value]) => ({
          name,
          value,
        })),
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleStatChange = (index, key, value) => {
    const updatedStats = [...formData.stats];
    updatedStats[index][key] = value;
    updateFormData({ stats: updatedStats });
  };

  const handleStatBlur = (index) => {
    const updatedStats = [...formData.stats];
    const { name, value } = updatedStats[index];

    if (!name.trim() || updatedStats.some((s, i) => i !== index && s.name === name)) {
      updatedStats[index].name = `Stat${index + 1}`;
    }

    updateFormData({ stats: updatedStats });
  };

  const handleAddStat = () => {
    updateFormData({ stats: [...formData.stats, { name: `Stat${formData.stats.length + 1}`, value: "" }] });
  };

  const handleRemoveStat = (index) => {
    const updatedStats = formData.stats.filter((_, i) => i !== index);
    updateFormData({ stats: updatedStats });
  };

  const updateFormData = (newData) => {
    const updatedData = { ...formData, ...newData };

    const statsObject = updatedData.stats.reduce((acc, { name, value }) => {
      if (name.trim()) acc[name] = value;
      return acc;
    }, {});

    setFormData(updatedData);
    onDetailsChange({ ...updatedData, stats: statsObject });
  };

  return (
    <div className="rpg-data-form">
      <h3>{type} Details</h3>
      {fields.map(({ label, key, inputType }) => (
        <div key={key} className="form-group">
          {inputType === "textarea" ? (
            <textarea
              name={key}
              placeholder={`${type} ${label}`}
              value={formData[key]}
              onChange={handleChange}
              rows={4}
            />
          ) : (
            <input
              type={inputType || "text"}
              name={key}
              placeholder={`${type} ${label}`}
              value={formData[key]}
              onChange={handleChange}
            />
          )}
        </div>
      ))}

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
          {formData.stats.length > 0 ? (
            formData.stats.map((stat, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={stat.name}
                    onChange={(e) => handleStatChange(index, "name", e.target.value)}
                    onBlur={() => handleStatBlur(index)}
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
  );
}
