import React from "react";
import RecipeCard from "./RecipeCard";
import "../../styles/MealPage.css";

const RecipeGrid = ({ recipes, onSelect }) => {
  if (!recipes.length)
    return (
      <div className="text-center py-16">
        <span className="material-symbols-outlined text-6xl text-theme-muted dark:text-theme-muted mb-4">restaurant</span>
        <p className="text-theme-muted dark:text-theme-muted text-lg">Không tìm thấy công thức nấu ăn nào.</p>
        <p className="text-theme-muted dark:text-theme-muted text-sm mt-2">
          Hãy thử tạo thực đơn dinh dưỡng hoặc sử dụng nút AI để tạo công thức nấu ăn tùy chỉnh!
        </p>
      </div>
    );

  return (
    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {recipes.map((r) => (
        <RecipeCard key={r.id} recipe={r} onClick={() => onSelect(r)} />
      ))}
    </div>
  );
};

export default RecipeGrid;
