function BinDetails({ summary }) {
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
        <h3 style={{ color: "#0f172a" }}>Bin Details</h3>
        <p style={{ color: "#64748b" }}>
          Select a zone and bin to view details.
        </p>
      </div>
    );
  }

  const items = [
    { label: "Bin", value: summary.binId },
    { label: "Zone", value: summary.zone },
    { label: "Date", value: summary.date },
    { label: "Temperature", value: summary.temperature.toFixed(1) + " °C" },
    { label: "Humidity", value: summary.humidity.toFixed(1) + " %" },
    { label: "Methane", value: summary.methane.toFixed(2) },
    { label: "Ammonia", value: summary.ammonia.toFixed(2) },
    { label: "CO2", value: summary.co2.toFixed(2) },
    { label: "CO", value: summary.co.toFixed(2) },
    { label: "NO2", value: summary.no2.toFixed(2) },
    { label: "Avg Risk", value: summary.avgRisk.toFixed(2) },
    { label: "Risk Level", value: summary.riskLevel },
  ];

  const getRiskColor = (level) => {
    if (level === "High") return "#dc2626";
    if (level === "Medium") return "#f97316";
    return "#16a34a";
  };

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
      <h3 style={{ color: "#0f172a" }}>Bin Details</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginTop: "14px",
        }}
      >
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "10px",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                color: "#64748b",
                marginBottom: "4px"
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color:
                  item.label === "Risk Level"
                    ? getRiskColor(item.value)
                    : "#0f172a"
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BinDetails;