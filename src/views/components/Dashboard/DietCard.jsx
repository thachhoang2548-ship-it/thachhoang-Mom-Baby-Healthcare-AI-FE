import fork from "../../assets/DashboardAssets/cutlery.png";

const DietCard = ({ diet }) => {
  const meals = diet?.meals || [];
  
  const getTranslatedDay = (day) => {
    if (!day || day.toLowerCase() === "today") return "Hôm nay";
    const days = {
      monday: "Thứ Hai",
      tuesday: "Thứ Ba",
      wednesday: "Thứ Tư",
      thursday: "Thứ Năm",
      friday: "Thứ Sáu",
      saturday: "Thứ Bảy",
      sunday: "Chủ Nhật"
    };
    return days[day.toLowerCase()] || day;
  };

  const getMealTypeVN = (type) => {
    switch (type?.toLowerCase()) {
      case "breakfast": return "Bữa sáng";
      case "lunch": return "Bữa trưa";
      case "dinner": return "Bữa tối";
      case "snack": return "Bữa phụ";
      default: return type;
    }
  };

  const day = getTranslatedDay(diet?.day);

  return (
    <div className="w-full lg:col-span-1 xl:col-span-1 bg-surface-light dark:bg-surface-dark rounded-DEFAULT shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border-light flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
          <img src={fork} alt="Fork" className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-bold text-text-light dark:text-text-dark">
          {day === "Hôm nay" ? "Chế độ ăn hôm nay" : `Chế độ ăn ${day}`}
        </h2>
      </div>

      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {meals.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">Chưa có bữa ăn nào được lên lịch.</p>
        ) : (
          meals.map((meal, idx) => (
            <div
              key={idx}
              className="flex flex-col border-b border-gray-100 dark:border-gray-700 last:border-0 pb-3 last:pb-0"
            >
              <div className="flex justify-between items-start">
                <span className="px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-bold uppercase tracking-wider">
                  {getMealTypeVN(meal.mealType)}
                </span>
                {meal.calories > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {meal.calories} kcal
                  </span>
                )}
              </div>
              <p className="mt-2 font-semibold text-text-light dark:text-text-dark text-sm leading-tight">
                {meal.recipe}
              </p>
              {meal.ingredients && meal.ingredients.length > 0 && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                  {meal.ingredients.slice(0, 3).join(", ")}
                  {meal.ingredients.length > 3 ? "..." : ""}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DietCard;
