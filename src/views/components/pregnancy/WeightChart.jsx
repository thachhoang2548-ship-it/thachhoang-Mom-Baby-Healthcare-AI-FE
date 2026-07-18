import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Customized } from 'recharts';
import { X } from 'lucide-react';

const CHART_MARGINS = { top: 20, right: 20, left: 10, bottom: 10 };

function AxisArrows(props) {
  const { width, height } = props;
  if (!width || !height) return null;

  const axisColor = '#94A3B8';

  // Use constants for margins to avoid undefined props from Recharts Customized
  const xPos = width - CHART_MARGINS.right;
  const yPos = height - CHART_MARGINS.bottom;
  const leftPos = CHART_MARGINS.left;
  const topPos = CHART_MARGINS.top;

  return (
    <g>
      {/* X-Axis Arrow */}
      <path
        d={`M ${xPos} ${yPos} L ${xPos - 6} ${yPos - 4} L ${xPos - 6} ${yPos + 4} Z`}
        fill={axisColor}
      />
      {/* Y-Axis Arrow */}
      <path
        d={`M ${leftPos} ${topPos} L ${leftPos - 4} ${topPos + 6} L ${leftPos + 4} ${topPos + 6} Z`}
        fill={axisColor}
      />
    </g>
  );
}

function ChartInner({ data, height = '100%' }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={CHART_MARGINS}>
        <defs>
          <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F472B6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#F472B6" stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#FCE7F3" opacity={0.3} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }}
          axisLine={{ stroke: '#94A3B8', strokeWidth: 1 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }}
          axisLine={{ stroke: '#94A3B8', strokeWidth: 1 }}
          tickLine={false}
          domain={['dataMin - 1', 'dataMax + 1']}
          label={{
            value: 'kg',
            position: 'top',
            offset: 10,
            style: { fontSize: 11, fontWeight: 700, fill: '#94A3B8' }
          }}
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
        <Customized component={<AxisArrows />} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function WeightChart({ logs = [] }) {
  const [isZoomed, setIsZoomed] = useState(false);

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
    <>
      <button
        className="w-full h-44 cursor-pointer group relative text-left"
        onClick={() => setIsZoomed(true)}
      >
        <div className="absolute inset-0 bg-pink-500/0 group-hover:bg-pink-500/5 transition-colors rounded-2xl z-10" />
        <ChartInner data={data} height="100%" />
      </button>

      {isZoomed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl h-[80vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 flex flex-col">
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Biểu đồ cân nặng</h3>
              <p className="text-sm text-gray-500">Theo dõi sự thay đổi cân nặng theo ngày</p>
            </div>

            <div className="flex-1 w-full">
              <ChartInner data={data} height="100%" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
