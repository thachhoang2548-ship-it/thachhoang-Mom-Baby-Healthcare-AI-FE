import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLifestyleController } from "../../../controllers/lifestyleController";
import { previewAlerts } from "../../utils/businessRulesPreview";
import AlertCard from "../alerts/AlertCard";
import { 
  BookOpen, 
  Moon, 
  Dumbbell, 
  Users, 
  Award, 
  GraduationCap, 
  AlertTriangle 
} from "lucide-react";

const DailyInputForm = () => {
  const navigate = useNavigate();
  const { todayEntry, submitEntry, fetchTodayData, isLoading } = useLifestyleController();

  const [formData, setFormData] = useState({
    studyHours: 4,
    sleepHours: 7,
    physicalActivityHours: 1,
    socialHours: 2,
    extracurricularHours: 1,
    gpa: 3.0,
    stressLevel: "Moderate"
  });

  // Pre-fill form if today's entry already exists (edit mode)
  useEffect(() => {
    fetchTodayData();
  }, []);

  useEffect(() => {
    if (todayEntry) {
      setFormData({
        studyHours: todayEntry.studyHours ?? 4,
        sleepHours: todayEntry.sleepHours ?? todayEntry.sleep?.hours ?? 7,
        physicalActivityHours: todayEntry.physicalActivityHours ?? 1,
        socialHours: todayEntry.socialHours ?? 2,
        extracurricularHours: todayEntry.extracurricularHours ?? 1,
        gpa: todayEntry.gpa ?? 3.0,
        stressLevel: todayEntry.stressLevel ?? "Moderate"
      });
    }
  }, [todayEntry]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitEntry(formData);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  // Live client-side preview alerts
  const previewed = previewAlerts({
    study: formData.studyHours,
    sleep: formData.sleepHours,
    physical: formData.physicalActivityHours,
    social: formData.socialHours,
    extracurricular: formData.extracurricularHours,
    gpa: formData.gpa,
    stressLevel: formData.stressLevel
  });

  const sliders = [
    {
      field: "studyHours",
      label: "Thời gian tự học",
      icon: <BookOpen className="h-5 w-5 text-indigo-500" />,
      min: 0,
      max: 16,
      step: 0.5,
      unit: "giờ"
    },
    {
      field: "sleepHours",
      label: "Thời gian ngủ",
      icon: <Moon className="h-5 w-5 text-amber-500" />,
      min: 0,
      max: 16,
      step: 0.5,
      unit: "giờ"
    },
    {
      field: "physicalActivityHours",
      label: "Vận động thể chất",
      icon: <Dumbbell className="h-5 w-5 text-emerald-500" />,
      min: 0,
      max: 16,
      step: 0.5,
      unit: "giờ"
    },
    {
      field: "socialHours",
      label: "Hoạt động xã hội & Giải trí",
      icon: <Users className="h-5 w-5 text-sky-500" />,
      min: 0,
      max: 16,
      step: 0.5,
      unit: "giờ"
    },
    {
      field: "extracurricularHours",
      label: "Hoạt động ngoại khóa",
      icon: <Award className="h-5 w-5 text-rose-500" />,
      min: 0,
      max: 16,
      step: 0.5,
      unit: "giờ"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Input Form Column */}
      <form
        onSubmit={handleSubmit}
        className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50 space-y-6"
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {todayEntry ? "Chỉnh sửa nhật ký hôm nay" : "Ghi nhận lối sống hàng ngày"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Điều chỉnh các thanh trượt và xem phân tích trực tiếp phản hồi của bạn.
          </p>
        </div>

        <div className="space-y-5">
          {sliders.map((s) => (
            <div key={s.field} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {s.icon}
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    {s.label}
                  </span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                  {formData[s.field]} {s.unit}
                </span>
              </div>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={formData[s.field]}
                onChange={(e) => handleChange(s.field, Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          ))}

          {/* GPA Input */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5 text-violet-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Điểm trung bình học tập (GPA)
              </span>
            </div>
            <input
              type="number"
              min="2.0"
              max="4.0"
              step="0.01"
              required
              value={formData.gpa}
              onChange={(e) => handleChange("gpa", parseFloat(e.target.value) || 2.0)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 dark:text-white"
              placeholder="Nhập GPA từ 2.0 - 4.0"
            />
          </div>

          {/* Stress Level Select */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
              Mức độ căng thẳng (Stress)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["Low", "Moderate", "High"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => handleChange("stressLevel", level)}
                  className={`py-2.5 px-4 text-sm font-bold rounded-lg border text-center transition-all ${
                    formData.stressLevel === level
                      ? "bg-primary border-primary text-white shadow"
                      : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {level === "Low" ? "Thấp" : level === "Moderate" ? "Trung bình" : "Cao"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isLoading ? "Đang gửi..." : "Lưu nhật ký"}
        </button>
      </form>

      {/* Live Preview Column */}
      <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-6 border border-gray-100 dark:border-gray-700/30 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Xem trước phản hồi quy tắc
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Các cảnh báo và huy hiệu lối sống sẽ hiển thị tức thời dựa trên cấu hình trên.
          </p>
        </div>

        <div className="space-y-4">
          {previewed.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <p className="font-semibold text-sm">Chưa có cảnh báo nào kích hoạt.</p>
              <p className="text-xs mt-1">Lối sống của bạn đang ở trạng thái cân bằng.</p>
            </div>
          ) : (
            previewed.map((alert, index) => (
              <AlertCard key={`${alert.ruleId}-${index}`} alert={alert} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyInputForm;
