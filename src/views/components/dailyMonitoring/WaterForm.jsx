import React from "react";
import { Droplets, Minus, Plus } from "lucide-react";

export const WaterForm = ({ water, setWater }) => {
  const cups = Number(water.liters) || 0;
  const pct = Math.min(100, Math.round(cups * 10));

  return (
    <section className="bg-theme-surface rounded-3xl border border-theme-line p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
          <Droplets className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-theme-ink">Lượng nước uống</h2>
          <p className="text-xs text-theme-muted font-medium">Mục tiêu gợi ý khoảng 8–10 cốc mỗi ngày</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-3">
          <p className="text-sm font-semibold text-theme-ink">
            Hôm nay mẹ đã uống bao nhiêu cốc nước?
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setWater({ liters: Math.max(0, cups - 1) })}
              className="w-11 h-11 flex items-center justify-center rounded-2xl border border-theme-line bg-theme-page text-theme-ink hover:bg-theme-brand-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
              aria-label="Giảm 1 cốc nước"
            >
              <Minus className="w-4 h-4" aria-hidden="true" />
            </button>
            <span className="text-2xl font-extrabold min-w-[3.5rem] text-center text-theme-ink">
              {cups}
            </span>
            <button
              type="button"
              onClick={() => setWater({ liters: cups + 1 })}
              className="w-11 h-11 flex items-center justify-center rounded-2xl bg-theme-brand text-theme-surface hover:bg-theme-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
              aria-label="Tăng 1 cốc nước"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="w-24 rounded-2xl border border-theme-line bg-theme-page p-3 text-center space-y-1.5 shrink-0">
          <div className="w-full h-14 rounded-md bg-theme-surface border border-theme-line overflow-hidden flex items-end">
            <div
              className="w-full bg-theme-brand transition-all duration-300 motion-reduce:transition-none"
              style={{ height: `${pct}%` }}
            />
          </div>
          <p className="text-xs font-extrabold text-theme-ink">{pct}%</p>
        </div>
      </div>
    </section>
  );
};
