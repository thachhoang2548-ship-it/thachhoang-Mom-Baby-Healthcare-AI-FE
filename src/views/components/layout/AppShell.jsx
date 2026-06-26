import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthController } from '../../../controllers/authController';
import { useProfileController } from '../../../controllers/profileController';
import { getTierNameVi } from '../../../utils/tierHelpers';
import { Calendar, Heart, Baby, Sparkles, LogOut, RefreshCw, Activity, MessageSquare, LayoutDashboard, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AppShell() {
  const { user, tier, logout } = useAuthController();
  const { journeyStage, fetchProfile, momProfile } = useProfileController();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!momProfile) {
      fetchProfile();
    }
  }, [momProfile, fetchProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Đăng xuất thành công!');
      navigate('/login');
    } catch (e) {
      toast.error('Có lỗi xảy ra khi đăng xuất');
    }
  };

  // Build navItems based on journeyStage
  const getNavItems = () => {
    const items = [
      {
        label: 'Tổng Quan',
        path: '/dashboard',
        icon: LayoutDashboard,
        color: 'text-momPink',
      }
    ];

    if (journeyStage === 'PrePregnancy') {
      items.push({
        label: 'Rụng Trứng',
        path: '/fertility',
        icon: Calendar,
        color: 'text-momPink',
      });
    } else if (journeyStage === 'Pregnant') {
      items.push({
        label: 'Thai Kỳ',
        path: '/pregnancy',
        icon: Heart,
        color: 'text-momPurple',
      });
    } else if (journeyStage === 'Postpartum') {
      items.push({
        label: 'Hậu Sản 💙',
        path: '/postpartum',
        icon: Activity,
        color: 'text-momPink',
      });
      items.push({
        label: 'Bé Yêu 🧸',
        path: '/baby',
        icon: Baby,
        color: 'text-momGreen',
      });
    }

    // Common nav items for all stages

    items.push({
      label: 'Chẩn đoán AI',
      path: '/symptoms',
      icon: Activity,
      color: 'text-momGreen',
    });

    items.push({
      label: 'Hồ Sơ Mẹ',
      path: '/profile',
      icon: User,
      color: 'text-momPink',
    });

    items.push({
      label: 'Đổi Lộ Trình',
      path: '/onboarding',
      icon: RefreshCw,
      color: 'text-gray-500',
    });
    
    items.push({
      label: 'Nâng Cấp',
      path: '/upgrade',
      icon: Sparkles,
      color: 'text-momAmber',
    });

    return items;
  };

  const navItems = getNavItems();

  const getStageNameVi = (stage) => {
    if (stage === 'PrePregnancy') return 'Kế hoạch thụ thai';
    if (stage === 'Pregnant') return 'Theo dõi thai kỳ';
    if (stage === 'Postpartum') return 'Hồi phục hậu sản & Bé';
    return 'Chưa thiết lập';
  };

  return (
    <div className="h-screen bg-[#FCF8F8] dark:bg-[#0E0C0F] text-gray-800 dark:text-gray-100 flex flex-col font-sans relative overflow-hidden">
      {/* Decorative premium ambient glowing spots */}
      <div className="absolute top-[-10%] left-[-15%] w-[45%] aspect-square rounded-full bg-gradient-to-br from-pink-300/15 to-purple-400/15 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[45%] aspect-square rounded-full bg-gradient-to-br from-purple-300/10 to-pink-400/10 blur-[130px] pointer-events-none"></div>
      <div className="absolute top-[35%] right-[15%] w-[25%] aspect-square rounded-full bg-pink-200/10 dark:bg-pink-900/5 blur-[100px] pointer-events-none"></div>
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/60 dark:bg-gray-900/50 backdrop-blur-xl border-b border-white/50 dark:border-gray-850 py-3.5 px-4 sm:px-8 flex items-center justify-between relative">
        <div onClick={() => navigate('/onboarding')} className="cursor-pointer flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-momPink to-momPurple flex items-center justify-center text-white shadow-[0_4px_15px_rgba(236,72,153,0.3)] transition-transform duration-300 group-hover:scale-105">
            <span className="font-extrabold text-sm">MƠ</span>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-momPink-dark to-momPurple-dark dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
              Mom Ơi!
            </h1>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
              {getStageNameVi(journeyStage)}
            </p>
          </div>
        </div>

        {/* User Tier Status and Actions */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {user.fullName || user.email}
              </span>
              <span className="text-[10px] bg-momPink-light/75 dark:bg-momPink/25 text-momPink-dark dark:text-pink-455 px-2.5 py-0.5 rounded-full font-bold">
                {getTierNameVi(tier)}
              </span>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            title="Đăng xuất"
            className="p-2 text-gray-450 hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-300"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 lg:pb-0 relative z-10 overflow-hidden">
        
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-white/20 dark:border-gray-850/50 p-5 bg-white/20 dark:bg-gray-900/10 backdrop-blur-xl shrink-0 overflow-y-auto h-full">
          <div className="space-y-2 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 ${
                    isActive
                      ? 'bg-white/80 dark:bg-gray-850/70 text-momPink-dark dark:text-pink-400 border-l-4 border-momPink shadow-[0_4px_20px_-4px_rgba(236,72,153,0.12)] dark:shadow-none'
                      : 'text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-white/40 dark:hover:bg-gray-800/30 hover:translate-x-1'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${isActive ? 'scale-110' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {user && (
            <div className="p-4 bg-gradient-to-br from-white/60 to-pink-50/20 dark:from-gray-950/40 dark:to-purple-950/20 rounded-2xl border border-white/60 dark:border-gray-850 shadow-sm mt-auto">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                Tài khoản
              </p>
              <p className="text-xs font-bold text-gray-850 dark:text-gray-200 truncate">
                {user.fullName}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 truncate">
                {user.email}
              </p>
              <div className="mt-3 flex justify-between items-center bg-white/70 dark:bg-gray-900/60 p-2 rounded-xl border border-white/50 dark:border-gray-850">
                <span className="text-[9px] font-bold text-momPink-dark dark:text-pink-400 uppercase">
                  Gói dịch vụ
                </span>
                <span className="text-[10px] font-extrabold text-momPurple-dark dark:text-purple-400">
                  {tier === 'Free' ? 'Free' : tier}
                </span>
              </div>
              <div className="mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-800/60 flex justify-between items-center">
                <Link to="/profile" className="text-[10px] font-bold text-momPink hover:text-momPink-dark hover:underline transition-all">
                  Chỉnh sửa hồ sơ
                </Link>
                <Link to="/onboarding" className="text-[10px] font-bold text-gray-400 hover:text-gray-600 hover:underline transition-all">
                  Đổi lộ trình
                </Link>
              </div>
            </div>
          )}
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation for Mobile Devices */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-pink-100/60 dark:border-gray-800 flex items-center justify-around py-2 px-1 z-40 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition-all duration-300 ${
                isActive
                  ? 'text-momPink-dark dark:text-momPink scale-110'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
