import React from "react";
import { CloudMoon, Frown, Meh, Moon, Smile, Sparkles } from "lucide-react";

const QUALITY_LEVELS = [
  { value: 1, label: "Khó ngủ", icon: <Frown className="w-4 h-4 shrink-0" aria-hidden="true" /> },
  { value: 2, label: "Chập chờn", icon: <Meh className="w-4 h-4 shrink-0" aria-hidden="true" /> },
  { value: 3, label: "Tạm ổn", icon: <CloudMoon className="w-4 h-4 shrink-0" aria-hidden="true" /> },
  { value: 4, label: "Ngủ ngon", icon: <Smile className="w-4 h-4 shrink-0" aria-hidden="true" /> },
  { value: 5, label: "Rất sâu", icon: <Sparkles className="w-4 h-4 shrink-0" aria-hidden="true" /> },
];

export const SleepForm = ({ sleep, setSleep }) => {
  return (
    <section className="bg-theme-surface rounded-3xl border border-theme-line p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
          <Moon className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-theme-ink">Nhật ký giấc ngủ</h2>
          <p className="text-xs text-theme-muted font-medium">Thời lượng và cảm nhận khi thức dậy</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex w-full items-center justify-between mb-2">
            <label htmlFor="sleep-hours-range" className="text-sm font-semibold text-theme-ink">
              Đêm qua mẹ ngủ bao nhiêu tiếng?
            </label>
            <span className="inline-flex rounded-full bg-theme-brand-soft px-3 py-0.5 text-xs font-extrabold text-theme-ink">
              {sleep.hours || 0} giờ
            </span>
          </div>

          <input
            id="sleep-hours-range"
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={sleep.hours}
            onChange={(e) => setSleep({ ...sleep, hours: Number(e.target.value) })}
            className="w-full h-2 bg-theme-line rounded-full appearance-none cursor-pointer accent-theme-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          />
          <div className="flex justify-between text-xs text-theme-muted font-medium mt-1">
            <span>0 giờ</span>
            <span>6 giờ</span>
            <span>12 giờ</span>
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold text-theme-ink mb-2.5 block">
            Chất lượng giấc ngủ thế nào?
          </span>
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Chất lượng giấc ngủ">
            {QUALITY_LEVELS.map(({ value, label, icon }) => {
              const selected = sleep.quality === value;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setSleep({ ...sleep, quality: value })}
                  className={`flex flex-col items-center justify-center gap-1 min-h-[60px] rounded-2xl border px-1.5 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                    selected
                      ? "bg-theme-brand text-theme-surface border-theme-brand shadow-sm"
                      : "bg-theme-page text-theme-ink border-theme-line hover:bg-theme-brand-soft"
                  }`}
                >
                  {icon}
                  <span className="text-center leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
