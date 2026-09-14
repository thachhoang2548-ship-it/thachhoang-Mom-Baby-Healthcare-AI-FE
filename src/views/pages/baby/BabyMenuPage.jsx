import React, { useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import babyService from '../../../models/services/babyService';

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
  breakfast: { slot: 'Sáng', time: '07:30', emoji: '🥣' },
  lunch: { slot: 'Trưa', time: '11:30', emoji: '🍲' },
  snack: { slot: 'Chiều', time: '15:30', emoji: '🍌' },
  dinner: { slot: 'Tối', time: '18:30', emoji: '🥣' },
  supplementary_snack: { slot: 'Phụ', time: '20:00', emoji: '🍼' },
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

  const meta = SLOT_META[key] || { slot: 'Bữa ăn', time: '--:--', emoji: '🍽️' };
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
    emoji: meta.emoji,
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

  const ageMonths = getAgeMonthsFromBaby(selectedBaby);
  const activeStage = AGE_STAGES[selectedStageId];
  const ageMatchedStageId = getStageIdFromAge(ageMonths);

  const loadMenus = async (forceRefresh = false) => {
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
  };

  useEffect(() => {
    loadMenus();
  }, []);

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
      { key: 'breakfast', label: 'Sáng', color: 'bg-rose-50 text-rose-700' },
      { key: 'lunch', label: 'Trưa', color: 'bg-violet-50 text-violet-700' },
      { key: 'snack', label: 'Chiều', color: 'bg-amber-50 text-amber-700' },
      { key: 'dinner', label: 'Tối', color: 'bg-emerald-50 text-emerald-700' },
    ];

    if (selectedStageId === 'toddler') {
      return [...base, { key: 'supplementary_snack', label: 'Phụ', color: 'bg-sky-50 text-sky-700' }];
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

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/baby-nutrition')}
        className="flex items-center gap-2 text-xs font-bold text-gray-500 transition hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại trang bé yêu
      </button>

      <section className="rounded-lg border border-rose-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-md bg-rose-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-rose-600">
              <Utensils className="h-4 w-4" />
              Thực đơn sau thai kỳ cho bé
            </span>
            <h2 className="mt-4 text-2xl font-black tracking-tight text-gray-950">
              Chia thực đơn theo 2 độ tuổi ăn dặm
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-gray-500">
              WHO/CDC thường dùng mốc 6 tháng để bắt đầu ăn bổ sung, sau đó khẩu phần và kết cấu thay đổi rõ khi bé bước sang 12 tháng. Vì vậy giao diện chia thành 6-11 tháng và 12-24 tháng.
            </p>
          </div>

          {selectedBaby && (
            <div className="rounded-lg bg-[#FFF8F6] p-4 text-sm font-bold text-gray-700">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Hồ sơ đang dùng</p>
              <p className="mt-1 text-base font-black text-gray-950">{selectedBaby.name || selectedBaby.babyName}</p>
              <p className="mt-1 text-xs text-gray-500">Tuổi hiện tại: {ageMonths} tháng</p>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {Object.values(AGE_STAGES).map((stage) => {
            const selected = selectedStageId === stage.id;
            const matched = ageMatchedStageId === stage.id && selectedBaby;

            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStageId(stage.id)}
                className={`rounded-lg border p-4 text-left transition ${
                  selected
                    ? 'border-rose-300 bg-rose-50 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-rose-200 hover:bg-rose-50/40'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-md bg-white px-2.5 py-1 text-xs font-black text-rose-600 shadow-sm">
                    {stage.range}
                  </span>
                  {matched && (
                    <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-700">
                      Phù hợp bé
                    </span>
                  )}
                </div>
                <h3 className="mt-3 text-base font-black text-gray-950">{stage.title}</h3>
                <p className="mt-1 text-xs font-semibold text-gray-500">{stage.subtitle}</p>
                <div className="mt-4 grid gap-2 text-xs font-bold text-gray-600">
                  <span>Suất ăn: {stage.meals}</span>
                  <span>Kết cấu: {stage.texture}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-gray-950">{activeStage.title}</h3>
              <p className="text-xs font-semibold text-gray-400">{activeStage.range}</p>
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold leading-6 text-gray-500">{activeStage.note}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {activeStage.focus.map((item) => (
              <span key={item} className="rounded-md bg-gray-100 px-2.5 py-1 text-[11px] font-black text-gray-600">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between text-xs font-black uppercase text-gray-500">
            <span>Độ hoàn thành dinh dưỡng hôm nay</span>
            <span className="text-rose-600">{getEatenCoverage()}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-rose-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-400 to-violet-400 transition-all duration-300"
              style={{ width: `${getEatenCoverage()}%` }}
            />
          </div>
          <p className="mt-3 text-xs font-semibold text-gray-400">
            Tích chọn từng món đã ăn để theo dõi tiến độ. Thực đơn vẫn cần theo phản ứng và khả năng nhai nuốt của bé.
          </p>
        </div>
      </section>

      <div className="flex max-w-sm gap-1.5 rounded-lg border border-gray-100 bg-white p-1 shadow-sm">
        {TAB_ITEMS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-md py-2 text-xs font-black transition ${
              activeTab === tab.id ? 'bg-gray-950 text-white' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'today' && (
        <section className="space-y-4">
          {loading && (
            <div className="rounded-lg border border-gray-100 bg-white p-6 text-center text-sm font-bold text-gray-500">
              Đang tải thực đơn cho bé...
            </div>
          )}

          {!loading && !activeRecipes.length && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
              <p className="text-sm font-black text-amber-900">Chưa có thực đơn cho bé</p>
              <p className="mt-1 text-xs font-semibold leading-6 text-amber-800">
                {menuError || 'Không thể kết nối dịch vụ dinh dưỡng. Vui lòng thử lại sau.'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activeRecipes.map((recipe) => (
              <article
                key={recipe.id}
                className={`rounded-lg border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  recipe.eaten ? 'border-emerald-300 bg-emerald-50/40' : 'border-gray-100'
                }`}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <span className="rounded-md bg-rose-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-rose-600">
                      {recipe.slot} · {recipe.time}
                    </span>
                    <h3 className="mt-3 flex items-center gap-2 text-base font-black text-gray-950">
                      <span className="text-xl">{recipe.emoji}</span>
                      {recipe.name}
                    </h3>
                  </div>
                  {recipe.eaten && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700">
                      <Check className="h-3 w-3" />
                      Đã ăn
                    </span>
                  )}
                </div>

                <div className="mb-4 flex flex-wrap gap-1.5">
                  {recipe.tags.map((tag) => (
                    <span
                      key={`${recipe.id}-${tag}`}
                      className={`rounded-md px-2 py-1 text-[10px] font-black ${
                        recipe.allergyWarning ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 border-y border-gray-100 py-3 text-xs font-bold text-gray-500">
                  <span className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-rose-500" />
                    {recipe.kcal} kcal
                  </span>
                  <span>Đạm: {recipe.protein}</span>
                  <span>Sắt: {recipe.iron}</span>
                </div>

                {recipe.allergyWarning && (
                  <p className="mt-3 rounded-md bg-red-50 p-3 text-xs font-bold leading-5 text-red-700">
                    Món này có thể trùng với danh sách dị ứng/kiêng của bé. Mẹ nên tạo lại thực đơn hoặc hỏi chuyên gia trước khi cho ăn.
                  </p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenRecipe(recipe)}
                    className="rounded-lg border border-rose-200 py-2.5 text-xs font-black text-rose-600 transition hover:bg-rose-50"
                  >
                    Xem công thức
                  </button>
                  <button
                    onClick={() => handleMarkEaten(recipe.id)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-black transition active:scale-95 ${
                      recipe.eaten ? 'bg-emerald-500 text-white' : 'bg-gray-950 text-white'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                    {recipe.eaten ? 'Bé đã ăn' : 'Đã cho bé ăn'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          <button
            onClick={handleRegenerateMenu}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-rose-500 to-violet-500 py-3 text-xs font-black text-white shadow-sm transition active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Tạo thực đơn mới tránh dị ứng
          </button>
        </section>
      )}

      {activeTab === 'weekly' && (
        <section className="overflow-x-auto rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-wide text-gray-950">
            <Calendar className="h-4 w-4 text-rose-500" />
            Khung thực đơn 7 ngày · {activeStage.range}
          </h3>

          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-3 text-[10px] font-black uppercase text-gray-400">Bữa</th>
                {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day) => (
                  <th key={day} className="py-3 text-center text-[10px] font-black uppercase text-gray-400">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeklySlots.map((slot) => (
                <tr key={slot.key} className="border-b border-gray-50">
                  <td className="py-3 text-xs font-black text-gray-800">{slot.label}</td>
                  {Array.from({ length: 7 }).map((_, index) => (
                    <td key={`${slot.key}-${index}`} className="px-1 py-2 text-center">
                      <div className={`rounded-lg px-2 py-2 text-[10px] font-bold leading-4 ${slot.color}`}>
                        {getWeeklyMealForDay(slot.key, index)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === 'history' && (
        <section className="rounded-lg border border-gray-100 bg-white p-8 text-center shadow-sm">
          <Award className="mx-auto h-10 w-10 text-gray-300" />
          <h3 className="mt-3 text-sm font-black text-gray-800">Lịch sử ăn dặm</h3>
          <p className="mt-1 text-xs font-semibold text-gray-400">
            Chưa ghi nhận lịch sử ăn dặm nào trước đó của bé.
          </p>
        </section>
      )}

      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="max-h-[86vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white/95 px-5 py-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="text-xl">{selectedRecipe.emoji}</span>
                <div>
                  <h3 className="text-sm font-black text-gray-950">{selectedRecipe.name}</h3>
                  <p className="text-xs font-semibold text-gray-400">
                    {selectedRecipe.slot} · {selectedRecipe.ageRange}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="rounded-md p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex gap-2 border-b border-gray-100 px-5 pt-3">
              {[
                { id: 'ingredients', label: 'Nguyên liệu' },
                { id: 'steps', label: 'Cách làm' },
                { id: 'nutrition', label: 'Dinh dưỡng' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setModalTab(tab.id)}
                  className={`border-b-2 pb-2 text-xs font-black transition ${
                    modalTab === tab.id ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-400'
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
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm font-semibold text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedIngredients[item.name]}
                        onChange={() => toggleIngredientCheck(item.name)}
                        className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                      />
                      <span className={checkedIngredients[item.name] ? 'text-gray-400 line-through' : ''}>
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
                        <div key={`${selectedRecipe.id}-step-${index}`} className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-black text-rose-600">
                            {index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold leading-6 text-gray-700">{step.desc}</p>
                            <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-gray-400">
                              <Clock className="h-3 w-3" />
                              {step.time}
                            </span>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setCookingMode(true);
                          setCurrentStepIdx(0);
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-950 py-3 text-xs font-black text-white"
                      >
                        <BookOpen className="h-4 w-4" />
                        Bắt đầu chế biến từng bước
                      </button>
                    </>
                  ) : (
                    <div className="space-y-5 text-center">
                      <span className="rounded-md bg-rose-50 px-3 py-1 text-xs font-black text-rose-600">
                        Bước {currentStepIdx + 1}/{selectedRecipe.steps.length}
                      </span>
                      <p className="text-lg font-black leading-7 text-gray-950">
                        {selectedRecipe.steps[currentStepIdx].desc}
                      </p>
                      <p className="text-xs font-bold text-gray-400">
                        Thời gian đề xuất: {selectedRecipe.steps[currentStepIdx].time}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          disabled={currentStepIdx === 0}
                          onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                          className="rounded-lg border border-gray-200 py-3 text-xs font-black text-gray-500 disabled:opacity-40"
                        >
                          Bước trước
                        </button>
                        {currentStepIdx < selectedRecipe.steps.length - 1 ? (
                          <button
                            onClick={() => setCurrentStepIdx((prev) => prev + 1)}
                            className="inline-flex items-center justify-center gap-1 rounded-lg bg-rose-500 py-3 text-xs font-black text-white"
                          >
                            Bước tiếp
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setCookingMode(false);
                              toast.success('Đã hoàn thành món ăn.');
                            }}
                            className="rounded-lg bg-emerald-500 py-3 text-xs font-black text-white"
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
                  <div className="rounded-lg bg-rose-50 p-4 text-center">
                    <p className="text-xs font-black uppercase text-gray-400">Tổng năng lượng</p>
                    <p className="mt-1 text-3xl font-black text-rose-600">
                      {selectedRecipe.kcal} <span className="text-sm text-gray-500">kcal</span>
                    </p>
                  </div>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedRecipe.nutritionData} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 700 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#f43f5e" radius={[0, 8, 8, 0]} barSize={18} />
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
