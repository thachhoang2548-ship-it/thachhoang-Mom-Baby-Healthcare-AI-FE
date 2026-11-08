import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthController } from '../../controllers/authController';
import { useProfileController } from '../../controllers/profileController';
import { getTierLevel } from '../../utils/tierHelpers';
import { getFullName, getGivenName, getTimeGreeting, formatTodayVi } from '../../utils/displayName';
import { formatBabyDisplayName, useActiveBaby } from '../../hooks/useBabyTheme';
import heroMomBabyPhoto from '../../assets/editorial/hero-mom-baby-sunlight.jpg';
import pregnantCouplePhoto from '../../assets/editorial/pregnant-couple-warm.jpg';
import newbornFeetPhoto from '../../assets/editorial/newborn-feet-towel.jpg';
import {
  Heart,
  Calendar,
  Activity,
  Droplet,
  Compass,
  ChevronRight,
  Stethoscope,
  UtensilsCrossed,
  LineChart,
  Dumbbell,
  BookHeart,
  Smile,
  Meh,
  Moon,
  CloudRain,
  Minus,
  Plus,
  ChefHat,
  CheckCircle2,
  Sparkles,
  Headphones,
  Baby,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MOODS = [
  { icon: Smile, label: 'Vui vẻ' },
  { icon: Meh, label: 'Bình thường' },
  { icon: Moon, label: 'Mệt mỏi' },
  { icon: CloudRain, label: 'Lo lắng' },
];

const CUP_ML = 250;

const WATER_GOAL_ML = {
  Pregnant: { ml: 2300, reason: 'mẹ bầu' },
  Postpartum: { ml: 2700, reason: 'mẹ đang cho con bú' },
  default: { ml: 2000, reason: 'phụ nữ trưởng thành' },
};

const formatLiters = (ml) =>
  `${(ml / 1000).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 })} lít`;

function getCleanTierLabel(tier) {
  const level = getTierLevel(tier);
  if (level === 2) return 'Super Mom VIP';
  if (level === 1) return 'Mẹ Hiện Đại';
  return 'Mẹ Bầu Cơ Bản';
}

export default function DashboardOverviewPage() {
  const { user, tier, token } = useAuthController();
  const { journeyStage } = useProfileController();
  const activeBaby = useActiveBaby();
  const navigate = useNavigate();

  const givenName = getGivenName(getFullName(user, token));
  const greeting = `${getTimeGreeting()}, ${givenName ? `mẹ ${givenName}` : 'mẹ'}`;

  const [waterCups, setWaterCups] = useState(0);
  const [mood, setMood] = useState('');
  const [weight, setWeight] = useState('');
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const waterGoal = WATER_GOAL_ML[journeyStage] || WATER_GOAL_ML.default;
  const waterMl = waterCups * CUP_ML;
  const waterPct = Math.min(100, Math.round((waterMl / waterGoal.ml) * 100));
  const cupsLeft = Math.max(0, Math.ceil((waterGoal.ml - waterMl) / CUP_ML));
  const totalGoalCups = Math.ceil(waterGoal.ml / CUP_ML);

  const handleCheckInSubmit = (e) => {
    e.preventDefault();
    setHasCheckedIn(true);
    toast.success('Đã ghi nhận sức khỏe hôm nay!');
  };

  const getStageConfig = () => {
    switch (journeyStage) {
      case 'PrePregnancy':
        return {
          title: 'Chuẩn bị mang thai',
          subtitle: 'Theo dõi nhịp chu kỳ tự nhiên và chuẩn bị nền tảng thể chất vững vàng trước thai kỳ.',
          photo: newbornFeetPhoto,
          photoAlt: 'Đôi bàn chân em bé sơ sinh trong khăn trắng ấm áp',
          featured: {
            label: 'Mở lịch rụng trứng & chu kỳ',
            desc: 'Nhận diện cửa sổ dễ thụ thai nhất trong tháng và ghi chú biểu hiện cơ thể.',
            path: '/fertility',
            icon: Calendar,
          },
          tasks: [],
        };
      case 'Pregnant':
        return {
          title: 'Đang mang thai',
          subtitle: 'Cập nhật sự lớn lên của thai nhi từng tuần, ăn uống đủ chất và vận động nhẹ nhàng.',
          photo: pregnantCouplePhoto,
          photoAlt: 'Gia đình trẻ đón chờ em bé chào đời',
          featured: {
            label: 'Xem thai kỳ tuần này của mẹ',
            desc: 'Theo dõi cột mốc thai nhi, kiểm tra món ăn an toàn và biểu đồ cân nặng.',
            path: '/pregnancy',
            icon: Heart,
          },
          tasks: [
            { label: 'Thực đơn mẹ bầu', desc: 'Gợi ý 7 ngày đủ sắt, canxi', path: '/pregnancy/meals', icon: UtensilsCrossed, tone: 'ok' },
            { label: 'Bài tập nhẹ', desc: 'Vận động an toàn theo tam cá nguyệt', path: '/pregnancy/exercises', icon: Dumbbell, tone: 'warn' },
          ],
        };
      case 'Postpartum':
        return {
          title: 'Mẹ & bé sau sinh',
          subtitle: 'Chăm sóc thực đơn, giấc ngủ cho bé song song với nhịp hồi phục thể chất và tinh thần của mẹ.',
          photo: heroMomBabyPhoto,
          photoAlt: 'Người mẹ mỉm cười ôm con bên khung cửa sổ nắng ấm',
          featured: {
            label: activeBaby
              ? `Góc chăm sóc ${formatBabyDisplayName(activeBaby.name)}`
              : 'Mở góc chăm sóc bé yêu',
            desc: 'Thực đơn ăn dặm chuẩn WHO, rà soát thực phẩm dị ứng và biểu đồ tăng trưởng.',
            path: '/baby-nutrition',
            icon: Baby,
          },
          tasks: [
            { label: 'Thực đơn cho bé', desc: 'Món ăn dặm hôm nay & tuần', path: '/baby-nutrition/menu', icon: UtensilsCrossed, tone: 'ok' },
            { label: 'Tăng trưởng WHO', desc: 'Đối chiếu cân nặng, chiều cao', path: '/baby-nutrition/growth', icon: LineChart, tone: 'brand' },
            { label: 'Hồi phục của mẹ', desc: 'Lộ trình vận động & chăm sóc', path: '/postpartum', icon: Activity, tone: 'brand' },
            { label: 'Tâm lý EPDS', desc: 'Khảo sát ngắn 10 câu kín đáo', path: '/postpartum/epds', icon: BookHeart, tone: 'warn' },
          ],
        };
      default:
        return {
          title: null,
          subtitle: 'Thiết lập giai đoạn hiện tại để Mom Ơi! cá nhân hóa thực đơn và lịch chăm sóc cho mẹ.',
          photo: newbornFeetPhoto,
          photoAlt: 'Đôi bàn chân em bé sơ sinh trong khăn trắng ấm áp',
          featured: {
            label: 'Thiết lập hồ sơ đồng hành',
            desc: 'Cho Mom Ơi! biết mẹ đang chuẩn bị mang thai, đang bầu hay nuôi con nhỏ.',
            path: '/profile',
            icon: Compass,
          },
          tasks: [],
        };
    }
  };

  const stage = getStageConfig();
  const FeaturedIcon = stage.featured.icon;

  const secondaryTasks = [
    ...stage.tasks,
    ...(stage.title
      ? [
          {
            label: 'Thực đơn AI cho mẹ',
            desc: 'Gợi ý món ngon theo thể trạng',
            path: '/diet-recipes',
            icon: ChefHat,
            tone: 'warn',
          },
        ]
      : []),
    { label: 'Kiểm tra triệu chứng', desc: 'Phân loại dấu hiệu cần lưu ý', path: '/symptoms', icon: Stethoscope, tone: 'ok' },
    { label: 'Lịch chăm sóc', desc: 'Lịch khám, tiêm, nhắc việc', path: '/care-calendar', icon: Calendar, tone: 'brand' },
    { label: 'Góc thư giãn', desc: 'Nhạc ru êm dịu nghe cả offline', path: '/relax', icon: Headphones, tone: 'brand' },
  ];

  const tones = {
    brand: 'bg-theme-brand-soft text-theme-brand',
    ok: 'bg-status-ok/15 text-status-ok',
    warn: 'bg-status-warn-bg text-status-warn-text',
  };

  return (
    <div className="space-y-6 pb-8 font-display text-theme-ink">
      {/* 1. Đầu trang biên tập: Lời chào + Ảnh đời thực Mẹ & Bé */}
      <section className="overflow-hidden rounded-3xl border border-theme-line bg-theme-surface shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="flex flex-col justify-between gap-6 p-6 sm:p-8 lg:col-span-8">
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-theme-muted">
                <span className="first-letter:uppercase">{formatTodayVi()}</span>
                {stage.title && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="rounded-full bg-theme-brand-soft px-3 py-0.5 font-bold text-theme-ink">
                      {stage.title}
                    </span>
                  </>
                )}
                {journeyStage === 'Postpartum' && activeBaby && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-theme-line bg-theme-page px-3 py-0.5 font-bold text-theme-ink">
                    <span className="h-2 w-2 rounded-full bg-theme-brand" aria-hidden="true" />
                    {formatBabyDisplayName(activeBaby.name)}
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold leading-tight text-theme-ink sm:text-3xl lg:text-4xl">
                {greeting}
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-theme-muted sm:text-base">
                {stage.subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-theme-line pt-4">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-theme-page px-3.5 py-2 text-xs font-semibold text-theme-ink border border-theme-line">
                <Droplet className="h-4 w-4 text-theme-brand" aria-hidden="true" />
                <span>
                  Nước hôm nay: <strong>{formatLiters(waterMl)}</strong> / {formatLiters(waterGoal.ml)}
                </span>
              </div>

              {mood && (
                <div className="inline-flex items-center gap-2 rounded-2xl bg-theme-page px-3.5 py-2 text-xs font-semibold text-theme-ink border border-theme-line">
                  <Smile className="h-4 w-4 text-status-ok" aria-hidden="true" />
                  <span>
                    Tâm trạng: <strong>{mood}</strong>
                  </span>
                </div>
              )}

              <Link
                to="/upgrade"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-theme-line bg-theme-surface px-3.5 py-1.5 text-xs font-bold text-theme-ink transition-colors hover:border-theme-brand/40 hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:ml-auto"
              >
                <Sparkles className="h-3.5 w-3.5 text-theme-brand" aria-hidden="true" />
                <span>Gói: {getCleanTierLabel(tier)}</span>
                <ChevronRight className="h-3.5 w-3.5 text-theme-muted" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="border-t border-theme-line bg-theme-page p-2.5 lg:col-span-4 lg:border-l lg:border-t-0">
            <img
              src={stage.photo}
              alt={stage.photoAlt}
              className="h-48 w-full rounded-2xl object-cover sm:h-56 lg:h-full lg:min-h-[210px]"
            />
          </div>
        </div>
      </section>

      {/* 2. Bố cục bất đối xứng 2 cột: Lối tắt trọng tâm (7 cột) + Nhật ký nhanh hôm nay (5 cột) */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Cột trái: Ưu tiên theo chặng & danh mục tiện ích */}
        <section className="space-y-4 lg:col-span-7" aria-labelledby="tasks-title">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="tasks-title" className="text-lg font-bold text-theme-ink sm:text-xl">
              Không gian chăm sóc của mẹ
            </h2>
            <span className="text-xs font-semibold text-theme-muted">Truy cập nhanh</span>
          </div>

          {/* Thẻ nổi bật số 1 của giai đoạn hiện tại */}
          <button
            type="button"
            onClick={() => navigate(stage.featured.path)}
            className="group flex w-full items-center justify-between gap-4 rounded-3xl border border-theme-brand/30 bg-theme-brand-soft/65 p-5 text-left shadow-sm transition-colors hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:p-6"
          >
            <div className="flex items-start gap-4 min-w-0">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-theme-brand text-theme-surface shadow-sm">
                <FeaturedIcon className="h-6 w-6" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <span className="text-xs font-bold text-theme-brand">Ưu tiên hôm nay</span>
                <p className="mt-0.5 text-base font-bold text-theme-ink sm:text-lg">
                  {stage.featured.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-theme-ink/80 sm:text-sm">
                  {stage.featured.desc}
                </p>
              </div>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-theme-surface text-theme-ink border border-theme-line transition-transform group-hover:translate-x-0.5">
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </span>
          </button>

          {/* Lưới 2 cột gọn gàng cho các tiện ích còn lại */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {secondaryTasks.map((task) => {
              const Icon = task.icon;
              return (
                <button
                  key={task.path}
                  type="button"
                  onClick={() => navigate(task.path)}
                  className="group flex min-h-[82px] items-center gap-3.5 rounded-2xl border border-theme-line bg-theme-surface p-4 text-left shadow-sm transition-colors hover:border-theme-brand/45 hover:bg-theme-sidebar/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${tones[task.tone]}`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold leading-snug text-theme-ink sm:text-base">
                      {task.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-theme-muted">
                      {task.desc}
                    </span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-theme-muted transition-transform group-hover:translate-x-0.5 group-hover:text-theme-brand" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Cột phải: Nhật ký nhỏ hôm nay (nằm vừa tầm mắt không cần cuộn xa) */}
        <section
          className="space-y-5 rounded-3xl border border-theme-line bg-theme-surface p-5 shadow-sm sm:p-6 lg:col-span-5"
          aria-labelledby="checkin-title"
        >
          <div className="border-b border-theme-line pb-4">
            <h2 id="checkin-title" className="flex items-center gap-2 text-lg font-bold text-theme-ink">
              <Smile className="h-5 w-5 text-theme-brand" aria-hidden="true" />
              <span>Nhật ký nhanh hôm nay</span>
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-theme-muted sm:text-sm">
              Ghi nhận nhanh cảm xúc, lượng nước và cân nặng trong ngày của mẹ.
            </p>
          </div>

          {!hasCheckedIn ? (
            <form onSubmit={handleCheckInSubmit} className="space-y-5">
              <fieldset>
                <legend className="mb-2.5 text-xs font-bold text-theme-ink sm:text-sm">
                  Tâm trạng của mẹ lúc này
                </legend>
                <div className="grid grid-cols-2 gap-2.5">
                  {MOODS.map((m) => {
                    const MoodIcon = m.icon;
                    const active = mood === m.label;
                    return (
                      <button
                        type="button"
                        key={m.label}
                        onClick={() => setMood(m.label)}
                        aria-pressed={active}
                        className={`flex min-h-[52px] items-center gap-2.5 rounded-2xl border px-3.5 py-2.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:text-sm ${
                          active
                            ? 'border-theme-brand bg-theme-brand text-theme-surface shadow-sm'
                            : 'border-theme-line bg-theme-page/60 text-theme-ink hover:border-theme-brand/40 hover:bg-theme-surface'
                        }`}
                      >
                        <MoodIcon
                          className={`h-4 w-4 shrink-0 ${active ? 'text-theme-surface' : 'text-theme-brand'}`}
                          aria-hidden="true"
                        />
                        <span>{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Lượng nước uống hôm nay */}
              <div className="rounded-2xl border border-theme-line bg-theme-page/70 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-theme-ink">Lượng nước đã uống</p>
                    <p className="mt-0.5 text-xs text-theme-muted">
                      Mục tiêu {waterGoal.reason}: <strong>{formatLiters(waterGoal.ml)}</strong> ({totalGoalCups} cốc)
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      cupsLeft === 0
                        ? 'bg-status-ok/15 text-status-ok'
                        : 'bg-theme-surface text-theme-ink border border-theme-line'
                    }`}
                  >
                    {cupsLeft > 0 ? `Còn ${cupsLeft} cốc` : 'Đạt mục tiêu'}
                  </span>
                </div>

                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xl font-bold text-theme-ink">
                    {formatLiters(waterMl)}{' '}
                    <span className="text-xs font-medium text-theme-muted">({waterCups} cốc)</span>
                  </span>
                  <span className="text-xs font-bold text-theme-brand">{waterPct}%</span>
                </div>

                <div
                  className="h-2.5 overflow-hidden rounded-full border border-theme-line bg-theme-surface"
                  role="progressbar"
                  aria-valuenow={waterPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Lượng nước đã uống"
                >
                  <div
                    className="h-full rounded-full bg-theme-brand transition-all duration-300"
                    style={{ width: `${waterPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setWaterCups((c) => Math.max(0, c - 1))}
                    disabled={waterCups === 0}
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-theme-line bg-theme-surface px-3 py-2 text-xs font-bold text-theme-ink transition-colors hover:bg-theme-sidebar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand disabled:cursor-not-allowed disabled:bg-theme-page disabled:text-theme-muted"
                  >
                    <Minus className="h-4 w-4 shrink-0" />
                    <span>Bớt 1 cốc</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterCups((c) => Math.min(20, c + 1))}
                    className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-theme-brand px-3 py-2 text-xs font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                  >
                    <Plus className="h-4 w-4 shrink-0" />
                    <span>Thêm {CUP_ML} ml</span>
                  </button>
                </div>
              </div>

              {/* Cân nặng nhanh */}
              <div>
                <label
                  htmlFor="mom-weight"
                  className="mb-1.5 block text-xs font-bold text-theme-ink sm:text-sm"
                >
                  Cân nặng hiện tại (kg, tùy chọn)
                </label>
                <input
                  id="mom-weight"
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  placeholder="Ví dụ: 55.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="min-h-[46px] w-full rounded-2xl border border-theme-line bg-theme-page/60 px-4 text-sm font-semibold text-theme-ink placeholder:text-theme-muted focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                />
              </div>

              <button
                type="submit"
                className="inline-flex min-h-[46px] w-full items-center justify-center rounded-full bg-theme-brand px-6 py-2.5 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
              >
                Lưu ghi nhận hôm nay
              </button>
            </form>
          ) : (
            <div className="space-y-4 rounded-2xl border border-status-ok/35 bg-status-ok/10 p-5">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-status-ok" />
                <p className="text-base font-bold text-theme-ink">Đã ghi nhận hôm nay</p>
              </div>
              <ul className="space-y-1.5 text-sm text-theme-ink">
                {mood && (
                  <li>
                    Tâm trạng: <strong>{mood}</strong>
                  </li>
                )}
                {weight && (
                  <li>
                    Cân nặng: <strong>{weight} kg</strong>
                  </li>
                )}
                <li>
                  Uống nước: <strong>{formatLiters(waterMl)}</strong> / {formatLiters(waterGoal.ml)}
                </li>
              </ul>
              <button
                type="button"
                onClick={() => setHasCheckedIn(false)}
                className="inline-flex min-h-[44px] items-center rounded-full border border-theme-line bg-theme-surface px-4 py-2 text-xs font-bold text-theme-ink transition-colors hover:border-theme-brand/40 hover:text-theme-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
              >
                Cập nhật lại
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
