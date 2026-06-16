import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../store/profileStore';
import { useBusinessRules } from '../../hooks/useBusinessRules';
import { pregnancyApi } from '../../api/pregnancyApi';
import WeeklyMilestone from '../../components/pregnancy/WeeklyMilestone';
import WeightChart from '../../components/pregnancy/WeightChart';
import NutritionRadar from '../../components/shared/NutritionRadar';
import TierGate from '../../components/layout/TierGate';
import { Calendar, Heart, Plus, Scale, Footprints, Utensils, AlertTriangle, ChevronRight, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PregnancyDashPage() {
  const navigate = useNavigate();
  const { momProfile, fetchProfile, updateWeightLog } = useProfileStore();
  const { evaluateBR02, evaluateBR03 } = useBusinessRules();

  // Weight Form States
  const [weightInput, setWeightInput] = useState('');
  const [weightLogs, setWeightLogs] = useState([]);
  const [submittingWeight, setSubmittingWeight] = useState(false);

  // Food Form States
  const [foodInput, setFoodInput] = useState('');
  const [submittingFood, setSubmittingFood] = useState(false);
  const [todayNutrient, setTodayNutrient] = useState({ iron: 70, calcium: 65, folate: 85, protein: 75 });

  // Food Warning Modal States
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [foodWarningAlert, setFoodWarningAlert] = useState(null);

  // Step Counter States
  const [stepInput, setStepInput] = useState('');
  const [exerciseType, setExerciseType] = useState('Đi bộ');
  const [durationInput, setDurationInput] = useState('');
  const [submittingExercise, setSubmittingExercise] = useState(false);
  const [todaySteps, setTodaySteps] = useState(1500);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const profile = await fetchProfile();
    
    // Default mock weight logs combined with actual logs from backend if any
    const mockLogs = [
      { week: 1, weight: 51.0, recordedAt: new Date(Date.now() - 77 * 24 * 60 * 60 * 1000).toISOString() },
      { week: 4, weight: 51.2, recordedAt: new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString() },
      { week: 8, weight: 52.0, recordedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString() },
      { week: 11, weight: 53.1, recordedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    ];
    setWeightLogs(mockLogs);
  };

  // Weight Log Submission
  const handleWeightSubmit = async (e) => {
    e.preventDefault();
    if (!weightInput || isNaN(weightInput)) {
      toast.error('Vui lòng nhập cân nặng hợp lệ (kg)');
      return;
    }

    setSubmittingWeight(true);
    try {
      const res = await updateWeightLog(weightInput);
      if (res) {
        toast.success('Ghi nhận cân nặng thành công! ⚖️');
        
        // Append to logs
        const newLog = {
          week: momProfile?.pregnancyWeek || 12,
          weight: parseFloat(weightInput),
          recordedAt: new Date().toISOString()
        };
        setWeightLogs((prev) => [...prev, newLog]);
        setWeightInput('');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi ghi cân nặng');
    } finally {
      setSubmittingWeight(false);
    }
  };

  // Food Log Submission with safety analysis
  const handleFoodSubmit = async (e) => {
    e.preventDefault();
    if (!foodInput.trim()) {
      toast.error('Mami vui lòng nhập thức ăn đã nạp');
      return;
    }

    const foodsArray = foodInput.split(',').map((f) => f.trim()).filter(Boolean);
    
    // 1. Client-Side instant BR02 (Unsafe Foods) check
    let clientWarning = null;
    for (const food of foodsArray) {
      const warning = evaluateBR02(food);
      if (warning && warning.triggered) {
        clientWarning = {
          title: warning.title,
          message: warning.message,
          safeAlternatives: [
            'Phở bò chín kỹ nóng sốt',
            'Kimbap chín (không dùng trứng lòng đào/cá sống)',
            'Sữa chua tiệt trùng kèm dâu tây chín',
            'Nước lọc ấm hoặc nước dừa tươi thanh mát'
          ]
        };
        break;
      }
    }

    if (clientWarning) {
      setFoodWarningAlert(clientWarning);
      setShowWarningModal(true);
      setFoodInput('');
      return;
    }

    // 2. Submit to API (Requires MomHienDai tier)
    setSubmittingFood(true);
    try {
      const res = await pregnancyApi.logFood(foodsArray);
      if (res.isSuccess && res.data) {
        const { alerts, safeAlternatives } = res.data;
        
        // If API returns alerts for BR02
        if (alerts && alerts.length > 0) {
          const apiWarning = {
            title: alerts[0].titleVi || alerts[0].title || 'Phát hiện thực phẩm nhạy cảm',
            message: alerts[0].messageVi || alerts[0].message || '',
            safeAlternatives: safeAlternatives || ['Phở bò chín kỹ']
          };
          setFoodWarningAlert(apiWarning);
          setShowWarningModal(true);
        } else {
          toast.success('Bữa ăn đã được ghi nhận thành công! ✨');
          
          // Boost nutrition values simulated
          setTodayNutrient((prev) => ({
            iron: Math.min(prev.iron + 15, 100),
            calcium: Math.min(prev.calcium + 20, 100),
            folate: Math.min(prev.folate + 10, 100),
            protein: Math.min(prev.protein + 15, 100)
          }));
        }
        setFoodInput('');
      }
    } catch (err) {
      console.error(err);
      // Fallback message for network issues
      toast.error('Không thể lưu bữa ăn. Vui lòng thử lại!');
    } finally {
      setSubmittingFood(false);
    }
  };

  // Steps / Exercise log submission
  const handleExerciseSubmit = async (e) => {
    e.preventDefault();
    if (!stepInput || isNaN(stepInput)) {
      toast.error('Mami vui lòng nhập số bước chân hợp lệ');
      return;
    }

    setSubmittingExercise(true);
    try {
      const res = await pregnancyApi.logExercise(stepInput, exerciseType, durationInput || 0);
      if (res.isSuccess) {
        const stepsVal = parseInt(stepInput);
        setTodaySteps((prev) => prev + stepsVal);
        
        // Evaluate rule client-side
        const check = evaluateBR03(stepsVal);
        if (check && check.triggered) {
          toast.error(check.message, { id: 'step-warning', duration: 5000 });
        } else {
          toast.success('Ghi nhận vận động thành công! 🚶‍♀️');
        }

        setStepInput('');
        setDurationInput('');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi lưu vận động');
    } finally {
      setSubmittingExercise(false);
    }
  };

  const currentWeek = momProfile?.pregnancyWeek || 12;
  const currentTrimester = currentWeek <= 12 ? 1 : currentWeek <= 27 ? 2 : 3;

  return (
    <div className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-pink-50 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-5 h-5 text-momPink fill-momPink" />
            Nhật Ký Thai Kỳ
          </h2>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Giám sát sức khỏe toàn diện cho mẹ và mốc phát triển của bé
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-gradient-to-r from-momPink to-momPurple text-white px-3 py-1 rounded-full font-bold uppercase shadow-sm">
            Tam cá nguyệt {currentTrimester}
          </span>
          <span className="text-[10px] bg-white border border-pink-100 text-momPink-dark px-3 py-1 rounded-full font-bold uppercase">
            Tuần thai {currentWeek}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Milestones, Foods & Radar */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Weekly Milestone Card */}
          <WeeklyMilestone week={currentWeek} />

          {/* Gated Meal Diary Trackers */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-pink-100/50 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-pink-50 dark:border-gray-700">
              <h3 className="text-xs font-bold text-gray-850 dark:text-white flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-momPink" />
                Ghi Chép Bữa Ăn & Kiểm Tra Thực Phẩm
              </h3>
              <button
                onClick={() => navigate('/pregnancy/meals')}
                className="text-[10px] text-momPink hover:text-momPink-dark font-bold flex items-center gap-0.5"
              >
                Thực đơn gợi ý <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <TierGate requiredTier="MomHienDai">
              <div className="space-y-4">
                <form onSubmit={handleFoodSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-750 block mb-1">
                      Mami đã ăn món gì hôm nay?
                    </label>
                    <input
                      type="text"
                      value={foodInput}
                      onChange={(e) => setFoodInput(e.target.value)}
                      placeholder="Ví dụ: phở chín, dứa, sinh tố bơ (phân tách bằng dấu phẩy)..."
                      className="w-full px-4 py-2.5 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-momPink/30 focus:border-momPink text-xs font-semibold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submittingFood}
                    className="px-5 py-2.5 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-bold rounded-xl shadow-md hover:scale-[1.01] active:scale-95 transition-all"
                  >
                    {submittingFood ? 'Đang phân tích...' : 'Phân tích món ăn 🔍'}
                  </button>
                </form>

                {/* Radar Chart */}
                <NutritionRadar intake={todayNutrient} />
              </div>
            </TierGate>
          </div>

        </div>

        {/* Right Column: Weight, Physical Steps */}
        <div className="space-y-6">
          
          {/* Weight log & Area chart */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-pink-100/50 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-850 dark:text-white flex items-center gap-1.5 pb-2 border-b border-pink-50 dark:border-gray-700">
              <Scale className="w-4 h-4 text-momPurple" />
              Theo Dõi Cân Nặng Mẹ Bầu
            </h3>

            {/* Weight Chart */}
            <WeightChart logs={weightLogs} />

            {/* Add weight form */}
            <form onSubmit={handleWeightSubmit} className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-bold text-gray-400 block mb-1">Cân nặng (kg)</label>
                <input
                  type="text"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="54.5"
                  className="w-full px-3 py-2 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-momPurple/30 focus:border-momPurple text-xs font-semibold"
                />
              </div>
              <button
                type="submit"
                disabled={submittingWeight}
                className="py-2.5 px-4 bg-momPurple text-white text-xs font-bold rounded-xl hover:bg-momPurple-dark transition-all active:scale-95 shadow-sm"
              >
                Ghi nhận
              </button>
            </form>
          </div>

          {/* Steps and physical logs */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-pink-100/50 dark:border-gray-700 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-pink-50 dark:border-gray-700">
              <h3 className="text-xs font-bold text-gray-855 dark:text-white flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-momGreen" />
                Vận Động & Đếm Bước Chân
              </h3>
              <button
                onClick={() => navigate('/pregnancy/exercises')}
                className="text-[10px] text-momGreen hover:text-momGreen-dark font-bold flex items-center gap-0.5"
              >
                Bài tập gợi ý <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Steps counter display */}
            <div className="bg-green-50/30 p-4 rounded-xl border border-green-150/40 text-center">
              <span className="text-2xl">🚶‍♀️</span>
              <p className="text-lg font-extrabold text-momGreen-dark mt-1">{todaySteps.toLocaleString()} bước</p>
              <p className="text-[10px] text-gray-500 font-semibold mt-0.5">Mục tiêu: Hướng tới 5.000 bước mỗi ngày</p>
              
              {todaySteps < 3000 && (
                <div className="mt-2.5 p-2 bg-amber-50 rounded-lg border border-amber-250 flex items-center gap-1.5 text-[9px] text-amber-800 font-bold text-left leading-normal">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Mami đang ít vận động hôm nay. Hãy đứng dậy đi lại nhẹ nhàng nhé!
                </div>
              )}
            </div>

            {/* Log Exercise form */}
            <form onSubmit={handleExerciseSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Số bước đi thêm</label>
                  <input
                    type="number"
                    value={stepInput}
                    onChange={(e) => setStepInput(e.target.value)}
                    placeholder="1000"
                    className="w-full px-3 py-2 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-momGreen/30 focus:border-momGreen text-xs font-semibold bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Thời gian (phút)</label>
                  <input
                    type="number"
                    value={durationInput}
                    onChange={(e) => setDurationInput(e.target.value)}
                    placeholder="15"
                    className="w-full px-3 py-2 rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-momGreen/30 focus:border-momGreen text-xs font-semibold bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingExercise}
                className="w-full py-2 bg-momGreen text-white text-xs font-bold rounded-xl hover:bg-momGreen-dark transition-all active:scale-95 shadow-sm"
              >
                Ghi nhận hoạt động
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Gen Z Food Warning Modal */}
      {showWarningModal && foodWarningAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-pink-50 rounded-3xl p-6 shadow-2xl border border-pink-100 animate-scale-in">
            <div className="flex flex-col items-center text-center">
              <span className="text-4xl mb-3">💙</span>
              <h3 className="text-base font-extrabold text-momPink-dark">
                Cảnh Báo Dinh Dưỡng An Toàn!
              </h3>

              <div className="mt-3.5 bg-white/90 p-4 rounded-2xl border border-pink-100/60 text-xs text-gray-700 font-semibold leading-relaxed">
                <p className="font-bold text-red-500 flex items-center gap-1 justify-center mb-1">
                  ⚠️ {foodWarningAlert.title}
                </p>
                <p>{foodWarningAlert.message}</p>
              </div>

              {foodWarningAlert.safeAlternatives && foodWarningAlert.safeAlternatives.length > 0 && (
                <div className="mt-4 w-full text-left bg-white/50 p-4 rounded-2xl border border-pink-100/40">
                  <span className="text-[10px] font-extrabold text-momPurple-dark uppercase tracking-wider block mb-2">
                    💡 Thực đơn thay thế an toàn cho mami:
                  </span>
                  <ul className="text-xs text-gray-650 space-y-1 font-bold">
                    {foodWarningAlert.safeAlternatives.slice(0, 3).map((alt, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-momGreen text-[13px]">✓</span> {alt}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowWarningModal(false);
                  setFoodWarningAlert(null);
                }}
                className="mt-6 w-full py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                Đóng và ghi nhận 🌸
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
