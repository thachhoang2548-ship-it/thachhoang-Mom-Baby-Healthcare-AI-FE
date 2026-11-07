import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Flame,
  Info,
  RefreshCw,
  Utensils,
  X,
  Sun,
  Apple,
  Moon,
  Milk,
  AlertTriangle,
  Loader2,
  Baby
} from 'lucide-react';
import toast from 'react-hot-toast';
import babyService from '../../../models/services/babyService';
import { useBabyTheme } from '../../../hooks/useBabyTheme';

const AGE_STAGES = {
  infant: {
    id: 'infant',
    range: '6-11 tháng',
    title: 'Ăn dặm khởi đầu',
    subtitle: 'Mềm, nghiền, tăng dần độ thô',
    meals: '2-4 cữ/ngày',
    texture: 'Bột mịn, cháo rây, thức ăn nghiền, miếng mềm dễ cầm',
    focus: ['Sắt và kẽm', 'Rau củ quả mềm', 'Đạm mềm nấu chín kỹ'],
    note: 'Giai đoạn này ưu tiên tập kỹ năng ăn, làm quen vị mới và vẫn duy trì sữa mẹ/sữa công thức.',
  },
  toddler: {
    id: 'toddler',
    range: '12-24 tháng',
    title: 'Bữa ăn gia đình điều chỉnh',
    subtitle: 'Cơm nát, món cắt nhỏ, thêm bữa phụ',
    meals: '3-4 bữa + 1-2 bữa phụ',
    texture: 'Cơm nát, cháo đặc, món mềm cắt nhỏ, finger food an toàn',
    focus: ['Đủ năng lượng', 'Đa dạng nhóm thực phẩm', 'Tự xúc và ăn cùng gia đình'],
    note: 'Từ khoảng 12 tháng, đa số bé có thể ăn nhiều món giống gia đình nếu được cắt nhỏ, nấu mềm và tránh nguy cơ hóc.',
  },
};

const TAB_ITEMS = [
  { id: 'today', label: 'Hôm nay' },
  { id: 'weekly', label: '7 ngày' },
  { id: 'history', label: 'Lịch sử' },
];

const SLOT_META = {
  breakfast: { slot: 'Sáng', time: '07:30', icon: Sun },
  lunch: { slot: 'Trưa', time: '11:30', icon: Utensils },
  snack: { slot: 'Chiều', time: '15:30', icon: Apple },
  dinner: { slot: 'Tối', time: '18:30', icon: Moon },
  supplementary_snack: { slot: 'Phụ', time: '20:00', icon: Milk },
};

const getAgeMonthsFromBaby = (baby) => {
  if (!baby) return 0;
  if (Number.isFinite(Number(baby.ageMonths))) return Number(baby.ageMonths);

  const dobValue = baby.birthDate || baby.dateOfBirth;
  if (!dobValue) return 0;

  const dob = new Date(dobValue);
  if (Number.isNaN(dob.getTime())) return 0;

  const now = new Date();
  let months = (now.getFullYear() - dob.getFullYear()) * 12 + now.getMonth() - dob.getMonth();
  if (now.getDate() < dob.getDate()) months -= 1;
  return Math.max(0, months);
};

const getStageIdFromAge = (ageMonths) => {
  if (ageMonths >= 12) return 'toddler';
  return 'infant';
};

const normalizeIngredient = (item) => ({
  name: item?.ingredient?.vietnamese_name || item?.ingredient?.english_name || item?.name || 'Nguyên liệu',
  amount: item?.weight_grams ? String(item.weight_grams) : item?.amount || '10',
  unit: item?.unit || 'g',
});

const mapFastApiRecipe = (key, recipe) => {
  if (!recipe) return null;

  const meta = SLOT_META[key] || { slot: 'Bữa ăn', time: '--:--', icon: Utensils };
  const id = recipe.id || `${key}-${recipe.name_vi || recipe.name_en || 'recipe'}`;

  const steps = (recipe.cooking_steps || []).map((step, idx) => ({
    desc: step.step_description || step.description || step.desc || `Bước ${idx + 1}`,
    time: step.duration_minutes ? `${step.duration_minutes} phút` : step.time || '5 phút',
  }));

  const ingredients = (recipe.ingredients || []).map(normalizeIngredient);

  return {
    id,
    slotKey: key,
    slot: meta.slot,
    name: recipe.name_vi || recipe.name_en || 'Món ăn cho bé',
    icon: meta.icon,
    kcal: Math.round(recipe.total_calories || 0),
    time: meta.time,
    status: recipe.status ?? 0,
    protein: recipe.total_protein_g != null ? `${Math.round(recipe.total_protein_g * 10) / 10}g` : '—',
    iron: recipe.total_iron_mg != null ? `${Math.round(recipe.total_iron_mg * 10) / 10}mg` : '—',
    tags: recipe.tags?.length ? recipe.tags : ['Dinh dưỡng', 'Phù hợp độ tuổi'],
    ingredients: ingredients.length
      ? ingredients
      : [
          { name: 'Gạo tẻ ngon', amount: '25', unit: 'g' },
          { name: 'Rau củ tươi', amount: '15', unit: 'g' },
        ],
    steps: steps.length
      ? steps
      : [
          { desc: 'Sơ chế nguyên liệu sạch, cắt nhỏ phù hợp với độ tuổi của bé.', time: '5 phút' },
          { desc: 'Nấu chín mềm, điều chỉnh độ thô trước khi cho bé ăn.', time: '15 phút' },
        ],
    nutritionData: [
      { name: 'Năng lượng', value: Math.round(recipe.total_calories || 0) },
      { name: 'Đạm', value: Math.round(recipe.total_protein_g || 0) },
      { name: 'Chất béo', value: Math.round(recipe.total_fat_g || 0) },
      { name: 'Tinh bột', value: Math.round(recipe.total_carbs_g || 0) },
    ],
    eaten: false,
  };
};

// Nhãn trục Y của biểu đồ dinh dưỡng trong modal
function BarYAxisTick({ x, y, payload }) {
  return (
    <text x={x} y={y} dy={4} textAnchor="end" fill="rgb(var(--c-ink))" fontSize={12} fontWeight={600}>
      {payload?.value ?? ''}
    </text>
  );
}

export default function BabyMenuPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');
  const [selectedStageId, setSelectedStageId] = useState('infant');
  const [selectedBaby, setSelectedBaby] = useState(null);
  const [allergies, setAllergies] = useState([]);
  const [dailyMenu, setDailyMenu] = useState([]);
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [menuError, setMenuError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalTab, setModalTab] = useState('ingredients');
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  // Bắt buộc gọi ở đầu component, TRƯỚC mọi return sớm
  useBabyTheme(selectedBaby);

  const ageMonths = getAgeMonthsFromBaby(selectedBaby);
  const activeStage = AGE_STAGES[selectedStageId];
  const ageMatchedStageId = getStageIdFromAge(ageMonths);

  const loadMenus = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const profileRes = await babyService.getProfiles();
      if (!(profileRes.success || profileRes.isSuccess) || !profileRes.data?.length) {
        setDailyMenu([]);
        setSelectedBaby(null);
        setMenuError('Chưa có hồ sơ bé. Vui lòng tạo hồ sơ bé trước để nhận thực đơn.');
        return;
      }

      const baby = profileRes.data[0];
      setSelectedBaby(baby);
      setAllergies(baby.allergies || []);
      setSelectedStageId(getStageIdFromAge(getAgeMonthsFromBaby(baby)));

      const dailyRes = await babyService.getDailyMenu(baby.id, forceRefresh);
      if ((dailyRes.success || dailyRes.isSuccess) && dailyRes.data) {
        const meals = dailyRes.data.meals || {};
        const mapped = Object.keys(SLOT_META)
          .map((key) => mapFastApiRecipe(key, meals[key]))
          .filter(Boolean);

        setDailyMenu(mapped);
        setMenuError(mapped.length ? null : 'Chưa có công thức phù hợp cho bé trong hệ thống.');
      } else {
        setDailyMenu([]);
        setMenuError(dailyRes.message || 'Không thể tải thực đơn cho bé.');
      }

      try {
        const weeklyRes = await babyService.getWeeklyMenu(baby.id);
        if ((weeklyRes.success || weeklyRes.isSuccess) && weeklyRes.data) {
          setWeeklyMenu(weeklyRes.data);
        }
      } catch (error) {
        console.error('Failed to load weekly menu:', error);
      }
    } catch (error) {
      console.error('Failed to load baby menu:', error);
      setMenuError(error.response?.data?.message || 'Dịch vụ dinh dưỡng hiện không khả dụng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMenus();
  }, [loadMenus]);

  const activeRecipes = useMemo(() => {
    return dailyMenu.map((recipe) => {
      const lowerName = recipe.name.toLowerCase();
      const ingredientText = recipe.ingredients.map((item) => item.name.toLowerCase()).join(' ');
      const isAvoided = allergies.some((allergy) => {
        const keyword = allergy.toLowerCase().trim();
        return keyword && (lowerName.includes(keyword) || ingredientText.includes(keyword));
      });

      return {
        ...recipe,
        ageRange: activeStage.range,
        stageTitle: activeStage.title,
        tags: isAvoided ? ['cần thay thế', 'tránh dị ứng', activeStage.range] : [...recipe.tags, activeStage.range],
        allergyWarning: isAvoided,
      };
    });
  }, [activeStage.range, activeStage.title, allergies, dailyMenu]);

  const weeklySlots = useMemo(() => {
    const base = [
      { key: 'breakfast', label: 'Sáng', icon: Sun },
      { key: 'lunch', label: 'Trưa', icon: Utensils },
      { key: 'snack', label: 'Chiều', icon: Apple },
      { key: 'dinner', label: 'Tối', icon: Moon },
    ];

    if (selectedStageId === 'toddler') {
      return [...base, { key: 'supplementary_snack', label: 'Phụ', icon: Milk }];
    }

    return base;
  }, [selectedStageId]);

  const getWeeklyMealForDay = (slotKey, dayIndex) => {
    const dayMenu = weeklyMenu?.days?.[dayIndex];
    const recipe = dayMenu?.meals?.[slotKey];
    return recipe?.name_vi || recipe?.name_en || 'Chưa có món';
  };

  const getEatenCoverage = () => {
    if (!activeRecipes.length) return 0;
    return Math.round((activeRecipes.filter((recipe) => recipe.eaten).length / activeRecipes.length) * 100);
  };

  const handleMarkEaten = (id) => {
    setDailyMenu((prev) => prev.map((item) => (item.id === id ? { ...item, eaten: !item.eaten } : item)));
    toast.success('Đã cập nhật trạng thái ăn của bé.');
  };

  const handleRegenerateMenu = async () => {
    toast.loading('Đang tạo lại thực đơn phù hợp độ tuổi và dị ứng...', { id: 'regen' });
    await loadMenus(true);
    toast.success('Đã tải lại thực đơn mới.', { id: 'regen' });
  };

  const handleOpenRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setModalTab('ingredients');
    setCookingMode(false);
    setCurrentStepIdx(0);
    setCheckedIngredients({});
  };

  const toggleIngredientCheck = (name) => {
    setCheckedIngredients((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const eatenCoverage = getEatenCoverage();
  const clampedEatenWidth = Math.max(0, Math.min(100, eatenCoverage));

  // Khi chưa có hồ sơ bé, biến --c-brand ở :root (#FF7A8A) chưa đạt 4,5:1 với chữ trắng;
  // dùng bg-theme-ink text-theme-surface nếu chưa có selectedBaby.
  const hasTheme = Boolean(selectedBaby);
  const brandBadgeClass = hasTheme
    ? 'bg-theme-brand-soft text-theme-brand'
    : 'bg-theme-sidebar text-theme-ink border border-theme-line';
  const brandTextClass = hasTheme ? 'text-theme-brand' : 'text-theme-ink';
  const primaryBtnClass = hasTheme
    ? 'bg-theme-brand text-theme-surface hover:bg-theme-ink'
    : 'bg-theme-ink text-theme-surface hover:bg-status-ok';

  return (
    <div className="font-display rounded-3xl bg-theme-page p-4 sm:p-6 border border-theme-line space-y-6">
      {/* Nút quay lại */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/baby-nutrition')}
          className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-2xl border border-theme-line bg-theme-surface hover:bg-theme-sidebar text-xs sm:text-sm font-semibold text-theme-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Quay lại trang bé yêu</span>
        </button>

        {selectedBaby && (
          <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-theme-surface border border-theme-line text-xs sm:text-sm">
            <Baby className="w-4 h-4 text-theme-brand shrink-0" aria-hidden="true" />
            <span className="font-bold text-theme-ink">{selectedBaby.name || selectedBaby.babyName}</span>
            <span className="text-theme-muted">•</span>
            <span className="font-semibold text-theme-muted">{ageMonths} tháng tuổi</span>
          </div>
        )}
      </div>

      {/* 1. Đầu trang & thanh chuyển chế độ thực đơn (Hôm nay / 7 ngày / Lịch sử) */}
      <section className="bg-theme-surface rounded-2xl border border-theme-line p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${brandBadgeClass}`}>
              <Utensils className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Thực đơn sau thai kỳ cho bé</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-theme-ink">
              Món ăn của bé hôm nay ({activeStage.range})
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm font-medium leading-relaxed text-theme-muted">
              WHO/CDC thường dùng mốc 6 tháng để bắt đầu ăn bổ sung, sau đó khẩu phần và kết cấu thay đổi rõ khi bé bước sang 12 tháng. Vì vậy giao diện chia thành 6-11 tháng và 12-24 tháng.
            </p>
          </div>

          {/* Tiến độ ăn hôm nay */}
          <div className="w-full lg:w-72 p-4 rounded-2xl bg-theme-page border border-theme-line space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-theme-ink">
              <span>Độ hoàn thành dinh dưỡng hôm nay</span>
              <span className={brandTextClass}>{eatenCoverage}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-theme-sidebar border border-theme-line">
              <div
                className={`h-full rounded-full transition-all duration-300 ${hasTheme ? 'bg-theme-brand' : 'bg-theme-ink'}`}
                style={{ width: `${clampedEatenWidth}%` }}
              />
            </div>
            <p className="text-xs font-medium text-theme-muted leading-snug">
              Tích chọn từng món đã ăn để theo dõi tiến độ. Thực đơn vẫn cần theo phản ứng và khả năng nhai nuốt của bé.
            </p>
          </div>
        </div>

        {/* Bộ lọc tab & nút tạo lại thực đơn ngay trên đầu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-theme-line">
          <div className="flex w-full sm:w-auto gap-1.5 rounded-2xl border border-theme-line bg-theme-page p-1">
            {TAB_ITEMS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 sm:flex-none min-h-[40px] px-4 py-2 rounded-md text-xs sm:text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                    isSelected
                      ? 'bg-theme-ink text-theme-surface'
                      : 'text-theme-ink hover:bg-theme-sidebar'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'today' && (
            <button
              type="button"
              onClick={handleRegenerateMenu}
              className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${primaryBtnClass}`}
            >
              <RefreshCw className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Tạo thực đơn mới tránh dị ứng</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. TRỌNG TÂM: Danh sách món ăn / Thực đơn 7 ngày / Lịch sử */}
      {activeTab === 'today' && (
        <section className="space-y-4">
          {loading && (
            <div className="rounded-2xl border border-theme-line bg-theme-surface p-8 text-center space-y-3">
              <Loader2 className="w-7 h-7 mx-auto text-theme-ink animate-spin motion-reduce:animate-none" aria-hidden="true" />
              <p className="text-sm font-bold text-theme-ink">
                Đang tải thực đơn cho bé...
              </p>
            </div>
          )}

          {!loading && !activeRecipes.length && (
            <div className="rounded-2xl border border-status-warn-line bg-status-warn-bg p-6 text-center text-status-warn-text space-y-2">
              <p className="text-sm font-bold">Chưa có thực đơn cho bé</p>
              <p className="text-xs sm:text-sm font-medium leading-relaxed">
                {menuError || 'Không thể kết nối dịch vụ dinh dưỡng. Vui lòng thử lại sau.'}
              </p>
            </div>
          )}

          {!loading && activeRecipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRecipes.map((recipe) => {
                const SlotIcon = recipe.icon || Utensils;
                return (
                  <article
                    key={recipe.id}
                    className={`rounded-2xl border bg-theme-surface p-5 shadow-sm flex flex-col justify-between gap-4 transition-colors ${
                      recipe.eaten ? 'border-status-ok' : 'border-theme-line'
                    }`}
                  >
                    <div className="space-y-4">
                      {/* Đầu thẻ món */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${brandBadgeClass}`}>
                            <SlotIcon className="w-5 h-5" aria-hidden="true" />
                          </div>
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-bold ${brandBadgeClass}`}>
                                Bữa {recipe.slot} · {recipe.time}
                              </span>
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-theme-ink leading-snug break-words">
                              {recipe.name}
                            </h2>
                          </div>
                        </div>

                        {recipe.eaten && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-status-ok px-2.5 py-1 text-xs font-bold text-theme-surface shrink-0">
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Đã ăn</span>
                          </span>
                        )}
                      </div>

                      {/* Chỉ số dinh dưỡng chính của món */}
                      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-theme-page border border-theme-line p-3 text-xs">
                        <div className="space-y-0.5">
                          <span className="text-theme-muted font-medium block">Năng lượng</span>
                          <span className="inline-flex items-center gap-1 font-bold text-theme-ink">
                            <Flame className="h-3.5 w-3.5 text-theme-brand shrink-0" aria-hidden="true" />
                            {recipe.kcal} kcal
                          </span>
                        </div>
                        <div className="space-y-0.5 border-l border-theme-line pl-2.5">
                          <span className="text-theme-muted font-medium block">Chất đạm</span>
                          <span className="font-bold text-theme-ink">{recipe.protein}</span>
                        </div>
                        <div className="space-y-0.5 border-l border-theme-line pl-2.5">
                          <span className="text-theme-muted font-medium block">Chất sắt</span>
                          <span className="font-bold text-theme-ink">{recipe.iron}</span>
                        </div>
                      </div>

                      {/* Tóm tắt nguyên liệu ngay trên thẻ */}
                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-theme-ink">
                          Nguyên liệu chính:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {recipe.ingredients.slice(0, 4).map((ing, idx) => (
                            <span
                              key={`${recipe.id}-ing-${idx}`}
                              className="rounded-md bg-theme-sidebar border border-theme-line px-2.5 py-1 text-xs font-semibold text-theme-ink"
                            >
                              {ing.name} ({ing.amount}{ing.unit})
                            </span>
                          ))}
                          {recipe.ingredients.length > 4 && (
                            <span className="rounded-md bg-theme-page border border-theme-line px-2.5 py-1 text-xs font-semibold text-theme-muted">
                              +{recipe.ingredients.length - 4} nguyên liệu
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Nhãn tag */}
                      <div className="flex flex-wrap gap-1.5">
                        {recipe.tags.map((tag) => (
                          <span
                            key={`${recipe.id}-${tag}`}
                            className={`rounded-md px-2.5 py-1 text-xs font-semibold border ${
                              recipe.allergyWarning
                                ? 'bg-status-warn-bg border-status-warn-line text-status-warn-text'
                                : 'bg-theme-page border-theme-line text-theme-muted'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {recipe.allergyWarning && (
                        <div className="rounded-2xl bg-status-warn-bg border border-status-warn-line p-3 text-xs font-semibold leading-relaxed text-status-warn-text flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                          <span>
                            Món này có thể trùng với danh sách dị ứng/kiêng của bé. Mẹ nên tạo lại thực đơn hoặc hỏi chuyên gia trước khi cho ăn.
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Hành động cho món */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-theme-line">
                      <button
                        type="button"
                        onClick={() => handleOpenRecipe(recipe)}
                        className={`min-h-[44px] rounded-2xl border border-theme-line bg-theme-surface hover:bg-theme-sidebar px-3 py-2.5 text-xs sm:text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${brandTextClass}`}
                      >
                        Xem công thức
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMarkEaten(recipe.id)}
                        className={`inline-flex items-center justify-center gap-1.5 min-h-[44px] rounded-2xl px-3 py-2.5 text-xs sm:text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                          recipe.eaten
                            ? 'bg-status-ok text-theme-surface hover:bg-theme-ink'
                            : hasTheme
                            ? 'bg-theme-ink text-theme-surface hover:bg-theme-brand'
                            : 'bg-theme-ink text-theme-surface hover:bg-status-ok'
                        }`}
                      >
                        <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{recipe.eaten ? 'Bé đã ăn' : 'Đã cho bé ăn'}</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {activeTab === 'weekly' && (
        <section className="overflow-x-auto rounded-2xl border border-theme-line bg-theme-surface p-5 sm:p-6 shadow-sm space-y-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-theme-ink">
            <Calendar className="h-5 w-5 text-theme-brand shrink-0" aria-hidden="true" />
            <span>Khung thực đơn 7 ngày · {activeStage.range}</span>
          </h2>

          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-theme-line">
                <th className="py-3 pr-3 text-xs font-bold text-theme-muted">Bữa ăn</th>
                {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day) => (
                  <th key={day} className="py-3 px-1.5 text-center text-xs font-bold text-theme-muted">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-line">
              {weeklySlots.map((slot) => {
                const SlotIcon = slot.icon || Utensils;
                return (
                  <tr key={slot.key}>
                    <td className="py-3 pr-3 text-xs sm:text-sm font-bold text-theme-ink whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <SlotIcon className="w-4 h-4 text-theme-brand shrink-0" aria-hidden="true" />
                        <span>{slot.label}</span>
                      </span>
                    </td>
                    {Array.from({ length: 7 }).map((_, index) => (
                      <td key={`${slot.key}-${index}`} className="px-1.5 py-2.5 align-top">
                        <div className="rounded-2xl bg-theme-page border border-theme-line p-2.5 text-xs font-semibold leading-snug text-theme-ink min-h-[56px] flex items-center justify-center text-center">
                          {getWeeklyMealForDay(slot.key, index)}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'history' && (
        <section className="rounded-2xl border border-theme-line bg-theme-surface p-8 text-center shadow-sm space-y-2">
          <Award className="mx-auto h-10 w-10 text-theme-brand" aria-hidden="true" />
          <h2 className="text-base font-bold text-theme-ink">Lịch sử ăn dặm</h2>
          <p className="text-xs sm:text-sm font-medium text-theme-muted">
            Chưa ghi nhận lịch sử ăn dặm nào trước đó của bé.
          </p>
        </section>
      )}

      {/* 3. Chọn giai đoạn độ tuổi ăn dặm & Gợi ý chuẩn bị kết cấu */}
      <section className="rounded-2xl border border-theme-line bg-theme-surface p-5 sm:p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-theme-ink">
            Chia thực đơn theo 2 độ tuổi ăn dặm
          </h2>
          <p className="text-xs sm:text-sm font-medium text-theme-muted mt-0.5">
            Chuyển đổi giai đoạn để xem định hướng kết cấu và nhóm chất ưu tiên phù hợp với bé
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {Object.values(AGE_STAGES).map((stage) => {
            const selected = selectedStageId === stage.id;
            const matched = ageMatchedStageId === stage.id && selectedBaby;

            return (
              <button
                key={stage.id}
                type="button"
                onClick={() => setSelectedStageId(stage.id)}
                className={`rounded-2xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                  selected
                    ? 'border-theme-brand bg-theme-brand-soft/60'
                    : 'border-theme-line bg-theme-page hover:bg-theme-sidebar'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`rounded-md bg-theme-surface border border-theme-line px-2.5 py-1 text-xs font-bold ${brandTextClass}`}>
                    {stage.range}
                  </span>
                  {matched && (
                    <span className="rounded-md bg-status-ok px-2.5 py-1 text-xs font-bold text-theme-surface">
                      Phù hợp bé
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-base font-bold text-theme-ink">{stage.title}</h3>
                <p className="mt-1 text-xs font-medium text-theme-muted">{stage.subtitle}</p>
                <div className="mt-3 grid gap-1.5 text-xs font-semibold text-theme-ink">
                  <span>Suất ăn: {stage.meals}</span>
                  <span>Kết cấu: {stage.texture}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-theme-line bg-theme-page p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl shrink-0 ${brandBadgeClass}`}>
              <Info className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-theme-ink">{activeStage.title}</h3>
              <p className="text-xs font-medium text-theme-muted">{activeStage.range}</p>
            </div>
          </div>
          <p className="text-xs sm:text-sm font-medium leading-relaxed text-theme-ink">
            {activeStage.note}
          </p>
          <div className="flex flex-wrap gap-2">
            {activeStage.focus.map((item) => (
              <span
                key={item}
                className="rounded-md bg-theme-surface border border-theme-line px-2.5 py-1 text-xs font-semibold text-theme-ink"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Modal chi tiết công thức & chế biến */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-theme-ink/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recipe-modal-title"
        >
          <div className="max-h-[86vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-theme-line bg-theme-surface shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-theme-line bg-theme-surface px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${brandBadgeClass}`}>
                  {(() => {
                    const ModalIcon = selectedRecipe.icon || Utensils;
                    return <ModalIcon className="w-5 h-5" aria-hidden="true" />;
                  })()}
                </div>
                <div className="min-w-0">
                  <h3 id="recipe-modal-title" className="text-sm sm:text-base font-bold text-theme-ink leading-snug break-words">
                    {selectedRecipe.name}
                  </h3>
                  <p className="text-xs font-medium text-theme-muted">
                    Bữa {selectedRecipe.slot} · {selectedRecipe.ageRange}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecipe(null)}
                aria-label="Đóng chi tiết công thức"
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-2xl text-theme-muted transition-colors hover:bg-theme-page hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand shrink-0"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="flex gap-2 border-b border-theme-line px-5 pt-3">
              {[
                { id: 'ingredients', label: 'Nguyên liệu' },
                { id: 'steps', label: 'Cách làm' },
                { id: 'nutrition', label: 'Dinh dưỡng' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModalTab(tab.id)}
                  className={`min-h-[40px] px-3 border-b-2 pb-2 text-xs sm:text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-theme-brand ${
                    modalTab === tab.id
                      ? `border-theme-ink ${brandTextClass}`
                      : 'border-transparent text-theme-muted hover:text-theme-ink'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {modalTab === 'ingredients' && (
                <div className="space-y-3">
                  {selectedRecipe.ingredients.map((item) => (
                    <label
                      key={`${selectedRecipe.id}-${item.name}`}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border border-theme-line bg-theme-page p-3.5 text-xs sm:text-sm font-semibold text-theme-ink"
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedIngredients[item.name]}
                        onChange={() => toggleIngredientCheck(item.name)}
                        className="h-4 w-4 rounded border-theme-line text-theme-brand focus:ring-theme-brand"
                      />
                      <span className={checkedIngredients[item.name] ? 'text-theme-muted line-through' : ''}>
                        {item.name}: <strong>{item.amount} {item.unit}</strong>
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {modalTab === 'steps' && (
                <div className="space-y-4">
                  {!cookingMode ? (
                    <>
                      {selectedRecipe.steps.map((step, index) => (
                        <div
                          key={`${selectedRecipe.id}-step-${index}`}
                          className="flex gap-3 rounded-2xl border border-theme-line bg-theme-page p-3.5"
                        >
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${brandBadgeClass}`}>
                            {index + 1}
                          </span>
                          <div className="space-y-1">
                            <p className="text-xs sm:text-sm font-medium leading-relaxed text-theme-ink">
                              {step.desc}
                            </p>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-theme-muted">
                              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                              {step.time}
                            </span>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setCookingMode(true);
                          setCurrentStepIdx(0);
                        }}
                        className={`inline-flex w-full min-h-[44px] items-center justify-center gap-2 rounded-2xl py-3 text-xs sm:text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                          hasTheme
                            ? 'bg-theme-ink hover:bg-theme-brand text-theme-surface'
                            : 'bg-theme-ink hover:bg-status-ok text-theme-surface'
                        }`}
                      >
                        <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>Bắt đầu chế biến từng bước</span>
                      </button>
                    </>
                  ) : (
                    <div className="space-y-5 text-center">
                      <span className={`inline-block rounded-md px-3 py-1 text-xs font-bold ${brandBadgeClass}`}>
                        Bước {currentStepIdx + 1}/{selectedRecipe.steps.length}
                      </span>
                      <p className="text-base sm:text-lg font-bold leading-relaxed text-theme-ink">
                        {selectedRecipe.steps[currentStepIdx].desc}
                      </p>
                      <p className="text-xs font-semibold text-theme-muted">
                        Thời gian đề xuất: {selectedRecipe.steps[currentStepIdx].time}
                      </p>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          disabled={currentStepIdx === 0}
                          onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                          className="min-h-[44px] rounded-2xl border border-theme-line bg-theme-surface hover:bg-theme-sidebar py-3 text-xs sm:text-sm font-bold text-theme-ink disabled:opacity-40 transition-colors"
                        >
                          Bước trước
                        </button>
                        {currentStepIdx < selectedRecipe.steps.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => setCurrentStepIdx((prev) => prev + 1)}
                            className={`inline-flex min-h-[44px] items-center justify-center gap-1 rounded-2xl py-3 text-xs sm:text-sm font-bold transition-colors ${primaryBtnClass}`}
                          >
                            <span>Bước tiếp</span>
                            <ChevronRight className="h-4 w-4" aria-hidden="true" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setCookingMode(false);
                              toast.success('Đã hoàn thành món ăn.');
                            }}
                            className="min-h-[44px] rounded-2xl bg-status-ok hover:bg-theme-ink py-3 text-xs sm:text-sm font-bold text-theme-surface transition-colors"
                          >
                            Hoàn thành
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {modalTab === 'nutrition' && (
                <div className="space-y-5">
                  <div className="rounded-2xl bg-theme-brand-soft border border-theme-line p-4 text-center">
                    <p className="text-xs font-bold text-theme-ink">Tổng năng lượng</p>
                    <p className={`mt-1 text-2xl sm:text-3xl font-bold ${brandTextClass}`}>
                      {selectedRecipe.kcal} <span className="text-sm text-theme-ink">kcal</span>
                    </p>
                  </div>
                  <div className="h-56 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={selectedRecipe.nutritionData}
                        layout="vertical"
                        margin={{ top: 8, right: 20, left: 16, bottom: 8 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--c-line))" />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 12, fill: 'rgb(var(--c-muted))' }}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={84}
                          tick={<BarYAxisTick />}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgb(var(--c-surface))',
                            borderColor: 'rgb(var(--c-line))',
                            borderRadius: '1rem',
                            fontSize: '12px',
                            color: 'rgb(var(--c-ink))'
                          }}
                        />
                        <Bar dataKey="value" fill="rgb(var(--c-brand))" radius={[0, 8, 8, 0]} barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
