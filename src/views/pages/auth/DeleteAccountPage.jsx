import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../../../models/api/axiosClient';
import { MARKET } from '../../../config/market.vn';
import momOiLogo from '../../../assets/Logo/mom-oi-submark-cropped.png';

const DELETED_DATA = [
  'Thông tin tài khoản (họ tên, email, số điện thoại)',
  'Hồ sơ sức khỏe của mẹ và hồ sơ của bé',
  'Nhật ký hằng ngày, cân nặng, chu kỳ, bữa ăn, lịch uống thuốc',
  'Lịch sử phân tích triệu chứng (kèm ảnh) và kết quả EPDS',
  'Món ăn đã lưu và thông báo',
];

/**
 * Trang xóa tài khoản công khai: Google Play yêu cầu một đường link để người dùng xóa
 * tài khoản mà không cần cài ứng dụng. Dùng axios riêng (không qua axiosClient) để không
 * đụng phiên đăng nhập hiện tại trên trình duyệt và không bị interceptor refresh/redirect.
 */
export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const apiMessage = (err, fallback) => err?.response?.data?.message || fallback;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu của tài khoản.');
      return;
    }
    if (!confirmed) {
      setError('Vui lòng đánh dấu xác nhận bạn hiểu việc xóa là vĩnh viễn.');
      return;
    }

    setSubmitting(true);
    try {
      let token;
      try {
        const login = await axios.post(`${API_BASE_URL}/api/auth/login`, { email: email.trim(), password });
        token = login.data?.data?.token;
      } catch (err) {
        setError(apiMessage(err, 'Email hoặc mật khẩu không đúng.'));
        return;
      }
      if (!token) {
        setError('Không xác thực được tài khoản. Vui lòng thử lại.');
        return;
      }

      await axios.delete(`${API_BASE_URL}/api/auth/account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password },
      });
      setDone(true);
      setPassword('');
    } catch (err) {
      setError(apiMessage(err, 'Chưa xóa được tài khoản. Vui lòng thử lại sau.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-page px-4 py-8 font-display text-theme-ink sm:px-6 lg:py-12">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-semibold text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Về trang chủ</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <img
              src={momOiLogo}
              alt="Mom Ơi!"
              className="h-9 w-9 rounded-full border border-theme-line object-cover"
            />
            <span className="font-brand text-xl font-extrabold leading-none text-theme-brand">
              Mom Ơi!
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-theme-ink sm:text-3xl">
            Xóa tài khoản {MARKET.appName}
          </h1>

          {done ? (
            <div className="mt-6 space-y-5">
              <div className="flex items-start gap-3 rounded-2xl border border-status-ok/40 bg-status-ok/10 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-status-ok" />
                <p className="text-sm font-medium leading-relaxed text-theme-ink">
                  Tài khoản và dữ liệu của bạn đã được xóa vĩnh viễn. Nếu ứng dụng vẫn đang mở trên điện thoại, phiên đăng nhập sẽ không còn dùng được.
                </p>
              </div>
              <Link
                to="/"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-theme-line bg-theme-page px-5 py-2.5 text-sm font-bold text-theme-ink hover:bg-theme-brand-soft"
              >
                Về trang chủ
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-2 text-sm leading-relaxed text-theme-muted">
                Bạn cũng có thể thực hiện ngay trong ứng dụng tại mục <strong>Hồ sơ của mẹ → Xóa tài khoản</strong>.
              </p>

              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-status-danger-line bg-status-danger-bg p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-status-danger-text" />
                <p className="text-sm leading-relaxed text-status-danger-text">
                  Việc xóa là <strong>vĩnh viễn</strong>. Bạn sẽ không thể đăng nhập lại hay khôi phục dữ liệu. Gói dịch vụ còn hạn (nếu có) cũng sẽ mất.
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-theme-line bg-theme-page/60 p-4">
                <h2 className="text-sm font-bold text-theme-ink">Dữ liệu sẽ bị xóa</h2>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-theme-ink/90">
                  {DELETED_DATA.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-relaxed text-theme-muted">
                  Lịch sử giao dịch thanh toán (nếu có) được giữ lại ở dạng không gắn với tài khoản để phục vụ nghĩa vụ kế toán. Xem thêm tại{' '}
                  <Link to="/consent" className="font-semibold text-theme-brand underline">
                    Chính sách quyền riêng tư
                  </Link>
                  .
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="delete-email" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                    Email tài khoản
                  </label>
                  <input
                    id="delete-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-medium text-theme-ink focus:border-status-danger-text focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-status-danger-text/20"
                  />
                </div>
                <div>
                  <label htmlFor="delete-password" className="mb-1.5 block text-sm font-semibold text-theme-ink">
                    Mật khẩu
                  </label>
                  <input
                    id="delete-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 px-4 text-sm font-medium text-theme-ink focus:border-status-danger-text focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-status-danger-text/20"
                  />
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-theme-line bg-theme-page/50 p-3.5">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 h-5 w-5 rounded border-theme-line accent-status-danger-text"
                  />
                  <span className="text-sm leading-relaxed text-theme-ink">
                    Tôi hiểu tài khoản và toàn bộ dữ liệu sẽ bị xóa vĩnh viễn, không thể khôi phục.
                  </span>
                </label>

                {error ? (
                  <p role="alert" className="rounded-2xl border border-status-danger-line bg-status-danger-bg px-4 py-2.5 text-sm font-semibold text-status-danger-text">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-red-700 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-status-danger-text focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-theme-line disabled:text-theme-muted"
                >
                  {submitting ? 'Đang xóa tài khoản...' : 'Xóa vĩnh viễn tài khoản'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
