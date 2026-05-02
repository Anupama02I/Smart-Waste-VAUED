function getColor(level) {
  if (level === "High") return "#ef4444";
  if (level === "Medium") return "#f97316";
  return "#16a34a";
}

function AlertList({ alerts, onSelect }) {
  return (
    <div>
      {alerts.map((a, i) => (
        <div
          key={i}
          onClick={() => onSelect(a)}
          style={{
            borderLeft: `5px solid ${getColor(a.risk_level)}`,
            padding: "12px",
            marginBottom: "10px",
            background: "#ffffff", // ✅ light card
            borderRadius: "10px",
            cursor: "pointer",
            border: "1px solid #e2e8f0", // ✅ subtle border
            boxShadow: "0 6px 16px rgba(15, 23, 42, 0.05)", // ✅ soft shadow
          }}
        >
          <div style={{ fontWeight: "bold", color: "#0f172a" }}>
            {a.risk_level} Alert
          </div>

          <div style={{ fontSize: "13px", color: "#64748b" }}>
            {a.location} | {a.bin_id}
          </div>

          <div style={{ fontSize: "12px", color: "#64748b" }}>
            {a.time}
          </div>

          <div style={{ marginTop: "6px", color: "#0f172a" }}>
            Odour Risk: {a.odour_risk}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AlertList;