function AlertSummary({ summary }) {
  const card = (title, value, color) => (
    <div
      style={{
        flex: 1,
        display: "flex", // ✅ important
        background: "#ffffff",
        borderRadius: "12px",
        minWidth: "140px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 6px 16px rgba(15, 23, 42, 0.05)",
        overflow: "hidden", // ✅ keeps line clean with radius
      }}
    >
      {/* ✅ REAL vertical line */}
      <div
        style={{
          width: "6px",
          background: color,
        }}
      />

      {/* content */}
      <div style={{ padding: "14px", flex: 1 }}>
        <div style={{ fontSize: "12px", color: "#64748b" }}>
          {title}
        </div>

        <div
          style={{
            fontSize: "22px",
            fontWeight: "bold",
            color: "#0f172a",
            marginTop: "4px",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}
    >
      {card("High Alerts", summary?.high_alerts || 0, "#ef4444")}
      {card("Medium Alerts", summary?.medium_alerts || 0, "#f97316")}
      {card("Low Alerts", summary?.low_alerts || 0, "#16a34a")}
      {card("Unresolved", summary?.unresolved_alerts || 0, "#eab308")}
    </div>
  );
}

export default AlertSummary;