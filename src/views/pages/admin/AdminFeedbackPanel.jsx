import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquareHeart, RefreshCw } from 'lucide-react';
import adminService from '../../../models/services/adminService';
import feedbackSamples from './feedbackSamples.json';

const formatDate = (value) => (value ? new Date(value).toLocaleString('vi-VN') : 'Chưa có');
const displayName = (ticket) =>
  ticket.userName?.trim().replace(/^Mẹ\s+/iu, '') || ticket.userEmail || 'Người dùng';
const sampleTickets = feedbackSamples.map(({ n, name, category, page, body }) => {
  const suffix = String(n).padStart(2, '0');
  const createdAt = new Date(Date.UTC(2026, 10, 27, 4 - n)).toISOString();
  return {
    id: `sample-${suffix}`,
    userId: `demo-feedback-${suffix}`,
    userName: name,
    userEmail: `feedback${suffix}@example.com`,
    message: `[FEEDBACK] Category=${category}; Page=${page}; Message=${body}`,
    status: 'Pending',
    createdAt,
  };
});

function parseFeedback(message = '') {
  const text = message.replace('[FEEDBACK]', '').trim();
  const parts = Object.fromEntries(
    text
      .split(';')
      .map((part) => {
        const [key, ...rest] = part.trim().split('=');
        return [key, rest.join('=').trim()];
      })
      .filter(([key]) => key)
  );
  return {
    category: parts.Category || 'Chung',
    page: parts.Page || 'Không rõ trang',
    body: parts.Message || text,
  };
}

export default function AdminFeedbackPanel() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getFeedbackTickets();
      const savedTickets = res.data || res || [];
      const savedUserIds = new Set(savedTickets.map((ticket) => ticket.userId));
      setTickets(
        [...savedTickets, ...sampleTickets.filter((ticket) => !savedUserIds.has(ticket.userId))]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return (
    <section className="bg-theme-surface rounded-3xl border border-theme-line p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-theme-ink flex items-center gap-2">
            <MessageSquareHeart className="w-5 h-5 text-theme-brand" aria-hidden="true" />
            <span>Phản hồi & góp ý từ người dùng</span>
          </h3>
          <p className="text-xs text-theme-muted font-medium mt-0.5">
            Các báo lỗi và góp ý về ứng dụng.
          </p>
        </div>
        <button
          type="button"
          onClick={loadTickets}
          className="min-h-[44px] px-4 py-2 rounded-2xl bg-theme-brand-soft border border-theme-brand/25 text-theme-ink hover:bg-theme-brand hover:text-theme-surface text-xs sm:text-sm font-bold inline-flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
          <span>Tải lại</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {tickets.length === 0 ? (
          <div className="lg:col-span-2 rounded-2xl bg-theme-page border border-theme-line p-8 text-center text-xs sm:text-sm font-semibold text-theme-muted">
            {loading ? 'Đang tải phản hồi...' : 'Chưa có phản hồi mới nào.'}
          </div>
        ) : (
          tickets.slice(0, 34).map((ticket) => {
            const parsed = parseFeedback(ticket.message);
            return (
              <article
                key={ticket.id}
                className="rounded-2xl border border-theme-line bg-theme-page/60 p-4 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex text-xs font-bold text-theme-ink bg-theme-brand-soft border border-theme-brand/20 rounded-full px-2.5 py-0.5">
                      {parsed.category}
                    </span>
                    <h4 className="text-sm font-bold text-theme-ink mt-1.5">
                      {displayName(ticket)}
                    </h4>
                    <p className="text-xs font-medium text-theme-muted">{ticket.userEmail}</p>
                  </div>
                  <span className="text-xs font-bold text-theme-ink bg-theme-surface border border-theme-line rounded-full px-2.5 py-1">
                    {ticket.status || 'Mới'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-theme-ink leading-relaxed">
                  {parsed.body}
                </p>
                <div className="pt-1 flex items-center justify-between gap-3 text-xs font-medium text-theme-muted">
                  <span>Trang: {parsed.page}</span>
                  <span>{formatDate(ticket.createdAt)}</span>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
