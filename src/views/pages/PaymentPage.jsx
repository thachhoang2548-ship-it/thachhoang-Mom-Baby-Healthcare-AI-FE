import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Crown,
  Loader2,
  QrCode,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuthController } from '../../controllers/authController';
import { createBankTransferPayment, getPaymentStatus, TIERS_DATA } from '../../models/services/paymentService';
import { getTierNameVi } from '../../utils/tierHelpers';

const PAYMENT_STATUS = {
  Pending: 0,
  Completed: 1,
  Failed: 2,
  Refunded: 3,
};

const isCompletedStatus = (status) =>
  status === PAYMENT_STATUS.Completed || status === 'Completed';

const isFailedStatus = (status) =>
  status === PAYMENT_STATUS.Failed || status === 'Failed';

const formatMoney = (amount) =>
  Number(amount || 0).toLocaleString('vi-VN');

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, tier, refreshTokenAction, syncVerifiedTier } = useAuthController();

  const initialTier =
    location.state?.targetTier ||
    searchParams.get('tier') ||
    'SuperMomVip';

  const [selectedTier, setSelectedTier] = useState(
    initialTier === 'MomHienDai' ? 'MomHienDai' : 'SuperMomVip'
  );
  const [months, setMonths] = useState(1);
  const [order, setOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [completed, setCompleted] = useState(false);

  const tierInfo = TIERS_DATA[selectedTier] || TIERS_DATA.SuperMomVip;
  const TierIcon = selectedTier === 'SuperMomVip' ? Crown : Zap;

  const bankName = useMemo(() => {
    if (!order?.bankInfo) return 'Ngân hàng thụ hưởng';
    return order.bankInfo.bankName || order.bankInfo.bankShortName;
  }, [order]);

  useEffect(() => {
    let cancelled = false;

    async function createOrder() {
      setIsCreating(true);
      setErrorMessage('');
      setOrder(null);
      setPaymentStatus(null);
      setCompleted(false);

      try {
        const data = await createBankTransferPayment({ targetTier: selectedTier, months });
        if (cancelled) return;
        setOrder(data);
        setPaymentStatus(data?.status ?? PAYMENT_STATUS.Pending);
      } catch (error) {
        if (cancelled) return;
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Không tạo được đơn thanh toán. Vui lòng thử lại.';
        setErrorMessage(message);
        toast.error(message);
      } finally {
        if (!cancelled) setIsCreating(false);
      }
    }

    createOrder();
    return () => {
      cancelled = true;
    };
  }, [selectedTier, months]);

  const handleCompleted = useCallback(
    async (statusData, orderCode) => {
      if (completed) return;
      setCompleted(true);
      setPaymentStatus(statusData.status);
      syncVerifiedTier(selectedTier);

      try {
        await refreshTokenAction({ logoutOnFailure: false });
      } catch (error) {
        console.warn('Silent refresh after payment failed:', error);
      }

      toast.success('Thanh toán đã được xác minh. Gói của mẹ đã được kích hoạt.');
      setTimeout(() => {
        navigate('/upgrade?payment_success=true', {
          replace: true,
          state: {
            paymentSuccess: true,
            targetTier: selectedTier,
            transactionId: orderCode,
          },
        });
      }, 1200);
    },
    [completed, navigate, refreshTokenAction, selectedTier, syncVerifiedTier]
  );

  const checkStatus = useCallback(
    async ({ silent = false } = {}) => {
      if (!order?.orderCode || completed) return;
      if (!silent) setIsChecking(true);
      setErrorMessage('');

      try {
        const statusData = await getPaymentStatus(order.orderCode);
        setPaymentStatus(statusData.status);

        if (isCompletedStatus(statusData.status)) {
          await handleCompleted(statusData, order.orderCode);
          return;
        }

        if (isFailedStatus(statusData.status)) {
          const message = statusData.failureReason || 'Giao dịch không thành công.';
          setErrorMessage(message);
          if (!silent) toast.error(message);
          return;
        }

        if (!silent) {
          toast('Chưa ghi nhận thanh toán. Vui lòng đợi thêm một lát hoặc kiểm tra lại nội dung chuyển khoản.');
        }
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          'Không kiểm tra được trạng thái thanh toán.';
        setErrorMessage(message);
        if (!silent) toast.error(message);
      } finally {
        if (!silent) setIsChecking(false);
      }
    },
    [completed, handleCompleted, order?.orderCode]
  );

  useEffect(() => {
    if (!order?.orderCode || completed) return undefined;

    const interval = setInterval(() => {
      checkStatus({ silent: true });
    }, 4000);

    return () => clearInterval(interval);
  }, [order?.orderCode, completed, checkStatus]);

  const handleCopy = async (text, fieldName) => {
    if (!text) return;
    await navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isFailed = isFailedStatus(paymentStatus);

  return (
    <div className="font-display max-w-6xl mx-auto pb-16 space-y-6 text-theme-ink">
      <button
        type="button"
        onClick={() => navigate('/upgrade')}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-bold text-theme-muted hover:text-theme-ink hover:bg-theme-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>Quay lại bảng gói dịch vụ</span>
      </button>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-theme-surface border border-theme-line p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-theme-brand-soft text-theme-ink border border-theme-brand/20">
            <Sparkles className="w-3.5 h-3.5 text-theme-brand" aria-hidden="true" />
            <span>Thanh toán chuyển khoản tự động</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-theme-ink tracking-tight">
            Kích hoạt gói {tierInfo.name}
          </h1>
        </div>
        <div className="inline-flex items-center gap-2 bg-status-ok-bg text-status-ok-text px-3.5 py-2 rounded-2xl border border-status-ok-line text-xs font-bold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-status-ok" aria-hidden="true" />
          <span>Xác thực VietQR an toàn</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột 1: Cấu hình gói & chu kỳ */}
        <div className="lg:col-span-5 space-y-5">
          <section className="bg-theme-surface border border-theme-line rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-bold text-theme-ink mb-3">
                1. Chọn gói hội viên
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'MomHienDai', icon: Zap },
                  { id: 'SuperMomVip', icon: Crown },
                ].map((item) => {
                  const Icon = item.icon;
                  const active = selectedTier === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedTier(item.id)}
                      disabled={isCreating}
                      className={`min-h-[88px] p-3.5 rounded-2xl border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                        active
                          ? 'border-2 border-theme-brand bg-theme-brand-soft/60'
                          : 'border-theme-line bg-theme-page/50 hover:bg-theme-brand-soft/30'
                      } disabled:bg-theme-line/40 disabled:text-theme-muted`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={active ? 'w-4 h-4 text-theme-brand' : 'w-4 h-4 text-theme-muted'} aria-hidden="true" />
                        {active && <CheckCircle2 className="w-4 h-4 text-theme-brand" aria-hidden="true" />}
                      </div>
                      <p className="text-xs sm:text-sm font-extrabold text-theme-ink mt-2">
                        {TIERS_DATA[item.id].shortName}
                      </p>
                      <p className="text-xs font-semibold text-theme-muted mt-0.5">
                        {TIERS_DATA[item.id].monthlyPrice} / tháng
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-sm font-bold text-theme-ink block mb-2.5">
                Chu kỳ thanh toán
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { m: 1, label: '1 tháng', price: tierInfo.monthlyPrice },
                  { m: 6, label: '6 tháng', price: tierInfo.sixMonthPrice },
                ].map((item) => {
                  const active = months === item.m;
                  return (
                    <button
                      key={item.m}
                      type="button"
                      onClick={() => setMonths(item.m)}
                      disabled={isCreating}
                      className={`min-h-[56px] py-2.5 px-3 rounded-2xl text-xs font-bold border transition-colors flex flex-col items-center justify-center gap-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand ${
                        active
                          ? 'bg-theme-brand text-theme-surface border-theme-brand shadow-sm'
                          : 'bg-theme-page/50 text-theme-ink border-theme-line hover:bg-theme-brand-soft/40'
                      } disabled:bg-theme-line disabled:text-theme-muted`}
                    >
                      <span className="text-sm font-extrabold">{item.label}</span>
                      <span className={active ? 'text-xs text-theme-surface/90' : 'text-xs text-theme-muted'}>
                        {item.price}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-theme-line space-y-2">
              <span className="text-xs font-bold text-theme-muted block">
                Thông tin tài khoản nhận gói
              </span>
              <div className="bg-theme-page p-3.5 rounded-2xl border border-theme-line space-y-1.5 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-theme-muted font-medium">Người mua:</span>
                  <span className="font-bold text-theme-ink truncate">
                    {user?.fullName || user?.email || 'Hội viên Mom Ơi!'}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-theme-muted font-medium">Gói hiện tại:</span>
                  <span className="font-bold text-theme-brand">
                    {getTierNameVi(tier)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-theme-line">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-theme-muted font-bold">Tổng thanh toán</p>
                  <p className="text-2xl sm:text-3xl font-extrabold text-theme-brand mt-1">
                    {isCreating ? 'Đang tạo đơn...' : `${formatMoney(order?.amount)} đ`}
                  </p>
                  {order?.planName && (
                    <p className="text-xs text-theme-muted font-medium mt-1">{order.planName}</p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center shrink-0">
                  <TierIcon className="w-6 h-6" aria-hidden="true" />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-status-danger-bg border border-status-danger-line text-status-danger-text text-xs font-semibold flex gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-status-danger-text" aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}
          </section>
        </div>

        {/* Cột 2: Mã QR & Thông tin chuyển khoản */}
        <div className="lg:col-span-7">
          <section className="bg-theme-surface border border-theme-line rounded-3xl shadow-sm p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-theme-line">
              <div>
                <h2 className="text-base font-bold text-theme-ink">
                  2. Quét mã VietQR để thanh toán
                </h2>
                <p className="text-xs text-theme-muted font-medium mt-0.5">
                  Quét mã bằng ứng dụng ngân hàng hoặc sao chép chính xác thông tin bên dưới.
                </p>
              </div>
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${
                  completed
                    ? 'bg-status-ok-bg text-status-ok-text border-status-ok-line'
                    : isFailed
                    ? 'bg-status-danger-bg text-status-danger-text border-status-danger-line'
                    : 'bg-status-warn-bg text-status-warn-text border-status-warn-line/50'
                }`}
              >
                {completed ? (
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                ) : isFailed ? (
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                ) : (
                  <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                )}
                <span>
                  {completed ? 'Đã hoàn tất' : isFailed ? 'Giao dịch lỗi' : 'Chờ thanh toán'}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-6 flex flex-col items-center gap-3">
                <div className="bg-white p-3.5 rounded-2xl border-2 border-theme-line w-full max-w-[270px] min-h-[270px] flex items-center justify-center shadow-sm">
                  {isCreating ? (
                    <Loader2 className="w-10 h-10 text-theme-brand animate-spin motion-reduce:animate-none" aria-label="Đang tạo mã QR" />
                  ) : order?.qrUrl || order?.payUrl ? (
                    <img
                      src={order.qrUrl || order.payUrl}
                      alt="Mã VietQR thanh toán gói hội viên"
                      className="w-full h-auto aspect-square object-contain rounded-md"
                    />
                  ) : (
                    <QrCode className="w-16 h-16 text-theme-muted" aria-hidden="true" />
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-muted">
                  <QrCode className="w-4 h-4 text-theme-brand" aria-hidden="true" />
                  <span>Hỗ trợ mọi ứng dụng Ngân hàng & Ví điện tử</span>
                </span>
              </div>

              <div className="md:col-span-6 space-y-2.5">
                {[
                  ['Ngân hàng', bankName, order?.bankInfo?.bankShortName || bankName],
                  ['Số tài khoản', order?.bankInfo?.accountNumber, order?.bankInfo?.accountNumber],
                  ['Chủ tài khoản', order?.bankInfo?.accountName, order?.bankInfo?.accountName],
                  ['Số tiền', order ? `${formatMoney(order.amount)} đ` : '', order?.amount],
                  ['Nội dung chuyển khoản', order?.transferMemo, order?.transferMemo],
                ].map(([label, value, copyValue]) => (
                  <div
                    key={label}
                    className="p-3 rounded-2xl bg-theme-page border border-theme-line flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-xs text-theme-muted font-semibold block">{label}</span>
                      <span className="text-sm font-extrabold text-theme-ink break-words">
                        {isCreating ? '...' : value || 'Chưa cấu hình'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(copyValue, label)}
                      disabled={!copyValue}
                      aria-label={`Sao chép ${label}`}
                      className="w-11 h-11 shrink-0 inline-flex items-center justify-center text-theme-ink bg-theme-surface border border-theme-line hover:bg-theme-brand-soft rounded-2xl transition-colors disabled:bg-theme-page disabled:text-theme-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                    >
                      {copiedField === label ? (
                        <Check className="w-4 h-4 text-status-ok" aria-hidden="true" />
                      ) : (
                        <Copy className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border bg-status-warn-bg border-status-warn-line/50 text-xs font-medium text-status-warn-text flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Vui lòng chuyển đúng số tiền và giữ nguyên nội dung chuyển khoản để hệ thống xác nhận tự động trong vài giây.
              </span>
            </div>

            <button
              type="button"
              onClick={() => checkStatus()}
              disabled={!order?.orderCode || isCreating || isChecking || completed}
              className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-theme-brand text-theme-surface font-bold text-sm hover:bg-theme-ink transition-colors shadow-sm flex items-center justify-center gap-2 disabled:bg-theme-line disabled:text-theme-muted disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  <span>Đang kiểm tra thanh toán...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                  <span>Tôi đã hoàn tất chuyển khoản</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
