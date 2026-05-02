import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  LabelList,
  CartesianGrid
} from "recharts";

function BinRanking({ zone, data, loading, onSelectBin, selectedBin }) {
  if (!zone) {
    return <p style={{ color: "#64748b" }}>Select a zone to view ranking</p>;
  }

  if (loading) {
    return <p>Loading ranking...</p>;
  }

  if (!data || data.length === 0) {
    return <p style={{ color: "#64748b" }}>No data available for this selection</p>;
  }

  const values = data.map((d) => Number(d.avg_risk) || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const padding = Math.max((max - min) * 0.2, 1);
  const domainMin = Math.floor(min - padding);
  const domainMax = Math.ceil(max + padding);

  const normalize = (value) => {
    if (max === min) return 0.5;
    return (value - min) / (max - min);
  };

  const getColor = (value) => {
    const n = normalize(value);

    if (n >= 0.66) return "#dc2626"; // high
    if (n >= 0.33) return "#f97316"; // medium
    return "#16a34a"; // low
  };

  return (
    <div
      style={{
        width: "100%",
        height: 420,
        background: "#ffffff", // ✅ white card
        padding: "16px",
        borderRadius: "14px",
        border: "1px solid #dbe4ea",
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)"
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 60, left: 80, bottom: 20 }}
          barCategoryGap="20%"
        >
          {/* light grid */}
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />

          <XAxis
            type="number"
            domain={[domainMin, domainMax]}
            tick={{ fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={{ stroke: "#cbd5e1" }}
          />

          <YAxis
            type="category"
            dataKey="bin"
            width={120}
            tick={{ fill: "#334155" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={{ stroke: "#cbd5e1" }}
          />

          <Tooltip
            formatter={(value) => [Number(value).toFixed(2), "Avg Risk"]}
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              color: "#0f172a",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)"
            }}
          />

          <Bar
            dataKey="avg_risk"
            barSize={36}
            radius={[8, 8, 8, 8]}
            onClick={(entry) => {
              const bin = entry?.bin || entry?.payload?.bin;
              if (bin) onSelectBin(bin);
            }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getColor(Number(entry.avg_risk) || 0)}
                stroke={selectedBin === entry.bin ? "#0f172a" : "none"}
                strokeWidth={selectedBin === entry.bin ? 2 : 0}
              />
            ))}

            <LabelList
              dataKey="avg_risk"
              position="right"
              offset={8}
              formatter={(value) => Number(value).toFixed(1)}
              fill="#0f172a"
              style={{ fontSize: "12px", fontWeight: "600" }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BinRanking;