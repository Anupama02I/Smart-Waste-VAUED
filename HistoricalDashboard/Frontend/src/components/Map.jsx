import React from "react";

function MapView({ data }) {

  const gridSize = 0.00012;

  const safeNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  // -------------------------------
  // Aggregate into grid
  // -------------------------------
  const grid = {};

  data.forEach((item) => {
    const lat = safeNumber(item.lat);
    const long = safeNumber(item.long);
    const risk = safeNumber(item.odour_risk);

    if (lat === null || long === null || risk === null) return;

    const latKey = Math.floor(lat / gridSize) * gridSize;
    const longKey = Math.floor(long / gridSize) * gridSize;

    const key = `${latKey}_${longKey}`;

    if (!grid[key]) {
      grid[key] = {
        sumRisk: 0,
        count: 0,
      };
    }

    grid[key].sumRisk += risk;
    grid[key].count += 1;
  });

  // -------------------------------
  // Convert to array
  // -------------------------------
  const cells = Object.values(grid).map(cell => ({
    avgRisk: cell.sumRisk / cell.count,
    count: cell.count
  }));

  if (cells.length === 0) {
    return <div>No data</div>;
  }

  // -------------------------------
  // Normalize risk values
  // -------------------------------
  const risks = cells.map(c => c.avgRisk);
  const minRisk = Math.min(...risks);
  const maxRisk = Math.max(...risks);

  const normalize = (value) => {
    if (maxRisk === minRisk) return 0.5;
    return (value - minRisk) / (maxRisk - minRisk);
  };

  // -------------------------------
  // Color scale
  // -------------------------------
  const getColor = (risk) => {
    const n = normalize(risk);

    if (n > 0.66) return "#dc2626";   // red
    if (n > 0.33) return "#f97316";   // orange
    return "#16a34a";                 // green
  };

  // -------------------------------
  // RENDER (NO EMPTY CELLS)
  // -------------------------------
  return (
    <div style={{
      background: "#0f172a",
      padding: "16px",
      borderRadius: "12px",
      color: "white"
    }}>

      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
        Grid Heatmap of Average Odour Risk
      </h3>

      {/* Legend */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        gap: "15px",
        marginBottom: "15px"
      }}>
        <span style={{ color: "#16a34a" }}>■ Low</span>
        <span style={{ color: "#f97316" }}>■ Medium</span>
        <span style={{ color: "#dc2626" }}>■ High</span>
      </div>

      {/* FLEX GRID (FIXED) */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        justifyContent: "center"
      }}>
        {cells.map((cell, index) => (
          <div
            key={index}
            style={{
              width: "80px",
              height: "80px",
              background: getColor(cell.avgRisk),
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              fontWeight: "bold",
              color: "white"
            }}
          >
            <div>{cell.avgRisk.toFixed(2)}</div>
            <div style={{ fontSize: "12px" }}>
              {cell.count} pts
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default MapView;