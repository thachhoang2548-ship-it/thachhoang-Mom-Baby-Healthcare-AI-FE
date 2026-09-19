import React, { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, HeartPulse, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import wellnessService from '../../models/services/wellnessService';

export default function CareCalendarPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    wellnessService.getCareCalendar()
      .then((res) => {
        if (active) setData(res);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Không thể tải lịch chăm sóc.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const items = data?.items || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 text-momPink px-3 py-1 text-[11px] font-black uppercase tracking-wider">
          <CalendarDays className="w-4 h-4" /> Lịch chăm sóc cá nhân
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3">Việc cần chăm hôm nay</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Lịch được gợi ý theo giai đoạn hồ sơ để mami không bỏ sót những việc quan trọng.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="space-y-4">
            {loading ? (
              <div className="rounded-2xl bg-gray-50 p-8 text-center text-sm font-bold text-gray-400">Đang tải lịch chăm sóc...</div>
            ) : items.map((item) => (
              <div key={`${item.time}-${item.title}`} className="flex gap-4 rounded-2xl border border-pink-100 bg-pink-50/40 p-4">
                <div className="w-10 h-10 rounded-2xl bg-white text-momPink flex items-center justify-center shadow-sm shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-900 uppercase tracking-wider">{item.time}</p>
                  <h3 className="text-sm font-black text-gray-900 mt-1">{item.title}</h3>
                  <p className="text-sm font-semibold text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-2">Mức ưu tiên {item.priority}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="bg-white rounded-3xl border border-violet-100 p-5 shadow-sm">
            <Sparkles className="w-8 h-8 text-momPurple mb-3" />
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Bối cảnh hiện tại</p>
            <h2 className="text-lg font-black text-gray-900 mt-2">{data?.stage === 'Pregnant' ? `Tuần thai ${data?.pregnancyWeek || 'đang cập nhật'}` : 'Theo hồ sơ của mẹ'}</h2>
            <p className="text-xs font-semibold text-gray-500 mt-2 leading-relaxed">Các nhắc việc này là gợi ý chăm sóc, không thay thế tư vấn của bác sĩ.</p>
          </div>
          <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-5">
            <HeartPulse className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="text-sm font-black text-gray-900">Dấu hiệu cần chú ý</h3>
            <p className="text-xs font-semibold text-gray-600 mt-2 leading-relaxed">Nếu xuất hiện đau dữ dội, chảy máu, khó thở, sốt cao hoặc ý nghĩ làm hại bản thân, hãy liên hệ cơ sở y tế ngay.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
