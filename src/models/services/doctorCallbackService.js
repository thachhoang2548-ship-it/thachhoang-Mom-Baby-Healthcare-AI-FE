import axiosClient from '../api/axiosClient';

// Phí mỗi cuộc tư vấn thành công — khớp DoctorCallbackPricing.FeePerCall ở BE.
export const CALLBACK_FEE = 5000;
export const CALLBACK_FEE_PLAN_CODE = 'CALLBACK_FEE';

const unwrap = (response) => response.data?.data ?? response.data;

const doctorCallbackService = {
  // ── Phía mẹ ──
  create: async ({ contactPhone, concern, preferredTime, symptomLogId }) =>
    unwrap(
      await axiosClient.post('/api/doctor-callbacks', {
        contactPhone,
        concern,
        preferredTime,
        symptomLogId: symptomLogId || null,
      })
    ),

  getMine: async () => unwrap(await axiosClient.get('/api/doctor-callbacks/mine')) || [],

  cancel: async (id) => unwrap(await axiosClient.post(`/api/doctor-callbacks/${id}/cancel`)),

  // Tạo hoặc lấy lại mã VietQR 5.000đ; trạng thái đọc bằng getPaymentStatus(orderCode).
  createFeePayment: async (id) => unwrap(await axiosClient.post(`/api/doctor-callbacks/${id}/pay`)),

  // ── Phía bác sĩ / chuyên gia ──
  getQueue: async () => unwrap(await axiosClient.get('/api/expert/callbacks')) || [],

  complete: async (id, note) =>
    unwrap(await axiosClient.post(`/api/expert/callbacks/${id}/complete`, { note })),

  markUnreachable: async (id, note) =>
    unwrap(await axiosClient.post(`/api/expert/callbacks/${id}/unreachable`, { note })),
};

export const CALLBACK_STATUS_META = {
  Pending: { label: 'Chờ bác sĩ gọi', badge: 'bg-status-warn-bg text-status-warn-text border-status-warn-line/50' },
  Completed: { label: 'Đã tư vấn', badge: 'bg-status-ok-bg text-status-ok-text border-status-ok-line' },
  Unreachable: { label: 'Không liên lạc được', badge: 'bg-theme-page text-theme-muted border-theme-line' },
  Cancelled: { label: 'Đã huỷ', badge: 'bg-theme-page text-theme-muted border-theme-line' },
};

export default doctorCallbackService;
