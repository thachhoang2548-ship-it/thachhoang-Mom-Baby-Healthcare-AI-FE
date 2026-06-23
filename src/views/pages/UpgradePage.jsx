import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthController } from '../../controllers/authController';
import { getTierNameVi } from '../../utils/tierHelpers';
import { ArrowLeft, Sparkles, CheckCircle2, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UpgradePage() {
  const navigate = useNavigate();
  const { tier, upgradeTier } = useAuthController();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async (targetTier) => {
    setUpgrading(true);
    try {
      const res = await upgradeTier(targetTier);
      if (res.isSuccess) {
        toast.success(`Chúc mừng mami đã nâng cấp lên gói ${getTierNameVi(targetTier)}! 🎉`);
      } else {
        toast.error(res.message || 'Nâng cấp không thành công');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra trong quá trình nâng cấp');
    } finally {
      setUpgrading(false);
    }
  };

  const tiers = [
    {
      id: 'Free',
      name: 'Mẹ Bầu Cơ Bản',
      price: 'Miễn phí',
      features: ['Lịch rụng trứng tiêu chuẩn', 'Đếm bước chân cơ bản', 'Nhật ký cân nặng'],
      color: 'border-gray-200',
      btnText: 'Gói hiện tại',
      disabled: tier === 'Free',
      action: () => handleUpgrade('Free')
    },
    {
      id: 'MomHienDai',
      name: 'Mẹ Hiện Đại ✨',
      price: '99k / tháng',
      features: [
        'Mở khóa Phác đồ IVF thông minh',
        'Phân tích thực phẩm Gen Z (BR02)',
        'Gợi ý thực đơn dinh dưỡng 7 ngày',
        'Theo dõi kế hoạch tập luyện thai kỳ',
        'Biểu đồ cân nặng trực quan'
      ],
      color: 'border-momPink ring-2 ring-momPink/30',
      btnText: tier === 'MomHienDai' ? 'Gói hiện tại' : 'Nâng cấp ngay',
      disabled: tier === 'MomHienDai',
      action: () => handleUpgrade('MomHienDai')
    },
    {
      id: 'SuperMomVip',
      name: 'Super Mom VIP 💎',
      price: '199k / tháng',
      features: [
        'Toàn bộ tính năng gói Mẹ Hiện Đại',
        'Tư vấn trực tiếp với bác sĩ phụ khoa',
        'Phân tích giọng nói trầm cảm sau sinh (EPDS)',
        'Thông báo khẩn cấp real-time qua SMS/Zalo',
        'Hỗ trợ VIP 24/7'
      ],
      color: 'border-momPurple ring-2 ring-momPurple/30',
      btnText: tier === 'SuperMomVip' ? 'Gói hiện tại' : 'Nâng cấp ngay',
      disabled: tier === 'SuperMomVip',
      action: () => handleUpgrade('SuperMomVip')
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="text-center max-w-2xl mx-auto space-y-2">
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-white uppercase tracking-wider flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5 text-momPink animate-pulse" />
          Nâng Cấp Quyền Lợi Mami
        </h2>
        <p className="text-xs text-gray-550 dark:text-gray-400 font-semibold leading-relaxed">
          Mở khóa những đặc quyền chăm sóc sức khỏe cá nhân hóa, đồng hành an tâm cùng mami trong suốt hành trình chuẩn bị, mang thai và nuôi con nhỏ.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto pt-4">
        {tiers.map((t) => (
          <div
            key={t.id}
            className={`bg-white dark:bg-gray-800 rounded-3xl p-6 border shadow-sm flex flex-col justify-between gap-6 transition-all duration-300 hover:shadow-lg ${t.color}`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-gray-850 dark:text-white uppercase tracking-wide">
                  {t.name}
                </h3>
                {tier === t.id && (
                  <span className="text-[9px] bg-momPink-light text-momPink-dark px-2.5 py-0.5 rounded-full font-bold">
                    Đang dùng
                  </span>
                )}
              </div>
              <p className="text-lg font-black text-momPink-dark mt-2">{t.price}</p>
              
              <ul className="mt-5 space-y-2.5">
                {t.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300 font-semibold leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-momPink shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={t.action}
              disabled={t.disabled || upgrading}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                t.disabled
                  ? 'bg-gray-100 text-gray-450 cursor-not-allowed'
                  : 'bg-gradient-to-r from-momPink to-momPurple text-white hover:opacity-95 active:scale-95'
              }`}
            >
              {upgrading ? 'Đang thực hiện...' : t.btnText}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
