"use client";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface Item {
  label: string;
  count: number;
}

const COLORS: Record<string, string> = {
  positive: "#87a96b", // sage
  neutral: "#a89a82", // sand-dim
  negative: "#ca5a45", // rust
};

const LABEL_KAA: Record<string, string> = {
  positive: "Pozitiv",
  neutral: "Neytral",
  negative: "Negativ",
};

export function SentimentDonut({ data }: { data: Item[] }) {
  const chartData = data.map((d) => ({
    name: LABEL_KAA[d.label] || d.label,
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
          innerRadius={62}
          outerRadius={100}
          paddingAngle={3}
          stroke="#1b1712"
          strokeWidth={3}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.rawLabel}
              fill={COLORS[entry.rawLabel] || "#a89a82"}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#1b1712",
            border: "1px solid #2f2718",
            borderRadius: 10,
            color: "#e8dcc8",
            fontSize: 13,
          }}
          itemStyle={{ color: "#e8dcc8" }}
          cursor={false}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 13, color: "#a89a82" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
