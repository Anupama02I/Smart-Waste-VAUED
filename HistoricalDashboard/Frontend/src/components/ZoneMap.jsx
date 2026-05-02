function ZoneMap({ data, selectedZone, onZoneClick }) {
  const zones = ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E"];

  const getCount = (zone) => {
    const uniqueBins = new Set(
      data
        .filter((d) => d.location === zone)
        .map((d) => d.bin_id)
    );
    return uniqueBins.size;
  };

  const layout = {
    "Zone A": { x: 80, y: 60 },
    "Zone B": { x: 260, y: 60 },
    "Zone C": { x: 440, y: 60 },
    "Zone D": { x: 160, y: 200 },
    "Zone E": { x: 360, y: 200 },
  };

  return (
    <div
      style={{
        width: "100%",
        background: "#ffffff", // ✅ white card
        borderRadius: "16px",
        padding: "12px",
        border: "1px solid #dbe4ea",
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)"
      }}
    >
      <svg viewBox="0 0 600 350" width="100%" height="300">
        {zones.map((zone) => {
          const pos = layout[zone];
          const count = getCount(zone);

          const isSelected = selectedZone === zone;

          return (
            <g
              key={zone}
              onClick={() => onZoneClick(zone)}
              style={{ cursor: "pointer" }}
            >
              {/* Zone box */}
              <rect
                x={pos.x}
                y={pos.y}
                rx="16"
                ry="16"
                width="160"
                height="120"
                fill={isSelected ? "#22c55e" : "#f8fafc"} // ✅ light box
                stroke={isSelected ? "#16a34a" : "#e2e8f0"}
                strokeWidth={isSelected ? 3 : 1}
              />

              {/* Zone name */}
              <text
                x={pos.x + 80}
                y={pos.y + 40}
                textAnchor="middle"
                fill={isSelected ? "#ffffff" : "#0f172a"}
                fontSize="20"
                fontWeight="600"
              >
                {zone}
              </text>

              {/* Bin count */}
              <text
                x={pos.x + 80}
                y={pos.y + 70}
                textAnchor="middle"
                fill={isSelected ? "#dcfce7" : "#64748b"}
                fontSize="16"
              >
                {count} bins
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default ZoneMap;