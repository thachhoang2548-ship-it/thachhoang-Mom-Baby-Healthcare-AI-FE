import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const SymptomTrendsChart = ({ entries = [], mode = "daily" }) => {
  // Sort oldest to newest for chronological display (left-to-right)
  const reversedEntries = [...entries].reverse();

  const data = reversedEntries.map((entry) => {
    const dateObj = new Date(entry.date || entry.createdAt);
    const dateStr = dateObj.toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" });
    
    if (mode === "daily") {
      return {
        date: dateStr,
        severity: entry.symptoms?.severity ?? 0,
        note: entry.symptoms?.note || "",
      };
    } else {
      return {
        date: dateStr,
        severity: entry.severityScore ?? 0,
        note: entry.textDescription || "",
      };
    }
  });

  const getBarColor = (severity) => {
    if (mode === "daily") {
      if (severity >= 5) return "#cf1322";  // critical
      if (severity >= 4) return "#ff7875";  // high
      if (severity >= 3) return "#fa8c16";  // mid-high
      if (severity >= 2) return "#ffa940";  // mid-low
      if (severity >= 1) return "#52c41a";  // low
      return "#d9d9d9";                      // none
    } else {
      if (severity >= 86) return "#cf1322";  // very high
      if (severity >= 71) return "#ff7875";  // high
      if (severity >= 51) return "#fa8c16";  // mid-high
      if (severity >= 31) return "#ffa940";  // mid-low
      return "#52c41a";                      // low
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border border-gray-700 text-xs font-sans">
          <p className="font-bold mb-1">Ngày: {item.date}</p>
          <p className="mb-1">
            Mức độ: <span className="font-semibold text-orange-400">{item.severity}</span> / {mode === "daily" ? 5 : 100}
          </p>
          {item.note && (
            <p className="text-gray-400 mt-1 max-w-[200px] break-words">
              Ghi chú: {item.note}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        <XAxis 
          dataKey="date" 
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={false}
        />
        <YAxis 
          domain={mode === "daily" ? [0, 5] : [0, 100]} 
          tick={{ fill: '#9ca3af', fontSize: 11 }}
          axisLine={{ stroke: '#e5e7eb' }}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="severity" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((entry, index) => (
            <Cell key={index} fill={getBarColor(entry.severity)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SymptomTrendsChart;
