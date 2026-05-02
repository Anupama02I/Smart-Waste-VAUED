import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Brush,
} from "recharts";

function BrushableRiskTrend({ data, domain, onBrushChange }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: "#ffffff",
        padding: "16px",
        borderRadius: "14px",
        border: "1px solid #dbe4ea",
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)"
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 28 }}
        >
          {/* Light grid */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* X Axis */}
          <XAxis
            dataKey="date"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={{ stroke: "#cbd5e1" }}
          />

          {/* Y Axis */}
          <YAxis
            domain={domain}
            tick={{ fill: "#64748b", fontSize: 12 }}
            tickCount={6}
            allowDecimals
            tickFormatter={(v) => Number(v).toFixed(1)}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={{ stroke: "#cbd5e1" }}
          />

          {/* Tooltip */}
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              color: "#0f172a",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)"
            }}
            formatter={(value) => [
              Number(value).toFixed(2),
              "Avg Odour Risk",
            ]}
          />

          {/* Line */}
          <Line
            type="monotone"
            dataKey="avg_risk"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6 }}
          />

          {/* Brush (range selector) */}
          {data.length > 1 ? (
            <Brush
              dataKey="date"
              height={28}
              stroke="#94a3b8"
              travellerWidth={10}
              fill="#f1f5f9" // light background
              onChange={(range) => {
                if (
                  !range ||
                  !Number.isInteger(range.startIndex) ||
                  !Number.isInteger(range.endIndex)
                ) {
                  onBrushChange(null);
                  return;
                }
                onBrushChange(range);
              }}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BrushableRiskTrend;