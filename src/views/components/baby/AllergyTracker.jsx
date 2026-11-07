import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Plus, Trash2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import toast from 'react-hot-toast';
import babyService from '../../../models/services/babyService';

export default function AllergyTracker({ baby }) {
  // Khởi tạo từ HỒ SƠ BÉ THẬT (foodHistory + allergies do backend lưu)
  const initialAllergies = baby?.allergies || [];
  const initialFoods = (baby?.foodHistory || []).map((name) => ({
    name,
    date: null,
    reaction: initialAllergies.some((a) => a.toLowerCase() === name.toLowerCase()) ? 'mild' : 'none'
  }));

  const [introducedFoods, setIntroducedFoods] = useState(initialFoods);
  const [avoidFoods, setAvoidFoods] = useState(initialAllergies);

  // Lưu foodHistory + allergies mới nhất về server
  const persist = async (foods, avoids) => {
    if (!baby?.id) return;
    try {
      await babyService.updateProfile(baby.id, {
        ...baby,
        allergies: avoids,
        foodHistory: foods.map((f) => f.name)
      });
    } catch (err) {
      console.error('Failed to save allergy data:', err);
      toast.error('Không lưu được dữ liệu dị ứng lên hệ thống.');
    }
  };

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

  // Danh sách thực phẩm phổ biến cho bé ăn dặm (whitelist)
  const KNOWN_FOODS = [
    'gà', 'thịt gà', 'ức gà', 'lườn gà', 'gà ta',
    'bò', 'thịt bò', 'bê',
    'heo', 'thịt heo', 'lợn', 'thịt lợn', 'sườn',
    'cá', 'cá hồi', 'cá thu', 'cá basa', 'cá lóc', 'cá diêu hồng', 'cá chép', 'cá trê',
    'tôm', 'cua', 'mực', 'hải sản', 'nghêu', 'sò', 'ốc', 'trai',
    'trứng', 'trứng gà', 'trứng vịt', 'trứng cút',
    'sữa', 'sữa bò', 'sữa mẹ', 'sữa công thức', 'sữa chua', 'phô mai',
    'gạo', 'cháo', 'bột gạo', 'cơm', 'bún', 'mì', 'phở', 'nui',
    'khoai', 'khoai tây', 'khoai lang', 'khoai môn', 'khoai sọ',
    'bí', 'bí đỏ', 'bí ngô', 'bí xanh', 'bầu', 'mướp',
    'cà rốt', 'cà chua', 'cà tím',
    'rau', 'rau cải', 'cải bó xôi', 'cải ngọt', 'cải thìa', 'rau mồng tơi', 'rau dền', 'rau ngót',
    'bông cải', 'bông cải xanh', 'súp lơ',
    'đậu', 'đậu xanh', 'đậu đen', 'đậu đỏ', 'đậu nành', 'đậu hũ', 'tàu hũ', 'đậu phụ',
    'đậu phộng', 'lạc',
    'hành', 'hành tây', 'hành lá', 'tỏi', 'gừng', 'sả',
    'chuối', 'táo', 'lê', 'cam', 'quýt', 'bưởi', 'xoài', 'đu đủ', 'dưa hấu', 'nho',
    'thanh long', 'bơ', 'dâu', 'dâu tây', 'kiwi', 'việt quất', 'mận', 'đào', 'mít', 'sầu riêng',
    'yến mạch', 'bột yến mạch', 'ngũ cốc',
    'hạt sen', 'hạt điều', 'hạt óc chó', 'hạnh nhân', 'mè', 'vừng',
    'dầu', 'dầu ô liu', 'dầu mè', 'bơ thực vật',
    'nấm', 'nấm hương', 'nấm rơm', 'nấm kim châm',
    'măng', 'ngô', 'bắp',
    'chim bồ câu', 'thịt bồ câu',
    'gan', 'gan gà', 'gan heo',
    'tía tô', 'rau mùi', 'thì là', 'húng quế',
    'mật ong', 'đường',
    'gluten', 'lúa mì', 'tiểu mạch'
  ];

  // Kiểm tra xem tên có phải thực phẩm hợp lệ không
  const isValidFoodName = (name) => {
    const lower = name.toLowerCase().trim();
    // 1. Quá ngắn (< 2 ký tự)
    if (lower.length < 2) return false;
    // 2. Chứa số → không phải thực phẩm
    if (/\d/.test(lower)) return false;
    // 3. Chỉ chứa ký tự Latin không dấu và không khớp whitelist → khả năng cao là gibberish
    if (/^[a-z]+$/.test(lower) && lower.length <= 4 && !KNOWN_FOODS.includes(lower)) return false;
    // 4. Kiểm tra whitelist (match chính xác hoặc chứa trong whitelist)
    const matchesKnown = KNOWN_FOODS.some((f) =>
      lower === f || lower.includes(f) || f.includes(lower)
    );
    // 5. Nếu không match whitelist, kiểm tra xem có chứa ký tự tiếng Việt (dấu) không
    const hasVietnamese = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i.test(lower);
    return matchesKnown || hasVietnamese;
  };

  const handleAddFood = async (e) => {
    e.preventDefault();
    if (!baby) {
      toast.error('Vui lòng tạo hồ sơ cho bé trước');
      return;
    }
    if (!foodName.trim()) {
      toast.error('Vui lòng nhập tên thực phẩm');
      return;
    }

    const trimmedName = foodName.trim();

    // Kiểm tra tên thực phẩm hợp lệ
    if (!isValidFoodName(trimmedName)) {
      toast.error(`"${trimmedName}" không phải tên thực phẩm hợp lệ. Vui lòng nhập tên thực phẩm thật (ví dụ: Tôm, Cá, Trứng...)`);
      return;
    }

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

    const nextFoods = [...introducedFoods, newFood];
    const nextAvoids =
      (reaction === 'mild' || reaction === 'severe') && !avoidFoods.includes(trimmedName)
        ? [...avoidFoods, trimmedName]
        : avoidFoods;

    setIntroducedFoods(nextFoods);
    setAvoidFoods(nextAvoids);
    persist(nextFoods, nextAvoids);

    // BR09 Trigger: If mild or severe reaction is logged
    if (reaction === 'mild' || reaction === 'severe') {
      setAlertModal({
        isOpen: true,
        foodName: trimmedName,
        severity: reaction
      });
      toast.error(`Cảnh báo dị ứng: Đã thêm ${trimmedName} vào danh sách cần tránh!`);
    } else {
      toast.success(`Đã ghi nhận giới thiệu thực phẩm ${trimmedName}!`);
    }

    // Reset form
    setFoodName('');
    setReaction('none');
    setShowAddForm(false);
  };

  const handleRemoveAvoid = (food) => {
    const nextAvoids = avoidFoods.filter((item) => item !== food);
    const nextFoods = introducedFoods.map((item) =>
      item.name === food ? { ...item, reaction: 'none' } : item
    );
    setAvoidFoods(nextAvoids);
    setIntroducedFoods(nextFoods);
    persist(nextFoods, nextAvoids);
    toast.success(`Đã xóa ${food} khỏi danh sách cần tránh`);
  };

  return (
    <section className="font-display bg-theme-surface rounded-2xl p-5 sm:p-6 border border-theme-line shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-theme-line">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-theme-ink flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-theme-brand shrink-0" aria-hidden="true" />
            <span>Tầm soát dị ứng bé yêu</span>
          </h2>
          <p className="text-xs text-theme-muted font-medium mt-0.5">
            Theo dõi phản ứng khi ăn dặm để thiết kế thực đơn an toàn
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          aria-expanded={showAddForm}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 bg-theme-brand-soft hover:bg-theme-sidebar text-theme-brand text-xs sm:text-sm font-bold rounded-2xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Thêm thực phẩm</span>
        </button>
      </div>

      {/* Add New Log Form */}
      {showAddForm && (
        <form
          onSubmit={handleAddFood}
          className="p-4 sm:p-5 bg-theme-page border border-theme-line rounded-2xl space-y-4"
        >
          <h3 className="text-sm font-bold text-theme-ink">
            Ghi nhận thực phẩm mới giới thiệu
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="allergy-food-name" className="block text-xs font-semibold text-theme-ink">
                Tên thực phẩm (ví dụ: Tôm, Cơm, Đậu)
              </label>
              <input
                id="allergy-food-name"
                type="text"
                placeholder="Nhập tên món..."
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 bg-theme-surface border border-theme-line rounded-2xl text-xs sm:text-sm text-theme-ink placeholder:text-theme-muted font-medium focus:outline-none focus:ring-2 focus:ring-theme-brand"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="allergy-intro-date" className="block text-xs font-semibold text-theme-ink">
                Ngày bé ăn thử
              </label>
              <input
                id="allergy-intro-date"
                type="date"
                value={introDate}
                onChange={(e) => setIntroDate(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 bg-theme-surface border border-theme-line rounded-2xl text-xs sm:text-sm text-theme-ink font-medium focus:outline-none focus:ring-2 focus:ring-theme-brand"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-xs font-semibold text-theme-ink">
              Phản ứng của bé
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'none',
                  label: 'Bình thường',
                  icon: ShieldCheck,
                  activeStyle: 'border-status-ok bg-status-ok text-theme-surface'
                },
                {
                  id: 'mild',
                  label: 'Dị ứng nhẹ',
                  icon: AlertTriangle,
                  activeStyle: 'border-status-warn-line bg-status-warn-bg text-status-warn-text'
                },
                {
                  id: 'severe',
                  label: 'Dị ứng nặng',
                  icon: AlertOctagon,
                  activeStyle: 'border-theme-brand bg-theme-brand text-theme-surface'
                }
              ].map((item) => {
                const ItemIcon = item.icon;
                const isSelected = reaction === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setReaction(item.id)}
                    className={`min-h-[44px] px-3 py-2.5 rounded-2xl text-xs font-bold border inline-flex items-center justify-center gap-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                      isSelected
                        ? item.activeStyle
                        : 'border-theme-line bg-theme-surface text-theme-ink hover:bg-theme-sidebar'
                    }`}
                  >
                    <ItemIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="submit"
              className="flex-1 min-h-[44px] py-2.5 px-4 bg-theme-brand text-theme-surface text-xs sm:text-sm font-bold rounded-2xl hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              Lưu thông tin
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="min-h-[44px] px-5 py-2.5 border border-theme-line bg-theme-surface text-theme-ink text-xs sm:text-sm font-semibold rounded-2xl hover:bg-theme-sidebar transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      {/* Grid of Introduced Foods */}
      <div className="space-y-3">
        <h3 className="text-xs sm:text-sm font-bold text-theme-ink">
          Thực phẩm đã giới thiệu cho bé
        </h3>
        {introducedFoods.length === 0 ? (
          <div className="p-4 rounded-2xl bg-theme-page border border-theme-line text-xs text-theme-muted font-medium">
            Chưa có thực phẩm nào được ghi nhận. Hãy bấm &ldquo;Thêm thực phẩm&rdquo; khi bé bắt đầu thử món mới.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {introducedFoods.map((food, i) => {
              const isAllergic = food.reaction !== 'none';

              const chipStyle = isAllergic
                ? 'border-status-warn-line bg-status-warn-bg text-status-warn-text'
                : 'border-theme-line bg-theme-page text-theme-ink';
              const Icon = isAllergic ? ShieldAlert : ShieldCheck;

              return (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between gap-1.5 ${chipStyle}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs sm:text-sm font-bold">{food.name}</span>
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isAllergic ? 'text-status-warn-text' : 'text-status-ok'}`}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs font-medium opacity-85">
                    <span>{food.date ? new Date(food.date).toLocaleDateString('vi-VN') : '—'}</span>
                    <span>
                      {food.reaction === 'none'
                        ? 'An toàn'
                        : food.reaction === 'mild'
                        ? 'Dị ứng nhẹ'
                        : 'Dị ứng nặng'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Avoid List Card */}
      <div className="space-y-3 pt-2 border-t border-theme-line">
        <h3 className="text-xs sm:text-sm font-bold text-theme-ink flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-theme-brand shrink-0" aria-hidden="true" />
          <span>Danh sách thực phẩm phải tránh</span>
        </h3>

        {avoidFoods.length === 0 ? (
          <div className="p-4 bg-theme-page border border-theme-line rounded-2xl text-xs text-theme-muted font-medium">
            Chưa phát hiện thực phẩm gây dị ứng cho bé. Thực đơn luôn an toàn.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {avoidFoods.map((food, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 pl-3.5 pr-2 py-1.5 bg-status-warn-bg text-status-warn-text rounded-full border border-status-warn-line text-xs font-bold"
                >
                  <span>{food}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAvoid(food)}
                    className="p-1.5 hover:bg-theme-surface/60 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-warn-text"
                    title="Xóa khỏi danh sách"
                    aria-label={`Xóa ${food} khỏi danh sách cần tránh`}
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>

            {/* Disclaimer / Warning badge */}
            <div className="p-3.5 bg-status-warn-bg border border-status-warn-line rounded-2xl flex items-start gap-2.5 text-xs text-status-warn-text font-medium leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Các thực phẩm trong danh sách này sẽ được hệ thống AI tự động loại bỏ hoàn toàn khỏi các khuyến nghị thực đơn ăn dặm hàng ngày của bé.
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BR09 Allergy Warning Modal */}
      {alertModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-theme-ink/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="allergy-modal-title"
        >
          <div className="bg-theme-surface border border-theme-line rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl relative">
            <button
              type="button"
              onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
              aria-label="Đóng thông báo"
              className="absolute right-4 top-4 p-2 text-theme-muted hover:text-theme-ink rounded-full hover:bg-theme-page focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="text-center space-y-2 pt-1">
              <div className="w-12 h-12 rounded-2xl bg-status-warn-bg border border-status-warn-line text-status-warn-text flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" aria-hidden="true" />
              </div>
              <h3 id="allergy-modal-title" className="text-base font-bold text-theme-ink">
                Cảnh báo dị ứng thực phẩm (BR09)
              </h3>
            </div>

            <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-theme-ink font-medium text-center">
              <p>
                Bé con vừa được ghi nhận phản ứng dị ứng{' '}
                <span className="text-theme-brand font-bold">
                  {alertModal.severity === 'severe' ? 'nặng' : 'nhẹ'}
                </span>{' '}
                với thực phẩm <span className="font-bold">&ldquo;{alertModal.foodName}&rdquo;</span>.
              </p>

              <div className="bg-status-warn-bg p-3.5 rounded-2xl border border-status-warn-line text-left space-y-1.5 text-status-warn-text">
                <p className="text-xs font-bold">Khuyến nghị sơ cứu y khoa:</p>
                <ul className="text-xs list-disc pl-4 space-y-1">
                  <li>Ngừng cho ăn thực phẩm này ngay lập tức.</li>
                  <li>Theo dõi sát sao nhịp thở, phát ban trên da, hoặc sưng môi.</li>
                  {alertModal.severity === 'severe' && (
                    <li className="font-bold">
                      Nếu bé khó thở hoặc li bì, hãy đưa bé đến trung tâm y tế gần nhất ngay lập tức!
                    </li>
                  )}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
              className="w-full min-h-[44px] py-2.5 px-4 bg-theme-brand text-theme-surface text-xs sm:text-sm font-bold rounded-2xl hover:opacity-95 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
            >
              Đã hiểu và kích hoạt chế độ loại trừ thực đơn
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
