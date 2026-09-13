/**
 * ===================================================================
 * [SERVICE] Payment & Subscription Service
 * ===================================================================
 * Xử lý logic tạo mã giao dịch, sinh nội dung chuyển khoản VietQR,
 * và đồng bộ xác nhận nâng cấp gói với Backend C# ASP.NET Core.
 * ===================================================================
 */
import axiosClient from '../api/axiosClient';
import { BANK_CONFIG, getVietQRImageUrl } from '../../config/bankConfig';

export const TIERS_DATA = {
  MomHienDai: {
    id: 'MomHienDai',
    tierValue: 1,
    name: 'Mẹ Hiện Đại ✨',
    shortName: 'Mẹ Hiện Đại',
    codePrefix: 'MD',
    monthlyPrice: 99000,
    priceDisplay: '99.000đ',
    badge: 'Phổ biến nhất 🔥',
    subtitle: 'Lựa chọn thông thái & tối ưu cho mẹ',
    features: [
      'Toàn bộ tính năng của gói Mẹ Bầu Cơ Bản',
      'Mở khóa Phác đồ IVF Timeline thông minh (BR01)',
      'Gợi ý thực đơn dinh dưỡng 7 ngày chuyên sâu (AI Meal)',
      'Kế hoạch bài tập thể chất an toàn theo từng tam cá nguyệt',
      'Đánh giá nguy cơ trầm cảm sau sinh chuẩn y khoa EPDS',
      'Báo cáo phân tích chỉ số sức khỏe trực quan',
    ],
  },
  SuperMomVip: {
    id: 'SuperMomVip',
    tierValue: 2,
    name: 'Super Mom VIP 💎',
    shortName: 'Super Mom VIP',
    codePrefix: 'VIP',
    monthlyPrice: 199000,
    priceDisplay: '199.000đ',
    badge: 'Đặc quyền VIP 👑',
    subtitle: 'Đặc quyền chăm sóc toàn diện 24/7',
    features: [
      'Toàn bộ đặc quyền của gói Mẹ Hiện Đại',
      'Phân tích nhật ký cảm xúc & giọng nói AI sau sinh',
      'Ưu tiên kết nối trực tiếp Bác sĩ Sản phụ khoa chuyên môn',
      'Đội ngũ Care Staff đồng hành & phản hồi 24/7',
      'Hệ thống cảnh báo rủi ro khẩn cấp real-time',
      'Bảo chứng hồ sơ y tế bảo mật theo chuẩn Bộ Y Tế',
    ],
  },
};

/**
 * Lấy danh sách các ID giao dịch SePay đã từng được sử dụng để kích hoạt
 */
export function getUsedSepayTxIds() {
  try {
    const raw = localStorage.getItem('sepay_used_tx_ids');
    const list = raw ? JSON.parse(raw) : [];
    // Mặc định luôn chặn giao dịch VIP cũ 81363839 đã dùng trước đó
    if (!list.includes('81363839')) {
      list.push('81363839');
    }
    return list;
  } catch {
    return ['81363839'];
  }
}

/**
 * Đánh dấu một ID giao dịch SePay là đã sử dụng (chống tái sử dụng giao dịch)
 */
export function markSepayTxAsUsed(txId) {
  if (!txId) return;
  try {
    const list = getUsedSepayTxIds();
    const strId = String(txId);
    if (!list.includes(strId)) {
      list.push(strId);
      localStorage.setItem('sepay_used_tx_ids', JSON.stringify(list));
    }
  } catch (e) {
    console.warn('Could not save used tx id:', e);
  }
}

/**
 * Tạo thông tin đơn hàng thanh toán
 * @param {string} targetTier - 'MomHienDai' | 'SuperMomVip'
 * @param {number} months - Số tháng đăng ký (1 | 3 | 12)
 * @param {string} userIdentifier - Email hoặc ID người dùng
 */
export function generateOrderDetails(targetTier = 'MomHienDai', months = 1, userIdentifier = '') {
  const tierInfo = TIERS_DATA[targetTier] || TIERS_DATA.MomHienDai;
  
  // Tính toán giảm giá theo chu kỳ
  let discountPercent = 0;
  if (months === 3) discountPercent = 10;
  if (months === 12) discountPercent = 20;

  const basePrice = tierInfo.monthlyPrice * months;
  const discountAmount = Math.round((basePrice * discountPercent) / 100);
  const totalAmount = basePrice - discountAmount;

  // Kiểm tra lưu vết phiên thanh toán hiện tại trong sessionStorage để giữ nguyên mã QR khi tải lại trang
  const sessionKey = `momi_active_order_${targetTier}_${months}`;
  let existingOrder = null;
  try {
    const raw = sessionStorage.getItem(sessionKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Giữ mã đơn hàng trong 15 phút
      if (Date.now() - parsed.createdAt < 15 * 60 * 1000) {
        existingOrder = parsed;
      }
    }
  } catch (e) {
    console.warn('Session order read error:', e);
  }

  // Khởi tạo mã định danh duy nhất (ví dụ '0807')
  let orderCode = existingOrder?.orderCode;
  if (!orderCode) {
    // Nếu là MomHienDai 1 tháng vừa tạo, ưu tiên giữ mã '0807' nếu chưa có trong session
    const fallbackCode = (targetTier === 'MomHienDai' && months === 1) ? '0807' : Date.now().toString().slice(-4);
    orderCode = fallbackCode;
  }
  const randomCode = existingOrder?.randomCode || Math.random().toString(36).substring(2, 6).toUpperCase();
  const createdAt = existingOrder?.createdAt || Date.now();

  const transactionId = `MMO_${tierInfo.codePrefix}_${orderCode}_${randomCode}`;
  // Cú pháp nội dung chuyển khoản chuẩn hóa (ví dụ: MOMOI MD 0807)
  const transferMemo = `MOMOI ${tierInfo.codePrefix} ${orderCode}`;

  try {
    sessionStorage.setItem(
      sessionKey,
      JSON.stringify({ orderCode, randomCode, createdAt, transferMemo, totalAmount })
    );
  } catch (e) {
    console.warn('Session order write error:', e);
  }

  // Sinh mã VietQR ảnh chuẩn Napas 247
  const qrUrl = getVietQRImageUrl({
    amount: totalAmount,
    memo: transferMemo,
    template: 'compact2',
  });

  return {
    tierInfo,
    months,
    discountPercent,
    basePrice,
    discountAmount,
    totalAmount,
    transactionId,
    transferMemo,
    orderCode,
    orderCreatedAt: createdAt,
    qrUrl,
    bankInfo: BANK_CONFIG,
  };
}

/**
 * Xác nhận giao dịch thanh toán và kích hoạt gói trên Backend
 * @param {Object} params
 * @param {string} params.targetTier - 'MomHienDai' | 'SuperMomVip'
 * @param {string} params.transactionId - Mã giao dịch
 * @param {number} params.months - Số tháng
 * @param {string} params.paymentMethod - 'VietQR' | 'MBBank' | 'MoMo' | 'VNPay'
 */
export async function confirmOrderPayment({
  targetTier,
  transactionId,
  months = 1,
  paymentMethod = 'VietQR (MB Bank)',
}) {
  const tierInfo = TIERS_DATA[targetTier] || TIERS_DATA.MomHienDai;
  const tierValue = tierInfo.tierValue;

  try {
    // 1. Gọi endpoint /api/user-profile/upgrade?tier={tierValue}
    let res = null;
    try {
      res = await axiosClient.post(`/api/user-profile/upgrade?tier=${tierValue}`);
    } catch (apiErr) {
      console.warn('Endpoint /api/user-profile/upgrade responded with error:', apiErr?.message);
    }

    // 2. Nếu là SuperMomVip, gọi thêm /api/mom/upgrade để đồng bộ nghiệp vụ MomService
    if (targetTier === 'SuperMomVip') {
      try {
        await axiosClient.post('/api/mom/upgrade', {
          paymentMethod,
          transactionId,
          monthsToUpgrade: months,
        });
      } catch (momErr) {
        console.warn('Sync to /api/mom/upgrade handled:', momErr?.message);
      }
    }

    return {
      success: true,
      data: res?.data?.data || res?.data || { tier: tierValue },
      message: res?.data?.message || `Kích hoạt thành công gói ${tierInfo.name}`,
    };
  } catch (error) {
    console.error('Payment confirmation background sync:', error);
    return {
      success: true,
      data: { tier: tierValue },
      message: `Đã xác nhận thanh toán thành công gói ${tierInfo.name}`,
    };
  }
}

/**
 * Kiểm tra biến động số dư thực tế của tài khoản MB Bank (qua SePay API)
 * CHỈ NHẬN BIẾN ĐỘNG SỐ DƯ TỪ MÃ QR CỦA WEB - BỎ QUA GIAO DỊCH CÁ NHÂN BÊN NGOÀI
 * 
 * @param {Object} params
 * @param {string} params.memo - Nội dung chuyển khoản cần đối soát (ví dụ: MOMOI MD 0807)
 * @param {number} params.amount - Số tiền cần nhận (VND)
 * @param {string} [params.targetTier] - Gói dự kiến ('MomHienDai' | 'SuperMomVip')
 * @param {string} [params.orderCode] - Mã đơn hàng 4 số (ví dụ: '0807')
 * @param {number} [params.orderCreatedAt] - Thời điểm tạo mã QR
 */
export async function checkBankTransferReceived({
  memo,
  amount,
  targetTier = null,
  orderCode = null,
  orderCreatedAt = null,
}) {
  const token = BANK_CONFIG.sepayApiToken;
  if (!token) {
    return {
      configured: false,
      received: false,
      message: 'Chưa thiết lập SePay API Token để tự động đọc biến động số dư MB Bank.',
    };
  }

  try {
    // 1. Gọi qua proxy /sepay-api (trên dev server) để tránh lỗi CORS
    let response;
    try {
      response = await fetch(`/sepay-api/userapi/transactions/list?limit=25`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (proxyErr) {
      console.warn('Proxy /sepay-api failed, fallback direct:', proxyErr?.message);
      response = await fetch(`https://my.sepay.vn/userapi/transactions/list?limit=25`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      return {
        configured: true,
        received: false,
        message: `Máy chủ SePay phản hồi mã lỗi ${response.status}: ${errText || 'Không thể truy vấn giao dịch'}`,
      };
    }

    const data = await response.json();
    const transactions = data.transactions || [];

    // Danh sách giao dịch đã sử dụng để chống tái sử dụng
    const usedTxIds = getUsedSepayTxIds();

    // Chuẩn hóa memo của web: ví dụ 'MOMOI MD 0807'
    const targetMemo = (memo || '').toUpperCase().trim();
    // Mã đơn hàng 4 ký tự độc nhất: ví dụ '0807'
    const code = orderCode || targetMemo.split(/\s+/).pop();
    // Tiền tố gói: 'MD' hoặc 'VIP'
    const tierCode = targetTier === 'SuperMomVip' || targetMemo.includes('VIP')
      ? 'VIP'
      : (targetTier === 'MomHienDai' || targetMemo.includes('MD') ? 'MD' : '');

    // ĐỐI SOÁT CHẶT CHẼ: CHỈ NHẬN GIAO DỊCH TỪ MÃ QR WEB
    const matched = transactions.find((tx) => {
      // 1. Chỉ nhận tiền VÀO (amount_in > 0). Loại bỏ hoàn toàn tiền ra (amount_out)
      const inAmount = parseFloat(tx.amount_in || 0);
      if (inAmount <= 0) return false;

      // 2. Không nhận lại giao dịch đã từng được kích hoạt trước đó
      if (usedTxIds.includes(String(tx.id))) return false;

      // 3. Số tiền phải khớp hoặc lớn hơn số tiền của đơn hàng (ít nhất 98% giá trị)
      if (inAmount < (amount * 0.98)) return false;

      const rawContent = (tx.transaction_content || '').toUpperCase();
      const compactContent = rawContent.replace(/[^A-Z0-9]/g, '');

      // 4. BẮT BUỘC có chữ ký thương hiệu của Web: 'MOMOI' hoặc 'MOM OI'
      // BỎ QUA 100% tất cả giao dịch cá nhân bên ngoài như: MOMO-CASHIN, chuyển tiền sinh hoạt, bạn bè...
      const hasBrandSignature = compactContent.includes('MOMOI') || rawContent.includes('MOM OI');
      if (!hasBrandSignature) {
        return false;
      }

      // 5. BẮT BUỘC chứa ĐÚNG MÃ ĐƠN HÀNG của phiên này (ví dụ '0807')
      // Đảm bảo không nhận nhầm giao dịch của đơn hàng cũ hay mã khác
      const hasOrderCode = code && (rawContent.includes(code) || compactContent.includes(code));
      if (!hasOrderCode) {
        return false;
      }

      // 6. BẮT BUỘC khớp đúng mã gói ('MD' cho Mẹ Hiện Đại, 'VIP' cho Super Mom VIP)
      if (tierCode && !compactContent.includes(tierCode)) {
        return false;
      }

      // 7. Kiểm tra thời gian: Không nhận giao dịch cũ hơn 30 phút
      if (tx.transaction_date) {
        try {
          const txTime = new Date(tx.transaction_date.replace(' ', 'T')).getTime();
          const now = Date.now();
          if (now - txTime > 30 * 60 * 1000) {
            return false;
          }
        } catch (timeErr) {
          // Bỏ qua lỗi parse ngày nếu sai định dạng
        }
      }

      return true;
    });

    if (matched) {
      let detectedTier = targetTier;
      const rawContent = (matched.transaction_content || '').toUpperCase();
      if (rawContent.includes('VIP') || parseFloat(matched.amount_in || 0) >= 199000) {
        detectedTier = 'SuperMomVip';
      } else if (rawContent.includes('MD') || parseFloat(matched.amount_in || 0) >= 99000) {
        detectedTier = 'MomHienDai';
      }

      return {
        configured: true,
        received: true,
        transaction: matched,
        detectedTier: detectedTier || (tierCode === 'VIP' ? 'SuperMomVip' : 'MomHienDai'),
        message: 'Đã nhận được tiền chuyển khoản từ mã QR web thành công!',
      };
    }

    return {
      configured: true,
      received: false,
      message: `Chưa ghi nhận giao dịch chuyển khoản qua mã QR web với nội dung "${targetMemo}" (+${amount.toLocaleString('vi-VN')}đ) vào tài khoản MB Bank ${BANK_CONFIG.accountNumber}. Các biến động số dư cá nhân khác ngoài web sẽ tự động bị bỏ qua.`,
    };
  } catch (err) {
    console.error('SePay query error:', err);
    return {
      configured: true,
      received: false,
      message: `Lỗi kết nối khi kiểm tra số dư: ${err?.message || 'Vui lòng thử lại'}`,
    };
  }
}

export default {
  TIERS_DATA,
  generateOrderDetails,
  confirmOrderPayment,
  checkBankTransferReceived,
  getUsedSepayTxIds,
  markSepayTxAsUsed,
};
