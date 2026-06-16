import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";
import { createDailyMonitoring } from "../services/dailyMonitoringService";
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
  const { user } = useContext(AuthContext);

  const [sleep, setSleep] = useState({ hours: 6, quality: 3 });
  const [water, setWater] = useState({ liters: 6 });
  const [meals, setMeals] = useState({ breakfast: true, lunch: false, dinner: false });
  const [mood, setMood] = useState({ score: 4, note: "" });
  const [vitals, setVitals] = useState({ sugar: "110", bp: "120/80", weight: "75.5" });
  const [symptoms, setSymptoms] = useState({ severity: 2, note: "" });
  const [loading, setLoading] = useState(false);

  // Student lifestyle state
  const [lifestyle, setLifestyle] = useState({
    studyHours: 4,
    extracurricularHours: 1,
    sleepHours: 6,
    socialHours: 2,
    physicalActivityHours: 1,
    gpa: 3.0,
    stressLevel: "Moderate"
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
      sleep: {
        ...sleep,
        hours: user?.userType === "student" ? lifestyle.sleepHours : sleep.hours
      },
      water,
      meals,
      mood,
      vitals: {
        sugar: Number(vitals.sugar),
        bpHigh: Number(bpHigh),
        bpLow: Number(bpLow),
        weight: Number(vitals.weight),
      },
      symptoms,
      ...(user?.userType === "student" ? {
        studyHours: lifestyle.studyHours,
        extracurricularHours: lifestyle.extracurricularHours,
        sleepHours: lifestyle.sleepHours,
        socialHours: lifestyle.socialHours,
        physicalActivityHours: lifestyle.physicalActivityHours,
        gpa: lifestyle.gpa,
        stressLevel: lifestyle.stressLevel
      } : {})
    };

    try {
      await createDailyMonitoring(payload);
      alert("Đã lưu nhật ký hàng ngày thành công!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving daily monitoring:", err);
      alert(err.message || "Không thể lưu nhật ký. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen font-display text-gray-800 dark:text-gray-200 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
            Nhật ký hàng ngày
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
            Theo dõi sức khỏe hàng ngày của bạn chỉ trong 20 giây.
          </p>
        </header>

        <div className="mb-8">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div className="bg-saffron h-1.5 rounded-full" style={{ width: "33%" }} />
          </div>
        </div>

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
    </div>
  );
};

export default DailyMonitoringPage;
