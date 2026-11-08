import React, { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock, HeartPulse, Sparkles } from 'lucide-react';
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
    <div className="font-display max-w-6xl mx-auto space-y-6 pb-10 text-theme-ink">
      {/* Header */}
      <header className="bg-theme-surface rounded-3xl border border-theme-line p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-theme-brand-soft text-theme-ink px-3.5 py-1.5 text-xs font-bold border border-theme-brand/20">
          <CalendarDays className="w-4 h-4 text-theme-brand" aria-hidden="true" />
          <span>Lịch chăm sóc cá nhân</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-ink mt-3 tracking-tight">
          Việc cần chăm hôm nay
        </h1>
        <p className="text-sm sm:text-base text-theme-muted font-medium mt-1.5 max-w-2xl leading-relaxed">
          Lịch được gợi ý theo giai đoạn hồ sơ để mẹ không bỏ sót những việc quan trọng trong ngày.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Danh sách việc cần chăm */}
        <section className="lg:col-span-2 bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-theme-line">
            <h2 className="text-lg font-bold text-theme-ink">Lịch trình gợi ý trong ngày</h2>
            {!loading && items.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-theme-page border border-theme-line px-3 py-1 text-xs font-bold text-theme-ink">
                {items.length} mục
              </span>
            )}
          </div>

          {loading ? (
            <div className="rounded-2xl bg-theme-page border border-theme-line p-8 text-center text-sm font-semibold text-theme-muted">
              Đang tải lịch chăm sóc...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl bg-theme-page border border-theme-line p-8 text-center space-y-2">
              <p className="text-sm font-bold text-theme-ink">Chưa có mục nhắc việc nào cho hôm nay</p>
              <p className="text-xs text-theme-muted font-medium">
                Mẹ có thể cập nhật giai đoạn thai kỳ hoặc sau sinh trong Hồ sơ sức khỏe để nhận lịch trình phù hợp.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {items.map((item) => (
                <article
                  key={`${item.time}-${item.title}`}
                  className="flex items-start gap-4 rounded-2xl border border-theme-line bg-theme-page/60 p-4 sm:p-5 transition-colors hover:border-theme-brand/40"
                >
                  <div className="w-11 h-11 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0 border border-theme-brand/15">
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-surface border border-theme-line px-2.5 py-0.5 text-xs font-bold text-theme-ink">
                        <Clock className="w-3.5 h-3.5 text-theme-brand" aria-hidden="true" />
                        {item.time}
                      </span>
                      {item.priority && (
                        <span className="inline-flex items-center rounded-full bg-status-warn-bg border border-status-warn-line/40 px-2.5 py-0.5 text-xs font-bold text-status-warn-text">
                          Mức ưu tiên: {item.priority}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-theme-ink mt-2">{item.title}</h3>
                    <p className="text-sm text-theme-muted mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Cột thông tin bối cảnh & lưu ý y tế */}
        <aside className="space-y-4">
          <div className="bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm">
            <div className="w-11 h-11 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center mb-3.5">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <p className="text-xs font-bold text-theme-muted">Bối cảnh hiện tại</p>
            <h2 className="text-lg font-extrabold text-theme-ink mt-1">
              {data?.stage === 'Pregnant'
                ? `Tuần thai ${data?.pregnancyWeek || 'đang cập nhật'}`
                : 'Theo hồ sơ của mẹ'}
            </h2>
            <p className="text-xs font-medium text-theme-muted mt-2 leading-relaxed">
              Các nhắc việc này là gợi ý chăm sóc hàng ngày, không thay thế chỉ định hay tư vấn trực tiếp của bác sĩ.
            </p>
          </div>

          <div className="bg-status-warn-bg rounded-3xl border border-status-warn-line/50 p-5 sm:p-6">
            <div className="w-11 h-11 rounded-2xl bg-theme-surface text-status-warn-text flex items-center justify-center mb-3.5 border border-status-warn-line/30">
              <HeartPulse className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-base font-bold text-status-warn-text">Dấu hiệu cần chú ý</h3>
            <p className="text-xs font-medium text-status-warn-text mt-2 leading-relaxed">
              Nếu xuất hiện đau dữ dội, chảy máu, khó thở, sốt cao hoặc ý nghĩ làm hại bản thân, hãy liên hệ cơ sở y tế ngay.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
