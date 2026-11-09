import React from 'react';
import { ShieldAlert, Phone } from 'lucide-react';
import { EMERGENCY_NUMBER } from '../../../config/advisor';

/**
 * Tuyên bố miễn trừ trách nhiệm y tế, đặt ở cuối mọi trang.
 * Viết bằng lời đơn giản để mẹ đọc là hiểu.
 */
export default function MedicalDisclaimer({ className = '' }) {
  return (
    <section
      aria-labelledby="medical-disclaimer-title"
      className={`rounded-3xl border border-status-warn-line/60 bg-status-warn-bg p-5 font-display sm:p-6 ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-status-warn-line/40 bg-theme-surface text-status-warn-text">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="flex-1 space-y-1.5">
            <h2 id="medical-disclaimer-title" className="text-base font-bold text-status-warn-text sm:text-lg">
              Miễn trừ trách nhiệm
            </h2>
            <p className="text-sm leading-relaxed text-theme-ink sm:text-base">
              Mọi thông tin trên Mom Ơi! (kể cả kết quả do AI gợi ý) <strong>chỉ để mẹ tham khảo</strong>.
              Mom Ơi! <strong>không thay thế</strong> việc thăm khám, chẩn đoán hay điều trị của bác sĩ,
              và không chịu trách nhiệm cho các quyết định chỉ dựa vào thông tin trên ứng dụng.
              Khi mẹ hoặc bé có dấu hiệu bất thường, hãy đến cơ sở y tế gần nhất.
            </p>
          </div>
        </div>
        <a
          href={`tel:${EMERGENCY_NUMBER}`}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 self-start rounded-full bg-red-700 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger-text focus-visible:ring-offset-2 sm:text-base"
        >
          <Phone className="h-4 w-4" />
          <span>Cấp cứu: gọi {EMERGENCY_NUMBER}</span>
        </a>
      </div>
    </section>
  );
}
