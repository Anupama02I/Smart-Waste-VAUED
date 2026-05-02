import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

function FactorContributionScatter({
  scatterData,
  scatterXDomain,
  scatterYDomain,
  selectedMetricLabel,
  riskColors,
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
        
        {/* ✅ Light grid */}
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

        {/* ✅ X Axis */}
        <XAxis
          type="number"
          dataKey="x"
          name={selectedMetricLabel}
          domain={scatterXDomain}
          tick={{ fill: "#64748b", fontSize: 12 }}
          tickCount={6}
          allowDecimals
          tickFormatter={(v) => Number(v).toFixed(1)}
          axisLine={{ stroke: "#cbd5e1" }}
          tickLine={{ stroke: "#cbd5e1" }}
        />

        {/* ✅ Y Axis */}
        <YAxis
          type="number"
          dataKey="y"
          name="Odour Risk"
          domain={scatterYDomain}
          tick={{ fill: "#64748b", fontSize: 12 }}
          tickCount={6}
          allowDecimals
          tickFormatter={(v) => Number(v).toFixed(1)}
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
        />

        {/* ✅ Legend */}
        <Legend wrapperStyle={{ color: "#334155" }} />

        {/* ✅ Scatter points */}
        <Scatter
          name="Low"
          data={scatterData.filter((d) => d.risk_level === "Low")}
          fill={riskColors.Low}
        />

        <Scatter
          name="Medium"
          data={scatterData.filter((d) => d.risk_level === "Medium")}
          fill={riskColors.Medium}
        />

        <Scatter
          name="High"
          data={scatterData.filter((d) => d.risk_level === "High")}
          fill={riskColors.High}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export default FactorContributionScatter;