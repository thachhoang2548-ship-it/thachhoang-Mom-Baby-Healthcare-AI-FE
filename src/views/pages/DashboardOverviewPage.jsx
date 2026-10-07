import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthController } from '../../controllers/authController';
import { useProfileController } from '../../controllers/profileController';
import { getTierNameVi } from '../../utils/tierHelpers';
import { getFullName, getGivenName, getTimeGreeting, formatTodayVi } from '../../utils/displayName';
import {
  Heart, Calendar, Activity, Droplet, Compass, ChevronRight, Stethoscope,
  UtensilsCrossed, LineChart, Dumbbell, BookHeart, Smile, Minus, Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MOODS = [
  { emoji: '😊', label: 'Vui vẻ' },
  { emoji: '😐', label: 'Bình thường' },
  { emoji: '😴', label: 'Mệt mỏi' },
  { emoji: '😟', label: 'Lo lắng' },
];

// Một cốc nước thông dụng ở Việt Nam ~250 ml
const CUP_ML = 250;

// Tổng lượng nước khuyến nghị mỗi ngày cho phụ nữ (EFSA 2010, đã gồm nước từ
// thức ăn như canh, sữa, trái cây): bình thường 2,0 L; mang thai +0,3 L;
// cho con bú +0,7 L. Giai đoạn sau sinh mặc định là đang cho con bú.
const WATER_GOAL_ML = {
  Pregnant: { ml: 2300, reason: 'mẹ bầu' },
  Postpartum: { ml: 2700, reason: 'mẹ đang cho con bú' },
  default: { ml: 2000, reason: 'phụ nữ trưởng thành' },
};

const formatLiters = (ml) =>
  `${(ml / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} lít`;

export default function DashboardOverviewPage() {
  const { user, tier, token } = useAuthController();
  const { journeyStage } = useProfileController();
  const navigate = useNavigate();

  const givenName = getGivenName(getFullName(user, token));
  const greeting = `${getTimeGreeting()}, ${givenName ? `mẹ ${givenName}` : 'mẹ'}!`;

  // Ghi nhận trong ngày (giữ nguyên hành vi cũ: chỉ lưu trên màn hình)
  const [waterCups, setWaterCups] = useState(0);
  const [mood, setMood] = useState('');
  const [weight, setWeight] = useState('');
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const waterGoal = WATER_GOAL_ML[journeyStage] || WATER_GOAL_ML.default;
  const waterMl = waterCups * CUP_ML;
  const waterPct = Math.min(100, Math.round((waterMl / waterGoal.ml) * 100));
  const cupsLeft = Math.max(0, Math.ceil((waterGoal.ml - waterMl) / CUP_ML));

  const handleCheckInSubmit = (e) => {
    e.preventDefault();
    setHasCheckedIn(true);
    toast.success('Đã ghi nhận sức khỏe hôm nay!');
  };

  // Các việc mẹ hay làm nhất theo từng giai đoạn
  const getStage = () => {
    switch (journeyStage) {
      case 'PrePregnancy':
        return {
          title: 'Chuẩn bị mang thai',
          tasks: [
            { label: 'Xem lịch rụng trứng', desc: 'Biết ngày dễ thụ thai nhất', path: '/fertility', icon: Calendar, tone: 'pink' },
          ],
        };
      case 'Pregnant':
        return {
          title: 'Đang mang thai',
          tasks: [
            { label: 'Thai kỳ tuần này', desc: 'Bé phát triển thế nào', path: '/pregnancy', icon: Heart, tone: 'purple' },
            { label: 'Thực đơn mẹ bầu', desc: 'Ăn gì cho đủ chất', path: '/pregnancy/meals', icon: UtensilsCrossed, tone: 'green' },
            { label: 'Bài tập nhẹ', desc: 'Vận động an toàn cho bầu', path: '/pregnancy/exercises', icon: Dumbbell, tone: 'pink' },
          ],
        };
      case 'Postpartum':
        return {
          title: 'Sau sinh',
          tasks: [
            { label: 'Thực đơn cho bé', desc: 'Món ăn dặm hôm nay', path: '/baby-nutrition/menu', icon: UtensilsCrossed, tone: 'green' },
            { label: 'Cân nặng, chiều cao bé', desc: 'Bé lớn có đúng chuẩn không', path: '/baby-nutrition/growth', icon: LineChart, tone: 'purple' },
            { label: 'Sức khỏe của mẹ', desc: 'Ghi lại sự hồi phục', path: '/postpartum', icon: Activity, tone: 'pink' },
            { label: 'Tâm trạng của mẹ', desc: 'Bài kiểm tra ngắn 10 câu', path: '/postpartum/epds', icon: BookHeart, tone: 'amber' },
          ],
        };
      default:
        return {
          title: null,
          tasks: [
            { label: 'Bắt đầu thiết lập', desc: 'Cho Mom Ơi! biết mẹ đang ở giai đoạn nào', path: '/profile', icon: Compass, tone: 'pink' },
          ],
        };
    }
  };

  const stage = getStage();
  const tasks = [
    ...stage.tasks,
    { label: 'Kiểm tra triệu chứng', desc: 'Thấy trong người không khỏe?', path: '/symptoms', icon: Stethoscope, tone: 'blue' },
    { label: 'Lịch chăm sóc', desc: 'Lịch khám, tiêm, uống thuốc', path: '/care-calendar', icon: Calendar, tone: 'amber' },
  ];

  const tones = {
    pink: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
    purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    blue: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Lời chào */}
      <section className="bg-white dark:bg-gray-900 border border-pink-100 dark:border-gray-800 p-5 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2">
          <p className="text-base font-semibold text-gray-500 dark:text-gray-400 first-letter:uppercase">{formatTodayVi()}</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight">
            {greeting} 🌸
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {stage.title ? <>Giai đoạn: <strong className="text-gray-800 dark:text-gray-100">{stage.title}</strong></> : 'Mom Ơi! luôn ở bên mẹ và bé.'}
          </p>
        </div>
        <Link
          to="/upgrade"
          className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-200 text-base font-semibold"
        >
          Gói của mẹ: {getTierNameVi(tier)} <ChevronRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Việc cần làm */}
      <section className="space-y-4" aria-labelledby="tasks-title">
        <h2 id="tasks-title" className="text-2xl font-bold text-gray-900 dark:text-white">
          Hôm nay mẹ muốn làm gì?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
          {tasks.map(task => {
            const Icon = task.icon;
            return (
              <button
                key={task.path}
                onClick={() => navigate(task.path)}
                className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 min-h-[88px] text-left bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 hover:border-momPink focus-visible:border-momPink rounded-2xl transition-colors"
              >
                <span className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${tones[task.tone]}`}>
                  <Icon className="w-7 h-7" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-lg font-bold text-gray-900 dark:text-white leading-snug">{task.label}</span>
                  <span className="block text-base text-gray-600 dark:text-gray-400 leading-snug">{task.desc}</span>
                </span>
                <ChevronRight className="w-6 h-6 text-gray-400 shrink-0" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Ghi nhận sức khỏe */}
      <section className="bg-white dark:bg-gray-900 border border-pink-100 dark:border-gray-800 p-5 sm:p-8 rounded-3xl space-y-6" aria-labelledby="checkin-title">
        <div>
          <h2 id="checkin-title" className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Smile className="w-7 h-7 text-momPink" /> Mẹ thấy thế nào?
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-400 mt-1">Ghi lại vài điều nhỏ mỗi ngày.</p>
        </div>

        {!hasCheckedIn ? (
          <form onSubmit={handleCheckInSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <fieldset>
                <legend className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Tâm trạng hôm nay</legend>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {MOODS.map(m => (
                    <button
                      type="button"
                      key={m.label}
                      onClick={() => setMood(m.label)}
                      aria-pressed={mood === m.label}
                      className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border-2 text-base font-semibold transition-colors ${
                        mood === m.label
                          ? 'border-momPink bg-momPink-light text-momPink-dark'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-momPink'
                      }`}
                    >
                      <span className="text-3xl" aria-hidden>{m.emoji}</span>
                      {m.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="mom-weight" className="text-lg font-semibold text-gray-800 dark:text-gray-200 block mb-3">
                  Cân nặng của mẹ (kg)
                </label>
                <input
                  id="mom-weight"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  placeholder="Ví dụ: 55,5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:outline-none focus:border-momPink text-lg bg-white dark:bg-gray-950"
                />
              </div>
            </div>

            {/* Uống nước: tính theo lít, mục tiêu theo giai đoạn */}
            <div>
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">Uống nước hôm nay</p>
              <p className="text-base text-gray-600 dark:text-gray-400 mt-1">
                Gợi ý cho {waterGoal.reason}: khoảng <strong className="text-gray-800 dark:text-gray-100">{formatLiters(waterGoal.ml)}</strong> mỗi ngày
                (tính cả canh, sữa, trái cây), tương đương <strong className="text-gray-800 dark:text-gray-100">{Math.ceil(waterGoal.ml / CUP_ML)} cốc</strong> loại {CUP_ML} ml.
              </p>

              <div className="mt-4 border-2 border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-4">
                <div className="flex items-end justify-between gap-3 flex-wrap">
                  <p className="flex items-center gap-2">
                    <Droplet className="w-8 h-8 text-sky-500 shrink-0" />
                    <span>
                      <span className="block text-sm text-gray-500 dark:text-gray-400">Đã uống</span>
                      <span className="block text-3xl font-extrabold text-gray-900 dark:text-white">{formatLiters(waterMl)}</span>
                      <span className="block text-base text-gray-500 dark:text-gray-400">trên {formatLiters(waterGoal.ml)} gợi ý</span>
                    </span>
                  </p>
                  <p className="text-base font-semibold text-sky-700 dark:text-sky-300">
                    {cupsLeft > 0 ? `Còn khoảng ${cupsLeft} cốc nữa` : 'Đã đủ nước hôm nay 🎉'}
                  </p>
                </div>

                <div className="h-4 rounded-full bg-sky-100 dark:bg-sky-950 overflow-hidden" role="progressbar" aria-valuenow={waterPct} aria-valuemin={0} aria-valuemax={100} aria-label="Lượng nước đã uống">
                  <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${waterPct}%` }} />
                </div>

                {/* Điện thoại: nút thêm cốc nằm trên, rộng hết khung; máy tính: cùng hàng */}
                <div className="flex flex-col sm:flex-row-reverse gap-3">
                  <button
                    type="button"
                    onClick={() => setWaterCups(c => Math.min(20, c + 1))}
                    className="flex-1 min-h-[56px] px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center gap-2 text-lg font-bold"
                  >
                    <Plus className="w-6 h-6 shrink-0" /> Thêm 1 cốc ({CUP_ML} ml)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterCups(c => Math.max(0, c - 1))}
                    disabled={waterCups === 0}
                    className="min-h-[56px] px-5 rounded-xl bg-gray-100 dark:bg-gray-800 disabled:opacity-40 flex items-center justify-center gap-2 text-base font-semibold"
                  >
                    <Minus className="w-6 h-6 shrink-0" /> Bớt 1 cốc
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full lg:w-auto lg:px-12 py-4 bg-momPink-dark hover:bg-pink-700 text-white text-lg font-bold rounded-2xl"
            >
              Lưu hôm nay
            </button>
          </form>
        ) : (
          <div className="p-5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-3">
            <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">Đã ghi nhận hôm nay 🎉</p>
            <ul className="text-base text-gray-700 dark:text-gray-200 space-y-1">
              {mood && <li>Tâm trạng: <strong>{mood}</strong></li>}
              {weight && <li>Cân nặng: <strong>{weight} kg</strong></li>}
              <li>Uống nước: <strong>{formatLiters(waterMl)}</strong> / {formatLiters(waterGoal.ml)}</li>
            </ul>
            <button onClick={() => setHasCheckedIn(false)} className="text-base font-semibold text-momPink-dark underline">
              Sửa lại
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
