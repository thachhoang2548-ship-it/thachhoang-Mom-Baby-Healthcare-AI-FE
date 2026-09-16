import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuthController } from '../../controllers/authController';
import { getTierNameVi } from '../../utils/tierHelpers';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Award,
  Crown,
  ShieldCheck,
  Zap,
  HeartHandshake,
  Clock,
  ChevronRight,
  PartyPopper,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UpgradePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { tier, upgradeTier } = useAuthController();
  const [upgradingTier, setUpgradingTier] = useState(null);

  const isPaymentSuccess =
    searchParams.get('payment_success') === 'true' ||
    location.state?.paymentSuccess;

  useEffect(() => {
    if (isPaymentSuccess) {
      toast.success(`🎉 Chúc mừng bạn đã sở hữu gói ${getTierNameVi(tier)}!`, {
        duration: 5000,
        icon: '👑',
      });
    }
  }, [isPaymentSuccess, tier]);

  const handleTierSelect = async (targetTier) => {
    if (tier === targetTier) {
      toast('Mami hiện đang sử dụng gói này rồi nhé! 🌸', { icon: 'ℹ️' });
      return;
    }

    // Nếu chọn gói trả phí, chuyển hướng sang trang thanh toán VietQR tài khoản thật
    if (targetTier === 'MomHienDai' || targetTier === 'SuperMomVip') {
      navigate(`/payment?tier=${targetTier}`, {
        state: { targetTier },
      });
      return;
    }

    // Nếu chuyển về gói miễn phí
    setUpgradingTier(targetTier);
    try {
      const res = await upgradeTier(targetTier);
      if (res && (res.isSuccess || res.success)) {
        toast.success(`Đã chuyển về gói ${getTierNameVi(targetTier)} thành công!`, {
          duration: 4500,
        });
      } else {
        toast.error(res?.message || 'Chuyển gói không thành công, vui lòng thử lại');
      }
    } catch (err) {
      console.error('Upgrade failed:', err);
      toast.error('Có lỗi xảy ra trong quá trình chuyển gói');
    } finally {
      setUpgradingTier(null);
    }
  };

  const tiers = [
    {
      id: 'Free',
      name: 'Mẹ Bầu Cơ Bản',
      subtitle: 'Trải nghiệm chăm sóc nền tảng',
      price: 'Miễn Phí',
      period: 'trọn đời',
      icon: HeartHandshake,
      badge: null,
      color: 'border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-850/80',
      accentColor: 'text-gray-500 dark:text-gray-400',
      buttonClass: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200',
      features: [
        'Lịch rụng trứng tiêu chuẩn & dự đoán chu kỳ',
        'Theo dõi chỉ số cân nặng & chiều cao BMI',
        'Sổ tay hướng dẫn thai kỳ cơ bản theo tuần',
        'Nhắc nhở lịch khám thai định kỳ',
        'Tra cứu danh mục thực phẩm an toàn',
      ],
    },
    {
      id: 'MomHienDai',
      name: 'Mẹ Hiện Đại ✨',
      subtitle: 'Lựa chọn thông thái & tối ưu cho mẹ',
      price: '99.000đ',
      period: '/ tháng',
      sixMonthPrice: '499.000đ / 6 tháng',
      icon: Zap,
      badge: 'Phổ biến nhất 🔥',
      badgeColor: 'bg-gradient-to-r from-momPink to-pink-600 text-white shadow-md shadow-pink-500/20',
      color: 'border-momPink/60 ring-2 ring-momPink/30 bg-gradient-to-b from-pink-50/50 via-white to-white dark:from-pink-950/20 dark:via-gray-850/90 dark:to-gray-850',
      accentColor: 'text-momPink-dark dark:text-pink-400',
      buttonClass: 'bg-gradient-to-r from-momPink to-momPurple text-white hover:opacity-95 shadow-md shadow-pink-500/25',
      features: [
        'Toàn bộ tính năng của gói Mẹ Bầu Cơ Bản',
        'Mở khóa Phác đồ IVF Timeline thông minh (BR01)',
        'Gợi ý thực đơn dinh dưỡng 7 ngày chuyên sâu (AI Meal)',
        'Kế hoạch bài tập thể chất an toàn theo từng tam cá nguyệt',
        'Đánh giá nguy cơ trầm cảm sau sinh chuẩn y khoa EPDS',
        'Báo cáo phân tích chỉ số sức khỏe trực quan',
      ],
    },
    {
      id: 'SuperMomVip',
      name: 'Super Mom VIP 💎',
      subtitle: 'Đặc quyền chăm sóc toàn diện 24/7',
      price: '199.000đ',
      period: '/ tháng',
      sixMonthPrice: '999.000đ / 6 tháng',
      icon: Crown,
      badge: 'Đặc quyền VIP 👑',
      badgeColor: 'bg-gradient-to-r from-momPurple to-purple-800 text-white shadow-md shadow-purple-500/20',
      color: 'border-purple-300 dark:border-purple-800/60 ring-2 ring-purple-400/20 bg-gradient-to-b from-purple-50/40 via-white to-white dark:from-purple-950/20 dark:via-gray-850/90 dark:to-gray-850',
      accentColor: 'text-momPurple-dark dark:text-purple-400',
      buttonClass: 'bg-gradient-to-r from-momPurple via-pink-600 to-momPink text-white hover:opacity-95 shadow-md shadow-purple-500/25',
      features: [
        'Toàn bộ đặc quyền của gói Mẹ Hiện Đại',
        'Phân tích nhật ký cảm xúc & giọng nói AI sau sinh',
        'Ưu tiên kết nối trực tiếp Bác sĩ Sản phụ khoa chuyên môn',
        'Đội ngũ Care Staff đồng hành & phản hồi 24/7',
        'Hệ thống cảnh báo rủi ro khẩn cấp real-time',
        'Bảo chứng hồ sơ y tế bảo mật theo chuẩn Bộ Y Tế',
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top navigation */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-momPink transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Quay lại</span>
      </button>

      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-950/40 dark:to-purple-950/40 text-momPink-dark dark:text-pink-300 border border-pink-200/50 dark:border-pink-800/40 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-momPink animate-pulse" />
          <span>GÓI HỘI VIÊN & ĐẶC QUYỀN MAMI</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-snug">
          Đồng Hành Toàn Diện Cùng{' '}
          <span className="bg-gradient-to-r from-momPink via-momPurple to-pink-500 bg-clip-text text-transparent">
            Mẹ và Bé Yêu
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto">
          Chọn gói chăm sóc phù hợp để kích hoạt những trợ lý AI thông minh, phác đồ y khoa chuẩn hóa và đặc quyền kết nối chuyên gia y tế hàng đầu.
        </p>
      </div>

      {/* Success Notification Banner (Hiển thị khi vừa thanh toán thành công) */}
      {isPaymentSuccess && (
        <div className="bg-gradient-to-r from-emerald-500/15 via-pink-500/10 to-purple-500/15 border-2 border-emerald-400 dark:border-emerald-600 rounded-3xl p-5 px-6 shadow-lg animate-in fade-in zoom-in-95 duration-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center text-2xl shadow-md shrink-0">
              🎉
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Thanh toán thành công & Gói đã kích hoạt
              </span>
              <h3 className="text-base font-black text-gray-900 dark:text-white">
                Chào mừng bạn đến với gói dịch vụ {getTierNameVi(tier)}!
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Tài khoản của bạn đã được mở khóa toàn bộ đặc quyền cao cấp và trợ lý AI thông minh.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-xs hover:opacity-95 transition-opacity shadow-md shrink-0 cursor-pointer"
          >
            Về trang Tổng quan 🚀
          </button>
        </div>
      )}

      {/* Current Tier Alert Banner */}
      <div className="bg-white/80 dark:bg-gray-850/80 backdrop-blur-xl border border-pink-100 dark:border-gray-800 rounded-2xl p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-momPink/15 dark:bg-momPink/25 text-momPink-dark dark:text-pink-300 flex items-center justify-center font-bold text-lg">
            👑
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Tài khoản của bạn hiện tại
            </span>
            <p className="text-sm font-black text-gray-800 dark:text-white">
              Gói dịch vụ: <span className="text-momPink-dark dark:text-pink-400">{getTierNameVi(tier)}</span>
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400 font-semibold flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-500" />
          <span>Trạng thái: Hoạt động bình thường</span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-stretch">
        {tiers.map((t) => {
          const Icon = t.icon;
          const isCurrentTier = tier === t.id;
          const isProcessing = upgradingTier === t.id;

          return (
            <div
              key={t.id}
              className={`rounded-3xl p-6 sm:p-7 border backdrop-blur-md shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative ${t.color}`}
            >
              {/* Top Tag Badge */}
              {t.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${t.badgeColor}`}>
                    {t.badge}
                  </span>
                </div>
              )}

              <div>
                {/* Header info */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-2xl bg-white dark:bg-gray-800 shadow-sm ${t.accentColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-gray-850 dark:text-white">
                        {t.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {t.subtitle}
                      </p>
                    </div>
                  </div>

                  {isCurrentTier && (
                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded-full font-bold shrink-0">
                      Đang dùng
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="mt-5 pb-5 border-b border-gray-150 dark:border-gray-800/80">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {t.price}
                    </span>
                    <span className="text-xs text-gray-400 font-bold">
                      {t.period}
                    </span>
                  </div>
                  {t.sixMonthPrice && (
                    <p className="mt-2 text-xs font-bold text-momPink-dark dark:text-pink-300">
                      {t.sixMonthPrice}
                    </p>
                  )}
                </div>

                {/* Features List */}
                <div className="mt-5 space-y-3">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Đặc quyền bao gồm:
                  </p>
                  <ul className="space-y-2.5">
                    {t.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs text-gray-650 dark:text-gray-300 font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-momPink shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => handleTierSelect(t.id)}
                  disabled={isCurrentTier || isProcessing || upgradingTier !== null}
                  className={`w-full py-3.5 px-4 rounded-2xl text-xs font-black transition-all duration-200 flex items-center justify-center gap-2 ${
                    isCurrentTier
                      ? 'bg-gray-150 dark:bg-gray-800 text-gray-400 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                      : `${t.buttonClass} active:scale-95 cursor-pointer hover:shadow-lg`
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang kích hoạt gói...</span>
                    </>
                  ) : isCurrentTier ? (
                    <span>Gói Hiện Tại Của Bạn</span>
                  ) : (
                    <>
                      <span>{t.id === 'Free' ? 'Chuyển Về Gói Cơ Bản' : 'Nâng Cấp Gói Ngay'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust & Commitment Badges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
        <div className="bg-white/60 dark:bg-gray-850/50 backdrop-blur-sm p-4 rounded-2xl border border-white/60 dark:border-gray-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-500">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-800 dark:text-white">Bảo mật thông tin tối đa</h4>
            <p className="text-[10px] text-gray-400">Tuân thủ Nghị định 13/2023/NĐ-CP về dữ liệu</p>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-gray-850/50 backdrop-blur-sm p-4 rounded-2xl border border-white/60 dark:border-gray-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/30 text-momPink">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-800 dark:text-white">Kích hoạt tức thì</h4>
            <p className="text-[10px] text-gray-400">Hệ thống mở khóa toàn bộ đặc quyền ngay lập tức</p>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-gray-850/50 backdrop-blur-sm p-4 rounded-2xl border border-white/60 dark:border-gray-800 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/30 text-momPurple">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-800 dark:text-white">Cố vấn chuyên môn y tế</h4>
            <p className="text-[10px] text-gray-400">Được kiểm duyệt bởi bác sĩ & chuyên gia sản khoa</p>
          </div>
        </div>
      </div>
    </div>
  );
}
