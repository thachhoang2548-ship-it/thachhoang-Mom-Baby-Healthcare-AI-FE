import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthController } from "../../controllers/authController";
import dailyMonitoringService from "../../models/services/dailyMonitoringService";
import { SleepForm } from "../components/dailyMonitoring/SleepForm";
import { WaterForm } from "../components/dailyMonitoring/WaterForm";
import { MealForm } from "../components/dailyMonitoring/MealForm";
import { MoodForm } from "../components/dailyMonitoring/MoodForm";
import { VitalsForm } from "../components/dailyMonitoring/VitalsForm";
import { SymptomsForm } from "../components/dailyMonitoring/SymptomsForm";
import { StudentLifestyleForm } from "../components/dailyMonitoring/StudentLifestyleForm";
import { SubmitCard } from "../components/dailyMonitoring/SubmitCard";

const DailyMonitoringPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthController();

  const [sleep, setSleep] = useState({ hours: 6, quality: 3 });
  const [water, setWater] = useState({ liters: 6 });
  const [meals, setMeals] = useState({ breakfast: true, lunch: false, dinner: false });
  const [mood, setMood] = useState({ score: 4, note: "" });
  const [vitals, setVitals] = useState({ sugar: "110", bp: "120/80", weight: "75.5" });
  const [symptoms, setSymptoms] = useState({ severity: 2, note: "" });
  const [loading, setLoading] = useState(false);

  const [lifestyle, setLifestyle] = useState({
    studyHours: 4,
    extracurricularHours: 1,
    sleepHours: 6,
    socialHours: 2,
    physicalActivityHours: 1,
    gpa: 3.0,
    stressLevel: "Moderate",
  });

  const handleSleepChange = (newSleep) => {
    setSleep(newSleep);
    setLifestyle((prev) => ({ ...prev, sleepHours: newSleep.hours }));
  };

  const handleLifestyleChange = (updater) => {
    setLifestyle((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (next.sleepHours !== prev.sleepHours) {
        setSleep((s) => ({ ...s, hours: next.sleepHours }));
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    setLoading(true);

    const [bpHigh, bpLow] = (vitals.bp || "0/0").split("/");

    const payload = {
      date: new Date(),
      sleepHours: Number(user?.userType === "student" ? lifestyle.sleepHours : sleep.hours),
      sleepQuality: Number(sleep.quality),
      waterLiters: Number(water.liters),
      hadBreakfast: meals.breakfast,
      hadLunch: meals.lunch,
      hadDinner: meals.dinner,
      moodScore: Number(mood.score),
      moodNote: mood.note,
      bloodSugar: Number(vitals.sugar),
      bloodPressureHigh: Number(bpHigh),
      bloodPressureLow: Number(bpLow),
      weight: Number(vitals.weight),
      symptomSeverity: Number(symptoms.severity),
      symptomNote: symptoms.note,
      ...(user?.userType === "student"
        ? {
            studyHours: lifestyle.studyHours,
            extracurricularHours: lifestyle.extracurricularHours,
            sleepHours: lifestyle.sleepHours,
            socialHours: lifestyle.socialHours,
            physicalActivityHours: lifestyle.physicalActivityHours,
            gpa: lifestyle.gpa,
            stressLevel: lifestyle.stressLevel,
          }
        : {}),
    };

    try {
      await dailyMonitoringService.createDailyMonitoring(payload);
      toast.success("Đã lưu nhật ký hàng ngày thành công!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving daily monitoring:", err);
      toast.error(err.message || "Không thể lưu nhật ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const completedMealsCount = [meals.breakfast, meals.lunch, meals.dinner].filter(Boolean).length;

  return (
    <div className="font-display max-w-6xl mx-auto space-y-6 pb-12 text-theme-ink">
      <header className="bg-theme-surface rounded-3xl border border-theme-line p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-theme-brand-soft text-theme-ink px-3.5 py-1.5 text-xs font-bold border border-theme-brand/20">
              <ClipboardList className="w-4 h-4 text-theme-brand" aria-hidden="true" />
              <span>Ghi chép sức khỏe hàng ngày</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-theme-ink">
              Nhật ký sức khỏe hôm nay
            </h1>
            <p className="text-sm sm:text-base text-theme-muted font-medium max-w-2xl leading-relaxed">
              Dành khoảng 20 giây lưu lại giấc ngủ, nước uống, bữa ăn và các chỉ số cơ thể để theo dõi hành trình của mẹ sát sao hơn.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <span className="inline-flex items-center rounded-full bg-theme-page border border-theme-line px-3.5 py-1.5 text-xs font-bold text-theme-ink">
              Ngủ: {sleep.hours} giờ
            </span>
            <span className="inline-flex items-center rounded-full bg-theme-page border border-theme-line px-3.5 py-1.5 text-xs font-bold text-theme-ink">
              Nước: {water.liters} cốc
            </span>
            <span className="inline-flex items-center rounded-full bg-theme-page border border-theme-line px-3.5 py-1.5 text-xs font-bold text-theme-ink">
              Bữa ăn: {completedMealsCount}/3
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SleepForm sleep={sleep} setSleep={handleSleepChange} />
        <WaterForm water={water} setWater={setWater} />
        <MealForm meals={meals} setMeals={setMeals} />
        <MoodForm mood={mood} setMood={setMood} />
        <VitalsForm vitals={vitals} setVitals={setVitals} />
        <SymptomsForm symptoms={symptoms} setSymptoms={setSymptoms} />
        {user?.userType === "student" && (
          <StudentLifestyleForm lifestyle={lifestyle} setLifestyle={handleLifestyleChange} />
        )}
      </div>

      <SubmitCard loading={loading} onSubmit={handleSubmit} />
    </div>
  );
};

export default DailyMonitoringPage;
