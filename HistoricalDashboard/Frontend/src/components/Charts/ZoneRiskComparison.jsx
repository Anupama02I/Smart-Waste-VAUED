import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

function ZoneRiskComparison({ zoneData, zoneRiskDomain }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={zoneData}
        layout="vertical"
        margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
      >
        {/* ✅ Light grid */}
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

        {/* ✅ X Axis */}
        <XAxis
          type="number"
          domain={zoneRiskDomain}
          tick={{ fill: "#64748b" }}
          tickCount={6}
          allowDecimals
          tickFormatter={(v) => Number(v).toFixed(1)}
          axisLine={{ stroke: "#cbd5e1" }}
          tickLine={{ stroke: "#cbd5e1" }}
        />

        {/* ✅ Y Axis */}
        <YAxis
          type="category"
          dataKey="zone"
          width={90}
          tick={{ fill: "#334155", fontSize: 12 }}
          axisLine={{ stroke: "#cbd5e1" }}
          tickLine={{ stroke: "#cbd5e1" }}
        />

        {/* ✅ Tooltip */}
        <Tooltip
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            color: "#0f172a",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
          }}
          formatter={(value) => [
            Number(value).toFixed(2),
            "Avg Odour Risk",
          ]}
        />

        {/* ✅ Bar */}
        <Bar
          dataKey="avg_risk"
          barSize={40}
          fill="#38bdf8"
          radius={[6, 6, 6, 6]} // softer look
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default ZoneRiskComparison;