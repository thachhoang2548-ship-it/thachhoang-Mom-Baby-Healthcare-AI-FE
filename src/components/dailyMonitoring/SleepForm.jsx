export const SleepForm = ({ sleep, setSleep }) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-4 mb-5">
        <div className="bg-saffron/10 p-2.5 rounded-full">
          <span className="material-symbols-outlined text-saffron">dark_mode</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nhật ký giấc ngủ</h3>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex w-full items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Bạn đã ngủ bao nhiêu tiếng?
            </label>
            <p className="text-sm font-semibold text-saffron">{sleep.hours || 0} giờ</p>
          </div>

          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={sleep.hours}
            onChange={(e) => setSleep({ ...sleep, hours: Number(e.target.value) })}
            className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-saffron"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 block">
            Chất lượng giấc ngủ của bạn thế nào?
          </label>
          <div className="flex justify-around items-center">
            {["😞", "😐", "🙂", "😊", "😴"].map((emo, idx) => (
              <button
                key={idx}
                onClick={() => setSleep({ ...sleep, quality: idx + 1 })}
                className={`text-4xl transition-all ${sleep.quality === idx + 1
                  ? "scale-125"
                  : "opacity-50 hover:opacity-100 hover:scale-110"
                  }`}
                aria-label={`quality-${idx + 1}`}
              >
                {idx === 2 ? <span className="p-2 rounded-full bg-saffron/20">{emo}</span> : emo}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
