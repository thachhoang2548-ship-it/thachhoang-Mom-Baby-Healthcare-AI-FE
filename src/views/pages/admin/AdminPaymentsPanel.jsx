import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../../models/services/adminService';

const formatMoney = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')} đ`;
const formatDate = (value) => (value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có');

const STATUS_META = {
  Completed: { badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Hoàn tất' },
  Pending: { badge: 'bg-status-warn-bg text-status-warn-text border-status-warn-line/50', label: 'Đang chờ' },
  Failed: { badge: 'bg-red-50 text-red-800 border-red-200', label: 'Thất bại' },
  Refunded: { badge: 'bg-theme-page text-theme-ink border-theme-line', label: 'Hoàn tiền' },
};

export default function AdminPaymentsPanel() {
  const [filters, setFilters] = useState({ status: '', email: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const transactions = useMemo(() => data?.transactions || [], [data]);
  const statuses = data?.statuses || [];

  const loadTransactions = useCallback(async (customFilters) => {
    setLoading(true);
    try {
      const targetFilters = customFilters || { status: '', email: '' };
      const cleanFilters = Object.fromEntries(
        Object.entries(targetFilters).filter(([, value]) => value)
      );
      const res = await adminService.getPaymentTransactions(cleanFilters);
      setData(res.data || res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions({ status: '', email: '' });
  }, [loadTransactions]);

  const exportCsv = () => {
    if (transactions.length === 0) {
      toast.error('Chưa có giao dịch để xuất.');
      return;
    }
    const header = ['OrderCode', 'Email', 'Plan', 'Amount', 'Status', 'Method', 'PaidAt'];
    const rows = transactions.map((item) => [
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
    link.download = 'momoi-admin-transactions.csv';
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
            Theo dõi doanh thu, lọc trạng thái giao dịch và xuất chứng từ CSV.
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
              value={filters.email}
              onChange={(event) => setFilters({ ...filters, email: event.target.value })}
              placeholder="Tìm theo email..."
              className="min-h-[44px] pl-10 pr-3.5 py-2 rounded-2xl border border-theme-line bg-theme-page/60 text-xs sm:text-sm font-semibold text-theme-ink placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-brand"
            />
          </div>

          <label htmlFor="admin-payment-status" className="sr-only">
            Lọc trạng thái
          </label>
          <select
            id="admin-payment-status"
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            className="min-h-[44px] px-3.5 py-2 rounded-2xl border border-theme-line bg-theme-page/60 text-xs sm:text-sm font-semibold text-theme-ink focus:outline-none focus:ring-2 focus:ring-theme-brand"
          >
            <option value="">Tất cả trạng thái</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => loadTransactions(filters)}
            className="min-h-[44px] px-4 py-2 rounded-2xl bg-theme-brand-soft border border-theme-brand/25 text-theme-ink hover:bg-theme-brand hover:text-theme-surface text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
            <span>Lọc</span>
          </button>

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
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
          <p className="text-xs font-bold text-emerald-800">Doanh thu đã hoàn tất</p>
          <p className="text-lg font-extrabold text-emerald-950 mt-1">
            {formatMoney(data?.completedRevenue)}
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
                  {loading ? 'Đang tải giao dịch...' : 'Chưa có giao dịch phù hợp.'}
                </td>
              </tr>
            ) : (
              transactions.map((txn) => {
                const meta = STATUS_META[txn.status] || STATUS_META.Pending;
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
