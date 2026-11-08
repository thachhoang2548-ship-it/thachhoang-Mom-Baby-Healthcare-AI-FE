import React, { useEffect, useState } from "react";
import { useRecipeController } from "../../controllers/recipeController";
import ProfileBadge from "../components/Recipe/ProfileBadge";
import RecipeCard from "../components/Recipe/RecipeCard";
import RecipeDetailModal from "../components/Recipe/RecipeDetailModal";
import ScientificEvidenceFooter from "../components/common/ScientificEvidenceFooter";
import {
  SlidersHorizontal,
  Plus,
  X,
  ChefHat,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function RecipePage() {
  const {
    recipes,
    currentProfile,
    isGenerating,
    error,
    preferences,
    setPreferences,
    fetchCurrentProfile,
    generateRecipes,
    fetchMyRecipes,
    toggleSave,
  } = useRecipeController();

  const [prefsOverride, setPrefsOverride] = useState(null);
  const [ingredientInput, setIngredientInput] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [filterType, setFilterType] = useState("all"); // "all" | "saved"

  useEffect(() => {
    fetchCurrentProfile();
    fetchMyRecipes();
  }, [fetchCurrentProfile, fetchMyRecipes]);

  const showPreferences =
    prefsOverride !== null ? prefsOverride : recipes.length === 0 || isGenerating;
  const setShowPreferences = (val) => setPrefsOverride(val);

  const handleAddIngredient = (e) => {
    e.preventDefault();
    const cleanVal = ingredientInput.trim().toLowerCase();
    if (cleanVal && !preferences.availableIngredients.includes(cleanVal)) {
      setPreferences({
        availableIngredients: [...preferences.availableIngredients, cleanVal],
      });
      setIngredientInput("");
    }
  };

  const handleRemoveIngredient = (idxToRemove) => {
    setPreferences({
      availableIngredients: preferences.availableIngredients.filter(
        (_, idx) => idx !== idxToRemove
      ),
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();

    // Người dùng thường gõ nguyên liệu rồi bấm Gửi luôn mà quên nhấn Enter để tạo tag.
    // Gộp phần đang gõ dở vào danh sách để nguyên liệu luôn được gửi lên AI.
    const pending = ingredientInput.trim().toLowerCase();
    const mergedIngredients =
      pending && !preferences.availableIngredients.includes(pending)
        ? [...preferences.availableIngredients, pending]
        : preferences.availableIngredients;

    if (pending) {
      setPreferences({ availableIngredients: mergedIngredients });
      setIngredientInput("");
    }

    try {
      await generateRecipes({ ...preferences, availableIngredients: mergedIngredients });
      setPrefsOverride(false);
    } catch (err) {
      console.error(err);
    }
  };

  const rejectedRecipes = recipes.filter(
    (r) =>
      r.status === "Rejected" ||
      r.Status === "Rejected" ||
      r.status === 2 ||
      r.Status === 2
  );

  const recommendedRecipes = recipes.filter(
    (r) =>
      r.status !== "Rejected" &&
      r.Status !== "Rejected" &&
      r.status !== 2 &&
      r.Status !== 2
  );

  const displayedRecipes =
    filterType === "saved" ? recipes.filter((r) => r.isSaved) : recommendedRecipes;

  return (
    <div className="space-y-6 pb-8 font-display text-theme-ink">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 border-b border-theme-line pb-5 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-brand-soft px-3.5 py-1 text-xs font-semibold text-theme-ink">
            <ChefHat className="h-3.5 w-3.5 text-theme-brand" />
            Sổ tay bếp mẹ
          </span>
          <h1 className="mt-2 text-2xl font-bold text-theme-ink sm:text-3xl">
            Thực đơn AI dành cho mẹ
          </h1>
          <p className="mt-1 text-sm text-theme-muted">
            Gợi ý công thức món ăn cân bằng dưỡng chất theo thể trạng, khẩu vị và nguyên liệu sẵn có trong bếp.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowPreferences(!showPreferences)}
          aria-expanded={showPreferences}
          className={`inline-flex min-h-[44px] items-center gap-2 self-start rounded-full border px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:self-center ${
            showPreferences
              ? "border-theme-brand bg-theme-brand-soft text-theme-ink"
              : "border-theme-line bg-theme-surface text-theme-ink hover:border-theme-brand/40"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4 text-theme-brand" />
          <span>{showPreferences ? "Ẩn tùy chỉnh" : "Tùy chỉnh món ăn"}</span>
        </button>
      </header>

      {/* Profile Classification Badge */}
      {currentProfile && <ProfileBadge profile={currentProfile} />}

      {/* Collapsible Preferences Form */}
      {showPreferences && (
        <form
          onSubmit={handleGenerate}
          className="space-y-5 rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm sm:p-7"
        >
          <div className="flex items-center gap-2 border-b border-theme-line pb-3.5">
            <Sparkles className="h-5 w-5 text-theme-brand" />
            <h2 className="text-lg font-bold text-theme-ink">Tùy chỉnh đề xuất thực đơn</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="recipe-diet-type" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                Chế độ ăn của mẹ
              </label>
              <select
                id="recipe-diet-type"
                value={preferences.dietType}
                onChange={(e) => setPreferences({ dietType: e.target.value })}
                className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
              >
                <option value="Thường">Thường (đầy đủ dưỡng chất từ thịt, cá)</option>
                <option value="Chay">Ăn chay (rau củ, trứng, sữa)</option>
                <option value="Thuần chay">Ăn thuần chay (100% thực vật)</option>
                <option value="Ít carb">Ít tinh bột (kiểm soát đường huyết)</option>
              </select>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-sm font-semibold">
                <label htmlFor="recipe-cook-time" className="text-theme-ink">
                  Thời gian nấu tối đa
                </label>
                <span className="font-bold text-theme-brand">{preferences.maxCookTime} phút</span>
              </div>
              <div className="pt-2">
                <input
                  id="recipe-cook-time"
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={preferences.maxCookTime}
                  onChange={(e) =>
                    setPreferences({ maxCookTime: parseInt(e.target.value, 10) })
                  }
                  className="w-full accent-theme-brand"
                />
                <div className="mt-1 flex justify-between text-xs font-medium text-theme-muted">
                  <span>10 phút</span>
                  <span>35 phút</span>
                  <span>60 phút</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="recipe-allergies" className="mb-1.5 block text-sm font-semibold text-theme-ink">
              Thành phần dị ứng hoặc muốn tránh
            </label>
            <input
              id="recipe-allergies"
              type="text"
              placeholder="Ví dụ: Đậu phộng, hải sản có vỏ, mướp đắng..."
              value={preferences.allergies}
              onChange={(e) => setPreferences({ allergies: e.target.value })}
              className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-medium text-theme-ink placeholder:text-theme-muted/70 focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
            />
          </div>

          <div>
            <label htmlFor="recipe-pantry" className="mb-1.5 block text-sm font-semibold text-theme-ink">
              Nguyên liệu đang có sẵn ở nhà (tùy chọn)
            </label>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <input
                id="recipe-pantry"
                type="text"
                placeholder="Ví dụ: Trứng gà, bông cải xanh, cá hồi..."
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddIngredient(e);
                  }
                }}
                className="min-h-[48px] flex-1 rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-medium text-theme-ink placeholder:text-theme-muted/70 focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-theme-line bg-theme-page px-5 py-2.5 text-sm font-bold text-theme-ink transition-colors hover:border-theme-brand/40 hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
              >
                <Plus className="h-4 w-4 text-theme-brand" />
                <span>Thêm nguyên liệu</span>
              </button>
            </div>

            {preferences.availableIngredients.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-3">
                {preferences.availableIngredients.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-full border border-theme-line bg-theme-page px-3.5 py-1.5 text-xs font-bold text-theme-ink"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      aria-label={`Bỏ ${tag}`}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-theme-muted hover:bg-theme-brand-soft hover:text-theme-ink"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-theme-brand px-6 py-3 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-theme-line disabled:text-theme-muted sm:text-base"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Đang thiết kế thực đơn phù hợp...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Gợi ý công thức phù hợp cho mẹ</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Filters and Recipes Grid Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <h2 className="text-lg font-bold text-theme-ink sm:text-xl">
          {filterType === "saved" ? "Sổ tay món ăn đã lưu" : "Công thức gợi ý cho mẹ"}
        </h2>
        <div className="inline-flex rounded-full border border-theme-line bg-theme-surface p-1">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`min-h-[38px] rounded-full px-4 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:text-sm ${
              filterType === "all"
                ? "bg-theme-brand text-theme-surface"
                : "text-theme-muted hover:text-theme-ink"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setFilterType("saved")}
            className={`min-h-[38px] rounded-full px-4 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:text-sm ${
              filterType === "saved"
                ? "bg-theme-brand text-theme-surface"
                : "text-theme-muted hover:text-theme-ink"
            }`}
          >
            Đã lưu ({recipes.filter((r) => r.isSaved).length})
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-status-danger-line bg-status-danger-bg p-4 text-status-danger-text">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-status-danger-text" />
          <div>
            <p className="text-sm font-bold">Không thể tải đề xuất thực đơn</p>
            <p className="mt-0.5 text-xs font-medium text-status-danger-text">{error}</p>
            <button
              type="button"
              onClick={() => {
                fetchCurrentProfile();
                fetchMyRecipes();
              }}
              className="mt-2 inline-flex min-h-[36px] items-center text-xs font-bold text-status-danger-text underline hover:text-status-danger-text"
            >
              Thử tải lại dữ liệu
            </button>
          </div>
        </div>
      )}

      {/* Main List Grid / Empty States */}
      {isGenerating ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-theme-line bg-theme-surface p-4 text-center">
            <p className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-theme-ink">
              <RefreshCw className="h-4 w-4 animate-spin text-theme-brand" />
              <span>Hệ thống đang tổng hợp công thức dinh dưỡng phù hợp cho mẹ...</span>
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {[1, 2].map((idx) => (
              <div
                key={idx}
                className="h-[340px] space-y-4 rounded-3xl border border-theme-line bg-theme-surface p-5 shadow-sm"
              >
                <div className="h-40 w-full rounded-2xl bg-theme-page" />
                <div className="space-y-2.5">
                  <div className="h-4 w-2/3 rounded-md bg-theme-page" />
                  <div className="h-3.5 w-full rounded-md bg-theme-page" />
                  <div className="h-3.5 w-4/5 rounded-md bg-theme-page" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : displayedRecipes.length === 0 ? (
        <div className="space-y-4 rounded-3xl border border-theme-line bg-theme-surface p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-theme-brand-soft text-theme-brand">
            <ChefHat className="h-7 w-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-theme-ink">
              {filterType === "saved"
                ? "Chưa có món ăn nào trong sổ tay"
                : "Chưa có công thức nào được tạo"}
            </h3>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-theme-muted">
              {filterType === "saved"
                ? "Khi xem danh sách gợi ý, mẹ hãy bấm biểu tượng đánh dấu ở góc trên thẻ món ăn để lưu lại công thức yêu thích."
                : "Mẹ hãy chọn chế độ ăn, nguyên liệu sẵn có bên trên và bấm Gợi ý công thức để bắt đầu."}
            </p>
          </div>
          {filterType !== "saved" && !showPreferences && (
            <button
              type="button"
              onClick={() => {
                setShowPreferences(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-theme-brand px-6 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink"
            >
              Mở khung tùy chỉnh
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

      {/* Rejected Recipes Section */}
      {!isGenerating && filterType !== "saved" && rejectedRecipes.length > 0 && (
        <section className="mt-8 space-y-4 border-t border-theme-line pt-8">
          <div className="flex items-center gap-2 text-status-danger-text">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <h2 className="text-lg font-bold">
              Món ăn chuyên gia khuyến nghị không dùng ({rejectedRecipes.length})
            </h2>
          </div>
          <p className="text-sm text-theme-muted">
            Các công thức dưới đây chưa phù hợp với thể trạng hiện tại của mẹ theo đánh giá của chuyên gia dinh dưỡng.
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {rejectedRecipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                recipe={recipe}
                onSave={toggleSave}
                onView={setSelectedRecipe}
              />
            ))}
          </div>
        </section>
      )}

      {/* Bảo chứng khoa học cho thực đơn AI */}
      <ScientificEvidenceFooter variant="menu-addon" />

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}
    </div>
  );
}
