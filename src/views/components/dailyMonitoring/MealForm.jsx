import React from "react";
import { Check, Utensils, X } from "lucide-react";

const MEALS = [
  { key: "breakfast", label: "Bữa sáng" },
  { key: "lunch", label: "Bữa trưa" },
  { key: "dinner", label: "Bữa tối" },
];

export const MealForm = ({ meals, setMeals }) => {
  return (
    <section className="bg-theme-surface rounded-3xl border border-theme-line p-6 shadow-sm space-y-5">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
          <Utensils className="w-5 h-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-theme-ink">Nhật ký bữa ăn</h2>
          <p className="text-xs text-theme-muted font-medium">Theo dõi nhịp ăn uống đều đặn trong ngày</p>
        </div>
      </div>

      <div className="space-y-3">
        {MEALS.map((meal) => {
          const hadMeal = Boolean(meals[meal.key]);
          return (
            <div
              key={meal.key}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-theme-line bg-theme-page/60 px-4 py-3"
            >
              <p className="text-sm font-bold text-theme-ink">{meal.label}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMeals({ ...meals, [meal.key]: true })}
                  aria-pressed={hadMeal}
                  className={`inline-flex min-h-[44px] items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-2xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                    hadMeal
                      ? "bg-status-ok text-white border-status-ok"
                      : "bg-theme-surface text-theme-ink border-theme-line hover:bg-theme-brand-soft"
                  }`}
                >
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Đã ăn</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMeals({ ...meals, [meal.key]: false })}
                  aria-pressed={!hadMeal}
                  className={`inline-flex min-h-[44px] items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-2xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                    !hadMeal
                      ? "bg-status-warn-bg text-status-warn-text border-status-warn-line"
                      : "bg-theme-surface text-theme-ink border-theme-line hover:bg-theme-brand-soft"
                  }`}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                  <span>Chưa ăn</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
