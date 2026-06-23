export const WaterForm = ({ water, setWater }) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-4 mb-5">
        <div className="bg-saffron/10 p-2.5 rounded-full">
          <span className="material-symbols-outlined text-saffron">water_drop</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Lượng nước uống</h3>
      </div>

      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
            Hôm nay bạn uống bao nhiêu cốc nước?
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWater({ liters: Math.max(0, (Number(water.liters) || 0) - 1) })}
              className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors px-3 py-1"
              aria-label="decrease-water"
            >
              -
            </button>
            <span className="text-2xl font-bold w-16 text-center text-gray-800 dark:text-white">
              {water.liters || 0}
            </span>
            <button
              onClick={() => setWater({ liters: (Number(water.liters) || 0) + 1 })}
              className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors px-3 py-1"
              aria-label="increase-water"
            >
              +
            </button>
          </div>
        </div>

        <div className="relative w-20 h-24 bg-gray-100 dark:bg-gray-700 rounded-t-lg rounded-b-2xl overflow-hidden flex flex-col items-center justify-center">
          <div
            className="absolute bottom-0 left-0 w-full bg-blue-400"
            style={{ height: `${Math.min(100, Number(water.liters || 0) * 10)}%` }}
          ></div>
          <span className="material-symbols-outlined text-white/80 text-3xl z-10">water_drop</span>
          <span className="text-lg font-bold text-white z-10">
            {Math.min(100, Math.round((Number(water.liters || 0) * 10)))}%
          </span>
        </div>
      </div>
    </div>
  );
};
