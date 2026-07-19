import React from "react";

export const StudentLifestyleForm = ({ lifestyle, setLifestyle }) => {
  const handleChange = (field, value) => {
    setLifestyle((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg p-6 md:col-span-2">
      <div className="flex items-center gap-4 mb-5 border-b border-gray-100 dark:border-gray-700/50 pb-4">
        <div className="bg-primary/10 p-2.5 rounded-full">
          <span className="material-symbols-outlined text-primary">school</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nhật ký sức khỏe & Lối sống
          </h3>
          <p className="text-xs text-gray-500">
            Giúp hệ thống phân tích sự cân bằng giữa học tập, sức khỏe và điểm số.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GPA Input */}
        <div>
          <div className="flex w-full items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Điểm GPA hiện tại của bạn là bao nhiêu?
            </label>
            <p className="text-sm font-semibold text-primary">{lifestyle.gpa}</p>
          </div>
          <input
            type="range"
            min="2.0"
            max="4.0"
            step="0.05"
            value={lifestyle.gpa}
            onChange={(e) => handleChange("gpa", Number(e.target.value))}
            className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-primary"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>2.0 (Trung bình)</span>
            <span>3.0 (Khá/Giỏi)</span>
            <span>4.0 (Xuất sắc)</span>
          </div>
        </div>

        {/* Stress Level Selection */}
        <div>
          <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
            Mức độ Stress hiện tại:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { level: "Low", label: "Thấp 🟢", bg: "bg-green-50 dark:bg-green-950/20 border-green-500 text-green-700 dark:text-green-400" },
              { level: "Moderate", label: "Vừa 🟡", bg: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-500 text-yellow-700 dark:text-yellow-400" },
              { level: "High", label: "Cao 🔴", bg: "bg-red-50 dark:bg-red-950/20 border-red-500 text-red-700 dark:text-red-400" },
            ].map((item) => (
              <button
                key={item.level}
                type="button"
                onClick={() => handleChange("stressLevel", item.level)}
                className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg border text-center transition-all ${
                  lifestyle.stressLevel === item.level
                    ? `${item.bg} ring-2 ring-offset-2 ring-primary dark:ring-offset-gray-900 scale-[1.02]`
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Study Hours Slider */}
        <div>
          <div className="flex w-full items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Giờ tự học trong ngày:
            </label>
            <p className="text-sm font-semibold text-primary">{lifestyle.studyHours} giờ</p>
          </div>
          <input
            type="range"
            min="0"
            max="16"
            step="0.5"
            value={lifestyle.studyHours}
            onChange={(e) => handleChange("studyHours", Number(e.target.value))}
            className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-primary"
          />
        </div>

        {/* Sleep Hours Slider */}
        <div>
          <div className="flex w-full items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Giờ ngủ thực tế (BR01/BR06/BR07/BR10/BR12):
            </label>
            <p className="text-sm font-semibold text-primary">{lifestyle.sleepHours} giờ</p>
          </div>
          <input
            type="range"
            min="0"
            max="16"
            step="0.5"
            value={lifestyle.sleepHours}
            onChange={(e) => handleChange("sleepHours", Number(e.target.value))}
            className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-primary"
          />
        </div>

        {/* Social Hours Slider */}
        <div>
          <div className="flex w-full items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Giờ giao tiếp xã hội & Giải trí:
            </label>
            <p className="text-sm font-semibold text-primary">{lifestyle.socialHours} giờ</p>
          </div>
          <input
            type="range"
            min="0"
            max="12"
            step="0.5"
            value={lifestyle.socialHours}
            onChange={(e) => handleChange("socialHours", Number(e.target.value))}
            className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-primary"
          />
        </div>

        {/* Physical Activity Hours Slider */}
        <div>
          <div className="flex w-full items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Giờ vận động thể chất:
            </label>
            <p className="text-sm font-semibold text-primary">{lifestyle.physicalActivityHours} giờ</p>
          </div>
          <input
            type="range"
            min="0"
            max="6"
            step="0.5"
            value={lifestyle.physicalActivityHours}
            onChange={(e) => handleChange("physicalActivityHours", Number(e.target.value))}
            className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-primary"
          />
        </div>

        {/* Extracurricular Hours Slider */}
        <div className="md:col-span-2">
          <div className="flex w-full items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Giờ tham gia hoạt động ngoại khóa:
            </label>
            <p className="text-sm font-semibold text-primary">{lifestyle.extracurricularHours} giờ</p>
          </div>
          <input
            type="range"
            min="0"
            max="8"
            step="0.5"
            value={lifestyle.extracurricularHours}
            onChange={(e) => handleChange("extracurricularHours", Number(e.target.value))}
            className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-primary"
          />
        </div>
      </div>
    </div>
  );
};
