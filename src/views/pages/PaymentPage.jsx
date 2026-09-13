import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useAuthController } from '../../controllers/authController';
import { BANK_CONFIG } from '../../config/bankConfig';
import {
  generateOrderDetails,
  confirmOrderPayment,
  checkBankTransferReceived,
  markSepayTxAsUsed,
  TIERS_DATA,
} from '../../models/services/paymentService';
import { getTierNameVi } from '../../utils/tierHelpers';
import {
  ArrowLeft,
  QrCode,
  Copy,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Zap,
  Crown,
  Building2,
  CreditCard,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Download,
  PartyPopper,
  Flame,
  Radio,
  Key,
  HelpCircle,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user, tier, upgradeTier, refreshTokenAction } = useAuthController();

  // Đọc gói từ query param, location state hoặc localStorage, mặc định là SuperMomVip nếu có giao dịch
  const initialTier =
    location.state?.targetTier ||
    searchParams.get('tier') ||
    localStorage.getItem('selected_payment_tier') ||
    'SuperMomVip';

  const [selectedTier, setSelectedTier] = useState(
    initialTier === 'MomHienDai' ? 'MomHienDai' : 'SuperMomVip'
  );
  const [months, setMonths] = useState(1);
  const [copiedField, setCopiedField] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(4);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Trạng thái kiểm tra biến động số dư MB Bank thật
  const [sepayToken, setSepayToken] = useState(
    BANK_CONFIG.sepayApiToken || localStorage.getItem('sepay_token') || ''
  );
  const [tempTokenInput, setTempTokenInput] = useState(sepayToken);
  const [showSePayModal, setShowSePayModal] = useState(false);
  const [bankCheckMessage, setBankCheckMessage] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  // Countdown timer 15:00 phút
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Tính toán đơn hàng và mã VietQR động
  const order = useMemo(() => {
    return generateOrderDetails(selectedTier, months, user?.email || '');
  }, [selectedTier, months, user?.email]);

  // Lưu API Token SePay
  const handleSaveSepayToken = (token) => {
    const cleanToken = token.trim();
    setSepayToken(cleanToken);
    BANK_CONFIG.sepayApiToken = cleanToken;
    localStorage.setItem('sepay_token', cleanToken);
    setShowSePayModal(false);
    toast.success('Đã lưu SePay API Token! Hệ thống bắt đầu quét số dư MB Bank.');
  };

  // Tự động kiểm tra biến động số dư ngầm mỗi 4s khi có SePay Token
  useEffect(() => {
    if (!sepayToken || showSuccessModal) return;

    let isSubscribed = true;
    setIsPolling(true);

    const interval = setInterval(async () => {
      if (!isSubscribed) return;
      try {
        const checkRes = await checkBankTransferReceived({
          memo: order.transferMemo,
          amount: order.totalAmount,
          targetTier: selectedTier,
          orderCode: order.orderCode,
          orderCreatedAt: order.orderCreatedAt,
        });

        if (checkRes.received && isSubscribed) {
          toast.success('🎉 Đã nhận được chuyển khoản từ mã QR web! Đang tự động kích hoạt gói...');
          clearInterval(interval);
          if (checkRes.transaction?.id) {
            markSepayTxAsUsed(checkRes.transaction.id);
          }
          const activatedTier = checkRes.detectedTier || selectedTier;
          handleExecuteActivation(false, checkRes.transaction?.reference_number || checkRes.transaction?.id, activatedTier);
        }
      } catch (err) {
        console.warn('Polling error:', err);
      }
    }, 4000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [sepayToken, order.transferMemo, order.totalAmount, order.orderCode, order.orderCreatedAt, selectedTier, showSuccessModal]);

  // Sao chép thông tin vào clipboard
  const handleCopy = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Đã sao chép ${fieldName}! 📋`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Hàm thực hiện kích hoạt gói
  const handleExecuteActivation = async (isDemo = false, externalTxnId = null, overrideTier = null) => {
    const tierToActivate = overrideTier || selectedTier;
    setIsProcessing(true);
    try {
      const txnId = externalTxnId || order.transactionId;
      
      // 1. Đồng bộ backend
      try {
        await confirmOrderPayment({
          targetTier: tierToActivate,
          transactionId: txnId,
          months: months,
          paymentMethod: `VietQR (MB Bank - ${BANK_CONFIG.accountNumber})`,
        });
      } catch (beErr) {
        console.warn('confirmOrderPayment background sync:', beErr);
      }

      // 2. Kích hoạt auth store & localStorage
      try {
        await upgradeTier(tierToActivate);
      } catch (tierErr) {
        console.warn('upgradeTier fallback:', tierErr);
      }

      // Đảm bảo localStorage và Zustand luôn được cập nhật chính xác
      localStorage.setItem('tier', tierToActivate);
      const currUser = user || JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currUser,
        tier: tierToActivate === 'SuperMomVip' ? 2 : 1,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      try {
        await refreshTokenAction();
      } catch (e) {
        console.warn('Silent refresh error:', e);
      }

      setCompletedOrder({
        ...order,
        tierInfo: TIERS_DATA[tierToActivate] || order.tierInfo,
        transactionId: txnId,
        paidAt: new Date().toLocaleString('vi-VN'),
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Activation fallback error:', error);
      localStorage.setItem('tier', tierToActivate);
      setShowSuccessModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  // Bấm nút "Tôi Đã Hoàn Tất Chuyển Khoản"
  const handleCompletePayment = async (isDemo = false) => {
    if (isDemo) {
      toast('⚡ Chế độ Demo: Đang kích hoạt gói thử nghiệm...', { icon: '⏳' });
      await handleExecuteActivation(true);
      return;
    }

    setIsProcessing(true);
    setBankCheckMessage(null);

    try {
      // 1. Kiểm tra tài khoản MB Bank qua SePay (CHỈ NHẬN QUA MÃ QR CỦA WEB)
      const checkRes = await checkBankTransferReceived({
        memo: order.transferMemo,
        amount: order.totalAmount,
        targetTier: selectedTier,
        orderCode: order.orderCode,
        orderCreatedAt: order.orderCreatedAt,
      });

      // Nếu chưa cấu hình SePay
      if (!checkRes.configured) {
        setIsProcessing(false);
        setShowSePayModal(true);
        return;
      }

      // Nếu đã cấu hình nhưng chưa nhận được tiền từ mã QR web: CHẶN LẠI!
      if (!checkRes.received) {
        setIsProcessing(false);
        setBankCheckMessage(checkRes.message);
        toast.error(
          `❌ Chưa nhận được chuyển khoản từ mã QR web! Vui lòng chuyển ${order.totalAmount.toLocaleString('vi-VN')}đ với nội dung "${order.transferMemo}".`,
          { duration: 5500 }
        );
        return;
      }

      // 2. Nếu đã nhận được tiền thật từ mã QR web: Kích hoạt ngay & đánh dấu giao dịch đã dùng
      if (checkRes.transaction?.id) {
        markSepayTxAsUsed(checkRes.transaction.id);
      }
      const activatedTier = checkRes.detectedTier || selectedTier;
      await handleExecuteActivation(
        false,
        checkRes.transaction?.reference_number || checkRes.transaction?.id,
        activatedTier
      );
    } catch (error) {
      console.error('Payment error:', error);
      setBankCheckMessage('Lỗi trong quá trình kiểm tra biến động số dư: ' + (error?.message || 'Vui lòng thử lại'));
      setIsProcessing(false);
    }
  };

  // Tự động đếm ngược chuyển hướng khi mở modal thành công
  useEffect(() => {
    let interval = null;
    if (showSuccessModal) {
      interval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate('/upgrade?payment_success=true', {
              replace: true,
              state: {
                paymentSuccess: true,
                targetTier: selectedTier,
                transactionId: completedOrder?.transactionId,
              },
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showSuccessModal, navigate, selectedTier, completedOrder]);

  const tierInfo = order.tierInfo;
  const TierIcon = selectedTier === 'SuperMomVip' ? Crown : Zap;

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">
      {/* Top back button */}
      <button
        onClick={() => navigate('/upgrade')}
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-momPink transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Quay lại bảng gói dịch vụ</span>
      </button>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 dark:bg-gray-850/70 backdrop-blur-xl border border-pink-100/60 dark:border-gray-800 p-5 rounded-3xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-pink-100 dark:bg-pink-950/40 text-momPink-dark dark:text-pink-300 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cổng Thanh Toán Chuyển Khoản Trực Tiếp</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            Thanh Toán Kích Hoạt Gói {tierInfo.name}
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-3.5 py-2 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/40 text-xs font-bold">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Tài khoản thụ hưởng chính chủ Bùi Anh Duy</span>
        </div>
      </div>

      {/* Main Grid: Left = Summary & Config, Right = Real VietQR Code */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: GÓI DỊCH VỤ & THÔNG TIN ĐƠN HÀNG (5 Cols)   */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card chọn gói */}
          <div className="bg-white/80 dark:bg-gray-850/80 backdrop-blur-xl border border-gray-150 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
              1. Chọn Gói Dịch Vụ
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Option Mẹ Hiện Đại */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTier('MomHienDai');
                  localStorage.setItem('selected_payment_tier', 'MomHienDai');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  selectedTier === 'MomHienDai'
                    ? 'border-momPink ring-2 ring-momPink/30 bg-pink-50/40 dark:bg-pink-950/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-pink-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Zap
                    className={`w-4 h-4 ${
                      selectedTier === 'MomHienDai'
                        ? 'text-momPink'
                        : 'text-gray-400'
                    }`}
                  />
                  {selectedTier === 'MomHienDai' && (
                    <CheckCircle2 className="w-4 h-4 text-momPink" />
                  )}
                </div>
                <p className="text-xs font-extrabold text-gray-900 dark:text-white mt-2">
                  Mẹ Hiện Đại ✨
                </p>
                <p className="text-sm font-black text-momPink mt-0.5">
                  99.000đ<span className="text-[10px] text-gray-400 font-normal">/tháng</span>
                </p>
              </button>

              {/* Option Super Mom VIP */}
              <button
                type="button"
                onClick={() => {
                  setSelectedTier('SuperMomVip');
                  localStorage.setItem('selected_payment_tier', 'SuperMomVip');
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                  selectedTier === 'SuperMomVip'
                    ? 'border-purple-400 ring-2 ring-purple-400/30 bg-purple-50/40 dark:bg-purple-950/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-purple-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Crown
                    className={`w-4 h-4 ${
                      selectedTier === 'SuperMomVip'
                        ? 'text-momPurple'
                        : 'text-gray-400'
                    }`}
                  />
                  {selectedTier === 'SuperMomVip' && (
                    <CheckCircle2 className="w-4 h-4 text-momPurple" />
                  )}
                </div>
                <p className="text-xs font-extrabold text-gray-900 dark:text-white mt-2">
                  Super Mom VIP 💎
                </p>
                <p className="text-sm font-black text-momPurple mt-0.5">
                  199.000đ<span className="text-[10px] text-gray-400 font-normal">/tháng</span>
                </p>
              </button>
            </div>

            {/* Chọn chu kỳ */}
            <div>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Chu kỳ thanh toán
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { m: 1, label: '1 Tháng', discount: null },
                  { m: 3, label: '3 Tháng', discount: 'Giảm 10%' },
                  { m: 12, label: '1 Năm', discount: 'Giảm 20%' },
                ].map((item) => (
                  <button
                    key={item.m}
                    type="button"
                    onClick={() => setMonths(item.m)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center justify-center relative ${
                      months === item.m
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent shadow-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.discount && (
                      <span className="text-[9px] text-momPink font-extrabold">
                        {item.discount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Thông tin khách hàng */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Thông tin người mua
              </label>
              <div className="bg-gray-50 dark:bg-gray-800/60 p-3 rounded-xl space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Tài khoản:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                    {user?.fullName || 'Khách hàng Mom Ơi!'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="font-bold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                    {user?.email || 'Chưa cập nhật'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gói hiện tại:</span>
                  <span className="font-semibold text-momPink-dark dark:text-pink-400">
                    {getTierNameVi(tier)}
                  </span>
                </div>
              </div>
            </div>

            {/* Chi tiết tính tiền */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Đơn giá gói ({months} tháng):</span>
                <span>{order.basePrice.toLocaleString('vi-VN')}đ</span>
              </div>

              {order.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Ưu đãi chu kỳ ({order.discountPercent}%):</span>
                  <span>-{order.discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Thuế VAT:</span>
                <span className="text-emerald-600 font-semibold">0đ (Miễn phí)</span>
              </div>

              <div className="pt-2 border-t border-dashed border-gray-200 dark:border-gray-700 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                  Tổng thanh toán:
                </span>
                <div className="text-right">
                  <span className="text-2xl font-black bg-gradient-to-r from-momPink to-pink-600 bg-clip-text text-transparent">
                    {order.totalAmount.toLocaleString('vi-VN')}đ
                  </span>
                  <p className="text-[10px] text-gray-400">Đã bao gồm toàn bộ phí kích hoạt</p>
                </div>
              </div>
            </div>

            {/* Đặc quyền gói */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Đặc quyền nhận được ngay:
              </p>
              <ul className="space-y-1.5">
                {tierInfo.features.slice(0, 4).map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: KHUNG QUÉT MÃ VIETQR TIỀN THẬT (7 Cols)   */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white/90 dark:bg-gray-850/90 backdrop-blur-xl border border-pink-100 dark:border-gray-800 rounded-3xl p-6 sm:p-7 shadow-lg space-y-6">
            
            {/* Header mã QR */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/20">
                  MB
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900 dark:text-white">
                    Quét Mã VietQR Napas 247
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Tự động nhận diện tài khoản, số tiền và nội dung
                  </p>
                </div>
              </div>

              {/* Countdown clock */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 text-xs font-bold shrink-0">
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Hết hạn sau: </span>
                <span className="font-black font-mono">{formatTimer(timeLeft)}</span>
              </div>
            </div>

            {/* QR Box & Copy info layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* QR Image Container (5 cols) */}
              <div className="md:col-span-6 flex flex-col items-center justify-center space-y-3">
                <div className="p-3 bg-white rounded-3xl shadow-xl border-2 border-pink-200 dark:border-gray-700 relative group overflow-hidden max-w-[260px]">
                  <img
                    src={order.qrUrl}
                    alt={`Mã VietQR ${BANK_CONFIG.bankName}`}
                    className="w-full h-auto aspect-square object-contain rounded-xl"
                  />
                  
                  {/* Subtle scan glow line */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-400/10 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300"></div>
                </div>

                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    <QrCode className="w-3.5 h-3.5 text-momPink" />
                    Quét bằng mọi ứng dụng Ngân hàng hoặc MoMo
                  </span>
                </div>
              </div>

              {/* Information to copy (7 cols) */}
              <div className="md:col-span-6 space-y-2.5">
                {/* 1. Ngân Hàng */}
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-150 dark:border-gray-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">
                      Ngân hàng thụ hưởng
                    </span>
                    <span className="text-xs font-black text-gray-850 dark:text-white">
                      {BANK_CONFIG.bankName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(BANK_CONFIG.bankShortName, 'Ngân hàng')}
                    className="p-1.5 text-gray-400 hover:text-momPink hover:bg-pink-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Sao chép tên ngân hàng"
                  >
                    {copiedField === 'Ngân hàng' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* 2. Số tài khoản (STK) */}
                <div className="p-2.5 rounded-xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200/70 dark:border-pink-900/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-momPink-dark dark:text-pink-400 uppercase font-bold block">
                      Số tài khoản (STK thật)
                    </span>
                    <span className="text-sm font-black font-mono text-gray-900 dark:text-white tracking-wider">
                      {BANK_CONFIG.accountNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(BANK_CONFIG.accountNumber, 'Số tài khoản')}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-momPink text-white hover:bg-pink-600 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    {copiedField === 'Số tài khoản' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Chép STK</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 3. Tên chủ tài khoản */}
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-150 dark:border-gray-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">
                      Chủ tài khoản
                    </span>
                    <span className="text-xs font-black text-gray-850 dark:text-white uppercase">
                      {BANK_CONFIG.accountName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(BANK_CONFIG.accountName, 'Chủ tài khoản')}
                    className="p-1.5 text-gray-400 hover:text-momPink hover:bg-pink-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {copiedField === 'Chủ tài khoản' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* 4. Số tiền chính xác */}
                <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-150 dark:border-gray-700/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">
                      Số tiền chuyển
                    </span>
                    <span className="text-sm font-black text-momPink">
                      {order.totalAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(order.totalAmount.toString(), 'Số tiền')}
                    className="p-1.5 text-gray-400 hover:text-momPink hover:bg-pink-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {copiedField === 'Số tiền' ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* 5. Nội dung chuyển khoản */}
                <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase font-bold block">
                      Nội dung chuyển khoản (Bắt buộc)
                    </span>
                    <span className="text-xs font-black font-mono text-gray-900 dark:text-white">
                      {order.transferMemo}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(order.transferMemo, 'Nội dung')}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    {copiedField === 'Nội dung' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Chép mã</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Hướng dẫn 3 bước */}
            <div className="bg-gray-50/80 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-150 dark:border-gray-800 space-y-2">
              <h4 className="text-xs font-extrabold text-gray-700 dark:text-gray-300">
                💡 Hướng dẫn thanh toán nhanh:
              </h4>
              <ol className="text-[11px] text-gray-500 dark:text-gray-400 space-y-1 list-decimal list-inside font-medium leading-relaxed">
                <li>
                  Mở ứng dụng ngân hàng bất kỳ (MB, Vietcombank, Techcombank, VPBank,...) hoặc MoMo.
                </li>
                <li>
                  Chọn chức năng <strong>Quét mã QR</strong> và hướng camera vào mã VietQR bên trên.
                </li>
                <li>
                  Kiểm tra số tiền và nội dung chuyển khoản, bấm <strong>Xác nhận chuyển tiền</strong>.
                </li>
                <li>
                  Sau khi trừ tiền, bấm nút <strong>"Tôi Đã Hoàn Tất Chuyển Khoản"</strong> bên dưới để kích hoạt ngay.
                </li>
              </ol>
            </div>

            {/* Widget trạng thái kiểm tra biến động số dư ngân hàng thật */}
            <div className="p-3.5 rounded-2xl border transition-all space-y-2 bg-gradient-to-r from-gray-50 to-pink-50/30 dark:from-gray-800/60 dark:to-pink-950/20 border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${sepayToken ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                  <span className="text-xs font-black text-gray-800 dark:text-gray-200">
                    {sepayToken ? 'Đang quét biến động số dư MB Bank (SePay 24/7)' : 'Chế độ đối soát tài khoản MB Bank'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSePayModal(true)}
                  className="text-[11px] font-bold text-momPink hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Key className="w-3 h-3" />
                  <span>{sepayToken ? 'Đổi SePay Token' : 'Kết nối SePay Token'}</span>
                </button>
              </div>

              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                {sepayToken
                  ? '🟢 Hệ thống sẽ TỰ ĐỘNG kích hoạt ngay khi bạn chuyển tiền vào tài khoản MB Bank thành công (không cần bấm nút).'
                  : '⚠️ Lưu ý: Để hệ thống tự động kiểm tra số dư và CHẶN khi chưa nhận được tiền thật, bạn có thể kết nối SePay API Token (miễn phí).'}
              </p>

              {/* Phân tách giao dịch: Chỉ nhận mã QR web, bỏ qua giao dịch cá nhân bên ngoài */}
              <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 text-[11px] text-blue-700 dark:text-blue-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">🛡️ Phân tách giao dịch an toàn:</span>
                  <span className="leading-tight block text-gray-600 dark:text-gray-300">
                    Hệ thống <strong>CHỈ nhận diện</strong> biến động số dư có nội dung chứa mã QR web: <span className="font-extrabold text-momPink px-1 py-0.5 bg-pink-100/70 dark:bg-pink-900/40 rounded">{order.transferMemo}</span>. Mọi biến động số dư cá nhân bên ngoài tài khoản MB Bank của bạn sẽ được tự động bỏ qua.
                  </span>
                </div>
              </div>

              {/* Thông báo lỗi khi bấm hoàn tất mà chưa có tiền vào */}
              {bankCheckMessage && (
                <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs font-semibold flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{bankCheckMessage}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => handleCompletePayment(false)}
                disabled={isProcessing}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-momPink via-pink-600 to-momPurple text-white font-black text-sm hover:opacity-95 active:scale-[0.98] transition-all shadow-lg shadow-pink-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Hệ thống đang kiểm tra biến động số dư MB Bank...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Tôi Đã Hoàn Tất Chuyển Khoản</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Demo Helper Button (Dành cho việc thuyết trình / test nhanh mà không cần quét thật) */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => handleCompletePayment(true)}
                  disabled={isProcessing}
                  className="text-xs font-bold text-gray-400 hover:text-momPink transition-colors underline decoration-dotted cursor-pointer"
                >
                  ⚡ Bấm vào đây nếu muốn mô phỏng kích hoạt ngay (Dành cho Test / Demo khi chưa có SePay)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL CHÚC MỪNG THANH TOÁN THÀNH CÔNG & ĐIỀU HƯỚNG      */}
      {/* ======================================================== */}
      {showSuccessModal && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-gray-850 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-pink-100 dark:border-gray-800 shadow-2xl space-y-6 text-center relative overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Ambient celebration glow */}
            <div className="absolute -top-12 -left-12 w-36 h-36 bg-pink-400/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-purple-400/20 rounded-full blur-2xl pointer-events-none"></div>

            {/* Success icon with ping effect */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping"></div>
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                <PartyPopper className="w-3 h-3" />
                <span>Giao Dịch Thành Công</span>
              </div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">
                Chúc Mừng Mami Nâng Cấp Thành Công! 🎉
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Gói dịch vụ <strong className="text-momPink-dark dark:text-pink-400">{completedOrder.tierInfo.name}</strong> đã được kích hoạt trên tài khoản của bạn.
              </p>
            </div>

            {/* Hóa đơn tóm tắt */}
            <div className="bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-4 text-xs space-y-2 border border-gray-150 dark:border-gray-700/60 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Mã giao dịch:</span>
                <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                  {completedOrder.transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phương thức:</span>
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  VietQR (MB Bank)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Số tiền:</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {completedOrder.totalAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Thời gian:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {completedOrder.paidAt}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-2 font-bold">
                <span className="text-gray-500">Trạng thái:</span>
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã Kích Hoạt
                </span>
              </div>
            </div>

            {/* Redirect action */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() =>
                  navigate('/upgrade?payment_success=true', {
                    replace: true,
                    state: {
                      paymentSuccess: true,
                      targetTier: selectedTier,
                      transactionId: completedOrder.transactionId,
                    },
                  })
                }
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-black hover:opacity-95 shadow-md shadow-pink-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Xem Gói Dịch Vụ Của Bạn Ngay 🌸</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-gray-400 font-medium">
                Tự động chuyển về trang Gói Dịch Vụ sau {redirectCountdown}s...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL CẤU HÌNH SEPAY API TOKEN                           */}
      {/* ======================================================== */}
      {showSePayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-850 rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-pink-150 dark:border-gray-800 shadow-2xl space-y-5 text-left relative animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowSePayModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-momPink/15 text-momPink flex items-center justify-center font-bold text-lg">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-white">
                  Kết Nối Đọc Biến Động Số Dư MB Bank
                </h3>
                <p className="text-xs text-gray-400">
                  Tự động kiểm tra tiền vào thật và chặn kích hoạt nếu chưa nhận tiền
                </p>
              </div>
            </div>

            {/* Guide */}
            <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl border border-gray-150 dark:border-gray-700/60 text-xs space-y-2.5 leading-relaxed text-gray-650 dark:text-gray-300">
              <p className="font-bold text-gray-900 dark:text-white">
                💡 Để nhận diện tiền vào tài khoản MB Bank {BANK_CONFIG.accountNumber} tự động 100%:
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <li>
                  Đăng ký tài khoản miễn phí tại:{' '}
                  <a
                    href="https://sepay.vn"
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-momPink underline inline-flex items-center gap-0.5"
                  >
                    sepay.vn <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Thêm tài khoản <strong>MB Bank (0914180202)</strong> vào SePay.</li>
                <li>Vào mục <strong>Tích hợp web / API Keys</strong> trên SePay copy mã <strong>API Token</strong>.</li>
                <li>Dán API Token vào ô bên dưới rồi bấm <strong>Lưu Token</strong>.</li>
              </ol>
            </div>

            {/* Input field */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-gray-700 dark:text-gray-300">
                SePay API Token của bạn:
              </label>
              <input
                type="text"
                value={tempTokenInput}
                onChange={(e) => setTempTokenInput(e.target.value)}
                placeholder="Ví dụ: SEPAY_TOKEN_ABC123456..."
                className="w-full px-3.5 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-mono focus:outline-none focus:border-momPink focus:ring-2 focus:ring-momPink/20"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleSaveSepayToken(tempTokenInput)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-black hover:opacity-95 shadow-md shadow-pink-500/25 transition-all cursor-pointer"
              >
                Lưu Token & Bật Quét Tự Động
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSePayModal(false);
                  handleCompletePayment(true);
                }}
                className="py-3 px-4 rounded-xl bg-gray-150 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Bỏ qua (Demo nhanh)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
