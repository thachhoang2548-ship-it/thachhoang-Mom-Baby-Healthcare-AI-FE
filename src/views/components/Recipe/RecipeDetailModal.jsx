import React, { useState } from "react";
import {
  X,
  Clock,
  ChefHat,
  Check,
  ChevronLeft,
  ChevronRight,
  Award,
  Salad,
  BarChart3,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { useThemeColors } from "../../../hooks/useThemeColors";

export default function RecipeDetailModal({ recipe, onClose }) {
  const [activeTab, setActiveTab] = useState("ingredients"); // "ingredients" | "steps" | "nutrition"
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [cookMode, setCookMode] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const colors = useThemeColors();

  const { title, ingredients, steps, nutritionInfo, tags, imageUrl } = recipe;

  const prepTime = nutritionInfo?.prepTime || "20 phút";
  const difficulty = nutritionInfo?.difficulty || "Dễ";
  const calories = nutritionInfo?.calories || 0;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== "steps") setCookMode(false);
  };

  const toggleIngredient = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const parseGrams = (value) => {
    if (!value) return 0;
    if (typeof value === "number") return value;
    return parseInt(String(value).replace(/[^0-9]/g, ""), 10) || 0;
  };

  const pVal = parseGrams(nutritionInfo?.protein);
  const cVal = parseGrams(nutritionInfo?.carbs);
  const fVal = parseGrams(nutritionInfo?.fat);

  const chartData = [
    { name: "Chất đạm (Protein)", value: pVal, color: colors.brand },
    { name: "Tinh bột (Carbs)", value: cVal, color: colors.warn },
    { name: "Chất béo (Fat)", value: fVal, color: colors.ok },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-hidden bg-theme-ink/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-theme-line bg-theme-surface font-display text-theme-ink shadow-2xl sm:h-[85vh] sm:max-h-[760px] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="recipe-modal-title"
      >
        {/* Header Banner */}
        <div className="relative shrink-0 border-b border-theme-line bg-theme-sidebar p-6">
          {imageUrl && (
            <div className="mb-4 h-40 w-full overflow-hidden rounded-2xl border border-theme-line">
              <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-theme-line bg-theme-surface px-3 py-1 text-xs font-bold text-theme-ink">
                  Độ khó: {difficulty}
                </span>
                <span className="rounded-full border border-theme-line bg-theme-surface px-3 py-1 text-xs font-bold text-theme-muted">
                  {prepTime}
                </span>
                {tags &&
                  tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-theme-brand-soft px-3 py-1 text-xs font-bold text-theme-ink"
                    >
                      {tag}
                    </span>
                  ))}
              </div>
              <h2
                id="recipe-modal-title"
                className="text-xl font-bold leading-snug text-theme-ink sm:text-2xl"
              >
                {title}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng công thức"
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-full border border-theme-line bg-theme-surface text-theme-ink transition-colors hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div
          className="flex shrink-0 gap-1.5 border-b border-theme-line bg-theme-page/70 p-2"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "ingredients"}
            onClick={() => handleTabChange("ingredients")}
            className={`flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:text-sm ${
              activeTab === "ingredients"
                ? "bg-theme-surface text-theme-brand shadow-sm border border-theme-line"
                : "text-theme-muted hover:text-theme-ink"
            }`}
          >
            <Salad className="h-4 w-4" />
            <span>Nguyên liệu</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "steps"}
            onClick={() => handleTabChange("steps")}
            className={`flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:text-sm ${
              activeTab === "steps"
                ? "bg-theme-surface text-theme-brand shadow-sm border border-theme-line"
                : "text-theme-muted hover:text-theme-ink"
            }`}
          >
            <ChefHat className="h-4 w-4" />
            <span>Các bước nấu</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "nutrition"}
            onClick={() => handleTabChange("nutrition")}
            className={`flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-2xl px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:text-sm ${
              activeTab === "nutrition"
                ? "bg-theme-surface text-theme-brand shadow-sm border border-theme-line"
                : "text-theme-muted hover:text-theme-ink"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Dinh dưỡng</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: INGREDIENTS */}
          {activeTab === "ingredients" && (
            <div className="space-y-4">
              <p className="text-xs font-medium text-theme-muted sm:text-sm">
                Đánh dấu những nguyên liệu mẹ đã chuẩn bị sẵn trên bàn bếp:
              </p>
              <div className="space-y-2">
                {ingredients &&
                  ingredients.map((item, idx) => {
                    const checked = Boolean(checkedIngredients[idx]);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleIngredient(idx)}
                        aria-pressed={checked}
                        className={`flex min-h-[48px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                          checked
                            ? "border-theme-brand/30 bg-theme-brand-soft/50 text-theme-muted"
                            : "border-theme-line bg-theme-page/40 text-theme-ink hover:border-theme-brand/40"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                              checked
                                ? "border-theme-brand bg-theme-brand text-theme-surface"
                                : "border-theme-line bg-theme-surface"
                            }`}
                          >
                            {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </span>
                          <span className={`text-sm font-semibold ${checked ? "line-through" : ""}`}>
                            {item.name}
                          </span>
                        </span>
                        <span className="text-xs font-bold text-theme-muted sm:text-sm">
                          {item.amount} {item.unit}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 2: STEPS */}
          {activeTab === "steps" && (
            <div className="flex h-full flex-col justify-between">
              {!cookMode ? (
                <div className="space-y-5 pb-4">
                  <div className="space-y-3">
                    {steps &&
                      steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3.5 rounded-2xl border border-theme-line bg-theme-page/50 p-4"
                        >
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-theme-brand text-xs font-bold text-theme-surface">
                            {step.stepNumber || idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-medium leading-relaxed text-theme-ink">
                              {step.instruction}
                            </p>
                            {step.duration && (
                              <span className="mt-2 inline-flex items-center gap-1 rounded-full border border-theme-line bg-theme-surface px-2.5 py-0.5 text-xs font-semibold text-theme-muted">
                                <Clock className="h-3 w-3 text-theme-brand" />
                                {step.duration}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                  {steps && steps.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setCookMode(true);
                        setCurrentStepIdx(0);
                      }}
                      className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-theme-brand px-6 py-3 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                    >
                      <ChefHat className="h-5 w-5" />
                      <span>Chế độ nấu từng bước</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex min-h-[280px] flex-col justify-between py-2">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-theme-muted">
                      <span>Chế độ nấu từng bước</span>
                      <span className="text-theme-brand">
                        Bước {currentStepIdx + 1} / {steps.length}
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-theme-line bg-theme-page">
                      <div
                        className="h-full rounded-full bg-theme-brand transition-all duration-300"
                        style={{
                          width: `${((currentStepIdx + 1) / steps.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="my-6 flex min-h-[160px] flex-col items-center justify-center rounded-3xl border border-theme-line bg-theme-page/60 p-6 text-center">
                    <p className="max-w-md text-base font-bold leading-relaxed text-theme-ink sm:text-lg">
                      {steps[currentStepIdx].instruction}
                    </p>
                    {steps[currentStepIdx].duration && (
                      <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-theme-line bg-theme-surface px-3.5 py-1 text-xs font-bold text-theme-ink">
                        <Clock className="h-3.5 w-3.5 text-theme-brand" />
                        {steps[currentStepIdx].duration}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      disabled={currentStepIdx === 0}
                      onClick={() => setCurrentStepIdx((prev) => prev - 1)}
                      className="flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-full border border-theme-line bg-theme-page px-4 py-2.5 text-sm font-bold text-theme-ink transition-colors hover:bg-theme-brand-soft disabled:cursor-not-allowed disabled:text-theme-muted"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Bước trước</span>
                    </button>
                    {currentStepIdx < steps.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStepIdx((prev) => prev + 1)}
                        className="flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-full bg-theme-brand px-4 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink"
                      >
                        <span>Tiếp theo</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCookMode(false)}
                        className="flex min-h-[48px] flex-1 items-center justify-center gap-1.5 rounded-full bg-status-ok px-4 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-status-ok-text"
                      >
                        <Award className="h-4 w-4" />
                        <span>Hoàn tất món ăn</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NUTRITION */}
          {activeTab === "nutrition" && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-theme-line bg-theme-page/60 p-6 text-center">
                <span className="text-xs font-bold text-theme-muted">Năng lượng ước tính mỗi khẩu phần</span>
                <p className="mt-1.5 flex items-baseline justify-center gap-1.5 text-4xl font-bold text-theme-ink">
                  <span>{calories}</span>
                  <span className="text-base font-semibold text-theme-muted">kcal</span>
                </p>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-theme-muted sm:text-sm">
                  Thời gian chuẩn bị khoảng {prepTime}, cân đối nhóm chất thiết yếu cho mẹ.
                </p>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-theme-ink">Tỷ lệ các chất đa lượng</h3>
                <div className="h-44 w-full rounded-2xl border border-theme-line bg-theme-page/40 p-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 5, right: 24, left: 10, bottom: 5 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: colors.ink, fontSize: 12, fontWeight: 600 }}
                        width={130}
                      />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        contentStyle={{
                          borderRadius: "12px",
                          border: `1px solid ${colors.line}`,
                          backgroundColor: colors.surface,
                          color: colors.ink,
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                        formatter={(value) => [`${value}g`, "Hàm lượng"]}
                      />
                      <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={16}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 rounded-2xl border border-theme-line bg-theme-page/50 p-4">
                <div className="text-center">
                  <span className="text-xs font-medium text-theme-muted">Chất đạm</span>
                  <p className="mt-1 text-base font-bold text-theme-brand">
                    {nutritionInfo?.protein || "0g"}
                  </p>
                </div>
                <div className="border-l border-theme-line text-center">
                  <span className="text-xs font-medium text-theme-muted">Tinh bột</span>
                  <p className="mt-1 text-base font-bold text-status-warn-text">
                    {nutritionInfo?.carbs || "0g"}
                  </p>
                </div>
                <div className="border-l border-theme-line text-center">
                  <span className="text-xs font-medium text-theme-muted">Chất béo</span>
                  <p className="mt-1 text-base font-bold text-status-ok">
                    {nutritionInfo?.fat || "0g"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
