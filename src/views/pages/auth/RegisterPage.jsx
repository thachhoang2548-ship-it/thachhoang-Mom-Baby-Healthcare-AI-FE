import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthController } from '../../../controllers/authController';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';
import momOiLogo from '../../../assets/Logo/mom-oi-submark-cropped.png';
import pregnantCouplePhoto from '../../../assets/editorial/pregnant-couple-warm.jpg';

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Họ tên phải dài tối thiểu 2 ký tự'),
    email: z.string().min(1, 'Vui lòng nhập email').email('Email không đúng định dạng'),
    password: z.string().min(6, 'Mật khẩu phải dài tối thiểu 6 ký tự'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export default function RegisterPage() {
  const registerUser = useAuthController((state) => state.register);
  const login = useAuthController((state) => state.login);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await registerUser(data.email, data.password, data.fullName);
      if (res.isSuccess) {
        toast.success('Đăng ký thành công! Hệ thống đang tự động đăng nhập...');

        const loginRes = await login(data.email, data.password);
        if (loginRes.isSuccess) {
          navigate('/profile');
        } else {
          navigate('/login');
        }
      } else {
        toast.error(res.message || 'Đăng ký không thành công');
      }
    } catch (err) {
      console.error(err);
      toast.error('Email này đã được sử dụng hoặc có lỗi xảy ra.');
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
                    Khởi đầu hành trình làm mẹ
                  </span>
                </div>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-theme-line bg-theme-surface p-1.5">
                <img
                  src={pregnantCouplePhoto}
                  alt="Gia đình trẻ mỉm cười đón chờ em bé chào đời"
                  className="h-44 w-full rounded-2xl object-cover"
                />
              </div>

              <h1 className="mt-6 text-xl font-bold leading-snug text-theme-ink">
                Mở cuốn sổ tay sức khỏe dành riêng cho mẹ và bé
              </h1>
              <p className="mt-2.5 text-sm leading-relaxed text-theme-muted">
                Sau khi tạo tài khoản, mẹ có thể chọn giai đoạn hiện tại (chuẩn bị mang thai, đang mang thai hoặc sau sinh) để hệ thống tự sắp xếp các công cụ phù hợp nhất.
              </p>

              <ul className="mt-7 space-y-3 text-sm font-medium text-theme-ink">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-ok" />
                  <span>Không quảng cáo làm phiền, giao diện ấm áp và dễ đọc</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-ok" />
                  <span>Dữ liệu dinh dưỡng tham chiếu từ chuẩn WHO &amp; USDA</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-status-ok" />
                  <span>Mẹ toàn quyền quản lý hoặc xóa dữ liệu bất cứ lúc nào</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 rounded-2xl border border-theme-line bg-theme-surface/80 p-4 text-xs leading-relaxed text-theme-muted">
              Xem chi tiết cách Mom Ơi! bảo vệ dữ liệu sức khỏe của mẹ tại{' '}
              <Link to="/consent" className="font-semibold text-theme-brand underline">
                Điều khoản &amp; Quyền riêng tư
              </Link>
              .
            </div>
          </aside>

          {/* Form Card */}
          <div className="rounded-3xl border border-theme-line bg-theme-surface p-6 shadow-sm sm:p-10 lg:col-span-7">
            <div className="mb-6">
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
                Tạo tài khoản đồng hành
              </h2>
              <p className="mt-1.5 text-sm font-medium text-theme-muted">
                Điền thông tin cơ bản để bắt đầu cá nhân hóa lộ trình chăm sóc.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="register-fullname"
                  className="mb-1.5 block text-sm font-semibold text-theme-ink"
                >
                  Họ và tên của mẹ
                </label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-muted"
                    aria-hidden="true"
                  />
                  <input
                    id="register-fullname"
                    type="text"
                    autoComplete="name"
                    placeholder="Nguyễn Thị Minh Anh"
                    {...register('fullName')}
                    aria-invalid={errors.fullName ? 'true' : 'false'}
                    className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 pl-11 pr-4 text-sm font-medium text-theme-ink placeholder:text-theme-muted/70 focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                  />
                </div>
                {errors.fullName && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{errors.fullName.message}</span>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="register-email"
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
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    placeholder="me@example.com"
                    {...register('email')}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 pl-11 pr-4 text-sm font-medium text-theme-ink placeholder:text-theme-muted/70 focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="register-password"
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
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Tối thiểu 6 ký tự"
                      {...register('password')}
                      aria-invalid={errors.password ? 'true' : 'false'}
                      className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 pl-11 pr-11 text-sm font-medium text-theme-ink placeholder:text-theme-muted/70 focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
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
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{errors.password.message}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="register-confirm-password"
                    className="mb-1.5 block text-sm font-semibold text-theme-ink"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock
                      className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-theme-muted"
                      aria-hidden="true"
                    />
                    <input
                      id="register-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Nhập lại mật khẩu"
                      {...register('confirmPassword')}
                      aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                      className="min-h-[48px] w-full rounded-2xl border border-theme-line bg-theme-page/50 pl-11 pr-4 text-sm font-medium text-theme-ink placeholder:text-theme-muted/70 focus:border-theme-brand focus:bg-theme-surface focus:outline-none focus:ring-2 focus:ring-theme-brand/25"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-700">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{errors.confirmPassword.message}</span>
                    </p>
                  )}
                </div>
              </div>

              <p className="pt-1 text-xs leading-relaxed text-theme-muted">
                Bằng việc tạo tài khoản, mẹ xác nhận đã đọc{' '}
                <Link to="/consent" className="font-semibold text-theme-brand underline">
                  Điều khoản &amp; Quyền riêng tư
                </Link>{' '}
                của Mom Ơi! và hiểu rằng ứng dụng không thay thế thăm khám y khoa.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="flex min-h-[48px] w-full items-center justify-center rounded-full bg-theme-brand px-6 py-3 text-sm font-bold text-theme-surface transition-colors hover:bg-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-theme-line disabled:text-theme-muted"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Đang khởi tạo hồ sơ...</span>
                  </span>
                ) : (
                  'Đăng ký đồng hành'
                )}
              </button>
            </form>

            <div className="mt-6 border-t border-theme-line pt-5 text-center text-sm text-theme-muted">
              <p>
                Mẹ đã có tài khoản?{' '}
                <Link
                  to="/login"
                  className="font-bold text-theme-brand underline decoration-theme-brand/40 underline-offset-4 hover:text-theme-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-theme-brand"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
