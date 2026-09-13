/**
 * ===================================================================
 * [CONFIG] Bank Account & VietQR Configuration
 * ===================================================================
 * Cấu hình tài khoản ngân hàng thụ hưởng nhận tiền thật qua mã VietQR chuẩn Napas 247.
 * Chủ tài khoản: Bùi Anh Duy
 * Ngân hàng: MB Bank (Ngân hàng TMCP Quân Đội)
 * Số tài khoản: 0914180202
 * ===================================================================
 */

export const BANK_CONFIG = {
  // Mã ngân hàng theo chuẩn VietQR Napas (MB = Ngân Hàng Quân Đội)
  bankId: 'MB',
  bin: '970422',
  bankName: 'MB Bank (Ngân hàng Quân Đội)',
  bankShortName: 'MB Bank',
  accountNumber: '0914180202',
  accountName: 'BUI ANH DUY',
  accountHolderDisplay: 'Bùi Anh Duy',

  // API Token của SePay (lấy tại my.sepay.vn để đọc biến động số dư MB Bank thật)
  sepayApiToken: import.meta.env.VITE_SEPAY_API_KEY || 'E2M0CZOK74DGVKC0NCFWDHZUBOASPILGGX5VAAXHJIY86JOIOSQ32BJEYRQIVX3C',
  sepayMerchantId: import.meta.env.VITE_SEPAY_MERCHANT_ID || 'SP-TEST-BA92D846',
};

/**
 * Sinh đường dẫn hình ảnh mã VietQR Napas 247 theo chuẩn chính thức
 * @param {Object} params
 * @param {number} params.amount - Số tiền chuyển khoản (VND)
 * @param {string} params.memo - Nội dung chuyển khoản (tối đa 25 ký tự không dấu)
 * @param {string} params.template - Giao diện khung mã QR ('compact2' | 'compact' | 'qr_only' | 'print')
 * @returns {string} URL ảnh mã VietQR sắc nét
 */
export function getVietQRImageUrl({ amount = 0, memo = '', template = 'compact2' }) {
  const sanitizedMemo = memo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim();

  const encodedMemo = encodeURIComponent(sanitizedMemo);
  const encodedName = encodeURIComponent(BANK_CONFIG.accountName);

  return `https://img.vietqr.io/image/${BANK_CONFIG.bankId}-${BANK_CONFIG.accountNumber}-${template}.png?amount=${amount}&addInfo=${encodedMemo}&accountName=${encodedName}`;
}

export default BANK_CONFIG;
