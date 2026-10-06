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
      className={`rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-5 sm:p-6 ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <ShieldAlert className="w-8 h-8 text-amber-600 shrink-0" aria-hidden />
        <div className="flex-1 space-y-2">
          <h2 id="medical-disclaimer-title" className="text-lg font-bold text-amber-900 dark:text-amber-200">
            Miễn trừ trách nhiệm
          </h2>
          <p className="text-base text-gray-700 dark:text-gray-200 leading-relaxed">
            Thông tin trên Mom Ơi, kể cả kết quả do AI gợi ý, <strong>chỉ để mẹ tham khảo</strong>.
            Mom Ơi <strong>không thay thế</strong> việc thăm khám, chẩn đoán hay điều trị của bác sĩ,
            và không chịu trách nhiệm cho các quyết định chỉ dựa vào thông tin trên ứng dụng.
            Khi mẹ hoặc bé có dấu hiệu bất thường, hãy đến cơ sở y tế gần nhất.
          </p>
        </div>
        <a
          href={`tel:${EMERGENCY_NUMBER}`}
          className="self-start inline-flex items-center gap-2 px-5 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white text-base font-bold shrink-0"
        >
          <Phone className="w-5 h-5" /> Cấp cứu: gọi {EMERGENCY_NUMBER}
        </a>
      </div>
    </section>
  );
}
