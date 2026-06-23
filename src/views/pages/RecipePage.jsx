import React, { useEffect, useState } from "react";
import { useRecipeController } from "../../controllers/recipeController";
import ProfileBadge from "../components/recipe/ProfileBadge";
import RecipeCard from "../components/recipe/RecipeCard";
import RecipeDetailModal from "../components/recipe/RecipeDetailModal";
import { SlidersHorizontal, Plus, X, ChefHat, Sparkles, AlertCircle, RefreshCw } from "lucide-react";

export default function RecipePage() {
  const {
    recipes,
    currentProfile,
    isGenerating,
    isFetching,
    error,
    preferences,
    setPreferences,
    fetchCurrentProfile,
    generateRecipes,
    fetchMyRecipes,
    toggleSave
  } = useRecipeController();

  const [showPreferences, setShowPreferences] = useState(true);
  const [ingredientInput, setIngredientInput] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filterType, setFilterType] = useState("all"); // "all" | "saved"

  useEffect(() => {
    fetchCurrentProfile();
    fetchMyRecipes();
  }, []);

  // Sync collapsible form state: close it automatically if we have recipes loaded
  useEffect(() => {
    if (recipes.length > 0 && !isGenerating) {
      setShowPreferences(false);
    }
  }, [recipes]);

  // Handle adding available ingredient tag
  const handleAddIngredient = (e) => {
    e.preventDefault();
    const cleanVal = ingredientInput.trim().toLowerCase();
    if (cleanVal && !preferences.availableIngredients.includes(cleanVal)) {
      setPreferences({
        availableIngredients: [...preferences.availableIngredients, cleanVal]
      });
      setIngredientInput("");
    }
  };

  // Handle removing available ingredient tag
  const handleRemoveIngredient = (idxToRemove) => {
    setPreferences({
      availableIngredients: preferences.availableIngredients.filter((_, idx) => idx !== idxToRemove)
    });
  };

  // Handle submit generation
  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      await generateRecipes(preferences);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter recipes (cached vs bookmarked)
  const displayedRecipes = filterType === "saved" 
    ? recipes.filter(r => r.isSaved) 
    : recipes;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <ChefHat className="w-7 h-7 text-amber-500" />
              Công thức nấu ăn cho bạn
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Đề xuất công thực phẩm phù hợp nhất với trạng thái thể chất và tinh thần của bạn
            </p>
          </div>

          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className={`p-2.5 rounded-full border transition-all ${
              showPreferences 
                ? "bg-amber-400 border-amber-400 text-white shadow-md shadow-amber-400/20" 
                : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
            title="Điều chỉnh tùy chọn"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </header>

        {/* Profile Classification Alert / Badge */}
        {currentProfile && (
          <ProfileBadge profile={currentProfile} />
        )}

        {/* Collapsible Preferences Form */}
        {showPreferences && (
          <form 
            onSubmit={handleGenerate} 
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-5 animate-in slide-in-from-top-4 duration-200"
          >
            <div className="flex items-center gap-2 pb-1 border-b border-gray-50">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-100" />
              <h2 className="font-bold text-sm text-gray-800">Tùy chỉnh đề xuất thực đơn</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Diet Type Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500">Chế độ ăn của bạn</label>
                <select
                  value={preferences.dietType}
                  onChange={(e) => setPreferences({ dietType: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                >
                  <option value="Thường">Thường (Đầy đủ dưỡng chất từ thịt, cá)</option>
                  <option value="Chay">Ăn chay (Rau củ, trứng, sữa)</option>
                  <option value="Thuần chay">Ăn thuần chay (100% thực vật)</option>
                  <option value="Ít carb">Ít tinh bột (Low-carb / Keto)</option>
                </select>
              </div>

              {/* Cook Time Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-gray-500">
                  <label>Thời gian nấu tối đa</label>
                  <span className="text-amber-500">{preferences.maxCookTime} phút</span>
                </div>
                <div className="pt-2 px-1">
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={preferences.maxCookTime}
                    onChange={(e) => setPreferences({ maxCookTime: parseInt(e.target.value) })}
                    className="w-full accent-amber-400"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                    <span>10 phút</span>
                    <span>35 phút</span>
                    <span>60 phút</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Allergies Text Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Thành phần dị ứng / Cần tránh</label>
              <input
                type="text"
                placeholder="Ví dụ: Đậu phộng, hải sản, tôm..."
                value={preferences.allergies}
                onChange={(e) => setPreferences({ allergies: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
            </div>

            {/* Pantry Tag Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500">Nguyên liệu đang có sẵn ở nhà (Tùy chọn)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ví dụ: Trứng, hành tây, ức gà..."
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddIngredient(e)}
                  className="flex-grow px-4 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <button
                  type="button"
                  onClick={handleAddIngredient}
                  className="px-4 py-3 rounded-2xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Thêm
                </button>
              </div>

              {/* Ingredient Tags Display */}
              {preferences.availableIngredients.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {preferences.availableIngredients.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200/50 flex items-center gap-1.5 animate-in zoom-in-95 duration-100"
                    >
                      {tag}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveIngredient(idx)}
                        className="p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-4 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-100 text-white disabled:text-gray-400 font-extrabold rounded-2xl text-sm transition-colors shadow-lg shadow-amber-400/10 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Đang phân tích & tạo món ăn...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Tạo công thức phù hợp với tôi ngay
                </>
              )}
            </button>

          </form>
        )}

        {/* Filters and Recipes Grid Header */}
        <div className="flex justify-between items-center pt-2">
          <h2 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider">
            {filterType === "saved" ? "Sổ tay món ăn đã lưu" : "Gợi ý dành cho bạn"}
          </h2>
          <div className="bg-gray-100 rounded-full p-1 flex border border-gray-200/30">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterType === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType("saved")}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterType === "saved" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Đã lưu ({recipes.filter(r => r.isSaved).length})
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
            <div>
              <p className="text-sm font-bold">Không thể tải đề xuất</p>
              <p className="text-xs text-red-700 mt-0.5">{error}</p>
              <button 
                onClick={() => {
                  fetchCurrentProfile();
                  fetchMyRecipes();
                }}
                className="mt-2 text-xs font-black underline hover:text-red-900 block"
              >
                Thử tải lại dữ liệu
              </button>
            </div>
          </div>
        )}

        {/* Main List Grid / Empty States */}
        {isGenerating ? (
          /* Shimmer skeletons */
          <div className="space-y-4">
            <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-4 text-center animate-pulse">
              <p className="text-xs font-bold text-amber-700 flex items-center justify-center gap-1.5">
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                🤖 Đang kết nối trí tuệ nhân tạo để thiết kế thực đơn sinh viên...
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm h-[320px] animate-pulse space-y-4">
                  <div className="bg-gray-100 w-full h-40 rounded-2xl"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-100 h-4 w-2/3 rounded-md"></div>
                    <div className="bg-gray-100 h-3 w-full rounded-md"></div>
                    <div className="bg-gray-100 h-3 w-5/6 rounded-md"></div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="bg-gray-100 h-10 w-full rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : displayedRecipes.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-3xl select-none shadow-inner">
              🍳
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-gray-800 text-base">Chưa có công thức nào được tạo</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                {filterType === "saved" 
                  ? "Bạn chưa có món ăn nào trong sổ tay lưu trữ. Hãy xem công thức và nhấn nút trái tim để lưu lại!"
                  : "Vui lòng thiết lập các tùy chọn ăn uống ở trên và nhấn nút Tạo công thức để bắt đầu."}
              </p>
            </div>
            {filterType !== "saved" && (
              <button
                type="button"
                onClick={() => {
                  setShowPreferences(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-6 py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-bold text-xs rounded-full shadow-sm hover:shadow"
              >
                Nhập thông tin ngay
              </button>
            )}
          </div>
        ) : (
          /* Recipes Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {displayedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onSave={toggleSave}
                onView={setSelectedRecipe}
              />
            ))}
          </div>
        )}

      </div>

      {/* Detail Modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}
