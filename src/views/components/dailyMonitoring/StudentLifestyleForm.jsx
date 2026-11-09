import React from "react";
import { BookOpen } from "lucide-react";

const STRESS_ITEMS = [
  { level: "Low", label: "Thấp", activeClass: "bg-status-ok-bg border-status-ok-text text-status-ok-text" },
  { level: "Moderate", label: "Vừa phải", activeClass: "bg-status-warn-bg border-status-warn-line text-status-warn-text" },
  { level: "High", label: "Cao", activeClass: "bg-status-danger-bg border-status-danger-text text-status-danger-text" },
];

export const StudentLifestyleForm = ({ lifestyle, setLifestyle }) => {
  const handleChange = (field, value) => {
    setLifestyle((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <section className="bg-theme-surface rounded-3xl border border-theme-line p-6 shadow-sm md:col-span-2 space-y-6">
      <div className="flex items-center gap-3.5 pb-4 border-b border-theme-line">
        <div className="w-11 h-11 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-theme-ink">Nhật ký sinh hoạt & cân bằng thời gian</h2>
          <p className="text-xs text-theme-muted font-medium">
            Giúp hệ thống phân tích sự cân bằng giữa công việc, học tập và thời gian nghỉ ngơi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="flex w-full items-center justify-between mb-2">
            <label htmlFor="lifestyle-gpa" className="text-sm font-semibold text-theme-ink">
              Điểm GPA hiện tại
            </label>
            <span className="text-xs font-extrabold text-theme-ink bg-theme-brand-soft px-2.5 py-0.5 rounded-full">
              {lifestyle.gpa}
            </span>
          </div>
          <input
            id="lifestyle-gpa"
            type="range"
            min="2.0"
            max="4.0"
            step="0.05"
            value={lifestyle.gpa}
            onChange={(e) => handleChange("gpa", Number(e.target.value))}
            className="w-full h-2 bg-theme-line rounded-full appearance-none cursor-pointer accent-theme-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          />
          <div className="flex justify-between text-xs text-theme-muted font-medium mt-1">
            <span>2.0</span>
            <span>3.0</span>
            <span>4.0</span>
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold text-theme-ink mb-2 block">
            Mức độ căng thẳng hiện tại
          </span>
          <div className="grid grid-cols-3 gap-2">
            {STRESS_ITEMS.map((item) => {
              const selected = lifestyle.stressLevel === item.level;
              return (
                <button
                  key={item.level}
                  type="button"
                  onClick={() => handleChange("stressLevel", item.level)}
                  className={`min-h-[44px] py-2 px-3 text-xs sm:text-sm font-bold rounded-2xl border text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                    selected
                      ? `${item.activeClass} ring-2 ring-theme-brand/30`
                      : "bg-theme-page border-theme-line text-theme-ink hover:bg-theme-brand-soft"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {[
          { id: "studyHours", label: "Giờ tự học / làm việc trong ngày", max: 16, val: lifestyle.studyHours },
          { id: "sleepHours", label: "Giờ ngủ thực tế", max: 16, val: lifestyle.sleepHours },
          { id: "socialHours", label: "Giờ giao tiếp xã hội & giải trí", max: 12, val: lifestyle.socialHours },
          { id: "physicalActivityHours", label: "Giờ vận động thể chất", max: 6, val: lifestyle.physicalActivityHours },
          { id: "extracurricularHours", label: "Giờ hoạt động ngoại khóa", max: 8, val: lifestyle.extracurricularHours, full: true },
        ].map((slider) => (
          <div key={slider.id} className={slider.full ? "md:col-span-2" : ""}>
            <div className="flex w-full items-center justify-between mb-2">
              <label htmlFor={`lifestyle-${slider.id}`} className="text-sm font-semibold text-theme-ink">
                {slider.label}
              </label>
              <span className="text-xs font-extrabold text-theme-ink bg-theme-brand-soft px-2.5 py-0.5 rounded-full">
                {slider.val} giờ
              </span>
            </div>
            <input
              id={`lifestyle-${slider.id}`}
              type="range"
              min="0"
              max={slider.max}
              step="0.5"
              value={slider.val}
              onChange={(e) => handleChange(slider.id, Number(e.target.value))}
              className="w-full h-2 bg-theme-line rounded-full appearance-none cursor-pointer accent-theme-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            />
          </div>
        ))}
      </div>
    </section>
  );
};
