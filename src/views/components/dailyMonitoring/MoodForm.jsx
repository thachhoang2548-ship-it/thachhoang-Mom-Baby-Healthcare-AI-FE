import React from "react";
import { CloudRain, Frown, Heart, Meh, Smile, Sun } from "lucide-react";

const MOOD_LEVELS = [
  { score: 1, label: "Mệt mỏi", icon: <CloudRain className="w-4 h-4 shrink-0" aria-hidden="true" /> },
  { score: 2, label: "Lo lắng", icon: <Frown className="w-4 h-4 shrink-0" aria-hidden="true" /> },
  { score: 3, label: "Bình thường", icon: <Meh className="w-4 h-4 shrink-0" aria-hidden="true" /> },
  { score: 4, label: "Thoải mái", icon: <Smile className="w-4 h-4 shrink-0" aria-hidden="true" /> },
  { score: 5, label: "Rạng rỡ", icon: <Sun className="w-4 h-4 shrink-0" aria-hidden="true" /> },
];

export const MoodForm = ({ mood, setMood }) => {
  return (
    <section className="bg-theme-surface rounded-3xl border border-theme-line p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-theme-ink">Theo dõi tâm trạng</h2>
          <p className="text-xs text-theme-muted font-medium">Ghi nhận cảm xúc của mẹ hôm nay</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <span className="text-sm font-semibold text-theme-ink mb-2.5 block">
            Hôm nay mẹ cảm thấy thế nào?
          </span>
          <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="Tâm trạng hôm nay">
            {MOOD_LEVELS.map(({ score, label, icon }) => {
              const selected = mood.score === score;
              return (
                <button
                  key={score}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setMood({ ...mood, score })}
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

        <div className="space-y-1.5">
          <label htmlFor="daily-mood-note" className="block text-xs font-bold text-theme-ink">
            Ghi chú tâm trạng (không bắt buộc)
          </label>
          <textarea
            id="daily-mood-note"
            rows={2}
            value={mood.note}
            onChange={(e) => setMood({ ...mood, note: e.target.value })}
            placeholder="Chia sẻ điều làm mẹ vui hoặc băn khoăn hôm nay..."
            className="w-full rounded-2xl border border-theme-line bg-theme-page/60 px-4 py-3 text-sm font-medium text-theme-ink placeholder:text-theme-muted focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/30"
          />
        </div>
      </div>
    </section>
  );
};
