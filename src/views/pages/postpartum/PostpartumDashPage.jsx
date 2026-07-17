import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileController as useActualProfileController } from '../../../controllers/profileController';
import postpartumService from '../../../models/services/postpartumService';
import dailyMonitoringService from '../../../models/services/dailyMonitoringService';
import FeedingLog from '../../components/postpartum/FeedingLog';
import TierGate from '../../components/layout/TierGate';
import { Heart, Activity, Calendar, Sparkles, Smile, ArrowRight, BookOpen, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PostpartumDashPage() {
  const navigate = useNavigate();
  const { momProfile, fetchProfile } = useActualProfileController();
  const [loading, setLoading] = useState(true);
  const [setupMode, setSetupMode] = useState(false);
  const [daysPostpartum, setDaysPostpartum] = useState(0);
  const [recoveryPhase, setRecoveryPhase] = useState('Đang cập nhật');
  const [exerciseSchedule, setExerciseSchedule] = useState(null);
  
  // Setup fields
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().substring(0, 10));
  const [deliveryType, setDeliveryType] = useState('natural');
  const [isBreastfeeding, setIsBreastfeeding] = useState(true);
  const [submittingSetup, setSubmittingSetup] = useState(false);

  // Mood selector
  const [selectedMood, setSelectedMood] = useState(null);
  
  // Simulated EPDS state
  const [latestEpdsScore, setLatestEpdsScore] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const profile = await fetchProfile();
      if (profile && profile.deliveryDate) {
        const deliveryTime = new Date(profile.deliveryDate).getTime();
        const diffDays = Math.max(0, Math.floor((Date.now() - deliveryTime) / (1000 * 60 * 60 * 24)));
        setDaysPostpartum(diffDays);

        // Fetch recovery schedule from postpartumApi
        const recoveryRes = await postpartumService.getRecoveryPlan(diffDays);
        if (recoveryRes.isSuccess && recoveryRes.data) {
          setRecoveryPhase(recoveryRes.data.recoveryPhase);
          setExerciseSchedule(recoveryRes.data.exerciseSchedule);
        }

        // Fetch today's mood/monitoring entry from backend
        try {
          const todayRes = await dailyMonitoringService.getTodayMonitoring();
          if (todayRes && (todayRes.isSuccess || todayRes.success || todayRes.Success) && todayRes.data) {
            const entry = todayRes.data.data;
            if (entry && entry.moodScore) {
              setSelectedMood(entry.moodScore);
            }
          }
        } catch (moodErr) {
          console.error("Error fetching today's mood:", moodErr);
        }

        // Fetch latest EPDS score from backend
        try {
          const epdsRes = await postpartumService.getLatestEpds();
          if (epdsRes && (epdsRes.isSuccess || epdsRes.success || epdsRes.Success) && epdsRes.data) {
            setLatestEpdsScore(epdsRes.data.score || 0);
          }
        } catch (epdsErr) {
          console.error("Error fetching latest EPDS score:", epdsErr);
        }
      } else {
        setSetupMode(true);
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setSubmittingSetup(true);
    try {
      const res = await postpartumService.setupPostpartum(deliveryDate, deliveryType, isBreastfeeding);
      if (res.isSuccess) {
        toast.success('Khởi tạo hành trình hậu sản thành công! 💙');
        setSetupMode(false);
        await loadData();
      } else {
        toast.error('Có lỗi xảy ra khi lưu thiết lập');
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể lưu thông tin hậu sản');
    } finally {
      setSubmittingSetup(false);
    }
  };

  const logMood = async (moodScore, label) => {
    const previousMood = selectedMood;
    setSelectedMood(moodScore);
    try {
      const res = await dailyMonitoringService.createDailyMonitoring({
        moodScore: moodScore,
        moodNote: label
      });
      if (res && (res.isSuccess || res.success || res.Success)) {
        toast.success(`Ghi nhận cảm xúc "${label}" thành công! 💕`);
      } else {
        toast.error('Không thể lưu cảm xúc');
        setSelectedMood(previousMood);
      }
    } catch (err) {
      console.error('Error logging mood:', err);
      toast.error('Lỗi khi ghi nhận cảm xúc');
      setSelectedMood(previousMood);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-pink-100/50 rounded-xl w-1/3"></div>
        <div className="h-32 bg-pink-50/50 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-pink-50/30 rounded-3xl"></div>
          <div className="h-64 bg-pink-50/30 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  // Setup form if delivery date is not set
  if (setupMode) {
    return (
      <div className="max-w-md mx-auto space-y-6 pt-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-momPink to-momPurple flex items-center justify-center text-white mx-auto shadow-lg">
            <Heart className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-lg font-black text-gray-850 dark:text-white uppercase tracking-wider">
            Khởi Động Lộ Trình Hậu Sản 👶
          </h2>
          <p className="text-xs text-gray-500 font-semibold max-w-xs mx-auto leading-relaxed">
            Chúc mừng mami đã mẹ tròn con vuông! Hãy thiết lập thông tin sinh để cá nhân hóa các bài tập sàn chậu và dinh dưỡng cho bé.
          </p>
        </div>

        <form onSubmit={handleSetupSubmit} className="bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700/50 p-6 rounded-3xl shadow-sm space-y-5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ngày sinh của bé</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-750 dark:bg-gray-900 rounded-xl text-xs font-bold focus:ring-1 focus:ring-momPink/30"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Phương pháp sinh</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('natural')}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
                  deliveryType === 'natural'
                    ? 'border-momPink bg-momPink-light/35 text-momPink-dark'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Sinh Thường 🕊️
              </button>
              <button
                type="button"
                onClick={() => setDeliveryType('cesarean')}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
                  deliveryType === 'cesarean'
                    ? 'border-momPink bg-momPink-light/35 text-momPink-dark'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                Sinh Mổ 🩺
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-pink-50/30 rounded-xl border border-pink-100/25">
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-white">Nuôi con bằng sữa mẹ?</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Cung cấp mẹo kích sữa & dinh dưỡng lợi sữa</p>
            </div>
            <input
              type="checkbox"
              checked={isBreastfeeding}
              onChange={(e) => setIsBreastfeeding(e.target.checked)}
              className="w-4 h-4 text-momPink border-gray-300 rounded focus:ring-momPink"
            />
          </div>

          <button
            type="submit"
            disabled={submittingSetup}
            className="w-full py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-extrabold rounded-xl hover:opacity-95 shadow-md active:scale-95 transition-all"
          >
            {submittingSetup ? 'Đang kích hoạt...' : 'Bắt đầu ngay'}
          </button>
        </form>
      </div>
    );
  }

  // Get phase description
  const getPhaseName = () => {
    if (daysPostpartum <= 7) return 'Tuần 1 – Nghỉ ngơi hoàn toàn 🛌';
    if (daysPostpartum <= 42) return 'Tuần 2 - 6 – Phục hồi vết thương 🚶‍♀️';
    return 'Sau 6 tuần – Ổn định lâu dài 🍃';
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Phase Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/40 dark:border-gray-700/50 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-gray-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            Ngày Hậu Sản Thứ {daysPostpartum} 💙
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">
            Đồng hành hồi phục thể chất & tinh thần mami sau sinh
          </p>
        </div>
        <span className="self-start sm:self-center px-4 py-1.5 bg-momPink-light/75 text-momPink-dark text-xs font-extrabold rounded-full border border-pink-200">
          {getPhaseName()}
        </span>
      </div>

      {/* EPDS alert banner simulated if critical */}
      {latestEpdsScore >= 13 && (
        <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-2xl flex items-start gap-3 text-pink-850 dark:bg-pink-950/20 dark:border-pink-900/40 dark:text-pink-300 animate-slide-in">
          <AlertTriangle className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">Cảnh báo trầm cảm sau sinh (EPDS ≥ 13)</h4>
            <p className="text-[11px] leading-relaxed font-semibold">
              Điểm số EPDS của bạn cho thấy bạn đang trải qua những áp lực tâm lý lớn. Đừng chịu đựng một mình, mami hãy kết nối ngay với bác sĩ tâm lý của Mom Ơi! hoặc liên hệ Hotline hỗ trợ: 1800 599 920.
            </p>
          </div>
        </div>
      )}

      {/* Two Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left column: Mood Check & Recovery Schedule */}
        <div className="space-y-6">
          
          {/* Mood Check Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-pink-100/50 dark:border-gray-700/50 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">
                Theo dõi cảm xúc hôm nay 🌸
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                Hãy cho Mom Ơi! biết sức khỏe tinh thần của bạn thế nào
              </p>
            </div>
            
            <div className="flex justify-around items-center pt-2">
              {[
                { score: 1, emoji: '😔', label: 'Rất tệ' },
                { score: 2, emoji: '😐', label: 'Tạm ổn' },
                { score: 3, emoji: '😊', label: 'Vui vẻ' },
                { score: 4, emoji: '😄', label: 'Hạnh phúc' },
                { score: 5, emoji: '💃', label: 'Tràn đầy năng lượng' }
              ].map((m) => (
                <button
                  key={m.score}
                  onClick={() => logMood(m.score, m.label)}
                  className={`w-12 h-12 rounded-full text-2xl flex items-center justify-center transition-all duration-300 hover:scale-125 hover:shadow-md ${
                    selectedMood === m.score ? 'bg-pink-100 scale-120 shadow' : 'bg-pink-50/20'
                  }`}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Recovery Exercise Timeline Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-pink-100/50 dark:border-gray-700/50 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-pink-50 dark:border-gray-700/50">
              <Activity className="w-5 h-5 text-momPurple" />
              <div>
                <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider">
                  Lộ Trình Vận Động Hồi Phục 🧘‍♀️
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  Tập luyện an toàn theo từng mốc thời gian hồi sức
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { week: 'Tuần 1', title: 'Kegel & Hít thở cơ hoành', desc: 'Hồi phục cơ sàn chậu và kích hoạt tuần hoàn máu sâu vùng chậu.', unlock: daysPostpartum >= 0 },
                { week: 'Tuần 2 - 5', title: 'Đi bộ nhẹ nhàng', desc: 'Vận động cường độ cực thấp ngăn ngừa đông máu tĩnh mạch.', unlock: daysPostpartum >= 7 },
                { week: 'Tuần 6+', title: 'Bài tập cơ bụng sâu (Core)', desc: 'Thu nhỏ khoảng cách sổ cơ thành bụng một cách bài bản.', unlock: daysPostpartum >= 42 }
              ].map((item, index) => (
                <div key={index} className={`flex gap-3 relative ${index !== 2 ? 'pb-4' : ''}`}>
                  {index !== 2 && (
                    <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-pink-100 dark:bg-gray-700"></div>
                  )}
                  <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 border ${
                    item.unlock 
                      ? 'bg-momPink-light/80 text-momPink-dark border-pink-250' 
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}>
                    {item.week}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className={`text-xs font-extrabold ${item.unlock ? 'text-gray-800 dark:text-white' : 'text-gray-450 dark:text-gray-500'}`}>
                        {item.title}
                      </h4>
                      {!item.unlock && (
                        <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full font-bold">Khóa</span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-550 dark:text-gray-400 font-semibold mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {exerciseSchedule && (
              <div className="mt-3 p-3 bg-momPurple-light/25 border border-momPurple/20 rounded-2xl">
                <span className="text-[8px] font-black bg-momPurple-dark text-white px-2 py-0.5 rounded-full uppercase">Đề xuất hôm nay</span>
                <p className="text-xs font-semibold text-momPurple-dark mt-2 leading-relaxed">
                  {exerciseSchedule.activeExercise}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Breastfeeding & Screening Gated Features */}
        <div className="space-y-6">
          
          {/* Breastfeeding Tracker (Gated MomHienDai) */}
          <TierGate requiredTier="MomHienDai">
            <FeedingLog />
          </TierGate>

          {/* Screening & Dialog Cards */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-pink-100/50 dark:border-gray-700/50 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider">
                Đánh giá sức khỏe tinh thần 🧠
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                Các phương pháp tầm soát lâm sàng và phân tích cảm xúc
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              
              {/* EPDS Assessment Button (Gated MomHienDai) */}
              <TierGate requiredTier="MomHienDai">
                <button
                  onClick={() => navigate('/postpartum/epds')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-tr from-pink-50/50 to-pink-100/20 hover:from-pink-100/35 border border-pink-200/55 rounded-2xl text-left transition shadow-sm"
                >
                  <div className="space-y-0.5 max-w-[200px]">
                    <h4 className="text-xs font-extrabold text-pink-700 dark:text-pink-300">Tầm soát trầm cảm EPDS</h4>
                    <p className="text-[9px] text-gray-500 font-semibold leading-relaxed">Khảo sát 10 câu hỏi chuẩn y khoa để tự đánh giá sức khỏe tâm lý.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-pink-500" />
                </button>
              </TierGate>

              {/* AI Voice Journal (Gated SuperMomVip) */}
              <TierGate requiredTier="SuperMomVip">
                <button
                  onClick={() => navigate('/postpartum/voice')}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-tr from-purple-50/50 to-purple-100/20 hover:from-purple-100/35 border border-momPurple/20 rounded-2xl text-left transition shadow-sm"
                >
                  <div className="space-y-0.5 max-w-[200px]">
                    <h4 className="text-xs font-extrabold text-momPurple-dark">Nhật ký giọng nói AI 🎙️</h4>
                    <p className="text-[9px] text-gray-500 font-semibold leading-relaxed">Ghi âm cảm xúc và trò chuyện với Gemini để phân tích tâm trạng tức thì.</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-momPurple-dark" />
                </button>
              </TierGate>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
