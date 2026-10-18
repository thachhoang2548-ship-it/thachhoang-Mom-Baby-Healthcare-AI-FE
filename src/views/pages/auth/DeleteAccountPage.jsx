import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../../../models/api/axiosClient';
import { MARKET } from '../../../config/market.vn';

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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Xóa tài khoản {MARKET.appName}</h1>

        {done ? (
          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
              <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
              <p className="text-sm text-green-900">
                Tài khoản và dữ liệu của bạn đã được xóa vĩnh viễn. Nếu ứng dụng vẫn đang mở trên điện thoại, phiên đăng
                nhập sẽ không còn dùng được.
              </p>
            </div>
            <Link to="/" className="text-sm font-semibold text-gray-600 underline">
              Về trang chủ
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 text-sm mb-6">
              Bạn cũng có thể xóa trong ứng dụng: <strong>Hồ sơ của mẹ → Xóa tài khoản</strong>.
            </p>

            <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4 mb-5">
              <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
              <p className="text-sm text-red-900">
                Việc xóa là <strong>vĩnh viễn</strong>. Bạn sẽ không thể đăng nhập lại hay khôi phục dữ liệu. Gói dịch vụ
                còn hạn (nếu có) cũng sẽ mất.
              </p>
            </div>

            <h2 className="text-sm font-bold text-gray-800 mb-2">Dữ liệu sẽ bị xóa</h2>
            <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1 mb-3">
              {DELETED_DATA.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="text-xs text-gray-500 mb-6">
              Lịch sử giao dịch thanh toán (nếu có) được giữ lại ở dạng không gắn với tài khoản để phục vụ nghĩa vụ kế
              toán. Xem thêm tại{' '}
              <Link to="/consent" className="underline">
                Chính sách quyền riêng tư
              </Link>
              .
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="delete-email" className="text-sm font-semibold text-gray-700 block mb-1">
                  Email tài khoản
                </label>
                <input
                  id="delete-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>
              <div>
                <label htmlFor="delete-password" className="text-sm font-semibold text-gray-700 block mb-1">
                  Mật khẩu
                </label>
                <input
                  id="delete-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="h-5 w-5 rounded border-gray-400 mt-0.5"
                />
                <span className="text-sm text-gray-700">
                  Tôi hiểu tài khoản và toàn bộ dữ liệu sẽ bị xóa vĩnh viễn, không thể khôi phục.
                </span>
              </label>

              {error ? (
                <p role="alert" className="text-sm font-semibold text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-red-700 px-3 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-60 transition"
              >
                {submitting ? 'Đang xóa...' : 'Xóa vĩnh viễn tài khoản'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
