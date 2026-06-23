import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function NutritionRadar({ intake = { iron: 65, calcium: 55, folate: 80, protein: 75 } }) {
  const data = [
    { subject: 'Sắt (Iron)', A: intake.iron || 0, fullMark: 100 },
    { subject: 'Canxi (Calcium)', A: intake.calcium || 0, fullMark: 100 },
    { subject: 'Axit Folic', A: intake.folate || 0, fullMark: 100 },
    { subject: 'Đạm (Protein)', A: intake.protein || 0, fullMark: 100 },
  ];

  const deficiencies = [];
  if ((intake.iron || 0) < 70) deficiencies.push('Thiếu Sắt (cần bổ sung từ thịt đỏ, cải bó xôi, ngũ cốc)');
  if ((intake.calcium || 0) < 70) deficiencies.push('Thiếu Canxi (cần uống sữa tiệt trùng, ăn phô mai, cá mòi)');
  if ((intake.folate || 0) < 70) deficiencies.push('Thiếu Axit Folic (cần ăn rau xanh đậm, các loại đậu, nước cam)');
  if ((intake.protein || 0) < 70) deficiencies.push('Thiếu Đạm (cần nạp thêm cá hồi, trứng chín kỹ, ức gà)');

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-pink-100/50 dark:border-gray-700 shadow-sm flex flex-col items-center">
      <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Cân bằng dinh dưỡng hôm nay
      </h3>

      <div className="w-full h-44 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#FCE7F3" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 9, fontWeight: 700, fill: '#64748B' }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8, fill: '#94A3B8' }} />
            <Radar
              name="Dinh dưỡng"
              dataKey="A"
              stroke="#A78BFA"
              fill="#F472B6"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {deficiencies.length > 0 ? (
        <div className="mt-3 w-full bg-rose-50/70 dark:bg-rose-950/15 p-3 rounded-xl border border-rose-100 dark:border-rose-900/30 text-[10px] text-rose-700 dark:text-rose-350 font-bold space-y-1">
          <p className="flex items-center gap-1">⚠️ Cảnh báo thiếu hụt chất dinh dưỡng:</p>
          {deficiencies.map((d, idx) => (
            <p key={idx} className="pl-3.5 relative before:content-['•'] before:absolute before:left-1">
              {d}
            </p>
          ))}
        </div>
      ) : (
        <div className="mt-3 w-full bg-green-50/70 dark:bg-green-950/15 p-2.5 rounded-xl border border-green-100 dark:border-green-900/30 text-[10px] text-green-700 dark:text-green-400 font-bold text-center">
          ✨ Đạt mức dinh dưỡng an toàn lý tưởng!
        </div>
      )}
    </div>
  );
}
