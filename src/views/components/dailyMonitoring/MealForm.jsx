export const MealForm = ({ meals, setMeals }) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-4 mb-5">
        <div className="bg-saffron/10 p-2.5 rounded-full">
          <span className="material-symbols-outlined text-saffron">restaurant</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nhật ký ăn uống</h3>
      </div>

      <div className="space-y-4">
        {[
          { key: "breakfast", label: "Bữa sáng" },
          { key: "lunch", label: "Bữa trưa" },
          { key: "dinner", label: "Bữa tối" },
        ].map((meal) => (
          <div key={meal.key} className="flex justify-between items-center">
            <p className="font-medium text-gray-700 dark:text-gray-300">{meal.label}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setMeals({ ...meals, [meal.key]: true })}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
                  meals[meal.key]
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                Đã ăn
              </button>
              <button
                onClick={() => setMeals({ ...meals, [meal.key]: false })}
                className={`px-4 py-1.5 text-sm font-semibold rounded-full ${
                  !meals[meal.key]
                    ? "bg-rose-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                Bỏ qua
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
