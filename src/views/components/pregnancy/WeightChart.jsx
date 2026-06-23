import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function WeightChart({ logs = [] }) {
  const data = [...logs]
    .sort((a, b) => new Date(a.recordedAt || a.date) - new Date(b.recordedAt || b.date))
    .map((log, idx) => ({
      name: `Tuần ${log.week || idx + 1}`,
      weight: log.weight || log.weightKg,
      date: new Date(log.recordedAt || log.date).toLocaleDateString('vi-VN', {
        month: 'short',
        day: 'numeric',
      }),
    }));

  if (data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center border border-dashed border-pink-100 dark:border-gray-700 rounded-2xl bg-pink-50/10 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 font-semibold italic">
        Chưa có nhật ký cân nặng. Hãy nhập chỉ số đầu tiên! ⚖️
      </div>
    );
  }

  return (
    <div className="w-full h-44">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#F472B6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#F472B6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#FCE7F3" opacity={0.3} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }}
            axisLine={false}
            tickLine={false}
            domain={['dataMin - 1', 'dataMax + 1']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #FCE7F3',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(244, 114, 182, 0.1)',
            }}
            labelStyle={{ color: '#DB2777' }}
          />
          <Area
            type="monotone"
            dataKey="weight"
            name="Cân nặng (kg)"
            stroke="#DB2777"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#weightGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
