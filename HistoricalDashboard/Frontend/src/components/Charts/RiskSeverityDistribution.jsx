import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

function RiskSeverityDistribution({ severityData, riskColors }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={severityData}
          dataKey="count"
          nameKey="level"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
        >
          {severityData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={riskColors[entry.level] || "#94a3b8"} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default RiskSeverityDistribution;