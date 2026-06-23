import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Plus, Trash2, Check, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AllergyTracker() {
  const [introducedFoods, setIntroducedFoods] = useState([
    { name: 'Cà rốt', date: '2026-05-20', reaction: 'none' },
    { name: 'Thịt bò', date: '2026-05-22', reaction: 'none' },
    { name: 'Lòng đỏ trứng', date: '2026-05-25', reaction: 'mild' },
    { name: 'Cá hồi', date: '2026-05-28', reaction: 'none' },
    { name: 'Tôm', date: '2026-06-01', reaction: 'severe' }
  ]);

  const [avoidFoods, setAvoidFoods] = useState(['Lòng đỏ trứng', 'Tôm']);
  const [foodName, setFoodName] = useState('');
  const [introDate, setIntroDate] = useState(new Date().toISOString().substring(0, 10));
  const [reaction, setReaction] = useState('none');
  const [showAddForm, setShowAddForm] = useState(false);

  // BR09 Alert modal state
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    foodName: '',
    severity: 'mild'
  });

  const handleAddFood = (e) => {
    e.preventDefault();
    if (!foodName.trim()) {
      toast.error('Vui lòng nhập tên thực phẩm');
      return;
    }

    const trimmedName = foodName.trim();

    // Check duplicate
    if (introducedFoods.some((f) => f.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error('Thực phẩm này đã được giới thiệu trước đó');
      return;
    }

    const newFood = {
      name: trimmedName,
      date: introDate,
      reaction
    };

    setIntroducedFoods((prev) => [...prev, newFood]);

    // BR09 Trigger: If mild or severe reaction is logged
    if (reaction === 'mild' || reaction === 'severe') {
      // Add to avoid list
      if (!avoidFoods.includes(trimmedName)) {
        setAvoidFoods((prev) => [...prev, trimmedName]);
      }
      
      // Open BR09 Warning Modal
      setAlertModal({
        isOpen: true,
        foodName: trimmedName,
        severity: reaction
      });
      toast.error(`Cảnh báo dị ứng: Đã thêm ${trimmedName} vào danh sách cần tránh! ⚠️`);
    } else {
      toast.success(`Đã ghi nhận giới thiệu thực phẩm ${trimmedName}! 💚`);
    }

    // Reset form
    setFoodName('');
    setReaction('none');
    setShowAddForm(false);
  };

  const handleRemoveAvoid = (food) => {
    setAvoidFoods((prev) => prev.filter((item) => item !== food));
    // also update reaction to none in introduced list
    setIntroducedFoods((prev) =>
      prev.map((item) => (item.name === food ? { ...item, reaction: 'none' } : item))
    );
    toast.success(`Đã xóa ${food} khỏi danh sách cần tránh`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-pink-100/50 dark:border-gray-700/50 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-pink-50 dark:border-gray-700/50">
        <div>
          <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-5 h-5 text-momPink" /> Tầm Soát Dị Ứng Bé Yêu 🛡️
          </h3>
          <p className="text-[10px] text-gray-400 font-semibold mt-0.5">
            Theo dõi phản ứng khi ăn dặm để thiết kế thực đơn an toàn
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-pink-50 hover:bg-momPink-light/30 text-momPink rounded-xl transition duration-300 active:scale-95"
        >
          <Plus className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* Add New Log Form */}
      {showAddForm && (
        <form onSubmit={handleAddFood} className="p-4 bg-pink-50/20 dark:bg-gray-750 border border-pink-100/30 rounded-2xl space-y-4 animate-slide-in">
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-250 uppercase">Ghi nhận thực phẩm mới giới thiệu</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase">Tên thực phẩm (ví dụ: Tôm, Cơm, Đậu)</label>
              <input
                type="text"
                placeholder="Nhập tên món..."
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-momPink/30"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase">Ngày bé ăn thử</label>
              <input
                type="date"
                value={introDate}
                onChange={(e) => setIntroDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-momPink/30"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase">Phản ứng của bé</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'Bình thường ✓', color: 'border-green-200 bg-green-50/20 text-green-700' },
                { id: 'mild', label: 'Dị ứng nhẹ ⚠️', color: 'border-amber-250 bg-amber-50/20 text-amber-800' },
                { id: 'severe', label: 'Dị ứng nặng 🚨', color: 'border-red-200 bg-red-50/20 text-red-700' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setReaction(item.id)}
                  className={`py-2 rounded-xl text-[10px] font-bold border transition-all duration-300 ${
                    reaction === item.id 
                      ? `${item.color} ring-2 ring-momPink/20` 
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-momPink text-white text-xs font-bold rounded-xl hover:opacity-90 transition active:scale-95 shadow-sm"
            >
              Lưu thông tin
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-500 text-xs font-bold rounded-xl hover:bg-gray-50 transition"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Grid of Introduced Foods */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider">
          Thực phẩm đã giới thiệu cho bé
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {introducedFoods.map((food, i) => {
            const isAllergic = food.reaction !== 'none';
            const isSevere = food.reaction === 'severe';

            let chipStyle = 'border-green-100 bg-green-50/30 text-green-700 dark:bg-green-950/20 dark:text-green-300';
            let Icon = ShieldCheck;

            if (isAllergic) {
              chipStyle = isSevere
                ? 'border-red-150 bg-red-50/30 text-red-700 dark:bg-red-950/20 dark:text-red-300'
                : 'border-amber-150 bg-amber-50/30 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300';
              Icon = ShieldAlert;
            }

            return (
              <div
                key={i}
                className={`p-3 rounded-2xl border flex flex-col justify-between gap-1 shadow-sm ${chipStyle}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{food.name}</span>
                  <Icon className="w-4 h-4 shrink-0" />
                </div>
                <div className="flex items-center justify-between text-[8px] font-semibold text-gray-400 mt-1">
                  <span>{new Date(food.date).toLocaleDateString('vi-VN')}</span>
                  <span>{food.reaction === 'none' ? 'An toàn' : food.reaction === 'mild' ? 'Dị ứng nhẹ' : 'Dị ứng nặng'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Avoid List Card */}
      <div className="space-y-3 pt-2">
        <h4 className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 text-red-650">
          <AlertOctagon className="w-4 h-4" /> Danh sách thực phẩm phải tránh
        </h4>
        
        {avoidFoods.length === 0 ? (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl text-center text-[10px] text-gray-400 font-bold">
            Chưa phát hiện thực phẩm gây dị ứng cho bé. Thực đơn luôn an toàn.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {avoidFoods.map((food, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50/80 dark:bg-red-950/20 text-red-700 dark:text-red-300 rounded-full border border-red-150 text-[10px] font-extrabold tracking-wide shadow-sm"
                >
                  {food}
                  <button
                    type="button"
                    onClick={() => handleRemoveAvoid(food)}
                    className="p-0.5 hover:bg-red-100 rounded-full transition"
                    title="Xóa khỏi danh sách"
                  >
                    <Trash2 className="w-3 h-3 text-red-650" />
                  </button>
                </span>
              ))}
            </div>
            
            {/* Disclaimer / Warning badge */}
            <div className="p-3 bg-amber-50/40 border border-amber-200/50 rounded-2xl flex items-start gap-2 text-[10px] text-amber-850 dark:bg-amber-950/10 dark:text-amber-300 font-semibold leading-relaxed">
              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Các thực phẩm trong danh sách này sẽ được hệ thống AI tự động loại bỏ hoàn toàn khỏi các khuyến nghị thực đơn ăn dặm hàng ngày của bé.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BR09 Allergy Warning Modal (Trauma-informed, soft pink, no clinical harsh colors) */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 border border-pink-100 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative animate-slide-in">
            <button
              onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
              className="absolute right-4.5 top-4.5 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-pink-100 text-momPink flex items-center justify-center mx-auto shadow-md">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="text-sm font-black text-pink-700 dark:text-pink-300 uppercase tracking-wide">
                Cảnh báo dị ứng thực phẩm! (BR09)
              </h3>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-gray-650 dark:text-gray-300 font-semibold text-center">
              <p>
                Bé con vừa được ghi nhận phản ứng dị ứng{' '}
                <span className="text-pink-600 font-bold">
                  {alertModal.severity === 'severe' ? 'nặng' : 'nhẹ'}
                </span>{' '}
                với thực phẩm <span className="font-extrabold text-gray-800 dark:text-white">"{alertModal.foodName}"</span>.
              </p>
              
              <div className="bg-pink-50/50 dark:bg-gray-900 p-3 rounded-2xl border border-pink-100/30 text-left space-y-1.5">
                <p className="text-[10px] font-bold text-pink-700">Khuyến nghị sơ cứu y khoa:</p>
                <ul className="text-[10px] list-disc pl-3.5 space-y-1 text-gray-550 dark:text-gray-400">
                  <li>Ngừng cho ăn thực phẩm này ngay lập tức.</li>
                  <li>Theo dõi sát sao nhịp thở, phát ban trên da, hoặc sưng môi.</li>
                  {alertModal.severity === 'severe' && (
                    <li className="font-bold text-pink-600">Nếu bé khó thở hoặc li bì, hãy đưa bé đến trung tâm y tế gần nhất ngay lập tức!</li>
                  )}
                </ul>
              </div>
            </div>

            <button
              onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
              className="w-full py-2.5 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-bold rounded-xl transition hover:opacity-95 shadow active:scale-95"
            >
              Đã hiểu & kích hoạt chế độ loại trừ thực đơn
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
