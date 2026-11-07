import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
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
  Baby,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2
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

const MEAL_FILTER_OPTIONS = [
  { id: 'all', label: 'Tất cả bữa' },
  { id: 'breakfast', label: 'Bữa sáng' },
  { id: 'lunch', label: 'Bữa trưa' },
  { id: 'snack', label: 'Bữa chiều' },
  { id: 'dinner', label: 'Bữa tối' },
  { id: 'supplementary_snack', label: 'Bữa phụ' },
];

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
  const rawObj = typeof recipe === 'string' ? { name_vi: recipe } : recipe;
  const id = rawObj.id || `${key}-${rawObj.name_vi || rawObj.name_en || 'recipe'}`;

  const steps = (rawObj.cooking_steps || []).map((step, idx) => ({
    desc: step.step_description || step.description || step.desc || `Bước ${idx + 1}`,
    time: step.duration_minutes ? `${step.duration_minutes} phút` : step.time || '5 phút',
  }));

  const ingredients = (rawObj.ingredients || []).map(normalizeIngredient);

  return {
    id,
    slotKey: key,
    slot: meta.slot,
    name: rawObj.name_vi || rawObj.name_en || 'Món ăn cho bé',
    icon: meta.icon,
    kcal: Math.round(rawObj.total_calories || 0),
    time: meta.time,
    status: rawObj.status ?? 0,
    protein: rawObj.total_protein_g != null ? `${Math.round(rawObj.total_protein_g * 10) / 10}g` : '—',
    iron: rawObj.total_iron_mg != null ? `${Math.round(rawObj.total_iron_mg * 10) / 10}mg` : '—',
    tags: rawObj.tags?.length ? rawObj.tags : ['Dinh dưỡng', 'Phù hợp độ tuổi'],
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
      { name: 'Năng lượng', value: Math.round(rawObj.total_calories || 0) },
      { name: 'Đạm', value: Math.round(rawObj.total_protein_g || 0) },
      { name: 'Chất béo', value: Math.round(rawObj.total_fat_g || 0) },
      { name: 'Tinh bột', value: Math.round(rawObj.total_carbs_g || 0) },
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
  const [babies, setBabies] = useState([]);
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
  // Dấu "Đã cho bé ăn" chỉ nhớ tạm trong bộ nhớ, riêng từng bé: { [babyId]: { [recipeId]: true } }
  const [eatenByBaby, setEatenByBaby] = useState({});
  const [weeklyError, setWeeklyError] = useState(null);
  // Mỗi lượt tải có số thứ tự; kết quả của lượt cũ (đã bị lượt mới thay thế) bị bỏ qua
  const loadSeqRef = useRef(0);

  // Các state tìm kiếm & bộ lọc món ăn (Hướng A: Khám phá món trong thực đơn hiện có)
  const [searchQuery, setSearchQuery] = useState('');
  const [mealSlotFilter, setMealSlotFilter] = useState('all');
  const [eatenStatusFilter, setEatenStatusFilter] = useState('all');
  const [allergyFilter, setAllergyFilter] = useState('all');

  // Bắt buộc gọi ở đầu component, TRƯỚC mọi return sớm
  useBabyTheme(selectedBaby);

  const ageMonths = getAgeMonthsFromBaby(selectedBaby);
  const activeStage = AGE_STAGES[selectedStageId];
  const ageMatchedStageId = getStageIdFromAge(ageMonths);

  // Tải thực đơn ngày và tuần cho MỘT bé. Chỉ lượt tải mới nhất được ghi vào state.
  const loadMenusForBaby = useCallback(async (baby, forceRefresh = false) => {
    const seq = ++loadSeqRef.current;
    const isStale = () => seq !== loadSeqRef.current;

    // Xóa dữ liệu cũ trước để không bao giờ hiện thực đơn của bé khác dưới hồ sơ này
    setSelectedBaby(baby);
    setAllergies(baby.allergies || []);
    setSelectedStageId(getStageIdFromAge(getAgeMonthsFromBaby(baby)));
    setDailyMenu([]);
    setWeeklyMenu(null);
    setMenuError(null);
    setWeeklyError(null);
    setLoading(true);

    try {
      const dailyRes = await babyService.getDailyMenu(baby.id, forceRefresh);
      if (isStale()) return;
      if ((dailyRes.success || dailyRes.isSuccess) && dailyRes.data) {
        const meals = dailyRes.data.meals || {};
        const mapped = Object.keys(SLOT_META)
          .map((key) => mapFastApiRecipe(key, meals[key]))
          .filter(Boolean);

        setDailyMenu(mapped);
        setMenuError(mapped.length ? null : 'Chưa có công thức phù hợp cho bé trong hệ thống.');
      } else {
        setMenuError(dailyRes.message || 'Không thể tải thực đơn cho bé.');
      }
    } catch (error) {
      if (isStale()) return;
      console.error('Failed to load baby menu:', error);
      setMenuError(error.response?.data?.message || 'Dịch vụ dinh dưỡng hiện không khả dụng. Vui lòng thử lại sau.');
    }

    try {
      const weeklyRes = await babyService.getWeeklyMenu(baby.id);
      if (isStale()) return;
      if ((weeklyRes.success || weeklyRes.isSuccess) && weeklyRes.data) {
        setWeeklyMenu(weeklyRes.data);
      } else {
        setWeeklyError(weeklyRes.message || 'Không thể tải thực đơn tuần cho bé.');
      }
    } catch (error) {
      if (isStale()) return;
      console.error('Failed to load weekly menu:', error);
      setWeeklyError('Không thể tải thực đơn tuần cho bé.');
    }

    if (!isStale()) setLoading(false);
  }, []);

  // Khi mở trang: tải danh sách hồ sơ bé rồi tải thực đơn của bé đầu tiên.
  // `loading` đã khởi tạo true; setState chỉ chạy trong hàm gọi lại sau khi dữ liệu về.
  useEffect(() => {
    babyService
      .getProfiles()
      .then((profileRes) => {
        const profileList = profileRes.data || [];
        if (!(profileRes.success || profileRes.isSuccess) || !profileList.length) {
          setBabies([]);
          setDailyMenu([]);
          setSelectedBaby(null);
          setMenuError('Chưa có hồ sơ bé. Vui lòng tạo hồ sơ bé trước để nhận thực đơn.');
          setLoading(false);
          return undefined;
        }

        setBabies(profileList);
        return loadMenusForBaby(profileList[0], false);
      })
      .catch((error) => {
        console.error('Failed to load baby menu:', error);
        setMenuError(error.response?.data?.message || 'Dịch vụ dinh dưỡng hiện không khả dụng. Vui lòng thử lại sau.');
        setLoading(false);
      });
  }, [loadMenusForBaby]);

  const handleSelectBaby = (targetBaby) => {
    if (!targetBaby || targetBaby.id === selectedBaby?.id) return;
    setSearchQuery('');
    setMealSlotFilter('all');
    setEatenStatusFilter('all');
    setAllergyFilter('all');
    loadMenusForBaby(targetBaby, false);
    toast.success(`Đã chuyển sang thực đơn của bé ${targetBaby.name || 'yêu'}`);
  };

  const eatenMap = eatenByBaby[selectedBaby?.id];

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
        eaten: Boolean(eatenMap?.[recipe.id]),
        ageRange: activeStage.range,
        stageTitle: activeStage.title,
        tags: isAvoided ? ['cần thay thế', 'tránh dị ứng', activeStage.range] : [...recipe.tags, activeStage.range],
        allergyWarning: isAvoided,
      };
    });
  }, [activeStage.range, activeStage.title, allergies, dailyMenu, eatenMap]);

  // Bộ lọc khám phá món ăn trong thực đơn hôm nay
  const filteredRecipes = useMemo(() => {
    return activeRecipes.filter((recipe) => {
      // 1. Tìm kiếm theo từ khóa (tên món, nguyên liệu, cữ ăn)
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchName = recipe.name.toLowerCase().includes(q);
        const matchSlot = recipe.slot.toLowerCase().includes(q);
        const matchIng = recipe.ingredients.some((ing) => ing.name.toLowerCase().includes(q));
        if (!matchName && !matchSlot && !matchIng) return false;
      }

      // 2. Lọc theo cữ ăn
      if (mealSlotFilter !== 'all' && recipe.slotKey !== mealSlotFilter) {
        return false;
      }

      // 3. Lọc theo trạng thái ăn
      if (eatenStatusFilter === 'eaten' && !recipe.eaten) return false;
      if (eatenStatusFilter === 'uneaten' && recipe.eaten) return false;

      // 4. Lọc theo dị ứng
      if (allergyFilter === 'safe' && recipe.allergyWarning) return false;
      if (allergyFilter === 'warning' && !recipe.allergyWarning) return false;

      return true;
    });
  }, [activeRecipes, searchQuery, mealSlotFilter, eatenStatusFilter, allergyFilter]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    mealSlotFilter !== 'all' ||
    eatenStatusFilter !== 'all' ||
    allergyFilter !== 'all'
  );

  const resetFilters = () => {
    setSearchQuery('');
    setMealSlotFilter('all');
    setEatenStatusFilter('all');
    setAllergyFilter('all');
  };

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
    return recipe?.name_vi || recipe?.name_en || (typeof recipe === 'string' ? recipe : 'Chưa có món');
  };

  // Món tuần chỉ mở được công thức khi payload CÓ nguyên liệu và các bước nấu thật;
  // món chỉ có tên thì không dựng công thức mẫu (mapFastApiRecipe tự điền dữ liệu mẫu khi thiếu).
  const hasRecipeDetail = (raw) =>
    Boolean(raw) && typeof raw === 'object' && raw.ingredients?.length > 0 && raw.cooking_steps?.length > 0;

  const getWeeklyRecipeItem = (slotKey, dayIndex) => {
    const dayMenu = weeklyMenu?.days?.[dayIndex];
    const rawRecipe = dayMenu?.meals?.[slotKey];
    if (!hasRecipeDetail(rawRecipe)) return null;

    const dayName = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'][dayIndex] || `Ngày ${dayIndex + 1}`;
    const mapped = mapFastApiRecipe(slotKey, rawRecipe);
    if (!mapped) return null;

    return {
      ...mapped,
      slot: `${dayName} · ${mapped.slot}`,
      ageRange: activeStage.range,
      stageTitle: activeStage.title,
    };
  };

  const handleOpenWeeklyRecipe = (slotKey, dayIndex) => {
    const item = getWeeklyRecipeItem(slotKey, dayIndex);
    if (item) handleOpenRecipe(item);
  };

  const getEatenCoverage = () => {
    if (!activeRecipes.length) return 0;
    return Math.round((activeRecipes.filter((recipe) => recipe.eaten).length / activeRecipes.length) * 100);
  };

  const handleMarkEaten = (id) => {
    if (!selectedBaby) return;
    setEatenByBaby((prev) => {
      const forBaby = { ...(prev[selectedBaby.id] || {}) };
      if (forBaby[id]) delete forBaby[id];
      else forBaby[id] = true;
      return { ...prev, [selectedBaby.id]: forBaby };
    });
    toast.success('Đã cập nhật trạng thái ăn của bé.');
  };

  const handleRegenerateMenu = async () => {
    if (!selectedBaby) return;
    toast.loading('Đang tạo lại thực đơn phù hợp độ tuổi và dị ứng...', { id: 'regen' });
    // Thực đơn mới nên các dấu "đã cho ăn" của bé này bắt đầu lại
    setEatenByBaby((prev) => ({ ...prev, [selectedBaby.id]: {} }));
    await loadMenusForBaby(selectedBaby, true);
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

  // Món đã ăn hôm nay phục vụ cho tab Lịch sử
  const eatenRecipesToday = useMemo(() => {
    return activeRecipes.filter((r) => r.eaten);
  }, [activeRecipes]);

  const totalEatenNutrients = useMemo(() => {
    return eatenRecipesToday.reduce(
      (acc, r) => ({
        kcal: acc.kcal + r.kcal,
        count: acc.count + 1,
      }),
      { kcal: 0, count: 0 }
    );
  }, [eatenRecipesToday]);

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
      {/* Nút quay lại & Bộ chọn hồ sơ bé (Multi-baby selector) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/baby-nutrition')}
          className="inline-flex items-center gap-2 min-h-[44px] px-3.5 py-2 rounded-2xl border border-theme-line bg-theme-surface hover:bg-theme-sidebar text-xs sm:text-sm font-semibold text-theme-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Quay lại trang bé yêu</span>
        </button>

        {/* Bộ chọn hồ sơ bé nếu có nhiều hơn 1 bé, hoặc badge thông tin bé nếu chỉ có 1 bé */}
        {babies.length > 1 ? (
          <div className="flex w-full min-w-0 flex-col gap-1.5 sm:w-auto sm:flex-row sm:items-center sm:gap-2">
            <label htmlFor="select-baby-menu" className="text-xs font-bold text-theme-ink flex items-center gap-1.5">
              <Baby className="w-4 h-4 text-theme-brand shrink-0" aria-hidden="true" />
              <span>Hồ sơ bé:</span>
            </label>
            <div className="relative w-full min-w-0 sm:w-auto">
              <select
                id="select-baby-menu"
                value={selectedBaby?.id || ''}
                onChange={(e) => {
                  const target = babies.find((b) => String(b.id) === e.target.value);
                  if (target) handleSelectBaby(target);
                }}
                className="w-full max-w-full min-w-0 sm:w-auto appearance-none min-h-[44px] bg-theme-surface border border-theme-line pl-3.5 pr-9 py-2 rounded-2xl text-xs sm:text-sm font-bold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand cursor-pointer hover:bg-theme-sidebar transition-colors"
              >
                {babies.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name || b.babyName} ({b.gender === 0 ? 'Bé trai' : 'Bé gái'} · {getAgeMonthsFromBaby(b)} tháng)
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-theme-muted">
                <ChevronRight className="w-4 h-4 rotate-90" aria-hidden="true" />
              </div>
            </div>
          </div>
        ) : selectedBaby ? (
          <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-theme-surface border border-theme-line text-xs sm:text-sm">
            <Baby className="w-4 h-4 text-theme-brand shrink-0" aria-hidden="true" />
            <span className="font-bold text-theme-ink">{selectedBaby.name || selectedBaby.babyName}</span>
            <span className="text-theme-muted">•</span>
            <span className="font-semibold text-theme-muted">{ageMonths} tháng tuổi</span>
          </div>
        ) : null}
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
              WHO/CDC khuyến nghị mốc 6 tháng bắt đầu ăn bổ sung, khẩu phần và kết cấu thay đổi rõ khi bước sang 12 tháng. Thực đơn dưới đây được cá nhân hóa theo độ tuổi và danh sách dị ứng của bé.
            </p>
          </div>

          {/* Tiến độ ăn hôm nay */}
          <div className="w-full lg:w-72 p-4 rounded-2xl bg-theme-page border border-theme-line space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-theme-ink">
              <span>Món đã đánh dấu hôm nay</span>
              <span className={brandTextClass}>{eatenCoverage}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-theme-sidebar border border-theme-line">
              <div
                className={`h-full rounded-full transition-all duration-300 ${hasTheme ? 'bg-theme-brand' : 'bg-theme-ink'}`}
                style={{ width: `${clampedEatenWidth}%` }}
              />
            </div>
            <p className="text-xs font-medium text-theme-muted leading-snug">
              Tích chọn từng món đã ăn để theo dõi tiến độ. Thực đơn vẫn cần theo phản ứng và khả năng nhai nuốt của bé. Dấu chỉ lưu tạm trên trang này, chưa lưu lên máy chủ.
            </p>
          </div>
        </div>

        {/* Bộ lọc tab & nút tạo lại thực đơn */}
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
          {/* Hướng A: Thanh tìm kiếm và bộ lọc khám phá món ăn trong thực đơn hôm nay */}
          {!loading && activeRecipes.length > 0 && (
            <div className="rounded-2xl border border-theme-line bg-theme-surface p-4 sm:p-5 shadow-sm space-y-3.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h2 className="text-sm sm:text-base font-bold text-theme-ink flex items-center gap-2">
                    <Search className="w-4 h-4 text-theme-brand shrink-0" aria-hidden="true" />
                    <span>Khám phá món ăn trong thực đơn hôm nay</span>
                  </h2>
                  <p className="text-xs font-medium text-theme-muted">
                    Lọc và tìm kiếm nhanh theo tên món hoặc nguyên liệu trong các cữ ăn đã gợi ý cho bé.
                  </p>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-bold text-theme-muted hover:text-theme-ink px-2.5 py-1.5 rounded-md hover:bg-theme-sidebar transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>Đặt lại bộ lọc</span>
                  </button>
                )}
              </div>

              {/* Ô tìm kiếm từ khóa */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-theme-muted">
                  <Search className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên món (cháo, súp, bơ...) hoặc nguyên liệu (cá hồi, bí đỏ, yến mạch)..."
                  className="w-full min-h-[44px] rounded-2xl border border-theme-line bg-theme-page pl-10 pr-10 py-2.5 text-xs sm:text-sm font-semibold text-theme-ink placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-brand transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Xóa từ khóa tìm kiếm"
                    className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[32px] min-w-[32px] inline-flex items-center justify-center rounded-full text-theme-muted hover:text-theme-ink hover:bg-theme-sidebar transition-colors"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Bộ nút lọc cữ ăn và trạng thái */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-theme-line">
                {/* Lọc theo cữ ăn */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-bold text-theme-ink mr-1 hidden sm:inline">Cữ ăn:</span>
                  {MEAL_FILTER_OPTIONS.map((opt) => {
                    const isSelected = mealSlotFilter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMealSlotFilter(opt.id)}
                        className={`min-h-[36px] px-3 py-1 rounded-md text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                          isSelected
                            ? 'bg-theme-ink text-theme-surface'
                            : 'bg-theme-page text-theme-ink border border-theme-line hover:bg-theme-sidebar'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {/* Lọc theo trạng thái ăn & an toàn dị ứng */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-theme-muted shrink-0" aria-hidden="true" />
                    <span className="text-xs font-bold text-theme-ink">Trạng thái:</span>
                  </div>
                  <select
                    value={eatenStatusFilter}
                    onChange={(e) => setEatenStatusFilter(e.target.value)}
                    aria-label="Lọc theo trạng thái ăn"
                    className="appearance-none min-h-[36px] bg-theme-page border border-theme-line px-3 py-1 pr-7 rounded-md text-xs font-bold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand cursor-pointer hover:bg-theme-sidebar transition-colors"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="uneaten">Chưa cho bé ăn</option>
                    <option value="eaten">Bé đã ăn</option>
                  </select>

                  <select
                    value={allergyFilter}
                    onChange={(e) => setAllergyFilter(e.target.value)}
                    aria-label="Lọc theo cảnh báo dị ứng"
                    className="appearance-none min-h-[36px] bg-theme-page border border-theme-line px-3 py-1 pr-7 rounded-md text-xs font-bold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand cursor-pointer hover:bg-theme-sidebar transition-colors"
                  >
                    <option value="all">Tất cả món</option>
                    <option value="safe">Không có cảnh báo dị ứng</option>
                    <option value="warning">Có cảnh báo dị ứng</option>
                  </select>
                </div>
              </div>

              {/* Thông báo số lượng kết quả */}
              <div className="flex items-center justify-between text-xs font-semibold text-theme-muted pt-1">
                <span>
                  Hiển thị <strong>{filteredRecipes.length}</strong> / {activeRecipes.length} món trong thực đơn hôm nay
                </span>
                {hasActiveFilters && (
                  <span className="text-theme-brand font-bold">
                    Đang áp dụng bộ lọc trong thực đơn của bé
                  </span>
                )}
              </div>
            </div>
          )}

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

          {!loading && activeRecipes.length > 0 && filteredRecipes.length === 0 && (
            <div className="rounded-2xl border border-theme-line bg-theme-surface p-8 text-center space-y-3">
              <Search className="w-8 h-8 mx-auto text-theme-muted" aria-hidden="true" />
              <h3 className="text-base font-bold text-theme-ink">Không tìm thấy món ăn phù hợp</h3>
              <p className="text-xs sm:text-sm font-medium text-theme-muted max-w-md mx-auto">
                Không có món nào trong thực đơn hôm nay khớp với từ khóa &ldquo;{searchQuery}&rdquo; hoặc bộ lọc hiện tại.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-2xl bg-theme-ink text-theme-surface hover:bg-theme-sidebar hover:text-theme-ink text-xs sm:text-sm font-bold transition-colors"
              >
                <RotateCcw className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Xem lại toàn bộ thực đơn</span>
              </button>
            </div>
          )}

          {!loading && filteredRecipes.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecipes.map((recipe) => {
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

      {/* 3. BẢNG THỰC ĐƠN TUẦN 7 NGÀY - TƯƠNG TÁC XEM CÔNG THỨC */}
      {activeTab === 'weekly' && (
        <section className="overflow-x-auto rounded-2xl border border-theme-line bg-theme-surface p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-base font-bold text-theme-ink">
              <Calendar className="h-5 w-5 text-theme-brand shrink-0" aria-hidden="true" />
              <span>Khung thực đơn 7 ngày · {activeStage.range}</span>
            </h2>
            <p className="text-xs font-semibold text-theme-muted">
              Mẹ có thể bấm vào từng món trong bảng để xem công thức và cách làm chi tiết.
            </p>
          </div>

          {weeklyError && (
            <div role="alert" className="rounded-2xl border border-status-warn-line bg-status-warn-bg p-3.5 text-xs sm:text-sm font-semibold text-status-warn-text">
              {weeklyError}
            </div>
          )}
          {loading && <p className="text-xs font-semibold text-theme-muted">Đang tải thực đơn tuần...</p>}

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
                    {Array.from({ length: 7 }).map((_, index) => {
                      const mealName = getWeeklyMealForDay(slot.key, index);
                      const hasMeal = mealName && mealName !== 'Chưa có món';
                      const dayLabel = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'][index];
                      const weeklyItem = hasMeal ? getWeeklyRecipeItem(slot.key, index) : null;

                      return (
                        <td key={`${slot.key}-${index}`} className="px-1.5 py-2.5 align-top">
                          {hasMeal && weeklyItem ? (
                            <button
                              type="button"
                              onClick={() => handleOpenWeeklyRecipe(slot.key, index)}
                              aria-label={`Xem công thức món ${mealName} bữa ${slot.label} ${dayLabel}`}
                              title="Bấm để xem công thức và cách nấu"
                              className="w-full text-left rounded-2xl bg-theme-page border border-theme-line p-2.5 text-xs font-semibold leading-snug text-theme-ink min-h-[64px] flex flex-col justify-between hover:bg-theme-sidebar transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand group cursor-pointer"
                            >
                              <span className="group-hover:text-theme-brand transition-colors line-clamp-2">
                                {mealName}
                              </span>
                              <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-theme-muted mt-1.5 group-hover:text-theme-ink transition-colors">
                                <BookOpen className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                                <span>Xem cách nấu</span>
                              </span>
                            </button>
                          ) : hasMeal ? (
                            <div className="w-full rounded-2xl bg-theme-page border border-theme-line p-2.5 text-xs font-semibold leading-snug text-theme-ink min-h-[64px] flex flex-col justify-between">
                              <span className="line-clamp-2">{mealName}</span>
                              <span className="text-[12px] font-medium text-theme-muted mt-1.5">Chưa có công thức chi tiết</span>
                            </div>
                          ) : (
                            <div className="rounded-2xl bg-theme-page/50 border border-dashed border-theme-line p-2.5 text-xs font-medium leading-snug text-theme-muted min-h-[64px] flex items-center justify-center text-center">
                              Chưa có món
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {/* 4. TAB LỊCH SỬ ĂN DẶM - TRÌNH BÀY MINH BẠCH VÀ HỮU ÍCH TRONG PHIÊN */}
      {activeTab === 'history' && (
        <section className="space-y-4">
          <div className="rounded-2xl border border-theme-line bg-theme-surface p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${brandBadgeClass}`}>
                  <Award className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-theme-ink">
                    Nhật ký các món bé đã ăn hôm nay
                  </h2>
                  <p className="text-xs font-medium text-theme-muted">
                    Tổng kết các cữ ăn mẹ đã tích chọn trong phiên hiện tại.
                  </p>
                </div>
              </div>

              {eatenRecipesToday.length > 0 && (
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-status-ok text-theme-surface text-xs font-bold self-start sm:self-auto">
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>Hoàn thành {eatenRecipesToday.length}/{activeRecipes.length} món</span>
                </div>
              )}
            </div>

            {/* Thông báo minh bạch về phạm vi dữ liệu trong phiên */}
            <div className="rounded-2xl bg-theme-page border border-theme-line p-3.5 text-xs font-medium leading-relaxed text-theme-muted flex items-start gap-2.5">
              <Info className="w-4 h-4 text-theme-brand shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                <strong>Ghi chú phạm vi dữ liệu:</strong> Dấu &ldquo;Đã cho bé ăn&rdquo; chỉ được nhớ tạm trong bộ nhớ khi mẹ đang mở trang này (riêng cho từng bé). Dấu sẽ mất khi tải lại trang, rời khỏi trang hoặc khi tạo lại thực đơn; chưa được lưu lên máy chủ.
              </span>
            </div>

            {/* Danh sách các món đã ăn hôm nay */}
            {eatenRecipesToday.length > 0 ? (
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {eatenRecipesToday.map((item) => (
                    <div
                      key={`eaten-${item.id}`}
                      className="rounded-2xl border border-theme-line bg-theme-page p-4 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${brandBadgeClass}`}>
                            Bữa {item.slot}
                          </span>
                          <span className="text-xs font-semibold text-theme-muted">{item.time}</span>
                        </div>
                        <h3 className="text-sm font-bold text-theme-ink truncate">{item.name}</h3>
                        <p className="text-xs font-semibold text-theme-muted">
                          Theo công thức: <strong className="text-theme-ink">{item.kcal} kcal</strong> · Đạm: {item.protein}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenRecipe(item)}
                        className="min-h-[40px] px-3 py-1.5 rounded-md border border-theme-line bg-theme-surface hover:bg-theme-sidebar text-xs font-bold text-theme-ink shrink-0 transition-colors"
                      >
                        Xem lại
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-theme-brand-soft border border-theme-line flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-theme-ink">
                    Tổng năng lượng theo công thức của các món đã đánh dấu (không phải lượng bé thực ăn):
                  </span>
                  <span className={`text-base font-bold ${brandTextClass}`}>
                    {totalEatenNutrients.kcal} kcal ({totalEatenNutrients.count} cữ ăn)
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-theme-line p-8 text-center space-y-3">
                <Utensils className="w-8 h-8 mx-auto text-theme-muted" aria-hidden="true" />
                <h3 className="text-sm sm:text-base font-bold text-theme-ink">
                  Chưa có món nào được đánh dấu đã ăn hôm nay
                </h3>
                <p className="text-xs sm:text-sm font-medium text-theme-muted max-w-sm mx-auto">
                  Mẹ có thể chuyển sang tab &ldquo;Hôm nay&rdquo; và bấm nút &ldquo;Đã cho bé ăn&rdquo; trên từng thẻ món để cập nhật tiến độ dinh dưỡng.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('today')}
                  className={`inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-colors ${primaryBtnClass}`}
                >
                  <Utensils className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Xem thực đơn hôm nay</span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 5. Chọn giai đoạn độ tuổi ăn dặm & Gợi ý chuẩn bị kết cấu */}
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
