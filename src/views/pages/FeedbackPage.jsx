import React, { useEffect, useState } from 'react';
import { MessageSquareHeart, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import feedbackService from '../../models/services/feedbackService';

export default function FeedbackPage() {
  const [form, setForm] = useState({ category: 'Bug', page: window.location.pathname, message: '' });
  const [options, setOptions] = useState({ categories: [] });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    feedbackService.getFeedbackOptions()
      .then((data) => setOptions(data || { categories: [] }))
      .catch((error) => console.error(error));
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (form.message.trim().length < 8) {
      toast.error('Bạn mô tả thêm một chút để team dễ xử lý nha.');
      return;
    }
    setSubmitting(true);
    try {
      await feedbackService.sendFeedback(form);
      toast.success('Đã gửi phản hồi, cảm ơn mami nhiều.');
      setForm((prev) => ({ ...prev, message: '' }));
    } catch (error) {
      console.error(error);
      toast.error('Chưa gửi được phản hồi, thử lại sau nha.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 text-momPink px-3 py-1 text-[11px] font-black uppercase tracking-wider">
          <MessageSquareHeart className="w-4 h-4" /> Phản hồi sản phẩm
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3">Báo lỗi hoặc góp ý</h1>
        <p className="text-sm text-gray-500 font-medium mt-1">Gửi vấn đề bạn gặp để admin/care team theo dõi và cải thiện app.</p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Loại phản hồi</span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-2xl border border-pink-100 px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-momPink/30 focus:outline-none"
            >
              {(options.categories || []).map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Trang liên quan</span>
            <input
              value={form.page}
              onChange={(e) => setForm({ ...form, page: e.target.value })}
              className="w-full rounded-2xl border border-pink-100 px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-momPink/30 focus:outline-none"
            />
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-xs font-black text-gray-500 uppercase tracking-wider">Mô tả</span>
          <textarea
            rows={7}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Ví dụ: Mình bấm hoàn thành chuyển khoản nhưng trạng thái chưa cập nhật..."
            className="w-full rounded-3xl border border-pink-100 px-4 py-4 text-sm font-semibold resize-none focus:ring-2 focus:ring-momPink/30 focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-gradient-to-r from-momPink to-momPurple text-white py-3 text-sm font-black shadow-md disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" /> {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
        </button>
      </form>
    </div>
  );
}
