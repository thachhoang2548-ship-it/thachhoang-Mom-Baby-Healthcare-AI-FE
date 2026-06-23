export const VitalsForm = ({ vitals, setVitals }) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-4 mb-5">
        <div className="bg-saffron/10 p-2.5 rounded-full">
          <span className="material-symbols-outlined text-saffron">monitor_heart</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chỉ số cơ thể</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Đường huyết</label>
          <div className="relative mt-1">
            <input
              type="number"
              value={vitals.sugar}
              onChange={(e) => setVitals({ ...vitals, sugar: e.target.value })}
              className="w-full pl-3 pr-16 py-2 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-saffron focus:border-saffron transition"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-400 dark:text-gray-500">
              mg/dL
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Huyết áp</label>
          <div className="relative mt-1">
            <input
              type="text"
              value={vitals.bp}
              onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
              placeholder="TÂM THU/TÂM TRƯƠNG"
              className="w-full pl-3 pr-16 py-2 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-saffron focus:border-saffron transition"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-400 dark:text-gray-500">
              SYS/DIA
            </span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Cân nặng</label>
          <div className="relative mt-1">
            <input
              type="number"
              value={vitals.weight}
              onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
              className="w-full pl-3 pr-8 py-2 rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-saffron focus:border-saffron transition"
            />
            <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-400 dark:text-gray-500">
              kg
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
