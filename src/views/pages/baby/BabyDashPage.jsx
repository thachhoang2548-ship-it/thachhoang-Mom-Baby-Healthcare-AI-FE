import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import babyService from '../../../models/services/babyService';
import AllergyTracker from '../../components/baby/AllergyTracker';
import { useBabyTheme } from '../../../hooks/useBabyTheme';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer
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
  HeartHandshake
} from 'lucide-react';
import toast from 'react-hot-toast';

const MEAL_SLOTS = [
  { key: 'breakfast', slot: 'Bữa sáng', icon: Sun, time: '07:30' },
  { key: 'lunch', slot: 'Bữa trưa', icon: Utensils, time: '11:30' },
  { key: 'snack', slot: 'Bữa chiều', icon: Apple, time: '15:30' },
  { key: 'dinner', slot: 'Bữa tối', icon: Moon, time: '18:30' },
  { key: 'supplementary_snack', slot: 'Bữa phụ', icon: Milk, time: '20:00' }
];

const getWeaningStage = (ageMonths) => {
  if (!ageMonths) return 'Chưa bắt đầu ăn dặm';
  if (ageMonths < 6) return 'Giai đoạn: Sữa mẹ hoàn toàn';
  if (ageMonths <= 8) return 'Giai đoạn: Bột mịn / Cháo loãng (Ăn dặm ngọt)';
  if (ageMonths <= 12) return 'Giai đoạn: Cháo đặc hạt nhuyễn / Thức ăn nghiền nhuyễn';
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
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dữ liệu thật từ nutrition engine (FastAPI qua .NET proxy):
  // { meals, nutrition_totals, coverage_pct, goals } — không còn số liệu hardcode.
  const [dailyMenu, setDailyMenu] = useState(null);
  const [menuError, setMenuError] = useState(null);

  const isFetchingRef = React.useRef(false);

  // Bắt buộc gọi ở đầu component, TRƯỚC mọi return sớm (loading, chưa có bé)
  useBabyTheme(selectedBaby);

  const loadDailyMenu = useCallback(async (babyId) => {
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
      if (res.isSuccess && res.data && res.data.length > 0) {
        setSelectedBaby(res.data[0]);
        await loadDailyMenu(res.data[0].id);
      } else {
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

  // ── Suy ra số liệu hiển thị từ dữ liệu engine ──────────────────────────────
  const goals = dailyMenu?.goals || null;
  const totals = dailyMenu?.nutrition_totals || {};
  const coverage = dailyMenu?.coverage_pct || {};

  // % sắt tính từ tổng thực tế / mục tiêu WHO (engine không trả sẵn trục này)
  const ironPct = goals?.iron_mg > 0 ? Math.round(((totals.iron_mg || 0) / goals.iron_mg) * 100) : null;

  // clampPct chỉ để vẽ Radar (miền 0 đến 100); phần trăm hiển thị dạng chữ giữ giá trị thật (roundPct)
  const clampPct = (v) => Math.max(0, Math.min(100, Math.round(v || 0)));
  const roundPct = (v) => Math.round(v || 0);
  const nutritionData = dailyMenu
    ? [
        { subject: 'Calories', value: clampPct(coverage.calories), fullMark: 100 },
        { subject: 'Đạm (Protein)', value: clampPct(coverage.protein_g), fullMark: 100 },
        { subject: 'Chất béo (Fat)', value: clampPct(coverage.fat_g), fullMark: 100 },
        { subject: 'Tinh bột (Carbs)', value: clampPct(coverage.carbs_g), fullMark: 100 },
        { subject: 'Sắt (Iron)', value: clampPct(ironPct), fullMark: 100 }
      ]
    : [];

  // Map meals của engine → 4-5 cữ hiển thị
  const todayMeals = MEAL_SLOTS
    .filter(({ key }) => dailyMenu?.meals?.[key])
    .map(({ key, slot, icon, time }) => ({
      slot,
      icon,
      time,
      recipe: dailyMenu.meals[key].name_vi || dailyMenu.meals[key].name_en,
      kcal: Math.round(dailyMenu.meals[key].total_calories || 0)
    }));

  if (loading) {
    return (
      <div className="font-display flex flex-col items-center justify-center min-h-[50vh] px-4 py-12 text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-theme-sidebar border border-theme-line flex items-center justify-center text-theme-ink mb-4">
          <Loader2 className="w-7 h-7 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        </div>
        <h2 className="text-base font-bold text-theme-ink">
          Đang tải thông tin bé yêu...
        </h2>
        <p className="text-sm text-theme-muted font-medium mt-1">
          Chuẩn bị thực đơn dinh dưỡng chuẩn WHO và AI
        </p>
      </div>
    );
  }

  // Trạng thái trống: chưa có hồ sơ bé (màu mặc định chưa bật data-baby-theme)
  if (!selectedBaby) {
    return (
      <div className="font-display max-w-2xl mx-auto py-6 sm:py-10 animate-fade-in">
        <div className="bg-theme-surface rounded-2xl border border-theme-line p-6 sm:p-10 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-theme-line">
            <div className="w-14 h-14 rounded-2xl bg-theme-sidebar border border-theme-line flex items-center justify-center text-theme-ink shrink-0">
              <Baby className="w-7 h-7" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-theme-ink">
                Chưa thiết lập bé yêu
              </h1>
              <p className="text-sm text-theme-muted font-medium leading-relaxed">
                Mami chưa thiết lập hồ sơ bé sơ sinh. Vui lòng bấm vào nút dưới đây để tạo hồ sơ và mở khóa các tính năng theo dõi chuẩn WHO.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-theme-page border border-theme-line space-y-1.5">
              <div className="flex items-center gap-2 text-theme-ink font-bold text-sm">
                <Utensils className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Thực đơn ăn dặm</span>
              </div>
              <p className="text-xs text-theme-muted font-medium leading-relaxed">
                Gợi ý cữ ăn và định lượng vi chất hàng ngày theo tháng tuổi của bé.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-theme-page border border-theme-line space-y-1.5">
              <div className="flex items-center gap-2 text-theme-ink font-bold text-sm">
                <Activity className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Biểu đồ WHO</span>
              </div>
              <p className="text-xs text-theme-muted font-medium leading-relaxed">
                Theo dõi cân nặng và chiều cao của bé đối chiếu chuẩn tăng trưởng WHO.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-theme-page border border-theme-line space-y-1.5">
              <div className="flex items-center gap-2 text-theme-ink font-bold text-sm">
                <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Tầm soát dị ứng</span>
              </div>
              <p className="text-xs text-theme-muted font-medium leading-relaxed">
                Ghi nhận phản ứng thực phẩm mới và tự động lọc món cần tránh.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-theme-muted font-medium">
              <HeartHandshake className="w-4 h-4 shrink-0 text-theme-ink" aria-hidden="true" />
              <span>Giao diện sẽ tự động điều chỉnh tông màu theo hồ sơ bé trai hoặc bé gái.</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/baby-nutrition/create-baby')}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 rounded-2xl bg-theme-ink text-theme-surface text-sm font-bold transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-ink focus-visible:ring-offset-2 shrink-0"
            >
              <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Thêm hồ sơ bé ngay</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ageMonths = selectedBaby.ageMonths ?? 0;
  // BR07: cảnh báo khi % sắt THẬT (tổng thực đơn / mục tiêu WHO) dưới 60%
  const isIronLow = ironPct !== null && ironPct < 60;

  // Filter out avoided ingredients and provide alternatives
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
          return {
            ...meal,
            recipe: 'Cháo gạo rây bí đỏ sữa hạt (Tránh dị ứng)',
            kcal: 120
          };
        }
        if (meal.slot.toLowerCase().includes('trưa')) {
          return {
            ...meal,
            recipe: 'Súp lườn gà khoai tây bông cải (Tránh dị ứng)',
            kcal: 175
          };
        }
        if (meal.slot.toLowerCase().includes('chiều')) {
          return {
            ...meal,
            recipe: 'Đu đủ chín nghiền sữa chua (Tránh dị ứng)',
            kcal: 85
          };
        }
        if (meal.slot.toLowerCase().includes('tối')) {
          return {
            ...meal,
            recipe: 'Cháo chim bồ câu hạt sen bí ngô (Tránh dị ứng)',
            kcal: 195
          };
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
          pct: roundPct(coverage.calories)
        },
        {
          label: 'Chất đạm (Protein)',
          target: `${Math.round(goals.protein_g)} g`,
          actual: totals.protein_g != null ? `${Math.round(totals.protein_g * 10) / 10} g` : null,
          pct: roundPct(coverage.protein_g)
        },
        {
          label: 'Chất sắt (Iron)',
          target: `${Math.round(goals.iron_mg)} mg`,
          actual: totals.iron_mg != null ? `${Math.round(totals.iron_mg * 10) / 10} mg` : null,
          pct: ironPct !== null ? roundPct(ironPct) : null
        },
        {
          label: 'Chất béo (Fat)',
          target: `${Math.round(goals.fat_g)} g`,
          actual: totals.fat_g != null ? `${Math.round(totals.fat_g * 10) / 10} g` : null,
          pct: roundPct(coverage.fat_g)
        }
      ]
    : [];

  return (
    <div className="font-display rounded-3xl bg-theme-page p-4 sm:p-6 border border-theme-line space-y-6">
      {/* 1. Hồ sơ bé & Điều hướng nhanh */}
      <section className="bg-theme-surface rounded-2xl border border-theme-line p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-theme-brand-soft border border-theme-line flex items-center justify-center text-theme-brand shrink-0">
              <Baby className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-theme-ink">
                  Bé {selectedBaby.name}
                </h1>
                {genderLabel && (
                  <span className="px-2.5 py-0.5 rounded-full bg-theme-brand-soft text-theme-brand text-xs font-semibold">
                    {genderLabel}
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-theme-sidebar text-theme-ink text-xs font-semibold border border-theme-line">
                  {ageMonths} tháng tuổi
                </span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-status-ok">
                {getWeaningStage(ageMonths)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/baby-nutrition/edit-baby', { state: { baby: selectedBaby } })}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-2xl border border-theme-line bg-theme-surface hover:bg-theme-sidebar text-theme-ink text-xs sm:text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 self-start md:self-auto"
          >
            <Pencil className="w-4 h-4 text-theme-brand shrink-0" aria-hidden="true" />
            <span>Chỉnh sửa hồ sơ bé</span>
          </button>
        </div>

        {/* Lối tắt điều hướng chính */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-theme-line">
          <button
            type="button"
            onClick={() => navigate('/baby-nutrition/menu')}
            className="min-h-[48px] px-4 py-3 rounded-2xl bg-theme-brand hover:opacity-95 text-theme-surface text-sm font-semibold flex items-center justify-between gap-3 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
          >
            <span className="inline-flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Xem thực đơn tuần</span>
            </span>
            <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/baby-nutrition/growth')}
            className="min-h-[48px] px-4 py-3 rounded-2xl bg-theme-sidebar hover:bg-theme-brand-soft/60 text-theme-ink border border-theme-line text-sm font-semibold flex items-center justify-between gap-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
          >
            <span className="inline-flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-theme-brand shrink-0" aria-hidden="true" />
              <span>Chỉ số tăng trưởng WHO</span>
            </span>
            <ChevronRight className="w-4 h-4 text-theme-muted shrink-0" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* 2. Cảnh báo thiếu hụt vi chất BR07 */}
      {isIronLow && (
        <section
          role="alert"
          className="bg-status-warn-bg border border-status-warn-line rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-status-warn-text"
        >
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="text-sm font-bold">
              Cảnh báo thiếu hụt vi chất (BR07)
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed font-medium">
              Hôm nay chỉ số Sắt đạt {ironPct}% (dưới 60% nhu cầu khuyến nghị của WHO). Bé có nguy cơ mệt mỏi và chậm tăng trưởng. Hãy bổ sung cháo thịt bò, lòng đỏ trứng nấu chín hoặc rau bina vào cữ ăn tiếp theo.
            </p>
          </div>
        </section>
      )}

      {/* 3. Thực đơn gợi ý hôm nay (đặt làm trọng tâm theo định hướng tập trung thức ăn cho bé) */}
      <section className="bg-theme-surface rounded-2xl border border-theme-line p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-theme-line">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-theme-ink">
              Thực đơn gợi ý hôm nay
            </h2>
            <p className="text-xs text-theme-muted font-medium mt-0.5">
              Các cữ ăn được tự động rà soát theo danh sách thực phẩm cần tránh của bé
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-theme-brand-soft text-theme-brand text-xs font-bold">
            {todayMeals.length} cữ ăn
          </span>
        </div>

        {todayMeals.length === 0 ? (
          <div className="p-4 rounded-2xl bg-theme-page border border-theme-line text-xs sm:text-sm text-theme-muted font-medium">
            {menuError || 'Chưa tải được thực đơn gợi ý. Vui lòng thử lại sau.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeMeals.map((meal, idx) => {
              const SlotIcon = meal.icon || Utensils;
              return (
                <article
                  key={idx}
                  className="p-4 rounded-2xl border border-theme-line bg-theme-page/60 flex items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0 mt-0.5">
                      <SlotIcon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-theme-brand">
                        <span>{meal.slot}</span>
                        <span className="text-theme-muted">•</span>
                        <span className="inline-flex items-center gap-1 text-theme-muted">
                          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                          Lúc {meal.time}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-theme-ink leading-snug break-words">
                        {meal.recipe}
                      </h3>
                      <p className="inline-flex items-center gap-1 text-xs font-semibold text-theme-muted">
                        <Flame className="w-3.5 h-3.5 text-theme-brand" aria-hidden="true" />
                        <span>{meal.kcal} kcal</span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/baby-nutrition/menu')}
                    className="inline-flex items-center gap-1 min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold text-theme-brand hover:bg-theme-brand-soft/60 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                  >
                    <span>Chi tiết</span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Mục tiêu dinh dưỡng WHO & Biểu đồ mức độ đáp ứng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mục tiêu dinh dưỡng hàng ngày */}
        <section className="bg-theme-surface rounded-2xl border border-theme-line p-5 sm:p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-theme-ink">
              Mục tiêu dinh dưỡng chuẩn WHO (hàng ngày)
            </h2>
            <p className="text-xs text-theme-muted font-medium mt-0.5">
              Giá trị đề xuất cho trẻ {ageMonths} tháng tuổi
            </p>
          </div>

          {targetMetrics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {targetMetrics.map((metric, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-theme-page border border-theme-line flex flex-col justify-between gap-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-theme-muted">
                      {metric.label}
                    </span>
                    {metric.pct !== null && (
                      <span className="text-xs font-bold text-theme-brand">
                        Đạt {metric.pct}%
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-lg font-bold text-theme-ink">
                      {metric.target}
                    </span>
                    {metric.actual && (
                      <span className="text-xs font-medium text-theme-muted">
                        Thực đơn: {metric.actual}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs sm:text-sm text-theme-muted font-medium p-3 rounded-2xl bg-theme-page border border-theme-line">
              {menuError || 'Đang tải mục tiêu dinh dưỡng...'}
            </p>
          )}
        </section>

        {/* Biểu đồ Radar tỷ lệ đáp ứng */}
        <section className="bg-theme-surface rounded-2xl border border-theme-line p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-theme-ink">
              Tỷ lệ đạt mục tiêu dinh dưỡng hôm nay (%)
            </h2>
            <p className="text-xs text-theme-muted font-medium mt-0.5">
              Biểu đồ thể hiện mức độ đáp ứng vi chất từ thực đơn
            </p>
          </div>

          <div className="h-60 sm:h-72 w-full flex items-center justify-center">
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
              <p className="text-xs sm:text-sm text-theme-muted font-medium text-center px-4">
                {menuError || 'Đang tính toán mức đáp ứng dinh dưỡng từ thực đơn hôm nay...'}
              </p>
            )}
          </div>
        </section>
      </div>

      {/* 5. Tầm soát dị ứng thực phẩm — nối với hồ sơ bé thật */}
      <AllergyTracker baby={selectedBaby} />
    </div>
  );
}
