import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const generateTicks = (min, max) => {
  const start = Math.floor(min);
  const end = Math.ceil(max);
  const step = 2;

  let ticks = [];
  for (let i = start; i <= end; i += step) {
    ticks.push(i);
  }

  return ticks;
};

// -------------------------------
// Light Tooltip
// -------------------------------
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const risk = payload[0].value || 0;

    return (
      <div
        style={{
          background: "#ffffff",
          padding: "10px",
          borderRadius: "8px",
          color: "#0f172a",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)"
        }}
      >
        <p><b>Time:</b> {label}</p>
        <p><b>Avg Risk:</b> {risk.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

// -------------------------------
// Chart
// -------------------------------
function RiskLineChart({ data }) {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const cleanedData = data.map(d => ({
    time: d.time,
    risk: Number(d.avg_risk),
    high_count: d.high_count
  }));

  const risks = cleanedData.map(d => d.risk);
  const min = Math.min(...risks);
  const max = Math.max(...risks);

  return (
    <div
      style={{
        width: "100%",
        height: 320,
        background: "#ffffff", // ✅ white card
        padding: "16px",
        borderRadius: "14px",
        border: "1px solid #dbe4ea",
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.05)"
      }}
    >
      <ResponsiveContainer>
        <LineChart data={cleanedData}>
          
          {/* light grid */}
          <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />

          {/* axes */}
          <XAxis dataKey="time" stroke="#64748b" />
          <YAxis
            stroke="#64748b"
            domain={[Math.floor(min), Math.ceil(max)]}
            ticks={generateTicks(min, max)}
          />

          <Tooltip content={<CustomTooltip />} />

          <Line
            type="monotone"
            dataKey="risk"
            stroke="#f97316"
            strokeWidth={3}
            dot={(props) => {
              const { cx, cy, payload } = props;

              // 🔴 highlight high risk
              if (payload.high_count > 0) {
                return <circle cx={cx} cy={cy} r={6} fill="#ef4444" />;
              }

              return <circle cx={cx} cy={cy} r={4} fill="#f97316" />;
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default RiskLineChart;