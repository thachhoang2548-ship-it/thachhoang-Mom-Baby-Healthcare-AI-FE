import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthController } from '../../../controllers/authController';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import momOiLogo from '../../../assets/Logo/mom-oi-submark-cropped.png';
import heroMomBabyPhoto from '../../../assets/editorial/hero-mom-baby-sunlight.jpg';
import { ADVISOR_DOCTOR } from '../../../config/advisor';

const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải dài tối thiểu 6 ký tự'),
});

export default function LoginPage() {
  const login = useAuthController((state) => state.login);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setLoginError('');
    try {
      const res = await login(data.email, data.password);
      if (res.isSuccess) {
        toast.success('Chào mừng mẹ đã quay trở lại!');

        const userRoles = Array.isArray(res.data?.roles)
          ? res.data.roles
          : res.data?.role
            ? [res.data.role]
            : [];
        const email = data.email.toLowerCase();
        const isAdmin = userRoles.some((r) => r.includes('Admin')) || email.includes('admin');
        const isExpert = userRoles.some((r) => r.includes('Expert')) || email.includes('expert');
        const isStaff = userRoles.some((r) => r.includes('Staff')) || email.includes('staff');

        if (isAdmin) {
          navigate('/admin');
          return;
        }
        if (isExpert) {
          navigate('/expert');
          return;
        }
        if (isStaff) {
          navigate('/staff');
          return;
        }

        navigate('/dashboard');
      } else {
        setLoginError(res.message || 'Sai tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại.');
      }
    } catch (err) {
      console.error(err);
      const serverMsg = err.response?.data?.message || err.response?.data;
      setLoginError(
        typeof serverMsg === 'string'
          ? serverMsg
          : 'Sai tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-theme-page px-4 py-8 font-display text-theme-ink sm:px-6 lg:py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-3 text-sm font-semibold text-theme-muted transition-colors hover:bg-theme-surface hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Về trang giới thiệu</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-stretch">
          {/* Editorial Side Panel */}
          <aside className="hidden flex-col justify-between rounded-3xl border border-theme-line bg-theme-sidebar p-8 lg:col-span-5 lg:flex lg:p-10">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src={momOiLogo}
                  alt="Mom Ơi!"
                  className="h-12 w-12 rounded-full border border-theme-line bg-theme-surface object-cover"
                />
                <div>
                  <span className="block font-brand text-2xl font-extrabold leading-none text-theme-brand">
                    Mom Ơi!
                  </span>
                  <span className="mt-0.5 block text-xs font-medium text-theme-muted">
                    Đồng hành cùng mẹ và bé
                  </span>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-theme-line bg-theme-surface p-1.5">
                <img
                  src={heroMomBabyPhoto}
                  alt="Người mẹ mỉm cười ôm em bé dưới ánh nắng ấm"
                  className="h-44 w-full rounded-2xl object-cover"
                />
              </div>

              <h1 className="mt-6 text-xl font-bold leading-snug text-theme-ink">
                Mỗi ngày của mẹ và bé đều xứng đáng được lắng nghe và ghi nhớ
              </h1>
              <p className="mt-2.5 text-sm leading-relaxed text-theme-muted">
                Đăng nhập để tiếp tục theo dõi lịch chăm sóc, thực đơn dinh dưỡng chuẩn WHO và nhật ký sức khỏe cá nhân hóa.
              </p>

              <ul className="mt-7 space-y-3 text-sm font-medium text-theme-ink">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-ok" />
                  <span>Gợi ý thực đơn &amp; bài tập theo đúng giai đoạn của mẹ</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-ok" />
                  <span>Theo dõi ăn dặm, dị ứng và biểu đồ tăng trưởng cho bé</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-ok" />
                  <span>Kho nhạc thư giãn có thể lưu nghe ngay cả khi mất mạng</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 rounded-2xl border border-theme-line bg-theme-surface/80 p-4 text-xs leading-relaxed text-theme-muted">
              Cố vấn chuyên môn: <strong className="text-theme-ink">{ADVISOR_DOCTOR.displayName}</strong>. Mọi dữ liệu sức khỏe được bảo mật riêng tư.
            </div>
          </aside>

          {/* Form Card */}
          <div className="rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm sm:p-10 lg:col-span-7">
            <div className="mb-7">
              <div className="mb-4 flex items-center gap-3 lg:hidden">
                <img
                  src={momOiLogo}
                  alt="Mom Ơi!"
                  className="h-11 w-11 rounded-full border border-theme-line object-cover"
                />
                <span className="font-brand text-2xl font-extrabold leading-none text-theme-brand">
                  Mom Ơi!
                </span>
              </div>
              <h2 className="text-2xl font-bold text-theme-ink sm:text-3xl">
                Chào mừng mẹ quay trở lại
              </h2>
              <p className="mt-1.5 text-sm font-medium text-theme-muted">
                Nhập email và mật khẩu để mở sổ tay chăm sóc của mẹ.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div>
                <label
                  htmlFor="login-email"
                  className="mb-1.5 block text-sm font-semibold text-theme-ink"
                >
                  Địa chỉ email
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-muted"
                    aria-hidden="true"
                  />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="me@example.com"
                    {...register('email')}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 pl-11 pr-4 text-sm font-medium text-theme-ink placeholder:text-theme-muted/70 focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-status-danger-text">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="mb-1.5 block text-sm font-semibold text-theme-ink"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-muted"
                    aria-hidden="true"
                  />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu của mẹ"
                    {...register('password')}
                    aria-invalid={errors.password ? 'true' : 'false'}
                    className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 pl-11 pr-12 text-sm font-medium text-theme-ink placeholder:text-theme-muted/70 focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="absolute right-1.5 top-1/2 inline-flex min-h-[40px] min-w-[40px] -translate-y-1/2 items-center justify-center rounded-2xl text-theme-muted transition-colors hover:bg-theme-page hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-status-danger-text">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {loginError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-2xl border border-status-danger-line bg-status-danger-bg px-4 py-3 text-xs font-semibold text-status-danger-text sm:text-sm"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-status-danger-text" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-theme-brand px-6 py-3 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-theme-line disabled:text-theme-muted"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Đang đăng nhập...</span>
                  </span>
                ) : (
                  'Đăng nhập'
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-theme-line pt-5 text-center text-sm text-theme-muted">
              <p>
                Mẹ chưa có tài khoản?{' '}
                <Link
                  to="/register"
                  className="font-bold text-theme-brand underline decoration-theme-brand/40 underline-offset-4 hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                >
                  Tạo tài khoản mới
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
