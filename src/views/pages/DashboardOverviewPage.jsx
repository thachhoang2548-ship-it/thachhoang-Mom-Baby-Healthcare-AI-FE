import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthController } from '../../controllers/authController';
import { useProfileController } from '../../controllers/profileController';
import { getTierNameVi } from '../../utils/tierHelpers';
import {
  Heart,
  Calendar,
  Baby,
  MessageSquare,
  Activity,
  Sparkles,
  Droplet,
  Compass,
  Smile,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardOverviewPage() {
  const { user, tier } = useAuthController();
  const { journeyStage, momProfile } = useProfileController();
  const navigate = useNavigate();

  // Local state for interactive daily check-in
  const [waterCups, setWaterCups] = useState(0);
  const [mood, setMood] = useState('');
  const [weight, setWeight] = useState('');
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const handleWaterAdd = () => {
    if (waterCups < 12) {
      setWaterCups((prev) => prev + 1);
      toast.success('Đã thêm 1 cốc nước! Giữ đủ nước mẹ nhé 💧');
    }
  };

  const handleCheckInSubmit = (e) => {
    e.preventDefault();
    setHasCheckedIn(true);
    toast.success('Ghi nhận sức khỏe hôm nay thành công! 🌸');
  };

  // Stage details mapping
  const getStageContent = () => {
    switch (journeyStage) {
      case 'PrePregnancy':
        return {
          title: 'Kế hoạch thụ thai an toàn',
          desc: 'Quản lý chu kỳ kinh nguyệt tự động, dự đoán ngày rụng trứng và cơ hội thụ thai bằng thuật toán AI.',
          badge: 'Giai đoạn thụ thai',
          color: 'from-pink-500 to-rose-450',
          icon: Calendar,
          actions: [
            { label: 'Lịch rụng trứng', path: '/fertility' },
          ],
        };
      case 'Pregnant':
        return {
          title: 'Đồng hành thai kỳ hạnh phúc',
          desc: 'Theo dõi sự phát triển của thai nhi theo từng tuần, lập thực đơn ăn uống và các bài tập yoga an toàn cho mẹ bầu.',
          badge: 'Giai đoạn thai kỳ',
          color: 'from-purple-500 to-indigo-500',
          icon: Heart,
          actions: [
            { label: 'Nhật ký thai kỳ', path: '/pregnancy' },
            { label: 'Thực đơn mẹ bầu', path: '/pregnancy/meals' },
            { label: 'Thực đơn thông minh AI', path: '/diet-recipes' },
            { label: 'Bài tập thai giáo', path: '/pregnancy/exercises' },
          ],
        };
      case 'Postpartum':
        return {
          title: 'Hồi phục sau sinh & Chăm bé',
          desc: 'Theo dõi sự phục hồi của mẹ, đánh giá tâm lý EPDS ngừa trầm cảm và ghi nhận chiều cao, cân nặng, giấc ngủ của bé.',
          badge: 'Giai đoạn sau sinh',
          color: 'from-emerald-500 to-teal-500',
          icon: Baby,
          actions: [
            { label: 'Nhật ký phục hồi', path: '/postpartum' },
            { label: 'Đánh giá trầm cảm EPDS', path: '/postpartum/epds' },
            { label: 'Biểu đồ tăng trưởng bé', path: '/baby-nutrition/growth' },
          ],
        };
      default:
        return {
          title: 'Bắt đầu lộ trình mới',
          desc: 'Vui lòng thiết lập lộ trình sức khỏe cá nhân hóa phù hợp với thể trạng của bạn.',
          badge: 'Thiết lập lộ trình',
          color: 'from-gray-500 to-slate-600',
          icon: Compass,
          actions: [{ label: 'Thiết lập hồ sơ', path: '/profile' }],
        };
    }
  };

  const stageContent = getStageContent();

  return (
    <div className="space-y-8 pb-10">
      {/* Top Banner with Warm Welcome */}
      <div className="relative overflow-hidden bg-gradient-to-r from-momPink/10 via-momPurple/5 to-pink-100/10 dark:from-momPink/5 dark:to-transparent border border-white/50 dark:border-gray-850 p-6 sm:p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-momPink-light/80 dark:bg-momPink/30 text-momPink-dark dark:text-pink-300">
              <Sparkles className="w-3.5 h-3.5 text-momPink animate-pulse" /> Chào mừng mami đến với Mom Ơi!
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight font-display">
              Chào mẹ, <span className="bg-gradient-to-r from-momPink to-momPurple bg-clip-text text-transparent">{user?.fullName || user?.email}</span>! 🌸
            </h2>
            <p className="text-xs text-gray-400 dark:text-gray-405 font-semibold leading-relaxed">
              Chúc mẹ một ngày ngập tràn niềm vui và sức khỏe. Hãy đồng hành cùng Mom Ơi để chăm sóc sức khỏe tốt nhất cho cả mẹ và bé yêu nhé.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3 bg-white/70 dark:bg-gray-900/60 p-4 rounded-3xl border border-white/60 dark:border-gray-850 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-momPurple/15 flex items-center justify-center text-momPurple font-bold">
              👑
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Hội viên hiện tại</p>
              <h4 className="text-sm font-extrabold text-momPurple-dark dark:text-purple-400 mt-0.5">
                {getTierNameVi(tier)}
              </h4>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Active Journey & AI Tools */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Journey Stage Info */}
          <div className="bg-white/40 dark:bg-gray-850/20 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${stageContent.color} flex items-center justify-center text-white shadow-md`}>
                  <stageContent.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{stageContent.badge}</span>
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">{stageContent.title}</h3>
                </div>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="text-xs font-bold text-momPink hover:text-momPink-dark flex items-center gap-0.5 transition-colors"
              >
                Đổi lộ trình <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-405 leading-relaxed font-semibold">
              {stageContent.desc}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {stageContent.actions.map((act) => (
                <button
                  key={act.label}
                  onClick={() => navigate(act.path)}
                  className="px-4 py-3.5 bg-white/70 dark:bg-gray-900/50 hover:bg-momPink-light/30 hover:border-momPink/50 dark:hover:bg-momPink/10 border border-white/60 dark:border-gray-800 rounded-2xl text-xs font-bold text-gray-800 dark:text-gray-200 transition-all duration-300 text-left flex items-center justify-between group shadow-sm"
                >
                  <span>{act.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* AI Helper Cards Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
              Trợ lý AI đắc lực cho mẹ
            </h3>

            <div className="grid grid-cols-1 gap-6">
              {/* Symptom Checker AI */}
              <div className="bg-white/40 dark:bg-gray-850/20 backdrop-blur-md p-5 rounded-[2rem] border border-white/60 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-48">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-550 shadow-inner">
                    <Activity className="w-5 h-5 text-momGreen" />
                  </div>
                  <h4 className="text-sm font-extrabold text-gray-900 dark:text-white mt-3">Chẩn đoán triệu chứng AI</h4>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1 leading-relaxed">
                    Tải lên hình ảnh hoặc mô tả dấu hiệu cơ thể để nhận gợi ý y tế chuyên khoa từ AI.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/symptoms')}
                  className="mt-3 w-full py-2.5 bg-gradient-to-r from-momGreen to-teal-500 text-white text-xs font-bold rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Kiểm tra triệu chứng
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Daily Health Check-in */}
        <div className="space-y-6">
          <div className="bg-white/40 dark:bg-gray-850/20 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 dark:border-gray-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-xs font-bold text-gray-400 dark:text-gray-400 uppercase tracking-wider">
                Ghi nhận sức khỏe mỗi ngày
              </h3>
              <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
                Xây dựng thói quen chăm sóc sức khỏe đều đặn
              </p>
            </div>

            {!hasCheckedIn ? (
              <form onSubmit={handleCheckInSubmit} className="space-y-4">
                {/* Mood Select */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Tâm trạng hôm nay</label>
                  <div className="flex gap-2.5">
                    {['🌸 Vui vẻ', '😴 Mệt mỏi', '😐 Bình thường', '🥺 Lo lắng'].map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => setMood(item)}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all duration-300 ${
                          mood === item
                            ? 'bg-momPink-light border-momPink text-momPink-dark shadow-sm'
                            : 'bg-white/50 dark:bg-gray-900/40 border-white/60 dark:border-gray-850 text-gray-400 hover:bg-white/70'
                        }`}
                      >
                        {item.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight Input */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Cân nặng của mẹ (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Nhập cân nặng..."
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/60 dark:border-gray-855 focus:outline-none focus:ring-2 focus:ring-momPink/30 focus:border-momPink text-xs font-semibold bg-white/50 dark:bg-gray-900/30"
                  />
                </div>

                {/* Water Tracker Widget */}
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Lượng nước uống (Mục tiêu: 8 cốc)</label>
                  <div className="flex items-center justify-between bg-white/50 dark:bg-gray-900/30 border border-white/60 dark:border-gray-855 p-3 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Droplet className="w-5 h-5 text-momBlue fill-momBlue animate-bounce" />
                      <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200">
                        {waterCups} / 8 cốc
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleWaterAdd}
                      className="px-3 py-1.5 bg-momBlue/10 hover:bg-momBlue/20 text-momBlue dark:text-blue-400 text-[10px] font-extrabold rounded-xl transition-all"
                    >
                      + Thêm cốc
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-bold rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Lưu check-in hôm nay
                </button>
              </form>
            ) : (
              <div className="p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-3">
                <span className="text-2xl">🎉</span>
                <h4 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Đã hoàn tất check-in hôm nay!</h4>
                <div className="text-[10px] text-gray-450 dark:text-gray-400 leading-normal space-y-1 font-semibold text-left p-2.5 bg-white/70 dark:bg-gray-900/60 rounded-xl">
                  {mood && <p>🌻 Tâm trạng: <span className="font-extrabold text-gray-800 dark:text-white">{mood}</span></p>}
                  {weight && <p>⚖️ Cân nặng: <span className="font-extrabold text-gray-800 dark:text-white">{weight} kg</span></p>}
                  <p>💧 Lượng nước: <span className="font-extrabold text-gray-800 dark:text-white">{waterCups} cốc</span></p>
                </div>
                <button
                  onClick={() => setHasCheckedIn(false)}
                  className="text-[10px] font-bold text-gray-450 hover:text-gray-600 underline"
                >
                  Chỉnh sửa ghi nhận
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
