import React, { useEffect, useMemo, useState } from 'react';
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
  const { user, tier, refreshTokenAction } = useAuthController();

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

  const handleCompleted = async (statusData) => {
    if (completed) return;
    setCompleted(true);
    setPaymentStatus(statusData.status);

    try {
      await refreshTokenAction();
    } catch (error) {
      console.warn('Silent refresh after payment failed:', error);
    }

    toast.success('Thanh toán đã được xác minh. Gói của bạn đã được kích hoạt.');
    setTimeout(() => {
      navigate('/upgrade?payment_success=true', {
        replace: true,
        state: {
          paymentSuccess: true,
          targetTier: selectedTier,
          transactionId: order?.orderCode,
        },
      });
    }, 1200);
  };

  const checkStatus = async ({ silent = false } = {}) => {
    if (!order?.orderCode || completed) return;
    if (!silent) setIsChecking(true);
    setErrorMessage('');

    try {
      const statusData = await getPaymentStatus(order.orderCode);
      setPaymentStatus(statusData.status);

      if (isCompletedStatus(statusData.status)) {
        await handleCompleted(statusData);
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
  };

  useEffect(() => {
    if (!order?.orderCode || completed) return undefined;

    const interval = setInterval(() => {
      checkStatus({ silent: true });
    }, 4000);

    return () => clearInterval(interval);
  }, [order?.orderCode, completed]);

  const handleCopy = async (text, fieldName) => {
    if (!text) return;
    await navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    toast.success(`Da sao chep ${fieldName}`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">
      <button
        type="button"
        onClick={() => navigate('/upgrade')}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-momPink transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Quay lại bảng gói dịch vụ</span>
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/80 dark:bg-gray-850/80 backdrop-blur-xl border border-pink-100/70 dark:border-gray-800 p-5 rounded-3xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-pink-100 dark:bg-pink-950/40 text-momPink-dark dark:text-pink-300 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Thanh toán chuyển khoản</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Kích hoạt gói {tierInfo.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-3.5 py-2 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/40 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Thanh toán an toàn</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white/80 dark:bg-gray-850/80 backdrop-blur-xl border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-5">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3">
                1. Chọn gói dịch vụ
              </h3>
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
                      className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                        active
                          ? 'border-momPink ring-2 ring-momPink/30 bg-pink-50/50 dark:bg-pink-950/20'
                          : 'border-gray-200 dark:border-gray-800 hover:border-pink-300'
                      } disabled:opacity-60`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className={active ? 'w-4 h-4 text-momPink' : 'w-4 h-4 text-gray-400'} />
                        {active && <CheckCircle2 className="w-4 h-4 text-momPink" />}
                      </div>
                      <p className="text-xs font-extrabold text-gray-900 dark:text-white mt-2">
                        {TIERS_DATA[item.id].shortName}
                      </p>
                      <p className="text-[11px] font-bold text-gray-400 mt-0.5">
                        {TIERS_DATA[item.id].monthlyPrice} / tháng
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Chu kỳ thanh toán
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { m: 1, label: '1 tháng', price: tierInfo.monthlyPrice },
                  { m: 6, label: '6 tháng', price: tierInfo.sixMonthPrice },
                ].map((item) => (
                  <button
                    key={item.m}
                    type="button"
                    onClick={() => setMonths(item.m)}
                    disabled={isCreating}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center gap-0.5 ${
                      months === item.m
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                    } disabled:opacity-60`}
                  >
                    <span>{item.label}</span>
                    <span className={months === item.m ? 'text-[10px] opacity-80' : 'text-[10px] text-gray-400'}>
                      {item.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Tài khoản
              </label>
              <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Người mua:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 truncate">
                    {user?.fullName || user?.email || 'MomOi user'}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-gray-400">Gói hiện tại:</span>
                  <span className="font-semibold text-momPink-dark dark:text-pink-400">
                    {getTierNameVi(tier)}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tổng thanh toán</p>
                  <p className="text-3xl font-black text-momPink mt-1">
                    {isCreating ? '...' : `${formatMoney(order?.amount)} d`}
                  </p>
                  {order?.planName && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{order.planName}</p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/30 flex items-center justify-center">
                  <TierIcon className="w-6 h-6 text-momPink" />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-semibold flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white/90 dark:bg-gray-850/90 border border-pink-100/70 dark:border-gray-800 rounded-3xl shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">
                  2. Quét mã VietQR
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Quét mã hoặc chuyển khoản đúng thông tin bên dưới.
                </p>
              </div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black ${
                completed
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
              }`}>
                {completed ? <Check className="w-3.5 h-3.5" /> : <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{completed ? 'Đã hoàn tất' : 'Chờ thanh toán'}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-6 flex flex-col items-center gap-3">
                <div className="bg-white p-3 rounded-2xl shadow-xl border-2 border-pink-200 dark:border-gray-700 max-w-[280px] min-h-[280px] flex items-center justify-center">
                  {isCreating ? (
                    <Loader2 className="w-10 h-10 text-momPink animate-spin" />
                  ) : order?.qrUrl || order?.payUrl ? (
                    <img
                      src={order.qrUrl || order.payUrl}
                      alt="VietQR thanh toán"
                      className="w-full h-auto aspect-square object-contain rounded-xl"
                    />
                  ) : (
                    <QrCode className="w-16 h-16 text-gray-300" />
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                  <QrCode className="w-3.5 h-3.5 text-momPink" />
                  Quét bằng ứng dụng ngân hàng
                </span>
              </div>

              <div className="md:col-span-6 space-y-2.5">
                {[
                  ['Ngan hang', bankName, order?.bankInfo?.bankShortName || bankName],
                  ['Số tài khoản', order?.bankInfo?.accountNumber, order?.bankInfo?.accountNumber],
                  ['Chủ tài khoản', order?.bankInfo?.accountName, order?.bankInfo?.accountName],
                  ['Số tiền', order ? `${formatMoney(order.amount)} đ` : '', order?.amount],
                  ['Nội dung', order?.transferMemo, order?.transferMemo],
                ].map(([label, value, copyValue]) => (
                  <div
                    key={label}
                    className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-150 dark:border-gray-700/60 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 uppercase font-bold block">{label}</span>
                      <span className="text-sm font-black text-gray-900 dark:text-white break-words">
                        {isCreating ? '...' : value || 'Chưa cấu hình'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(copyValue, label)}
                      disabled={!copyValue}
                      className="p-2 text-gray-400 hover:text-momPink hover:bg-pink-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-40"
                      title={`Sao chep ${label}`}
                    >
                      {copiedField === label ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/70 dark:border-blue-900/40 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                Vui lòng chuyển đúng số tiền và giữ nguyên nội dung chuyển khoản để hệ thống xác nhận tự động.
              </span>
            </div>

            <button
              type="button"
              onClick={() => checkStatus()}
              disabled={!order?.orderCode || isCreating || isChecking || completed}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-momPink via-pink-600 to-momPurple text-white font-black text-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isChecking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang kiểm tra thanh toán...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Tôi đã hoàn tất chuyển khoản</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
