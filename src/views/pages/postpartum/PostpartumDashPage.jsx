import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileController as useActualProfileController } from '../../../controllers/profileController';
import postpartumService from '../../../models/services/postpartumService';
import dailyMonitoringService from '../../../models/services/dailyMonitoringService';
import TierGate from '../../components/layout/TierGate';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Baby,
  CalendarCheck,
  CheckCircle2,
  Heart,
  ShieldCheck,
  Smile,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MOODS = [
  { score: 1, emoji: '😔', label: 'Rất mệt' },
  { score: 2, emoji: '😐', label: 'Tạm ổn' },
  { score: 3, emoji: '😊', label: 'Dễ chịu' },
  { score: 4, emoji: '😄', label: 'Vui vẻ' },
  { score: 5, emoji: '💃', label: 'Nhiều năng lượng' },
];

const DAILY_CARE_ITEMS = [
  'Uống đủ nước, ưu tiên bữa ăn ấm và dễ tiêu.',
  'Nghỉ ngơi theo nhịp ngủ của bé, tránh cố gắng quá sức.',
  'Theo dõi sản dịch, vết mổ/vết khâu và nhiệt độ cơ thể.',
];

export default function PostpartumDashPage() {
  const navigate = useNavigate();
  const { momProfile, fetchProfile } = useActualProfileController();
  const [loading, setLoading] = useState(true);
  const [setupMode, setSetupMode] = useState(false);
  const [daysPostpartum, setDaysPostpartum] = useState(0);
  const [recoveryPhase, setRecoveryPhase] = useState('Đang cập nhật');
  const [exerciseSchedule, setExerciseSchedule] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().substring(0, 10));
  const [deliveryType, setDeliveryType] = useState('natural');
  const [isBreastfeeding, setIsBreastfeeding] = useState(true);
  const [submittingSetup, setSubmittingSetup] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [latestEpdsScore, setLatestEpdsScore] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const currentPhase = useMemo(() => {
    if (daysPostpartum <= 7) return 'Tuần 1 - Nghỉ ngơi hoàn toàn';
    if (daysPostpartum <= 42) return 'Tuần 2-6 - Phục hồi nhẹ nhàng';
    return 'Sau 6 tuần - Ổn định lâu dài';
  }, [daysPostpartum]);

  const loadData = async () => {
    setLoading(true);
    try {
      const profile = await fetchProfile();
      if (profile?.deliveryDate) {
        const deliveryTime = new Date(profile.deliveryDate).getTime();
        const diffDays = Math.max(0, Math.floor((Date.now() - deliveryTime) / (1000 * 60 * 60 * 24)));
        setDaysPostpartum(diffDays);

        const recoveryRes = await postpartumService.getRecoveryPlan(diffDays);
        if (recoveryRes.isSuccess && recoveryRes.data) {
          setRecoveryPhase(recoveryRes.data.recoveryPhase || 'Đang phục hồi');
          setExerciseSchedule(recoveryRes.data.exerciseSchedule);
        }

        try {
          const todayRes = await dailyMonitoringService.getTodayMonitoring();
          if (todayRes && (todayRes.isSuccess || todayRes.success || todayRes.Success) && todayRes.data) {
            const entry = todayRes.data.data;
            if (entry?.moodScore) setSelectedMood(entry.moodScore);
          }
        } catch (moodErr) {
          console.error("Error fetching today's mood:", moodErr);
        }

        try {
          const epdsRes = await postpartumService.getLatestEpds();
          if (epdsRes && (epdsRes.isSuccess || epdsRes.success || epdsRes.Success) && epdsRes.data) {
            setLatestEpdsScore(epdsRes.data.score || 0);
          }
        } catch (epdsErr) {
          console.error('Error fetching latest EPDS score:', epdsErr);
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

  const handleSetupSubmit = async (event) => {
    event.preventDefault();
    setSubmittingSetup(true);
    try {
      const res = await postpartumService.setupPostpartum(deliveryDate, deliveryType, isBreastfeeding);
      if (res.isSuccess) {
        toast.success('Khởi tạo hành trình hậu sản thành công!');
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
        moodScore,
        moodNote: label,
      });
      if (res && (res.isSuccess || res.success || res.Success)) {
        toast.success(`Đã ghi nhận cảm xúc "${label}"`);
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
        <div className="h-28 bg-pink-50/70 rounded-3xl" />
        <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
          <div className="space-y-6">
            <div className="h-44 bg-pink-50/60 rounded-3xl" />
            <div className="h-80 bg-pink-50/60 rounded-3xl" />
          </div>
          <div className="h-[520px] bg-pink-50/60 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (setupMode) {
    return (
      <div className="max-w-md mx-auto space-y-6 pt-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-momPink to-momPurple flex items-center justify-center text-white mx-auto shadow-lg">
            <Heart className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-lg font-black text-gray-850 dark:text-white uppercase tracking-wider">
            Khởi động lộ trình hậu sản
          </h2>
          <p className="text-xs text-gray-500 font-semibold max-w-xs mx-auto leading-relaxed">
            Thiết lập thông tin sinh để Mom Ơi cá nhân hóa bài tập phục hồi, gợi ý chăm sóc và theo dõi tinh thần cho mami.
          </p>
        </div>

        <form onSubmit={handleSetupSubmit} className="bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-700/50 p-6 rounded-3xl shadow-sm space-y-5">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ngày sinh của bé</label>
            <input
              type="date"
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-gray-750 dark:bg-gray-900 rounded-xl text-xs font-bold focus:ring-1 focus:ring-momPink/30"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Phương pháp sinh</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'natural', label: 'Sinh thường' },
                { value: 'cesarean', label: 'Sinh mổ' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDeliveryType(option.value)}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 ${
                    deliveryType === option.value
                      ? 'border-momPink bg-momPink-light/35 text-momPink-dark'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center justify-between p-3 bg-pink-50/30 rounded-xl border border-pink-100/25 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-gray-800 dark:text-white">Nuôi con bằng sữa mẹ?</p>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Cá nhân hóa mẹo kích sữa và dinh dưỡng lợi sữa.</p>
            </div>
            <input
              type="checkbox"
              checked={isBreastfeeding}
              onChange={(event) => setIsBreastfeeding(event.target.checked)}
              className="w-4 h-4 text-momPink border-gray-300 rounded focus:ring-momPink"
            />
          </label>

          <button
            type="submit"
            disabled={submittingSetup}
            className="w-full py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-extrabold rounded-xl hover:opacity-95 shadow-md active:scale-95 transition-all disabled:opacity-60"
          >
            {submittingSetup ? 'Đang kích hoạt...' : 'Bắt đầu ngay'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/40 dark:border-gray-700/50 shadow-sm">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-pink-50/80 to-transparent pointer-events-none" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-momPink-dark border border-pink-100 text-[10px] font-black uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Hồi phục hậu sản
            </div>
            <h2 className="text-xl font-black text-gray-850 dark:text-white uppercase tracking-wider flex items-center gap-2">
              Ngày hậu sản thứ {daysPostpartum}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">
              Đồng hành hồi phục thể chất, tinh thần và nhịp chăm bé sau sinh.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 min-w-full lg:min-w-[420px]">
            <div className="rounded-2xl border border-pink-100 bg-pink-50/45 p-3">
              <p className="text-[10px] font-black uppercase text-gray-400">Giai đoạn</p>
              <p className="text-xs font-extrabold text-gray-850 mt-1">{currentPhase}</p>
            </div>
            <div className="rounded-2xl border border-violet-100 bg-violet-50/45 p-3">
              <p className="text-[10px] font-black uppercase text-gray-400">Phục hồi</p>
              <p className="text-xs font-extrabold text-gray-850 mt-1">{recoveryPhase}</p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/55 p-3 col-span-2 sm:col-span-1">
              <p className="text-[10px] font-black uppercase text-gray-400">EPDS</p>
              <p className="text-xs font-extrabold text-gray-850 mt-1">
                {latestEpdsScore === null ? 'Chưa có điểm' : `${latestEpdsScore}/30`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {latestEpdsScore >= 13 && (
        <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-2xl flex items-start gap-3 text-pink-850 dark:bg-pink-950/20 dark:border-pink-900/40 dark:text-pink-300 animate-slide-in">
          <AlertTriangle className="w-5 h-5 text-pink-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">Cảnh báo trầm cảm sau sinh (EPDS từ 13 điểm)</h4>
            <p className="text-[11px] leading-relaxed font-semibold">
              Điểm EPDS cho thấy mami đang chịu áp lực tâm lý lớn. Đừng chịu đựng một mình, hãy kết nối với bác sĩ tâm lý của Mom Ơi hoặc liên hệ Hotline hỗ trợ: 1800 599 920.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-pink-100/50 dark:border-gray-700/50 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">
                  Theo dõi cảm xúc hôm nay
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  Chọn trạng thái gần nhất với cảm xúc hiện tại của mami.
                </p>
              </div>
              <Smile className="w-5 h-5 text-momPink" />
            </div>

            <div className="grid gap-2 pt-1 sm:[grid-template-columns:repeat(5,minmax(0,1fr))] [grid-template-columns:repeat(2,minmax(0,1fr))]">
              {MOODS.map((mood) => (
                <button
                  key={mood.score}
                  onClick={() => logMood(mood.score, mood.label)}
                  className={`group min-h-[82px] rounded-2xl border flex flex-col items-center justify-center gap-1.5 px-2 transition-all duration-300 ${
                    selectedMood === mood.score
                      ? 'border-momPink bg-pink-50 shadow-sm scale-[1.02]'
                      : 'border-pink-100/60 bg-pink-50/20 hover:border-pink-200 hover:bg-pink-50/60'
                  }`}
                  title={mood.label}
                >
                  <span className="text-2xl transition-transform group-hover:scale-110">{mood.emoji}</span>
                  <span className="text-[10px] font-bold text-gray-500 text-center leading-tight">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-pink-100/50 dark:border-gray-700/50 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-pink-50 dark:border-gray-700/50">
              <Activity className="w-5 h-5 text-momPurple" />
              <div>
                <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider">
                  Lộ trình vận động hồi phục
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  Tập luyện an toàn theo từng mốc thời gian hồi sức.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { week: 'Tuần 1', title: 'Kegel & hít thở cơ hoành', desc: 'Hồi phục cơ sàn chậu và kích hoạt tuần hoàn máu sâu vùng chậu.', unlock: daysPostpartum >= 0 },
                { week: 'Tuần 2-5', title: 'Đi bộ nhẹ nhàng', desc: 'Vận động cường độ thấp, hỗ trợ lưu thông máu và giảm căng cứng cơ.', unlock: daysPostpartum >= 7 },
                { week: 'Tuần 6+', title: 'Bài tập cơ bụng sâu', desc: 'Tập trung core nhẹ, chỉ bắt đầu khi cơ thể đã sẵn sàng.', unlock: daysPostpartum >= 42 },
              ].map((item, index) => (
                <div key={item.week} className={`flex gap-3 relative ${index !== 2 ? 'pb-4' : ''}`}>
                  {index !== 2 && <div className="absolute left-4 top-9 bottom-0 w-0.5 bg-pink-100 dark:bg-gray-700" />}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 border ${
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-pink-100/50 dark:border-gray-700/50 shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider">
                  Đánh giá sức khỏe tinh thần
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                  Tầm soát EPDS và theo dõi dấu hiệu cần hỗ trợ.
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
            </div>

            <TierGate requiredTier="MomHienDai">
              <button
                onClick={() => navigate('/postpartum/epds')}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-tr from-pink-50/70 to-pink-100/30 hover:from-pink-100/55 border border-pink-200/60 rounded-2xl text-left transition shadow-sm"
              >
                <div className="space-y-1 pr-3">
                  <h4 className="text-xs font-extrabold text-pink-700 dark:text-pink-300">Tầm soát trầm cảm EPDS</h4>
                  <p className="text-[10px] text-gray-500 font-semibold leading-relaxed">
                    Khảo sát 10 câu hỏi chuẩn y khoa để tự đánh giá sức khỏe tâm lý sau sinh.
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-pink-500 shrink-0" />
              </button>
            </TierGate>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-pink-100/50 dark:border-gray-700/50 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-momPink" />
              <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider">
                Nhắc việc chăm sóc hôm nay
              </h3>
            </div>

            <div className="space-y-3">
              {DAILY_CARE_ITEMS.map((item) => (
                <div key={item} className="flex items-start gap-2.5 rounded-2xl bg-pink-50/45 border border-pink-100/60 p-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-gray-600 font-semibold leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-violet-50 via-white to-pink-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800 rounded-3xl p-5 border border-violet-100/70 dark:border-gray-700/50 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-momPurple" />
              <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider">
                Theo dõi bé yêu
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/80 border border-violet-100 p-3">
                <p className="text-[10px] font-black uppercase text-gray-400">Cữ bú</p>
                <p className="text-lg font-black text-gray-850 mt-1">6-8</p>
                <p className="text-[9px] text-gray-400 font-semibold">lần/ngày</p>
              </div>
              <div className="rounded-2xl bg-white/80 border border-violet-100 p-3">
                <p className="text-[10px] font-black uppercase text-gray-400">Tã ướt</p>
                <p className="text-lg font-black text-gray-850 mt-1">5+</p>
                <p className="text-[9px] text-gray-400 font-semibold">lần/ngày</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
              Nếu bé bú kém, ngủ li bì, sốt hoặc vàng da tăng nhanh, mami nên liên hệ bác sĩ để được hướng dẫn kịp thời.
            </p>
          </div>

          <div className="rounded-3xl p-5 border border-emerald-100 bg-emerald-50/60 shadow-sm flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-gray-850 uppercase tracking-wider">Cần hỗ trợ ngay?</h3>
              <p className="text-[11px] text-gray-600 font-semibold leading-relaxed mt-1">
                Khi có chảy máu nhiều, sốt cao, đau tăng nhanh hoặc ý nghĩ làm hại bản thân, hãy gọi người thân và liên hệ cơ sở y tế gần nhất.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
