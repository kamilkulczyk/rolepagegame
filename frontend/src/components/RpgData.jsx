import "../styles/RpgData.css";

export default function RpgData({ rpgData }) {
  if (!rpgData) return <p>No RPG data available</p>;

  return (
    <div className="rpg-data">
      <h3>RPG Details</h3>
      <p><strong>Race:</strong> {rpgData.race || "Unknown"}</p>
      <p><strong>Class:</strong> {rpgData.class || "Unknown"}</p>
      <p><strong>Lore:</strong> {rpgData.lore || "No lore available"}</p>

      <h4>Statistics</h4>
      {rpgData.stats && Object.keys(rpgData.stats).length > 0 ? (
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
                <td>{stat}</td>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No stats available</p>
      )}
    </div>
  );
}
