import React, { useState } from "react";
import { X, Clock, Flame, ChefHat, Check, ChevronLeft, ChevronRight, Award, Salad, BarChart3 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

export default function RecipeDetailModal({ recipe, onClose }) {
  const [activeTab, setActiveTab] = useState("ingredients"); // "ingredients" | "steps" | "nutrition"
  const [checkedIngredients, setCheckedIngredients] = useState({});
  const [cookMode, setCookMode] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const { title, description, ingredients, steps, nutritionInfo, tags, imageUrl } = recipe;

  const prepTime = nutritionInfo?.prepTime || "20 phút";
  const difficulty = nutritionInfo?.difficulty || "Dễ";
  const calories = nutritionInfo?.calories || 0;

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== "steps") setCookMode(false);
  };

  // Checkbox toggle
  const toggleIngredient = (idx) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  // Parsing nutrient grams
  const parseGrams = (str) => {
    if (!str) return 0;
    return parseInt(str.replace(/[^0-9]/g, "")) || 0;
  };

  const pVal = parseGrams(nutritionInfo?.protein);
  const cVal = parseGrams(nutritionInfo?.carbs);
  const fVal = parseGrams(nutritionInfo?.fat);

  const chartData = [
    { name: "Đạm (Protein)", value: pVal, color: "#f87171" },
    { name: "Đường bột (Carbs)", value: cVal, color: "#fbbf24" },
    { name: "Chất béo (Fat)", value: fVal, color: "#34d399" }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 overflow-hidden">
      <div className="bg-white w-full max-w-2xl h-[92vh] sm:h-[85vh] sm:max-h-[750px] rounded-t-[32px] sm:rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        {/* Header Image/Banner */}
        <div className="relative h-48 w-full bg-amber-50 flex-shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-amber-100 to-orange-100">
              <ChefHat className="w-12 h-12 text-amber-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end p-6">
            <div>
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm">
                  ⭐ {difficulty}
                </span>
                {tags && tags.slice(0, 2).map((tag, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/80 text-white backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight drop-shadow-sm">{title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 p-1 flex-shrink-0">
          <button
            onClick={() => handleTabChange("ingredients")}
            className={`flex-1 py-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "ingredients" ? "bg-white text-amber-500 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Salad className="w-4 h-4" />
            Nguyên liệu
          </button>
          <button
            onClick={() => handleTabChange("steps")}
            className={`flex-1 py-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "steps" ? "bg-white text-amber-500 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <ChefHat className="w-4 h-4" />
            Các bước
          </button>
          <button
            onClick={() => handleTabChange("nutrition")}
            className={`flex-1 py-3 text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "nutrition" ? "bg-white text-amber-500 shadow-sm" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dinh dưỡng
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-grow overflow-y-auto p-6">
          
          {/* TAB 1: INGREDIENTS */}
          {activeTab === "ingredients" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className="text-xs text-gray-500 font-medium">Đánh dấu những nguyên liệu bạn đã chuẩn bị sẵn sàng:</p>
              <div className="space-y-2">
                {ingredients && ingredients.map((item, idx) => (
                  <label
                    key={idx}
                    onClick={() => toggleIngredient(idx)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer select-none transition-all duration-200 ${
                      checkedIngredients[idx]
                        ? "bg-amber-50/50 border-amber-200 text-gray-400"
                        : "bg-white border-gray-100 hover:border-gray-200 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center transition-colors ${
                        checkedIngredients[idx] ? "bg-amber-400 border-amber-400 text-white" : "border-gray-300"
                      }`}>
                        {checkedIngredients[idx] && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <span className={`text-sm font-semibold ${checkedIngredients[idx] ? "line-through" : ""}`}>
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-400">
                      {item.amount} {item.unit}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: STEPS */}
          {activeTab === "steps" && (
            <div className="h-full flex flex-col justify-between animate-in fade-in duration-200">
              {!cookMode ? (
                <div className="space-y-4 pb-6">
                  <div className="space-y-3">
                    {steps && steps.map((step, idx) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 items-start">
                        <span className="w-6 h-6 rounded-full bg-amber-400 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                          {step.stepNumber}
                        </span>
                        <div className="flex-grow">
                          <p className="text-sm font-medium text-gray-800 leading-relaxed">{step.instruction}</p>
                          {step.duration && (
                            <span className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100">
                              <Clock className="w-3 h-3" />
                              {step.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setCookMode(true);
                      setCurrentStepIdx(0);
                    }}
                    className="w-full py-3.5 bg-amber-400 hover:bg-amber-500 text-white font-black rounded-2xl text-sm transition-colors shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2"
                  >
                    <ChefHat className="w-5 h-5" />
                    Bắt đầu nấu ăn từng bước
                  </button>
                </div>
              ) : (
                /* Step by step interactive wizard */
                <div className="flex flex-col justify-between h-full min-h-[300px] py-4">
                  <div className="text-center">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">
                      Bước {currentStepIdx + 1} / {steps.length}
                    </span>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full transition-all duration-300"
                        style={{ width: `${((currentStepIdx + 1) / steps.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="my-8 p-6 bg-amber-50/30 rounded-3xl border border-amber-100/50 text-center flex flex-col items-center justify-center min-h-[160px] animate-in zoom-in-95 duration-200">
                    <p className="text-base sm:text-lg font-bold text-gray-800 leading-relaxed max-w-md">
                      {steps[currentStepIdx].instruction}
                    </p>
                    {steps[currentStepIdx].duration && (
                      <span className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-amber-600 bg-amber-100/50 border border-amber-200/50 px-3 py-1 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        {steps[currentStepIdx].duration}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      disabled={currentStepIdx === 0}
                      onClick={() => setCurrentStepIdx(prev => prev - 1)}
                      className={`flex-1 py-3.5 rounded-2xl border font-bold text-sm flex items-center justify-center gap-1 transition-all ${
                        currentStepIdx === 0
                          ? "border-gray-100 text-gray-300 cursor-not-allowed"
                          : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Trước đó
                    </button>
                    {currentStepIdx < steps.length - 1 ? (
                      <button
                        onClick={() => setCurrentStepIdx(prev => prev + 1)}
                        className="flex-1 py-3.5 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-1 transition-colors"
                      >
                        Tiếp theo
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setCookMode(false)}
                        className="flex-1 py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Award className="w-4 h-4" />
                        Hoàn tất món ăn
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NUTRITION */}
          {activeTab === "nutrition" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Calorie Stats Card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 border border-amber-100 rounded-3xl p-6 text-center">
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Hàm lượng Calorie</span>
                <h3 className="text-4xl sm:text-5xl font-black text-gray-900 mt-2 flex items-center justify-center gap-1">
                  {calories}
                  <span className="text-lg font-bold text-gray-400 uppercase">kcal</span>
                </h3>
                <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
                  Thời lượng chuẩn bị nhanh khoảng {prepTime}, cung cấp đầy đủ chất dinh dưỡng bền vững.
                </p>
              </div>

              {/* Recharts Bar Chart */}
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-3">Tỷ lệ các chất đa lượng</h4>
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#6b7280", fontSize: 11, fontWeight: "600" }}
                        width={120}
                      />
                      <Tooltip
                        cursor={{ fill: "transparent" }}
                        formatter={(value) => [`${value}g`, "Lượng chất"]}
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

              {/* Specific breakdown details */}
              <div className="grid grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="text-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Protein</span>
                  <p className="text-base font-black text-red-500 mt-0.5">{nutritionInfo?.protein || "0g"}</p>
                </div>
                <div className="text-center border-l border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Carbohydrates</span>
                  <p className="text-base font-black text-amber-500 mt-0.5">{nutritionInfo?.carbs || "0g"}</p>
                </div>
                <div className="text-center border-l border-gray-200">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Fats</span>
                  <p className="text-base font-black text-emerald-500 mt-0.5">{nutritionInfo?.fat || "0g"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
