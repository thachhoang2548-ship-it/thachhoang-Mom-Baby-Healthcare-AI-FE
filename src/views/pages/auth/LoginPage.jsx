import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthController } from '../../../controllers/authController';
import { useProfileController } from '../../../controllers/profileController';
import { Heart, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().min(1, 'Vui lòng nhập email').email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải dài tối thiểu 6 ký tự'),
});

export default function LoginPage() {
  const login = useAuthController((state) => state.login);
  const fetchProfile = useProfileController((state) => state.fetchProfile);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await login(data.email, data.password);
      if (res.isSuccess) {
        toast.success('Chào mừng mami đã quay trở lại! 🌸');
        
        // Check special roles first
        const userRoles = Array.isArray(res.data?.roles) ? res.data.roles : (res.data?.role ? [res.data.role] : []);
        const email = data.email.toLowerCase();
        const isAdmin = userRoles.some(r => r.includes('Admin')) || email.includes('admin');
        const isExpert = userRoles.some(r => r.includes('Expert')) || email.includes('expert');
        const isStaff = userRoles.some(r => r.includes('Staff')) || email.includes('staff');

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

        // Fetch profile for standard users (Mom)
        const profile = await fetchProfile();
        if (profile) {
          if (profile.stage === 'Pregnant') {
            navigate('/pregnancy');
          } else {
            navigate('/fertility');
          }
        } else {
          // No profile yet, go to profile setup
          navigate('/profile');
        }
      } else {
        toast.error(res.message || 'Đăng nhập không thành công');
      }
    } catch (err) {
      console.error(err);
      toast.error('Sai tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại!');
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
            Chào mừng Mami!
          </h2>
          <p className="text-xs text-gray-505 dark:text-gray-400 font-semibold mt-1">
            Đăng nhập để chăm sóc sức khỏe của mẹ và bé yêu
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-momPink to-momPurple text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-momPink/20 transform active:scale-95 transition-all duration-300 flex items-center justify-center"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Đăng Nhập 🌸'
            )}
          </button>
        </form>

        {/* Footer actions */}
        <div className="mt-6 text-center text-xs">
          <p className="text-gray-500 font-medium">
            Mami chưa có tài khoản?{' '}
            <Link
              to="/register"
              className="text-momPink-dark hover:underline font-bold transition-all"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
