export const SymptomsForm = ({ symptoms, setSymptoms }) => {
  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-4 mb-5">
        <div className="bg-saffron/10 p-2.5 rounded-full">
          <span className="material-symbols-outlined text-saffron">medical_services</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Kiểm tra triệu chứng</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex w-full items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Mức độ triệu chứng</label>
            <p className="text-sm font-semibold text-saffron">{symptoms.severity} / 5</p>
          </div>

          <input
            type="range"
            min="0"
            max="5"
            value={symptoms.severity}
            onChange={(e) => setSymptoms({ ...symptoms, severity: Number(e.target.value) })}
            className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-saffron"
          />
        </div>

        <textarea
          rows="2"
          value={symptoms.note}
          onChange={(e) => setSymptoms({ ...symptoms, note: e.target.value })}
          placeholder="Mô tả sự khó chịu của bạn (Không bắt buộc)"
          className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 focus:ring-saffron focus:border-saffron transition placeholder:text-gray-400"
        />

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Lưu ý: Mức độ nghiêm trọng cao có thể kích hoạt cảnh báo gửi đến đội ngũ y tế.
        </p>
      </div>
    </div>
  );
};
