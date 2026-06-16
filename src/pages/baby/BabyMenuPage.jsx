import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, RefreshCw, Calendar, Check, BookOpen, Clock, Flame, Award, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BabyMenuPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today'); // 'today' | 'weekly' | 'history'
  
  // Recipe Modal state
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [modalTab, setModalTab] = useState('ingredients'); // 'ingredients' | 'steps' | 'nutrition'
  const [cookingMode, setCookingMode] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState({});

  // Mock list of recipes for today
  const [recipes, setRecipes] = useState([
    {
      id: 1,
      name: 'Cháo yến mạch chuối nhuyễn',
      emoji: '🥣',
      slot: 'Bữa Sáng ☀️',
      duration: '15 phút',
      kcal: 145,
      tags: ['giàu sắt', 'dễ làm', 'dễ tiêu'],
      protein: '4.5g',
      iron: '2.8mg',
      ingredients: [
        { name: 'Yến mạch cán dẹt', amount: '30', unit: 'g' },
        { name: 'Chuối chín ngọt', amount: '1/2', unit: 'quả' },
        { name: 'Sữa mẹ hoặc sữa công thức', amount: '100', unit: 'ml' }
      ],
      steps: [
        { desc: 'Ngâm yến mạch với nước ấm khoảng 5 phút cho mềm ra.', time: '5 phút' },
        { desc: 'Nghiền nhuyễn chuối chín bằng nĩa hoặc rây mịn.', time: '2 phút' },
        { desc: 'Cho yến mạch vào nồi nhỏ nấu nhỏ lửa khoảng 5-7 phút cho chín nhừ, khuấy đều.', time: '7 phút' },
        { desc: 'Tắt bếp, trộn chuối nghiền và sữa vào khuấy đều cho ấm rồi cho bé ăn.', time: '1 phút' }
      ],
      nutritionData: [
        { name: 'Protein', value: 45 },
        { name: 'Carbs', value: 80 },
        { name: 'Chất béo', value: 35 }
      ],
      eaten: false
    },
    {
      id: 2,
      name: 'Súp cá hồi bông cải xanh nhuyễn',
      emoji: '🍲',
      slot: 'Bữa Trưa 🍲',
      duration: '25 phút',
      kcal: 180,
      tags: ['dồi dào omega-3', 'tốt cho mắt'],
      protein: '8.2g',
      iron: '1.9mg',
      ingredients: [
        { name: 'Filet Cá hồi tươi', amount: '25', unit: 'g' },
        { name: 'Bông cải xanh', amount: '20', unit: 'g' },
        { name: 'Khoai tây nhỏ', amount: '1/2', unit: 'củ' },
        { name: 'Dầu ô liu dặm bé', amount: '1', unit: 'thìa cà phê' }
      ],
      steps: [
        { desc: 'Hấp chín cá hồi tươi, gỡ thịt cá thật cẩn thận để loại bỏ hết xương răm.', time: '10 phút' },
        { desc: 'Rửa sạch bông cải xanh và khoai tây, luộc hoặc hấp chín mềm.', time: '10 phút' },
        { desc: 'Cho khoai tây, bông cải xanh và cá hồi vào máy xay xay nhuyễn hoặc rây mịn.', time: '3 phút' },
        { desc: 'Múc ra bát, thêm 1 thìa dầu ô liu đảo đều và cho bé dùng ấm.', time: '2 phút' }
      ],
      nutritionData: [
        { name: 'Protein', value: 75 },
        { name: 'Carbs', value: 50 },
        { name: 'Chất béo', value: 65 }
      ],
      eaten: false
    },
    {
      id: 3,
      name: 'Nước ép bơ lê nhuyễn mịn',
      emoji: '🍹',
      slot: 'Bữa Chiều 🍌',
      duration: '10 phút',
      kcal: 95,
      tags: ['giàu béo tốt', 'thơm mịn'],
      protein: '1.5g',
      iron: '0.8mg',
      ingredients: [
        { name: 'Bơ chín sáp', amount: '1/4', unit: 'quả' },
        { name: 'Lê ngọt chín', amount: '1/4', unit: 'quả' }
      ],
      steps: [
        { desc: 'Gọt vỏ lê ngọt chín, ép lấy nước cốt lê ngọt thanh.', time: '5 phút' },
        { desc: 'Dùng nĩa tán nhuyễn thịt bơ sáp chín mịn.', time: '3 phút' },
        { desc: 'Trộn đều nước lê vào bát bơ tán nhuyễn cho đến khi đạt độ sánh mịn vừa phải.', time: '2 phút' }
      ],
      nutritionData: [
        { name: 'Protein', value: 15 },
        { name: 'Carbs', value: 45 },
        { name: 'Chất béo', value: 80 }
      ],
      eaten: false
    },
    {
      id: 4,
      name: 'Cháo gà hạt sen bí đỏ ngọt',
      emoji: '🥣',
      slot: 'Bữa Tối 🌙',
      duration: '30 phút',
      kcal: 210,
      tags: ['ngủ ngon', 'giàu đạm'],
      protein: '7.8g',
      iron: '2.2mg',
      ingredients: [
        { name: 'Lườn ức gà sạch', amount: '20', unit: 'g' },
        { name: 'Bí đỏ ngọt', amount: '20', unit: 'g' },
        { name: 'Hạt sen khô', amount: '10', unit: 'g' },
        { name: 'Gạo tẻ ngon', amount: '20', unit: 'g' }
      ],
      steps: [
        { desc: 'Ngâm hạt sen cho mềm, đem hấp chín cùng bí đỏ ngọt.', time: '15 phút' },
        { desc: 'Ức gà hấp chín băm nhuyễn mịn.', time: '10 phút' },
        { desc: 'Ninh gạo thành cháo loãng rồi trút hạt sen, bí đỏ nghiền nhuyễn và thịt gà vào quấy.', time: '4 phút' },
        { desc: 'Khuấy nhỏ lửa thêm 1 phút cho cháo quánh dẻo rồi tắt bếp.', time: '1 phút' }
      ],
      nutritionData: [
        { name: 'Protein', value: 70 },
        { name: 'Carbs', value: 65 },
        { name: 'Chất béo', value: 40 }
      ],
      eaten: false
    }
  ]);

  // Coverage percentages
  const getEatenCoverage = () => {
    const eatenCount = recipes.filter((r) => r.eaten).length;
    return Math.floor((eatenCount / recipes.length) * 100);
  };

  const handleMarkEaten = (id) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, eaten: !r.eaten } : r))
    );
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

  // 7 days grid hardcode (meals by day)
  const weekdaysVi = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
  const weeklyMeals = [
    { slot: 'Sáng', stage: 'Bột ngọt', color: 'bg-momPink-light/30 text-momPink-dark' },
    { slot: 'Trưa', stage: 'Cháo loãng thịt bò', color: 'bg-momPurple-light/30 text-momPurple-dark' },
    { slot: 'Chiều', stage: 'Hoa quả nghiền', color: 'bg-momAmber-light/30 text-momAmber-dark' },
    { slot: 'Tối', stage: 'Cháo rây rau củ', color: 'bg-momGreen-light/30 text-momGreen-dark' }
  ];

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

          {/* Recipe Card List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map((r) => (
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
              {weeklyMeals.map((meal) => (
                <tr key={meal.slot} className="border-b border-gray-100 dark:border-gray-750">
                  <td className="py-3 text-[11px] font-black text-gray-800 dark:text-white">{meal.slot}</td>
                  {weekdaysVi.map((d, i) => (
                    <td key={i} className="py-2 px-1 text-center">
                      <div className={`py-2 px-1 rounded-xl text-[9px] font-extrabold shadow-sm ${meal.color}`}>
                        {meal.stage}
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
