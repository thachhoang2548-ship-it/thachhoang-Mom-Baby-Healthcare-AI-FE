import React from "react";
import { Clock, Flame, Bookmark, Sparkles, ChefHat, ShieldCheck } from "lucide-react";

export default function RecipeCard({ recipe, onSave, onView }) {
  const { title, description, nutritionInfo, tags, imageUrl, isSaved } = recipe;
  
  const prepTime = nutritionInfo?.prepTime || "20 phút";
  const difficulty = nutritionInfo?.difficulty || "Dễ";
  const calories = nutritionInfo?.calories || 0;

  // Choose custom emoji/icon based on tags
  const getFoodEmoji = () => {
    // Phòng thủ: title có thể thiếu nếu nguồn dữ liệu trả field khác — không để crash cả trang.
    const titleLower = (title || "").toLowerCase();
    if (titleLower.includes("cá") || titleLower.includes("salmon")) return "🐟";
    if (titleLower.includes("thịt") || titleLower.includes("heo") || titleLower.includes("bò")) return "🥩";
    if (titleLower.includes("gà") || titleLower.includes("chicken")) return "🍗";
    if (titleLower.includes("trứng") || titleLower.includes("egg")) return "🍳";
    if (titleLower.includes("sinh tố") || titleLower.includes("nước")) return "🍹";
    if (titleLower.includes("salad") || titleLower.includes("rau")) return "🥗";
    if (titleLower.includes("chay") || titleLower.includes("đậu")) return "🌱";
    if (titleLower.includes("súp") || titleLower.includes("canh")) return "🥣";
    return "🍽️";
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full group">
      {/* Recipe Image Container */}
      <div className="relative h-44 w-full bg-amber-50 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">{getFoodEmoji()}</span>
            <ChefHat className="w-8 h-8 text-amber-200" />
          </div>
        )}

        {/* Save button floating on image top right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSave(recipe._id);
          }}
          className="absolute top-3 right-3 p-2.5 rounded-full bg-white/90 hover:bg-white text-gray-700 hover:text-amber-500 shadow-md backdrop-blur-sm transition-colors duration-200"
          title={isSaved ? "Bỏ lưu khỏi sổ tay" : "Lưu vào sổ tay"}
        >
          <Bookmark className={`w-5 h-5 ${isSaved ? "fill-amber-400 text-amber-500" : "text-gray-400"}`} />
        </button>

        {/* Difficulty badge floating bottom left */}
        <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-gray-800 shadow-sm">
          ⭐ {difficulty}
        </span>

        {/* Expert Status badges */}
        {(recipe.isApproved || recipe.status === 1 || recipe.Status === 1 || recipe.status === 'Approved' || recipe.Status === 'Approved') ? (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/95 text-white shadow-sm flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Đã duyệt ✓
          </span>
        ) : (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/95 text-white shadow-sm flex items-center gap-1 animate-pulse">
            <Clock className="w-3 h-3" />
            Chờ chuyên gia duyệt
          </span>
        )}
      </div>

      {/* Recipe Info */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-base text-gray-900 group-hover:text-amber-500 transition-colors duration-200 leading-tight line-clamp-1">
            {title}
          </h3>
          <span className="text-lg leading-none select-none">{getFoodEmoji()}</span>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4 flex-grow">
          {description || "Công thức bổ dưỡng được thiết kế riêng dựa trên thể trạng sức khỏe hiện tại."}
        </p>

        {/* Key stats row */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 font-semibold mb-4 bg-gray-50 p-2.5 rounded-2xl border border-gray-50">
          <div className="flex items-center gap-1.5 justify-center">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{prepTime}</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center border-l border-gray-200">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-100" />
            <span>{calories} kcal</span>
          </div>
        </div>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-5">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100/50 flex items-center gap-0.5"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onView(recipe)}
            className="flex-grow py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-full text-xs shadow-sm hover:shadow-md transition-all duration-200"
          >
            Xem công thức
          </button>
        </div>
      </div>
    </div>
  );
}
