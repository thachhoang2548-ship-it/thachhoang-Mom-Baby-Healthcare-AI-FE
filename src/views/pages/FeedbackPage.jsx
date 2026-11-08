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

  const categoryList = options.categories?.length
    ? options.categories
    : [
        { value: 'Bug', label: 'Báo lỗi kỹ thuật' },
        { value: 'UX', label: 'Góp ý giao diện & trải nghiệm' },
        { value: 'Content', label: 'Góp ý nội dung chăm sóc' },
        { value: 'Other', label: 'Khác' },
      ];

  return (
    <div className="font-display max-w-3xl mx-auto space-y-6 pb-10 text-theme-ink">
      <header className="bg-theme-surface rounded-3xl border border-theme-line p-6 sm:p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 rounded-full bg-theme-brand-soft text-theme-ink px-3.5 py-1.5 text-xs font-bold border border-theme-brand/20">
          <MessageSquareHeart className="w-4 h-4 text-theme-brand" aria-hidden="true" />
          <span>Phản hồi sản phẩm</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-theme-ink mt-3 tracking-tight">
          Báo lỗi hoặc góp ý cho Mom Ơi!
        </h1>
        <p className="text-sm sm:text-base text-theme-muted font-medium mt-1.5 leading-relaxed">
          Chia sẻ vấn đề mẹ gặp phải hoặc ý tưởng cải tiến để đội ngũ chăm sóc và kỹ thuật hoàn thiện ứng dụng tốt hơn mỗi ngày.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="bg-theme-surface rounded-3xl border border-theme-line p-6 sm:p-8 shadow-sm space-y-5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="feedback-category" className="block text-xs font-bold text-theme-ink">
              Loại phản hồi
            </label>
            <select
              id="feedback-category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full min-h-[48px] rounded-2xl border border-theme-line bg-theme-page/50 px-4 py-3 text-sm font-semibold text-theme-ink focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/30"
            >
              {categoryList.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="feedback-page" className="block text-xs font-bold text-theme-ink">
              Trang liên quan
            </label>
            <input
              id="feedback-page"
              type="text"
              value={form.page}
              onChange={(e) => setForm({ ...form, page: e.target.value })}
              className="w-full min-h-[48px] rounded-2xl border border-theme-line bg-theme-page/50 px-4 py-3 text-sm font-semibold text-theme-ink placeholder:text-theme-muted focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/30"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="feedback-message" className="block text-xs font-bold text-theme-ink">
            Nội dung chi tiết
          </label>
          <textarea
            id="feedback-message"
            rows={6}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Ví dụ: Mình bấm hoàn thành chuyển khoản nhưng trạng thái chưa cập nhật..."
            className="w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 py-3.5 text-sm font-medium text-theme-ink placeholder:text-theme-muted resize-y focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/30"
          />
          <p className="text-xs text-theme-muted font-medium">
            Vui lòng nhập tối thiểu 8 ký tự để đội ngũ hỗ trợ nắm rõ tình huống của mẹ.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full min-h-[48px] rounded-2xl bg-theme-brand text-theme-surface px-6 py-3 text-sm font-bold shadow-sm hover:bg-theme-ink transition-colors disabled:bg-theme-line disabled:text-theme-muted inline-flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          <span>{submitting ? 'Đang gửi phản hồi...' : 'Gửi phản hồi'}</span>
        </button>
      </form>
    </div>
  );
}
