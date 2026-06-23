import React from "react";
import "../../styles/MealPage.css";

const diseases = ["Tất cả bệnh", "Vú", "Phổi", "Tuyến tiền liệt"];
const mealTypes = ["Tất cả", "Bữa sáng", "Bữa trưa", "Bữa tối"];

const RecipeFilters = ({ filters, setFilters }) => {
  return (
    <div className="sticky top-0 z-30 backdrop-blur-sm py-4 -mx-4 px-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-4 bg-background-light/90 dark:bg-background-dark/90">
      <div className="flex gap-2 items-center flex-wrap">
        <span className="text-sm font-semibold mr-2 shrink-0">Bệnh lý:</span>
        {diseases.map((d) => (
          <button
            key={d}
            className={`filter-btn ${filters.disease === d ? "active" : ""}`}
            onClick={() => setFilters((prev) => ({ ...prev, disease: d }))}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="flex h-9 items-center rounded-full bg-white dark:bg-white/10 p-1">
        {mealTypes.map((m) => (
          <label
            key={m}
            className={`meal-type-radio ${
              filters.mealType === m ? "checked" : ""
            }`}
          >
            <span>{m}</span>
            <input
              type="radio"
              name="meal-type"
              value={m}
              checked={filters.mealType === m}
              onChange={() =>
                setFilters((prev) => ({ ...prev, mealType: m }))
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
};

export default RecipeFilters;
