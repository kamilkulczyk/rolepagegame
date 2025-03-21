import "../styles/RpgData.css";

export default function RpgData({ rpgData, type }) {
  if (!rpgData || Object.keys(rpgData).length === 0) return <p>No RPG data available</p>;

  return (
    <div className="rpg-data">
      <h3>{type} RPG Details</h3>

      <div className="data-fields">
        {Object.entries(rpgData)
          .filter(([key]) => !isIdField(key))
          .map(([key, value]) => {
            if (key === "stats") return null;

          return (
            <div key={key} className="data-field">
              <strong>{formatLabel(key)}:</strong>
              <span className={key === "lore" ? "long-text" : ""}>
                {value || "Unknown"}
              </span>
            </div>
          );
        })}
      </div>

      {rpgData.stats && Object.keys(rpgData.stats).length > 0 && (
        <>
          <h4>Statistics</h4>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Stat</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(rpgData.stats).map(([stat, value]) => (
                <tr key={stat}>
                  <td>{formatLabel(stat)}</td>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function isIdField(key) {
  return key === "id" || key.endsWith("_id");
}

function formatLabel(label) {
  return label.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
