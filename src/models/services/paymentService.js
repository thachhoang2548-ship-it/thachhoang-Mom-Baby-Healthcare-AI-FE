import axiosClient from '../api/axiosClient';

export const TIERS_DATA = {
  MomHienDai: {
    id: 'MomHienDai',
    name: 'Mẹ Hiện Đại',
    shortName: 'Mẹ Hiện Đại',
    codePrefix: 'HD',
    monthlyPrice: '99.000đ',
    sixMonthPrice: '499.000đ',
    features: [
      'Mở khóa phác đồ IVF Timeline thông minh',
      'Gợi ý thực đơn dinh dưỡng 7 ngày',
      'Kế hoạch bài tập an toàn theo tam cá nguyệt',
      'Đánh giá nguy cơ trầm cảm sau sinh EPDS',
    ],
  },
  SuperMomVip: {
    id: 'SuperMomVip',
    name: 'Super Mom VIP',
    shortName: 'Super Mom VIP',
    codePrefix: 'VIP',
    monthlyPrice: '199.000đ',
    sixMonthPrice: '999.000đ',
    features: [
      'Toàn bộ đặc quyền của gói Mẹ Hiện Đại',
      'Phân tích nhật ký cảm xúc và giọng nói AI',
      'Ưu tiên kết nối chuyên gia',
      'Care Staff đồng hành và phản hồi 24/7',
    ],
  },
};

const PLAN_CODES = {
  MomHienDai: {
    1: 'HD_1M',
    6: 'HD_6M',
  },
  SuperMomVip: {
    1: 'VIP_1M',
    6: 'VIP_6M',
  },
};

export function getPlanCode(targetTier, months) {
  return PLAN_CODES[targetTier]?.[months] || PLAN_CODES.SuperMomVip[1];
}

export async function createBankTransferPayment({ targetTier, months }) {
  const response = await axiosClient.post('/api/payment/create', {
    planCode: getPlanCode(targetTier, months),
    provider: 'BankTransfer',
  });

  return response.data?.data || response.data;
}

export async function getPaymentStatus(orderCode) {
  const response = await axiosClient.get(`/api/payment/status/${encodeURIComponent(orderCode)}`, {
    logoutOnAuthFailure: false,
  });
  return response.data?.data || response.data;
}

export default {
  TIERS_DATA,
  getPlanCode,
  createBankTransferPayment,
  getPaymentStatus,
};
