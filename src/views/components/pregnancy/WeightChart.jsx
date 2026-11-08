import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Customized,
} from 'recharts';
import { Maximize2, Scale, X } from 'lucide-react';

const CHART_MARGINS = { top: 20, right: 20, left: 6, bottom: 10 };

function AxisArrows(props) {
  const { width, height } = props;
  if (!width || !height) return null;

  const axisColor = '#6B5B60';
  const xPos = width - CHART_MARGINS.right;
  const yPos = height - CHART_MARGINS.bottom;
  const leftPos = CHART_MARGINS.left;
  const topPos = CHART_MARGINS.top;

  return (
    <g>
      <path
        d={`M ${xPos} ${yPos} L ${xPos - 6} ${yPos - 4} L ${xPos - 6} ${yPos + 4} Z`}
        fill={axisColor}
      />
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
          <linearGradient id="momWeightArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#AB4256" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#AB4256" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#EADFDA" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fontWeight: 600, fill: '#6B5B60' }}
          axisLine={{ stroke: '#EADFDA', strokeWidth: 1 }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fontWeight: 600, fill: '#6B5B60' }}
          axisLine={{ stroke: '#EADFDA', strokeWidth: 1 }}
          tickLine={false}
          width={38}
          domain={['dataMin - 1', 'dataMax + 1']}
          label={{
            value: 'kg',
            position: 'top',
            offset: 8,
            style: { fontSize: 12, fontWeight: 700, fill: '#6B5B60' },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #EADFDA',
            borderRadius: '14px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#2B2024',
            boxShadow: '0 6px 20px rgba(43, 32, 36, 0.08)',
          }}
          labelStyle={{ color: '#AB4256', fontWeight: 700 }}
        />
        <Area
          type="monotone"
          dataKey="weight"
          name="Cân nặng (kg)"
          stroke="#AB4256"
          strokeWidth={2.5}
          fillOpacity={1}
          fill="url(#momWeightArea)"
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
        month: 'numeric',
        day: 'numeric',
      }),
    }));

  if (data.length === 0) {
    return (
      <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-theme-line bg-theme-page/50 px-4 text-center font-display">
        <Scale className="h-5 w-5 text-theme-muted" />
        <p className="text-xs font-medium text-theme-muted sm:text-sm">
          Chưa có nhật ký cân nặng. Mẹ hãy nhập chỉ số đầu tiên bên dưới nhé.
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsZoomed(true)}
        aria-label="Phóng to biểu đồ cân nặng"
        className="group relative block h-48 w-full cursor-pointer rounded-2xl border border-theme-line bg-theme-page/40 p-2 text-left transition-colors hover:border-theme-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
      >
        <span className="absolute right-3 top-2.5 z-10 inline-flex items-center gap-1 rounded-full border border-theme-line bg-theme-surface px-2.5 py-1 text-xs font-semibold text-theme-muted group-hover:text-theme-ink">
          <Maximize2 className="h-3 w-3" />
          <span>Phóng to</span>
        </span>
        <ChartInner data={data} height="100%" />
      </button>

      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-theme-ink/45 p-4 backdrop-blur-[2px]"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative flex h-[78vh] w-full max-w-4xl flex-col rounded-3xl border border-theme-line bg-theme-surface p-6 font-display shadow-xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="weight-chart-modal-title"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-theme-line pb-4">
              <div>
                <h3 id="weight-chart-modal-title" className="text-xl font-bold text-theme-ink">
                  Biểu đồ cân nặng thai kỳ
                </h3>
                <p className="mt-0.5 text-sm text-theme-muted">
                  Theo dõi xu hướng thay đổi cân nặng của mẹ qua từng lần ghi nhận
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsZoomed(false)}
                aria-label="Đóng biểu đồ"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-theme-line bg-theme-page text-theme-ink transition-colors hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 w-full">
              <ChartInner data={data} height="100%" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
