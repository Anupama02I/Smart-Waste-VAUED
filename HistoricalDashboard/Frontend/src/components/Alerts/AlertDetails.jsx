function AlertDetails({ alert }) {
  if (!alert) {
    return <p style={{ color: "#64748b" }}>Select an alert</p>;
  }

  const getColor = (level) => {
    if (level === "High") return "#ef4444";
    if (level === "Medium") return "#f97316";
    return "#16a34a";
  };

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "16px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 6px 16px rgba(15, 23, 42, 0.05)",
      }}
    >
      <h3 style={{ color: getColor(alert.risk_level) }}>
        {alert.risk_level} Alert
      </h3>

      <p style={{ color: "#334155" }}>
        <strong>Zone:</strong> {alert.location}
      </p>
      <p style={{ color: "#334155" }}>
        <strong>Bin:</strong> {alert.bin_id}
      </p>
      <p style={{ color: "#334155" }}>
        <strong>Time:</strong> {alert.time}
      </p>

      <hr style={{ borderColor: "#e2e8f0" }} />

      <p style={{ color: "#334155" }}>
        Temperature: {alert.temperature}
      </p>
      <p style={{ color: "#334155" }}>
        Humidity: {alert.humidity}
      </p>
      <p style={{ color: "#334155" }}>
        Methane: {alert.methane}
      </p>
      <p style={{ color: "#334155" }}>
        Ammonia: {alert.ammonia}
      </p>

      <hr style={{ borderColor: "#e2e8f0" }} />

      <p style={{ color: "#0f172a", fontWeight: "600" }}>
        <strong>Risk:</strong> {alert.odour_risk}
      </p>
    </div>
  );
}

export default AlertDetails;