import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { getTierNameVi } from '../../utils/tierHelpers';
import { Calendar, Heart, Baby, Sparkles, LogOut, RefreshCw, Activity, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AppShell() {
  const { user, tier, logout } = useAuthStore();
  const { journeyStage, fetchProfile, momProfile } = useProfileStore();
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
    const items = [];

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
      label: 'Trợ lý AI',
      path: '/chat',
      icon: MessageSquare,
      color: 'text-momPink',
    });

    items.push({
      label: 'Chẩn đoán AI',
      path: '/symptoms',
      icon: Activity,
      color: 'text-momGreen',
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
    <div className="min-h-screen bg-pink-50/20 dark:bg-background-dark text-gray-800 dark:text-gray-100 flex flex-col font-sans">
      
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-pink-100/50 dark:border-gray-800 py-3 px-4 sm:px-6 flex items-center justify-between">
        <div onClick={() => navigate('/onboarding')} className="cursor-pointer flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-momPink to-momPurple flex items-center justify-center text-white shadow-md">
            <span className="font-extrabold text-base">MƠ</span>
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight bg-gradient-to-r from-momPink-dark to-momPurple-dark bg-clip-text text-transparent">
              Mom Ơi!
            </h1>
            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
              {getStageNameVi(journeyStage)}
            </p>
          </div>
        </div>

        {/* User Tier Status and Actions */}
        <div className="flex items-center gap-2.5">
          {user && (
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {user.fullName || user.email}
              </span>
              <span className="text-[10px] bg-momPink-light/75 text-momPink-dark px-2.5 py-0.5 rounded-full font-bold">
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
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 lg:pb-0">
        
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:flex flex-col w-64 border-r border-pink-100/50 dark:border-gray-800 p-5 bg-white/50 dark:bg-gray-900/30 shrink-0">
          <div className="space-y-1.5 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-momPink/15 to-momPurple/15 text-momPink-dark border-l-4 border-momPink shadow-sm'
                      : 'text-gray-500 hover:text-gray-800 hover:bg-pink-50/40 dark:hover:bg-gray-800/40'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {user && (
            <div className="p-4 bg-gradient-to-br from-momPink-light/50 to-momPurple-light/50 rounded-2xl border border-pink-100/50 dark:border-pink-900/20">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                Tài khoản
              </p>
              <p className="text-xs font-bold text-gray-850 dark:text-gray-200 truncate">
                {user.fullName}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                {user.email}
              </p>
              <div className="mt-3 flex justify-between items-center bg-white/70 dark:bg-gray-800 p-2 rounded-xl border border-pink-100/40">
                <span className="text-[10px] font-bold text-momPink-dark uppercase">
                  Gói dịch vụ
                </span>
                <span className="text-[10px] font-extrabold text-momPurple-dark">
                  {tier === 'Free' ? 'Free' : tier}
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
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
