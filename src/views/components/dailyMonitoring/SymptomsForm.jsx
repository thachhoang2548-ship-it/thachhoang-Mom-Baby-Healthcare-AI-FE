import React from "react";
import { Stethoscope } from "lucide-react";

export const SymptomsForm = ({ symptoms, setSymptoms }) => {
  return (
    <section className="bg-theme-surface rounded-3xl border border-theme-line p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
          <Stethoscope className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-theme-ink">Theo dõi triệu chứng</h2>
          <p className="text-xs text-theme-muted font-medium">Đánh giá nhanh các cảm giác khó chịu nếu có</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex w-full items-center justify-between mb-2">
            <label htmlFor="symptom-severity-range" className="text-sm font-semibold text-theme-ink">
              Mức độ khó chịu hôm nay
            </label>
            <span className="inline-flex rounded-full bg-theme-brand-soft px-3 py-0.5 text-xs font-extrabold text-theme-ink">
              {symptoms.severity} / 5
            </span>
          </div>

          <input
            id="symptom-severity-range"
            type="range"
            min="0"
            max="5"
            value={symptoms.severity}
            onChange={(e) => setSymptoms({ ...symptoms, severity: Number(e.target.value) })}
            className="w-full h-2 bg-theme-line rounded-full appearance-none cursor-pointer accent-theme-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          />
          <div className="flex justify-between text-xs text-theme-muted font-medium mt-1">
            <span>0 (Không có)</span>
            <span>3 (Vừa phải)</span>
            <span>5 (Nhiều)</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="symptom-daily-note" className="block text-xs font-bold text-theme-ink">
            Mô tả triệu chứng (không bắt buộc)
          </label>
          <textarea
            id="symptom-daily-note"
            rows={2}
            value={symptoms.note}
            onChange={(e) => setSymptoms({ ...symptoms, note: e.target.value })}
            placeholder="Ví dụ: Hơi đau lưng dưới vào buổi chiều..."
            className="w-full rounded-2xl border border-theme-line bg-theme-page/60 px-4 py-3 text-sm font-medium text-theme-ink placeholder:text-theme-muted focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/30"
          />
        </div>

        <p className="text-xs text-status-warn-text bg-status-warn-bg border border-status-warn-line/40 rounded-2xl px-3.5 py-2.5 font-medium">
          Lưu ý: Mức độ nghiêm trọng cao có thể kích hoạt cảnh báo gửi đến đội ngũ chăm sóc để hỗ trợ kịp thời.
        </p>
      </div>
    </section>
  );
};
