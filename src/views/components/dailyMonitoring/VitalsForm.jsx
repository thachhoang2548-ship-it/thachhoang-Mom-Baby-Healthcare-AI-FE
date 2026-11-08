import React from "react";
import { Activity } from "lucide-react";

export const VitalsForm = ({ vitals, setVitals }) => {
  return (
    <section className="bg-theme-surface rounded-3xl border border-theme-line p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-theme-ink">Chỉ số cơ thể</h2>
          <p className="text-xs text-theme-muted font-medium">Đường huyết, huyết áp và cân nặng hiện tại</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="vital-sugar" className="block text-xs font-bold text-theme-ink">
            Đường huyết
          </label>
          <div className="relative">
            <input
              id="vital-sugar"
              type="number"
              value={vitals.sugar}
              onChange={(e) => setVitals({ ...vitals, sugar: e.target.value })}
              className="w-full min-h-[48px] pl-3.5 pr-14 py-2.5 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-bold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/30"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-theme-muted pointer-events-none">
              mg/dL
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="vital-bp" className="block text-xs font-bold text-theme-ink">
            Huyết áp
          </label>
          <div className="relative">
            <input
              id="vital-bp"
              type="text"
              value={vitals.bp}
              onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
              placeholder="120/80"
              className="w-full min-h-[48px] pl-3.5 pr-14 py-2.5 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-bold text-theme-ink placeholder:text-theme-muted focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/30"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-theme-muted pointer-events-none">
              mmHg
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="vital-weight" className="block text-xs font-bold text-theme-ink">
            Cân nặng
          </label>
          <div className="relative">
            <input
              id="vital-weight"
              type="number"
              step="0.1"
              value={vitals.weight}
              onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
              className="w-full min-h-[48px] pl-3.5 pr-10 py-2.5 rounded-2xl border border-theme-line bg-theme-page/60 text-sm font-bold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/30"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-theme-muted pointer-events-none">
              kg
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
