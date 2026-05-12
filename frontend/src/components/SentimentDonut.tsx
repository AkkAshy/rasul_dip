"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface Item {
  label: string;
  count: number;
}

const COLORS: Record<string, string> = {
  positive: "#22c55e",
  neutral: "#94a3b8",
  negative: "#ef4444",
};

const LABEL_RU: Record<string, string> = {
  positive: "Pozitiv",
  neutral: "Neytral",
  negative: "Negativ",
};

export function SentimentDonut({ data }: { data: Item[] }) {
  const chartData = data.map((d) => ({
    name: LABEL_RU[d.label] || d.label,
    value: d.count,
    rawLabel: d.label,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {chartData.map((entry) => (
            <Cell key={entry.rawLabel} fill={COLORS[entry.rawLabel] || "#64748b"} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
