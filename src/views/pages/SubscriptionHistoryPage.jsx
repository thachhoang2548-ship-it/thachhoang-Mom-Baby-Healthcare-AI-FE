import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarClock, CreditCard, Crown, Download, ReceiptText } from 'lucide-react';
import toast from 'react-hot-toast';
import paymentService from '../../models/services/paymentService';
import { useAuthController } from '../../controllers/authController';
import { getTierNameVi } from '../../utils/tierHelpers';

const formatMoney = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')} đ`;

const formatDate = (value) => {
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const STATUS_META = {
  Completed: {
    badge: 'bg-status-ok-bg text-status-ok-text border-status-ok-line',
    label: 'Hoàn tất',
  },
  Pending: {
    badge: 'bg-status-warn-bg text-status-warn-text border-status-warn-line/50',
    label: 'Đang chờ',
  },
  Failed: {
    badge: 'bg-status-danger-bg text-status-danger-text border-status-danger-line',
    label: 'Thất bại',
  },
  Refunded: {
    badge: 'bg-theme-page text-theme-ink border-theme-line',
    label: 'Đã hoàn tiền',
  },
};

export default function SubscriptionHistoryPage() {
  const { tier, tierExpiresAt } = useAuthController();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nowTs] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    paymentService.getPaymentHistory()
      .then((data) => {
        if (active) setHistory(data);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Không thể tải lịch sử gói.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const transactions = history?.transactions || [];
  const completedCount = transactions.filter((item) => item.status === 'Completed').length;
  const totalPaid = transactions
    .filter((item) => item.status === 'Completed')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const daysLeft = useMemo(() => {
    const expiry = history?.tierExpiresAt || tierExpiresAt;
    if (!expiry) return null;
    return Math.ceil((new Date(expiry).getTime() - nowTs) / 86400000);
  }, [history?.tierExpiresAt, tierExpiresAt, nowTs]);

  const exportCsv = () => {
    const header = ['OrderCode', 'Plan', 'Amount', 'Status', 'Method', 'PaidAt'];
    const rows = transactions.map((item) => [
      item.orderCode,
      item.planCode,
      item.amount,
      item.status,
      item.paymentMethod,
      item.paidAt || '',
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'momoi-subscription-history.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="font-display max-w-6xl mx-auto space-y-6 pb-10 text-theme-ink">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/upgrade"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-bold text-theme-muted hover:text-theme-ink hover:bg-theme-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Quay lại bảng gói dịch vụ</span>
        </Link>

        <button
          type="button"
          onClick={exportCsv}
          disabled={transactions.length === 0}
          className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-theme-ink text-theme-surface text-xs sm:text-sm font-bold inline-flex items-center gap-2 hover:bg-theme-brand transition-colors disabled:bg-theme-line disabled:text-theme-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Xuất đối soát CSV</span>
        </button>
      </div>

      <header className="bg-theme-surface rounded-3xl border border-theme-line p-6 sm:p-8 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-ink tracking-tight">
          Lịch sử gói & hóa đơn
        </h1>
        <p className="text-sm sm:text-base text-theme-muted font-medium mt-1.5">
          Theo dõi chi tiết các giao dịch nâng cấp, thời hạn gói hội viên và xuất chứng từ đối soát.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <article className="bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center">
            <Crown className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold text-theme-muted">Gói hiện tại</p>
          <h2 className="text-xl font-extrabold text-theme-ink">{getTierNameVi(tier)}</h2>
          <p className="text-xs font-semibold text-theme-muted">
            Ngày hết hạn: {formatDate(history?.tierExpiresAt || tierExpiresAt)}
          </p>
        </article>

        <article className="bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-status-ok-bg text-status-ok border border-status-ok-line flex items-center justify-center">
            <CreditCard className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold text-theme-muted">Tổng đã thanh toán</p>
          <h2 className="text-xl font-extrabold text-theme-ink">{formatMoney(totalPaid)}</h2>
          <p className="text-xs font-semibold text-theme-muted">{completedCount} giao dịch hoàn tất</p>
        </article>

        <article className="bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-status-warn-bg text-status-warn-text border border-status-warn-line/40 flex items-center justify-center">
            <CalendarClock className="w-5 h-5" aria-hidden="true" />
          </div>
          <p className="text-xs font-bold text-theme-muted">Thời hạn còn lại</p>
          <h2 className="text-xl font-extrabold text-theme-ink">
            {daysLeft == null ? 'Không giới hạn' : `${Math.max(daysLeft, 0)} ngày`}
          </h2>
          <p className="text-xs font-semibold text-theme-muted">
            Mom Ơi! sẽ nhắc mẹ trước khi gói hội viên hết hạn.
          </p>
        </article>
      </div>

      <section className="bg-theme-surface rounded-3xl border border-theme-line shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-theme-line flex items-center gap-2.5">
          <ReceiptText className="w-5 h-5 text-theme-brand" aria-hidden="true" />
          <h2 className="text-base font-bold text-theme-ink">Danh sách giao dịch gần đây</h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm font-semibold text-theme-muted">
            Đang tải lịch sử giao dịch...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-theme-brand-soft text-theme-brand flex items-center justify-center mx-auto">
              <ReceiptText className="w-6 h-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-bold text-theme-ink">Chưa có giao dịch nào được ghi nhận</p>
            <Link
              to="/upgrade"
              className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-theme-brand text-theme-surface px-5 py-2.5 text-xs sm:text-sm font-bold hover:bg-theme-ink transition-colors"
            >
              Xem các gói hội viên
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-theme-page text-theme-muted font-bold border-b border-theme-line">
                <tr>
                  <th className="px-5 py-3.5">Mã đơn</th>
                  <th className="px-5 py-3.5">Gói dịch vụ</th>
                  <th className="px-5 py-3.5">Số tiền</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5">Ngày cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-line">
                {transactions.map((txn) => {
                  const meta = STATUS_META[txn.status] || STATUS_META.Pending;
                  return (
                    <tr key={txn.id || txn.orderCode} className="hover:bg-theme-page/50">
                      <td className="px-5 py-4 font-bold text-theme-ink whitespace-nowrap">{txn.orderCode}</td>
                      <td className="px-5 py-4 font-semibold text-theme-ink">
                        {txn.planCode === 'CALLBACK_FEE'
                          ? 'Phí bác sĩ gọi lại tư vấn'
                          : `${txn.planCode} (${txn.durationMonths} tháng)`}
                      </td>
                      <td className="px-5 py-4 font-extrabold text-theme-ink whitespace-nowrap">
                        {formatMoney(txn.amount)}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-bold ${meta.badge}`}>
                          {meta.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium text-theme-muted whitespace-nowrap">
                        {formatDate(txn.paidAt || txn.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
