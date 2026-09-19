import React, { useEffect, useState } from 'react';
import { MessageSquareHeart, RefreshCw } from 'lucide-react';
import adminService from '../../../models/services/adminService';

const formatDate = (value) => value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có';

function parseFeedback(message = '') {
  const text = message.replace('[FEEDBACK]', '').trim();
  const parts = Object.fromEntries(
    text.split(';').map((part) => {
      const [key, ...rest] = part.trim().split('=');
      return [key, rest.join('=').trim()];
    }).filter(([key]) => key)
  );
  return {
    category: parts.Category || 'General',
    page: parts.Page || 'Unknown',
    body: parts.Message || text,
  };
}

export default function AdminFeedbackPanel() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const res = await adminService.getFeedbackTickets();
      setTickets(res.data || res || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquareHeart className="w-5 h-5 text-pink-600" /> Phản hồi người dùng
          </h3>
          <p className="text-[11px] font-semibold text-gray-400 mt-1">Các lỗi/góp ý được gửi trực tiếp từ app.</p>
        </div>
        <button onClick={loadTickets} className="px-3 py-2.5 rounded-2xl bg-pink-50 text-pink-700 text-xs font-black inline-flex items-center gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Tải lại
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {tickets.length === 0 ? (
          <div className="lg:col-span-2 rounded-2xl bg-gray-50 p-8 text-center text-xs font-bold text-gray-400">
            {loading ? 'Đang tải phản hồi...' : 'Chưa có phản hồi mới.'}
          </div>
        ) : tickets.slice(0, 8).map((ticket) => {
          const parsed = parseFeedback(ticket.message);
          return (
            <article key={ticket.id} className="rounded-2xl border border-pink-100 bg-pink-50/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-pink-600">{parsed.category}</p>
                  <h4 className="text-sm font-black text-gray-900 mt-1">{ticket.userName || ticket.userEmail || 'Người dùng'}</h4>
                  <p className="text-[11px] font-bold text-gray-400">{ticket.userEmail}</p>
                </div>
                <span className="text-[10px] font-black text-gray-500 bg-white border border-gray-100 rounded-full px-2 py-1">{ticket.status}</span>
              </div>
              <p className="text-xs font-semibold text-gray-700 leading-relaxed mt-3">{parsed.body}</p>
              <div className="mt-3 flex items-center justify-between gap-3 text-[10px] font-bold text-gray-400">
                <span>{parsed.page}</span>
                <span>{formatDate(ticket.createdAt)}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
