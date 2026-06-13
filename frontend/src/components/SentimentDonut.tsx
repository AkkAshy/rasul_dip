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
  positive: "#6b8e4e", // sage
  neutral: "#c4b79e", // warm gray (neytral)
  negative: "#c2452e", // rust
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
          stroke="#fffdf9"
          strokeWidth={3}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.rawLabel}
              fill={COLORS[entry.rawLabel] || "#c4b79e"}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#fffdf9",
            border: "1px solid #ddd0b8",
            borderRadius: 10,
            color: "#2b221a",
            fontSize: 13,
          }}
          itemStyle={{ color: "#2b221a" }}
          cursor={false}
        />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 13, color: "#6e6047" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
