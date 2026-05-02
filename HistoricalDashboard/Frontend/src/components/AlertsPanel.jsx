function AlertsPanel({ summary }) {
  if (!summary) {
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #dbe4ea",
          padding: "16px",
          borderRadius: "14px",
          width: "100%",
          boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)"
        }}
      >
        <h3 style={{ color: "#0f172a" }}>Alerts</h3>
        <p style={{ color: "#64748b" }}>
          Select a zone and bin to view alerts.
        </p>
      </div>
    );
  }

  let message = "Normal condition.";
  let color = "#16a34a"; // green

  if (summary.riskLevel === "High") {
    message = "High odour risk detected. Immediate attention required.";
    color = "#dc2626"; // red
  } else if (summary.riskLevel === "Medium") {
    message = "Moderate odour risk. Monitor this bin closely.";
    color = "#f97316"; // orange
  }

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #dbe4ea",
        padding: "16px",
        borderRadius: "14px",
        width: "100%",
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)"
      }}
    >
      <h3 style={{ color: "#0f172a" }}>Alerts</h3>

      {/* bin info */}
      <div style={{ marginTop: "10px", color: "#64748b" }}>
        {summary.binId} | {summary.zone}
      </div>

      {/* alert message box */}
      <div
        style={{
          marginTop: "14px",
          padding: "12px",
          borderRadius: "10px",
          background: "#f8fafc", // light background
          borderLeft: `5px solid ${color}`, // highlight line
          color: "#0f172a",
          fontWeight: 600,
        }}
      >
        {message}
      </div>

      {/* extra info */}
      <div
        style={{
          marginTop: "12px",
          color: "#64748b",
          fontSize: "14px"
        }}
      >
        Avg Risk: <b>{summary.avgRisk.toFixed(2)}</b> | Level:{" "}
        <span style={{ color, fontWeight: 600 }}>
          {summary.riskLevel}
        </span>
      </div>
    </div>
  );
}

export default AlertsPanel;