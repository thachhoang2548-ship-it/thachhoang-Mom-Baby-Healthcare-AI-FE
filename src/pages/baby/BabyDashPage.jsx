import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { babyApi } from '../../api/babyApi';
import AllergyTracker from '../../components/baby/AllergyTracker';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Baby, Sparkles, AlertTriangle, Calendar, Award, ChevronRight, Activity, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BabyDashPage() {
  const navigate = useNavigate();
  const [babies, setBabies] = useState([]);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hardcoded WHO energy coverage stats for the Radar Chart
  const nutritionData = [
    { subject: 'Calories', value: 85, fullMark: 100 },
    { subject: 'Đạm (Protein)', value: 90, fullMark: 100 },
    { subject: 'Sắt (Iron)', value: 55, fullMark: 100 }, // Under 60% -> highlights alert warning
    { subject: 'Kẽm (Zinc)', value: 70, fullMark: 100 },
    { subject: 'Omega-3', value: 75, fullMark: 100 }
  ];

  // Daily target numbers
  const dailyGoals = {
    calories: 680,
    protein: 11,
    iron: 11,
    zinc: 3,
    omega3: 500
  };

  // 4 meal slots
  const todayMeals = [
    { slot: 'Bữa Sáng ☀️', recipe: 'Bột yến mạch bí đỏ sữa hạt', emoji: '🥣', kcal: 150, time: '07:30' },
    { slot: 'Bữa Trưa 🍲', recipe: 'Cháo loãng thịt bò rau cải ngọt', emoji: '🍲', kcal: 220, time: '11:30' },
    { slot: 'Bữa Chiều 🍌', recipe: 'Chuối nghiền bơ nhuyễn', emoji: '🍌', kcal: 110, time: '15:30' },
    { slot: 'Bữa Tối 🌙', recipe: 'Cháo cá hồi bông cải xanh', emoji: '🥣', kcal: 200, time: '18:30' }
  ];

  useEffect(() => {
    loadBabies();
  }, []);

  const loadBabies = async () => {
    setLoading(true);
    try {
      const res = await babyApi.getProfiles();
      if (res.isSuccess && res.data && res.data.length > 0) {
        setBabies(res.data);
        setSelectedBaby(res.data[0]);
      } else {
        // Redirect to growth charts page to prompt setup if no baby profiles
        setSelectedBaby(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải hồ sơ bé yêu');
    } finally {
      setLoading(false);
    }
  };

  const getWeaningStage = (ageMonths) => {
    if (!ageMonths) return 'Chưa bắt đầu ăn dặm';
    if (ageMonths < 6) return 'Giai đoạn: Sữa mẹ hoàn toàn 🍼';
    if (ageMonths <= 8) return 'Giai đoạn: Bột mịn / Cháo loãng (Ăn dặm ngọt)';
    if (ageMonths <= 12) return 'Giai đoạn: Cháo đặc hạt nhuyễn / Thức ăn nghiền nhuyễn';
    return 'Giai đoạn: Cơm nát / Thức ăn thái nhỏ cắt quân cờ';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-pink-100/50 rounded-3xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-pink-50/50 rounded-3xl"></div>
          <div className="h-64 bg-pink-50/50 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  // If there are no babies, prompt them to go to growth logs setup
  if (!selectedBaby) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 pt-12">
        <div className="w-16 h-16 rounded-full bg-pink-50 text-momPink flex items-center justify-center mx-auto shadow-md">
          <Baby className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-black text-gray-800 dark:text-white uppercase">Chưa thiết lập bé yêu</h3>
          <p className="text-xs text-gray-500 font-semibold max-w-xs mx-auto leading-relaxed">
            Mami chưa thiết lập hồ sơ bé sơ sinh. Vui lòng bấm vào nút dưới đây để tạo hồ sơ và mở khóa các tính năng theo dõi chuẩn WHO.
          </p>
        </div>
        <button
          onClick={() => navigate('/baby-nutrition/growth')}
          className="px-6 py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-extrabold rounded-xl transition hover:opacity-95 shadow active:scale-95"
        >
          Thiết lập hồ sơ bé ngay
        </button>
      </div>
    );
  }

  const ageMonths = selectedBaby.ageMonths || 8;
  const isIronLow = nutritionData.find((d) => d.subject === 'Sắt (Iron)')?.value < 60;

  return (
    <div className="space-y-6">
      
      {/* Baby Info Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/40 dark:border-gray-750 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-momPink to-momPurple flex items-center justify-center text-white text-xl shadow-md font-bold">
            👶
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-850 dark:text-white uppercase tracking-wide">
              Bé {selectedBaby.name} 🧸
            </h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Tuổi: {ageMonths} tháng tuổi
            </p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-momGreen-light/85 text-momGreen-dark text-[10px] font-extrabold rounded-full border border-momGreen-200">
          {getWeaningStage(ageMonths)}
        </span>
      </div>

      {/* Alert Banner: BR07/BR08 (Iron deficiency warning) */}
      {isIronLow && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-2xl flex items-start gap-3 text-amber-950 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-300 animate-slide-in">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">Cảnh báo thiếu hụt vi chất (BR07)</h4>
            <p className="text-[11px] leading-relaxed font-semibold">
              Hôm nay chỉ số Sắt đạt {nutritionData.find((d) => d.subject === 'Sắt (Iron)')?.value}% (dưới 60% nhu cầu khuyến nghị của WHO). Bé có nguy cơ mệt mỏi và chậm tăng trưởng. Hãy bổ sung cháo thịt bò, lòng đỏ trứng nấu chín hoặc rau bina vào cữ ăn tiếp theo.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Shortcuts */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/baby-nutrition/menu')}
          className="py-3.5 bg-gradient-to-r from-momPink to-momPurple hover:opacity-95 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
        >
          <BookOpen className="w-4 h-4" /> Xem Thực Đơn Tuần
        </button>
        <button
          onClick={() => navigate('/baby-nutrition/growth')}
          className="py-3.5 bg-gradient-to-r from-momGreen to-emerald-500 hover:opacity-95 text-white text-xs font-black rounded-2xl flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
        >
          <Activity className="w-4 h-4" /> Chỉ Số Tăng Trưởng
        </button>
      </div>

      {/* Daily goals vs RadarChart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Target Numbers */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/50 dark:border-gray-750 shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">
              Mục tiêu dinh dưỡng chuẩn WHO (Hàng ngày)
            </h3>
            <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Giá trị đề xuất cho trẻ {ageMonths} tháng tuổi</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { label: 'Năng lượng ⚡', value: `${dailyGoals.calories} kcal`, color: 'bg-momPink-light/30 text-momPink-dark' },
              { label: 'Chất đạm (Protein) 🥩', value: `${dailyGoals.protein} g`, color: 'bg-momPurple-light/30 text-momPurple-dark' },
              { label: 'Chất sắt (Iron) 🍳', value: `${dailyGoals.iron} mg`, color: 'bg-momGreen-light/30 text-momGreen-dark' },
              { label: 'Omega-3 🐟', value: `${dailyGoals.omega3} mg`, color: 'bg-momAmber-light/30 text-momAmber-dark' }
            ].map((goal, i) => (
              <div key={i} className={`p-3.5 rounded-2xl flex flex-col justify-between ${goal.color}`}>
                <span className="text-[10px] font-bold uppercase">{goal.label}</span>
                <span className="text-base font-black mt-1.5">{goal.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RadarChart of actual coverages */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/50 dark:border-gray-750 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">
              Tỷ lệ đạt mục tiêu dinh dưỡng hôm nay (%)
            </h3>
            <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Biểu đồ Radar thể hiện mức độ đáp ứng vi chất</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={nutritionData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fontWeight: 'bold', fill: '#475569' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                <Radar name="Bé yêu" dataKey="value" stroke="#FF7A8A" fill="#FF7A8A" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Today's Meal Slots */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/50 dark:border-gray-750 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-gray-880 dark:text-white uppercase tracking-wider">
            Thực đơn gợi ý hôm nay 🥣
          </h3>
          <span className="text-[9px] bg-momPink-light/75 text-momPink-dark px-2.5 py-0.5 rounded-full font-bold">4 Cữ chính</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {todayMeals.map((meal, idx) => (
            <div
              key={idx}
              className="p-3.5 border border-pink-50/50 dark:border-gray-700 bg-pink-50/10 dark:bg-gray-900 rounded-2xl flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{meal.emoji}</span>
                <div>
                  <p className="text-[9px] text-momPink font-black uppercase">{meal.slot}</p>
                  <h4 className="text-xs font-bold text-gray-800 dark:text-white mt-0.5">{meal.recipe}</h4>
                  <p className="text-[9px] text-gray-400 font-semibold mt-0.5">{meal.kcal} kcal | Lúc {meal.time}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  toast.success(`Đang mở chi tiết công thức món: ${meal.recipe}! 📖`);
                }}
                className="text-[10px] font-black text-momPurple hover:text-momPurple-dark flex items-center gap-0.5"
              >
                Xem <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Allergy Tracker embedded below */}
      <AllergyTracker />

    </div>
  );
}
