import React, { useMemo, useState } from 'react';
import { Download, Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { demoTransactions } from './demoPayments';

const formatMoney = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')} đ`;
const formatDate = (value) => (value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có');

const STATUS_META = {
  Completed: { badge: 'bg-status-ok-bg text-status-ok-text border-status-ok-line', label: 'Hoàn tất' },
};

export default function AdminPaymentsPanel() {
  const [emailFilter, setEmailFilter] = useState('');
  const transactions = useMemo(() => demoTransactions.filter((item) =>
    item.userEmail.toLowerCase().includes(emailFilter.trim().toLowerCase())
  ), [emailFilter]);
  const completedRevenue = transactions.reduce((sum, item) => sum + item.amount, 0);

  const exportCsv = () => {
    if (transactions.length === 0) {
      toast.error('Chưa có giao dịch để xuất.');
      return;
    }
    const header = ['DataType', 'OrderCode', 'Email', 'Plan', 'Amount', 'Status', 'Method', 'PaidAt'];
    const rows = transactions.map((item) => [
      'Demo',
      item.orderCode,
      item.userEmail,
      item.planCode,
      item.amount,
      item.status,
      item.paymentMethod,
      item.paidAt || item.updatedAt || '',
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'momoi-demo-transactions.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-theme-ink flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-theme-brand" aria-hidden="true" />
            <span>Bảng đối soát giao dịch thanh toán</span>
          </h3>
          <p className="text-xs text-theme-muted font-medium mt-0.5">
            Theo dõi các giao dịch hoàn tất và xuất danh sách CSV.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-theme-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <label htmlFor="admin-payment-email" className="sr-only">
              Tìm theo email khách hàng
            </label>
            <input
              id="admin-payment-email"
              value={emailFilter}
              onChange={(event) => setEmailFilter(event.target.value)}
              placeholder="Tìm theo email..."
              className="min-h-[44px] pl-10 pr-3.5 py-2 rounded-2xl border border-theme-line bg-theme-page/60 text-xs sm:text-sm font-semibold text-theme-ink placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-brand"
            />
          </div>

          <button
            type="button"
            onClick={exportCsv}
            className="min-h-[44px] px-4 py-2 rounded-2xl bg-theme-ink text-theme-surface hover:bg-theme-brand text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Xuất CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-2xl bg-status-ok-bg border border-status-ok-line p-4">
          <p className="text-xs font-bold text-status-ok-text">Doanh thu đã hoàn tất</p>
          <p className="text-lg font-extrabold text-status-ok-text mt-1">
            {formatMoney(completedRevenue)}
          </p>
        </div>
        <div className="rounded-2xl bg-theme-page border border-theme-line p-4">
          <p className="text-xs font-bold text-theme-muted">Số giao dịch đang hiển thị</p>
          <p className="text-lg font-extrabold text-theme-ink mt-1">{transactions.length}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-theme-page text-theme-muted font-bold border-b border-theme-line">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Gói</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-line">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-theme-muted font-semibold">
                  Chưa có giao dịch phù hợp.
                </td>
              </tr>
            ) : (
              transactions.map((txn) => {
                const meta = STATUS_META.Completed;
                return (
                  <tr key={txn.id || txn.orderCode} className="hover:bg-theme-page/50">
                    <td className="px-4 py-3.5 font-bold text-theme-ink whitespace-nowrap">
                      {txn.orderCode}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-theme-ink">{txn.userName || 'Người dùng'}</p>
                      <p className="text-xs text-theme-muted">{txn.userEmail}</p>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-theme-ink">
                      {txn.planCode} ({txn.durationMonths} tháng)
                    </td>
                    <td className="px-4 py-3.5 font-extrabold text-theme-ink whitespace-nowrap">
                      {formatMoney(txn.amount)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 rounded-full border text-xs font-bold ${meta.badge}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-theme-muted whitespace-nowrap">
                      {formatDate(txn.paidAt || txn.updatedAt)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
