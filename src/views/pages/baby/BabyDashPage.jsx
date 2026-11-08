import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import babyService from '../../../models/services/babyService';
import AllergyTracker from '../../components/baby/AllergyTracker';
import {
  formatBabyDisplayName,
  pickPreferredBaby,
  useBabyTheme,
} from '../../../hooks/useBabyTheme';
import babyWeaningPlayPhoto from '../../../assets/editorial/baby-weaning-play.jpg';
import newbornFeetPhoto from '../../../assets/editorial/newborn-feet-towel.jpg';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  Baby,
  AlertTriangle,
  ChevronRight,
  Activity,
  BookOpen,
  Pencil,
  Plus,
  Sun,
  Utensils,
  Apple,
  Moon,
  Milk,
  Flame,
  Clock,
  ShieldCheck,
  Loader2,
  HeartHandshake,
  Ruler,
  Scale,
} from 'lucide-react';
import toast from 'react-hot-toast';

const MEAL_SLOTS = [
  { key: 'breakfast', slot: 'Bữa sáng', icon: Sun, time: '07:30' },
  { key: 'lunch', slot: 'Bữa trưa', icon: Utensils, time: '11:30' },
  { key: 'snack', slot: 'Bữa chiều', icon: Apple, time: '15:30' },
  { key: 'dinner', slot: 'Bữa tối', icon: Moon, time: '18:30' },
  { key: 'supplementary_snack', slot: 'Bữa phụ', icon: Milk, time: '20:00' },
];

const getWeaningStage = (ageMonths) => {
  if (!ageMonths) return 'Giai đoạn: Sữa mẹ hoàn toàn';
  if (ageMonths < 6) return 'Giai đoạn: Sữa mẹ hoàn toàn';
  if (ageMonths <= 8) return 'Giai đoạn: Bột mịn / Cháo loãng (Ăn dặm khởi đầu)';
  if (ageMonths <= 12) return 'Giai đoạn: Cháo đặc hạt nhuyễn / Thức ăn nghiền';
  return 'Giai đoạn: Cơm nát / Thức ăn thái nhỏ cắt quân cờ';
};

// Nhãn trục Radar tách thành hai dòng ("Đạm" / "(Protein)") để không bị cắt khi màn hình hẹp
function RadarAxisTick({ x, y, textAnchor, payload }) {
  const label = String(payload?.value ?? '');
  const cut = label.indexOf(' (');
  const main = cut === -1 ? label : label.slice(0, cut);
  const sub = cut === -1 ? null : label.slice(cut + 1);
  return (
    <text x={x} y={y} textAnchor={textAnchor} fill="rgb(var(--c-ink))" fontSize={12} fontWeight={600}>
      <tspan x={x}>{main}</tspan>
      {sub && (
        <tspan x={x} dy={14}>
          {sub}
        </tspan>
      )}
    </text>
  );
}

export default function BabyDashPage() {
  const navigate = useNavigate();
  const [babies, setBabies] = useState([]);
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [loading, setLoading] = useState(true);

  const [dailyMenu, setDailyMenu] = useState(null);
  const [menuError, setMenuError] = useState(null);

  const isFetchingRef = React.useRef(false);

  // Bắt buộc gọi ở đầu component, TRƯỚC mọi return sớm; đồng bộ màu toàn bộ dashboard theo giới tính bé
  useBabyTheme(selectedBaby);

  const loadDailyMenu = useCallback(async (babyId) => {
    setDailyMenu(null);
    setMenuError(null);
    try {
      const res = await babyService.getDailyMenu(babyId);
      if ((res.success || res.isSuccess) && res.data) {
        setDailyMenu(res.data);
        setMenuError(null);
      } else {
        setMenuError(res.message || 'Không thể tải dữ liệu dinh dưỡng.');
      }
    } catch (err) {
      console.error('Failed to load daily menu:', err);
      setMenuError(err.response?.data?.message || 'Dịch vụ dinh dưỡng hiện không khả dụng.');
    }
  }, []);

  const loadBabies = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setLoading(true);
    try {
      const res = await babyService.getProfiles();
      if (res.isSuccess && Array.isArray(res.data) && res.data.length > 0) {
        setBabies(res.data);
        const preferred = pickPreferredBaby(res.data);
        setSelectedBaby(preferred);
        if (preferred) {
          await loadDailyMenu(preferred.id);
        }
      } else {
        setBabies([]);
        setSelectedBaby(null);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải hồ sơ bé yêu.');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, [loadDailyMenu]);

  useEffect(() => {
    loadBabies();
  }, [loadBabies]);

  const handleSelectBaby = async (baby) => {
    if (!baby || baby.id === selectedBaby?.id) return;
    setSelectedBaby(baby);
    await loadDailyMenu(baby.id);
  };

  // AllergyTracker báo danh sách dị ứng/lịch sử ăn mới: cập nhật hồ sơ bé tại chỗ để thực đơn lọc lại ngay
  const handleAllergiesChange = useCallback(({ allergies, foodHistory }) => {
    setSelectedBaby((prev) => (prev ? { ...prev, allergies, foodHistory } : prev));
    setBabies((prev) =>
      prev.map((item) =>
        item.id === selectedBaby?.id ? { ...item, allergies, foodHistory } : item
      )
    );
  }, [selectedBaby?.id]);

  // ── Suy ra số liệu hiển thị từ dữ liệu engine ──────────────────────────────
  const goals = dailyMenu?.goals || null;
  const totals = dailyMenu?.nutrition_totals || {};
  const coverage = dailyMenu?.coverage_pct || {};

  const ironPct = goals?.iron_mg > 0 ? Math.round(((totals.iron_mg || 0) / goals.iron_mg) * 100) : null;

  const clampPct = (v) => Math.max(0, Math.min(100, Math.round(v || 0)));
  const roundPct = (v) => Math.round(v || 0);
  const nutritionData = dailyMenu
    ? [
        { subject: 'Calories', value: clampPct(coverage.calories), fullMark: 100 },
        { subject: 'Đạm (Protein)', value: clampPct(coverage.protein_g), fullMark: 100 },
        { subject: 'Chất béo (Fat)', value: clampPct(coverage.fat_g), fullMark: 100 },
        { subject: 'Tinh bột (Carbs)', value: clampPct(coverage.carbs_g), fullMark: 100 },
        { subject: 'Sắt (Iron)', value: clampPct(ironPct), fullMark: 100 },
      ]
    : [];

  const todayMeals = MEAL_SLOTS.filter(({ key }) => dailyMenu?.meals?.[key]).map(
    ({ key, slot, icon, time }) => ({
      slot,
      icon,
      time,
      recipe: dailyMenu.meals[key].name_vi || dailyMenu.meals[key].name_en,
      kcal: Math.round(dailyMenu.meals[key].total_calories || 0),
    })
  );

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12 text-center font-display">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-theme-line bg-theme-sidebar text-theme-ink">
          <Loader2 className="h-7 w-7 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        </div>
        <h2 className="text-base font-bold text-theme-ink">Đang tải thông tin bé yêu...</h2>
        <p className="mt-1 text-sm font-medium text-theme-muted">
          Chuẩn bị thực đơn dinh dưỡng chuẩn WHO và theo dõi tăng trưởng
        </p>
      </div>
    );
  }

  // Trạng thái trống: chưa có hồ sơ bé
  if (!selectedBaby) {
    return (
      <div className="mx-auto max-w-3xl py-4 font-display sm:py-8">
        <div className="overflow-hidden rounded-3xl border border-theme-line bg-theme-surface shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="p-6 sm:p-8 md:col-span-7 space-y-5">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-brand-soft px-3 py-1 text-xs font-bold text-theme-ink">
                  <Baby className="h-3.5 w-3.5 text-theme-brand" aria-hidden="true" />
                  Không gian riêng của bé
                </span>
                <h1 className="text-xl font-bold text-theme-ink sm:text-2xl">
                  Thiết lập hồ sơ bé yêu đầu tiên
                </h1>
                <p className="text-sm leading-relaxed text-theme-muted">
                  Tạo hồ sơ để mở khóa thực đơn ăn dặm chuẩn WHO, theo dõi bách phân vị tăng trưởng và đồng bộ tông màu toàn trang theo bé trai hoặc bé gái.
                </p>
              </div>

              <div className="space-y-2.5 text-xs font-semibold text-theme-ink sm:text-sm">
                <div className="flex items-center gap-2.5 rounded-2xl border border-theme-line bg-theme-page px-3.5 py-2.5">
                  <Utensils className="h-4 w-4 shrink-0 text-theme-brand" aria-hidden="true" />
                  <span>Gợi ý cữ ăn và định lượng vi chất theo tháng tuổi</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl border border-theme-line bg-theme-page px-3.5 py-2.5">
                  <Activity className="h-4 w-4 shrink-0 text-status-ok" aria-hidden="true" />
                  <span>Biểu đồ cân nặng và chiều cao đối chiếu chuẩn WHO</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-2xl border border-theme-line bg-theme-page px-3.5 py-2.5">
                  <HeartHandshake className="h-4 w-4 shrink-0 text-theme-brand" aria-hidden="true" />
                  <span>Tự động đổi màu bảng điều khiển theo bé trai / bé gái</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/baby-nutrition/create-baby')}
                className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full bg-theme-brand px-6 py-3 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
              >
                <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Thêm hồ sơ bé ngay</span>
              </button>
            </div>

            <div className="border-t border-theme-line bg-theme-page p-2.5 md:col-span-5 md:border-l md:border-t-0">
              <img
                src={newbornFeetPhoto}
                alt="Đôi bàn chân trẻ sơ sinh trong khăn bông ấm áp"
                className="h-52 w-full rounded-2xl object-cover md:h-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const ageMonths = selectedBaby.ageMonths ?? 0;
  const isIronLow = ironPct !== null && ironPct < 60;

  const getFilteredMeals = () => {
    const avoidList = selectedBaby?.allergies || [];
    return todayMeals.map((meal) => {
      const isAvoided = avoidList.some((avoidItem) => {
        const avoidLower = avoidItem.toLowerCase().trim();
        if (!avoidLower) return false;
        return (
          meal.recipe.toLowerCase().includes(avoidLower) ||
          avoidLower.includes(meal.recipe.toLowerCase()) ||
          (avoidLower.includes('yến mạch') && meal.recipe.toLowerCase().includes('yến mạch')) ||
          (avoidLower.includes('thịt bò') && meal.recipe.toLowerCase().includes('thịt bò')) ||
          (avoidLower.includes('bò') && meal.recipe.toLowerCase().includes('thịt bò')) ||
          (avoidLower.includes('cá hồi') && meal.recipe.toLowerCase().includes('cá hồi')) ||
          (avoidLower.includes('tôm') && meal.recipe.toLowerCase().includes('tôm')) ||
          (avoidLower.includes('cá') && meal.recipe.toLowerCase().includes('cá'))
        );
      });

      if (isAvoided) {
        if (meal.slot.toLowerCase().includes('sáng')) {
          return { ...meal, recipe: 'Cháo gạo rây bí đỏ sữa hạt (Tránh dị ứng)', kcal: 120 };
        }
        if (meal.slot.toLowerCase().includes('trưa')) {
          return { ...meal, recipe: 'Súp lườn gà khoai tây bông cải (Tránh dị ứng)', kcal: 175 };
        }
        if (meal.slot.toLowerCase().includes('chiều')) {
          return { ...meal, recipe: 'Đu đủ chín nghiền sữa chua (Tránh dị ứng)', kcal: 85 };
        }
        if (meal.slot.toLowerCase().includes('tối')) {
          return { ...meal, recipe: 'Cháo chim bồ câu hạt sen bí ngô (Tránh dị ứng)', kcal: 195 };
        }
      }
      return meal;
    });
  };

  const activeMeals = getFilteredMeals();
  const genderLabel =
    selectedBaby.gender === 0 || selectedBaby.gender === 'male' || selectedBaby.gender === 'boy'
      ? 'Bé trai'
      : selectedBaby.gender === 1 || selectedBaby.gender === 'female' || selectedBaby.gender === 'girl'
        ? 'Bé gái'
        : null;

  const targetMetrics = goals
    ? [
        {
          label: 'Năng lượng',
          target: `${Math.round(goals.calories)} kcal`,
          actual: totals.calories != null ? `${Math.round(totals.calories)} kcal` : null,
          pct: roundPct(coverage.calories),
          barPct: clampPct(coverage.calories),
        },
        {
          label: 'Chất đạm (Protein)',
          target: `${Math.round(goals.protein_g)} g`,
          actual: totals.protein_g != null ? `${Math.round(totals.protein_g * 10) / 10} g` : null,
          pct: roundPct(coverage.protein_g),
          barPct: clampPct(coverage.protein_g),
        },
        {
          label: 'Chất sắt (Iron)',
          target: `${Math.round(goals.iron_mg)} mg`,
          actual: totals.iron_mg != null ? `${Math.round(totals.iron_mg * 10) / 10} mg` : null,
          pct: ironPct !== null ? roundPct(ironPct) : null,
          barPct: clampPct(ironPct),
        },
        {
          label: 'Chất béo (Fat)',
          target: `${Math.round(goals.fat_g)} g`,
          actual: totals.fat_g != null ? `${Math.round(totals.fat_g * 10) / 10} g` : null,
          pct: roundPct(coverage.fat_g),
          barPct: clampPct(coverage.fat_g),
        },
      ]
    : [];

  const displayName = formatBabyDisplayName(selectedBaby.name);
  const currentWeight = selectedBaby.currentWeightKg || selectedBaby.birthWeightKg || null;
  const currentHeight = selectedBaby.currentHeightCm || selectedBaby.birthHeightCm || null;
  const hasNutritionPayload = todayMeals.length > 0 || targetMetrics.length > 0 || nutritionData.length > 0;

  return (
    <div className="space-y-6 pb-8 font-display text-theme-ink">
      {/* Bộ chọn nhanh nếu mẹ có nhiều bé */}
      {babies.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-theme-muted">Hồ sơ của bé:</span>
          {babies.map((b) => {
            const active = b.id === selectedBaby.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSelectBaby(b)}
                className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                  active
                    ? 'border-theme-brand bg-theme-brand text-theme-surface shadow-sm'
                    : 'border-theme-line bg-theme-surface text-theme-ink hover:bg-theme-sidebar'
                }`}
              >
                <span>{formatBabyDisplayName(b.name)}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => navigate('/baby-nutrition/create-baby')}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-dashed border-theme-line bg-theme-surface px-3.5 py-1.5 text-xs font-semibold text-theme-muted hover:border-theme-brand hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Thêm bé</span>
          </button>
        </div>
      )}

      {/* 1. Đầu trang Hồ sơ bé biên tập (cân đối, có số đo nhanh & ảnh đời thực nhẹ nhàng) */}
      <section className="overflow-hidden rounded-3xl border border-theme-line bg-theme-surface shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="flex flex-col justify-between gap-5 p-5 sm:p-7 lg:col-span-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {genderLabel && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-theme-brand-soft px-3 py-1 text-xs font-bold text-theme-ink">
                      <span className="h-2 w-2 rounded-full bg-theme-brand" aria-hidden="true" />
                      {genderLabel}
                    </span>
                  )}
                  <span className="rounded-full border border-theme-line bg-theme-page px-3 py-1 text-xs font-bold text-theme-ink">
                    {ageMonths} tháng tuổi
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-theme-ink sm:text-3xl">{displayName}</h1>
                <p className="text-xs font-semibold text-status-ok sm:text-sm">
                  {getWeaningStage(ageMonths)}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/baby-nutrition/edit-baby', { state: { baby: selectedBaby } })}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-theme-line bg-theme-page px-4 py-2 text-xs font-bold text-theme-ink transition-colors hover:bg-theme-sidebar focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:text-sm"
                >
                  <Pencil className="h-4 w-4 text-theme-brand shrink-0" aria-hidden="true" />
                  <span>Sửa hồ sơ</span>
                </button>
                {babies.length <= 1 && (
                  <button
                    type="button"
                    onClick={() => navigate('/baby-nutrition/create-baby')}
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-theme-line bg-theme-surface px-3.5 py-2 text-xs font-semibold text-theme-muted transition-colors hover:border-theme-brand hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:text-sm"
                  >
                    <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Thêm bé</span>
                  </button>
                )}
              </div>
            </div>

            {/* Chỉ số nhanh + Lối tắt điều hướng vừa vặn, không bị kéo giãn thô */}
            <div className="flex flex-col gap-3 border-t border-theme-line pt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2.5">
                {currentWeight && (
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-theme-line bg-theme-page px-3.5 py-2 text-xs font-semibold text-theme-ink">
                    <Scale className="h-4 w-4 text-theme-brand" aria-hidden="true" />
                    <span>
                      Cân nặng: <strong>{currentWeight} kg</strong>
                    </span>
                  </div>
                )}
                {currentHeight && (
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-theme-line bg-theme-page px-3.5 py-2 text-xs font-semibold text-theme-ink">
                    <Ruler className="h-4 w-4 text-status-ok" aria-hidden="true" />
                    <span>
                      Chiều cao: <strong>{currentHeight} cm</strong>
                    </span>
                  </div>
                )}
                <div className="inline-flex items-center gap-2 rounded-2xl border border-theme-line bg-theme-page px-3.5 py-2 text-xs font-semibold text-theme-ink">
                  <ShieldCheck className="h-4 w-4 text-theme-brand" aria-hidden="true" />
                  <span>
                    Cần tránh: <strong>{selectedBaby.allergies?.length || 0} thực phẩm</strong>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => navigate('/baby-nutrition/menu')}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-theme-brand px-5 py-2.5 text-xs font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 sm:text-sm"
                >
                  <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Xem thực đơn tuần</span>
                  <ChevronRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/baby-nutrition/growth')}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-theme-line bg-theme-sidebar px-5 py-2.5 text-xs font-bold text-theme-ink transition-colors hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 sm:text-sm"
                >
                  <Activity className="h-4 w-4 text-theme-brand shrink-0" aria-hidden="true" />
                  <span>Biểu đồ WHO</span>
                  <ChevronRight className="h-4 w-4 text-theme-muted shrink-0" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-theme-line bg-theme-page p-2.5 lg:col-span-4 lg:border-l lg:border-t-0">
            <img
              src={ageMonths >= 6 ? babyWeaningPlayPhoto : newbornFeetPhoto}
              alt={
                ageMonths >= 6
                  ? 'Em bé trong giai đoạn tập ăn dặm'
                  : 'Chăm sóc trẻ sơ sinh dưới 6 tháng tuổi'
              }
              className="h-44 w-full rounded-2xl object-cover sm:h-52 lg:h-full lg:min-h-[195px]"
            />
          </div>
        </div>
      </section>

      {/* 2. Cảnh báo thiếu hụt vi chất BR07 */}
      {isIronLow && (
        <section
          role="alert"
          className="flex items-start gap-3.5 rounded-2xl border border-status-warn-line bg-status-warn-bg p-4 text-status-warn-text sm:p-5"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold">Cảnh báo thiếu hụt vi chất (BR07)</h2>
            <p className="text-xs font-medium leading-relaxed sm:text-sm">
              Hôm nay chỉ số Sắt đạt {ironPct}% (dưới 60% nhu cầu khuyến nghị của WHO). Bé có nguy cơ mệt mỏi và chậm tăng trưởng. Hãy bổ sung cháo thịt bò, lòng đỏ trứng nấu chín hoặc rau bina vào cữ ăn tiếp theo.
            </p>
          </div>
        </section>
      )}

      {/* 3 + 4. Nếu bé chưa đến tuổi ăn dặm / chưa có thực đơn: gộp gọn 1 thẻ hướng dẫn sạch đẹp thay vì lặp 3 hộp rỗng */}
      {!hasNutritionPayload ? (
        <section className="rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-theme-brand-soft px-3 py-1 text-xs font-bold text-theme-ink">
                <Milk className="h-3.5 w-3.5 text-theme-brand" aria-hidden="true" />
                <span>Dinh dưỡng theo tháng tuổi của bé</span>
              </div>
              <h2 className="text-lg font-bold text-theme-ink sm:text-xl">
                Thực đơn ăn dặm &amp; biểu đồ vi chất hôm nay
              </h2>
              <p className="text-sm font-medium leading-relaxed text-theme-muted">
                {menuError || 'Chưa tải được thực đơn gợi ý. Vui lòng thử lại sau.'}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/baby-nutrition/growth')}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-theme-brand px-5 py-2.5 text-xs font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand sm:text-sm"
              >
                <Activity className="h-4 w-4" aria-hidden="true" />
                <span>Theo dõi cân nặng &amp; chiều cao</span>
              </button>
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* 3. Thực đơn gợi ý hôm nay */}
          <section className="space-y-4 rounded-3xl border border-theme-line bg-theme-surface p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-theme-line pb-3.5">
              <div>
                <h2 className="text-base font-bold text-theme-ink sm:text-lg">
                  Thực đơn gợi ý hôm nay
                </h2>
                <p className="mt-0.5 text-xs font-medium text-theme-muted">
                  Các cữ ăn được tự động rà soát theo danh sách thực phẩm cần tránh của bé
                </p>
              </div>
              <span className="rounded-full bg-theme-brand-soft px-3 py-1 text-xs font-bold text-theme-ink">
                {todayMeals.length} cữ ăn
              </span>
            </div>

            {todayMeals.length === 0 ? (
              <div className="rounded-2xl border border-theme-line bg-theme-page p-4 text-xs font-medium text-theme-muted sm:text-sm">
                {menuError || 'Chưa tải được thực đơn gợi ý. Vui lòng thử lại sau.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
                {activeMeals.map((meal, idx) => {
                  const SlotIcon = meal.icon || Utensils;
                  return (
                    <article
                      key={idx}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-theme-line bg-theme-page/65 p-4 transition-colors hover:bg-theme-page"
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-theme-brand-soft text-theme-brand">
                          <SlotIcon className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-theme-brand">
                            <span>{meal.slot}</span>
                            <span className="text-theme-muted">•</span>
                            <span className="inline-flex items-center gap-1 text-theme-muted">
                              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                              Lúc {meal.time}
                            </span>
                          </div>
                          <h3 className="break-words text-sm font-bold leading-snug text-theme-ink">
                            {meal.recipe}
                          </h3>
                          <p className="inline-flex items-center gap-1 text-xs font-semibold text-theme-muted">
                            <Flame className="h-3.5 w-3.5 text-theme-brand" aria-hidden="true" />
                            <span>{meal.kcal} kcal</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/baby-nutrition/menu')}
                        className="inline-flex min-h-[44px] shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-xs font-bold text-theme-brand transition-colors hover:bg-theme-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                      >
                        <span>Chi tiết</span>
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* 4. Mục tiêu dinh dưỡng WHO & Biểu đồ mức độ đáp ứng */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="space-y-4 rounded-3xl border border-theme-line bg-theme-surface p-5 shadow-sm sm:p-6">
              <div>
                <h2 className="text-base font-bold text-theme-ink">
                  Mục tiêu dinh dưỡng chuẩn WHO (hàng ngày)
                </h2>
                <p className="mt-0.5 text-xs font-medium text-theme-muted">
                  Giá trị đề xuất cho trẻ {ageMonths} tháng tuổi
                </p>
              </div>

              {targetMetrics.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
                  {targetMetrics.map((metric, i) => (
                    <div
                      key={i}
                      className="flex flex-col justify-between gap-2.5 rounded-2xl border border-theme-line bg-theme-page p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-theme-muted">{metric.label}</span>
                        {metric.pct !== null && (
                          <span className="text-xs font-bold text-theme-brand">Đạt {metric.pct}%</span>
                        )}
                      </div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-lg font-bold text-theme-ink">{metric.target}</span>
                        {metric.actual && (
                          <span className="text-xs font-medium text-theme-muted">
                            Thực đơn: {metric.actual}
                          </span>
                        )}
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-theme-surface border border-theme-line/80">
                        <div
                          className="h-full rounded-full bg-theme-brand"
                          style={{ width: `${metric.barPct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl border border-theme-line bg-theme-page p-3 text-xs font-medium text-theme-muted sm:text-sm">
                  {menuError || 'Đang tải mục tiêu dinh dưỡng...'}
                </p>
              )}
            </section>

            <section className="flex flex-col justify-between space-y-4 rounded-3xl border border-theme-line bg-theme-surface p-5 shadow-sm sm:p-6">
              <div>
                <h2 className="text-base font-bold text-theme-ink">
                  Tỷ lệ đạt mục tiêu dinh dưỡng hôm nay (%)
                </h2>
                <p className="mt-0.5 text-xs font-medium text-theme-muted">
                  Biểu đồ thể hiện mức độ đáp ứng vi chất từ thực đơn
                </p>
              </div>

              <div className="flex h-60 w-full items-center justify-center sm:h-72">
                {nutritionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      cx="50%"
                      cy="50%"
                      outerRadius="62%"
                      margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
                      data={nutritionData}
                    >
                      <PolarGrid stroke="rgb(var(--c-line))" />
                      <PolarAngleAxis dataKey="subject" tick={<RadarAxisTick />} />
                      <PolarRadiusAxis
                        angle={54}
                        domain={[0, 100]}
                        tick={{ fontSize: 12, fill: 'rgb(var(--c-muted))' }}
                      />
                      <Radar
                        name="Bé yêu"
                        dataKey="value"
                        stroke="rgb(var(--c-brand))"
                        fill="rgb(var(--c-brand))"
                        fillOpacity={0.28}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="px-4 text-center text-xs font-medium text-theme-muted sm:text-sm">
                    {menuError || 'Đang tính toán mức đáp ứng dinh dưỡng từ thực đơn hôm nay...'}
                  </p>
                )}
              </div>
            </section>
          </div>
        </>
      )}

      {/* 5. Tầm soát dị ứng thực phẩm — nối với hồ sơ bé thật */}
      <AllergyTracker baby={selectedBaby} onAllergiesChange={handleAllergiesChange} />
    </div>
  );
}
