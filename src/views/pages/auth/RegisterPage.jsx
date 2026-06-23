import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthController } from '../../../controllers/authController';
import { Heart, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

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
        toast.success('Đăng ký tài khoản thành công! Mami đăng nhập nhé 🌸');
        navigate('/login');
      } else {
        toast.error(res.message || 'Đăng ký không thành công');
      }
    } catch (err) {
      console.error(err);
      toast.error('Email này đã được sử dụng hoặc có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-pink-50 to-purple-100 p-4 font-sans">
      <div className="w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/50">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-momPink to-momPurple rounded-full flex items-center justify-center text-white mx-auto shadow-lg mb-3 animate-float">
            <Heart className="w-7 h-7 fill-white" />
          </div>
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-momPink-dark to-momPurple-dark bg-clip-text text-transparent">
            Đồng Hành Cùng Mami!
          </h2>
          <p className="text-xs text-gray-505 dark:text-gray-400 font-semibold mt-1">
            Đăng ký để trải nghiệm các tính năng chăm sóc thai kỳ hàng đầu
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Full Name Input */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Họ và tên mami
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nguyễn Thị A"
                {...register('fullName')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-100/80 focus:outline-none focus:ring-2 focus:ring-momPink/30 focus:border-momPink text-xs font-semibold bg-white/50"
              />
            </div>
            {errors.fullName && (
              <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Địa chỉ Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="mami@example.com"
                {...register('email')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-100/80 focus:outline-none focus:ring-2 focus:ring-momPink/30 focus:border-momPink text-xs font-semibold bg-white/50"
              />
            </div>
            {errors.email && (
              <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-pink-100/80 focus:outline-none focus:ring-2 focus:ring-momPink/30 focus:border-momPink text-xs font-semibold bg-white/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-650"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-1">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword')}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-100/80 focus:outline-none focus:ring-2 focus:ring-momPink/30 focus:border-momPink text-xs font-semibold bg-white/50"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] text-red-500 font-bold mt-1 pl-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-momPink/20 transform active:scale-95 transition-all duration-300 flex items-center justify-center"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Đăng Ký Đồng Hành 🌸'
            )}
          </button>
        </form>

        {/* Footer actions */}
        <div className="mt-6 text-center text-xs">
          <p className="text-gray-500 font-medium">
            Mami đã có tài khoản?{' '}
            <Link
              to="/login"
              className="text-momPink-dark hover:underline font-bold transition-all"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
