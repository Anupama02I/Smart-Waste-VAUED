function KPIcard({ title, value }) {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: "20px",
        borderRadius: "14px",
        width: "200px",
        color: "#0f172a",
        border: "1px solid #dbe4ea",
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",

        // ✅ LEFT vertical line
        borderLeft: "5px solid #3b82f6",
      }}
    >
      <h3
        style={{
          marginBottom: "10px",
          color: "#64748b",
          fontSize: "18px",
          fontWeight: "500"
        }}
      >
        {title}
      </h3>

      <h2 style={{ fontSize: "26px", fontWeight: "700" }}>
        {value}
      </h2>
    </div>
  );
}

export default KPIcard;