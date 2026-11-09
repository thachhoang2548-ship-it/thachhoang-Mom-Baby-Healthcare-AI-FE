import React from "react";
import {
  Clock,
  Flame,
  Bookmark,
  Sparkles,
  ChefHat,
  ShieldCheck,
  X,
  Fish,
  Beef,
  Egg,
  CupSoda,
  Salad,
  Sprout,
  Soup,
  UtensilsCrossed,
} from "lucide-react";

function renderFoodIcon(title) {
  const titleLower = (title || "").toLowerCase();
  if (titleLower.includes("cá") || titleLower.includes("salmon")) return <Fish className="h-7 w-7" />;
  if (titleLower.includes("thịt") || titleLower.includes("heo") || titleLower.includes("bò") || titleLower.includes("gà")) return <Beef className="h-7 w-7" />;
  if (titleLower.includes("trứng") || titleLower.includes("egg")) return <Egg className="h-7 w-7" />;
  if (titleLower.includes("sinh tố") || titleLower.includes("nước")) return <CupSoda className="h-7 w-7" />;
  if (titleLower.includes("salad") || titleLower.includes("rau")) return <Salad className="h-7 w-7" />;
  if (titleLower.includes("chay") || titleLower.includes("đậu")) return <Sprout className="h-7 w-7" />;
  if (titleLower.includes("súp") || titleLower.includes("canh") || titleLower.includes("cháo")) return <Soup className="h-7 w-7" />;
  return <UtensilsCrossed className="h-7 w-7" />;
}

export default function RecipeCard({ recipe, onSave, onView }) {
  const { title, description, nutritionInfo, tags, imageUrl, isSaved } = recipe;

  const prepTime = nutritionInfo?.prepTime || "20 phút";
  const difficulty = nutritionInfo?.difficulty || "Dễ";
  const calories = nutritionInfo?.calories || 0;

  const isApproved =
    recipe.isApproved ||
    recipe.status === 1 ||
    recipe.Status === 1 ||
    recipe.status === "Approved" ||
    recipe.Status === "Approved";
  const isRejected =
    recipe.status === "Rejected" ||
    recipe.Status === "Rejected" ||
    recipe.status === 2 ||
    recipe.Status === 2;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-theme-line bg-theme-surface font-display shadow-sm transition-colors hover:border-theme-brand/45">
      {/* Recipe Image Container */}
      <div className="relative h-44 w-full overflow-hidden border-b border-theme-line bg-theme-sidebar/70">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-theme-brand">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-theme-line bg-theme-surface shadow-sm">
              {renderFoodIcon(title)}
            </span>
            <span className="text-xs font-semibold text-theme-muted">Công thức bếp mẹ</span>
          </div>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSave(recipe._id);
          }}
          aria-label={isSaved ? "Bỏ lưu khỏi sổ tay" : "Lưu vào sổ tay"}
          className="absolute right-3 top-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-theme-line bg-theme-surface/95 text-theme-ink shadow-sm transition-colors hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          <Bookmark
            className={`h-4 w-4 ${isSaved ? "fill-theme-brand text-theme-brand" : "text-theme-muted"}`}
          />
        </button>

        {/* Difficulty badge */}
        <span className="absolute bottom-3 left-3 rounded-full border border-theme-line bg-theme-surface/95 px-3 py-1 text-xs font-bold text-theme-ink shadow-sm">
          Độ khó: {difficulty}
        </span>

        {/* Expert Status badges (static, >= 4.5:1 contrast) */}
        {isApproved ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-status-ok px-3 py-1 text-xs font-bold text-theme-surface shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Đã duyệt</span>
          </span>
        ) : isRejected ? (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-700 px-3 py-1 text-xs font-bold text-white shadow-sm">
            <X className="h-3.5 w-3.5" />
            <span>Không phù hợp</span>
          </span>
        ) : (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-status-warn-line bg-status-warn-bg px-3 py-1 text-xs font-bold text-status-warn-text shadow-sm">
            <Clock className="h-3.5 w-3.5" />
            <span>Chờ chuyên gia duyệt</span>
          </span>
        )}
      </div>

      {/* Recipe Info */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-theme-ink sm:text-lg">
            {title}
          </h3>
          <ChefHat className="mt-0.5 h-5 w-5 shrink-0 text-theme-muted" />
        </div>

        <p className="mb-4 line-clamp-2 flex-1 text-xs leading-relaxed text-theme-muted sm:text-sm">
          {description ||
            "Công thức bổ dưỡng được thiết kế riêng dựa trên thể trạng sức khỏe hiện tại của mẹ."}
        </p>

        {/* Key stats row */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-theme-line bg-theme-page/60 p-2.5 text-xs font-semibold text-theme-ink">
          <div className="flex items-center justify-center gap-1.5">
            <Clock className="h-4 w-4 text-theme-muted" />
            <span>{prepTime}</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 border-l border-theme-line">
            <Flame className="h-4 w-4 text-theme-brand" />
            <span>{calories} kcal</span>
          </div>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-full bg-theme-brand-soft px-2.5 py-0.5 text-xs font-semibold text-theme-ink"
              >
                <Sparkles className="h-3 w-3 text-theme-brand" />
                <span>{tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <button
          type="button"
          onClick={() => onView(recipe)}
          className="min-h-[44px] w-full rounded-full bg-theme-brand px-5 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
        >
          Xem công thức chi tiết
        </button>
      </div>
    </article>
  );
}
