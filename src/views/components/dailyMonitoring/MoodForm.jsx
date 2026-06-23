export const MoodForm = ({ mood, setMood }) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-4 mb-5">
        <div className="bg-saffron/10 p-2.5 rounded-full">
          <span className="material-symbols-outlined text-saffron">mood</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Theo dõi tâm trạng</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3 block">
            Hôm nay bạn cảm thấy thế nào?
          </label>
          <div className="flex justify-around items-center">
            {["😣", "😕", "🙂", "😄", "🤩"].map((emo, idx) => (
              <button
                key={idx}
                onClick={() => setMood({ ...mood, score: idx + 1 })}
                className={`text-4xl transition-all ${
                  mood.score === idx + 1
                    ? "scale-125"
                    : "opacity-50 hover:opacity-100 hover:scale-110"
                }`}
              >
                {idx === 3 ? <span className="p-2 rounded-full bg-saffron/20">{emo}</span> : emo}
              </button>
            ))}
          </div>
        </div>

        <textarea
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-saffron focus:border-saffron transition placeholder:text-gray-400"
          placeholder="Thêm ghi chú khác... (Không bắt buộc)"
          rows="2"
          value={mood.note}
          onChange={(e) => setMood({ ...mood, note: e.target.value })}
        />
      </div>
    </div>
  );
};
