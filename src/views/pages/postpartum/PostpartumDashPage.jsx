import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthController } from '../../../controllers/authController';
import { useProfileController as useActualProfileController } from '../../../controllers/profileController';
import postpartumService from '../../../models/services/postpartumService';
import dailyMonitoringService from '../../../models/services/dailyMonitoringService';
import TierGate from '../../components/layout/TierGate';
import MomAvatar from '../../components/avatar/MomAvatar';
import { useMomAvatar } from '../../../hooks/useMomAvatar';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Baby,
  CalendarCheck,
  CheckCircle2,
  Heart,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Loader2,
  Clock,
  Droplets,
  Moon,
  Footprints,
  PhoneCall,
  Frown,
  Meh,
  Smile,
  Laugh,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MOODS = [
  { score: 1, label: 'Rất mệt', icon: Frown },
  { score: 2, label: 'Tạm ổn', icon: Meh },
  { score: 3, label: 'Dễ chịu', icon: Smile },
  { score: 4, label: 'Vui vẻ', icon: Laugh },
  { score: 5, label: 'Nhiều năng lượng', icon: Zap },
];

const DAILY_CARE_ITEMS = [
  'Uống đủ nước, ưu tiên bữa ăn ấm và dễ tiêu.',
  'Nghỉ ngơi theo nhịp ngủ của bé, tránh cố gắng quá sức.',
  'Theo dõi sản dịch, vết mổ/vết khâu và nhiệt độ cơ thể.',
];

export default function PostpartumDashPage() {
  const navigate = useNavigate();
  const { user } = useAuthController();
  const { avatar } = useMomAvatar(user);
  const { fetchProfile } = useActualProfileController();
  const [loading, setLoading] = useState(true);
  const [setupMode, setSetupMode] = useState(false);
  const [daysPostpartum, setDaysPostpartum] = useState(0);
  const [recoveryPhase, setRecoveryPhase] = useState('Đang cập nhật');
  const [exerciseSchedule, setExerciseSchedule] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().substring(0, 10));
  const [deliveryType, setDeliveryType] = useState('natural');
  const [isBreastfeeding, setIsBreastfeeding] = useState(true);
  const [submittingSetup, setSubmittingSetup] = useState(false);
  const [selectedMood, setSelectedMood] = useState(null);
  const [latestEpdsScore, setLatestEpdsScore] = useState(null);

  // Số thứ tự lượt tải để tránh race condition khi gọi API bất đồng bộ
  const loadSeqRef = useRef(0);

  const loadData = useCallback(async () => {
    const currentSeq = ++loadSeqRef.current;
    setLoading(true);
    try {
      const profile = await fetchProfile();
      if (currentSeq !== loadSeqRef.current) return;

      if (profile?.deliveryDate) {
        const deliveryTime = new Date(profile.deliveryDate).getTime();
        const diffDays = Math.max(0, Math.floor((Date.now() - deliveryTime) / (1000 * 60 * 60 * 24)));
        setDaysPostpartum(diffDays);

        const recoveryRes = await postpartumService.getRecoveryPlan(diffDays);
        if (currentSeq !== loadSeqRef.current) return;
        if (recoveryRes && recoveryRes.isSuccess && recoveryRes.data) {
          setRecoveryPhase(recoveryRes.data.recoveryPhase || 'Đang phục hồi');
          setExerciseSchedule(recoveryRes.data.exerciseSchedule || null);
        }

        try {
          const todayRes = await dailyMonitoringService.getTodayMonitoring();
          if (currentSeq !== loadSeqRef.current) return;
          if (todayRes && (todayRes.isSuccess || todayRes.success || todayRes.Success) && todayRes.data) {
            const entry = todayRes.data.data;
            if (entry?.moodScore) setSelectedMood(entry.moodScore);
          }
        } catch (moodErr) {
          console.error("Error fetching today's mood:", moodErr);
        }

        try {
          const epdsRes = await postpartumService.getLatestEpds();
          if (currentSeq !== loadSeqRef.current) return;
          if (epdsRes && (epdsRes.isSuccess || epdsRes.success || epdsRes.Success) && epdsRes.data) {
            setLatestEpdsScore(epdsRes.data.score ?? null);
          }
        } catch (epdsErr) {
          console.error('Error fetching latest EPDS score:', epdsErr);
        }
      } else {
        setSetupMode(true);
      }
    } catch (err) {
      if (currentSeq !== loadSeqRef.current) return;
      console.error(err);
      toast.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      if (currentSeq === loadSeqRef.current) {
        setLoading(false);
      }
    }
  }, [fetchProfile]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentPhase = useMemo(() => {
    if (daysPostpartum <= 7) return 'Tuần 1 - Nghỉ ngơi hoàn toàn';
    if (daysPostpartum <= 42) return 'Tuần 2-6 - Phục hồi nhẹ nhàng';
    return 'Sau 6 tuần - Ổn định lâu dài';
  }, [daysPostpartum]);

  const handleSetupSubmit = async (event) => {
    event.preventDefault();
    setSubmittingSetup(true);
    try {
      const res = await postpartumService.setupPostpartum(deliveryDate, deliveryType, isBreastfeeding);
      if (res && res.isSuccess) {
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

  // 1. Trạng thái Đang tải dữ liệu (Loading skeleton sạch sẽ)
  if (loading) {
    return (
      <div className="font-display space-y-6 pb-8">
        <div className="rounded-3xl border border-theme-line bg-theme-surface p-8 text-center space-y-3">
          <Loader2 className="w-7 h-7 mx-auto text-theme-ink animate-spin motion-reduce:animate-none" aria-hidden="true" />
          <p className="text-sm font-bold text-theme-ink">Đang tải hành trình phục hồi của mẹ...</p>
        </div>
      </div>
    );
  }

  // 2. Trạng thái Thiết lập thông tin hậu sản (Setup Mode)
  if (setupMode) {
    return (
      <div className="font-display pb-8">
        <div className="max-w-md mx-auto space-y-6 py-4">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-theme-brand-soft text-theme-brand border border-theme-line flex items-center justify-center mx-auto">
              <Heart className="w-6 h-6" aria-hidden="true" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-theme-ink">
              Khởi động lộ trình hậu sản
            </h1>
            <p className="text-xs sm:text-sm text-theme-muted font-medium max-w-sm mx-auto leading-relaxed">
              Thiết lập thông tin sinh để Mom Ơi! cá nhân hóa bài tập phục hồi, gợi ý chăm sóc và theo dõi tinh thần cho mami.
            </p>
          </div>

          <form onSubmit={handleSetupSubmit} className="bg-theme-surface border border-theme-line p-5 sm:p-6 rounded-2xl shadow-sm space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="delivery-date-input" className="text-xs font-bold text-theme-ink block">
                Ngày sinh của bé
              </label>
              <input
                id="delivery-date-input"
                type="date"
                value={deliveryDate}
                onChange={(event) => setDeliveryDate(event.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 border border-theme-line bg-theme-page rounded-2xl text-xs sm:text-sm font-bold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
                required
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-theme-ink block">Phương pháp sinh</span>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'natural', label: 'Sinh thường' },
                  { value: 'cesarean', label: 'Sinh mổ' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDeliveryType(option.value)}
                    className={`min-h-[44px] py-2.5 px-3 rounded-2xl text-xs sm:text-sm font-bold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                      deliveryType === option.value
                        ? 'border-theme-brand bg-theme-brand text-theme-surface'
                        : 'border-theme-line bg-theme-page hover:bg-theme-sidebar text-theme-ink'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start justify-between gap-3 p-3.5 bg-theme-page rounded-2xl border border-theme-line cursor-pointer hover:bg-theme-sidebar transition-colors">
              <div className="space-y-0.5">
                <p className="text-xs sm:text-sm font-bold text-theme-ink">Nuôi con bằng sữa mẹ?</p>
                <p className="text-xs text-theme-muted font-medium">Cá nhân hóa mẹo kích sữa và dinh dưỡng lợi sữa.</p>
              </div>
              <input
                type="checkbox"
                checked={isBreastfeeding}
                onChange={(event) => setIsBreastfeeding(event.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-theme-line text-theme-brand focus:ring-theme-brand"
              />
            </label>

            <button
              type="submit"
              disabled={submittingSetup}
              className="w-full min-h-[44px] py-3 bg-theme-brand hover:bg-theme-ink text-theme-surface text-xs sm:text-sm font-bold rounded-2xl shadow-sm transition-colors disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              {submittingSetup ? 'Đang kích hoạt...' : 'Bắt đầu ngay'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const activeMoodLabel = MOODS.find((item) => item.score === selectedMood)?.label || '';

  // 3. Trạng thái Dashboard chính
  return (
    <div className="font-display space-y-6 pb-8 text-theme-ink">
      {/* 3.1. Hero Banner: Hành trình phục hồi của mẹ là trung tâm, đi kèm nhân vật của mẹ */}
      <section className="overflow-hidden rounded-3xl border border-theme-line bg-theme-surface shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="flex flex-col justify-between gap-5 p-5 sm:p-7 lg:col-span-8">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-theme-brand-soft px-3 py-1 text-xs font-bold text-theme-ink">
                <Sparkles className="h-3.5 w-3.5 text-theme-brand" aria-hidden="true" />
                <span>Hồi phục hậu sản</span>
              </div>
              <h1 className="text-2xl font-bold text-theme-ink sm:text-3xl">
                Ngày hậu sản thứ {daysPostpartum}
              </h1>
              <p className="max-w-2xl text-xs font-medium leading-relaxed text-theme-muted sm:text-sm">
                Đồng hành hồi phục thể chất, tinh thần và nhịp chăm sóc bé sau sinh.
              </p>
            </div>

            {/* Ba chỉ số trạng thái phục hồi */}
            <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3">
              <div className="space-y-1 rounded-2xl border border-theme-line bg-theme-page p-3.5">
                <span className="block text-xs font-semibold text-theme-muted">Giai đoạn</span>
                <p className="text-xs font-bold leading-snug text-theme-ink sm:text-sm">{currentPhase}</p>
              </div>
              <div className="space-y-1 rounded-2xl border border-theme-line bg-theme-page p-3.5">
                <span className="block text-xs font-semibold text-theme-muted">Phục hồi</span>
                <p className="text-xs font-bold leading-snug text-theme-ink sm:text-sm">{recoveryPhase}</p>
              </div>
              <div className="col-span-2 space-y-1 rounded-2xl border border-theme-line bg-theme-page p-3.5 sm:col-span-1">
                <span className="block text-xs font-semibold text-theme-muted">EPDS tâm lý</span>
                <p className="text-xs font-bold leading-snug text-theme-ink sm:text-sm">
                  {latestEpdsScore === null ? 'Chưa có điểm' : `${latestEpdsScore}/30`}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 border-t border-theme-line bg-theme-page p-5 text-center lg:col-span-4 lg:border-l lg:border-t-0">
            <div className="h-28 w-28 overflow-hidden rounded-3xl border border-theme-line bg-theme-surface shadow-sm sm:h-32 sm:w-32">
              <MomAvatar
                config={avatar}
                mood={activeMoodLabel}
                variant="scene"
                className="h-full w-full"
                label="Nhân vật minh họa của mẹ"
              />
            </div>
            <p className="text-xs font-semibold text-theme-muted">
              {activeMoodLabel
                ? `Hôm nay mẹ thấy: ${activeMoodLabel.toLowerCase()}`
                : 'Lắng nghe cơ thể mỗi ngày nhé mẹ'}
            </p>
          </div>
        </div>
      </section>

      {/* 3.2. Cảnh báo tâm lý EPDS nếu điểm >= 13 */}
      {latestEpdsScore !== null && latestEpdsScore >= 13 && (
        <section
          role="alert"
          aria-label="Cảnh báo trầm cảm sau sinh"
          className="rounded-2xl border border-status-warn-line bg-status-warn-bg p-4 sm:p-5 text-status-warn-text space-y-2 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-status-warn-text" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold">Cảnh báo trầm cảm sau sinh (EPDS từ 13 điểm)</h2>
            <p className="text-xs sm:text-sm font-medium leading-relaxed">
              Điểm EPDS cho thấy mami đang chịu áp lực tâm lý lớn. Đừng chịu đựng một mình, hãy kết nối với bác sĩ tâm lý của Mom Ơi! hoặc liên hệ Hotline hỗ trợ: 1800 599 920.
            </p>
          </div>
        </section>
      )}

      {/* 3.3. Lưới nội dung 2 cột: Cột trái (Vận động, cảm xúc) - Cột phải (Tinh thần, chăm sóc, an toàn) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 items-start">
        {/* CỘT TRÁI */}
        <div className="space-y-6">
          {/* Lộ trình vận động hồi phục theo tuần */}
          <section className="bg-theme-surface rounded-2xl p-5 sm:p-6 border border-theme-line shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-theme-line">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-theme-ink">Lộ trình vận động hồi phục</h2>
                  <p className="text-xs text-theme-muted font-medium">Tập luyện an toàn theo từng mốc thời gian hồi sức.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  week: 'Tuần 1',
                  title: 'Kegel & hít thở cơ hoành',
                  desc: 'Hồi phục cơ sàn chậu và kích hoạt tuần hoàn máu sâu vùng chậu.',
                  unlock: daysPostpartum >= 0,
                },
                {
                  week: 'Tuần 2-5',
                  title: 'Đi bộ nhẹ nhàng',
                  desc: 'Vận động cường độ thấp, hỗ trợ lưu thông máu và giảm căng cứng cơ.',
                  unlock: daysPostpartum >= 7,
                },
                {
                  week: 'Tuần 6+',
                  title: 'Bài tập cơ bụng sâu',
                  desc: 'Tập trung core nhẹ, chỉ bắt đầu khi cơ thể đã sẵn sàng.',
                  unlock: daysPostpartum >= 42,
                },
              ].map((item, index) => (
                <div key={item.week} className="flex items-start gap-3 relative">
                  {index !== 2 && (
                    <div className="absolute left-4 top-9 bottom-0 w-0.5 bg-theme-line" aria-hidden="true" />
                  )}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border transition-colors ${
                      item.unlock
                        ? 'bg-theme-brand-soft text-theme-brand border-theme-brand'
                        : 'bg-theme-sidebar text-theme-muted border-theme-line'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-theme-muted">{item.week}:</span>
                      <h3 className="text-xs sm:text-sm font-bold text-theme-ink">{item.title}</h3>
                      {!item.unlock && (
                        <span className="text-xs bg-theme-sidebar border border-theme-line text-theme-muted px-2 py-0.5 rounded-md font-semibold">
                          Chưa đến mốc
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-theme-muted font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Đề xuất vận động hôm nay từ API */}
            {exerciseSchedule?.activeExercise && (
              <div className="rounded-2xl p-4 bg-theme-page border border-theme-line space-y-1.5">
                <span className="inline-block text-xs font-bold text-theme-brand bg-theme-brand-soft px-2.5 py-0.5 rounded-md">
                  Đề xuất hôm nay
                </span>
                <p className="text-xs sm:text-sm font-semibold text-theme-ink leading-relaxed">
                  {exerciseSchedule.activeExercise}
                </p>
              </div>
            )}
          </section>

          {/* Theo dõi cảm xúc hôm nay */}
          <section className="bg-theme-surface rounded-2xl p-5 sm:p-6 border border-theme-line shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-theme-ink">Theo dõi cảm xúc hôm nay</h2>
                <p className="text-xs text-theme-muted font-medium mt-0.5">
                  Chọn trạng thái gần nhất với cảm xúc hiện tại của mami.
                </p>
              </div>
              <div className="w-8 h-8 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
                <Smile className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
              {MOODS.map((mood) => {
                const MoodIcon = mood.icon;
                const isSelected = selectedMood === mood.score;
                return (
                  <button
                    key={mood.score}
                    type="button"
                    onClick={() => logMood(mood.score, mood.label)}
                    className={`min-h-[76px] rounded-2xl border p-3 flex flex-col items-center justify-center gap-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                      isSelected
                        ? 'border-theme-brand bg-theme-brand text-theme-surface'
                        : 'border-theme-line bg-theme-page hover:bg-theme-sidebar text-theme-ink'
                    }`}
                    title={mood.label}
                  >
                    <MoodIcon className={`w-5 h-5 ${isSelected ? 'text-theme-surface' : 'text-theme-brand'}`} aria-hidden="true" />
                    <span className="text-xs font-bold text-center leading-tight">{mood.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Nhịp hồi phục của mami (Nghỉ ngơi, nước, vận động) */}
          <section className="bg-theme-surface rounded-2xl p-5 sm:p-6 border border-theme-line shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-theme-ink">Nhịp hồi phục của mami</h2>
                <p className="text-xs text-theme-muted font-medium mt-0.5">
                  Những mốc nhỏ tham khảo giúp một ngày hậu sản nhẹ nhàng hơn.
                </p>
              </div>
              <div className="w-8 h-8 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4" aria-hidden="true" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { title: 'Nghỉ ngơi', value: '2-3', note: 'giấc ngắn', icon: Moon },
                { title: 'Uống nước', value: '2L', note: 'chia đều ngày', icon: Droplets },
                { title: 'Vận động', value: '10-15', note: 'phút nhẹ', icon: Footprints },
              ].map((item) => {
                const ItemIcon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl bg-theme-page border border-theme-line p-3.5 space-y-1">
                    <div className="flex items-center justify-between text-theme-muted">
                      <span className="text-xs font-semibold">{item.title}</span>
                      <ItemIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    </div>
                    <p className="text-lg font-bold text-theme-ink">{item.value}</p>
                    <p className="text-xs text-theme-muted font-medium">{item.note}</p>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl bg-theme-page border border-theme-line p-3.5 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-status-ok shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-xs text-theme-ink font-medium leading-relaxed">
                Nếu hôm nay mami chỉ làm được một việc, hãy ưu tiên ăn một bữa đủ chất và ngủ bù khi bé ngủ.
              </p>
            </div>
          </section>
        </div>

        {/* CỘT PHẢI */}
        <div className="space-y-6">
          {/* Đánh giá sức khỏe tinh thần (EPDS Gate) */}
          <section className="bg-theme-surface rounded-2xl p-5 sm:p-6 border border-theme-line shadow-sm space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-theme-ink">Đánh giá sức khỏe tinh thần</h2>
                <p className="text-xs text-theme-muted font-medium mt-0.5">
                  Tầm soát EPDS và theo dõi dấu hiệu cần hỗ trợ.
                </p>
              </div>
              <div className="w-8 h-8 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-status-ok" aria-hidden="true" />
              </div>
            </div>

            <TierGate requiredTier="MomHienDai">
              <button
                type="button"
                onClick={() => navigate('/postpartum/epds')}
                className="w-full flex items-center justify-between p-4 bg-theme-page hover:bg-theme-sidebar border border-theme-line rounded-2xl text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand group"
              >
                <div className="space-y-1 pr-3">
                  <h3 className="text-xs sm:text-sm font-bold text-theme-ink group-hover:text-theme-brand transition-colors">
                    Tầm soát trầm cảm sau sinh (EPDS)
                  </h3>
                  <p className="text-xs text-theme-muted font-medium leading-relaxed">
                    Khảo sát 10 câu hỏi để tự đánh giá sức khỏe tâm lý sau sinh.
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-theme-brand shrink-0" aria-hidden="true" />
              </button>
            </TierGate>
          </section>

          {/* Nhắc việc chăm sóc hôm nay */}
          <section className="bg-theme-surface rounded-2xl p-5 sm:p-6 border border-theme-line shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-theme-line">
              <div className="w-8 h-8 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
                <CalendarCheck className="w-4 h-4" aria-hidden="true" />
              </div>
              <h2 className="text-base font-bold text-theme-ink">Nhắc việc chăm sóc hôm nay</h2>
            </div>

            <div className="space-y-2.5">
              {DAILY_CARE_ITEMS.map((item) => (
                <div key={item} className="flex items-start gap-2.5 rounded-2xl bg-theme-page border border-theme-line p-3.5">
                  <CheckCircle2 className="w-4 h-4 text-status-ok shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs sm:text-sm text-theme-ink font-medium leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Theo dõi bé yêu (Tham khảo nhịp sinh hoạt) */}
          <section className="bg-theme-surface rounded-2xl p-5 sm:p-6 border border-theme-line shadow-sm space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
                <Baby className="w-4 h-4" aria-hidden="true" />
              </div>
              <h2 className="text-base font-bold text-theme-ink">Theo dõi bé yêu (Tham khảo)</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-theme-page border border-theme-line p-3.5 space-y-1">
                <span className="text-xs font-semibold text-theme-muted block">Cữ bú</span>
                <p className="text-lg font-bold text-theme-ink">6-8</p>
                <p className="text-xs text-theme-muted font-medium">lần/ngày</p>
              </div>
              <div className="rounded-2xl bg-theme-page border border-theme-line p-3.5 space-y-1">
                <span className="text-xs font-semibold text-theme-muted block">Tã ướt</span>
                <p className="text-lg font-bold text-theme-ink">5+</p>
                <p className="text-xs text-theme-muted font-medium">lần/ngày</p>
              </div>
            </div>
            <p className="text-xs text-theme-muted font-medium leading-relaxed">
              Nếu bé bú kém, ngủ li bì, sốt hoặc vàng da tăng nhanh, mami nên liên hệ bác sĩ để được hướng dẫn kịp thời.
            </p>
          </section>

          {/* Khối Cần hỗ trợ ngay? (An toàn y tế) */}
          <section className="rounded-2xl p-4 sm:p-5 border border-status-warn-line bg-status-warn-bg text-status-warn-text shadow-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-2xl bg-theme-surface text-status-warn-text border border-status-warn-line flex items-center justify-center shrink-0">
              <Stethoscope className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xs sm:text-sm font-bold">Cần hỗ trợ ngay?</h2>
              <p className="text-xs sm:text-sm font-medium leading-relaxed">
                Khi có chảy máu nhiều, sốt cao, đau tăng nhanh hoặc ý nghĩ làm hại bản thân, hãy gọi người thân và liên hệ cơ sở y tế gần nhất.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
