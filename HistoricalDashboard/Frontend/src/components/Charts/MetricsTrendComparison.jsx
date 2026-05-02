import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

const COLORS = {
  temperature: "#f59e0b",
  humidity: "#38bdf8",
  methane: "#a78bfa",
  ammonia: "#fb7185",
};

function getPaddedDomain(values, padRatio = 0.2, minPad = 1) {
  const nums = values
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));

  if (!nums.length) return [0, 1];

  const min = Math.min(...nums);
  const max = Math.max(...nums);

  if (min === max) return [min - minPad, max + minPad];

  const pad = Math.max((max - min) * padRatio, minPad);
  return [Math.floor(min - pad), Math.ceil(max + pad)];
}

function MetricsTrendComparison({ metricTrendData = [], selectedMetric }) {
  if (!Array.isArray(metricTrendData) || metricTrendData.length === 0) {
    return <p style={{ color: "#64748b" }}>No data available</p>; // ✅ fixed
  }

  const metrics = ["temperature", "humidity", "methane", "ammonia"];

  const visibleMetrics =
    selectedMetric && metrics.includes(selectedMetric)
      ? [selectedMetric]
      : metrics;

  const values = metricTrendData.flatMap((d) =>
    visibleMetrics.map((m) => Number(d[m]))
  );

  const yDomain = getPaddedDomain(values, 0.35, 1);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={metricTrendData}
        margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
      >
        {/* ✅ Light grid */}
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

        {/* ✅ Light axis */}
        <XAxis
          dataKey="date"
          tick={{ fill: "#64748b", fontSize: 12 }}
          axisLine={{ stroke: "#cbd5e1" }}
          tickLine={{ stroke: "#cbd5e1" }}
        />

        <YAxis
          domain={yDomain}
          tick={{ fill: "#64748b", fontSize: 12 }}
          tickCount={6}
          axisLine={{ stroke: "#cbd5e1" }}
          tickLine={{ stroke: "#cbd5e1" }}
        />

        {/* ✅ Light tooltip */}
        <Tooltip
          contentStyle={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            color: "#0f172a",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
          }}
        />

        {/* ✅ Legend text fix */}
        <Legend wrapperStyle={{ color: "#334155" }} />

        {visibleMetrics.map((metric) => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={COLORS[metric]}
            strokeWidth={3}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export default MetricsTrendComparison;