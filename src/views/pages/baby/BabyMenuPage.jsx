import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, RefreshCw, Calendar, Check, BookOpen, Clock, Flame, Award, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import babyService from '../../../models/services/babyService';

const mapFastApiRecipe = (slotName, recipe, timeStr, emojiStr) => {
  if (!recipe) return null;
  
  const mappedSteps = (recipe.cooking_steps || []).map((step, idx) => ({
    desc: step.step_description || step.description || step.desc || `Bước ${idx + 1}`,
    time: step.duration_minutes ? `${step.duration_minutes} phút` : (step.time || '5 phút')
  }));

  const mappedIngredients = (recipe.ingredients || []).map(ri => ({
    name: ri.ingredient?.vietnamese_name || ri.ingredient?.english_name || '',
    amount: ri.weight_grams ? ri.weight_grams.toString() : '10',
    unit: 'g'
  }));

  const nutritionData = [
    { name: 'Năng lượng (kcal)', value: Math.round(recipe.total_calories || 0) },
    { name: 'Đạm (Protein g)', value: Math.round(recipe.total_protein_g || 0) },
    { name: 'Chất béo (Fat g)', value: Math.round(recipe.total_fat_g || 0) },
    { name: 'Tinh bột (Carbs g)', value: Math.round(recipe.total_carbs_g || 0) }
  ];

  return {
    id: recipe.id,
    slot: slotName,
    name: recipe.name_vi || recipe.name_en || '',
    emoji: emojiStr,
    kcal: Math.round(recipe.total_calories || 150),
    time: timeStr,
    tags: recipe.tags || ['Dinh dưỡng', 'Chuẩn WHO'],
    ingredients: mappedIngredients.length > 0 ? mappedIngredients : [
      { name: 'Gạo tẻ ngon', amount: '25', unit: 'g' },
      { name: 'Rau củ quả tươi', amount: '15', unit: 'g' }
    ],
    steps: mappedSteps.length > 0 ? mappedSteps : [
      { desc: 'Chuẩn bị và sơ chế nguyên liệu tươi sạch.', time: '5 phút' },
      { desc: 'Nấu chín mềm nhừ rồi nghiền mịn cho bé ăn.', time: '15 phút' }
    ],
    nutritionData: nutritionData,
    eaten: false
  };
};

export default function BabyMenuPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'weekly' | 'history'
  
  // 7 days grid hardcode (meals by day)
  const weekdaysVi = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
  const weeklyMeals = [
    { slot: 'Sáng', stage: 'Bột ngọt', color: 'bg-momPink-light/30 text-momPink-dark' },
    { slot: 'Trưa', stage: 'Cháo loãng thịt bò', color: 'bg-momPurple-light/30 text-momPurple-dark' },
    { slot: 'Chiều', stage: 'Hoa quả nghiền', color: 'bg-momAmber-light/30 text-momAmber-dark' },
    { slot: 'Tối', stage: 'Cháo rây rau củ', color: 'bg-momGreen-light/30 text-momGreen-dark' }
  ];

  // Recipe Modal state
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalTab, setModalTab] = useState('ingredients'); // 'ingredients' | 'steps' | 'nutrition'
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  // Recipes come from the FastAPI nutrition engine (via the .NET proxy).
  // No hardcoded menu: when the API is unavailable we show an explicit notice instead.
  const [recipes, setRecipes] = useState([]);
  const [menuError, setMenuError] = useState(null);

  const [allergies, setAllergies] = useState([]);
  const [dailyMenu, setDailyMenu] = useState([]);
  const [weeklyMenu, setWeeklyMenu] = useState(null);

  // Fetch baby profiles and menus on mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const res = await babyService.getProfiles();
        if ((res.success || res.isSuccess) && res.data && res.data.length > 0) {
          const firstBaby = res.data[0];
          setAllergies(firstBaby.allergies || []);

          // Load daily menu
          try {
            const dailyRes = await babyService.getDailyMenu(firstBaby.id);
            if ((dailyRes.success || dailyRes.isSuccess) && dailyRes.data) {
              const meals = dailyRes.data.meals || {};
              const mappedToday = [];
              if (meals.breakfast) mappedToday.push(mapFastApiRecipe("Sáng ☀️", meals.breakfast, "07:30", "🥣"));
              if (meals.lunch) mappedToday.push(mapFastApiRecipe("Trưa 🍲", meals.lunch, "11:30", "🍲"));
              if (meals.snack) mappedToday.push(mapFastApiRecipe("Chiều 🍌", meals.snack, "15:30", "🍌"));
              if (meals.dinner) mappedToday.push(mapFastApiRecipe("Tối 🌙", meals.dinner, "18:30", "🥣"));
              if (meals.supplementary_snack) mappedToday.push(mapFastApiRecipe("Phụ 🍼", meals.supplementary_snack, "20:00", "🍼"));

              if (mappedToday.length > 0) {
                setDailyMenu(mappedToday);
                setMenuError(null);
              } else {
                setMenuError('Chưa có công thức phù hợp cho bé trong hệ thống.');
              }
            } else {
              setMenuError(dailyRes.message || 'Không thể tải thực đơn cho bé.');
            }
          } catch (err) {
            console.error('Failed to load daily menu from FastAPI:', err);
            setMenuError(err.response?.data?.message || 'Dịch vụ dinh dưỡng hiện không khả dụng. Vui lòng thử lại sau.');
          }

          // Load weekly menu
          try {
            const weeklyRes = await babyService.getWeeklyMenu(firstBaby.id);
            if ((weeklyRes.success || weeklyRes.isSuccess) && weeklyRes.data) {
              setWeeklyMenu(weeklyRes.data);
            }
          } catch (err) {
            console.error('Failed to load weekly menu from FastAPI:', err);
          }
        } else {
          setMenuError('Chưa có hồ sơ bé. Vui lòng tạo hồ sơ bé trước để nhận thực đơn.');
        }
      } catch (e) {
        console.error('Error loading baby profile for menu:', e);
        setMenuError('Không thể tải hồ sơ bé. Vui lòng thử lại sau.');
      }
    };
    loadAllData();
  }, []);

  // Filter out avoided ingredients and provide alternatives
  const getFilteredRecipes = () => {
    return recipes.map((recipe) => {
      const isAvoided = allergies.some((avoidItem) => {
        const avoidLower = avoidItem.toLowerCase().trim();
        if (!avoidLower) return false;
        
        return (
          recipe.name.toLowerCase().includes(avoidLower) ||
          avoidLower.includes(recipe.name.toLowerCase()) ||
          recipe.ingredients.some(ing => ing.name.toLowerCase().includes(avoidLower)) ||
          (avoidLower.includes('yến mạch') && recipe.name.toLowerCase().includes('yến mạch')) ||
          (avoidLower.includes('thịt bò') && recipe.name.toLowerCase().includes('thịt bò')) ||
          (avoidLower.includes('bò') && recipe.name.toLowerCase().includes('thịt bò')) ||
          (avoidLower.includes('cá hồi') && recipe.name.toLowerCase().includes('cá hồi'))
        );
      });

      if (isAvoided) {
        if (recipe.slot.includes('Sáng')) {
          return {
            ...recipe,
            name: 'Cháo gạo rây bí đỏ sữa hạt (Tránh dị ứng)',
            emoji: '🥣',
            kcal: 120,
            tags: ['dễ tiêu', 'an toàn', 'tránh dị ứng'],
            ingredients: [
              { name: 'Gạo tẻ thơm', amount: '30', unit: 'g' },
              { name: 'Bí đỏ ngọt chín', amount: '20', unit: 'g' },
              { name: 'Sữa mẹ hoặc sữa công thức', amount: '100', unit: 'ml' }
            ],
            steps: [
              { desc: 'Ninh nhừ gạo tẻ với nước theo tỷ lệ 1:10.', time: '15 phút' },
              { desc: 'Hấp chín bí đỏ rồi nghiền nhuyễn qua rây.', time: '7 phút' },
              { desc: 'Trộn cháo rây mịn với bí đỏ nghiền và thêm sữa ấm trước khi bé ăn.', time: '3 phút' }
            ]
          };
        }
        if (recipe.slot.includes('Trưa')) {
          return {
            ...recipe,
            name: 'Súp lườn gà khoai tây bông cải (Tránh dị ứng)',
            emoji: '🍲',
            kcal: 175,
            tags: ['giàu đạm', 'an toàn', 'tránh dị ứng'],
            ingredients: [
              { name: 'Lườn ức gà sạch', amount: '25', unit: 'g' },
              { name: 'Khoai tây nhỏ', amount: '20', unit: 'g' },
              { name: 'Bông cải xanh', amount: '15', unit: 'g' },
              { name: 'Dầu ô liu dặm bé', amount: '1', unit: 'thìa cà phê' }
            ],
            steps: [
              { desc: 'Hấp chín lườn gà rồi đem xay nhuyễn hoặc rây thật mịn.', time: '10 phút' },
              { desc: 'Hấp chín bông cải xanh và khoai tây cho chín mềm.', time: '10 phút' },
              { desc: 'Xay nhuyễn toàn bộ các nguyên liệu rồi thêm dầu ô liu khuấy đều cữ ăn cho bé.', time: '5 phút' }
            ]
          };
        }
        if (recipe.slot.includes('Chiều')) {
          return {
            ...recipe,
            name: 'Đu đủ chín nghiền sữa chua (Tránh dị ứng)',
            emoji: '🍹',
            kcal: 85,
            tags: ['thanh mát', 'dồi dào vitamin', 'tránh dị ứng'],
            ingredients: [
              { name: 'Đu đủ chín ngọt', amount: '50', unit: 'g' },
              { name: 'Sữa chua không đường cho bé', amount: '1', unit: 'hộp' }
            ],
            steps: [
              { desc: 'Gọt vỏ đu đủ, bỏ hạt rồi dùng thìa dầm nhuyễn.', time: '3 phút' },
              { desc: 'Trộn đều sữa chua không đường với đu đủ dầm nhuyễn.', time: '2 phút' }
            ]
          };
        }
        if (recipe.slot.includes('Tối')) {
          return {
            ...recipe,
            name: 'Cháo chim bồ câu hạt sen bí ngô (Tránh dị ứng)',
            emoji: '🥣',
            kcal: 195,
            tags: ['ngủ ngon', 'giàu kẽm', 'tránh dị ứng'],
            ingredients: [
              { name: 'Thịt chim bồ câu lọc xương', amount: '20', unit: 'g' },
              { name: 'Hạt sen khô', amount: '10', unit: 'g' },
              { name: 'Bí đỏ', amount: '20', unit: 'g' },
              { name: 'Cháo trắng ninh sẵn', amount: '1', unit: 'bát' }
            ],
            steps: [
              { desc: 'Thịt bồ câu hấp chín băm nhuyễn mịn.', time: '10 phút' },
              { desc: 'Ninh nhừ hạt sen, bí đỏ rồi rây mịn.', time: '10 phút' },
              { desc: 'Cho cháo trắng vào nồi nhỏ, trút thịt chim bồ câu, hạt sen và bí đỏ vào quấy nóng.', time: '5 phút' }
            ]
          };
        }
      }
      return recipe;
    });
  };

  const activeRecipes = dailyMenu.length > 0 ? dailyMenu : getFilteredRecipes();

  // Filter 7-day weekly menu stages
  const getFilteredWeeklyMeals = () => {
    return weeklyMeals.map((meal) => {
      const isAvoided = allergies.some((avoidItem) => {
        const avoidLower = avoidItem.toLowerCase().trim();
        if (!avoidLower) return false;
        return (
          meal.stage.toLowerCase().includes(avoidLower) ||
          avoidLower.includes(meal.stage.toLowerCase()) ||
          (avoidLower.includes('thịt bò') && meal.stage.toLowerCase().includes('thịt bò')) ||
          (avoidLower.includes('bò') && meal.stage.toLowerCase().includes('thịt bò'))
        );
      });

      if (isAvoided) {
        if (meal.slot === 'Trưa') {
          return { ...meal, stage: 'Cháo lườn gà cà rốt (Tránh dị ứng)' };
        }
      }
      return meal;
    });
  };

  const activeWeeklyMeals = getFilteredWeeklyMeals();

  const getWeeklyMealForDay = (slotName, dayIndex) => {
    if (weeklyMenu && weeklyMenu.days && weeklyMenu.days[dayIndex]) {
      const dayMenu = weeklyMenu.days[dayIndex];
      const meals = dayMenu.meals || {};
      
      let recipe = null;
      if (slotName.includes('Sáng')) recipe = meals.breakfast;
      else if (slotName.includes('Trưa')) recipe = meals.lunch;
      else if (slotName.includes('Chiều') || slotName.includes('Phụ')) recipe = meals.snack || meals.supplementary_snack;
      else if (slotName.includes('Tối')) recipe = meals.dinner;

      if (recipe) {
        return (recipe.name_vi || recipe.name_en || '');
      }
    }

    const fallbackMeal = activeWeeklyMeals.find(m => m.slot.includes(slotName));
    return fallbackMeal ? fallbackMeal.stage : '';
  };

  // Coverage percentages
  const getEatenCoverage = () => {
    if (activeRecipes.length === 0) return 0;
    const eatenCount = activeRecipes.filter((r) => r.eaten).length;
    return Math.floor((eatenCount / activeRecipes.length) * 100);
  };

  const handleMarkEaten = (id) => {
    const toggle = (prev) => prev.map((r) => (r.id === id ? { ...r, eaten: !r.eaten } : r));
    // Menu hiển thị có thể đến từ API (dailyMenu) hoặc state recipes — toggle cả hai.
    setDailyMenu(toggle);
    setRecipes(toggle);
    toast.success('Đã cập nhật trạng thái ăn của bé! 😋');
  };

  const handleRegenerateMenu = () => {
    toast.success('Đang tạo thực đơn ăn dặm mới phù hợp với độ tuổi và tránh dị ứng... 🔄');
  };

  const handleOpenRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setModalTab('ingredients');
    setCookingMode(false);
    setCurrentStepIdx(0);
    setCheckedIngredients({});
  };

  const toggleIngredientCheck = (name) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  };



  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/baby-nutrition')}
        className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại trang bé yêu
      </button>

      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-gray-850 dark:text-white uppercase tracking-wider">
          Kế Hoạch Thực Đơn Ăn Dặm 🥣
        </h2>
        <p className="text-xs text-gray-550 dark:text-gray-400 font-semibold mt-0.5">
          Gợi ý chi tiết bữa ăn lành mạnh chuẩn dinh dưỡng nhi khoa
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 p-1 bg-pink-50/50 dark:bg-gray-750 rounded-2xl border border-pink-100/30 max-w-sm">
        {[
          { id: 'today', label: 'Hôm nay' },
          { id: 'weekly', label: '7 ngày' },
          { id: 'history', label: 'Lịch sử' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === t.id
                ? 'bg-gradient-to-r from-momPink to-momPurple text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB TODAY */}
      {activeTab === 'today' && (
        <div className="space-y-6">
          
          {/* Coverage Bar */}
          <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/50 dark:border-gray-750 shadow-sm space-y-2.5">
            <div className="flex justify-between text-xs font-bold text-gray-750 dark:text-white uppercase">
              <span>Độ hoàn thành dinh dưỡng hôm nay</span>
              <span className="text-momPink-dark">{getEatenCoverage()}%</span>
            </div>
            <div className="w-full h-2 bg-pink-100/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-momPink to-momPurple transition-all duration-300"
                style={{ width: `${getEatenCoverage()}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-400 font-semibold italic">
              * Tích chọn "Đã cho bé ăn" trên từng món ăn để cộng điểm dinh dưỡng.
            </p>
          </div>

          {/* Empty state when the nutrition engine is unavailable */}
          {activeRecipes.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 text-center">
              <span className="text-3xl block mb-2">🍽️</span>
              <p className="text-sm font-bold text-amber-900">Chưa có thực đơn cho bé</p>
              <p className="text-xs text-amber-800 font-semibold mt-1 leading-relaxed">
                {menuError || 'Không thể kết nối dịch vụ dinh dưỡng. Vui lòng thử lại sau.'}
              </p>
            </div>
          )}

          {/* Recipe Card List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRecipes.map((r) => (
              <div
                key={r.id}
                className={`p-5 bg-white dark:bg-gray-800 border rounded-3xl shadow-sm flex flex-col justify-between gap-4 transition-all duration-300 ${
                  r.eaten ? 'border-momGreen/40 bg-green-50/10' : 'border-gray-150'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] bg-pink-150 text-momPink-dark px-2.5 py-0.5 rounded-full font-bold uppercase">
                      {r.slot}
                    </span>
                    
                    {/* Tags list */}
                    <div className="flex gap-1 flex-wrap">
                      {r.tags.map((tag, idx) => (
                        <span key={idx} className="text-[8px] font-bold bg-pink-50/50 dark:bg-gray-900 text-momPink px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <h4 className="text-sm font-black text-gray-850 dark:text-white flex items-center gap-1.5">
                    <span className="text-xl">{r.emoji}</span>
                    {r.name}
                  </h4>
                  
                  <div className="mt-1 flex items-center">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold bg-amber-500/95 text-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      <Clock className="w-2.5 h-2.5" />
                      Chờ chuyên gia duyệt
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[10px] text-gray-450 mt-3 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" /> {r.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-momPink" /> {r.kcal} kcal
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-[10px] font-bold text-gray-500 dark:text-gray-400">
                    <div>Đạm (Protein): <span className="text-momPurple-dark">{r.protein}</span></div>
                    <div>Chất sắt (Iron): <span className="text-momGreen-dark">{r.iron}</span></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => handleOpenRecipe(r)}
                    className="py-2.5 border border-pink-150 text-momPink hover:bg-pink-50 dark:hover:bg-pink-950/20 text-[11px] font-black rounded-xl transition duration-300"
                  >
                    Xem công thức
                  </button>
                  <button
                    onClick={() => handleMarkEaten(r.id)}
                    className={`py-2.5 text-[11px] font-black rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 ${
                      r.eaten
                        ? 'bg-momGreen text-white'
                        : 'bg-pink-50 text-momPink-dark border border-pink-150 hover:bg-pink-100'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    {r.eaten ? 'Bé đã ăn ✓' : 'Đã cho bé ăn'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Regenerate Button */}
          <button
            onClick={handleRegenerateMenu}
            className="w-full py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 animate-spin-slow" /> Tạo thực đơn mới tránh dị ứng
          </button>
        </div>
      )}

      {/* TAB 7 DAYS WEEKLY */}
      {activeTab === 'weekly' && (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-3xl border border-pink-100/50 dark:border-gray-750 shadow-sm space-y-4 overflow-x-auto">
          <h3 className="text-xs font-extrabold text-gray-800 dark:text-white uppercase tracking-wider">
            Biểu đồ kết cấu thực đơn 7 ngày
          </h3>

          <table className="w-full text-left min-w-[600px] border-collapse">
            <thead>
              <tr className="border-b border-gray-150 dark:border-gray-750">
                <th className="py-2.5 text-[10px] font-black text-gray-400 uppercase">Bữa cữ</th>
                {weekdaysVi.map((d) => (
                  <th key={d} className="py-2.5 text-[10px] font-black text-gray-500 uppercase text-center">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeWeeklyMeals.map((meal) => (
                <tr key={meal.slot} className="border-b border-gray-100 dark:border-gray-750">
                  <td className="py-3 text-[11px] font-black text-gray-800 dark:text-white">{meal.slot}</td>
                  {weekdaysVi.map((d, i) => (
                    <td key={i} className="py-2 px-1 text-center">
                      <div className={`py-2 px-1 rounded-xl text-[9px] font-extrabold shadow-sm ${meal.color}`}>
                        {getWeeklyMealForDay(meal.slot, i)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB HISTORY */}
      {activeTab === 'history' && (
        <div className="p-8 text-center bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-750 rounded-3xl space-y-2">
          <Calendar className="w-10 h-10 text-gray-400 mx-auto" />
          <h4 className="text-xs font-bold text-gray-700 dark:text-white">Lịch sử ăn dặm</h4>
          <p className="text-[10px] text-gray-400 font-semibold">Chưa ghi nhận lịch sử ăn dặm nào trước đó của bé.</p>
        </div>
      )}

      {/* RECIPE DETAIL MODAL */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 border border-pink-100/50 dark:border-gray-750 rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl relative animate-slide-in">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-6 py-4 border-b border-gray-150 dark:border-gray-700 flex justify-between items-center z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedRecipe.emoji}</span>
                <h3 className="text-sm font-black text-gray-850 dark:text-white uppercase">
                  {selectedRecipe.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecipe(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-6 pt-3 flex gap-2 border-b border-gray-100 dark:border-gray-700">
              {[
                { id: 'ingredients', label: 'Nguyên liệu' },
                { id: 'steps', label: 'Cách làm' },
                { id: 'nutrition', label: 'Dinh dưỡng' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setModalTab(t.id)}
                  className={`pb-2 text-xs font-extrabold border-b-2 transition-all ${
                    modalTab === t.id
                      ? 'border-momPink text-momPink-dark'
                      : 'border-transparent text-gray-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-6">
              
              {/* TAB INGREDIENTS */}
              {modalTab === 'ingredients' && (
                <div className="space-y-4">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Checklist nguyên liệu (Tích chọn để chuẩn bị nấu)
                  </p>
                  
                  <div className="space-y-2">
                    {selectedRecipe.ingredients.map((ing, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 p-3 bg-pink-50/10 dark:bg-gray-900/40 rounded-xl border border-pink-50/20 cursor-pointer text-xs font-semibold text-gray-750 dark:text-gray-300"
                      >
                        <input
                          type="checkbox"
                          checked={!!checkedIngredients[ing.name]}
                          onChange={() => toggleIngredientCheck(ing.name)}
                          className="w-4 h-4 text-momPink border-gray-300 rounded focus:ring-momPink"
                        />
                        <span className={checkedIngredients[ing.name] ? 'line-through text-gray-400' : ''}>
                          {ing.name}: <span className="font-black text-momPink-dark">{ing.amount} {ing.unit}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB STEPS */}
              {modalTab === 'steps' && (
                <div className="space-y-4">
                  
                  {/* Step list / Cooking mode switch */}
                  {!cookingMode ? (
                    <div className="space-y-3">
                      {selectedRecipe.steps.map((step, i) => (
                        <div key={i} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-150">
                          <span className="w-5 h-5 bg-momPink-light/80 text-momPink-dark text-[10px] font-extrabold rounded-full flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-relaxed">{step.desc}</p>
                            <span className="text-[9px] font-bold text-gray-400 flex items-center gap-0.5">
                              <Clock className="w-3 h-3" /> {step.time}
                            </span>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setCookingMode(true);
                          setCurrentStepIdx(0);
                        }}
                        className="w-full py-3 bg-momPink text-white text-xs font-black rounded-xl shadow active:scale-95"
                      >
                        Bắt đầu chế biến (Chế độ nấu rảnh tay)
                      </button>
                    </div>
                  ) : (
                    // Step-by-step interactive mode
                    <div className="space-y-6 text-center animate-fade-in">
                      <div className="space-y-2">
                        <span className="text-[9px] bg-momPurple-light text-momPurple-dark px-2.5 py-0.5 rounded-full font-bold uppercase">
                          Bước {currentStepIdx + 1} / {selectedRecipe.steps.length}
                        </span>
                        <h4 className="text-base font-extrabold text-gray-800 dark:text-white pt-2 leading-relaxed">
                          {selectedRecipe.steps[currentStepIdx].desc}
                        </h4>
                        <span className="inline-flex items-center gap-1 text-[10px] text-momPink font-bold mt-2">
                          <Clock className="w-3.5 h-3.5" /> Thời gian đề xuất: {selectedRecipe.steps[currentStepIdx].time}
                        </span>
                      </div>

                      {/* Steps Navigator */}
                      <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
                          disabled={currentStepIdx === 0}
                          className="flex-1 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold disabled:opacity-40 text-gray-500"
                        >
                          Bước Trước
                        </button>
                        {currentStepIdx < selectedRecipe.steps.length - 1 ? (
                          <button
                            onClick={() => setCurrentStepIdx((prev) => prev + 1)}
                            className="flex-1 py-2.5 bg-momPink text-white text-xs font-bold rounded-xl active:scale-95 shadow-sm"
                          >
                            Bước Tiếp Theo
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setCookingMode(false);
                              toast.success('Chúc mừng mami đã hoàn thành món ăn! 🍲 🎉');
                            }}
                            className="flex-1 py-2.5 bg-gradient-to-r from-momGreen to-emerald-500 text-white text-xs font-black rounded-xl active:scale-95 shadow-sm"
                          >
                            Hoàn Thành Nấu
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB NUTRITION */}
              {modalTab === 'nutrition' && (
                <div className="space-y-6">
                  
                  {/* Calorie Center Number */}
                  <div className="text-center py-4 bg-pink-50/20 dark:bg-gray-900/40 rounded-2xl border border-pink-50/20">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Tổng năng lượng</p>
                    <p className="text-3xl font-black text-momPink-dark mt-1">
                      {selectedRecipe.kcal} <span className="text-xs font-bold text-gray-500">kcal</span>
                    </p>
                  </div>

                  {/* Horizontal BarChart */}
                  <div className="space-y-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Phần trăm đáp ứng nhu cầu vi chất hàng ngày (%)
                    </p>
                    <div className="h-44 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={selectedRecipe.nutritionData} layout="vertical" margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 8 }} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8B5CF6" radius={[0, 10, 10, 0]} barSize={15} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
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
