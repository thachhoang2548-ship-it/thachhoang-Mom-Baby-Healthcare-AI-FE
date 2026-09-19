import React, { useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw, Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../../models/services/adminService';

const formatMoney = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')} đ`;
const formatDate = (value) => value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có';

const statusClass = {
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Pending: 'bg-amber-50 text-amber-700 border-amber-100',
  Failed: 'bg-red-50 text-red-700 border-red-100',
  Refunded: 'bg-slate-50 text-slate-700 border-slate-100',
};

export default function AdminPaymentsPanel() {
  const [filters, setFilters] = useState({ status: '', email: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const transactions = useMemo(() => data?.transactions || [], [data]);
  const statuses = data?.statuses || [];

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const cleanFilters = Object.fromEntries(Object.entries(filters).filter(([, value]) => value));
      const res = await adminService.getPaymentTransactions(cleanFilters);
      setData(res.data || res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

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
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'momoi-admin-transactions.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-emerald-600" /> Bảng giao dịch thanh toán
          </h3>
          <p className="text-[11px] font-semibold text-gray-400 mt-1">
            Đối soát doanh thu, trạng thái giao dịch và xuất CSV cho kế toán.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={filters.email}
              onChange={(event) => setFilters({ ...filters, email: event.target.value })}
              placeholder="Tìm email"
              className="pl-9 pr-3 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            className="px-3 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <option value="">Tất cả trạng thái</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button onClick={loadTransactions} className="px-3 py-2.5 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-black inline-flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Lọc
          </button>
          <button onClick={exportCsv} className="px-3 py-2.5 rounded-2xl bg-gray-900 text-white text-xs font-black inline-flex items-center gap-2">
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Doanh thu hoàn tất</p>
          <p className="text-lg font-black text-emerald-700 mt-1">{formatMoney(data?.completedRevenue)}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Số giao dịch đang hiển thị</p>
          <p className="text-lg font-black text-slate-900 mt-1">{transactions.length}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-400 uppercase tracking-wider font-black">
            <tr>
              <th className="px-4 py-3">Mã đơn</th>
              <th className="px-4 py-3">Khách hàng</th>
              <th className="px-4 py-3">Gói</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thanh toán</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400 font-bold">
                  {loading ? 'Đang tải giao dịch...' : 'Chưa có giao dịch phù hợp.'}
                </td>
              </tr>
            ) : transactions.map((txn) => (
              <tr key={txn.id || txn.orderCode} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30">
                <td className="px-4 py-3 font-black text-gray-900 dark:text-white">{txn.orderCode}</td>
                <td className="px-4 py-3">
                  <p className="font-bold text-gray-700 dark:text-gray-200">{txn.userName || 'Người dùng'}</p>
                  <p className="text-[10px] text-gray-400">{txn.userEmail}</p>
                </td>
                <td className="px-4 py-3 font-bold text-gray-500">{txn.planCode} · {txn.durationMonths} tháng</td>
                <td className="px-4 py-3 font-black text-emerald-600">{formatMoney(txn.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 rounded-full border font-black ${statusClass[txn.status] || statusClass.Pending}`}>
                    {txn.status}
                  </span>
                </td>
                <td className="px-4 py-3 font-bold text-gray-500">{formatDate(txn.paidAt || txn.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
