import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CreditCard, Download, ReceiptText, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import paymentService from '../../models/services/paymentService';
import { useAuthController } from '../../controllers/authController';
import { getTierNameVi } from '../../utils/tierHelpers';

const formatMoney = (amount) => `${Number(amount || 0).toLocaleString('vi-VN')} đ`;

const formatDate = (value) => {
  if (!value) return 'Chưa có';
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const statusClass = {
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Pending: 'bg-amber-50 text-amber-700 border-amber-100',
  Failed: 'bg-red-50 text-red-700 border-red-100',
  Refunded: 'bg-slate-50 text-slate-700 border-slate-100',
};

export default function SubscriptionHistoryPage() {
  const { tier, tierExpiresAt } = useAuthController();
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

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
    return Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000);
  }, [history?.tierExpiresAt, tierExpiresAt]);

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
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'momoi-subscription-history.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Link to="/upgrade" className="text-xs font-bold text-gray-500 hover:text-momPink inline-flex items-center gap-1">
            <Clock className="w-4 h-4" /> Quay lại gói dịch vụ
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3">Lịch sử gói & hóa đơn</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Theo dõi giao dịch, hạn gói và đối soát thanh toán của tài khoản.</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={transactions.length === 0}
          className="px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-black inline-flex items-center gap-2 disabled:opacity-40"
        >
          <Download className="w-4 h-4" /> Xuất CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-pink-100 p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Gói hiện tại</p>
          <h2 className="text-xl font-black text-momPink mt-2">{getTierNameVi(tier)}</h2>
          <p className="text-xs font-bold text-gray-500 mt-2">Hết hạn: {formatDate(history?.tierExpiresAt || tierExpiresAt)}</p>
        </div>
        <div className="bg-white rounded-3xl border border-emerald-100 p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Đã thanh toán</p>
          <h2 className="text-xl font-black text-emerald-600 mt-2">{formatMoney(totalPaid)}</h2>
          <p className="text-xs font-bold text-gray-500 mt-2">{completedCount} giao dịch hoàn tất</p>
        </div>
        <div className="bg-white rounded-3xl border border-amber-100 p-5 shadow-sm">
          <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Nhắc gia hạn</p>
          <h2 className="text-xl font-black text-amber-600 mt-2">{daysLeft == null ? 'Chưa có hạn' : `${Math.max(daysLeft, 0)} ngày`}</h2>
          <p className="text-xs font-bold text-gray-500 mt-2">Mom Ơi sẽ nhắc khi gói gần hết hạn.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-momPink" />
          <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Giao dịch gần đây</h2>
        </div>
        {loading ? (
          <div className="p-10 text-center text-sm font-bold text-gray-400">Đang tải lịch sử...</div>
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center">
            <Sparkles className="w-10 h-10 text-pink-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-500">Chưa có giao dịch nào.</p>
            <Link to="/upgrade" className="text-xs font-black text-momPink hover:underline mt-2 inline-block">Xem gói dịch vụ</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase tracking-wider font-black">
                <tr>
                  <th className="px-5 py-4">Mã đơn</th>
                  <th className="px-5 py-4">Gói</th>
                  <th className="px-5 py-4">Số tiền</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4">Ngày thanh toán</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((txn) => (
                  <tr key={txn.id || txn.orderCode}>
                    <td className="px-5 py-4 font-black text-gray-900">{txn.orderCode}</td>
                    <td className="px-5 py-4 font-bold text-gray-600">{txn.planCode} · {txn.durationMonths} tháng</td>
                    <td className="px-5 py-4 font-black text-emerald-600">{formatMoney(txn.amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full border font-black ${statusClass[txn.status] || statusClass.Pending}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-500">{formatDate(txn.paidAt || txn.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
