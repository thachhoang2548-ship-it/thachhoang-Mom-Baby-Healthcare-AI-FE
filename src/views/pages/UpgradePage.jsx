import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
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
  ReceiptText,
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
      toast.success(`Chúc mừng mẹ đã kích hoạt gói ${getTierNameVi(tier)}!`, {
        duration: 5000,
      });
    }
  }, [isPaymentSuccess, tier]);

  const handleTierSelect = async (targetTier) => {
    if (tier === targetTier) {
      toast('Mẹ hiện đang sử dụng gói dịch vụ này rồi nhé.');
      return;
    }

    if (targetTier === 'MomHienDai' || targetTier === 'SuperMomVip') {
      navigate(`/payment?tier=${targetTier}`, {
        state: { targetTier },
      });
      return;
    }

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
      price: 'Miễn phí',
      period: 'trọn đời',
      icon: HeartHandshake,
      badge: null,
      cardClass: 'border-theme-line bg-theme-surface',
      iconBoxClass: 'bg-theme-page text-theme-ink border border-theme-line',
      buttonClass: 'bg-theme-page border border-theme-line text-theme-ink hover:bg-theme-brand-soft',
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
      name: 'Mẹ Hiện Đại',
      subtitle: 'Lựa chọn tối ưu cho thai kỳ & ăn dặm',
      price: '99.000đ',
      period: '/ tháng',
      sixMonthPrice: 'Tiết kiệm: 499.000đ / 6 tháng',
      icon: Zap,
      badge: 'Phổ biến nhất',
      badgeClass: 'bg-theme-brand text-theme-surface',
      cardClass: 'border-2 border-theme-brand bg-theme-surface shadow-md',
      iconBoxClass: 'bg-theme-brand-soft text-theme-brand border border-theme-brand/20',
      buttonClass: 'bg-theme-brand text-theme-surface hover:bg-theme-ink shadow-sm',
      features: [
        'Toàn bộ tính năng của gói Mẹ Bầu Cơ Bản',
        'Mở khóa Phác đồ IVF Timeline thông minh (BR01)',
        'Gợi ý thực đơn dinh dưỡng 7 ngày chuyên sâu & thực đơn bé',
        'Kế hoạch bài tập thể chất an toàn theo từng tam cá nguyệt',
        'Đánh giá nguy cơ trầm cảm sau sinh chuẩn y khoa EPDS',
        'Báo cáo phân tích chỉ số sức khỏe trực quan',
      ],
    },
    {
      id: 'SuperMomVip',
      name: 'Super Mom VIP',
      subtitle: 'Đặc quyền chăm sóc toàn diện 24/7',
      price: '199.000đ',
      period: '/ tháng',
      sixMonthPrice: 'Tiết kiệm: 999.000đ / 6 tháng',
      icon: Crown,
      badge: 'Đặc quyền cao cấp',
      badgeClass: 'bg-theme-ink text-theme-surface',
      cardClass: 'border border-theme-ink/25 bg-theme-surface shadow-sm',
      iconBoxClass: 'bg-theme-ink text-theme-surface',
      buttonClass: 'bg-theme-ink text-theme-surface hover:bg-theme-brand shadow-sm',
      features: [
        'Toàn bộ đặc quyền của gói Mẹ Hiện Đại',
        'Phân tích nhật ký cảm xúc & giọng nói AI sau sinh',
        'Ưu tiên kết nối trực tiếp Bác sĩ Sản phụ khoa chuyên môn',
        'Đội ngũ Care Staff đồng hành & phản hồi 24/7',
        'Hệ thống cảnh báo rủi ro khẩn cấp thời gian thực',
        'Bảo chứng hồ sơ y tế bảo mật theo chuẩn Bộ Y Tế',
      ],
    },
  ];

  return (
    <div className="font-display space-y-6 max-w-6xl mx-auto pb-12 text-theme-ink">
      {/* Điều hướng quay lại */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-bold text-theme-muted hover:text-theme-ink hover:bg-theme-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Quay lại</span>
        </button>

        <Link
          to="/subscription-history"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-theme-line bg-theme-surface px-4 py-2 text-xs sm:text-sm font-bold text-theme-ink hover:bg-theme-brand-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          <ReceiptText className="w-4 h-4 text-theme-brand" aria-hidden="true" />
          <span>Lịch sử gói & hóa đơn</span>
        </Link>
      </div>

      {/* Tiêu đề trang */}
      <header className="bg-theme-surface rounded-3xl border border-theme-line p-6 sm:p-10 text-center space-y-3 shadow-sm">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-theme-brand-soft text-theme-ink border border-theme-brand/20">
          <Sparkles className="w-4 h-4 text-theme-brand" aria-hidden="true" />
          <span>Gói hội viên & đặc quyền chăm sóc</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-theme-ink tracking-tight leading-snug max-w-2xl mx-auto">
          Đồng hành trọn vẹn cùng mẹ và bé yêu qua từng cột mốc
        </h1>
        <p className="text-sm sm:text-base text-theme-muted font-medium leading-relaxed max-w-2xl mx-auto">
          Chọn gói chăm sóc phù hợp để mở khóa thực đơn dinh dưỡng chuyên sâu, nhật ký phục hồi sau sinh và kết nối đội ngũ y tế đồng hành.
        </p>
      </header>

      {/* Banner thanh toán thành công */}
      {isPaymentSuccess && (
        <section className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-status-ok text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-emerald-800">
                Thanh toán thành công & gói đã kích hoạt
              </p>
              <h2 className="text-base sm:text-lg font-extrabold text-emerald-950">
                Chào mừng mẹ đến với gói {getTierNameVi(tier)}!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-900 font-medium">
                Tài khoản đã mở khóa đầy đủ các công cụ theo dõi chuyên sâu cho mẹ và bé.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-status-ok text-white font-bold text-xs sm:text-sm hover:bg-emerald-800 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
          >
            Về trang Tổng quan
          </button>
        </section>
      )}

      {/* Trạng thái gói hiện tại */}
      <div className="bg-theme-surface border border-theme-line rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs text-theme-muted font-semibold">
              Gói dịch vụ hiện tại của mẹ
            </p>
            <p className="text-sm sm:text-base font-extrabold text-theme-ink">
              {getTierNameVi(tier)}
            </p>
          </div>
        </div>
        <div className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-full px-3.5 py-1.5 inline-flex items-center gap-1.5 self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5 text-status-ok" aria-hidden="true" />
          <span>Trạng thái: Đang hoạt động</span>
        </div>
      </div>

      {/* Bảng 3 gói dịch vụ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2 items-stretch">
        {tiers.map((t) => {
          const Icon = t.icon;
          const isCurrentTier = tier === t.id;
          const isProcessing = upgradingTier === t.id;

          return (
            <article
              key={t.id}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between relative transition-colors ${t.cardClass}`}
            >
              {t.badge && (
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${t.badgeClass}`}>
                    {t.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${t.iconBoxClass}`}>
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-lg font-extrabold text-theme-ink">
                        {t.name}
                      </h2>
                      <p className="text-xs text-theme-muted font-medium">
                        {t.subtitle}
                      </p>
                    </div>
                  </div>

                  {isCurrentTier && (
                    <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full font-bold shrink-0">
                      Đang dùng
                    </span>
                  )}
                </div>

                {/* Giá */}
                <div className="mt-6 pb-5 border-b border-theme-line">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl sm:text-3xl font-extrabold text-theme-ink tracking-tight">
                      {t.price}
                    </span>
                    <span className="text-xs text-theme-muted font-bold">
                      {t.period}
                    </span>
                  </div>
                  {t.sixMonthPrice ? (
                    <p className="mt-2 text-xs font-bold text-theme-brand">
                      {t.sixMonthPrice}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs font-medium text-theme-muted">
                      Không giới hạn thời gian sử dụng
                    </p>
                  )}
                </div>

                {/* Quyền lợi */}
                <div className="mt-5 space-y-3">
                  <p className="text-xs font-bold text-theme-ink">
                    Quyền lợi bao gồm:
                  </p>
                  <ul className="space-y-2.5">
                    {t.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs sm:text-sm text-theme-ink font-medium leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-theme-brand shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Nút chọn gói */}
              <div className="mt-8 pt-4">
                <button
                  type="button"
                  onClick={() => handleTierSelect(t.id)}
                  disabled={isCurrentTier || isProcessing || upgradingTier !== null}
                  className={`w-full min-h-[48px] py-3 px-4 rounded-2xl text-sm font-bold transition-colors flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 ${
                    isCurrentTier
                      ? 'bg-theme-page text-theme-muted cursor-not-allowed border border-theme-line'
                      : `${t.buttonClass} disabled:bg-theme-line disabled:text-theme-muted`
                  }`}
                >
                  {isProcessing ? (
                    <span>Đang chuyển đổi gói...</span>
                  ) : isCurrentTier ? (
                    <span>Gói hiện tại của mẹ</span>
                  ) : (
                    <>
                      <span>{t.id === 'Free' ? 'Chuyển về gói Cơ bản' : 'Chọn nâng cấp gói này'}</span>
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Cam kết bảo mật & chuyên môn */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-theme-surface p-5 rounded-2xl border border-theme-line flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-theme-ink">Bảo mật dữ liệu y tế</h3>
            <p className="text-xs text-theme-muted font-medium mt-0.5 leading-relaxed">
              Tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân của mẹ và bé.
            </p>
          </div>
        </div>

        <div className="bg-theme-surface p-5 rounded-2xl border border-theme-line flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-theme-ink">Kích hoạt tự động VietQR</h3>
            <p className="text-xs text-theme-muted font-medium mt-0.5 leading-relaxed">
              Mở khóa toàn bộ tính năng ngay sau khi hệ thống xác nhận giao dịch chuyển khoản.
            </p>
          </div>
        </div>

        <div className="bg-theme-surface p-5 rounded-2xl border border-theme-line flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-theme-ink">Nguồn tham chiếu chuẩn y khoa</h3>
            <p className="text-xs text-theme-muted font-medium mt-0.5 leading-relaxed">
              Nội dung tham chiếu khuyến nghị của WHO, Bộ Y tế và cố vấn chuyên khoa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
