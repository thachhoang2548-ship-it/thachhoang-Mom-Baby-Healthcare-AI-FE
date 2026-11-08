import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, HeartPulse, PhoneCall, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import wellnessService from '../../models/services/wellnessService';

export default function EmergencyHelpPage() {
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    wellnessService.getEmergencyGuide()
      .then((res) => {
        if (active) setGuide(res);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Không thể tải hướng dẫn khẩn cấp.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const redFlags = guide?.redFlags || [];
  const actions = guide?.actions || [];

  return (
    <div className="font-display max-w-5xl mx-auto space-y-6 pb-10 text-theme-ink">
      {/* Khối khẩn cấp tĩnh, rõ ràng, tương phản cao */}
      <header className="rounded-3xl bg-status-danger-bg border-2 border-status-danger-line p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-theme-surface border border-status-danger-line px-3.5 py-1.5 text-xs font-bold text-status-danger-text">
              <AlertTriangle className="w-4 h-4 text-status-danger-text" aria-hidden="true" />
              <span>Hướng dẫn y tế khẩn cấp</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-status-danger-text tracking-tight">
              {guide?.headline || 'Trợ giúp khẩn cấp'}
            </h1>
            <p className="text-sm sm:text-base font-medium text-status-danger-text leading-relaxed">
              {loading && !guide
                ? 'Đang tải hướng dẫn xử trí khẩn cấp...'
                : guide?.notice || 'Khi xuất hiện dấu hiệu nguy hiểm ở mẹ hoặc bé, ưu tiên gọi cấp cứu 115 hoặc đến bệnh viện gần nhất ngay lập tức.'}
            </p>
          </div>

          <a
            href="tel:115"
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2.5 rounded-2xl bg-red-700 px-6 py-3 text-base font-extrabold text-white shadow-sm hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger-text focus-visible:ring-offset-2"
          >
            <PhoneCall className="w-5 h-5" aria-hidden="true" />
            <span>Gọi cấp cứu 115</span>
          </a>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Cột 1: Dấu hiệu đỏ */}
        <section className="bg-theme-surface rounded-3xl border border-theme-line p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-theme-line">
            <div className="w-10 h-10 rounded-2xl bg-status-danger-bg border border-status-danger-line text-status-danger-text flex items-center justify-center shrink-0">
              <HeartPulse className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-theme-ink">Dấu hiệu đỏ cần đi khám ngay</h2>
              <p className="text-xs text-theme-muted font-medium">Không tự theo dõi tại nhà nếu gặp các biểu hiện sau</p>
            </div>
          </div>

          {loading && redFlags.length === 0 ? (
            <p className="text-sm text-theme-muted font-medium py-4">Đang tải danh sách dấu hiệu...</p>
          ) : redFlags.length === 0 ? (
            <p className="text-sm text-theme-muted font-medium py-4">
              Chưa tải được danh sách chi tiết. Nếu mẹ hoặc bé có biểu hiện bất thường nghiêm trọng, hãy gọi 115 ngay.
            </p>
          ) : (
            <ul className="space-y-3">
              {redFlags.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-status-danger-line bg-status-danger-bg/70 p-4 text-sm font-semibold text-status-danger-text leading-relaxed"
                >
                  <AlertTriangle className="w-4 h-4 text-status-danger-text shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Cột 2: Hành động ngay */}
        <section className="bg-theme-surface rounded-3xl border border-theme-line p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-theme-line">
            <div className="w-10 h-10 rounded-2xl bg-status-ok-bg border border-status-ok-line text-status-ok-text flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-theme-ink">Hành động cần thực hiện ngay</h2>
              <p className="text-xs text-theme-muted font-medium">Các bước an toàn trong lúc chờ hỗ trợ y tế</p>
            </div>
          </div>

          {loading && actions.length === 0 ? (
            <p className="text-sm text-theme-muted font-medium py-4">Đang tải hướng dẫn hành động...</p>
          ) : actions.length === 0 ? (
            <p className="text-sm text-theme-muted font-medium py-4">
              Liên hệ ngay người thân đi cùng và gọi tổng đài cấp cứu 115 hoặc cơ sở sản nhi gần nhất.
            </p>
          ) : (
            <ol className="space-y-3">
              {actions.map((item, idx) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-2xl bg-status-ok-bg/70 border border-status-ok-line p-4 text-sm font-semibold text-status-ok-text leading-relaxed"
                >
                  <span className="inline-flex w-6 h-6 rounded-full bg-status-ok text-theme-surface text-xs font-bold items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>

      {/* Miễn trừ trách nhiệm */}
      <section className="rounded-2xl bg-status-warn-bg border border-status-warn-line/50 p-5 flex items-start gap-3.5">
        <ShieldCheck className="w-5 h-5 text-status-warn-text shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-status-warn-text flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Lưu ý giới hạn hỗ trợ của ứng dụng</span>
          </h3>
          <p className="text-xs font-medium text-status-warn-text leading-relaxed">
            {guide?.disclaimer || 'Mom Ơi! chỉ hỗ trợ theo dõi và gợi ý chăm sóc, không thay thế cấp cứu hoặc chẩn đoán của bác sĩ chuyên khoa.'}
          </p>
        </div>
      </section>
    </div>
  );
}
